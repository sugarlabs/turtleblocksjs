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
    // Palettes and Blocks are defined here
    require('activity/munsell')
    require('activity/blocks')

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

	if (!Array.prototype.last){
	    Array.prototype.last = function(){
		return this[this.length - 1];
	    };
	};

        // Initialize the activity.
        activity.setup();

        // Colorize the activity icon.
        var activityButton = document.getElementById('activity-button');
        var colors;  // I should be getting the XO colors here?
        activity.getXOColor(function (error, colors) {
            icon.colorize(activityButton, colors);
        });

	// default values
	var defaultBackgroundColor = [70, 80, 20];
	var defaultColor = 0;
	var defaultValue = 50;
	var defaultChroma = 100;
	var defaultStroke = 5;
	var defaultDelay = 1000;  // MS

	var turtleDelay = defaultDelay;

        var fastButton = document.getElementById('fast-button');
        fastButton.onclick = function () {
	    turtleDelay = 0;
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
	    if (blocksVisible) {
		hideBlocks();
		blocksVisible = false;
	    } else {
		showBlocks();
		blocksVisible = true;
	    }
        }

        var clearButton = document.getElementById('clear-button');
        clearButton.onclick = function () {
	    doClear();
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

        var canvas = document.getElementById('myCanvas');

	// Stage is an Easel construct
	var stage;
	// Do we need to update the stage?
        var update = true;
	// We'll need an object to draw on
        var drawingCanvas;

	// FIXME: Unused?
        // The display object currently under the mouse, or being dragged
        var mouseTarget;
        // Indicates whether we are currently in a drag operation
        var dragStarted;

	// Group of blocks being dragged
	var dragGroup = [];

	// The blocks at the tops of stacks
        var stackList = [];

	// The list of [action name, block]
        var actionList = [];

	// The list of [box name, value]
	var boxList = [];

	// Expandable blocks
        var expandablesList = [];

	// Cache bitmaps that have been removed for reuse
	var bitmapCache = [];

	// Set the default background color...
	var canvasColor = getMunsellColor(
	    defaultBackgroundColor[0], defaultBackgroundColor[1], defaultBackgroundColor[2]);
	setBackgroundColor();
	// then set default canvas color.
	canvasColor = getMunsellColor(defaultColor, defaultValue, defaultChroma);
        var canvasStroke = defaultStroke;
	var time = 0;

	// To avoid infinite loops in dock search (temporary work-around)
	var loopCounter = 0;

	// Queue for loops
	var runQueue = [];
	var countQueue = [];

	// Highlighted block
	var highlightedBlock = null;

	var activeBlock = null;

	// Trash
	var trashBitmap = null;
	var Trash = 'images/trash.svg';

	// Coordinate grid
        var cartesianBitmap = null;
        var Cartesian = 'images/Cartesian.svg';

	// Polar grid
        var polarBitmap = null;
        var Polar = 'images/polar.svg';

	// Turtle sprite
        var turtleBitmap = null;
        var Turtle = 'images/turtle.svg';

	var turtleFillState = false;
	var turtlePenState = true;
	var turtleOrientation = 0.0;
	var turtleColor = defaultColor;
        var turtleValue = defaultValue;
        var turtleChroma = defaultChroma;
	var turtleStroke = defaultStroke;
	var turtleX = 0;
	var turtleY = 0;

	// functions needed by block.js
	updater = updateBlocks;
	adjuster = adjustDocks;
	refresher = refreshCanvas;

	// Get things started
	init();

        function init() {
            if (window.top != window) {
                document.getElementById('header').style.display = 'none';
            }
            document.getElementById('loader').className = 'loader';
            // Create the stage and point it to the canvas.
            // canvas = document.getElementById('myCanvas');

            // Check to see if we are running in a browser with touch support.
            stage = new createjs.Stage(canvas);
            // Enable touch interactions if supported on the current device.
            createjs.Touch.enable(stage);
            // Keep tracking the mouse even when it leaves the canvas.
            stage.mouseMoveOutside = true;
            // Enabled mouse over and mouse out events.
            stage.enableMouseOver(10);

	    var cartesian = new Image();
	    cartesian.src = Cartesian;
	    cartesian.onload = handleCartesianGridLoad;

	    var polar = new Image();
	    polar.src = Polar;
	    polar.onload = handlePolarGridLoad;

	    var trash = new Image();
	    trash.src = Trash;
	    trash.onload = handleTrashLoad;

	    // Load a project.
	    loadStart();

	    // Make sure blocks are aligned.
	    findStacks();
	    for (i = 0; i < stackList.length; i++) {
		findDragGroup(stackList[i]);
		adjustBlockPositions();
	    }

	    var turtle = new Image();
	    turtle.src = Turtle;
	    turtle.onload = handleTurtleLoad;

            // Create a drawing canvas
            drawingCanvas = new createjs.Shape();
            stage.addChild(drawingCanvas);
            stage.update();
        }

	function refreshCanvas() {
	    update = true;
	}

        function stop() {
	    //
            createjs.Ticker.removeEventListener('tick', tick);
        }

        function handleHighlightImageLoad(event) {
            var image = event.target;
	    var thisBlock = -1;
            for (var blk = 0; blk < blockList.length; blk++) {
		if (blockList[blk].highlightImage == image) {
		    thisBlock = blk;
		    break;
		}
            }
	    var myBlock = blockList[thisBlock];

	    var bitmap = myBlock.highlightBitmap;
	    bitmap.cursor = 'pointer';
	    var container = myBlock.myContainer;

            // Create a shape that represents the center of the icon.
            var hitArea = new createjs.Shape();

            // Position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
	    // * number and text blocks have a handle on the right side;
	    // * other blocks should be sensitive in the middle.
	    hitArea.graphics.beginFill('#FFF').drawEllipse(
		    -44, -28, 96, 36);
	    hitArea.x = image.width / 2;
	    hitArea.y = image.height / 2;
            bitmap.hitArea = hitArea;

            // Wrapper function to provide scope for the event handlers.
            (function (target) {
		var moved = false;
		bitmap.addEventListener('click', handleClick);
		bitmap.addEventListener('mousedown', handleMouseDown);
		bitmap.addEventListener('mouseover', handleMouseOver);
		bitmap.addEventListener('mouseout', handleMouseOut);

		function handleClick(event) {
		    if (!moved) {
			if (isValueBlock(thisBlock)) {
			    myBlock.label.style.display = '';
			} else {
			    var topBlock = findTopBlock(thisBlock);
			    runLogoCommands(topBlock);
			}
		    }
		}

		function handleMouseDown(event) {
		    // Bump the target in front of its siblings.
		    var lastChild = stage.children.last();
		    stage.swapChildren(container, lastChild);

		    moved = false;
		    container.addChild(target);
		    var offset = {
			x: target.x - event.stageX,
			y: target.y - event.stageY
		    };

		    event.addEventListener('mousemove', handleMouseMove);

		    // TODO: Use pressmove, pressup??
		    function handleMouseMove(event) {
			moved = true;
			var oldX = myBlock.highlightBitmap.x;
			var oldY = myBlock.highlightBitmap.y;
			target.x = event.stageX + offset.x;
			target.y = event.stageY + offset.y;

			var dx = myBlock.highlightBitmap.x - oldX;
			var dy = myBlock.highlightBitmap.y - oldY;
			myBlock.bitmap.x += dx;
			myBlock.bitmap.y += dy;

			// Move any extra parts.
			if (isExpandableBlock(thisBlock)) {
			    moveExtraParts(thisBlock, dx, dy);
			} else if (isValueBlock(thisBlock)) {
			    text.x += dx;
			    text.y += dy;
			    // Ensure text is on top
			    lastChild = container.children.last();
			    container.swapChildren(text, lastChild);
			}

			// Move the label.
			adjustLabelPosition(thisBlock, bitmap.x, bitmap.y);

			// Move any connected blocks.
			findDragGroup(thisBlock)
			if (dragGroup.length > 0) {
			    for (var b = 0; b < dragGroup.length; b++) {
				blk = dragGroup[b];
				if (b != 0) {
				    moveBlockRelative(blk, dx, dy);
				}
			    }
			}

			// Indicate that the stage should be updated
			// on the next tick.
			update = true;
		    }
		}

		function handleMouseOver(event) {
		    if (activeBlock == null) {
			// highlight(thisBlock);
			activeBlock = thisBlock;
			update = true;
		    }
		}

		function handleMouseOut(event) {
		    if (activeBlock != thisBlock) {
			return;
		    }
		    if (moved) {
			// Check if block is in the trash
			if (overTrashCan(event.stageX, event.stageY)) {
			    findDragGroup(thisBlock);
			    for (var blk = 0; blk < dragGroup.length; blk++) {
				console.log('putting ' + blockList[blk].name + ' in the trash');
				blockList[blk].trash = true;
				hideBlock(blk);
			    }
			}
			// otherwise, process move
			blockMoved(thisBlock);
		    }
		    unhighlight();
		    activeBlock = null;
		    update = true;
		}

            })(bitmap);

            document.getElementById('loader').className = '';
            createjs.Ticker.addEventListener('tick', tick);
	}

        function handleImageLoad(event) {
	    // Load a block
            var image = event.target;
            var bitmap;
	    var text = null;

            var container = new createjs.Container();
            stage.addChild(container);

	    var thisBlock = -1;
            for (var blk = 0; blk < blockList.length; blk++) {
		if (blockList[blk].image == image) {
		    thisBlock = blk;
		    break;
		}
            }
	    var myBlock = blockList[thisBlock]

	    // Save the container as we may need it later.
	    myBlock.myContainer = container;

            // Create the bitmap for the block.
	    bitmap = new createjs.Bitmap(image);
	    myBlock.bitmap = bitmap;
	    container.addChild(bitmap);
	    bitmap.x = myBlock.x;
	    bitmap.y = myBlock.y;
	    bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;
	    bitmap.name = 'bmp_' + thisBlock;
	    bitmap.cursor = 'pointer';
	    adjustLabelPosition(thisBlock, bitmap.x, bitmap.y);

            // Create the highlight bitmap for the block.
	    highlightBitmap = new createjs.Bitmap(myBlock.highlightImage);
	    myBlock.highlightImage.onload = handleHighlightImageLoad;

	    myBlock.highlightBitmap = highlightBitmap;
	    container.addChild(highlightBitmap);
	    highlightBitmap.x = bitmap.x;
	    highlightBitmap.y = bitmap.y;
	    highlightBitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;
	    highlightBitmap.name = 'bmp_highlight_' + thisBlock;
	    // Hide it to start
	    highlightBitmap.visible = false;

	    // Value blocks get a modifiable text label
	    if (isValueBlock(thisBlock)) {
		text = new createjs.Text(myBlock.value.toString(), "20px Courier", "#00000"); text.x = 100; text.textBaseline = "alphabetic";
		myBlock.text = text;
		container.addChild(text);
		text.x = 40 + bitmap.x;
		text.y = 27 + bitmap.y;
		text.scaleX = text.scaleY = text.scale = 1;
	    }

	    // Expandable blocks have some extra parts.
	    if (isExpandableBlock(thisBlock)) {
		var yoff = myBlock.protoblock.yoff;
		myBlock.fillerBitmaps = [];
		myBlock.bottomBitmap = null;
		var bottomBitmap =
		    new createjs.Bitmap(myBlock.bottomImage);
		myBlock.bottomBitmap = bottomBitmap;
		container.addChild(bottomBitmap);
		bottomBitmap.x = bitmap.x;
		bottomBitmap.y = bitmap.y + yoff;
		bottomBitmap.scaleX = 1;
		bottomBitmap.scaleY = 1;
		bottomBitmap.scale = 1;
		bottomBitmap.name = 'bmp_' + thisBlock + '_bottom';
		var highlightBottomBitmap =
		    new createjs.Bitmap(myBlock.highlightBottomImage);
		myBlock.highlightBottomBitmap = highlightBottomBitmap;
		container.addChild(highlightBottomBitmap);
		highlightBottomBitmap.x = bitmap.x;
		highlightBottomBitmap.y = bitmap.y + yoff;
		highlightBottomBitmap.scaleX = 1;
		highlightBottomBitmap.scaleY = 1;
		highlightBottomBitmap.scale = 1;
		highlightBottomBitmap.name = 'bmp_' + thisBlock + '_highlight_bottom';
		highlightBottomBitmap.visible = false;
	    }

            // Create a shape that represents the center of the icon.
            var hitArea = new createjs.Shape();

            // Position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
	    // * number and text blocks have a handle on the right side;
	    // * other blocks should be sensitive in the middle.
	    hitArea.graphics.beginFill('#FFF').drawEllipse(
		    -44, -28, 96, 36);
	    hitArea.x = image.width / 2;
	    hitArea.y = image.height / 2;
            bitmap.hitArea = hitArea;

            // Wrapper function to provide scope for the event handlers.
            (function (target) {
		var moved = false;
		bitmap.addEventListener('mouseover', handleMouseOver);

		function handleMouseOver(event) {
		    if (activeBlock == null) {
			highlight(thisBlock);
			activeBlock = thisBlock;
			update = true;
		    }
		}
            })(bitmap);

            document.getElementById('loader').className = '';
            createjs.Ticker.addEventListener('tick', tick);
        }

	function moveExtraParts(blk, dx, dy) {
	    // Expandable blocks have extra parts that need attention.
	    var myBlock = blockList[blk];
	    if (myBlock.fillerBitmaps == undefined) {
		return;  // still in init stage
	    }
	    for (var i = 0; i < blockList[blk].fillerBitmaps.length; i++) {
		myBlock.fillerBitmaps[i].x += dx;
		myBlock.fillerBitmaps[i].y += dy;
		myBlock.highlightFillerBitmaps[i].x += dx;
		myBlock.highlightFillerBitmaps[i].y += dy;
	    }
	    if (myBlock.bottomBitmap != null) {
		myBlock.bottomBitmap.x += dx;
		myBlock.bottomBitmap.y += dy;
		myBlock.highlightBottomBitmap.x += dx;
		myBlock.highlightBottomBitmap.y += dy;
	    }
	}

	function blockMoved(thisBlock) {
	    // When a block is moved, we have lots of things to check:
	    // (0) Is it inside of a expandable block?
	    // (1) Is it an arg block connected to a 2-arg block?
	    // (2) Disconnect its connection[0];
	    // (3) Look for a new connection;
	    // (4) Is it an arg block connected to a 2-arg block?
	    // (5) Recheck if it inside of a expandable block.

	    // Find any containing expandable blocks.
	    var checkExpandableBlocks = [];
	    var blk = insideExpandableBlock(thisBlock);
	    while (blk != null) {
		checkExpandableBlocks.push(blk);
		blk = insideExpandableBlock(blk);
	    }

	    var check2ArgBlocks = [];
	    var myBlock = blockList[thisBlock];
	    var c = myBlock.connections[0];
	    if (c != null) {
		var cBlock = blockList[c];
	    }
	    // If it is an arg block, where is it coming from?
	    if (isArgBlock(thisBlock) && c != null) {
		// We care about special (2arg) blocks with
		// connections to the first arg;
		if (isSpecialBlock(c)) {
		    if (cBlock.connections[1] == thisBlock) {
			check2ArgBlocks.push(c);
		    }
		} else if (isArgBlock(c) && isExpandableBlock(c)) {
		    if (cBlock.connections[1] == thisBlock) {
			check2ArgBlocks.push(c);
		    }
		}
	    }

	    // Disconnect from connection[0] (both sides of the connection).
	    if (c != null) {
		// disconnect both ends of the connection
		for (i = 1;
		     i < cBlock.connections.length; i++) {
		    if (cBlock.connections[i] == thisBlock) {
			cBlock.connections[i] = null;
			break;
		    }
		}
  		myBlock.connections[0] = null;
	    }

	    // Look for a new connection.
	    var dx1 = myBlock.bitmap.x + myBlock.docks[0][0];
	    var dy1 = myBlock.bitmap.y + myBlock.docks[0][1];
	    // Find the nearest dock; if it is close
	    // enough, connect;
	    var newBlock = null;
	    var newConnection = null;
	    var min = 400;
	    var blkType = myBlock.docks[0][2]
	    for (b = 0; b < blockList.length; b++) {
		// Don't connect to yourself.
		if (b == thisBlock) {
		    continue;
		}
		for (c = 1; c < blockList[b].connections.length; c++) {
		    // Look for available connections.
		    if (testConnectionType(
			blkType,
			blockList[b].docks[c][2])) {
			dx2 = blockList[b].bitmap.x + 
			    blockList[b].docks[c][0];
			dy2 = blockList[b].bitmap.y + 
			    blockList[b].docks[c][1];
			dist = (dx2 - dx1) * (dx2 - dx1) + 
			    (dy2 - dy1) * (dy2 - dy1);
			if (dist < min) {
			    newBlock = b;
			    newConnection = c;
			    min = dist;
			}
		    } else {
			// TODO: bounce away from illegal connection?
			// only if the distance was small
			// console.log('cannot not connect these two block types');
		    }
		}
	    }
	    if (newBlock != null) {
		// We found a match.
		myBlock.connections[0] = newBlock;
		var connection = blockList[newBlock].connections[newConnection];
		if(connection != null) {
		    if (isArgBlock(thisBlock)) {
			blockList[connection].connections[0] = null;
			// Fixme: could be more than one block.
			moveBlockRelative(connection, 40, 40);
		    } else {
			var bottom = findBottomBlock(thisBlock);
			blockList[connection].connections[0] = bottom;
			blockList[bottom].connections[blockList[bottom].connections.length-1] = connection;
		    }
		}
		blockList[newBlock].connections[newConnection] = thisBlock;
		loopCounter = 0;
		adjustDocks(newBlock);
		// TODO: mark new connection?
	    }

	    // If it is an arg block, where is it coming from?
	    if (isArgBlock(thisBlock) && newBlock != null) {
		// We care about special (2arg) blocks with
		// connections to the first arg;
		if (isSpecialBlock(newBlock)) {
		    if (blockList[newBlock].connections[1] == thisBlock) {
			if (check2ArgBlocks.indexOf(newBlock) == -1) {
			    check2ArgBlocks.push(newBlock);
			}
		    }
		} else if (isArgBlock(newBlock) && isExpandableBlock(newBlock)) {
		    if (blockList[newBlock].connections[1] == thisBlock) {
			if (check2ArgBlocks.indexOf(newBlock) == -1) {
			    check2ArgBlocks.push(newBlock);
			}
		    }
		}
	    }
	    // If we changed the contents of a 2-arg block
	    // block, we need to adjust it.
	    if (check2ArgBlocks.length > 0) {
		for (var i = 0; i < check2ArgBlocks.length; i++) {
		    adjust2ArgBlock(check2ArgBlocks[i]);
		}
	    }

	    // Recheck if it inside of a expandable block
	    var blk = insideExpandableBlock(thisBlock);
	    while (blk != null) {
		if (checkExpandableBlocks.indexOf(blk) == -1) {
		    checkExpandableBlocks.push(blk);
		}
		blk = insideExpandableBlock(blk);
	    }
	    // If we changed the contents of an expandable
	    // block, we need to adjust its clamp.
	    if (checkExpandableBlocks.length > 0) {
		for (var i = 0; i < checkExpandableBlocks.length; i++) {
		    adjustExpandableBlock(checkExpandableBlocks[i]);
		}
	    }
	}

	function testConnectionType(type1, type2) {
	    // Can these two blocks dock?
	    if (type1 == 'in' && type2 == 'out') {
		return true;
	    }
	    if (type1 == 'out' && type2 == 'in') {
		return true;
	    }
	    if (type1 == 'numberin' && type2 == 'numberout') {
		return true;
	    }
	    if (type1 == 'numberout' && type2 == 'numberin') {
		return true;
	    }
	    if (type1 == 'textin' && type2 == 'textout') {
		return true;
	    }
	    if (type1 == 'textout' && type2 == 'textin') {
		return true;
	    }
	    if (type1 == 'booleanout' && type2 == 'booleanin') {
		return true;
	    }
	    if (type1 == 'booleanin' && type2 == 'booleanout') {
		return true;
	    }
	    return false;
	}

        function handleTurtleLoad(event) {
	    // Load the turtle
            var image = event.target;
            var imgW = image.width;
            var imgH = image.height;
            var bitmap;
            var container = new createjs.Container();
            stage.addChild(container);

            // Create a shape that represents the center of the icon
            var hitArea = new createjs.Shape();
            hitArea.graphics.beginFill('#FFF').drawEllipse(-22, -28, 48, 36);
            // Position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
            hitArea.x = imgW / 2;
            hitArea.y = imgH / 2;

            // Create a turtle
            bitmap = new createjs.Bitmap(image);
	    turtleBitmap = bitmap;
            container.addChild(bitmap);

            bitmap.x = turtleX2screenX(turtleX);
            bitmap.y = invertY(turtleY);
            bitmap.regX = imgW / 2 | 0;
            bitmap.regY = imgH / 2 | 0;
            bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;
            bitmap.name = 'bmp_turtle';

            bitmap.cursor = 'pointer';

            // Assign the hitArea to bitmap to use it for hit tests:
            bitmap.hitArea = hitArea;

            // Wrapper function to provide scope for the event handlers:
            (function (target) {
		var moved = false;
		bitmap.addEventListener('click', handleClick);
		bitmap.addEventListener('mousedown', handleMouseDown);
		bitmap.addEventListener('mouseover', handleMouseOver);
		bitmap.addEventListener('mouseout', handleMouseOut);

		function handleClick(event) {
		    if (!moved) {
			// console.log('turtle click');
		    }
		}

		function handleMouseDown(event) {
		    moved = false;
                    container.addChild(target);
                    var offset = {
                        x: target.x - event.stageX,
                        y: target.y - event.stageY
                    };

		    event.addEventListener('mousemove', handleMouseMove);

		    // TODO: Use pressmove, pressup??
		    function handleMouseMove(event) {
			moved = true;
                        target.x = event.stageX + offset.x;
                        target.y = event.stageY + offset.y;
                        update = true;
                    }
                }

		function handleMouseOver(event) {
                    target.scaleX = target.scaleY = target.scale * 1.2;
                    update = true;
                }

		function handleMouseOut(event) {
                    target.scaleX = target.scaleY = target.scale;
		    turtleBitmap.x = target.x;
		    turtleBitmap.y = target.y;
                    update = true;
                }
            })(bitmap);

            document.getElementById('loader').className = '';
            createjs.Ticker.addEventListener('tick', tick);
        }

	function moveTurtle(ox, oy, x, y, invert) {
	    if (invert) {
		ox = turtleX2screenX(ox);
		nx = turtleX2screenX(x);
		oy = invertY(oy);
		ny = invertY(y);
	    } else {
		nx = x;
		ny = y;
	    }

	    if (!turtleFillState) {
            	drawingCanvas.graphics.beginStroke(canvasColor);
		drawingCanvas.graphics.setStrokeStyle(canvasStroke, 'round', 'round');
		drawingCanvas.graphics.moveTo(ox, oy);
	    }

	    if (turtlePenState) {
		drawingCanvas.graphics.lineTo(nx, ny);
	    } else {
		drawingCanvas.graphics.moveTo(nx, ny);
	    }
	}

	function arcTurtle(cx, cy, ox, oy, nx, ny, radius, start, end, anticlockwise,
			   invert) {
	    if (invert) {
		cx = turtleX2screenX(cx);
		ox = turtleX2screenX(ox);
		nx = turtleX2screenX(nx);
		cy = invertY(cy);
		oy = invertY(oy);
		ny = invertY(ny);
	    }

	    if (!turtleFillState) {
            	drawingCanvas.graphics.beginStroke(canvasColor);
		drawingCanvas.graphics.setStrokeStyle(canvasStroke, 'round', 'round');
		drawingCanvas.graphics.moveTo(ox, oy);
	    }

	    if (!anticlockwise) {
		sa = start - Math.PI;
		ea = end - Math.PI;
	    } else {
		sa = start;
		ea = end;
	    }

	    if (turtlePenState) {
		drawingCanvas.graphics.arc(cx, cy, radius, sa, ea,
					   anticlockwise);
	    } else {
		drawingCanvas.graphics.moveTo(nx, ny);
	    }
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
            createjs.Ticker.addEventListener('tick', tick);
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

        function handleCartesianGridLoad(event) {
	    // Load the coordinate grid
            var image = event.target;
            var imgW = image.width;
            var imgH = image.height;
            var bitmap;
            var container = new createjs.Container();
            stage.addChild(container);

            bitmap = new createjs.Bitmap(image);
	    cartesianBitmap = bitmap;
            container.addChild(bitmap);

            bitmap.x = 0;
            bitmap.y = 0;
            bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;
            bitmap.name = 'bmp_cartesian';

            document.getElementById('loader').className = '';
            createjs.Ticker.addEventListener('tick', tick);
	    bitmap.visible = false;
	    update = true;
        }

        function handlePolarGridLoad(event) {
	    // Load the coordinate grid
            var image = event.target;
            var imgW = image.width;
            var imgH = image.height;
            var bitmap;
            var container = new createjs.Container();
            stage.addChild(container);

            bitmap = new createjs.Bitmap(image);
	    polarBitmap = bitmap;
            container.addChild(bitmap);

            bitmap.x = 0;
            bitmap.y = 0;
            bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;
            bitmap.name = 'bmp_polar';

            document.getElementById('loader').className = '';
            createjs.Ticker.addEventListener('tick', tick);
	    bitmap.visible = false;
	    update = true;
        }

        function adjustBlockPositions() {
	    // Adjust the docking postions of all blocks in the drag group
	    if (dragGroup.length < 2) {
		return;
	    }

	    loopCounter = 0;
	    adjustDocks(dragGroup[0])
	}

	function adjustExpandableBlock(blk) {
	    // Adjust the size of the clamp in an expandable block

	    // TODO: expand arg blocks
	    if (isArgBlock(blk)) {
		return;
	    }

	    // TODO: expand special blocks
	    if (isSpecialBlock(blk)) {
		return;
	    }

	    // (1) count up the number of blocks inside the clamp;
	    // always the second to last argument.
	    var c = blockList[blk].connections.length - 2;
	    var size = getStackSize(blockList[blk].connections[c]);
	    if( size < 1 ) {
		size = 1;  // Minimum clamp size
	    }

	    // (2) adjust the clamp size to match.
	    var yoff = blockList[blk].protoblock.yoff;
	    var loff = blockList[blk].protoblock.loff;
	    var j = blockList[blk].fillerBitmaps.length;
	    if (size < blockList[blk].fillerBitmaps.length + 1) {
		var n = j - size + 1;  // one slot built in
		for (var i = 0; i < n; i++) {
		    removeFiller(blk);
		    blockList[blk].docks.last()[1] -= loff;
		}
                j = blockList[blk].fillerBitmaps.length;
		var o = yoff + j * loff;
		blockList[blk].bottomBitmap.y = blockList[blk].bitmap.y + o;
		blockList[blk].highlightBottomBitmap.y = blockList[blk].bitmap.y + o;
		if (blockList[blk].connections.last() != null) {
		    loopCounter = 0;
		    adjustDocks(blk);
		}
                update = true;
	    } else if (size > blockList[blk].fillerBitmaps.length) {
		var n = size - j - 1;  // one slot built in
		for (var i = 0; i < n; i++) {
		    var c = i + j;
		    addFiller(blk, yoff + c * loff, c);
		    blockList[blk].docks.last()[1] += loff;
		}
                j = blockList[blk].fillerBitmaps.length;
		var o = yoff + j * loff;
		blockList[blk].bottomBitmap.y = blockList[blk].bitmap.y + o;
		blockList[blk].highlightBottomBitmap.y = blockList[blk].bitmap.y + o;
		if (blockList[blk].connections.last() != null) {
		    loopCounter = 0;
		    adjustDocks(blk);
		}
                update = true;
	    }	    
	}

	function getBlockSize(blk) {
	    // TODO recurse on first arg
	    return blockList[blk].size;
	}

	function adjust2ArgBlock(blk) {
	    // Adjust the size of a 2-arg block
	    // (1) What the size of the first argument?
	    var c = blockList[blk].connections[1];
	    if (c == null) {
		var size = 0;
	    } else {
		var size = getBlockSize(c);
	    }
	    if( size < 1 ) {
		size = 1;  // Minimum size
	    }

	    // (2) adjust the block size to match.
	    var yoff = blockList[blk].protoblock.yoff;
	    var loff = blockList[blk].protoblock.loff;
	    var j = blockList[blk].fillerBitmaps.length;
	    if (size < blockList[blk].fillerBitmaps.length + 1) {
		var n = j - size + 1;  // one slot built in
		for (var i = 0; i < n; i++) {
		    removeFiller(blk);
		    blockList[blk].docks[2][1] -= loff;
		    if (!isArgBlock(blk)) {
			blockList[blk].docks[3][1] -= loff;
		    }
		    blockList[blk].size -= 1;
		}
                j = blockList[blk].fillerBitmaps.length;
		var o = yoff + j * loff;
		blockList[blk].bottomBitmap.y = blockList[blk].bitmap.y + o;
		blockList[blk].highlightBottomBitmap.y = blockList[blk].bitmap.y + o;
		if (isArgBlock(blk)) {
		    if (blockList[blk].connections[2] != null) {
			loopCounter = 0;
			adjustDocks(blk);
		    }
		} else {
		    if (blockList[blk].connections[2] != null) {
			loopCounter = 0;
			adjustDocks(blk);
		    } else if (blockList[blk].connections[3] != null) {
			loopCounter = 0;
			adjustDocks(blk);
		    }
		}
                update = true;
	    } else if (size > blockList[blk].fillerBitmaps.length) {
		var n = size - j - 1;  // one slot built in
		for (var i = 0; i < n; i++) {
		    var c = i + j;
		    addFiller(blk, yoff + c * loff, c);
		    blockList[blk].docks[2][1] += loff;
		    if (!isArgBlock(blk)) {
			blockList[blk].docks[3][1] += loff;
		    }
		    blockList[blk].size += 1;
		}
                j = blockList[blk].fillerBitmaps.length;
		var o = yoff + j * loff;
		blockList[blk].bottomBitmap.y = blockList[blk].bitmap.y + o;
		blockList[blk].highlightBottomBitmap.y = blockList[blk].bitmap.y + o;
		if (isArgBlock(blk)) {
		    if (blockList[blk].connections[2] != null) {
			loopCounter = 0;
			adjustDocks(blk);
		    }
		} else {
		    if (blockList[blk].connections[2] != null) {
			loopCounter = 0;
			adjustDocks(blk);
		    } else if (blockList[blk].connections[3] != null) {
			loopCounter = 0;
			adjustDocks(blk);
		    }
		}
                update = true;
	    }
	}

	function findBitmap(name) {
	    for (var i = 0; i < bitmapCache.length; i++) {
		if (bitmapCache[i].name == name) {
		    return i;
		}
	    }
	    return null;
	}

	function removeFiller(blk) {
	    var fillerBitmap = blockList[blk].fillerBitmaps.pop();
	    blockList[blk].myContainer.removeChild(fillerBitmap);
	    if (findBitmap(fillerBitmap.name) == null) {
		bitmapCache.push(fillerBitmap);
	    }
	    update = true;
	}

	function addFiller(blk, offset, c) {
	    var name = 'bmp_' + blk + '_filler_' + c;
	    var bi = findBitmap(name);
	    if (bi == null) { 
		var image = new Image();
		if (isArgBlock(blk)) {
		    image.src = blockList[blk].protoblock.getArgFillerSvgPath();
		} else if (isSpecialBlock(blk)) {
		    image.src = blockList[blk].protoblock.getSpecialFillerSvgPath();
		} else {
		    image.src = blockList[blk].protoblock.getFillerSvgPath();
		}
		var bitmap = new createjs.Bitmap(image)
		bitmap.name = name;
	    } else {
		var bitmap = bitmapCache[bi];
	    }
	    blockList[blk].fillerBitmaps.push(bitmap);
	    blockList[blk].myContainer.addChild(bitmap);
	    bitmap.x = blockList[blk].bitmap.x;
	    bitmap.y = blockList[blk].bitmap.y + offset;
	    bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;

	    // And the same for the highlight blocks
	    var name = 'bmp_' + blk + '_highlight_filler_' + c;
	    var bi = findBitmap(name);
	    if (bi == null) { 
		var image = new Image();
		if (isArgBlock(blk)) {
		    image.src = blockList[blk].protoblock.getHighlightArgFillerSvgPath();
		} else if (isSpecialBlock(blk)) {
		    image.src = blockList[blk].protoblock.getHighlightSpecialFillerSvgPath();
		} else {
		    image.src = blockList[blk].protoblock.getHighlightFillerSvgPath();
		}
		var bitmap = new createjs.Bitmap(image)
		bitmap.name = name;
	    } else {
		var bitmap = bitmapCache[bi];
	    }
	    blockList[blk].highlightFillerBitmaps.push(bitmap);
	    blockList[blk].myContainer.addChild(bitmap);
	    bitmap.x = blockList[blk].bitmap.x;
	    bitmap.y = blockList[blk].bitmap.y + offset;
	    bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;
	    // Hide highlight to start
	    bitmap.visible = false;

	    update = true;
	}

	function getStackSize(blk) {
	    // How many block units (42 px) in this stack?
	    var size = 0;

	    if (blk == null) {
		return size;
	    }

	    if (isClampBlock(blk)) {
		c = blockList[blk].connections.length - 2;
		size = getStackSize(blockList[blk].connections[c]);
		if (size == 0) {
		    size = 1;  // minimum of 1 slot in clamp
		}
		// add top and bottom of clamp
		size += blockList[blk].size;
	    } else {
		size = blockList[blk].size;
	    }

	    // check on any connected block
	    var cblk = blockList[blk].connections.last();
	    size += getStackSize(cblk);
	    return size;
	}

	function adjustDocks(blk, reset) {
	    // Give a block, adjust the dock positions
	    // of all of the blocks connected to it

	    // For when we come in from makeBlock
	    if (reset != null) {
		loopCounter = 0;
	    }

	    // Do we need these? All blocks have connections.
	    if (blockList[blk] == null) {
		console.log('saw a null block: ' + blk);
		return;
	    }
	    if (blockList[blk].connections == null) {
		console.log('saw a block with null connections: ' + blk);
		return;
	    }
	    if (blockList[blk].connections.length == 0) {
		console.log('saw a block with [] connections: ' + blk);
		return;
	    }

	    loopCounter += 1;
	    if (loopCounter > blockList.length * 2) {
		// FIXME: there is an infinite loop in here somewhere.
		console.log('infinite loop encountered while adjusting docks');
		return;
	    }

	    // Walk through each connection except the parent block.
	    for (var c = 1; c < blockList[blk].connections.length; c++) {
		// Get the dock position for this connection.
		var bdock = blockList[blk].docks[c];

		// Find the connecting block.
		var cblk = blockList[blk].connections[c];
		// Nothing connected here so continue to the next connection.
		if (cblk == null) {
		    continue;
		}

		// Find the dock position in the connected block.
		for (var b = 0; b < blockList[cblk].connections.length; b++) {
		    if (blockList[cblk].connections[b] == blk) {
			break
		    }
		}
		var cdock = blockList[cblk].docks[b];

		// Move the connected block.
		var dx = bdock[0] - cdock[0];
		var dy = bdock[1] - cdock[1];
		if (blockList[blk].bitmap == null) {
                    var nx = blockList[blk].x + dx;
                    var ny = blockList[blk].y + dy;
		} else {
                    var nx = blockList[blk].bitmap.x + dx;
                    var ny = blockList[blk].bitmap.y + dy;
		}
		moveBlock(cblk, nx, ny);

		// Recurse on connected blocks.
		adjustDocks(cblk);
	    }
	}

        function findDragGroup(blk) {
	    // Generate a drag group from blocks connected to blk
	    dragGroup = [];
            calculateDragGroup(blk);
        }

        function calculateDragGroup(blk) {
	    // Give a block, find all the blocks connected to it
	    if (blk == null) {
		return;
	    }
	    dragGroup.push(blk);

	    // As before, does these ever happen?
	    if (blockList[blk].connections == null) {
		return;
	    }
	    if (blockList[blk].connections.length == 0) {
		return;
	    }

	    for (var c = 1; c < blockList[blk].connections.length; c++) {
		var cblk = blockList[blk].connections[c];
		if (cblk != null) {
		    // Recurse
		    calculateDragGroup(cblk);
		}
	    }
	}

        function insideExpandableBlock(blk) {
	    // Returns a containing expandable block or null
	    if (blockList[blk].connections[0] == null) {
		return null;
	    } else {
		var cblk = blockList[blk].connections[0];
		if (isExpandableBlock(cblk)) {
		    // If it is the last connection, keep searching.
		    if (blk == blockList[cblk].connections.last()) {
			return insideExpandableBlock(cblk);
		    } else {
			return cblk;
		    }
		} else {
		    return insideExpandableBlock(cblk);
		}
	    }
	}

	function findStacks() {
	    // Find any blocks with null in the first connection.
            stackList = [];
	    for (i = 0; i < blockList.length; i++) {
		if (blockList[i].connections[0] == null) {
		    stackList.push(i)
		}
	    }
	}

	function findClamps() {
	    // Find any clamp blocks.
	    expandablesList = [];
	    findStacks();  // We start by finding the stacks
	    for (var i = 0; i < stackList.length; i++) {
		searchForExpandables(stackList[i]);
	    }
	}

	function searchForExpandables(blk) {
	    // Find the expandable blocks below blk in a stack.
	    while (blk != null) {
		if (isClampBlock(blk)) {
		    expandablesList.push(blk);
		    var c = blockList[blk].connections.length - 2;
		    searchForExpandables(blockList[blk].connections[c]);
		}
		blk = blockList[blk].connections.last();
	    }
	}

	function expandClamps() {
	    // Expand expandable blocks as needed.
	    findClamps();
	    for (var i = 0; i < expandablesList.length; i++) {
		adjustExpandableBlock(expandablesList[i]);
	    }
	    update = true;
	}

        function findTopBlock(blk) {
	    // Find the top block in a stack.
	    if (blk == null) {
		return null;
	    }
	    if (blockList[blk].connections == null) {
		return blk;
	    }
	    if (blockList[blk].connections.length == 0) {
		return blk;
	    }
	    while (blockList[blk].connections[0] != null) {
		blk = blockList[blk].connections[0];
	    }
	    return blk;
        }

        function findBottomBlock(blk) {
	    // Find the bottom block in a stack.
	    if (blk == null) {
		return null;
	    }
	    if (blockList[blk].connections == null) {
		return blk;
	    }
	    if (blockList[blk].connections.length == 0) {
		return blk;
	    }
	    while (blockList[blk].connections.last() != null) {
		blk = blockList[blk].connections.last();
	    }
	    return blk;
	}

	function updateBlocks() {
	    updateBlockImages();
	    updateBlockLabels();
	    update = true;
	}

        function updateBlockImages() {
	    // Create the block image if it doesn't yet exist.
            for (var blk = 0; blk < blockList.length; blk++) {
		myBlock = blockList[blk];
		if (myBlock.image == null) {
		    myBlock.image = new Image();
		    myBlock.image.src = myBlock.protoblock.getSvgPath();
		    myBlock.image.onload = handleImageLoad;
		    if (isExpandableBlock(blk)) {
			if (isArgBlock(blk)) {
			    myBlock.bottomImage = new Image();
			    myBlock.bottomImage.src =
				myBlock.protoblock.getArgBottomSvgPath();
			} else if (isSpecialBlock(blk)) {
			    myBlock.bottomImage = new Image();
			    myBlock.bottomImage.src =
				myBlock.protoblock.getSpecialBottomSvgPath();
			} else {
			    myBlock.bottomImage = new Image();
			    myBlock.bottomImage.src =
				myBlock.protoblock.getBottomSvgPath();
			}
		    }
		    // Same for highlights
		    myBlock.highlightImage = new Image();
		    myBlock.highlightImage.src = myBlock.protoblock.getHighlightSvgPath();
		    if (isExpandableBlock(blk)) {
			if (isArgBlock(blk)) {
			    myBlock.highlightBottomImage = new Image();
			    myBlock.highlightBottomImage.src =
				myBlock.protoblock.getHighlightArgBottomSvgPath();
			} else if (isSpecialBlock(blk)) {
			    myBlock.highlightBottomImage = new Image();
			    myBlock.highlightBottomImage.src =
				myBlock.protoblock.getHighlightSpecialBottomSvgPath();
			} else {
			    myBlock.highlightBottomImage = new Image();
			    myBlock.highlightBottomImage.src =
				myBlock.protoblock.getHighlightBottomSvgPath();
			}
		    }

		    update = true;
		}
	    }
	}

        function moveBlock(blk, x, y) {
	    // Move a block (and its label) to x, y.
	    var myBlock = blockList[blk];
	    if (myBlock.bitmap == null) {
		dx = x - myBlock.x;
		dy = y - myBlock.y;
		myBlock.x = x
		myBlock.y = y
	    } else {
		dx = x - myBlock.bitmap.x;
		dy = y - myBlock.bitmap.y;
		myBlock.bitmap.x = x
		myBlock.bitmap.y = y
		myBlock.highlightBitmap.x = x
		myBlock.highlightBitmap.y = y
		myBlock.x = myBlock.bitmap.x
		myBlock.y = myBlock.bitmap.y
	    }
	    if (isExpandableBlock(blk)) {
		moveExtraParts(blk, dx, dy);
	    } else if (isValueBlock(blk)) {
		if (myBlock.text != null) {
		    myBlock.text.x += dx;
		    myBlock.text.y += dy;
		}
	    }
	    adjustLabelPosition(blk, x, y);
	}

        function moveBlockRelative(blk, dx, dy) {
	    // Move a block (and its label) by dx, dy.
	    var myBlock = blockList[blk];
	    if (myBlock.bitmap == null) {
		    myBlock.x += dx
		    myBlock.y += dy
		} else {
		    myBlock.bitmap.x += dx
		    myBlock.bitmap.y += dy
		    myBlock.highlightBitmap.x += dx
		    myBlock.highlightBitmap.y += dy
		    myBlock.x = myBlock.bitmap.x
		    myBlock.y = myBlock.bitmap.y
		}
	    if (isExpandableBlock(blk)) {
		moveExtraParts(blk, dx, dy);
	    } else if (isValueBlock(blk)) {
		if (myBlock.text == null) {
		    console.log('null text?');
		} else {
		    myBlock.text.x += dx;
		    myBlock.text.y += dy;
		}
	    }
	    adjustLabelPosition(blk, myBlock.x, myBlock.y);
	}

	// The modifiable labels are stored in the DOM with a
	// unique id for each block.  For the moment, we only have
	// labels for number and text blocks.
	function updateBlockLabels() {
	    var html = ''
	    var text = ''
	    var value = ''
	    for (var blk = 0; blk < blockList.length; blk++) {
		var myBlock = blockList[blk];
		if (myBlock.name == 'number') {
		    if (myBlock.label == null) {
			if (myBlock.value == null) {
			    myBlock.value = 100;
			}
			value = myBlock.value.toString();
		    } else {
			value = myBlock.label.value;
		    }
		    text = '<textarea id="' + getBlockId(blk) +
			'" style="position: absolute; ' + 
			'-webkit-user-select: text;" ' +
			'class="number", ' +
			'cols="8", rows="1", maxlength="8">' +
			value + '</textarea>'
		} else if (myBlock.name == 'text') {
		    if (myBlock.label == null) {
			if (myBlock.value == null) {
			    myBlock.value = 'text';
			}
			value = myBlock.value;
		    } else {
			value = myBlock.label.value;
		    }
		    text = '<textarea id="' + getBlockId(blk) +
			'" style="position: absolute; ' + 
			'-webkit-user-select: text;" ' +
			'class="text", ' +
			'cols="8", rows="1", maxlength="8">' +
			value + '</textarea>'
		} else {
		    text = ''
		}
		html = html + text
	    }
	    labelElem.innerHTML = html;

	    // Then create a list of the label elements
	    for (var blk = 0; blk < blockList.length; blk++) {
		var myBlock = blockList[blk];
		if (myBlock.bitmap == null) {
		    var x = myBlock.x
		    var y = myBlock.y
		} else {
		    var x = myBlock.bitmap.x
		    var y = myBlock.bitmap.y
		}
		if (isValueBlock(blk)) {
		    myBlock.label = document.getElementById(getBlockId(blk));
		    myBlock.label.addEventListener(
			'change', function() {labelChanged();});
		    adjustLabelPosition(blk, x, y);
		    // Hide the label until we need to change it
		    myBlock.label.style.display = 'none';
		} else {
		    myBlock.label = null;
		}
	    }
	}

	function adjustLabelPosition(blk, x, y) {
	    // Move the label when the block moves.
	    if (blockList[blk].label == null) {
		return;
	    }
	    if (blockList[blk].protoblock.name == 'number') {
		blockList[blk].label.style.left = Math.round(
		    x + canvas.offsetLeft + 28) + 'px';
	    } else if (blockList[blk].protoblock.name == 'text') {
		blockList[blk].label.style.left = Math.round(
		    x + canvas.offsetLeft + 28) + 'px';
	    } else {
		blockList[blk].label.style.left = Math.round(
		    x + canvas.offsetLeft + 10) + 'px';
	    }
	    blockList[blk].label.style.top = Math.round(
		y + canvas.offsetTop + 6) + 'px';
	}

        function tick(event) {
            // This set makes it so the stage only re-renders when an
            // event handler indicates a change has happened.
            if (update) {
                update = false; // Only update once
                stage.update(event);
            }
        }

	function newBlock(proto) {
	    // Create a new block
	    blockList.push(new Block(proto));
	    // We copy the dock because expandable blocks modify it
	    blockList.last().copyDocks();
	    blockList.last().copySize();
	}

	function loadStart() {
	    // Always start with a start block.
	    newBlock(startBlock);
	    blockList[0].x = 50;
	    blockList[0].y = 50;
	    blockList[0].connections = [null, null, null];

	    updateBlockImages();
	    updateBlockLabels();

	    // where to put this?
	    updatePalettes();
	}

        function loadBlocks(blockObjs) {
	    // Append to the current set of blocks.
	    var adjustTheseDocks = [];
	    var blockOffset = blockList.length;

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
		    newBlock(startBlock);
		    blockList[thisBlock].connections.push(null);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    blockList[thisBlock].connections.push(null);
		    break;
		case 'do':
		case 'stack':
		    newBlock(doBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'storein':
		    newBlock(storeinBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    pushConnection(blkData[4][3], blockOffset, thisBlock);
		    break;
		case 'box':
		    newBlock(boxBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'action':
		case 'hat':
		    newBlock(actionBlock);
		    blockList[thisBlock].connections.push(null);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    blockList[thisBlock].connections.push(null);
		    break;
                case 'repeat':
		    newBlock(repeatBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    pushConnection(blkData[4][3], blockOffset, thisBlock);
		    break;
		case 'vspace':
		    newBlock(vspaceBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'clear':
		case 'clean':
		    newBlock(clearBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
                case 'setxy':
		case 'setxy2':
		    newBlock(setxyBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    pushConnection(blkData[4][3], blockOffset, thisBlock);
		    break;
                case 'arc':
		    newBlock(arcBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    pushConnection(blkData[4][3], blockOffset, thisBlock);
		    break;
		case 'forward':
		    newBlock(forwardBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'back':
		    newBlock(backBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'left':
		    newBlock(leftBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'right':
		    newBlock(rightBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'setheading':
		    newBlock(setheadingBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'heading':
		    newBlock(headingBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'x':
		case 'xcor':
		    newBlock(xBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'y':
		case 'ycor':
		    newBlock(yBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'plus':
		case 'plus2':
		    newBlock(plusBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'multiply':
		case 'product2':
		    newBlock(multiplyBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'divide':
		case 'division2':
		    newBlock(divideBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'minus':
		case 'minus2':
		    newBlock(minusBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'color':
		case 'hue':
		    newBlock(colorBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'setcolor':
		case 'sethue':
		    newBlock(setcolorBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'value':
		case 'shade':
		    newBlock(shadeBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'setvalue':
		case 'setshade':
		    newBlock(setshadeBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'gray':
		case 'grey':
		    newBlock(chromaBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'setgray':
		case 'setgrey':
		case 'setchroma':
		    newBlock(setchromaBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'pensize':
		    newBlock(pensizeBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    break;
		case 'setpensize':
		    newBlock(setpensizeBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    pushConnection(blkData[4][2], blockOffset, thisBlock);
		    break;
		case 'penup':
		    newBlock(penupBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'pendown':
		    newBlock(pendownBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'startfill':
		case 'beginfill':
		    newBlock(startfillBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'stopfill':
		case 'endfill':
		    newBlock(endfillBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'fillscreen':
		case 'setbackgroundcolor':
		    newBlock(backgroundBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    pushConnection(blkData[4][1], blockOffset, thisBlock);
		    break;
		case 'number':
		    newBlock(numberBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = value;
		    break;
		case 'text':
		case 'string':
		    newBlock(textBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = value;
		    break;
		case 'red':
		    newBlock(numberBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = 0;
		    break;
		case 'orange':
		    newBlock(numberBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = 10;
		    break;
		case 'yellow':
		    newBlock(numberBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = 20;
		    break;
		case 'green':
		    newBlock(numberBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = 40;
		    break;
		case 'blue':
		    newBlock(numberBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = 70;
		    break;
		case 'leftpos':
		    newBlock(numberBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = -(canvas.width / 2);
		    break;
		case 'rightpos':
		    newBlock(numberBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = (canvas.width / 2);
		    break;
		case 'toppos':
		    newBlock(numberBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = (canvas.height / 2);
		    break;
		case 'botpos':
		case 'bottompos':
		    newBlock(numberBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = -(canvas.height / 2);
		    break;
		case 'width':
		    newBlock(numberBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = canvas.width;
		    break;
		case 'height':
		    newBlock(numberBlock);
		    pushConnection(blkData[4][0], blockOffset, thisBlock);
		    blockList[thisBlock].value = canvas.height;
		    break;
		default:
		    console.log('No factory for ' + name);
                    break;
		}
		if (thisBlock == blockList.length - 1) {
		    if (blockList[thisBlock].connections[0] == null) {
			blockList[thisBlock].x = blkData[2];
			blockList[thisBlock].y = blkData[3];
			adjustTheseDocks.push(thisBlock);
		    }
		}
	    }
	    // for (var blk = 0; blk < blockList.length; blk++) {
		// console.log(blk + ' ' + blockList[blk].name + ' ' + blockList[blk].connections + ' ' + blockList[blk].value);
	    // }
	    updateBlockImages();
	    updateBlockLabels();
	    for (var blk = 0; blk < adjustTheseDocks.length; blk++) {
		loopCounter = 0;
		adjustDocks(adjustTheseDocks[blk]);
	    }

	    update = true;

	    // We need to wait for the blocks to load before expanding them.
	    setTimeout(function(){expandClamps();}, turtleDelay); 
        }

        function pushConnection(connection, blockOffset, blk) {
	    if (connection == null) {
		    blockList[blk].connections.push(null);
	    } else {
		connection += blockOffset;
		blockList[blk].connections.push(connection);
	    }
	}

        function runLogoCommands(startHere) {
	    // We run the logo commands here.
	    var d = new Date();
	    time = d.getTime();

	    // First we need to reconcile the values in all the value blocks
	    // with their associated textareas.
	    for (var blk = 0; blk < blockList.length; blk++) {
		if (blockList[blk].label != null) {
		    blockList[blk].value = blockList[blk].label.value;
		}
	    }

	    // Execute turtle code here...  (1) Find the start block
	    // (or the top of each stack) and build a list of all of
	    // the named action stacks (wishing I had a Python
	    // dictionary about now.)
	    var startBlock = null
	    findStacks();
	    actionList = [];
	    for (var blk = 0; blk < stackList.length; blk++) {
		if (blockList[stackList[blk]].name == 'start') {
		    // Don't start on a start block in the trash.
		    if (!blockList[stackList[blk]].trash) {
			startBlock = stackList[blk];
		    }
		} else if (blockList[stackList[blk]].name == 'action') {
		    // does the action stack have a name?
		    c = blockList[stackList[blk]].connections[1];
		    b = blockList[stackList[blk]].connections[2];
		    if (c != null && b != null) {
			// Don't use an action block in the trash.
			if (!blockList[stackList[blk]].trash) {
			    actionList.push([blockList[c].value, b]);
			}
		    }
		}
	    }

	    // (2) Execute the stack.
	    if (startHere != null) {
		runQueue = [];
		countQueue = [];
		runFromBlock(startHere);
	    } else if (startBlock != null) {
		runQueue = [];
		countQueue = [];
		runFromBlock(startBlock);
	    } else {
		for (var blk = 0; blk < stackList.length; blk++) {
		    if (isNoRunBlock(blk)) {
			continue;
		    } else {
			if (!blockList[stackList[blk]].trash) {
			    runFromBlock(stackList[blk]);
			}
		    }
		}
	    }
            update = true;
        }

	function runFromBlock(blk) { 
	    if (blk == null) {
		return;
	    }
	    // console.log('running ' + blockList[blk].name);
	    setTimeout(function(){runFromBlockNow(blk);}, turtleDelay);
	}

        function runFromBlockNow(blk) {
	    // Run a stack of blocks, beginning with blk.
	    // (1) Evaluate any arguments (beginning with connection[1]);
	    var args = [];
	    if(blockList[blk].protoblock.args > 0) {
		for (var i = 1; i < blockList[blk].protoblock.args + 1; i++) {
		    args.push(parseArg(blockList[blk].connections[i]));
		}
	    }

	    // (2) Run function associated with the block;

	    // All flow blocks have a nextflow, but it can be null
	    // (end of flow)
	    var nextflow = blockList[blk].connections.last();
	    if (nextflow != null) {
		runQueue.push(nextflow);
		countQueue.push(1);
	    }
	    // Some flow blocks have childflows, e.g., repeat
	    var childflow = null;

	    if (turtleDelay != null) {
		highlight(blk);
	    }

	    switch (blockList[blk].name) {
	    case 'start':
 		if (args.length == 1) {
		    childflow = args[0];
		    childflowCount = 1;
		}
		break;
	    case 'do':
 		if (args.length == 1) {
		    for (i = 0; i < actionList.length; i++) {
			if (actionList[i][0] == args[0]) {
			    childflow = actionList[i][1];
			    childflowCount = 1;
			    break;
			}
		    }
		}
		break;
	    case 'repeat':
 		if (args.length == 2) {
		    childflow = args[1];
		    childflowCount = args[0];
		}
		break;
	    case 'if':
 		if (args.length == 2) {
		    if (args[0]) {
			childflow = args[1];
			childflowCount = 1;
		    }
		}
		break;
	    case 'storein':
 		if (args.length == 2) {
		    doStorein(args[0], args[1]);
		}
		break;
	    case 'clear':
		doClear();
		break;
	    case 'setxy':
 		if (args.length == 2) {
		    doSetXY(args[0], args[1]);
		}
		break;
	    case 'arc':
 		if (args.length == 2) {
		    doArc(args[0], args[1]);
		}
		break;
            case 'forward':
 		if (args.length == 1) {
		    doForward(args[0]);
		}
		break;
            case 'back':
		if (args.length == 1) {
		    doForward(-args[0]);
         	}
		break;
            case 'right':
		if (args.length == 1) {
		    doRight(args[0]);
         	}
		break;
            case 'left':
		if (args.length == 1) {
		    doRight(-args[0]);
         	}
		break;
            case 'setheading':
		if (args.length == 1) {
		    doSetHeading(args[0]);
         	}
		break;
            case 'setcolor':
		if (args.length == 1) {
		    doSetColor(args[0]);
         	}
		break;
            case 'setshade':
		if (args.length == 1) {
		    doSetValue(args[0]);
         	}
		break;
            case 'setgrey':
		if (args.length == 1) {
		    doSetChroma(args[0]);
         	}
		break;
            case 'setpensize':
		if (args.length == 1) {
		    doSetPensize(args[0]);
         	}
		break;
            case 'beginfill':
		doStartFill();
		break;
            case 'endfill':
		doEndFill();
		break;
            case 'fillscreen':
		setBackgroundColor();
		break;
            case 'penup':
		doPenUp();
		break;
            case 'pendown':
		doPenDown();
		break;
	    }

	    // (3) Queue block below this block.

	    // If there is a childflow, queue it.
	    if (childflow != null) {
		runQueue.push(childflow);
		countQueue.push(childflowCount);
	    }

	    var nextBlock = null;
	    // Run the last flow in the queue.
	    if (runQueue.length > 0) {
		nextBlock = runQueue.last();
		if(countQueue.last() == 1) {
		    // Finished child so pop it off the queue.
		    runQueue.pop();
		    countQueue.pop();
		} else {
		    // Decrement the counter.
		    count = countQueue.pop();
		    count -= 1;
		    countQueue.push(count);
		}
	    }
	    if (nextBlock != null) {
		runFromBlock(nextBlock);
	    } else {
		setTimeout(function(){unhighlight();}, turtleDelay);
	    }
	}

	function parseArg(blk) {
	    // Retrieve the value of a block.
	    if (blk == null) {
		activity.showAlert('WARNING',
				   'missing argument', null,
				   function() {});
		return null
	    } else if (isValueBlock(blk)) {
		return blockList[blk].value;
	    } else if (isArgBlock(blk)) {
		switch (blockList[blk].name) {
		case 'box':
		    cblk = blockList[blk].connections[1];
		    name = parseArg(cblk);
		    i = findBox(name);
		    if (i == null) {
			blockList[blk].value = null;
		    } else {
			blockList[blk].value = boxList[i][1];
		    }
		    break;
		case 'greater':
		    cblk1 = blockList[blk].connections[1];
		    cblk2 = blockList[blk].connections[2];
		    a = parseArg(cblk1);
		    b = parseArg(cblk2);
		    blockList[blk].value = (a > b);
		    break;
		case 'plus':
		    cblk1 = blockList[blk].connections[1];
		    cblk2 = blockList[blk].connections[2];
		    a = parseArg(cblk1);
		    b = parseArg(cblk2);
		    blockList[blk].value = doPlus(a, b);
		    break;
		case 'multiply':
		    cblk1 = blockList[blk].connections[1];
		    cblk2 = blockList[blk].connections[2];
		    a = parseArg(cblk1);
		    b = parseArg(cblk2);
		    blockList[blk].value = doMultiply(a, b);
		    break;
		case 'divide':
		    cblk1 = blockList[blk].connections[1];
		    cblk2 = blockList[blk].connections[2];
		    a = parseArg(cblk1);
		    b = parseArg(cblk2);
		    blockList[blk].value = doDivide(a, b);
		    break;
		case 'minus':
		    cblk1 = blockList[blk].connections[1];
		    cblk2 = blockList[blk].connections[2];
		    a = parseArg(cblk1);
		    b = parseArg(cblk2);
		    blockList[blk].value = doMinus(a, b);
		    break;
		case 'heading':
		    blockList[blk].value = turtleOrientation;
		    break;
		case 'x':
		    blockList[blk].value = screenX2turtleX(turtleBitmap.x);
		    break;
		case 'y':
		    blockList[blk].value = invertY(turtleBitmap.y);
		    break;
		case 'color':
		    blockList[blk].value = turtleColor;
		    break;
		case 'shade':
		    blockList[blk].value = turtleValue;
		    break;
		case 'grey':
		    blockList[blk].value = turtleChroma;
		    break;
		case 'pensize':
		    blockList[blk].value = turtleStroke;
		    break;
		case 'mouse x':
		    blockList[blk].value = stageX;
		    break;
		case 'mouse y':
		    blockList[blk].value = stageY;
		    break;
		case 'time':
		    var d = new Date();
		    blockList[blk].value = (d.getTime() - time) / 1000;
		    break;
		}
		return blockList[blk].value;
	    } else {
		return blk;
	    }
	}

	function unhighlight() {
	    if (highlightedBlock != null) {
		var myBlock = blockList[highlightedBlock];
		myBlock.bitmap.visible = true;
		myBlock.highlightBitmap.visible = false;
		if (isExpandableBlock(highlightedBlock)) {
		    for (var i = 0; i < myBlock.fillerBitmaps.length; i++) {
			myBlock.fillerBitmaps[i].visible = true;
			myBlock.highlightFillerBitmaps[i].visible = false;
		    }
		    if (myBlock.bottomBitmap != null) {
			myBlock.bottomBitmap.visible = true;
			myBlock.highlightBottomBitmap.visible = false;
		    }
		}
		update = true;
	    }
	    highlightedBlock = null;
	}

	function highlight(blk) {
	    if (blk != null) {
		unhighlight();
		var myBlock = blockList[blk];
		myBlock.bitmap.visible = false;
		myBlock.highlightBitmap.visible = true;
		if (isExpandableBlock(blk)) {
		    for (var i = 0; i < myBlock.fillerBitmaps.length; i++) {
			myBlock.fillerBitmaps[i].visible = false;
			myBlock.highlightFillerBitmaps[i].visible = true;
		    }
		    if (myBlock.bottomBitmap != null) {
			myBlock.bottomBitmap.visible = false;
			myBlock.highlightBottomBitmap.visible = true;
		    }
		}

		highlightedBlock = blk;
		update = true;
	    }
	}

	function hideBlock(blk) {
	    myBlock = blockList[blk];
	    myBlock.bitmap.visible = false;
	    if (isValueBlock(blk)) {
		myBlock.label.style.display = 'none';
	    }
	    if (isExpandableBlock(blk)) {
		for (var i = 0; i < myBlock.fillerBitmaps.length; i++) {
		    myBlock.fillerBitmaps[i].visible = false;
		}
		myBlock.bottomBitmap.visible = false;
	    } else if (isValueBlock(blk)) {
		myBlock.text.visible = false;
	    }
	}

	function hideBlocks() {
	    // Hide all the blocks.
	    for (blk = 0; blk < blockList.length; blk++) {
		hideBlock(blk);
	    }
	    // And hide some other things.
	    turtleBitmap.visible = false;
	    trashBitmap.visible = false;
	    update = true;
	}

	function showBlocks() {
	    // Show all the blocks.
	    for (blk = 0; blk < blockList.length; blk++) {
		myBlock = blockList[blk];
		if (myBlock.trash) {
		    continue;  // Don't show blocks in the trash.
		}
		myBlock.bitmap.visible = true;
		if (isValueBlock(blk)) {
		    myBlock.label.style.display = '';
		}
		if (isExpandableBlock(blk)) {
		    for (var i = 0; i < myBlock.fillerBitmaps.length; i++) {
			myBlock.fillerBitmaps[i].visible = true;
		    }
		    myBlock.bottomBitmap.visible = true;
		} else if (isValueBlock(blk)) {
		    myBlock.text.visible = true;
		}
	    }
	    // And show some other things.
	    turtleBitmap.visible = true;
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

	// Turtle functions
        function doForward(steps) {
	    // Move forward.
	    // old turtle point
            oldPt = new createjs.Point(screenX2turtleX(turtleBitmap.x),
					   invertY(turtleBitmap.y));
	    // new turtle point
	    var rad = turtleOrientation * Math.PI / 180.0;
	    var newPt = new createjs.Point(
		oldPt.x + Number(steps) * Math.sin(rad),
		oldPt.y + Number(steps) * Math.cos(rad))
	    moveTurtle(oldPt.x, oldPt.y, newPt.x, newPt.y, true);
	    turtleBitmap.x = turtleX2screenX(newPt.x);
	    turtleBitmap.y = invertY(newPt.y);
            update = true;
	}

        function doSetXY(x, y) {
	    // old turtle point
            oldPt = new createjs.Point(screenX2turtleX(turtleBitmap.x),
				       invertY(turtleBitmap.y));
	    // new turtle point
	    var newPt = new createjs.Point(Number(x), Number(y));
	    moveTurtle(oldPt.x, oldPt.y, newPt.x, newPt.y, true);
	    turtleBitmap.x = turtleX2screenX(newPt.x);
	    turtleBitmap.y = invertY(newPt.y);
            update = true;
	}

        function doArc(angle, radius) {
	    var adeg = Number(angle);
	    var arad = (adeg / 180) * Math.PI;
	    var orad = (turtleOrientation / 180) * Math.PI;
	    var r = Number(radius);

	    // old turtle point
            oldPt = new createjs.Point(screenX2turtleX(turtleBitmap.x),
				       invertY(turtleBitmap.y));

	    if( adeg < 0 ) {
		var anticlockwise = true;
		adeg = -adeg;
		// center point for arc
		var cx = oldPt.x - Math.cos(orad) * r;
		var cy = oldPt.y + Math.sin(orad) * r;
		// new position of turtle
		var nx = cx + Math.cos(orad + arad) * r;
		var ny = cy - Math.sin(orad + arad) * r;
	    } else {
		var anticlockwise = false;
		// center point for arc
		var cx = oldPt.x + Math.cos(orad) * r;
		var cy = oldPt.y - Math.sin(orad) * r;
		// new position of turtle
		var nx = cx - Math.cos(orad + arad) * r;
		var ny = cy + Math.sin(orad + arad) * r;
	    }
	    arcTurtle(cx, cy, ox, oy, nx, ny, r, orad, orad + arad, anticlockwise, true);

	    turtleBitmap.x = turtleX2screenX(nx),
	    turtleBitmap.y = invertY(ny);
	    if (anticlockwise) {
		doRight(-adeg);
	    } else {
		doRight(adeg);
	    }
            update = true;
	}

	function doRight(degrees) {
	    // Turn right and display corresponding turtle graphic.
	    turtleOrientation += Number(degrees);
	    turtleOrientation %= 360;
	    turtleBitmap.rotation = turtleOrientation;
            update = true;
	}

	function doSetHeading(degrees) {
	    turtleOrientation = Number(degrees);
	    turtleOrientation %= 360;
	    turtleBitmap.rotation = turtleOrientation;
            update = true;
	}

	function doSetColor(hue) {
	    turtleColor = Number(hue);
            canvasColor = getMunsellColor(turtleColor, turtleValue, turtleChroma);
	}

	function doSetValue(shade) {
	    turtleValue = Number(shade);
            canvasColor = getMunsellColor(turtleColor, turtleValue, turtleChroma);
	}

	function doSetChroma(chroma) {
	    turtleChroma = Number(chroma);
            canvasColor = getMunsellColor(turtleColor, turtleValue, turtleChroma);
	}

	function doSetPensize(size) {
	    turtleStroke = size;
	}

        function doPenUp() {
	    turtlePenState = false;
	}

	function doPenDown() {
	    turtlePenState = true;
	}

        function doStartFill() {
	    /// start tracking points here
	    drawingCanvas.graphics.beginFill(canvasColor);
	    turtleFillState = true;
	}

	function doEndFill() {
	    /// redraw the points with fill enabled
	    drawingCanvas.graphics.endFill();
	    turtleFillState = false;
	}

	function setBackgroundColor() {
	    /// change body background in DOM to current color
	    var body = document.getElementById('body');
	    body.style.background = canvasColor;
	}

	function doClear() {
	    // Reset turtle.
	    turtleX = 0;
	    turtleY = 0;
	    turtleOrientation = 0.0;
	    turtleColor = defaultColor;
	    turtleValue = defaultValue;
	    turtleChroma = defaultChroma;
	    turtleStroke = defaultStroke;

	    turtleBitmap.x = turtleX2screenX(turtleX);
	    turtleBitmap.y = invertY(turtleY);
	    turtleBitmap.rotation = turtleOrientation;

	    // Clear all the boxes.
	    boxList = [];

	    // Clear all graphics.
	    turtlePenState = true;
	    turtleFillState = false;
	    time = 0;

	    canvasColor = getMunsellColor(
		defaultBackgroundColor[0], defaultBackgroundColor[1], defaultBackgroundColor[2]);
	    setBackgroundColor();
            canvasColor = getMunsellColor(turtleColor, turtleValue, turtleChroma);
            canvasStroke = turtleStroke;
            drawingCanvas.graphics.clear();
            update = true;
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

	function screenX2turtleX(x) {
	    return x - canvas.width / 2.0
	}

        function turtleX2screenX(x) {
            return canvas.width / 2.0 + x
	}

        function invertY(y) {
            return canvas.height / 2.0 - y;
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
