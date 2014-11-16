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

define(function (require) {
    var activity = require('sugar-web/activity/activity');
    var icon = require('sugar-web/graphics/icon');
    require('easeljs');
    require('preloadjs');
    // require('activity/utils');
    require('activity/artwork');
    require('activity/munsell');
    require('activity/trash');
    require('activity/turtle');
    require('activity/palette');
    require('activity/blocks');
    require('activity/samplesviewer');
    require('activity/samples');
    require('activity/basicblocks');
    require('activity/advancedblocks');

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        // Colorize the activity icon.
        var activityButton = docById('activity-button');
        var colors;  // I should be getting the XO colors here?
        activity.getXOColor(function (error, colors) {
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

        var server = true;  // Are we running off of a server?
        var scale = 1;
        var stage;
        var turtles;
        var palettes;
        var blocks;
        var thumbnails;
        var thumbnailsVisible = false;
        var buttonsVisible = true;
        var currentKey = '';
        var currentKeyCode = 0;
        var lastKeyCode = 0;

        // default values
        var DEFAULTBACKGROUNDCOLOR = [70, 80, 20];
        var DEFAULTDELAY = 500;  // milleseconds

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
        var copyButton = docById('copy-button');
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

        var onscreenButtons = [];

        fastButton.onclick = function () {
            doFastButton();
        }

        function doFastButton() {
            turtleDelay = 0;
            runLogoCommands();
        }

        slowButton.onclick = function () {
            doSlowButton();
        }

        function doSlowButton() {
            turtleDelay = DEFAULTDELAY;
            runLogoCommands();
        }

        var stopTurtle = false;
        stopTurtleButton.onclick = function () {
            doStopTurtle();
        }

        function doStopButton() {
            doStopTurtle();
        }

        paletteButton.onclick = function () {
            changePaletteVisibility();
        }

        blockButton.onclick = function () {
            changeBlockVisibility();
        }

        clearButton.onclick = function () {
            allClear();
        }

        var cartesianVisible = false;
        cartesianButton.onclick = function () {
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
        polarButton.onclick = function () {
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

        copyButton.onclick = function () {
            selectStackToCopy();
        }

        pasteButton.onclick = function () {
            pasteStack();
        }

        samplesButton.onclick = function () {
            doOpenSamples();
        }

        openButton.onclick = function () {
            doOpen();
        }

        saveButton.onclick = function () {
            doSave();
        }

        // Make the activity stop with the stop button.
        var stopButton = docById('stop-button');
        stopButton.addEventListener('click', function (e) {
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
        var msgContainer = null;
        var msgBlock = null;
        var msgText = null;

        // ErrorMsg block
        var errorMsgContainer = null;
        var errorMsgBlock = null;
        var errorMsgText = null;

        // Get things started
        init();

        function init() {
            docById('loader').className = 'loader';

            stage = new createjs.Stage(canvas);
            createjs.Touch.enable(stage);
            createjs.Ticker.addEventListener('tick', tick);
            trashcan = new Trashcan(canvas, stage, refreshCanvas, restoreTrash, sendAllToTrash);
            turtles = new Turtles(canvas, stage, refreshCanvas);
            palettes = initPalettes(canvas, stage, refreshCanvas);
            blocks = new Blocks(canvas, stage, refreshCanvas, trashcan);
            palettes.setBlocks(blocks);
            turtles.setBlocks(blocks);
            blocks.setTurtles(turtles);
            blocks.setLogo(runLogoCommands);
            thumbnails = new SamplesViewer(canvas, stage, refreshCanvas, doOpenSamples, loadProject, sendAllToTrash);
            initBasicProtoBlocks(palettes, blocks);
            initAdvancedProtoBlocks(palettes, blocks);

            // Set up a file chooser for the doOpen function.
            this.fileChooser = docById("myOpenFile");

            // FIXME: won't allow selecting same file twice in a row
            // since there is no "change" event.
            this.fileChooser.addEventListener("change", function(event) {

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
            createjs.Touch.enable(stage);
            // Keep tracking the mouse even when it leaves the canvas.
            stage.mouseMoveOutside = true;
            // Enabled mouse over and mouse out events.
            stage.enableMouseOver(10); // default is 20

            var cartesian = new Image();
            cartesian.src = 'images/Cartesian.svg';
            var container = new createjs.Container();
            stage.addChild(container);

            cartesianBitmap = new createjs.Bitmap(cartesian);
            container.addChild(cartesianBitmap);
            cartesianBitmap.cache(0, 0, 1200, 900);

            cartesianBitmap.x = (canvas.width - 1200) / 2;
            cartesianBitmap.y = (canvas.height - 900) / 2;
            cartesianBitmap.scaleX = cartesianBitmap.scaleY = cartesianBitmap.scale = 1;
            cartesianBitmap.visible = false;
            cartesianBitmap.updateCache();

            var polar = new Image();
            polar.src = 'images/polar.svg';
            var container = new createjs.Container();
            stage.addChild(container);

            polarBitmap = new createjs.Bitmap(polar);
            container.addChild(polarBitmap);
            polarBitmap.cache(0, 0, 1200, 900);

            polarBitmap.x = (canvas.width - 1200) / 2;
            polarBitmap.y = (canvas.height - 900) / 2;
            polarBitmap.scaleX = polarBitmap.scaleY = polarBitmap.scale = 1;
            polarBitmap.visible = false;
            polarBitmap.updateCache();

            msgContainer = new createjs.Container();
            stage.addChild(msgContainer);
            msgContainer.x = (canvas.width - 1000) / 2;
            msgContainer.y = 110;
            msgContainer.visible = false;

            var DOMURL = window.URL || window.webkitURL || window;
            var img = new Image();
            var svg = new Blob([MSGBLOCK.replace('fill_color', '#ffffff').replace('stroke_color', '#7a7a7a')], {type: 'image/svg+xml;charset=utf-8'});
            var url = DOMURL.createObjectURL(svg);
            img.onload = function () {
                msgBlock = new createjs.Bitmap(img);
                DOMURL.revokeObjectURL(url);
                msgContainer.addChild(msgBlock);
                msgText = new createjs.Text('your message here', '20px Arial', '#000000');
                msgContainer.addChild(msgText);
                msgText.textAlign = 'center';
                msgText.textBaseline = 'alphabetic';
                msgText.x = 500;
                msgText.y = 30;
                var bounds = msgContainer.getBounds();
                msgContainer.cache(bounds.x, bounds.y, bounds.width, bounds.height);
                var hitArea = new createjs.Shape();
                hitArea.graphics.beginFill('#FFF').drawRect(0, 0, 1000, 42);
                hitArea.x = 0;
                hitArea.y = 0;
                msgContainer.hitArea = hitArea;

                msgContainer.on('click', function(event) {
                    msgContainer.visible = false;
                    update = true;
                });
            }
            img.src = url;

            errorMsgContainer = new createjs.Container();
            stage.addChild(errorMsgContainer);
            errorMsgContainer.x = (canvas.width - 1000) / 2;
            errorMsgContainer.y = 110;
            errorMsgContainer.visible = false;

            var DOMURL = window.URL || window.webkitURL || window;
            var img = new Image();
            var svg = new Blob([MSGBLOCK.replace('fill_color', '#ffcbc4').replace('stroke_color', '#ff0031')], {type: 'image/svg+xml;charset=utf-8'});
            var url = DOMURL.createObjectURL(svg);
            img.onload = function () {
                errorMsgBlock = new createjs.Bitmap(img);
                DOMURL.revokeObjectURL(url);
                errorMsgContainer.addChild(errorMsgBlock);
                errorMsgText = new createjs.Text('your message here', '20px Arial', '#000000');
                errorMsgContainer.addChild(errorMsgText);
                errorMsgText.textAlign = 'center';
                errorMsgText.textBaseline = 'alphabetic';
                errorMsgText.x = 500;
                errorMsgText.y = 30;
                var bounds = errorMsgContainer.getBounds();
                errorMsgContainer.cache(bounds.x, bounds.y, bounds.width, bounds.height);
                var hitArea = new createjs.Shape();
                hitArea.graphics.beginFill('#FFF').drawRect(0, 0, 1000, 42);
                hitArea.x = 0;
                hitArea.y = 0;
                errorMsgContainer.hitArea = hitArea;

                errorMsgContainer.on('click', function(event) {
                    errorMsgContainer.visible = false;
                    update = true;
                });
            }
            img.src = url;

            var URL = window.location.href;
            console.log(URL);
            var projectName = null;
            if (URL.substr(0, 4) == 'file') {
                server = false;
                saveButton.style.visibility = 'hidden';
            } else {
                server = true;
                stopButton.style.visibility = 'hidden';
            }

            // Scale the canvas relative to the screen size.
            onResize();

            if (onAndroid || !onXO) {
                setupAndroidToolbar();
            } else {
                var saveName = docById('mySaveName');
                saveName.style.visibility = 'hidden';
            }

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
            });

            stage.on('stagemouseup', function(event) {
                stageMouseDown = false;
            });

            this.document.onkeydown = keyPressed;
        }

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
                case 69:  // 'E'
                    allClear();
                    break;
                case 82:  // 'R'
                    doFastButton();
                    break;
                case 83:  // 'S'
                    doStopTurtle();
                    break;
                }
            } else if (event.ctrlKey) {
            } else {
                switch(event.keyCode) {
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
            // scale = Math.min(w / canvas.width, h / canvas.height);
            // scale = w / canvas.width;
            if (w > h) {
                scale = Math.max(w / 1200, 1.0);
                stage.canvas.width = 1200 * scale;
                stage.canvas.height = 900 * scale
            } else {
                scale = w / 900;
                stage.canvas.width = Math.max(900 * scale, 1.0);
                stage.canvas.height = 1200 * scale
            }
            stage.scaleX = scale;
            stage.scaleY = scale;
            // stage.canvas.width = canvas.width * scale;
            // stage.canvas.height = canvas.height * scale
            window.scrollTo(Math.floor((stage.canvas.width - w) / 2), Math.floor((stage.canvas.height - h) / 2));

            console.log('Resize: scale ' + scale + ', windowW ' + w + ', windowH ' + h + ', canvasW ' + canvas.width + ', canvasH ' + canvas.height + ', screenW ' + screen.width + ', screenH ' + screen.height);

            turtles.setScale(scale);
            blocks.setScale(scale);
            palettes.setScale(scale);
        }

        window.onresize = function()
        {
            onResize();
        }

        function restoreTrash() {
            var dx = -110;
            var dy = 55;
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

        function sendAllToTrash(addStartBlock) {
            var dx = 2000;
            var dy = 55;
            for (var blk in blocks.blockList) {
                blocks.blockList[blk].trash = true;
                blocks.moveBlockRelative(blk, dx, dy);
                blocks.blockList[blk].hide();
                if (blocks.blockList[blk].name == 'start') {
                    turtle = blocks.blockList[blk].value;
                    turtles.turtleList[turtle].trash = true;
                    turtles.turtleList[turtle].container.visible = false;
                }
            }
            if (addStartBlock) {
                blocks.makeNewBlock('start');
                last(blocks.blockList).x = 50;
                last(blocks.blockList).y = 50;
                last(blocks.blockList).connections = [null, null, null];
                turtles.add(last(blocks.blockList));
                last(blocks.blockList).value = turtles.turtleList.length - 1;
            }
            // Overwrite session data too.
            console.log('overwriting session data');
            if(typeof(Storage) !== "undefined") {
                localStorage.setItem('sessiondata', prepareExport());
                // console.log(localStorage.getItem('sessiondata'));
            } else {
                // Sorry! No Web Storage support..
            }

            blocks.updateBlockPositions();
            blocks.updateBlockLabels();

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
            //
            stopTurtle = true;
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

        function doOpenSamples() {
            if (thumbnailsVisible) {
                thumbnails.hide();
                thumbnailsVisible = false;
                showBlocks();
            } else {
                thumbnailsVisible = true;
                hideBlocks();
                stage.swapChildren(thumbnails.container, last(stage.children));
                thumbnails.show(scale);
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
            if (fileExt(projectName) != 'tb') {
                projectName += '.tb';
            }
            try {
                // Post the project
                var returnValue = httpPost(projectName, prepareExport());

                var svgData = doSVG(canvas, turtles, 320, 240, 320 / canvas.width);
                // var returnSVGValue = httpPost(projectName.replace('.tb', '.svg'), svgData);
                var DOMURL = window.URL || window.webkitURL || window;
                var image = new Image();
                var svg = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
                var url = DOMURL.createObjectURL(svg);
                image.onload = function() {
                    var bitmap = new createjs.Bitmap(image);
                    var bounds = bitmap.getBounds();
                    bitmap.cache(bounds.x, bounds.y, bounds.width, bounds.height);
                    // and base64-encoded png
                    httpPost(projectName.replace('.tb', '.b64'), bitmap.getCacheDataURL());
                    DOMURL.revokeObjectURL(url);
                }
                image.src = url;
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
            if(typeof(Storage) !== "undefined") {
                // localStorage is how we'll save the session (and metadata)
                sessionData = localStorage.getItem('sessiondata');
            }
            if (sessionData != null) {
                try {
                    console.log('restoring session');
                    var obj = JSON.parse(sessionData);
                    blocks.loadNewBlocks(obj);
                } catch (e) {
                }
            } else {
                console.log('loading start');
                blocks.makeNewBlock('start');
                blocks.blockList[0].x = 50;
                blocks.blockList[0].y = 50;
                blocks.blockList[0].connections = [null, null, null];
                blocks.blockList[0].value = turtles.turtleList.length;
                turtles.add(blocks.blockList[0]);
            }
            blocks.updateBlockPositions();
            blocks.updateBlockLabels();

            update = true;
        }

        // function addTurtle(myBlock) {
        //    turtles.add(myBlock);
        // }

        function errorMsg(msg) {
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

        function updateParameterBlock(turtle, blk) {
            // FIXME: how to autogenerate this list?
            if (blocks.blockList[blk].protoblock.parameter) {
                var value = 0;
                switch (blocks.blockList[blk].name) {
		case 'box':
                    var cblk = blocks.blockList[blk].connections[1];
                    var name = parseArg(turtle, cblk);
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
                default:
                    console.log('??? ' + blocks.blockList[blk].name);
                    break;
                }
                blocks.blockList[blk].text.text = Math.round(value).toString();
                blocks.blockList[blk].container.updateCache();
                update = true;
            }
        }

        function runLogoCommands(startHere) {
            // Save the state before running
            if(typeof(Storage) !== "undefined") {
                localStorage.setItem('sessiondata', prepareExport());
                // console.log(localStorage.getItem('sessiondata'));
            } else {
                // Sorry! No Web Storage support..
            }

            stopTurtle = false;
            blocks.unhighlightAll();
            blocks.bringToTop();  // Draw under blocks.
            errorMsgContainer.visible = false;  // hide the error message window
            msgContainer.visible = false;  // hide the message window

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
                        startBlocks.push(blocks.stackList[blk]);
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

            // (2) Execute the stack.
            // A bit complicated because we have lots of corner cases:
            if (startHere != null) {
                console.log('startHere is ' + blocks.blockList[startHere].name);
                // If a block to start from was passed, find its
                // associated turtle, i.e., which turtle should we use?
                var turtle = 0;
                if (blocks.blockList[startHere].name == 'start') {
                    var turtle = blocks.blockList[startHere].value;
                }
                console.log('starting on start with turtle ' + turtle);
                turtles.turtleList[turtle].queue = [];
                this.parentFlowQueue[turtle] = [];
                this.unhightlightQueue[turtle] = [];
                this.parameterQueue[turtle] = [];
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
                setTimeout(function(){runFromBlockNow(activity, turtle, blk);}, delay);
            }
        }

        function runFromBlockNow(activity, turtle, blk) {
            // Run a stack of blocks, beginning with blk.
            // (1) Evaluate any arguments (beginning with connection[1]);
            var args = [];
            if(blocks.blockList[blk].protoblock.args > 0) {
                for (var i = 1; i < blocks.blockList[blk].protoblock.args + 1; i++) {
                    args.push(parseArg(turtle, blocks.blockList[blk].connections[i]));
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
                for (i = 0; i < turtles.turtleList[turtle].queue.length; i++) {
                    var j = turtles.turtleList[turtle].queue.length - i - 1;
                    // FIXME: have a method for identifying these parents
                    if (['forever', 'repeat', 'while', 'until'].indexOf(blocks.blockList[turtles.turtleList[turtle].queue[j].parentBlk].name) != -1) {
                        turtles.turtleList[turtle].queue[j].count = 1;
                        break;
                    }
                }
                break;
            case 'wait':
                if (args.length == 1) {
                    doWait(turtle, args[0]);
                }
            case 'repeat':
                if (args.length == 2) {
                    childFlow = args[1];
                    childFlowCount = Math.floor(args[0]);
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
                    turtles.turtleList[turtle].doSetXY(args[0], args[1]);
                }
                break;
            case 'arc':
                 if (args.length == 2) {
                    turtles.turtleList[turtle].doArc(args[0], args[1]);
                }
                break;
            case 'forward':
                 if (args.length == 1) {
                    turtles.turtleList[turtle].doForward(args[0]);
                }
                break;
            case 'back':
                if (args.length == 1) {
                    turtles.turtleList[turtle].doForward(-args[0]);
                 }
                break;
            case 'right':
                if (args.length == 1) {
                    turtles.turtleList[turtle].doRight(args[0]);
                 }
                break;
            case 'left':
                if (args.length == 1) {
                    turtles.turtleList[turtle].doRight(-args[0]);
                 }
                break;
            case 'setheading':
                if (args.length == 1) {
                    turtles.turtleList[turtle].doSetHeading(args[0]);
                 }
                break;
            case 'show':
                if (args.length == 2) {
                    if (typeof(args[1]) == 'string') {
                        var len = args[1].length;
                        if (len > 10 && args[1].substr(0, 10) == 'data:image') {
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
                    turtles.turtleList[turtle].doTurtleShell(args[0], args[1]);
                 }
                break;
            case 'setcolor':
                if (args.length == 1) {
                    turtles.turtleList[turtle].doSetColor(args[0]);
                 }
                break;
            case 'setshade':
                if (args.length == 1) {
                    turtles.turtleList[turtle].doSetValue(args[0]);
                 }
                break;
            case 'setgrey':
                if (args.length == 1) {
                    turtles.turtleList[turtle].doSetChroma(args[0]);
                 }
                break;
            case 'setpensize':
                if (args.length == 1) {
                    turtles.turtleList[turtle].doSetPensize(args[0]);
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
            default:
                if (blocks.blockList[blk].name in evalFlowDict) {
                    eval(evalFlowDict[blocks.blockList[blk].name]);
                } else {
		    // Could be an arg block, so we need to print its value
		    if (blocks.blockList[blk].isArgBlock()) {
			args.push(parseArg(turtle, blk));
			msgContainer.visible = true;
			msgText.text = blocks.blockList[blk].value.toString();
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
                    setTimeout(function(){blocks.unhighlight(blk);}, turtleDelay + waitTime[turtle]);
                }

                if (last(blocks.blockList[blk].connections) == null) {
                    // If we are at the end of the child flow, queue
                    // the unhighlighting of the parent block to the
                    // flow.
                    if (activity.parentFlowQueue[turtle].length > 0 && turtles.turtleList[turtle].queue.length > 0 && last(turtles.turtleList[turtle].queue).parentBlk != last(activity.parentFlowQueue[turtle])) {
                        activity.unhightlightQueue[turtle].push(activity.parentFlowQueue[turtle].pop());
                    } else if (activity.unhightlightQueue[turtle].length > 0) {
                        // The child flow is finally complete, so unhighlight.
                        setTimeout(function(){blocks.unhighlight(activity.unhightlightQueue[turtle].pop());}, turtleDelay);
                    }
                }
                if (turtleDelay > 0) {
                    for (pblk in activity.parameterQueue[turtle]) {
                        updateParameterBlock(turtle, activity.parameterQueue[turtle][pblk]);
                    }
                }

                runFromBlock(activity, turtle, nextBlock);
            } else {
                // Nothing else to do... so cleaning up.
                if (turtles.turtleList[turtle].queue.length == 0 || blk != last(turtles.turtleList[turtle].queue).parentBlk) {
                   setTimeout(function(){blocks.unhighlight(blk);}, turtleDelay);
                }
                // Unhighlight any parent blocks still highlighted.
                for (var b in activity.parentFlowQueue[turtle]) {
                    blocks.unhighlight(activity.parentFlowQueue[turtle][b]);
                }
                // Make sure the turtles are on top.
                var lastChild = last(stage.children);
                for (var turtle = 0; turtle < turtles.turtleList.length; turtle++) {
                    stage.swapChildren(turtles.turtleList[turtle].Container, lastChild);
                }
                update = true;
            }
        }

        function parseArg(turtle, blk) {
            // Retrieve the value of a block.
            if (blk == null) {
                errorMsg('Missing argument');
                stopTurtle = true;
                return null
            }

            if (blocks.blockList[blk].protoblock.parameter) {
                if (this.parameterQueue[turtle].indexOf(blk) == -1) {
                    this.parameterQueue[turtle].push(blk);
                }
            }

            if (blocks.blockList[blk].isValueBlock()) {
                return blocks.blockList[blk].value;
            } else if (blocks.blockList[blk].isArgBlock()) {
                switch (blocks.blockList[blk].name) {
                case 'box':
                    var cblk = blocks.blockList[blk].connections[1];
                    var name = parseArg(turtle, cblk);
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
                    var a = parseArg(turtle, cblk);
                    if (a < 0) {
                        errorMsg('Cannot take square root of negative number.');
                        stopTurtle = true;
                        a = -a;
                    }
                    blocks.blockList[blk].value = (Math.sqrt(Number(a)));
                    break;
                case 'mod':
                    var cblk1 = blocks.blockList[blk].connections[1];
                    var cblk2 = blocks.blockList[blk].connections[2];
                    var a = parseArg(turtle, cblk1);
                    var b = parseArg(turtle, cblk2);
                    blocks.blockList[blk].value = (Number(a) % Number(b));
                    break;
                case 'greater':
                    var cblk1 = blocks.blockList[blk].connections[1];
                    var cblk2 = blocks.blockList[blk].connections[2];
                    var a = parseArg(turtle, cblk1);
                    var b = parseArg(turtle, cblk2);
                    blocks.blockList[blk].value = (Number(a) > Number(b));
                    break;
                case 'equal':
                    var cblk1 = blocks.blockList[blk].connections[1];
                    var cblk2 = blocks.blockList[blk].connections[2];
                    var a = parseArg(turtle, cblk1);
                    var b = parseArg(turtle, cblk2);
                    var result = (a == b);
                    blocks.blockList[blk].value = (a == b);
                    break;
                case 'less':
                    var cblk1 = blocks.blockList[blk].connections[1];
                    var cblk2 = blocks.blockList[blk].connections[2];
                    var a = parseArg(turtle, cblk1);
                    var b = parseArg(turtle, cblk2);
                    blocks.blockList[blk].value = (Number(a) < Number(b));
                    break;
                case 'random':
                    var cblk1 = blocks.blockList[blk].connections[1];
                    var cblk2 = blocks.blockList[blk].connections[2];
                    var a = parseArg(turtle, cblk1);
                    var b = parseArg(turtle, cblk2);
                    blocks.blockList[blk].value = doRandom(a, b);
                    break;
                case 'plus':
                    var cblk1 = blocks.blockList[blk].connections[1];
                    var cblk2 = blocks.blockList[blk].connections[2];
                    var a = parseArg(turtle, cblk1);
                    var b = parseArg(turtle, cblk2);
                    blocks.blockList[blk].value = doPlus(a, b);
                    break;
                case 'multiply':
                    var cblk1 = blocks.blockList[blk].connections[1];
                    var cblk2 = blocks.blockList[blk].connections[2];
                    var a = parseArg(turtle, cblk1);
                    var b = parseArg(turtle, cblk2);
                    blocks.blockList[blk].value = doMultiply(a, b);
                    break;
                case 'divide':
                    var cblk1 = blocks.blockList[blk].connections[1];
                    var cblk2 = blocks.blockList[blk].connections[2];
                    var a = parseArg(turtle, cblk1);
                    var b = parseArg(turtle, cblk2);
                    blocks.blockList[blk].value = doDivide(a, b);
                    break;
                case 'minus':
                    var cblk1 = blocks.blockList[blk].connections[1];
                    var cblk2 = blocks.blockList[blk].connections[2];
                    var a = parseArg(turtle, cblk1);
                    var b = parseArg(turtle, cblk2);
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
            var r = Math.floor(Math.random() * (Number(b) - Number(a) + 1) + Number(a));
            return Math.floor(Math.random() * (Number(b) - Number(a) + 1) + Number(a));
        }

        function doPlus(a, b) {
            r = Number(a) + Number(b);
            return Number(a) + Number(b);
        }

        function doMinus(a, b) {
            r = Number(a) - Number(b);
            return Number(a) - Number(b);
        }

        function doMultiply(a, b) {
            r = Number(a) * Number(b);
            return Number(a) * Number(b);
        }

        function doDivide(a, b) {
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
            errorMsgContainer.visible = false;
            msgContainer.visible = false;
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

        function selectStackToCopy() {
            // TODO: something with the cursor
            blocks.selectingStack = true;
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

        function doSave() {
            // FIXME: show input form and then save after name has been entered

            // Save file to turtle.sugarlabs.org
            var titleElem = docById("title");
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

        function setupAndroidToolbar() {
            var toolbar = docById("main-toolbar");
            toolbar.style.display = "none";

            // Upper left
            var container = makeButton('fast-button', 0, 0);
            loadFastButtonHandler(container, doFastButton);
            onscreenButtons.push(container);
            var container = makeButton('slow-button', 55, 0);
            loadFastButtonHandler(container, doSlowButton);
            onscreenButtons.push(container);
            var container = makeButton('stop-turtle-button', 110, 0);
            loadFastButtonHandler(container, doStopButton);
            onscreenButtons.push(container);
            var container = makeButton('clear-button', 165, 0);
            loadFastButtonHandler(container, allClear);
            onscreenButtons.push(container);
            var container = makeButton('palette-button', 220, 0);
            loadFastButtonHandler(container, changePaletteVisibility);
            onscreenButtons.push(container);
            var container = makeButton('hide-blocks-button', 275, 0);
            loadFastButtonHandler(container, changeBlockVisibility);
            onscreenButtons.push(container);
            // Lower right
            var container = makeButton('copy-button', 1135, 515);
            loadFastButtonHandler(container, selectStackToCopy);
            onscreenButtons.push(container);
            var container = makeButton('paste-button', 1135, 570);
            loadFastButtonHandler(container, pasteStack);
            onscreenButtons.push(container);
            var container = makeButton('Cartesian-button', 1135, 625);
            loadFastButtonHandler(container, doCartesian);
            onscreenButtons.push(container);
            var container = makeButton('polar-button', 1135, 680);
            loadFastButtonHandler(container, doPolar);
            onscreenButtons.push(container);
            var container = makeButton('samples-button', 1135, 735);
            loadFastButtonHandler(container, doOpenSamples);
            onscreenButtons.push(container);
            var container = makeButton('open-button', 1135, 790);
            loadFastButtonHandler(container, doOpen);
            onscreenButtons.push(container);
            if (server) {
                var container = makeButton('save-button', 1135, 845);
                loadFastButtonHandler(container, doSave);
                onscreenButtons.push(container);

                var saveName = docById('mySaveName');
                saveName.style.position = 'absolute';
                var left = 970 * scale;
                saveName.style.left = canvas.offsetLeft + left + '1000px';
                var top = 815 * scale;
                saveName.style.top = canvas.offsetTop + top + 'px';
            } else {
                var saveName = docById('mySaveName');
                saveName.style.visibility = 'hidden';
            }

        }

        function toggleToolbar() {
            if (buttonsVisible) {
                buttonsVisible = false;
                if (onAndroid || !onXO) {
                    for (button in onscreenButtons) {
                        onscreenButtons[button].visible = false;
                    }
                } else {
                    var toolbar = docById("main-toolbar");
                    toolbar.style.display = "none";
                }
            } else {
                buttonsVisible = true;
                if (onAndroid || !onXO) {
                    for (button in onscreenButtons) {
                        onscreenButtons[button].visible = true;
                    }
                } else {
                    var toolbar = docById("main-toolbar");
                    toolbar.style.display = "inline";
                }
            }
            update = true;
        }

        function makeButton(name, x, y) {
            var image = new Image();
            image.src = 'icons/' + name + '.svg';
            var container = new createjs.Container();
            stage.addChild(container);
            bitmap = new createjs.Bitmap(image);
            container.addChild(bitmap);
            var hitArea = new createjs.Shape();
            var w2 = 55;
            var h2 = 55;
            hitArea.graphics.beginFill('#FFF').drawEllipse(-w2 / 2, -h2 / 2, w2, h2);
            hitArea.x = w2 / 2;
            hitArea.y = h2 / 2;
            container.hitArea = hitArea;
            bitmap.cache(0, 0, 55, 55);
            bitmap.updateCache();
            container.x = x;
            container.y = y;
            update = true;
            return container;
        }

        function loadFastButtonHandler(container, action) {
            container.on('click', function(event) {
                action();
            });
        }

    });

});


function httpGet(projectName)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();

    if (projectName == null) {
        xmlHttp.open("GET", 'https://turtle.sugarlabs.org/server', false);
        xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
    } else {
        xmlHttp.open("GET", 'https://turtle.sugarlabs.org/server/' + projectName, false);
        xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
        // xmlHttp.setRequestHeader('x-project-id', projectName);
    }
    xmlHttp.send();
    return xmlHttp.responseText;
}


function httpPost(projectName, data)
{
    var xmlHttp = null;
    console.log('sending ' + data);
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", 'https://turtle.sugarlabs.org/server/' + projectName, false);
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
    for (var t in turtles.turtleList) {
        svg += turtles.turtleList[t].svgOutput;
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
    if (parts.length == 1 ) {
        return parts[0];
    } else if (parts[0] == '' && parts.length == 2) {
        return file;
    } else {
        parts.pop(); // throw away suffix
        return parts.join('.');
    }
}
