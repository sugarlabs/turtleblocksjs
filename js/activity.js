// Copyright (c) 2014 Walter Bender
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 3 of the License, or
// (at your option) any later version.
//
// You should have received a copy of the GNU General Public License
// along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA

// Note: This code is inspired by the Python Turtle Blocks project
// (https://github.com/walterbender/turtleart), but implemented from
// scratch. -- Walter Bender, October 2014.

define(function(require) {
    var activity = require('sugar-web/activity/activity');
    var icon = require('sugar-web/graphics/icon');
    require('easeljs');
    require('preloadjs');
    require('howler');
    require('p5.sound');
    require('p5.dom');
    require('mespeak');
    // require('activity/utils');
    require('activity/artwork');
    require('activity/munsell');
    require('activity/trash');
    require('activity/turtle');
    require('activity/palette');
    require('activity/blocks');
    require('activity/savebox');
    require('activity/clearbox');
    require('activity/samplesviewer');
    require('activity/samples');
    require('activity/basicblocks');
    require('activity/advancedblocks');

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function(doc) {

        try {
            meSpeak.loadConfig("lib/mespeak_config.json");
            meSpeak.loadVoice("lib/voices/en/en.json");
        } catch (e) {
            console.log(e);
        }

        // Initialize the activity.
        activity.setup();

        // Colorize the activity icon.
        var activityButton = docById('activity-button');
        var colors; // I should be getting the XO colors here?
        activity.getXOColor(function(error, colors) {
            icon.colorize(activityButton, colors);
        });

        //
        var canvas = docById('myCanvas');

        var queue = new createjs.LoadQueue(false);

        // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var files = true;
        } else {
            alert('The File APIs are not fully supported in this browser.');
            var files = false;
        }

        // Are we running off of a server?
        var server = true;
        var scale = 1;
        var stage;
        var turtles;
        var palettes;
        var blocks;
        var saveBox;
        var clearBox;
        var thumbnails;
        var thumbnailsVisible = false;
        var buttonsVisible = true;
        var toolbarButtonsVisible = true;
        var openContainer = null;
        var closeContainer = null;
        var menuButtonsVisible = false;
        var menuContainer = null;
        var currentKey = '';
        var currentKeyCode = 0;
        var lastKeyCode = 0;
        var pasteContainer = null;
        var sounds = [];
        try {
            var mic = new p5.AudioIn()
        } catch (e) {
            console.log('microphone not available');
            var mic = null;
        }
        var stopTurtleContainer = null;
        var stopTurtleContainerX = 0;
        var stopTurtleContainerY = 0;
        var cameraID = null;

        // initial scroll position
        var scrollX = 0;
        var scrollY = 0;

        // default values
        var CAMERAVALUE = "##__CAMERA__##";
        var VIDEOVALUE = "##__VIDEO__##";

        var DEFAULTBACKGROUNDCOLOR = [70, 80, 20];
        var DEFAULTDELAY = 500; // milleseconds

        var turtleDelay = DEFAULTDELAY;

        // Time when we hit run
        var time = 0;

        // Used by pause block
        var waitTime = {};

        // Used to track mouse state for mouse button block
        var stageMouseDown = false;

        var fastButton = docById('fast-button');
        var slowButton = docById('slow-button');
        var stopTurtleButton = docById('stop-turtle-button');
        var clearButton = docById('clear-button');
        var paletteButton = docById('palette-button');
        var blockButton = docById('hide-blocks-button');
        var pasteButton = docById('paste-button');
        var cartesianButton = docById('cartesian-button');
        var polarButton = docById('polar-button');
        var samplesButton = docById('samples-button');
        var openButton = docById('open-button');
        var saveButton = docById('save-button');
        var stopButton = docById('stop-button');

        var onAndroid = /Android/i.test(navigator.userAgent);
        console.log('on Android? ' + onAndroid);

        var onXO = (screen.width == 1200 && screen.height == 900) || (screen.width == 900 && screen.height == 1200);
        console.log('on XO? ' + onXO);

        var cellSize = 55;
        if (onXO) {
            cellSize = 75;
        };

        var onscreenButtons = [];
        var onscreenMenu = [];

        var draggingContainer = false;

        fastButton.onclick = function() {
            doFastButton();
        }

        function doFastButton() {
            turtleDelay = 0;
            runLogoCommands();
        }

        slowButton.onclick = function() {
            doSlowButton();
        }

        function doSlowButton() {
            turtleDelay = DEFAULTDELAY;
            runLogoCommands();
        }

        var stopTurtle = false;
        stopTurtleButton.onclick = function() {
            doStopTurtle();
        }

        function doStopButton() {
            doStopTurtle();
        }

        paletteButton.onclick = function() {
            changePaletteVisibility();
        }

        blockButton.onclick = function() {
            changeBlockVisibility();
        }

        clearButton.onclick = function() {
            allClear();
        }

        var cartesianVisible = false;
        cartesianButton.onclick = function() {
            doCartesian();
        }

        function doCartesian() {
            if (cartesianVisible) {
                hideCartesian();
                cartesianVisible = false;
            } else {
                showCartesian();
                cartesianVisible = true;
            }
        }

        var polarVisible = false;
        polarButton.onclick = function() {
            doPolar();
        }

        function doPolar() {
            if (polarVisible) {
                hidePolar();
                polarVisible = false;
            } else {
                showPolar();
                polarVisible = true;
            }
        }

        pasteButton.onclick = function() {
            pasteStack();
        }

        samplesButton.onclick = function() {
            doOpenSamples();
        }

        openButton.onclick = function() {
            doOpen();
        }

        saveButton.onclick = function() {
            doSaveBox();
        }

        // Make the activity stop with the stop button.
        var stopButton = docById('stop-button');
        stopButton.addEventListener('click', function(e) {
            activity.close();
        });

        // Do we need to update the stage?
        var update = true;

        // The list of [action name, block]
        var actionList = [];

        // The list of [box name, value]
        var boxList = [];

        // Set the default background color...
        setBackgroundColor(-1);

        // Coordinate grid
        var cartesianBitmap = null;

        // Polar grid
        var polarBitmap = null;

        // Msg block
        var msgText = null;

        // ErrorMsg block
        var errorMsgText = null;

        // Get things started
        init();

        function init() {
            docById('loader').className = 'loader';

            stage = new createjs.Stage(canvas);
            createjs.Touch.enable(stage);

            createjs.Ticker.addEventListener('tick', tick);

            trashcan = new Trashcan(canvas, stage, cellSize, refreshCanvas);
            turtles = new Turtles(canvas, stage, refreshCanvas);
            palettes = initPalettes(canvas, stage, cellSize, refreshCanvas);
            blocks = new Blocks(canvas, stage, refreshCanvas, trashcan);

            palettes.setBlocks(blocks);
            palettes.setDragging(setDraggingContainer);
            turtles.setBlocks(blocks);
            turtles.setDragging(setDraggingContainer);
            blocks.setTurtles(turtles);
            blocks.setLogo(runLogoCommands);
            blocks.setDragging(setDraggingContainer);
            blocks.makeCopyPasteButtons(makeButton, updatePasteButton);

            saveBox = new SaveBox(canvas, stage, refreshCanvas, doSave);
            clearBox = new ClearBox(canvas, stage, refreshCanvas, sendAllToTrash);

            thumbnails = new SamplesViewer(canvas, stage, refreshCanvas, doCloseSamples, loadProject, sendAllToTrash);

            initBasicProtoBlocks(palettes, blocks);
            initAdvancedProtoBlocks(palettes, blocks);

            // Set up a file chooser for the doOpen function.
            this.fileChooser = docById('myOpenFile');

            // FIXME: won't allow selecting same file twice in a row
            // since there is no 'change' event.
            this.fileChooser.addEventListener('change', function(event) {

                // Read file here.
                var reader = new FileReader();

                reader.onload = (function(theFile) {
                    var rawData = reader.result;
                    var cleanData = rawData.replace('\n', ' ');
                    var obj = JSON.parse(cleanData);
                    blocks.loadNewBlocks(obj);
                });

                console.log(fileChooser.files[0]);
                reader.readAsText(fileChooser.files[0]);
            }, false);

            this.svgOutput = '';

            // Workaround to chrome security issues
            // createjs.LoadQueue(true, null, true);

            // Enable touch interactions if supported on the current device.
            // FIXME: voodoo
            // createjs.Touch.enable(stage, false, true);
            // Keep tracking the mouse even when it leaves the canvas.
            stage.mouseMoveOutside = true;
            // Enabled mouse over and mouse out events.
            stage.enableMouseOver(10); // default is 20

            cartesianBitmap = createGrid('images/Cartesian.svg');

            polarBitmap = createGrid('images/polar.svg');

            createMsgContainer('#ffffff', '#7a7a7a', function(text) {
                msgText = text;
            });

            createMsgContainer('#ffcbc4', '#ff0031', function(text) {
                errorMsgText = text;
            });

            var URL = window.location.href;
            console.log(URL);
            var projectName = null;
            if (URL.substr(0, 4) == 'file' && !onAndroid) {
                console.log('running from filesystem');
                server = false;
                saveButton.style.visibility = 'hidden';
            } else {
                console.log('running from server');
                server = true;
                stopButton.style.visibility = 'hidden';
            }

            // Scale the canvas relative to the screen size.
            onResize();

            setupAndroidToolbar();
            var saveName = docById('mySaveName');
            saveName.style.visibility = 'hidden';

            thumbnails.setServer(server);

            if (URL.indexOf('?') > 0) {
                var urlParts = URL.split('?');
                if (urlParts[1].indexOf('=') > 0) {
                    var projectName = urlParts[1].split('=')[1];
                }
            }
            if (projectName != null) {
                console.log('load ' + projectName);
                loadProject(projectName);
            } else {
                loadStart();
            }

            // Set up event handler for stage mouse events
            stage.on('stagemousedown', function(event) {
                stageMouseDown = true;
                var x = event.stageX;
                var y = event.stageY;

                // Make sure scroll position is in sync with actual window scroll.
                scrollX = window.pageXOffset;
                scrollY = window.pageYOffset;

                stage.on('stagemousemove', function(event) {
                    if (x < 55 || y < 55 || x > 1145 || y > 845) {
                        // console.log('no dragging from the edges');
                    } else if (stageMouseDown && !draggingContainer) {
                        var dx = 0; // event.stageX - x;
                        var dy = event.stageY - y;
                        x = event.stageX;
                        y = event.stageY;
                        if (dx > 10) {
                            dx = 10;
                        } else if (dx < -10) {
                            dx = -10;
                        }
                        if (dy > 10) {
                            dy = 10;
                        } else if (dy < -10) {
                            dy = -10;
                        }
                        if (scrollX + dx < 0) {
                            dx = 0;
                        } else if (scrollX + dx > 1200) {
                            dx = 0;
                        }
                        if (scrollY + dy < 0) {
                            dy = 0;
                        } else if (scrollY + dy > 900) {
                            dy = 0;
                        }
                        // Let browser handle scrolling???
                        // window.scrollBy(dx, dy);
                        update = true;
                    }
                });
            });

            stage.on('stagemouseup', function(event) {
                stageMouseDown = false;
                // console.log('mouseUp (' + event.stageX + ', ' + event.stageY + ')');
            });

            this.document.onkeydown = keyPressed;
        }

        function setCameraID(id) {
            cameraID = id;
        }

        function setDraggingContainer(flag) {
            draggingContainer = flag;
        }

        function createGrid(imagePath) {
            var img = new Image();
            img.src = imagePath;
            var container = new createjs.Container();
            stage.addChild(container);

            bitmap = new createjs.Bitmap(img);
            container.addChild(bitmap);
            bitmap.cache(0, 0, 1200, 900);

            bitmap.x = (canvas.width - 1200) / 2;
            bitmap.y = (canvas.height - 900) / 2;
            bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;
            bitmap.visible = false;
            bitmap.updateCache();
            return bitmap;
        };

        function createMsgContainer(fillColor, strokeColor, callback) {
            var container = new createjs.Container();
            stage.addChild(container);
            container.x = (canvas.width - 1000) / 2;
            container.y = 110;
            container.visible = false;
            var img = new Image();
            var svgData = MSGBLOCK.replace('fill_color', fillColor).replace(
                'stroke_color', strokeColor);
            img.onload = function() {
                var msgBlock = new createjs.Bitmap(img);
                container.addChild(msgBlock);
                text = new createjs.Text('your message here',
                    '20px Arial', '#000000');
                container.addChild(text);
                text.textAlign = 'center';
                text.textBaseline = 'alphabetic';
                text.x = 500;
                text.y = 30;
                var bounds = container.getBounds();
                container.cache(bounds.x, bounds.y, bounds.width, bounds.height);
                var hitArea = new createjs.Shape();
                hitArea.graphics.beginFill('#FFF').drawRect(0, 0, 1000, 42);
                hitArea.x = 0;
                hitArea.y = 0;
                container.hitArea = hitArea;

                container.on('click', function(event) {
                    container.visible = false;
                    update = true;
                });
                callback(text);
                blocks.setMsgText(text);
            }
            img.src = 'data:image/svg+xml;base64,' + window.btoa(
                unescape(encodeURIComponent(svgData)));
        };

        function keyPressed(event) {
            var ESC = 27;
            var ALT = 18;
            var CTRL = 17;
            var SHIFT = 16;
            var RETURN = 13;
            var SPACE = 32;

            // Captured by browser
            var PAGE_UP = 33;
            var PAGE_DOWN = 34;
            var KEYCODE_LEFT = 37;
            var KEYCODE_RIGHT = 39;
            var KEYCODE_UP = 38;
            var KEYCODE_DOWN = 40;

            if (event.altKey) {
                switch (event.keyCode) {
                    case 69: // 'E'
                        allClear();
                        break;
                    case 82: // 'R'
                        doFastButton();
                        break;
                    case 83: // 'S'
                        doStopTurtle();
                        break;
                }
            } else if (event.ctrlKey) {} else {
                switch (event.keyCode) {
                    case ESC:
                        // toggle full screen
                        toggleToolbar();
                        break
                    case RETURN:
                        // toggle run
                        runLogoCommands();
                        break
                    default:
                        currentKey = String.fromCharCode(event.keyCode);
                        currentKeyCode = event.keyCode;
                        break;
                }
            }
        }

        function onResize() {
            var w = window.innerWidth;
            var h = window.innerHeight;
            if (w > h) {
                scale = w / 1200;
                stage.canvas.width = 1200 * scale;
                stage.canvas.height = 900 * scale
            } else {
                scale = w / 900;
                stage.canvas.width = 900 * scale;
                stage.canvas.height = 1200 * scale
            }
            stage.scaleX = scale;
            stage.scaleY = scale;

            console.log('Resize: scale ' + scale +
                ', windowW ' + w + ', windowH ' + h +
                ', canvasW ' + canvas.width + ', canvasH ' + canvas.height +
                ', screenW ' + screen.width + ', screenH ' + screen.height);

            turtles.setScale(scale);
            blocks.setScale(scale);
            palettes.setScale(scale);
            update = true;
        }

        window.onresize = function() {
            onResize();
        }

        function restoreTrash() {
            var dx = 0;
            var dy = -cellSize * 3; // Reposition blocks about trash area.
            for (var blk in blocks.blockList) {
                if (blocks.blockList[blk].trash) {
                    blocks.blockList[blk].trash = false;
                    blocks.moveBlockRelative(blk, dx, dy);
                    blocks.blockList[blk].show();
                    if (blocks.blockList[blk].name == 'start') {
                        turtle = blocks.blockList[blk].value;
                        turtles.turtleList[turtle].trash = false;
                        turtles.turtleList[turtle].container.visible = true;
                    }
                }
            }
            update = true;
        }

        function deleteBlocksBox() {
            clearBox.show(scale);
        }

        // FIXME: confirm???
        function sendAllToTrash(addStartBlock) {
            var dx = 2000;
            var dy = cellSize;
            for (var blk in blocks.blockList) {
                blocks.blockList[blk].trash = true;
                blocks.moveBlockRelative(blk, dx, dy);
                blocks.blockList[blk].hide();
                if (blocks.blockList[blk].name == 'start') {
                    console.log('start blk ' + blk + ' value is ' + blocks.blockList[blk].value)
                    turtle = blocks.blockList[blk].value;
                    if (turtle != null) {
                        console.log('sending turtle ' + turtle + ' to trash');
                        turtles.turtleList[turtle].trash = true;
                        turtles.turtleList[turtle].container.visible = false;
                    }
                }
            }
            if (addStartBlock) {
                blocks.makeNewBlock('start');
                last(blocks.blockList).x = 250;
                last(blocks.blockList).y = 250;
                last(blocks.blockList).connections = [null, null, null];
                turtles.add(last(blocks.blockList));
                last(blocks.blockList).value = turtles.turtleList.length - 1;
                blocks.updateBlockPositions();
            }
            // Overwrite session data too.
            console.log('overwriting session data');
            if (typeof(Storage) !== 'undefined') {
                localStorage.setItem('sessiondata', prepareExport());
                // console.log(localStorage.getItem('sessiondata'));
            } else {
                // Sorry! No Web Storage support..
            }

            update = true;
        }

        function changePaletteVisibility() {
            if (palettes.visible) {
                palettes.hide();
            } else {
                palettes.show();
                palettes.bringToTop();
            }
        }

        function changeBlockVisibility() {
            if (blocks.visible) {
                hideBlocks();
            } else {
                showBlocks();
            }
        }

        function stop() {
            //
            createjs.Ticker.removeEventListener('tick', tick);
        }

        function doStopTurtle() {
            // The stop button was pressed. Stop the turtle and clean
            // up a few odds and ends.
            stopTurtle = true;

            for (sound in sounds) {
                sounds[sound].stop();
            }
            sounds = [];

            if (cameraID != null) {
                doStopVideoCam(cameraID, setCameraID);
            }

            if (buttonsVisible && !toolbarButtonsVisible) {
                hideStopButton();
            }
            blocks.bringToTop();
        }

        function refreshCanvas() {
            update = true;
        }

        function tick(event) {
            // This set makes it so the stage only re-renders when an
            // event handler indicates a change has happened.
            if (update) {
                update = false; // Only update once
                stage.update(event);
            }
        }

        function doCloseSamples() {
            console.log('hiding thumbnails');
            thumbnails.hide();
            thumbnailsVisible = false;
            showBlocks();
        }

        function doOpenSamples() {
            if (thumbnailsVisible) {
                doCloseSamples();
            } else {
                console.log('showing thumbnails');
                if (!thumbnails.show(scale)) {
                    console.log('thumbnails not available');
                } else if (!thumbnails.locked) {
                    stage.swapChildren(thumbnails.container, last(stage.children));
                    thumbnailsVisible = true;
                    hideBlocks();
                } else {
                    console.log('thumbnails locked');
                }
            }
        }

        function loadProject(projectName) {
            palettes.updatePalettes();
            if (fileExt(projectName) != 'tb') {
                projectName += '.tb';
            }
            try {
                if (server) {
                    var rawData = httpGet(projectName);
                    console.log('receiving ' + rawData);
                    var cleanData = rawData.replace('\n', ' ');
                } else {
                    // FIXME: Workaround until we have a local server
                    if (projectName in SAMPLESTB) {
                        var cleanData = SAMPLESTB[projectName];
                    } else {
                        var cleanData = SAMPLESTB['card-01.tb'];
                    }
                    console.log(cleanData);
                }
                var obj = JSON.parse(cleanData);
                blocks.loadNewBlocks(obj);
            } catch (e) {
                loadStart();
            }
            update = true;
        }

        function saveProject(projectName) {
            palettes.updatePalettes();
            var punctuationless = projectName.replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^`{|}~']/g, '');
            projectName = punctuationless.replace(/ /g,'_');
            if (fileExt(projectName) != 'tb') {
                projectName += '.tb';
            }
            try {
                // Post the project
                var returnValue = httpPost(projectName, prepareExport());
                errorMsg('Saved ' + projectName + ' to turtle.sugarlabs.org');

                var img = new Image();
                var svgData = doSVG(canvas, turtles, 320, 240, 320 / canvas.width);
                img.onload = function() {
                    var bitmap = new createjs.Bitmap(img);
                    var bounds = bitmap.getBounds();
                    bitmap.cache(bounds.x, bounds.y, bounds.width, bounds.height);
                    // and base64-encoded png
                    httpPost(projectName.replace('.tb', '.b64'), bitmap.getCacheDataURL());
                }
                img.src = 'data:image/svg+xml;base64,' + window.btoa(
                    unescape(encodeURIComponent(svgData)));

                return returnValue;
            } catch (e) {
                console.log(e);
                return;
            }
        }

        function loadStart() {
            // where to put this?
            palettes.updatePalettes();

            sessionData = null;
            // Try restarting where we were when we hit save.
            if (typeof(Storage) !== 'undefined') {
                // localStorage is how we'll save the session (and metadata)
                sessionData = localStorage.getItem('sessiondata');
            }
            if (sessionData != null) {
                try {
                    console.log('restoring session');
                    var obj = JSON.parse(sessionData);
                    blocks.loadNewBlocks(obj);
                } catch (e) {}
            } else {
                console.log('loading start');
                postProcess = function(thisBlock) {
                    blocks.blockList[0].x = 250;
                    blocks.blockList[0].y = 250;
                    blocks.blockList[0].connections = [null, null, null];
                    blocks.blockList[0].value = turtles.turtleList.length;
                    turtles.add(blocks.blockList[0]);
                    blocks.updateBlockPositions();
                }
                blocks.makeNewBlock('start', postProcess, null);
            }
            update = true;
        }

        // function addTurtle(myBlock) {
        //    turtles.add(myBlock);
        // }

        function errorMsg(msg) {
            var errorMsgContainer = errorMsgText.parent;
            errorMsgContainer.visible = true;
            errorMsgText.text = msg;
            errorMsgContainer.updateCache();
            stage.swapChildren(errorMsgContainer, last(stage.children));
        }

        function clearParameterBlocks() {
            for (blk in blocks.blockList) {
                if (blocks.blockList[blk].parameter) {
                    blocks.blockList[blk].text.text = '';
                    blocks.blockList[blk].container.updateCache();
                }
            }
            update = true;
        }

        function updateParameterBlock(activity, turtle, blk) {
            // FIXME: how to autogenerate this list?
            if (blocks.blockList[blk].protoblock.parameter) {
                var value = 0;
                switch (blocks.blockList[blk].name) {
                    case 'box':
                        var cblk = blocks.blockList[blk].connections[1];
                        var name = parseArg(activity, turtle, cblk);
                        var i = findBox(name);
                        if (i == null) {
                            errorMsg('Cannot find box ' + name + '.');
                        } else {
                            value = boxList[i][1];
                        }
                        break;
                    case 'x':
                        value = turtles.turtleList[turtle].x;
                        break;
                    case 'y':
                        value = turtles.turtleList[turtle].y;
                        break;
                    case 'heading':
                        value = turtles.turtleList[turtle].orientation;
                        break;
                    case 'color':
                        value = turtles.turtleList[turtle].color;
                        break;
                    case 'shade':
                        value = turtles.turtleList[turtle].value;
                        break;
                    case 'grey':
                        value = turtles.turtleList[turtle].chroma;
                        break;
                    case 'pensize':
                        value = turtles.turtleList[turtle].stroke;
                        break;
                    case 'time':
                        var d = new Date();
                        value = (d.getTime() - time) / 1000;
                        break;
                    case 'mousex':
                        value = stageX;
                        break;
                    case 'mousey':
                        value = stageY;
                        break;
                    case 'keyboard':
                        value = lastKeyCode;
                        break;
                    case 'loudness':
                        if (mic == null) {
                            errorMsg('The microphone is not available.');
                            value = 0;
                        } else {
                            value = Math.round(mic.getLevel() * 1000);
                        }
                        break;
                    default:
                        console.log('??? ' + blocks.blockList[blk].name);
                        break;
                }
                if (typeof(value) == 'string') {
                    blocks.blockList[blk].text.text = value;
                } else {
                    blocks.blockList[blk].text.text = Math.round(value).toString();                }
                blocks.blockList[blk].container.updateCache();
                update = true;
            }
        }

        function runLogoCommands(startHere) {
            // Save the state before running
            if (typeof(Storage) !== 'undefined') {
                localStorage.setItem('sessiondata', prepareExport());
                // console.log(localStorage.getItem('sessiondata'));
            } else {
                // Sorry! No Web Storage support..
            }

            stopTurtle = false;
            blocks.unhighlightAll();
            blocks.bringToTop(); // Draw under blocks.
            errorMsgText.parent.visible = false; // hide the error message window
            msgText.parent.visible = false; // hide the message window

            // We run the logo commands here.
            var d = new Date();
            time = d.getTime();

            // Each turtle needs to keep its own wait time.
            for (var turtle = 0; turtle < turtles.turtleList.length; turtle++) {
                waitTime[turtle] = 0;
            }
            // console.log(blocks.blockList);

            // First we need to reconcile the values in all the value blocks
            // with their associated textareas.
            for (var blk = 0; blk < blocks.blockList.length; blk++) {
                if (blocks.blockList[blk].label != null) {
                    blocks.blockList[blk].value = blocks.blockList[blk].label.value;
                }
            }

            // Init the graphic state.
            for (var turtle = 0; turtle < turtles.turtleList.length; turtle++) {
                turtles.turtleList[turtle].container.x = turtles.turtleX2screenX(turtles.turtleList[turtle].x);
                turtles.turtleList[turtle].container.y = turtles.turtleY2screenY(turtles.turtleList[turtle].y);
            }

            // Execute turtle code here...  Find the start block
            // (or the top of each stack) and build a list of all of
            // the named action stacks.
            var startBlocks = [];
            blocks.findStacks();
            actionList = [];
            for (var blk = 0; blk < blocks.stackList.length; blk++) {
                if (blocks.blockList[blocks.stackList[blk]].name == 'start') {
                    // Don't start on a start block in the trash.
                    if (!blocks.blockList[blocks.stackList[blk]].trash) {
                        // Don't start on a start block with no connections.
                        if (blocks.blockList[blocks.stackList[blk]].connections[1] != null) {
                            startBlocks.push(blocks.stackList[blk]);
                        }
                    }
                } else if (blocks.blockList[blocks.stackList[blk]].name == 'action') {
                    // Does the action stack have a name?
                    c = blocks.blockList[blocks.stackList[blk]].connections[1];
                    b = blocks.blockList[blocks.stackList[blk]].connections[2];
                    if (c != null && b != null) {
                        // Don't use an action block in the trash.
                        if (!blocks.blockList[blocks.stackList[blk]].trash) {
                            actionList.push([blocks.blockList[c].value, b]);
                        }
                    }
                }
            }

            this.svgOutput = '<rect x="0" y="0" height="' + canvas.height + '" width="' + canvas.width + '" fill="' + body.style.background + '"/>\n';

            this.parentFlowQueue = {};
            this.unhightlightQueue = {};
            this.parameterQueue = {};

            if (turtleDelay == 0) {
                // Don't update parameters when running full speed.
                clearParameterBlocks();
            }

            // If the stop button is hidden, show it.
            if (buttonsVisible && !toolbarButtonsVisible) {
                showStopButton();
            }

            // And mark all turtles as not running.
            for (var turtle = 0; turtle < turtles.turtleList.length; turtle++) {
                turtles.turtleList[turtle].running = false;
            }

            // (2) Execute the stack.
            // A bit complicated because we have lots of corner cases:
            if (startHere != null) {
                console.log('startHere is ' + blocks.blockList[startHere].name);
                // If a block to start from was passed, find its
                // associated turtle, i.e., which turtle should we use?
                var turtle = 0;
                if (blocks.blockList[startHere].name == 'start') {
                    var turtle = blocks.blockList[startHere].value;
                    console.log('starting on start with turtle ' + turtle);
                } else {
                    console.log('starting on ' + blocks.blockList[startHere].name + ' with turtle ' + turtle);
                }

                turtles.turtleList[turtle].queue = [];
                this.parentFlowQueue[turtle] = [];
                this.unhightlightQueue[turtle] = [];
                this.parameterQueue[turtle] = [];
                turtles.turtleList[turtle].running = true;
                runFromBlock(this, turtle, startHere);
            } else if (startBlocks.length > 0) {
                // If there are start blocks, run them all.
                for (var b = 0; b < startBlocks.length; b++) {
                    turtle = blocks.blockList[startBlocks[b]].value;
                    turtles.turtleList[turtle].queue = [];
                    this.parentFlowQueue[turtle] = [];
                    this.unhightlightQueue[turtle] = [];
                    this.parameterQueue[turtle] = [];
                    if (!turtles.turtleList[turtle].trash) {
                        console.log('running from turtle ' + turtle);
                        turtles.turtleList[turtle].running = true;
                        runFromBlock(this, turtle, startBlocks[b]);
                    }
                }
            } else {
                // Or run from the top of each stack.
                // Find a turtle
                turtle = null;
                for (var turtle = 0; turtle < turtles.turtleList.length; turtle++) {
                    if (!turtles.turtleList[turtle].trash) {
                        console.log('found turtle ' + turtle);
                        break;
                    }
                }

                if (turtle == null) {
                    console.log('could not find a turtle');
                    turtle = turtles.turtleList.length;
                    turtles.add(null);
                }

                console.log('running with turtle ' + turtle);
                turtles.turtleList[turtle].queue = [];
                this.parentFlowQueue[turtle] = [];
                this.unhightlightQueue[turtle] = [];
                this.parameterQueue[turtle] = [];

                for (var blk = 0; blk < blocks.stackList.length; blk++) {
                    if (blocks.blockList[blk].isNoRunBlock()) {
                        continue;
                    } else {
                        if (!blocks.blockList[blocks.stackList[blk]].trash) {
                            if (blocks.blockList[blocks.stackList[blk]].name == 'start' && blocks.blockList[blocks.stackList[blk]].connections[1] == null) {
                                continue;
                            }
                            // This is a degenerative case.
                            turtles.turtleList[0].running = true;
                            runFromBlock(this, 0, blocks.stackList[blk]);
                        }
                    }
                }
            }
            update = true;
        }

        function runFromBlock(activity, turtle, blk) {
            if (blk == null) {
                return;
            }

            var delay = turtleDelay + waitTime[turtle];
            waitTime[turtle] = 0;
            if (!stopTurtle) {
                setTimeout(function() {
                    runFromBlockNow(activity, turtle, blk);
                }, delay);
            }
        }

        function runFromBlockNow(activity, turtle, blk) {
            // Run a stack of blocks, beginning with blk.
            // (1) Evaluate any arguments (beginning with connection[1]);
            var args = [];
            if (blocks.blockList[blk].protoblock.args > 0) {
                for (var i = 1; i < blocks.blockList[blk].protoblock.args + 1; i++) {
                    args.push(parseArg(activity, turtle, blocks.blockList[blk].connections[i]));
                }
            }

            // (2) Run function associated with the block;
            if (blocks.blockList[blk].isValueBlock()) {
                var nextFlow = null;
            } else {
                // All flow blocks have a nextFlow, but it can be null
                // (end of flow)
                var nextFlow = last(blocks.blockList[blk].connections);
            }

            if (nextFlow != null) {
                var queueBlock = new Queue(nextFlow, 1, blk);
                turtles.turtleList[turtle].queue.push(queueBlock);
            }

            // Some flow blocks have childflows, e.g., repeat
            var childFlow = null;
            var childFlowCount = 0;

            if (turtleDelay > 0) {
                blocks.highlight(blk, false);
            }

            switch (blocks.blockList[blk].name) {
                case 'start':
                    if (args.length == 1) {
                        childFlow = args[0];
                        childFlowCount = 1;
                    }
                    break;
                case 'do':
                    if (args.length == 1) {
                        var foundAction = false;
                        for (i = 0; i < actionList.length; i++) {
                            if (actionList[i][0] == args[0]) {
                                childFlow = actionList[i][1];
                                childFlowCount = 1;
                                foundAction = true;
                                break;
                            }
                        }
                        if (!foundAction) {
                            errorMsg('Cannot find action ' + args[0] + '.');
                            stopTurtle = true;
                        }
                    }
                    break;
                case 'forever':
                    if (args.length == 1) {
                        childFlow = args[0];
                        childFlowCount = -1;
                    }
                    break;
                case 'break':
                    doBreak(turtle);
                    break;
                case 'wait':
                    if (args.length == 1) {
                        doWait(turtle, args[0]);
                    }
                case 'repeat':
                    if (args.length == 2) {
                        if (typeof(args[0]) == 'string') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            childFlow = args[1];
                            childFlowCount = Math.floor(args[0]);
                        }
                    }
                    break;
                case 'until':
                    // Similar to 'while'
                    if (args.length == 2) {
                        //que child Flow
                        childFlow = args[1];
                        childFlowCount = 1;
                        if (!args[0]) {
                            // Requeue
                            var parentBlk = blocks.blockList[blk].connections[0];
                            var queueBlock = new Queue(blk, 1, parentBlk);
                            activity.parentFlowQueue[turtle].push(parentBlk);
                            turtles.turtleList[turtle].queue.push(queueBlock);
                        }
                    }
                    break;
                case 'if':
                    if (args.length == 2) {
                        if (args[0]) {
                            childFlow = args[1];
                            childFlowCount = 1;
                        }
                    }
                    break;
                case 'ifthenelse':
                    if (args.length == 3) {
                        if (args[0]) {
                            childFlow = args[1];
                            childFlowCount = 1;
                        } else {
                            childFlow = args[2];
                            childFlowCount = 1;
                        }
                    }
                    break;
                case 'while':
                    // While is tricky because we need to recalculate
                    // args[0] each time, so we requeue the While block itself.
                    if (args.length == 2) {
                        if (args[0]) {
                            // Requeue the while block
                            var parentBlk = blocks.blockList[blk].connections[0];
                            var queueBlock = new Queue(blk, 1, parentBlk);
                            activity.parentFlowQueue[turtle].push(parentBlk);
                            turtles.turtleList[turtle].queue.push(queueBlock);
                            // and queue the childFlow
                            childFlow = args[1];
                            childFlowCount = 1;
                        }
                    }
                    break;
                case 'storein':
                    if (args.length == 2) {
                        doStorein(args[0], args[1]);
                    }
                    break;
                case 'clear':
                    turtles.turtleList[turtle].doClear();
                    break;
                case 'setxy':
                    if (args.length == 2) {
                        if (typeof(args[0]) == 'string' || typeof(args[1]) == 'sting') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            turtles.turtleList[turtle].doSetXY(args[0], args[1]);
                        }
                    }
                    break;
                case 'arc':
                    if (args.length == 2) {
                        if (typeof(args[0]) == 'string' || typeof(args[1]) == 'sting') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            turtles.turtleList[turtle].doArc(args[0], args[1]);
                        }
                    }
                    break;
                case 'forward':
                    if (args.length == 1) {
                        if (typeof(args[0]) == 'string') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            turtles.turtleList[turtle].doForward(args[0]);
                        }
                    }
                    break;
                case 'back':
                    if (args.length == 1) {
                        if (typeof(args[0]) == 'string') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            turtles.turtleList[turtle].doForward(-args[0]);
                        }
                    }
                    break;
                case 'right':
                    if (args.length == 1) {
                        if (typeof(args[0]) == 'string') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            turtles.turtleList[turtle].doRight(args[0]);
                        }
                    }
                    break;
                case 'left':
                    if (args.length == 1) {
                        if (typeof(args[0]) == 'string') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            turtles.turtleList[turtle].doRight(-args[0]);
                        }
                    }
                    break;
                case 'setheading':
                    if (args.length == 1) {
                        if (typeof(args[0]) == 'string') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            turtles.turtleList[turtle].doSetHeading(args[0]);
                        }
                    }
                    break;
                case 'show':
                    if (args.length == 2) {
                        if (typeof(args[1]) == 'string') {
                            var len = args[1].length;
                            if (len == 14 && args[1].substr(0, 14) == CAMERAVALUE) {
                                doUseCamera(args, turtles, turtle, false, SetCameraID);
                            } else if (len == 13 && args[1].substr(0, 13) == VIDEOVALUE) {
                                doUseCamera(args, turtles, turtle, true, setCameraID);
                            } else if (len > 10 && args[1].substr(0, 10) == 'data:image') {
                                turtles.turtleList[turtle].doShowImage(args[0], args[1]);
                            } else if (len > 8 && args[1].substr(0, 8) == 'https://') {
                                turtles.turtleList[turtle].doShowURL(args[0], args[1]);
                            } else if (len > 7 && args[1].substr(0, 7) == 'http://') {
                                turtles.turtleList[turtle].doShowURL(args[0], args[1]);
                            } else if (len > 7 && args[1].substr(0, 7) == 'file://') {
                                turtles.turtleList[turtle].doShowURL(args[0], args[1]);
                            } else {
                                turtles.turtleList[turtle].doShowText(args[0], args[1]);
                            }
                        } else {
                            turtles.turtleList[turtle].doShowText(args[0], args[1]);
                        }
                    }
                    break;
                case 'turtleshell':
                    if (args.length == 2) {
                        if (typeof(args[0]) == 'string') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            turtles.turtleList[turtle].doTurtleShell(args[0], args[1]);
                        }
                    }
                    break;
                case 'setcolor':
                    if (args.length == 1) {
                        if (typeof(args[0]) == 'string') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            turtles.turtleList[turtle].doSetColor(args[0]);
                        }
                    }
                    break;
                case 'setshade':
                    if (args.length == 1) {
                        if (typeof(args[0]) == 'string') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            turtles.turtleList[turtle].doSetValue(args[0]);
                        }
                    }
                    break;
                case 'setgrey':
                    if (args.length == 1) {
                        if (typeof(args[0]) == 'string') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            turtles.turtleList[turtle].doSetChroma(args[0]);
                        }
                    }
                    break;
                case 'setpensize':
                    if (args.length == 1) {
                        if (typeof(args[0]) == 'string') {
                            errorMsg('Not a number.');
                            stopTurtle = true;
                        } else {
                            turtles.turtleList[turtle].doSetPensize(args[0]);
                        }
                    }
                    break;
                case 'beginfill':
                    turtles.turtleList[turtle].doStartFill();
                    break;
                case 'endfill':
                    turtles.turtleList[turtle].doEndFill();
                    break;
                case 'fillscreen':
                    setBackgroundColor(turtle);
                    break;
                case 'penup':
                    turtles.turtleList[turtle].doPenUp();
                    break;
                case 'pendown':
                    turtles.turtleList[turtle].doPenDown();
                    break;
                case 'vspace':
                    break;
                case 'playback':
                    sound = new Howl({
                        urls: [args[0]]
                    });
                    sounds.push(sound);
                    sound.play();
                    break;
                case 'stopplayback':
                    for (sound in sounds) {
                        sounds[sound].stop();
                    }
                    sounds = [];
                    break;
                case 'stopvideocam':
                    if (cameraID != null) {
                        doStopVideoCam(cameraID, setCameraID);
                    }
                    break;
                case 'startTurtle':
                    var startHere = getTargetTurtle(args);

                    if (!startHere) {
                        errorMsg('Cannot find turtle: ' + args[0])
                    } else {
                        var targetTurtle = blocks.blockList[startHere].value;
                        if (turtles.turtleList[targetTurtle].running) {
                            errorMsg('Turtle is already running.');
                            break;
                        }
                        turtles.turtleList[targetTurtle].queue = [];
                        turtles.turtleList[targetTurtle].running = true;
                        activity.parentFlowQueue[targetTurtle] = [];
                        activity.unhightlightQueue[targetTurtle] = [];
                        activity.parameterQueue[targetTurtle] = [];
                        runFromBlock(activity, targetTurtle, startHere);
                    }
                    break;
                case 'stopTurtle':
                    var startHere = getTargetTurtle(args);
                    var targetTurtle = blocks.blockList[startHere].value;
                    turtles.turtleList[targetTurtle].queue = [];
                    activity.parentFlowQueue[targetTurtle] = [];
                    activity.unhightlightQueue[targetTurtle] = [];
                    activity.parameterQueue[targetTurtle] = [];
                    doBreak(targetTurtle);
                    break;
                default:
                    if (blocks.blockList[blk].name in evalFlowDict) {
                        eval(evalFlowDict[blocks.blockList[blk].name]);
                    } else {
                        // Could be an arg block, so we need to print its value
                        console.log('running an arg block?');
                        if (blocks.blockList[blk].isArgBlock()) {
                            args.push(parseArg(activity, turtle, blk));
                            console.log('block: ' + blk + ' turtle: ' + turtle);
                            console.log('block name: ' + blocks.blockList[blk].name);
                            console.log('block value: ' + blocks.blockList[blk].value);
                            var msgContainer = msgText.parent;
                            msgContainer.visible = true;
                            if (blocks.blockList[blk].value == null) {
                                msgText.text = 'null block value';
                            } else {
                                msgText.text = blocks.blockList[blk].value.toString();
                            }
                            msgContainer.updateCache();
                            stage.swapChildren(msgContainer, last(stage.children));
                            stopTurtle = true;
                        } else {
                            errorMsg('I do not know how to ' + blocks.blockList[blk].name + '.');
                            stopTurtle = true;
                        }
                    }
                    break;
            }

            // (3) Queue block below this block.

            // If there is a child flow, queue it.
            if (childFlow != null) {
                var queueBlock = new Queue(childFlow, childFlowCount, blk);
                // We need to keep track of the parent block to the
                // child flow so we can unlightlight the parent block
                // after the child flow completes.
                activity.parentFlowQueue[turtle].push(blk);
                turtles.turtleList[turtle].queue.push(queueBlock);
            }

            var nextBlock = null;
            // Run the last flow in the queue.
            if (turtles.turtleList[turtle].queue.length > 0) {
                nextBlock = last(turtles.turtleList[turtle].queue).blk;
                // Since the forever block starts at -1, it will never == 1.
                if (last(turtles.turtleList[turtle].queue).count == 1) {
                    // Finished child so pop it off the queue.
                    turtles.turtleList[turtle].queue.pop();
                } else {
                    // Decrement the counter for repeating this flow.
                    last(turtles.turtleList[turtle].queue).count -= 1;
                }
            }

            if (nextBlock != null) {
                parentBlk = null;
                if (turtles.turtleList[turtle].queue.length > 0) {
                    parentBlk = last(turtles.turtleList[turtle].queue).parentBlk;
                }

                if (parentBlk != blk) {
                    // The wait block waits waitTime longer than other
                    // blocks before it is unhighlighted.
                    setTimeout(function() {
                        blocks.unhighlight(blk);
                    }, turtleDelay + waitTime[turtle]);
                }

                if (last(blocks.blockList[blk].connections) == null) {
                    // If we are at the end of the child flow, queue
                    // the unhighlighting of the parent block to the
                    // flow.
                    if (activity.parentFlowQueue[turtle].length > 0 && turtles.turtleList[turtle].queue.length > 0 && last(turtles.turtleList[turtle].queue).parentBlk != last(activity.parentFlowQueue[turtle])) {
                        activity.unhightlightQueue[turtle].push(activity.parentFlowQueue[turtle].pop());
                    } else if (activity.unhightlightQueue[turtle].length > 0) {
                        // The child flow is finally complete, so unhighlight.
                        setTimeout(function() {
                            blocks.unhighlight(activity.unhightlightQueue[turtle].pop());
                        }, turtleDelay);
                    }
                }
                if (turtleDelay > 0) {
                    for (pblk in activity.parameterQueue[turtle]) {
                        updateParameterBlock(activity, turtle, activity.parameterQueue[turtle][pblk]);
                    }
                }
                runFromBlock(activity, turtle, nextBlock);
            } else {
                // Make sure SVG path is closed.
                turtles.turtleList[turtle].closeSVG();
                // Mark the turtle as not running.
                turtles.turtleList[turtle].running = false;
                if (!turtles.running()) {
                    if (buttonsVisible && !toolbarButtonsVisible) {
                        hideStopButton();
                    }
                }

                // Nothing else to do... so cleaning up.
                if (turtles.turtleList[turtle].queue.length == 0 || blk != last(turtles.turtleList[turtle].queue).parentBlk) {
                    setTimeout(function() {
                        blocks.unhighlight(blk);
                    }, turtleDelay);
                }

                // Unhighlight any parent blocks still highlighted.
                for (var b in activity.parentFlowQueue[turtle]) {
                    blocks.unhighlight(activity.parentFlowQueue[turtle][b]);
                }

                // Make sure the turtles are on top.
                var lastChild = last(stage.children);
                // for (var turtle = 0; turtle < turtles.turtleList.length; turtle++) {
                stage.swapChildren(turtles.turtleList[turtle].Container, lastChild);
                // }
                update = true;
            }
        }

        function getTargetTurtle(args) {
            // The target turtle name can be a string or an int.
            if (typeof(args[0]) == 'string') {
                var targetTurtleName = parseInt(args[0])
            } else {
                var targetTurtleName = args[0];
            }

            var startHere = null;

            for (blk in blocks.blockList) {
                var name = blocks.blockList[blk].name;
                var targetTurtle = blocks.blockList[blk].value;
                if (name == 'start' && targetTurtle == targetTurtleName) {
                    startHere = blk;
                    break;
                }
            }

            return startHere;
        }

        function doBreak(turtle) {
            for (i = 0; i < turtles.turtleList[turtle].queue.length; i++) {
                var j = turtles.turtleList[turtle].queue.length - i - 1;
                // FIXME: have a method for identifying these parents
                if (['forever', 'repeat', 'while', 'until'].indexOf(blocks.blockList[turtles.turtleList[turtle].queue[j].parentBlk].name) != -1) {
                    turtles.turtleList[turtle].queue[j].count = 1;
                    break;
                }
            }
        }

        function parseArg(activity, turtle, blk) {
            // Retrieve the value of a block.
            if (blk == null) {
                errorMsg('Missing argument');
                stopTurtle = true;
                return null
            }

            if (blocks.blockList[blk].protoblock.parameter) {
                if (activity.parameterQueue[turtle].indexOf(blk) == -1) {
                    activity.parameterQueue[turtle].push(blk);
                }
            }

            if (blocks.blockList[blk].isValueBlock()) {
                return blocks.blockList[blk].value;
            } else if (blocks.blockList[blk].isArgBlock()) {
                switch (blocks.blockList[blk].name) {
                    case 'eval':
                        var cblk1 = blocks.blockList[blk].connections[1];
                        var cblk2 = blocks.blockList[blk].connections[2];
                        var a = parseArg(activity, turtle, cblk1);
                        var b = parseArg(activity, turtle, cblk2);
                        blocks.blockList[blk].value = Number(eval(a.replace(/x/g, b.toString())));
                        break;
                    case 'box':
                        var cblk = blocks.blockList[blk].connections[1];
                        var name = parseArg(activity, turtle, cblk);
                        var i = findBox(name);
                        if (i == null) {
                            errorMsg('Cannot find box ' + name + '.');
                            stopTurtle = true;
                            blocks.blockList[blk].value = null;
                        } else {
                            blocks.blockList[blk].value = boxList[i][1];
                        }
                        break;
                    case 'sqrt':
                        var cblk = blocks.blockList[blk].connections[1];
                        var a = parseArg(activity, turtle, cblk);
                        if (a < 0) {
                            errorMsg('Cannot take square root of negative number.');
                            stopTurtle = true;
                            a = -a;
                        }
                        blocks.blockList[blk].value = doSqrt(a);
                        break;
                    case 'mod':
                        var cblk1 = blocks.blockList[blk].connections[1];
                        var cblk2 = blocks.blockList[blk].connections[2];
                        var a = parseArg(activity, turtle, cblk1);
                        var b = parseArg(activity, turtle, cblk2);
                        blocks.blockList[blk].value = doMod(a, b);
                        break;
                    case 'not':
                        var cblk = blocks.blockList[blk].connections[1];
                        var a = parseArg(activity, turtle, cblk);
                        var b = !a;
                        blocks.blockList[blk].value = b;
                        break;
                    case 'greater':
                        var cblk1 = blocks.blockList[blk].connections[1];
                        var cblk2 = blocks.blockList[blk].connections[2];
                        var a = parseArg(activity, turtle, cblk1);
                        var b = parseArg(activity, turtle, cblk2);
                        blocks.blockList[blk].value = (Number(a) > Number(b));
                        break;
                    case 'equal':
                        var cblk1 = blocks.blockList[blk].connections[1];
                        var cblk2 = blocks.blockList[blk].connections[2];
                        var a = parseArg(activity, turtle, cblk1);
                        var b = parseArg(activity, turtle, cblk2);
                        blocks.blockList[blk].value = (a == b);
                        break;
                    case 'not':
                        var cblk = blocks.blockList[blk].connections[1];
                        var a = parseArg(activity, turtle, cblk);
                        blocks.blockList[blk].value = !a;
                        break;
                    case 'less':
                        var cblk1 = blocks.blockList[blk].connections[1];
                        var cblk2 = blocks.blockList[blk].connections[2];
                        var a = parseArg(activity, turtle, cblk1);
                        var b = parseArg(activity, turtle, cblk2);
                        var result = (Number(a) < Number(b));
                        blocks.blockList[blk].value = result;
                        break;
                    case 'random':
                        var cblk1 = blocks.blockList[blk].connections[1];
                        var cblk2 = blocks.blockList[blk].connections[2];
                        var a = parseArg(activity, turtle, cblk1);
                        var b = parseArg(activity, turtle, cblk2);
                        blocks.blockList[blk].value = doRandom(a, b);
                        break;
                    case 'plus':
                        var cblk1 = blocks.blockList[blk].connections[1];
                        var cblk2 = blocks.blockList[blk].connections[2];
                        var a = parseArg(activity, turtle, cblk1);
                        var b = parseArg(activity, turtle, cblk2);
                        blocks.blockList[blk].value = doPlus(a, b);
                        break;
                    case 'multiply':
                        var cblk1 = blocks.blockList[blk].connections[1];
                        var cblk2 = blocks.blockList[blk].connections[2];
                        var a = parseArg(activity, turtle, cblk1);
                        var b = parseArg(activity, turtle, cblk2);
                        blocks.blockList[blk].value = doMultiply(a, b);
                        break;
                    case 'divide':
                        var cblk1 = blocks.blockList[blk].connections[1];
                        var cblk2 = blocks.blockList[blk].connections[2];
                        var a = parseArg(activity, turtle, cblk1);
                        var b = parseArg(activity, turtle, cblk2);
                        blocks.blockList[blk].value = doDivide(a, b);
                        break;
                    case 'minus':
                        var cblk1 = blocks.blockList[blk].connections[1];
                        var cblk2 = blocks.blockList[blk].connections[2];
                        var a = parseArg(activity, turtle, cblk1);
                        var b = parseArg(activity, turtle, cblk2);
                        blocks.blockList[blk].value = doMinus(a, b);
                        break;
                    case 'heading':
                        blocks.blockList[blk].value = turtles.turtleList[turtle].orientation;
                        break;
                    case 'x':
                        blocks.blockList[blk].value = turtles.screenX2turtleX(turtles.turtleList[turtle].container.x);
                        break;
                    case 'y':
                        blocks.blockList[blk].value = turtles.screenY2turtleY(turtles.turtleList[turtle].container.y);
                        break;
                    case 'xturtle':
                    case 'yturtle':
                        var cblk = blocks.blockList[blk].connections[1];
                        var targetTurtle = parseArg(activity, turtle, cblk);
                        for (var i = 0; i < turtles.turtleList.length; i++) {
                            thisTurtle = turtles.turtleList[i];
                            if (targetTurtle == thisTurtle.name) {
                                if (blocks.blockList[blk].name == 'yturtle') {
                                    blocks.blockList[blk].value = turtles.screenY2turtleY(thisTurtle.container.y);
                                } else {
                                    blocks.blockList[blk].value = turtles.screenX2turtleX(thisTurtle.container.x);
                                }
                                break;
                            }
                        }
                        if (i == turtles.turtleList.length) {
                            errorMsg('Could not find turtle ' + targetTurtle);
                            blocks.blockList[blk].value = 0;
                        }
                        break;
                    case 'color':
                        blocks.blockList[blk].value = turtles.turtleList[turtle].color;
                        break;
                    case 'shade':
                        blocks.blockList[blk].value = turtles.turtleList[turtle].value;
                        break;
                    case 'grey':
                        blocks.blockList[blk].value = turtles.turtleList[turtle].chroma;
                        break;
                    case 'pensize':
                        blocks.blockList[blk].value = turtles.turtleList[turtle].stroke;
                        break;
                    case 'and':
                        var cblk1 = blocks.blockList[blk].connections[1];
                        var cblk2 = blocks.blockList[blk].connections[2];
                        var a = parseArg(activity, turtle, cblk1);
                        var b = parseArg(activity, turtle, cblk2);
                        blocks.blockList[blk].value = a && b;
                        break;
                    case 'or':
                        var cblk1 = blocks.blockList[blk].connections[1];
                        var cblk2 = blocks.blockList[blk].connections[2];
                        var a = parseArg(activity, turtle, cblk1);
                        var b = parseArg(activity, turtle, cblk2);
                        blocks.blockList[blk].value = a || b;
                        break;
                    case 'loudness':
                        if (!mic.enabled) {
                            mic.start();
                            blocks.blockList[blk].value = null;
                        } else {
                            blocks.blockList[blk].value = Math.round(mic.getLevel() * 1000);
                        }
                        break;
                    default:
                        if (blocks.blockList[blk].name in evalArgDict) {
                            eval(evalArgDict[blocks.blockList[blk].name]);
                        } else {
                            console.log('ERROR: I do not know how to ' + blocks.blockList[blk].name);
                        }
                        break;
                }
                return blocks.blockList[blk].value;
            } else {
                return blk;
            }
        }

        function hideBlocks() {
            // Hide all the blocks.
            blocks.hide();
            // And hide some other things.
            for (var turtle = 0; turtle < turtles.turtleList.length; turtle++) {
                turtles.turtleList[turtle].container.visible = false;
            }
            trashcan.hide();
            update = true;
        }

        function showBlocks() {
            // Show all the blocks.
            blocks.show();
            blocks.bringToTop();
            // And show some other things.
            for (var turtle = 0; turtle < turtles.turtleList.length; turtle++) {
                turtles.turtleList[turtle].container.visible = true;
            }
            trashcan.show();
            update = true;
        }

        function hideCartesian() {
            cartesianBitmap.visible = false;
            cartesianBitmap.updateCache();
            update = true;
        }

        function showCartesian() {
            cartesianBitmap.visible = true;
            cartesianBitmap.updateCache();
            update = true;
        }

        function hidePolar() {
            polarBitmap.visible = false;
            polarBitmap.updateCache();
            update = true;
        }

        function showPolar() {
            polarBitmap.visible = true;
            polarBitmap.updateCache();
            update = true;
        }

        function doWait(turtle, secs) {
            waitTime[turtle] = Number(secs) * 1000;
        }

        // Logo functions
        function doStorein(name, value) {
            if (name != null) {
                i = findBox(name);
                if (i == null) {
                    boxList.push([name, value]);
                } else {
                    boxList[i][1] = value;
                }
            }
        }

        // Math functions
        function doRandom(a, b) {
            if (typeof(a) == 'string' || typeof(b) == 'string') {
                errorMsg('Not a number.');
                stopTurtle = true;
                return 0;
            }
            return Math.floor(Math.random() * (Number(b) - Number(a) + 1) + Number(a));
        }

	function doMod(a, b) {
            if (typeof(a) == 'string' || typeof(b) == 'string') {
                errorMsg('Not a number.');
                stopTurtle = true;
                return 0;
            }
	    var v = Number(a) % Number(b);
	    console.log(a + ' ' + b + ' ' + v);
	    return Number(a) % Number(b);
	}

	function doSqrt(a) {
            if (typeof(a) == 'string') {
                errorMsg('Not a number.');
                stopTurtle = true;
                return 0;
            }
	    return Math.sqrt(Number(a));
	}

        function doPlus(a, b) {
            if (typeof(a) == 'string' || typeof(b) == 'string') {
                if (typeof(a) == 'string') {
                    var aString = a;
                } else {
                    var aString = a.toString();
                }
                if (typeof(b) == 'string') {
                    var bString = b;
                } else {
                    var bString = b.toString();
                }
                return aString + bString;
            } else {
                return Number(a) + Number(b);
            }
        }

        function doMinus(a, b) {
            if (typeof(a) == 'string' || typeof(b) == 'string') {
                errorMsg('Not a number.');
                stopTurtle = true;
                return 0;
            }
            return Number(a) - Number(b);
        }

        function doMultiply(a, b) {
            if (typeof(a) == 'string' || typeof(b) == 'string') {
                errorMsg('Not a number.');
                stopTurtle = true;
                return 0;
            }
            return Number(a) * Number(b);
        }

        function doDivide(a, b) {
            if (typeof(a) == 'string' || typeof(b) == 'string') {
                errorMsg('Not a number.');
                stopTurtle = true;
                return 0;
            }
            if (Number(b) == 0) {
                errorMsg('Cannot divide by zero.');
                stopTurtle = true;
                return 0;
            } else {
                return Number(a) / Number(b);
            }
        }

        function setBackgroundColor(turtle) {
            /// change body background in DOM to current color
            var body = docById('body');
            if (turtle == -1) {
                body.style.background = getMunsellColor(DEFAULTBACKGROUNDCOLOR[0], DEFAULTBACKGROUNDCOLOR[1], DEFAULTBACKGROUNDCOLOR[2]);
            } else {
                body.style.background = turtles.turtleList[turtle].canvasColor;
            }
            this.svgOutput = '<rect x="0" y="0" height="' + canvas.height + '" width="' + canvas.width + '" fill="' + body.style.background + '"/>\n';
        }

        function allClear() {
            // Clear all the boxes.
            boxList = [];
            time = 0;
            errorMsgText.parent.visible = false;
            msgText.parent.visible = false;
            setBackgroundColor(-1);
            for (var turtle = 0; turtle < turtles.turtleList.length; turtle++) {
                turtles.turtleList[turtle].doClear();
            }
        }

        function findBox(name) {
            // Return the index of the box with name name.
            for (i = 0; i < boxList.length; i++) {
                if (boxList[i][0] == name) {
                    return i;
                }
            }
            return null;
        }

        function pasteStack() {
            blocks.pasteStack();
        }

        function prepareExport() {
            // We don't save blocks in the trash, so we need to
            // consolidate the block list and remap the connections.
            var blockMap = [];
            for (var blk = 0; blk < blocks.blockList.length; blk++) {
                var myBlock = blocks.blockList[blk];
                if (myBlock.trash) {
                    // Don't save blocks in the trash.
                    continue;
                }
                blockMap.push(blk);
            }

            var data = [];
            for (var blk = 0; blk < blocks.blockList.length; blk++) {
                var myBlock = blocks.blockList[blk];
                if (myBlock.trash) {
                    // Don't save blocks in the trash.
                    continue;
                }
                if (blocks.blockList[blk].isValueBlock()) {
                    var name = [myBlock.name, myBlock.value];
                } else {
                    var name = myBlock.name;
                }

                connections = [];
                for (var c = 0; c < myBlock.connections.length; c++) {
                    var mapConnection = blockMap.indexOf(myBlock.connections[c]);
                    if (myBlock.connections[c] == null || mapConnection == -1) {
                        connections.push(null);
                    } else {
                        connections.push(mapConnection);
                    }
                }
                data.push([blockMap.indexOf(blk), name, myBlock.container.x, myBlock.container.y, connections]);
            }
            return JSON.stringify(data);
        }

        function doOpen() {
            // Click on the file open chooser in the DOM.
            this.fileChooser.focus();
            this.fileChooser.click();
        }

        function doSaveBox() {
            saveBox.show(scale);
        }

        function doSave() {
            // FIXME: show input form and then save after name has been entered

            // Save file to turtle.sugarlabs.org
            var titleElem = docById('title');
            if (titleElem.value.length == 0) {
                var saveName = docById('mySaveName');
                if (saveName.value.length == 0) {
                    console.log('saving to unknown.tb');
                    return saveProject('unknown.tb');
                } else {
                    console.log('saving to ' + saveName.value);
                    return saveProject(saveName.value);
                }
            } else {
                console.log('saving to ' + titleElem.value + '.tb');
                return saveProject(titleElem.value + '.tb');
            }
        }

        function hideStopButton() {
            stopTurtleContainer.x = stopTurtleContainerX;
            stopTurtleContainer.y = stopTurtleContainerY;
            stopTurtleContainer.visible = false;
        }

        function showStopButton() {
            stopTurtleContainer.x = openContainer.x;
            stopTurtleContainer.y = openContainer.y;
            stopTurtleContainer.visible = true;
        }

        function updatePasteButton() {
            pasteContainer.removeChild(pasteContainer.children[0]);
            var img = new Image();
            img.onload = function() {
                var originalSize = 55; // this is the original svg size
                var halfSize = Math.floor(cellSize / 2);

                bitmap = new createjs.Bitmap(img);
                if (cellSize != originalSize) {
                    bitmap.scaleX = cellSize / originalSize;
                    bitmap.scaleY = cellSize / originalSize;
                }
                bitmap.regX = halfSize / bitmap.scaleX;
                bitmap.regY = halfSize / bitmap.scaleY;
                pasteContainer.addChild(bitmap)
                update = true;
            }
            img.src = 'icons/paste-button.svg';
        }

        function setupAndroidToolbar() {
            var toolbar = docById('main-toolbar');
            toolbar.style.display = 'none';

            // Buttons used when running turtle programs
            var buttonNames = [
                ['fast', doFastButton],
                ['slow', doSlowButton],
                ['stop-turtle', doStopButton],
                ['clear', allClear],
                ['palette', changePaletteVisibility],
                ['hide-blocks', changeBlockVisibility]
            ];

            var btnSize = cellSize;
            var x = Math.floor(btnSize / 2);
            var y = x;
            var dx = btnSize;
            var dy = 0;

            closeContainer = makeButton('close-toolbar-button', x, y, btnSize);
            loadButtonDragHandler(closeContainer, x, y, doCloseToolbarButton);

            openContainer = makeButton('open-toolbar-button', x, y, btnSize);
            loadButtonDragHandler(openContainer, x, y, doOpenToolbarButton);
            openContainer.visible = false;

            for (name in buttonNames) {
                x += dx;
                y += dy;
                var container = makeButton(buttonNames[name][0] + '-button',
                    x, y, btnSize);
                loadButtonDragHandler(container, x, y, buttonNames[name][1]);
                onscreenButtons.push(container);

                if (buttonNames[name][0] == 'stop-turtle') {
                    stopTurtleContainer = container;
                    stopTurtleContainerX = x;
                    stopTurtleContainerY = y;
                }
            }

            // Misc. other buttons
            // FIXME: empty-trash is the wrong name
            var menuNames = [
                ['paste-disabled', pasteStack],
                ['Cartesian', doCartesian],
                ['polar', doPolar],
                ['samples', doOpenSamples],
                ['open', doOpen],
                ['empty-trash', deleteBlocksBox],
                ['restore-trash', restoreTrash]
            ];
            if (server) {
                menuNames.push(['save', doSaveBox]);
            }

            // Upper righthand corner
            var x = Math.floor(canvas.width / scale) - btnSize;
            var y = Math.floor(btnSize / 2);
            // if (onAndroid) {
            // FIXME: check for the correct value
            // space for the bottom android toolbar
            // if we are in the lower right
            // y -= 80;
            // };
            var dx = 0;
            var dy = btnSize;
            menuContainer = makeButton('menu-button', x, y, btnSize);
            loadButtonDragHandler(menuContainer, x, y, doMenuButton);

            for (name in menuNames) {
                x += dx;
                y += dy;
                var container = makeButton(menuNames[name][0] + '-button',
                    x, y, btnSize);
                loadButtonDragHandler(container, x, y, menuNames[name][1]);
                onscreenMenu.push(container);
                container.visible = false;
            }
        }

        function doMenuButton() {
            if (menuButtonsVisible) {
                doMenuAnimation(1);
            } else {
                doMenuAnimation(1);
            }
        }

        function doMenuAnimation(count) {
            if (count < 10) {
                var bitmap = last(menuContainer.children);
                bitmap.rotation += 10;
                bitmap.updateCache();
                update = true;
                setTimeout(function() {
                    doMenuAnimation(count + 1);
                }, 50);
            } else {
                var saveName = docById('mySaveName');
                if (menuButtonsVisible) {
                    menuButtonsVisible = false;
                    for (button in onscreenMenu) {
                        onscreenMenu[button].visible = false;
                    }
                    if (server) {
                        saveName.style.visibility = 'hidden';
                    }
                } else {
                    menuButtonsVisible = true;
                    for (button in onscreenMenu) {
                        onscreenMenu[button].visible = true;
                    }
                    if (server) {
                        saveName.style.visibility = 'visible';
                    }
                }
                update = true;
            }
        }

        function doOpenToolbarButton() {
            doOpenAnimation(0);
        }

        function doOpenAnimation(count) {
            if (count < 10) {
                var bitmap = last(openContainer.children);
                bitmap.rotation = (count * 10) % 360;
                bitmap.updateCache();
                update = true;
                setTimeout(function() {
                    doOpenAnimation(count + 1);
                }, 50);
            } else {
                openContainer.visible = false;
                closeContainer.visible = true;
                toolbarButtonsVisible = true;
                // Make sure stop-turtle button is in the right place.
                stopTurtleContainer.x = stopTurtleContainerX;
                stopTurtleContainer.y = stopTurtleContainerY;
                for (button in onscreenButtons) {
                    onscreenButtons[button].visible = true;
                }
                update = true;
            }
        }

        function doCloseToolbarButton() {
            openContainer.visible = true;
            closeContainer.visible = false;
            toolbarButtonsVisible = false;
            stopTurtleContainer.x = closeContainer.x;
            stopTurtleContainer.y = closeContainer.y;
            for (button in onscreenButtons) {
                onscreenButtons[button].visible = false;
            }
            update = true;
        }

        function toggleToolbar() {
            if (buttonsVisible) {
                buttonsVisible = false;
                if (onAndroid || !onXO) {
                    closeContainer.visible = false;
                    openContainer.visible = false;
                    menuContainer.visible = false;
                    for (button in onscreenButtons) {
                        onscreenButtons[button].visible = false;
                    }
                    for (button in onscreenMenu) {
                        onscreenMenu[button].visible = false;
                    }
                } else {
                    var toolbar = docById('main-toolbar');
                    toolbar.style.display = 'none';
                }
            } else {
                buttonsVisible = true;
                if (onAndroid || !onXO) {
                    if (toolbarButtonsVisible) {
                        closeContainer.visible = true;
                        for (button in onscreenButtons) {
                            onscreenButtons[button].visible = true;
                        }
                    }
                    if (menuButtonsVisible) {
                        for (button in onscreenMenu) {
                            onscreenMenu[button].visible = true;
                        }
                    }
                    openContainer.visible = true;
                    menuContainer.visible = true;
                } else {
                    var toolbar = docById('main-toolbar');
                    toolbar.style.display = 'inline';
                }
            }
            update = true;
        }

        function makeButton(name, x, y, size) {
            var container = new createjs.Container();
            if (name == 'paste-disabled-button') {
                pasteContainer = container;
            }

            stage.addChild(container);
            container.x = x;
            container.y = y;

            var img = new Image();

            img.onload = function() {
                var originalSize = 55; // this is the original svg size
                var halfSize = Math.floor(size / 2);

                bitmap = new createjs.Bitmap(img);
                if (size != originalSize) {
                    bitmap.scaleX = size / originalSize;
                    bitmap.scaleY = size / originalSize;
                }
                bitmap.regX = halfSize / bitmap.scaleX;
                bitmap.regY = halfSize / bitmap.scaleY;

                container.addChild(bitmap);
                var hitArea = new createjs.Shape();
                hitArea.graphics.beginFill('#FFF').drawEllipse(-halfSize, -halfSize, size, size);
                hitArea.x = 0;
                hitArea.y = 0;
                container.hitArea = hitArea;
                bitmap.cache(0, 0, size, size);
                bitmap.updateCache();
                update = true;
            }

            img.src = 'icons/' + name + '.svg';

            return container;
        }

        // function loadToolbarButtonHandler(container, action) {
        //     container.on('click', function(event) {
        //         if (action != null) {
        //             action();
        //         }
        //     });
        // }

        function loadButtonDragHandler(container, ox, oy, action) {
            // Prevent multiple button presses (i.e., debounce).
            var locked = false;

            container.on('mousedown', function(event) {
                var moved = true;
                console.log('mousedown event: ' + moved);

                var offset = {
                    x: container.x - Math.round(event.stageX / blocks.scale),
                    y: container.y - Math.round(event.stageY / blocks.scale)
                };

                // container.on('mouseout', function(event) {
                //    console.log('mouseout event: ' + moved);
                //    container.x = ox;
                //    container.y = oy;
                //    if (action != null && moved) {
                //        action();
                //    }
                //    moved = false;
                // });

                container.on('pressup', function(event) {
                    console.log('pressup event: ' + moved + ' ' + locked);
                    container.x = ox;
                    container.y = oy;
                    if (action != null && moved && !locked) {
                        locked = true;
                        setTimeout(function() {
                            locked = false;
                        }, 500);
                        action();
                    }
                    moved = false;
                });

                container.on('pressmove', function(event) {
                    moved = true;
                    container.x = Math.round(event.stageX / blocks.scale) + offset.x;
                    container.y = Math.round(event.stageY / blocks.scale) + offset.y;
                    update = true;
                });
            });
        }
    });
});


function httpGet(projectName) {
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();

    if (projectName == null) {
        xmlHttp.open('GET', 'https://turtle.sugarlabs.org/server', false);
        xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
    } else {
        xmlHttp.open('GET', 'https://turtle.sugarlabs.org/server/' + projectName, false);
        xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
        // xmlHttp.setRequestHeader('x-project-id', projectName);
    }
    xmlHttp.send();
    return xmlHttp.responseText;
}


function httpPost(projectName, data) {
    var xmlHttp = null;
    console.log('sending ' + data);
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', 'https://turtle.sugarlabs.org/server/' + projectName, false);
    xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
    // xmlHttp.setRequestHeader('x-project-id', projectName);
    xmlHttp.send(data);
    // return xmlHttp.responseText;
    return 'https://apps.facebook.com/turtleblocks/?file=' + projectName;
}


function docById(id) {
    return document.getElementById(id);
}


function last(myList) {
    var i = myList.length;
    if (i == 0) {
        return null;
    } else {
        return myList[i - 1];
    }
}


function doSVG(canvas, turtles, width, height, scale) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">\n';
    svg += '<g transform="scale(' + scale + ',' + scale + ')">\n';
    svg += this.svgOutput;
    for (var turtle in turtles.turtleList) {
        turtles.turtleList[turtle].closeSVG();
        svg += turtles.turtleList[turtle].svgOutput;
    }
    svg += '</g>';
    svg += '</svg>';
    return svg;
}


function fileExt(file) {
    var parts = file.split('.');
    if (parts.length == 1 || (parts[0] == '' && parts.length == 2)) {
        return '';
    }
    return parts.pop();
}


function fileBasename(file) {
    var parts = file.split('.');
    if (parts.length == 1) {
        return parts[0];
    } else if (parts[0] == '' && parts.length == 2) {
        return file;
    } else {
        parts.pop(); // throw away suffix
        return parts.join('.');
    }
}


function doUseCamera(args, turtles, turtle, isVideo, setCameraID) {
    w = 320;
    h = 240;
    current = 0;

    function setup() {
        elements = document.getElementsByTagName('video');
        for (var x = 0; x < elements.length; x++) {
            elements[x].parentNode.removeChild(elements[x]);
        }
        videocapture = p5.prototype.createCapture(p5.prototype.VIDEO);
        videocapture.size(w, h);
    }

    function draw() {
        video = document.getElementsByTagName('video')[0];
        if (video != undefined) {
            var canvas = document.getElementById('camCanvas');
            canvas.width = w;
            canvas.height = h;
            var context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, w, h);
            data = canvas.toDataURL("image/png");
            turtles.turtleList[turtle].doShowImage(args[0], data);
        }
    }
    if (!isVideo) {
        window.setTimeout(doStopVideoCam, 4000);
    }
    setup();
    if (!isVideo) {
        cameraID = window.setInterval(draw, 10);
    } else {
        cameraID = window.setInterval(draw, 100)
    }
    setCameraID(cameraID);
}


function doStopVideoCam(cameraID, setCameraID) {
    window.clearInterval(cameraID);
    elements = document.getElementsByTagName('video');
    for (var x = 0; x < elements.length; x++) {
        elements[x].parentNode.removeChild(elements[x]);
    }
    setCameraID(null);
}
