// Copyright (c) 2014,2015 Walter Bender
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 3 of the License, or
// (at your option) any later version.
//
// You should have received a copy of the GNU General Public License
// along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA
//
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
    require('activity/utils');
    require('activity/artwork');
    require('activity/munsell');
    require('activity/trash');
    require('activity/turtle');
    require('activity/palette');
    require('activity/blocks');
    require('activity/logo');
    require('activity/savebox');
    require('activity/clearbox');
    require('activity/samplesviewer');
    require('activity/samples');
    require('activity/basicblocks');

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function(doc) {

        try {
            meSpeak.loadConfig('lib/mespeak_config.json');
            meSpeak.loadVoice('lib/voices/en/en.json');
        } catch (e) {
            console.log(e);
        }

        // Initialize the activity.
        activity.setup();
        setTimeout(function() {
            showHelp(true)
        }, 1000);

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

        // Set up a file chooser for the doOpen function.
        var fileChooser = docById('myOpenFile');
        // Set up a file chooser for the doOpenPlugin function.
        var pluginChooser = docById('myOpenPlugin');
        // The file chooser for all files.
        var allFilesChooser = docById('myOpenAll')

        // Are we running off of a server?
        var server = true;
        var scale = 1;
        var stage;
        var turtles;
        var palettes;
        var blocks;
        var logo;
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

        pluginObjs = {
            'PALETTEPLUGINS': {},
            'PALETTEFILLCOLORS': {},
            'PALETTESTROKECOLORS': {},
            'PALETTEHIGHLIGHTCOLORS': {},
            'FLOWPLUGINS': {},
            'ARGPLUGINS': {},
            'BLOCKPLUGINS': {}
        };

        // Stacks of blocks saved in local storage
        var macroDict = {};

        var stopTurtleContainer = null;
        var stopTurtleContainerX = 0;
        var stopTurtleContainerY = 0;
        var cameraID = null;
        var toLang = null;
        var fromLang = null;

        // initial scroll position
        var scrollX = 0;
        var scrollY = 0;

        // default values
        var CAMERAVALUE = '##__CAMERA__##';
        var VIDEOVALUE = '##__VIDEO__##';

        var DEFAULTDELAY = 500;  // milleseconds
        var TURTLESTEP = -1;  // Run in step-by-step mode

        // Time when we hit run
        var time = 0;

        // Used by pause block
        var waitTime = {};

        // Used to track mouse state for mouse button block
        var stageMouseDown = false;
        var stageX = 0;
        var stageY = 0;

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

        pluginsImages = {};

        var draggingContainer = false;

        function allClear() {
            logo.boxes = {};
            logo.time = 0;
            hideMsgs();
            logo.setBackgroundColor(-1);
            for (var turtle = 0; turtle < turtles.turtleList.length; turtle++) {
                turtles.turtleList[turtle].doClear();
            }

            blocksContainer.x = 0;
            blocksContainer.y = 0;
        }

        function doFastButton() {
            logo.setTurtleDelay(0);
            if (!turtles.running()) {
                logo.runLogoCommands();
            } else {
                logo.step();
            }
        }

        function doSlowButton() {
            logo.setTurtleDelay(DEFAULTDELAY);
            if (!turtles.running()) {
                logo.runLogoCommands();
            } else {
                logo.step();
            }
        }

        function doStepButton() {
            var turtleCount = 0;
            for (var turtle in logo.stepQueue) {
                turtleCount += 1;
            }
            if (turtleCount == 0 || logo.turtleDelay != TURTLESTEP) {
                // Either we haven't set up a queue or we are
                // switching modes.
                logo.setTurtleDelay(TURTLESTEP);
                // Queue and take first step.
                if (!turtles.running()) {
                    logo.runLogoCommands();
                }
                logo.step();
            } else {
                logo.setTurtleDelay(TURTLESTEP);
                logo.step();
            }
        }

        var stopTurtle = false;
        function doStopButton() {
            logo.doStopTurtle();
        }

        var cartesianVisible = false;
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
        function doPolar() {
            if (polarVisible) {
                hidePolar();
                polarVisible = false;
            } else {
                showPolar();
                polarVisible = true;
            }
        }

        // Make the activity stop with the stop button.
        var stopButton = docById('stop-button');
        stopButton.addEventListener('click', function(e) {
            activity.close();
        });

        // Do we need to update the stage?
        var update = true;

        // The dictionary of action name: block
        var actions = {};

        // The dictionary of box name: value
        var boxes = {};

        // Coordinate grid
        var cartesianBitmap = null;

        // Polar grid
        var polarBitmap = null;

        // Msg block
        var msgText = null;

        // ErrorMsg block
        var errorMsgText = null;
        var errorMsgArrow = null;

        // Get things started
        init();

        function init() {
            docById('loader').className = 'loader';

            stage = new createjs.Stage(canvas);
            createjs.Touch.enable(stage);

            blocksContainer = new createjs.Container();
            stage.addChild(blocksContainer);
            setupBlocksContainerEvents();

            createjs.Ticker.addEventListener('tick', tick);

            createMsgContainer('#ffffff', '#7a7a7a', function(text) {
                msgText = text;
            });

            createMsgContainer('#ffcbc4', '#ff0031', function(text) {
                errorMsgText = text;
            });

            trashcan = new Trashcan(canvas, stage, cellSize, refreshCanvas);
            turtles = new Turtles(canvas, stage, refreshCanvas);
            blocks = new Blocks(canvas, blocksContainer, refreshCanvas, trashcan);
            palettes = initPalettes(canvas, stage, cellSize, refreshCanvas, trashcan, blocks);

            palettes.setBlocks(blocks);
            palettes.setDragging(setDraggingContainer);
            turtles.setBlocks(blocks);
            turtles.setDragging(setDraggingContainer);
            blocks.setTurtles(turtles);
            blocks.setErrorMsg(errorMsg);
            blocks.setDragging(setDraggingContainer);
            blocks.makeCopyPasteButtons(makeButton, updatePasteButton);

            // TODO: clean up this mess.
            logo = new Logo(blocks, turtles, stage, refreshCanvas, textMsg,
                            errorMsg, hideMsgs, onStopTurtle, onRunTurtle,
                            prepareExport, getStageX, getStageY,
                            getStageMouseDown, getCurrentKeyCode,
                            clearCurrentKeyCode, meSpeak);
            blocks.setLogo(logo);

            // Set the default background color...
            logo.setBackgroundColor(-1);

            saveBox = new SaveBox(canvas, stage, refreshCanvas, doSave);
            clearBox = new ClearBox(canvas, stage, refreshCanvas, sendAllToTrash);

            thumbnails = new SamplesViewer(canvas, stage, refreshCanvas, doCloseSamples, loadProject, sendAllToTrash);

            initBasicProtoBlocks(palettes, blocks);

            // Advanced blocks are stored in a locally stored
            // JSON-encoded plugin.
            new HttpRequest('plugins/advancedblocks.json', function () {
                var req = this.request;
                if (req.readyState == 4) {
                    if (this.localmode || req.status == 200) {
                        var obj = processRawPluginData(req.responseText, palettes, blocks, errorMsg, logo.evalFlowDict, logo.evalArgDict, logo.evalParameterDict, logo.evalSetterDict);
                    }
                    else {
                        if (self.console) console.log('Failed to load advanced blocks: Received status ' + req.status + '.');
                    }
                    this.request = this.handler = this.userCallback = null;
                }
            }, null);

            // Load any macros saved in local storage.
            var macroData = localStorage.getItem('macros');
            if (macroData != null) {
                processMacroData(macroData, palettes, blocks, macroDict);
            }
            // Blocks and palettes need access to the macros dictionary.
            blocks.setMacroDictionary(macroDict);
            palettes.setMacroDictionary(macroDict);

            // Load any plugins saved in local storage.
            var pluginData = localStorage.getItem('plugins');
            if (pluginData != null) {
                processPluginData(pluginData, palettes, blocks, logo.evalFlowDict, logo.evalArgDict, logo.evalParameterDict, logo.evalSetterDict);
            }

            fileChooser.addEventListener('click', function(event) { this.value = null; });
            fileChooser.addEventListener('change', function(event) {

                // Read file here.
                var reader = new FileReader();

                reader.onload = (function(theFile) {
                    // Show busy cursor.
                    document.body.style.cursor = 'wait';
                    setTimeout(function() {
                        var rawData = reader.result;
                        var cleanData = rawData.replace('\n', ' ');
            console.log(cleanData);
                        var obj = JSON.parse(cleanData);
            console.log(obj)
                        blocks.loadNewBlocks(obj);
                        // Restore default cursor.
                        document.body.style.cursor = 'default';
                    }, 200);
                });

                reader.readAsText(fileChooser.files[0]);
            }, false);

            allFilesChooser.addEventListener('click', function(event) { this.value = null; });

            pluginChooser.addEventListener('click', function(event) { this.value = null; });
            pluginChooser.addEventListener('change', function(event) {

                // Read file here.
                var reader = new FileReader();

                reader.onload = (function(theFile) {
                    // Show busy cursor.
                    document.body.style.cursor = 'wait';
                    setTimeout(function() {
                        obj = processRawPluginData(reader.result, palettes, blocks, errorMsg, logo.evalFlowDict, logo.evalArgDict, logo.evalParameterDict, logo.evalSetterDict);
                        // Save plugins to local storage.
                        if (obj != null) {
                            localStorage.setItem('plugins', preparePluginExports(obj));
                        }

                        // Refresh the palettes.
                        setTimeout(function() {
                            if (palettes.visible) {
                                palettes.hide();
                            }
                            palettes.show();
                            palettes.bringToTop();
                        }, 1000);

                        // Restore default cursor.
                        document.body.style.cursor = 'default';
                    }, 200);
                });

                reader.readAsText(pluginChooser.files[0]);
            }, false);

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

            var URL = window.location.href;
            var projectName = null;
            try {
                httpGet(null);
                console.log('running from server or the user can access to examples.');
                server = true;
            } catch (e) {
                console.log('running from filesystem or the connection isnt secure');
                server = false;
            }

            setupAndroidToolbar();

            // Scale the canvas relative to the screen size.
            onResize();

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
                setTimeout(function () { console.log('load ' + projectName); loadProject(projectName); }, 2000);
            } else {
                setTimeout(function () { loadStart(); }, 2000);
            }

            document.addEventListener('mousewheel', scrollEvent, false);
            document.addEventListener('DOMMouseScroll', scrollEvent, false);

            this.document.onkeydown = keyPressed;
        }

        function setupBlocksContainerEvents() {
            var moving = false;
            stage.on('stagemousedown', function (event) {
                if (stage.getObjectUnderPoint() !== null) {
                    return;
                }

                moving = true;
                lastCords = {x: event.stageX, y: event.stageY};

                stage.on('stagemousemove', function (event) {
                    stageX = event.stageX;
                    stageY = event.stageY;

                    if (!moving) {
                        return;
                    }

                    blocksContainer.x += event.stageX - lastCords.x;
                    blocksContainer.y += event.stageY - lastCords.y;
                    lastCords = {x: event.stageX, y: event.stageY};
                });

                stage.on('stagemouseup', function (event) {
                    moving = false;
                }, null, true);  // once = true
            });
        }

        function scrollEvent(event) {
            var data = event.wheelDelta || -event.detail;
            var delta = Math.max(-1, Math.min(1, (data)));
            var scrollSpeed = 3;

            if (event.clientX < cellSize) {
                palettes.menuScrollEvent(delta, scrollSpeed);
            } else {
                palette = palettes.findPalette(event.clientX, event.clientY);
                if (palette) {
                    palette.scrollEvent(delta, scrollSpeed);
                }
            }
        }

        function getStageX() {
            return stageX;
        }

        function getStageY() {
            return stageY;
        }

        function getStageMouseDown() {
            return stageMouseDown;
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
                    // On the possibility that there was an error
                    // arrow associated with this container
                    if (errorMsgArrow !== null) {
                        errorMsgArrow.removeAllChildren(); // Hide the error arrow.
                    }
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
                        logo.doStopTurtle();
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

        function getCurrentKeyCode() {
            return currentKeyCode;
        }

        function clearCurrentKeyCode() {
            currentKey = '';
            currentKeyCode = 0;
        }

        function onResize() {
            if (!onAndroid) {
                var w = window.innerWidth;
                var h = window.innerHeight;
            } else {
                var w = window.outerWidth;
                var h = window.outerHeight;
            }

            var smallSide = Math.min(w, h);
            if (smallSide < cellSize * 10) {
                scale = smallSide / (cellSize * 10);
            } else {
                if (w > h) {
                    scale = w / 1200;
                } else {
                    scale = w / 900;
                }
            }
            stage.scaleX = scale;
            stage.scaleY = scale;

            stage.canvas.width = w;
            stage.canvas.height = h;

            console.log('Resize: scale ' + scale +
                ', windowW ' + w + ', windowH ' + h +
                ', canvasW ' + canvas.width + ', canvasH ' + canvas.height +
                ', screenW ' + screen.width + ', screenH ' + screen.height);

            turtles.setScale(scale);
            blocks.setScale(scale);
            palettes.setScale(scale);
            trashcan.resizeEvent(scale);
            setupRightMenu(scale);

            // Reposition coordinate grids.
            cartesianBitmap.x = (canvas.width / (2 * scale)) - (600);
            cartesianBitmap.y = (canvas.height / (2 * scale)) - (450);
            polarBitmap.x = (canvas.width / (2 * scale)) - (600);
            polarBitmap.y = (canvas.height / (2 * scale)) - (450);
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
                logo.hideBlocks();
            } else {
                logo.showBlocks();
            }
        }

        function toggleCollapsibleStacks() {
            if (blocks.visible) {
                console.log('calling toggleCollapsibles');
                blocks.toggleCollapsibles();
            }
        }

        function stop() {
            // FIXME: who calls this???
            createjs.Ticker.removeEventListener('tick', tick);
        }

        function onStopTurtle() {
            // TODO: plugin support
            if (buttonsVisible && !toolbarButtonsVisible) {
                hideStopButton();
            }
        }

        function onRunTurtle() {
            // TODO: plugin support
            // If the stop button is hidden, show it.
            if (buttonsVisible && !toolbarButtonsVisible) {
                showStopButton();
            }
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
            logo.showBlocks();
        }

        function doOpenSamples() {
            if (thumbnailsVisible) {
                doCloseSamples();
            } else {
                console.log('showing thumbnails');
                if (!thumbnails.show(scale)) {
                    console.log('thumbnails not available');
                } else if (!thumbnails.locked) {
                    stage.setChildIndex(thumbnails.container, stage.getNumChildren() - 1);
                    thumbnailsVisible = true;
                    logo.hideBlocks();
                } else {
                    console.log('thumbnails locked');
                }
            }
        }

        function loadProject(projectName) {
            // Show busy cursor.
            document.body.style.cursor = 'wait';
            // palettes.updatePalettes();
            setTimeout(function() {
                if (fileExt(projectName) != 'tb') {
                    projectName += '.tb';
                }
                try {
                    if (server) {
                        var rawData = httpGet(projectName);
                        console.log('receiving ' + rawData);
                        var cleanData = rawData.replace('\n', '');
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
                // Restore default cursor
                document.body.style.cursor = 'default';
                update = true;
            }, 200);
            setTimeout(function() {
                console.log('calling toggleCollapsibles after timeout');
                blocks.toggleCollapsibles();
            }, 3000);
        }

        function saveProject(projectName) {
            // palettes.updatePalettes();
            // Show busy cursor.
            document.body.style.cursor = 'wait';
            setTimeout(function() {
                var punctuationless = projectName.replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^`{|}~']/g, '');
                projectName = punctuationless.replace(/ /g, '_');
                if (fileExt(projectName) != 'tb') {
                    projectName += '.tb';
                }
                try {
                    // Post the project
                    var returnValue = httpPost(projectName, prepareExport());
                    errorMsg('Saved ' + projectName + ' to ' + window.location.host);

                    var img = new Image();
                    var svgData = doSVG(canvas, logo, turtles, 320, 240, 320 / canvas.width);
                    img.onload = function() {
                        var bitmap = new createjs.Bitmap(img);
                        var bounds = bitmap.getBounds();
                        bitmap.cache(bounds.x, bounds.y, bounds.width, bounds.height);
                        // and base64-encoded png
                        httpPost(projectName.replace('.tb', '.b64'), bitmap.getCacheDataURL());
                    }
                    img.src = 'data:image/svg+xml;base64,' + window.btoa(
                        unescape(encodeURIComponent(svgData)));
                    // Restore default cursor
                    document.body.style.cursor = 'default';
                    return returnValue;
                } catch (e) {
                    console.log(e);
                    // Restore default cursor
                    document.body.style.cursor = 'default';
                    return;
                }
            }, 200);
        }

        function loadStart() {
            // where to put this?
            // palettes.updatePalettes();

            sessionData = null;
            // Try restarting where we were when we hit save.
            if (typeof(Storage) !== 'undefined') {
                // localStorage is how we'll save the session (and metadata)
                sessionData = localStorage.getItem('sessiondata');
            }
            if (sessionData != null) {
                try {
                    console.log('restoring session: ' + sessionData);
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
                    blocks.blockList[0].collapsed = true;
                    turtles.add(blocks.blockList[0]);
                    blocks.updateBlockPositions();
                }
                blocks.makeNewBlock('start', postProcess, null);
            }
            setTimeout(function() {
                console.log('calling toggleCollapsibles after timeout');
                blocks.toggleCollapsibles();
            }, 3000);
            update = true;
        }

        function hideMsgs() {
            errorMsgText.parent.visible = false;
            if (errorMsgArrow !== null) {
                errorMsgArrow.removeAllChildren();
                refreshCanvas();
            }
            msgText.parent.visible = false;
        }

        function textMsg(msg) {
            if (msgText == null) {
                // The container may not be ready yet... so do nothing
                return;
            }
            var msgContainer = msgText.parent;
            msgContainer.visible = true;
            msgText.text = msg;
            msgContainer.updateCache();
            stage.setChildIndex(msgContainer, stage.getNumChildren() - 1);
        }

        function errorMsg(msg, blk) {
            if (errorMsgText == null) {
                // The container may not be ready yet... so do nothing
                return;
            }
            var errorMsgContainer = errorMsgText.parent;
            errorMsgContainer.visible = true;
            errorMsgText.text = msg;
            stage.setChildIndex(errorMsgContainer, stage.getNumChildren() - 1);

            if (blk !== undefined && blk !== null
                && !blocks.blockList[blk].collapsed) {
                var fromX = (canvas.width - 1000) / 2;
                var fromY = 128;
                var toX = blocks.blockList[blk].x + blocksContainer.x;
                var toY = blocks.blockList[blk].y + blocksContainer.y;

                if (errorMsgArrow == null) {
                    errorMsgArrow = new createjs.Container();
                    stage.addChild(errorMsgArrow);
                }

                var line = new createjs.Shape();
                errorMsgArrow.addChild(line);
                line.graphics.setStrokeStyle(4).beginStroke('#ff0031').moveTo(fromX, fromY).lineTo(toX, toY);
                stage.setChildIndex(errorMsgArrow, stage.getNumChildren() - 1);
                update = true;

                var angle = Math.atan2(toX - fromX, fromY - toY) / Math.PI * 180;
                var head = new createjs.Shape();
                errorMsgArrow.addChild(head);
                head.graphics.setStrokeStyle(4).beginStroke('#ff0031').moveTo(-10, 18).lineTo(0, 0).lineTo(10, 18);
                head.x = toX;
                head.y = toY;
                head.rotation = angle;
            }

            stage.setChildIndex(errorMsgContainer, stage.getNumChildren() - 1);
            errorMsgContainer.updateCache();
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
                if (blocks.blockList[blk].isValueBlock() || blocks.blockList[blk].name == 'loadFile') {
                    var args = {'value': myBlock.value};
                } else  if (myBlock.name == 'start') {
                    // It's a turtle.
                    turtle = turtles.turtleList[myBlock.value];
                    var args = {'collapsed': myBlock.collapsed,
                                'xcor': turtle.x,
                                'ycor': turtle.y,
                                'heading': turtle.orientation,
                                'color': turtle.color,
                                'shade': turtle.value,
                                'pensize': turtle.stroke,
                                'grey': turtle.chroma};
                } else if (myBlock.name == 'action') {
                    var args = {'collapsed': myBlock.collapsed}
                } else {
                    var args = {};
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
                data.push([blockMap.indexOf(blk), [myBlock.name, args], myBlock.container.x, myBlock.container.y, connections]);
            }
            return JSON.stringify(data);
        }

        function doOpen() {
            // Click on the file open chooser in the DOM (.ta, .tb).
            fileChooser.focus();
            fileChooser.click();
        }

        function doOpenPlugin() {
            // Click on the plugin open chooser in the DOM (.json).
            pluginChooser.focus();
            pluginChooser.click();
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

        function saveToFile() {
            var filename = prompt('Filename:');
            if (fileExt(filename) != 'tb') {
                filename += '.tb';
            }
            download(filename, 'data:text/plain;charset=utf-8,' + encodeURIComponent(prepareExport()));
        };

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
                ['step', doStepButton],
                ['stop-turtle', doStopButton],
                ['clear', allClear],
                ['palette', changePaletteVisibility],
                ['hide-blocks', changeBlockVisibility],
                ['collapse-blocks', toggleCollapsibleStacks],
                ['help', showHelp]
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

            setupRightMenu(scale);
        }

        function setupRightMenu(scale) {
            if (menuContainer !== undefined) {
                stage.removeChild(menuContainer);
                for (i in onscreenMenu) {
                    stage.removeChild(onscreenMenu[i]);
                }
            }

            // Misc. other buttons
            var menuNames = [
                ['paste-disabled', pasteStack],
                ['Cartesian', doCartesian],
                ['polar', doPolar],
                ['samples', doOpenSamples],
                ['open', doOpen],
                ['plugin', doOpenPlugin],
                ['empty-trash', deleteBlocksBox],
                ['restore-trash', restoreTrash],
                ['save-to-file', saveToFile]
            ];
            if (server) {
                menuNames.push(['save', doSaveBox]);
            }

            var btnSize = cellSize;
            var x = Math.floor(canvas.width / scale) - btnSize / 2;
            var y = Math.floor(btnSize / 2);

            var dx = 0;
            var dy = btnSize;

            menuContainer = makeButton('menu-button', x, y, btnSize,
                                       menuButtonsVisible? 90 : undefined);
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

            if (menuButtonsVisible) {
                for (button in onscreenMenu) {
                    onscreenMenu[button].visible = true;
                }
                if (server) {
                    var saveName = docById('mySaveName');
                    saveName.style.visibility = 'visible';
                }
            }
        }

        function showHelp(firstTime) {
            var cookie = getCookie('turtlejstour');

            if (firstTime) {
              var scaled = 0;
              var current = 0;
              for (var i = 0; i < 10; i++) {
                scaled = current * scale;
                docById('helpHButton-' + i).style.marginLeft = scaled + 'px';
                current += cellSize;
              }
              current = 0
              for (i = 0; i < 10; i++) {
                scaled = current * scale;
                docById('helpVButton-' + i).style.marginLeft = window.innerWidth - (2 * (scale * cellSize)) + 'px';
                docById('helpVButton-' + i).style.marginTop = scaled + 'px';
                current += cellSize;
              }
              docById('helpEnd').style.marginLeft = 256;
              docById('helpEnd').style.marginTop = 128;
            }


            if (firstTime && cookie) {
                content = '<ol id="tour"></ol>'
            } else {
                // Random year :)
                document.cookie = 'turtlejstour=ready; expires=Fri, 31 Dec 2037 23:59:59 GMT'
                palettes.show();
                menuButtonsVisible = false;
                doMenuAnimation(1);
                content = '<ol style="visibility:hidden; font-size:0px" id="tour"><li data-text="Take a tour"><h2>' + _('Welcome to Turtle Blocks') + '</h2><p>' + _('Turtle Blocks is a Logo-inspired turtle that draws colorful pictures with snap-together visual-programming blocks.') + '</p></li><li data-id="paletteInfo" data-options="tipLocation:left"><h2>' + _('Palette buttons') + '</h2><p>' + _('This toolbar contains the palette buttons: click to show or hide the palettes of blocks (Turtle, Pen, Numbers, Boolean, Flow, Blocks, Media, Sensors, and Extras). Once open, you can drag blocks from the palettes onto the canvas to use them.') + '</p></li><li data-id="helpHButton-0" data-button="Next"><h2>' + _('Expand/collapse toolbar') + '</h2><p>' + _('This button opens and closes the primary toolbar.') + '</p></li><li data-id="helpHButton-1" data-button="Next"><h2>' + _('Run fast') + '</h2><p>' + _('Click to run the project in fast mode.') + '</p></li><li data-id="helpHButton-2" data-button="Next"><h2>' + _('Run slow') + '</h2><p>' + _('Click to run the project in slow mode.') + '</p></li><li data-id="helpHButton-3" data-button="Next"><h2>' + _('Run step by step') + '</h2><p>' + _('Click to run the project step by step.') + '</p></li><li data-id="helpHButton-4" data-button="Next"><h2>' + _('Stop') + '</h2><p>' + _('Stop the current project.') + '</p></li><li data-id="helpHButton-5" data-button="Next"><h2>' + _('Clean') + '</h2><p>' + _('Clear the screen and return the turtles to their initial positions.') + '</p></li><li data-id="helpHButton-6" data-button="Next"><h2>' + _('Show/hide palettes') + '</h2><p>' + _('Hide or show the block palettes.') + '</p></li><li data-id="helpHButton-7" data-button="Next"><h2>' + _('Show/hide blocks') + '</h2><p>' + _('Hide or show the blocks and the palettes.') + '</p></li><li data-id="helpHButton-8" data-button="Next"><h2>' + _('Expand/collapse collapsable blocks') + '</h2><p>' + _('Expand or collapse stacks of blocks, e.g, start and action stacks.') + '</p></li><li data-id="helpHButton-9" data-button="Next"><h2>' + _('Help') + '</h2><p>' + _('Show these messages.') + '</p></li><li data-id="helpVButton-0" data-button="Next" data-options="tipLocation:right"><h2>' + _('Expand/collapse option toolbar') + '</h2><p>' + _('Click this button to expand or collapse the auxillary toolbar.') + '</p></li><li data-id="helpVButton-1" data-button="Next" data-options="tipLocation:right"><h2>' + _('Paste') + '</h2><p>' + _('The paste button is enabled then there are blocks copied onto the clipboard.') + '</p></li><li data-id="helpVButton-2" data-button="Next" data-options="tipLocation:right"><h2>' + _('Cartesian') + '</h2><p>' + _('Show or hide a Cartesian-coordinate grid.') + '</p></li><li data-id="helpVButton-3" data-button="Next" data-options="tipLocation:right"><h2>' + _('Polar') + '</h2><p>' + _('Show or hide a polar-coordinate grid.') + '</p></li><li data-id="helpVButton-4" data-button="Next" data-options="tipLocation:right"><h2>' + _('Load samples from server') + '</h2><p>' + _('This button open a viewer for loading example projects.') + '</p></li><li data-id="helpVButton-5" data-button="Next" data-options="tipLocation:right"><h2>' + _('Load project from file') + '</h2><p>' + _('You can also load projects from the file system.') + '</p></li><li data-id="helpVButton-6" data-button="Next" data-options="tipLocation:right"><h2>' + _('Load plugin from file') + '</h2><p>' + _('You can load new blocks from the file system.') + '</p></li><li data-id="helpVButton-7" data-button="Next" data-options="tipLocation: right"><h2>' + _('Delete all') + '</h2><p>' + _('Remove all content on the canvas, including the blocks.') + '</p></li><li data-id="helpVButton-0" data-button="Next" data-opt  ions="tipLocation:right"><h2>' + _('Undo') + '</h2><p>' + _('Restore blocks from the trash.') + '</p></li><li data-id="helpVButton-0" data-button="Next" data-options="tipLocation:right"><h2>' + _('Save project') + '</h2><p>' + _('Save your project to a server.') + '</p></li><li data-id="helpEnd" data-button="Close"><h2>' + _('Congratulations.') + '</h2><p>' + _('You have finished the tour. Please enjoy Turtle Blocks!') + '</p></li></ol>';
            }
            docById('tourData').innerHTML = content;
            settings = {
                autoStart: true,
                modal: true,
                expose: false
            }
            jQuery('#tour').joyride('destroy');
            jQuery('#tour').joyride(settings);
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

        function makeButton(name, x, y, size, rotation) {
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
                if (rotation !== undefined) {
                    bitmap.rotation = rotation;
                }

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

        function loadButtonDragHandler(container, ox, oy, action) {
            // Prevent multiple button presses (i.e., debounce).
            var locked = false;

            container.on('mousedown', function(event) {
                var moved = true;
                var offset = {
                    x: container.x - Math.round(event.stageX / blocks.scale),
                    y: container.y - Math.round(event.stageY / blocks.scale)
                };

                container.on('pressup', function(event) {
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
