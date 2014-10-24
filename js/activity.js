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

define(function (require) {
    var activity = require('sugar-web/activity/activity');
    var icon = require('sugar-web/graphics/icon');
    require('easel');
    require('activity/utils');
    require('activity/munsell');
    require('activity/turtle');
    require('activity/palette');
    require('activity/blocks');  

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        // Colorize the activity icon.
        var activityButton = document.getElementById('activity-button');
        var colors;  // I should be getting the XO colors here?
        activity.getXOColor(function (error, colors) {
            icon.colorize(activityButton, colors);
        });

	//
        var canvas = document.getElementById('myCanvas');
	var stage;
	var turtles;
	var palettes;
	var blocks;

	// default values
	var defaultBackgroundColor = [70, 80, 20];
	var defaultDelay = 1000;  // MS

	var turtleDelay = defaultDelay;

        var fastButton = document.getElementById('fast-button');
        fastButton.onclick = function () {
	    turtleDelay = 1;
	    runLogoCommands();
        }

        var slowButton = document.getElementById('slow-button');
        slowButton.onclick = function () {
	    turtleDelay = defaultDelay;
	    runLogoCommands();
        }

	var blocksVisible = true;
        var blockButton = document.getElementById('block-button');
        blockButton.onclick = function () {
	    changeBlockVisibility();
        }

        var clearButton = document.getElementById('clear-button');
        clearButton.onclick = function () {
	    allClear();
	}

	var cartesianVisible = false;
        var cartesianButton = document.getElementById('cartesian-button');
        cartesianButton.onclick = function () {
	    if (cartesianVisible) {
		hideCartesian();
		cartesianVisible = false;
	    } else {
		showCartesian();
		cartesianVisible = true;
	    }
        }

	var polarVisible = false;
        var polarButton = document.getElementById('polar-button');
        polarButton.onclick = function () {
	    if (polarVisible) {
		hidePolar();
		polarVisible = false;
	    } else {
		showPolar();
		polarVisible = true;
	    }
        }

        var openButton = document.getElementById('open-button');
        openButton.onclick = function () {
	    doOpen();
	}

        var saveButton = document.getElementById('save-button');
        saveButton.onclick = function () {
	    doSave();
	}

        // Make the activity stop with the stop button.
        var stopButton = document.getElementById('stop-button');
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
	var canvasColor = getMunsellColor(
	    defaultBackgroundColor[0], defaultBackgroundColor[1], defaultBackgroundColor[2]);
	setBackgroundColor(-1);
	// then set default canvas color.
	canvasColor = getMunsellColor(defaultColor, defaultValue, defaultChroma);

	// 
	var time = 0;
	// Coordinate grid
        var cartesianBitmap = null;
	// Polar grid
        var polarBitmap = null;
	// Trash
	var trashBitmap = null;

	// Get things started
	init();

        function init() {
            document.getElementById('loader').className = 'loader';

            // Check to see if we are running in a browser with touch support.
            stage = new createjs.Stage(canvas);
	    turtles = new Turtles(canvas, stage, refreshCanvas, addTick);
	    palettes = initPalettes();
	    blocks = new Blocks(canvas, stage, refreshCanvas, addTick);
	    palettes.setBlocks(blocks);
	    turtles.setBlocks(blocks);
	    blocks.setTurtles(turtles);
	    blocks.setLogo(runLogoCommands);
	    initProtoBlocks(palettes, blocks);

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

            cartesianBitmap.x = 0;
            cartesianBitmap.y = 0;
            cartesianBitmap.scaleX = cartesianBitmap.scaleY = cartesianBitmap.scale = 1;
            cartesianBitmap.name = 'bmp_cartesian';

            document.getElementById('loader').className = '';
	    addTick();
	    cartesianBitmap.visible = false;

	    var polar = new Image();
	    polar.src = 'images/polar.svg';
            var container = new createjs.Container();
            stage.addChild(container);

            polarBitmap = new createjs.Bitmap(polar);
            container.addChild(polarBitmap);

            polarBitmap.x = 0;
            polarBitmap.y = 0;
            polarBitmap.scaleX = polarBitmap.scaleY = polarBitmap.scale = 1;
            polarBitmap.name = 'bmp_polar';

            document.getElementById('loader').className = '';
	    addTick();
	    polarBitmap.visible = false;

	    var trash = new Image();
	    trash.src = 'images/trash.svg';
	    trash.onload = handleTrashLoad;

	    var urlParts = window.location.href.split('?');
	    var projectURL = urlParts[1].split('=')[1];
	    if(projectURL) {
		console.log('load ' + projectURL);
		loadProject(projectURL);
	    } else {
		console.log('load start');
		loadStart();
	    }

	    // Make sure blocks are aligned.
	    blocks.findStacks();
	    for (i = 0; i < blocks.stackList.length; i++) {
		blocks.findDragGroup(blocks.stackList[i]);
		blocks.adjustBlockPositions();
	    }
        }

	function changeBlockVisibility() {
	    if (blocks.blocksVisible) {
		hideBlocks();
		blocks.blocksVisible = false;
	    } else {
		showBlocks();
		blocks.blocksVisible = true;
	    }
	}

        function stop() {
	    //
            createjs.Ticker.removeEventListener('tick', tick);
        }

	function refreshCanvas() {
	    update = true;
	}

	function addTick() {
	    createjs.Ticker.addEventListener('tick', tick);
	}

        function handleTrashLoad(event) {
	    // Load the trashcan
            var image = event.target;
            var imgW = image.width;
            var imgH = image.height;
            var bitmap;
            var container = new createjs.Container();
            stage.addChild(container);

            bitmap = new createjs.Bitmap(image);
	    trashBitmap = bitmap;
            container.addChild(bitmap);

	    // TODO: change state of trashcan if there is content in it.
	    // TODO: empty trash?
	    // TODO: restore from trash.

            bitmap.x = canvas.width - image.width;
            bitmap.y = 0;
            bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;
            bitmap.name = 'bmp_trash';

            document.getElementById('loader').className = '';
	    addTick();
	    bitmap.visible = true;
        }

	function overTrashCan(x, y) {
	    if (x < trashBitmap.x) {
		return false;
	    } else if (x > trashBitmap.x + trashBitmap.width) {
		return false;
	    }
	    if (y < trashBitmap.y) {
		return false;
	    } else if (y > trashBitmap.y + trashBitmap.height) {
		return false;
	    }
	    return true;
	}

        function tick(event) {
            // This set makes it so the stage only re-renders when an
            // event handler indicates a change has happened.
            if (update) {
                update = false; // Only update once
                stage.update(event);
            }
        }

	function httpGet(theUrl)
	{
	    var xmlHttp = null;
	    
	    xmlHttp = new XMLHttpRequest();
	    xmlHttp.open( "GET", theUrl, false );
	    xmlHttp.send();
	    return xmlHttp.responseText;
	}

	function loadProject(projectURL) {
	    palettes.updatePalettes();

	    var rawData = httpGet(projectURL);
	    var cleanData = rawData.replace('\n', ' ');
	    var obj = JSON.parse(cleanData);
	    // console.log(obj);
	    loadBlocks(obj);

	    update = true;
	}

	function loadStart() {
	    // where to put this?
	    palettes.updatePalettes();

	    // Always start with a start block.
	    blocks.makeNewBlock('start');
	    blocks.blockList[0].x = 50;
	    blocks.blockList[0].y = 50;
	    blocks.blockList[0].connections = [null, null, null];
	    turtles.add();

	    blocks.updateBlockImages();
	    blocks.updateBlockLabels();

	    update = true;
	}

	function addTurtle() {
	    turtles.add();
	}

        function loadBlocks(blockObjs) {
	    // Append to the current set of blocks.
	    var adjustTheseDocks = [];
	    var blockOffset = blocks.blockList.length;

	    for(var b = 0; b < blockObjs.length; b++) {
		var thisBlock = blockOffset + b;
		var blkData = blockObjs[b];
		if (typeof(blkData[1]) == 'string') {
		    var name = blkData[1];
		    var value = null;
		} else {
		    var name = blkData[1][0];
		    var value = blkData[1][1];
		}
		console.log(thisBlock + ' ' + name + ' ' + value);
		switch(name) {
		case 'start':
		    blocks.makeNewBlock('start');
		    blocks.blockList[thisBlock].connections.push(null);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].connections.push(null);
		    turtles.add();
		    break;
		case 'do':
		case 'stack':
		    blocks.makeNewBlock('do');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'storein':
		    blocks.makeNewBlock('storein');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    pushConnection(blkData[4][3], blockOffset, thisBlock);
		    break;
		case 'box':
		    blocks.makeNewBlock('box');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'action':
		case 'hat':
		    blocks.makeNewBlock('action');
		    blocks.blockList[thisBlock].connections.push(null);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].connections.push(null);
		    break;
                case 'repeat':
		    blocks.makeNewBlock('repeat');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    pushConnection(blkData[4][3], blockOffset, thisBlock);
		    break;
		case 'vspace':
		    blocks.makeNewBlock('vspace');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'clear':
		case 'clean':
		    blocks.makeNewBlock('clear');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
                case 'setxy':
		case 'setxy2':
		    blocks.makeNewBlock('setxy');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    pushConnection(blkData[4][3], blockOffset, thisBlock);
		    break;
                case 'arc':
		    blocks.makeNewBlock('arc');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    pushConnection(blkData[4][3], blockOffset, thisBlock);
		    break;
		case 'publish':
		    blocks.makeNewBlock('publish');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'forward':
		    blocks.makeNewBlock('forward');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'back':
		    blocks.makeNewBlock('back');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'left':
		    blocks.makeNewBlock('left');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'right':
		    blocks.makeNewBlock('right');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'setheading':
		case 'seth':
		    blocks.makeNewBlock('setheading');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'heading':
		    blocks.makeNewBlock('heading');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'x':
		case 'xcor':
		    blocks.makeNewBlock('x');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'y':
		case 'ycor':
		    blocks.makeNewBlock('y');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'show':
		    blocks.makeNewBlock('show');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'image':
		    blocks.makeNewBlock('image');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'mod':
		    blocks.makeNewBlock('mod');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'greater':
		case 'greater2':
		    blocks.makeNewBlock('greater');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'less':
		case 'less2':
		    blocks.makeNewBlock('less');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'equal':
		case 'equal2':
		    blocks.makeNewBlock('equal');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'sqrt':
		    blocks.makeNewBlock('sqrt');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'plus':
		case 'plus2':
		    blocks.makeNewBlock('plus');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'random':
		case 'random2':
		    blocks.makeNewBlock('random');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'multiply':
		case 'product2':
		    blocks.makeNewBlock('multiply');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'divide':
		case 'division2':
		    blocks.makeNewBlock('divide');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'minus':
		case 'minus2':
		    blocks.makeNewBlock('minus');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'color':
		case 'hue':
		    blocks.makeNewBlock('color');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'setcolor':
		case 'sethue':
		    blocks.makeNewBlock('setcolor');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'value':
		case 'shade':
		    blocks.makeNewBlock('shade');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'setvalue':
		case 'setshade':
		    blocks.makeNewBlock('setshade');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'gray':
		case 'grey':
		    blocks.makeNewBlock('chroma');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'setgray':
		case 'setgrey':
		case 'setchroma':
		    blocks.makeNewBlock('setchroma');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'pensize':
		    blocks.makeNewBlock('pensize');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'setpensize':
		    blocks.makeNewBlock('setpensize');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'penup':
		    blocks.makeNewBlock('penup');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'pendown':
		    blocks.makeNewBlock('pendown');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'startfill':
		case 'beginfill':
		    blocks.makeNewBlock('startfill');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'stopfill':
		case 'endfill':
		    blocks.makeNewBlock('endfill');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'fillscreen':
		case 'setbackgroundcolor':
		    blocks.makeNewBlock('background');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'number':
		    blocks.makeNewBlock('number');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = value;
		    blocks.updateBlockText(thisBlock);
		    break;
		case 'text':
		case 'string':
		    blocks.makeNewBlock('text');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = value;
		    blocks.updateBlockText(thisBlock);
		    break;
		case 'red':
		case 'white':
		    blocks.makeNewBlock('number');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = 0;
		    blocks.updateBlockText(thisBlock);
		    break;
		case 'orange':
		    blocks.makeNewBlock('number');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = 10;
		    blocks.updateBlockText(thisBlock);
		    break;
		case 'yellow':
		    blocks.makeNewBlock('number');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = 20;
		    blocks.updateBlockText(thisBlock);
		    break;
		case 'green':
		    blocks.makeNewBlock('number');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = 40;
		    blocks.updateBlockText(thisBlock);
		    break;
		case 'blue':
		    blocks.makeNewBlock('number');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = 70;
		    blocks.updateBlockText(thisBlock);
		    break;
		case 'leftpos':
		    blocks.makeNewBlock('number');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = -(canvas.width / 2);
		    blocks.updateBlockText(thisBlock);
		    break;
		case 'rightpos':
		    blocks.makeNewBlock('number');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = (canvas.width / 2);
		    blocks.updateBlockText(thisBlock);
		    break;
		case 'toppos':
		    blocks.makeNewBlock('number');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = (canvas.height / 2);
		    blocks.updateBlockText(thisBlock);
		    break;
		case 'botpos':
		case 'bottompos':
		    blocks.makeNewBlock('number');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = -(canvas.height / 2);
		    blocks.updateBlockText(thisBlock);
		    break;
		case 'width':
		    blocks.makeNewBlock('number');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = canvas.width;
		    blocks.updateBlockText(thisBlock);
		    break;
		case 'height':
		    blocks.makeNewBlock('number');
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blocks.blockList[thisBlock].value = canvas.height;
		    blocks.updateBlockText(thisBlock);
		    break;
		default:
		    console.log('No factory for ' + name);
                    break;
		}
		if (thisBlock == blocks.blockList.length - 1) {
		    if (blocks.blockList[thisBlock].connections[0] == null) {
			blocks.blockList[thisBlock].x = blkData[2];
			blocks.blockList[thisBlock].y = blkData[3];
			adjustTheseDocks.push(thisBlock);
		    }
		}
	    }
	    blocks.updateBlockImages();
	    blocks.updateBlockLabels();
	    for (var blk = 0; blk < adjustTheseDocks.length; blk++) {
		blocks.loopCounter = 0;
		blocks.adjustDocks(adjustTheseDocks[blk]);
	    }

	    update = true;

	    // We need to wait for the blocks to load before expanding them.
	    setTimeout(function(){blocks.expandClamps();}, 1000); 
	    setTimeout(function(){blocks.expand2Args();}, 2000); 
        }

        function pushConnection(connection, blockOffset, blk) {
	    if (connection == null) {
		    blocks.blockList[blk].connections.push(null);
	    } else {
		connection += blockOffset;
		blocks.blockList[blk].connections.push(connection);
	    }
	}

        function runLogoCommands(startHere) {
	    // We run the logo commands here.
	    var d = new Date();
	    time = d.getTime();

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
		turtles.turtleList[turtle].container.y = turtles.invertY(turtles.turtleList[turtle].y);
	    }

	    // Execute turtle code here...  Find the start block
	    // (or the top of each stack) and build a list of all of
	    // the named action stacks (wishing I had a Python
	    // dictionary about now.)
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
		    // does the action stack have a name?
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

	    // (2) Execute the stack.
	    if (startHere != null) {
		// Which turtle should we use?
		var i = 0;
		if (blocks.blockList[startHere].name == 'start') {
		    var i = startBlocks.indexOf(startHere);
		}
		turtles.turtleList[i].queue = [];
		runFromBlock(i, startHere);
	    } else if (startBlocks.length > 0) {
		for (var turtle = 0; turtle < startBlocks.length; turtle++) {
		    turtles.turtleList[turtle].queue = [];
		    runFromBlock(turtle, startBlocks[turtle]);
		}
	    } else {
		for (var blk = 0; blk < blocks.stackList.length; blk++) {
		    if (blocks.isNoRunBlock(blk)) {
			continue;
		    } else {
			if (!blocks.blockList[blocks.stackList[blk]].trash) {
			    runFromBlock(0, blocks.stackList[blk]);
			}
		    }
		}
	    }
            update = true;
        }

	function runFromBlock(thisTurtle, blk) { 
	    if (blk == null) {
		return;
	    }
	    setTimeout(function(){runFromBlockNow(thisTurtle, blk);}, turtleDelay);
	}

        function runFromBlockNow(turtle, blk) {
	    // Run a stack of blocks, beginning with blk.
	    // (1) Evaluate any arguments (beginning with connection[1]);
	    var args = [];
	    if(blocks.blockList[blk].protoblock.args > 0) {
		for (var i = 1; i < blocks.blockList[blk].protoblock.args + 1; i++) {
		    args.push(parseArg(turtle, blocks.blockList[blk].connections[i]));
		}
	    }

	    // (2) Run function associated with the block;

	    // All flow blocks have a nextFlow, but it can be null
	    // (end of flow)
	    var nextFlow = last(blocks.blockList[blk].connections);
	    if (nextFlow != null) {
		var queueBlock = new Queue(nextFlow, 1);
		turtles.turtleList[turtle].queue.push(queueBlock);
	    }
	    // Some flow blocks have childflows, e.g., repeat
	    var childFlow = null;
	    var childFlowCount = 0;

	    if (turtleDelay > 0) {
		blocks.highlight(blk);
	    }

	    switch (blocks.blockList[blk].name) {
	    case 'start':
 		if (args.length == 1) {
		    childFlow = args[0];
		    childFlowCount = 1;
		}
		break;
	    case 'publish':
 		if (args.length == 1) {
		    doPublish(args[0]);
		}
		break;
	    case 'do':
 		if (args.length == 1) {
		    for (i = 0; i < actionList.length; i++) {
			if (actionList[i][0] == args[0]) {
			    childFlow = actionList[i][1];
			    childFlowCount = 1;
			    break;
			}
		    }
		}
		break;
	    case 'repeat':
 		if (args.length == 2) {
		    childFlow = args[1];
		    childFlowCount = args[0];
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
		    turtles.turtleList[turtle].doShowText(args[0], args[1]);
         	}
		break;
	    case 'image':
		if (args.length == 2) {
		    turtles.turtleList[turtle].doShowImage(args[0], args[1]);
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
	    }

	    // (3) Queue block below this block.

	    // If there is a childFlow, queue it.
	    if (childFlow != null) {
		var queueBlock = new Queue(childFlow, childFlowCount);
		turtles.turtleList[turtle].queue.push(queueBlock);
	    }

	    var nextBlock = null;
	    // Run the last flow in the queue.
	    if (turtles.turtleList[turtle].queue.length > 0) {
		nextBlock = last(turtles.turtleList[turtle].queue).blk;
		if(last(turtles.turtleList[turtle].queue).count == 1) {
		    // Finished child so pop it off the queue.
		    turtles.turtleList[turtle].queue.pop();
		} else {
		    // Decrement the counter.
		    last(turtles.turtleList[turtle].queue).count -= 1;
		}
	    }
	    if (nextBlock != null) {
		runFromBlock(turtle, nextBlock);
	    } else {
		setTimeout(function(){blocks.unhighlight(blk);}, turtleDelay);
		// FIXME
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
		activity.showAlert('WARNING',
				   'missing argument', null,
				   function() {});
		return null
	    } else if (blocks.isValueBlock(blk)) {
		return blocks.blockList[blk].value;
	    } else if (blocks.isArgBlock(blk)) {
		switch (blocks.blockList[blk].name) {
		case 'box':
		    var cblk = blocks.blockList[blk].connections[1];
		    var name = parseArg(turtle, cblk);
		    var i = findBox(name);
		    if (i == null) {
			blocks.blockList[blk].value = null;
		    } else {
			blocks.blockList[blk].value = boxList[i][1];
		    }
		    break;
		case 'sqrt':
		    var cblk = blocks.blockList[blk].connections[1];
		    var a = parseArg(turtle, cblk);
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
		    blocks.blockList[blk].value = (a = b);
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
		    blocks.blockList[blk].value = turtles.invertY(turtles.turtleList[turtle].container.y);
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
		case 'mouse x':
		    blocks.blockList[blk].value = stageX;
		    break;
		case 'mouse y':
		    blocks.blockList[blk].value = stageY;
		    break;
		case 'time':
		    var d = new Date();
		    blocks.blockList[blk].value = (d.getTime() - time) / 1000;
		    break;
		}
		return blocks.blockList[blk].value;
	    } else {
		return blk;
	    }
	}

	function hideBlocks() {
	    // Hide all the blocks.
	    for (var blk = 0; blk < blocks.blockList.length; blk++) {
		blocks.hideBlock(blk);
	    }
	    // And hide some other things.
	    for (var turtle = 0; turtle < turtles.turtleList.length; turtle++) {
		turtles.turtleList[turtle].container.visible = false;
	    }
	    trashBitmap.visible = false;
	    update = true;
	}

	function showBlocks() {
	    // Show all the blocks.
	    for (var blk = 0; blk < blocks.blockList.length; blk++) {
		blocks.showBlock(blk);
	    }
	    // And show some other things.
	    for (var turtle = 0; turtle < turtles.turtleList.length; turtle++) {
		turtles.turtleList[turtle].container.visible = true;
	    }
	    trashBitmap.visible = true;
	    update = true;
	}

	function hideCartesian() {
	    cartesianBitmap.visible = false;
	    update = true;
	}

	function showCartesian() {
	    cartesianBitmap.visible = true;
	    update = true;
	}

	function hidePolar() {
	    polarBitmap.visible = false;
	    update = true;
	}

	function showPolar() {
	    polarBitmap.visible = true;
	    update = true;
	}

	// Publish to FB
	function doPublish(desc) {
	    console.log('push ' + desc + ' to FB');
	    console.log(prepareExport());
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
	    return Math.floor(Math.random() * (Number(b) - Number(a) + 1) + Number(a));
	}

	function doPlus(a, b) {
	    return Number(a) + Number(b);
	}

	function doMinus(a, b) {
	    return Number(a) - Number(b);
	}

	function doMultiply(a, b) {
	    return Number(a) * Number(b);
	}

	function doDivide(a, b) {
	    // TODO: Alert
	    if (Number(b) == 0) {
		return NaN;
	    } else {
		return Number(a) / Number(b);
	    }
	}

	function setBackgroundColor(turtle) {
	    /// change body background in DOM to current color
	    var body = document.getElementById('body');
	    if (turtle == -1) {
		body.style.background = canvasColor;
	    } else {
		body.style.background = turtles.turtleList[turtle].canvasColor;
	    }
	}

	function allClear() {
	    // Clear all the boxes.
	    boxList = [];
	    time = 0;
	    canvasColor = getMunsellColor(
		defaultBackgroundColor[0], defaultBackgroundColor[1], defaultBackgroundColor[2]);
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

	function prepareExport() {
	    var data = [];
	    for (var blk = 0; blk < blocks.blockList.length; blk++) {
		var myBlock = blocks.blockList[blk];
		if (blocks.isValueBlock(blk)) {
		    var name = [myBlock.name, myBlock.value];
		} else {
		    var name = myBlock.name;
		}
		data.push([blk, name, myBlock.container.x, myBlock.container.y, myBlock.connections]);
	    }
	    return JSON.stringify(data);
	}

	function doOpen() {
	    var fileChooser = document.getElementById("myOpenFile");
	    fileChooser.addEventListener("change", function(event) {

		// Read file here.
		// console.log('fileChooser ' + this.value);
		var reader = new FileReader();

		reader.onload = (function(theFile) {
		    var rawData = reader.result;
		    var cleanData = rawData.replace('\n', ' ');
		    var obj = JSON.parse(cleanData);
		    // console.log(obj);
		    loadBlocks(obj);
		});

		reader.readAsText(fileChooser.files[0]);
	    }, false);

            fileChooser.focus();
	    fileChooser.click();
	}

	function doSave() {
	    var fileChooser = document.getElementById("mySaveFile");
	    fileChooser.addEventListener("change", function(event) {
		// Do something here.
		// console.log('fileChooser ' + this.value);
	    }, false);
            fileChooser.focus();
	    fileChooser.click();
	}

    });

});
