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
    var activity = require("sugar-web/activity/activity");
    var icon = require("sugar-web/graphics/icon");
    require("easel");
    // Palettes and Blocks are defined here
    require("activity/blocks")

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
        var activityButton = document.getElementById("activity-button");
        activity.getXOColor(function (error, colors) {
            icon.colorize(activityButton, colors);
        });

        var newButton = document.getElementById("new-button");
        newButton.onclick = function () {
	    runLogoCommands();
        }

        // Make the activity stop with the stop button.
        var stopButton = document.getElementById("stop-button");
        stopButton.addEventListener('click', function (e) {
            activity.close();
        });

        var canvas = document.getElementById("myCanvas");

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

        var color;
        var stroke;
        var colors;
        var index;

	// To avoid infinite loops
	var loopCounter;

	var activeBlock = null;

	var turtle_delay = 1000;
        var turtle_bitmap = null
        var Turtle = "images/turtle.svg";
	var turtleOrientation = 0.0;
	var turtleColor = 0;
	var turtleStroke = 5;
        var oldPt;
	var turtleX = 0;
	var turtleY = 0;

	// functions needed by block.js
	updater = updateBlocks;
	adjuster = adjustDocks;

	// Get things started
	init();

        function init() {
            if (window.top != window) {
                document.getElementById("header").style.display = "none";
            }
            document.getElementById("loader").className = "loader";
            // Create the stage and point it to the canvas.
            // canvas = document.getElementById("myCanvas");

	    // Load a project.
	    loadStart();

	    // Make sure blocks are aligned.
	    findStacks();
	    for (i = 0; i < stackList.length; i++) {
		findDragGroup(stackList[i]);
		adjustBlockPositions();
	    }

            index = 0;

            // Check to see if we are running in a browser with touch support.
            stage = new createjs.Stage(canvas);
            // Enable touch interactions if supported on the current device.
            createjs.Touch.enable(stage);
            // Keep tracking the mouse even when it leaves the canvas.
            stage.mouseMoveOutside = true;
            // Enabled mouse over and mouse out events.
            stage.enableMouseOver(10);

	    turtle = new Image();
	    turtle.src = Turtle;
	    turtle.onload = handleTurtleLoad;

            // Create a drawing canvas
            drawingCanvas = new createjs.Shape();
            stage.addChild(drawingCanvas);
            stage.update();
        }

        function stop() {
	    //
            createjs.Ticker.removeEventListener("tick", tick);
        }

        function handleImageLoad(event) {
	    // TODO: use shadow
	    // Load a block
            var image = event.target;
            var bitmap;
            var container = new createjs.Container();
            stage.addChild(container);

	    var thisBlock = -1
            for (var blk = 0; blk < blockList.length; blk++) {
		if (blockList[blk].image == image) {
		    thisBlock = blk;
		    break;
		}
            }

            // Create the bitmap for the block.
	    bitmap = new createjs.Bitmap(image);
	    blockList[thisBlock].bitmap = bitmap;
	    container.addChild(bitmap);
	    bitmap.x = blockList[thisBlock].x;
	    bitmap.y = blockList[thisBlock].y;
	    bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;
	    bitmap.name = "bmp_" + thisBlock;
	    bitmap.cursor = "pointer";
	    adjustLabelPosition(thisBlock, bitmap.x, bitmap.y);

	    // Expandable blocks have some extra parts.
	    if (isExpandableBlock(thisBlock)) {
		// Save the container as we may need it later.
		blockList[thisBlock].myContainer = container;

		var yoff = blockList[thisBlock].protoblock.yoff;
		blockList[thisBlock].filler_bitmaps = [];
		blockList[thisBlock].bottom_bitmap = null;
		var bottom_bitmap = new createjs.Bitmap(blockList[thisBlock].bottom_image);
		blockList[thisBlock].bottom_bitmap = bottom_bitmap;
		container.addChild(bottom_bitmap);
		bottom_bitmap.x = bitmap.x;
		bottom_bitmap.y = bitmap.y + yoff;
		bottom_bitmap.scaleX = bottom_bitmap.scaleY = bottom_bitmap.scale = 1;
		bottom_bitmap.name = "bmp_" + thisBlock + "_bottom";
	    }

            // Create a shape that represents the center of the icon.
            var hitArea = new createjs.Shape();
            // Position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
	    // * number and text blocks have a handle on the right side;
	    // * other blocks should be sensitive in the middle.
	    if (isValueBlock(thisBlock)) {
		hitArea.graphics.beginFill("#FFF").drawEllipse(
			-22, -28, 48, 36);
		hitArea.x = image.width - 24;
	    } else {
		hitArea.graphics.beginFill("#FFF").drawEllipse(
			-44, -28, 96, 36);
		hitArea.x = image.width / 2;
	    }
	    hitArea.y = image.height / 2;
            bitmap.hitArea = hitArea;

            // Wrapper function to provide scope for the event handlers.
            (function (target) {
		var moved = false
		bitmap.addEventListener("click", handleClick);
		bitmap.addEventListener("mousedown", handleMouseDown);
		bitmap.addEventListener("mouseover", handleMouseOver);
		bitmap.addEventListener("mouseout", handleMouseOut);

		function handleClick(event) {
		    if (!moved) {
			// TODO: run block on click
			console.log('click');
		    }
		}

		function handleMouseDown(event) {
		    // Bump the target in front of its siblings.
		    moved = false;
		    container.addChild(target);
		    var offset = {
			x: target.x - event.stageX,
			y: target.y - event.stageY
		    };

		    event.addEventListener("mousemove", handleMouseMove);

		    // TODO: Use pressmove, pressup??
		    function handleMouseMove(event) {
			// reset scale when moving (easier to dock that way)
			bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;

			moved = true;
			var oldX = bitmap.x;
			var oldY = bitmap.y;
			target.x = event.stageX + offset.x;
			target.y = event.stageY + offset.y;

			// Which block is this?
			var blk = -1;
			for (var i = 0; i < blockList.length; i++) {
			    if (blockList[i].bitmap == bitmap) {
				blk = i;
				break;
			    }
			}

			var dx = bitmap.x - oldX;
			var dy = bitmap.y - oldY;

			// Move any extra parts.
			if (isExpandableBlock(thisBlock)) {
			    moveExtraParts(thisBlock, dx, dy);
			}

			// Move the label.
			adjustLabelPosition(thisBlock, bitmap.x, bitmap.y);

			// Move any connected blocks.
			findDragGroup(blk)
			if (dragGroup.length > 0) {
			    for (var b = 0; b < dragGroup.length; b++) {
				blk = dragGroup[b]
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
			target.scaleX = target.scaleY = target.scale * 1.2;
			activeBlock = thisBlock;
			update = true;
		    }
		}

		function handleMouseOut(event) {
		    if (activeBlock != thisBlock) {
			return;
		    }
		    if (moved) {
			// When a block is moved:
			// (0) Is it inside of a expandable block?
			var checkExpandableBlocks = [];
			var blk = insideExpandableBlock(thisBlock);
			while (blk != null) {
			    checkExpandableBlocks.push(blk);
			    blk = insideExpandableBlock(blk);
			}
			// (1) Disconnect connection[0];
			var c = blockList[thisBlock].connections[0];
			if (c != null) {
			    // disconnect both ends of the connection
			    for (i = 1;
				 i < blockList[c].connections.length; i++) {
				if (blockList[c].connections[i] == thisBlock) {
				    blockList[c].connections[i] = null;
				    break;
				}
			    }
  			    blockList[thisBlock].connections[0] = null;
			}
			// (2) Look for a new connection;
			var dx1 = blockList[thisBlock].bitmap.x + 
			    blockList[thisBlock].docks[0][0];
			var dy1 = blockList[thisBlock].bitmap.y + 
			    blockList[thisBlock].docks[0][1];
			// Find the nearest dock; if it is close enough, connect;
			var newBlock = null
			var newConnection = null
			var min = 400;
			var blkType = blockList[thisBlock].docks[0][2]
			for (b = 0; b < blockList.length; b++) {
			    // Don't connect to yourself.
			    if (b == thisBlock) {
				continue;
			    }
			    for (c = 1; c < blockList[b].connections.length; c++) {
				// Look for available connections
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
				}
			    }
			}
			if (newBlock != null) {
			    // We found a match.
			    blockList[thisBlock].connections[0] = newBlock;
			    var connection = blockList[newBlock].connections[newConnection];
			    if(connection != null) {
				if (isArgBlock(thisBlock)) {
				    blockList[connection].connections[0] = null;
				    // Fixme: could be more than one block.
				    moveBlockRelative(connection, 20, 20);
				} else {
				    var bottom = findBottomBlock(thisBlock);
				    blockList[connection].connections[0] = bottom;
				    blockList[bottom].connections[blockList[bottom].connections.length-1] = connection;
				}
			    }
			    blockList[newBlock].connections[newConnection] = thisBlock;
			    loopCounter = 0
			    adjustDocks(newBlock);
			}
			// (3) Recheck if it inside of a expandable block
			var blk = insideExpandableBlock(thisBlock);
			while (blk != null) {
			    checkExpandableBlocks.push(blk);
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
		    target.scaleX = target.scaleY = target.scale;
		    activeBlock = null;
		    update = true;
		}

            })(bitmap);

            document.getElementById("loader").className = "";
            createjs.Ticker.addEventListener("tick", tick);
        }

	function moveExtraParts(blk, dx, dy) {
	    // Expandable blocks have extra parts that need attention.
	    if (blockList[blk].filler_bitmaps == undefined) {
		return;  // still in init stage
	    }
	    for (var i = 0; i < blockList[blk].filler_bitmaps.length; i++) {
		blockList[blk].filler_bitmaps[i].x += dx;
		blockList[blk].filler_bitmaps[i].y += dy;
	    }
	    blockList[blk].bottom_bitmap.x += dx;
	    blockList[blk].bottom_bitmap.y += dy;
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
	    return false;
	}

        function handleTurtleLoad(event) {
	    // TODO: use rotation attribute of bitmap

	    // Load the turtle
            var image = event.target;
            var imgW = image.width;
            var imgH = image.height;
            var bitmap;
            var container = new createjs.Container();
            stage.addChild(container);

            // Create a shape that represents the center of the icon
            var hitArea = new createjs.Shape();
            hitArea.graphics.beginFill("#FFF").drawEllipse(-22, -28, 48, 36);
            // Position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
            hitArea.x = imgW / 2;
            hitArea.y = imgH / 2;

            // Create a turtle
            bitmap = new createjs.Bitmap(image);
	    turtle_bitmap = bitmap;
            container.addChild(bitmap);

            bitmap.x = turtleX2screenX(turtleX);
            bitmap.y = invertY(turtleY);
            bitmap.regX = imgW / 2 | 0;
            bitmap.regY = imgH / 2 | 0;
            bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1
            bitmap.name = "bmp_turtle";

            bitmap.cursor = "pointer";

            // Assign the hitArea to bitmap to use it for hit tests:
            bitmap.hitArea = hitArea;

            // Wrapper function to provide scope for the event handlers:
            (function (target) {
		var moved = false
		bitmap.addEventListener("click", handleClick);
		bitmap.addEventListener("mousedown", handleMouseDown);
		bitmap.addEventListener("mouseover", handleMouseOver);
		bitmap.addEventListener("mouseout", handleMouseOut);

		function handleClick(event) {
		    if (!moved) {
			// TODO: run block on click
			console.log('turtle click');
		    }
		}

		function handleMouseDown(event) {
		    moved = false;
                    container.addChild(target);
                    var offset = {
                        x: target.x - event.stageX,
                        y: target.y - event.stageY
                    };

		    event.addEventListener("mousemove", handleMouseMove);

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
		    turtle_bitmap.x = target.x;
		    turtle_bitmap.y = target.y;
                    update = true;
                }
            })(bitmap);

            document.getElementById("loader").className = "";
            createjs.Ticker.addEventListener("tick", tick);
        }

	function moveTurtle(x, y, invert) {
	    if (invert) {
		ox = turtleX2screenX(oldPt.x);
		nx = turtleX2screenX(x);
		oy = invertY(oldPt.y);
		ny = invertY(y);
	    } else {
		ox = oldPt.x;
		nx = x;
		oy = oldPt.y;
		ny = y;
	    }
            drawingCanvas.graphics.setStrokeStyle(
		stroke, 'round', 'round'
	    ).beginStroke(color).moveTo(
		ox, oy
	    ).curveTo(ox, oy, nx, ny);
	    oldPt.x = x;
            oldPt.y = y;
	}

        function adjustBlockPositions() {
	    // Adjust the docking postions of all blocks in the drag group
	    if (dragGroup.length < 2) {
		return;
	    }

	    loopCounter = 0
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
	    var j = blockList[blk].filler_bitmaps.length;
	    if (size < blockList[blk].filler_bitmaps.length + 1) {
		var n = j - size + 1;  // one slot built in
		for (var i = 0; i < n; i++) {
		    removeFiller(blk);
		    blockList[blk].docks.last()[1] -= loff;
		}
                j = blockList[blk].filler_bitmaps.length;
		var o = yoff + j * loff;
		blockList[blk].bottom_bitmap.y = blockList[blk].bitmap.y + o;
		if (blockList[blk].connections.last() != null) {
		    adjustDocks(blk);
		}
                update = true;
	    } else if (size > blockList[blk].filler_bitmaps.length) {
		var n = size - j - 1;  // one slot built in
		for (var i = 0; i < n; i++) {
		    var c = i + j;

		    addFiller(blk, yoff + c * loff, c);
		    blockList[blk].docks.last()[1] += loff;
		}
                j = blockList[blk].filler_bitmaps.length;
		var o = yoff + j * loff;
		blockList[blk].bottom_bitmap.y = blockList[blk].bitmap.y + o;
		if (blockList[blk].connections.last() != null) {
		    adjustDocks(blk);
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
	    var filler_bitmap = blockList[blk].filler_bitmaps.pop();
	    blockList[blk].myContainer.removeChild(filler_bitmap);
	    if (findBitmap(filler_bitmap.name) == null) {
		bitmapCache.push(filler_bitmap);
	    }
	    update = true;
	}

	function addFiller(blk, offset, c) {
	    var name = "bmp_" + blk + "_filler_" + c;
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
	    blockList[blk].filler_bitmaps.push(bitmap);
	    blockList[blk].myContainer.addChild(bitmap);
	    bitmap.x = blockList[blk].bitmap.x;
	    bitmap.y = blockList[blk].bitmap.y + offset;
	    bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;
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
		size += 2;  // add top and bottom of clamp
	    } else {
		size = blockList[blk].protoblock.size;
	    }

	    // check on any connected block
	    var cblk = blockList[blk].connections.last();
	    size += getStackSize(cblk);
	    return size;
	}

	function adjustDocks(blk) {
	    // Give a block, adjust the dock positions
	    // of all of the blocks connected to it

	    // Do we need these? All blocks have connections.
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
		for (var i = 0; i < blockList.length; i++) {
		    console.log(i + ': ' + blockList[i].connections);
		}
		return
	    }

	    // Walk through each connection...
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
		console.log('searching for expandables in ' + stackList[i] + ' ' + blockList[stackList[i]].name);
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
		console.log('expanding ' + expandablesList[i] + ' ' + blockList[expandablesList[i]].name);
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
		if (blockList[blk].image == null) {
		    blockList[blk].image = new Image();
		    blockList[blk].image.src = blockList[blk].protoblock.getSvgPath();
		    blockList[blk].image.onload = handleImageLoad;
		    if (isExpandableBlock(blk)) {
			if (isArgBlock(blk)) {
			    blockList[blk].bottom_image = new Image();
			    blockList[blk].bottom_image.src = blockList[blk].protoblock.getArgBottomSvgPath();
			} else if (isSpecialBlock(blk)) {
			    blockList[blk].bottom_image = new Image();
			    blockList[blk].bottom_image.src = blockList[blk].protoblock.getSpecialBottomSvgPath();
			} else {
			    blockList[blk].bottom_image = new Image();
			    blockList[blk].bottom_image.src = blockList[blk].protoblock.getBottomSvgPath();
			}
		    }
		}
	    }
	}

	function updatePalettes() {
	    // Modify the header id with palette info.
	    var html = ''
	    var text = ''
	    for (var palette = 0; palette < paletteList.length; palette++) {
		// console.log(paletteList[palette].getInfo());
		// <button onclick="return toggle('toc');">Toggle Table of Contents</button>
		// <div id="toc">
		// </div>
		text = '<button id="_' + paletteList[palette].name + '_palette"' +
		    ' onclick="return toggle(\'_' +
		    paletteList[palette].name + '_div\');">' +
		    paletteList[palette].name + '</button>';
		html = html + text;
		}

	    for (var palette = 0; palette < paletteList.length; palette++) {
		text = '<div id="_' + paletteList[palette].name + '_div">';
		html = html + text;
		for (var blk = 0; blk < paletteList[palette].blockList.length; blk++) {
		    text = '<button id="_' + 
			paletteList[palette].blockList[blk].name + '_block"' +
			' onclick="return makeBlock(\'' +
			paletteList[palette].blockList[blk].name + '\');">' +
			paletteList[palette].blockList[blk].name + '</button>';
		    html = html + text;
		}
		text = '</div>';
		html = html + text;
	    }
            paletteElem.innerHTML = html;
	    // keep turtle palette open to start
	    for (var palette = 1; palette < paletteList.length; palette++) {
		toggler('_' + paletteList[palette].name + '_div');
	    }
	}

        function updateBlockLabels() {
	    // The modifiable labels are stored in the DOM with a
	    // unique id for each block.  For the moment, we only have
	    // labels for number and text blocks.
            var html = ''
	    var text = ''
	    var value = ''
	    // TODO: FIXME: value may not be accurate... compare with the label
            for (var blk = 0; blk < blockList.length; blk++) {
		if (blockList[blk].name == "number") {
		    if (blockList[blk].label == null) {
			value = blockList[blk].value.toString();
		    } else {
			value = blockList[blk].label.value;
		    }
		    arrLabels[blk] = "_" + blk.toString();
		    text = '<textarea id="_' + arrLabels[blk] +
			'" style="position: absolute; ' + 
			'-webkit-user-select: text;" ' +
			// 'onselect="labelSelected", ' +
			'onchanged="labelChanged", ' +
			'class="number", ' +
			'cols="6", rows="1", maxlength="6">' +
			value + '</textarea>'
		} else if (blockList[blk].name == "text") {
		    arrLabels[blk] = "_" + blk.toString();
		    text = '<textarea id="_' + arrLabels[blk] +
			'" style="position: absolute; ' + 
			'-webkit-user-select: text;" ' +
			// 'onselect="labelSelected", ' +
			'onchanged="labelChanged", ' +
			'class="text", ' +
			'cols="6", rows="1", maxlength="6">' +
			value + '</textarea>'
		} else {
		    arrLabels[blk] = null
		    text = ''
		}
		html = html + text
            }
            labelElem.innerHTML = html;

	    // Then create a list of the label elements
            for (var blk = 0; blk < blockList.length; blk++) {
		if (blockList[blk].bitmap == null) {
		    var x = blockList[blk].x
		    var y = blockList[blk].y
		} else {
		    var x = blockList[blk].bitmap.x
		    var y = blockList[blk].bitmap.y
		}
		if (isValueBlock(blk)) {
		    blockList[blk].label = document.getElementById("_" + arrLabels[blk])
		    // Not sure why this event is not triggered, but
		    // it doesn't matter as long as we read from the
		    // textareas before we run the blocks.
		    // FIXME: Actually, it does matter, since we may
		    // have updated several labels...
		    blockList[blk].label.onchanged=labelChanged

		    adjustLabelPosition(blk, x, y);
		} else {
		    blockList[blk].label = null
		}
            }
	}

        function labelSelected() {
	    console.log('label selected, but which one?')
	}

        function labelChanged() {
	    console.log('label changed, but which one?')
	}

	function adjustLabelPosition(blk, x, y) {
	    // Move the label when the block moves.
	    if (blockList[blk].label == null) {
		return;
	    }
	    if (blockList[blk].protoblock.name == "number") {
		blockList[blk].label.style.left = Math.round(
		    x + canvas.offsetLeft + 30) + "px";
	    } else if (blockList[blk].protoblock.name == "text") {
		blockList[blk].label.style.left = Math.round(
		    x + canvas.offsetLeft + 30) + "px";
	    } else {
	    	blockList[blk].label.style.left = Math.round(
		    x + canvas.offsetLeft + 10) + "px";
	    }
            blockList[blk].label.style.top = Math.round(
		y + canvas.offsetTop + 5) + "px";
	}

        function moveBlock(blk, x, y) {
	    // Move a block (and its label) to x, y.
	    if (blockList[blk].bitmap == null) {
		dx = x - blockList[blk].x;
		dy = y - blockList[blk].y;
		blockList[blk].x = x
		blockList[blk].y = y
	    } else {
		dx = x - blockList[blk].bitmap.x;
		dy = y - blockList[blk].bitmap.y;
		blockList[blk].bitmap.x = x
		blockList[blk].bitmap.y = y
		blockList[blk].x = blockList[blk].bitmap.x
		blockList[blk].y = blockList[blk].bitmap.y
	    }
	    if (isExpandableBlock(blk)) {
		moveExtraParts(blk, dx, dy);
	    }
	    adjustLabelPosition(blk, x, y);
	}

        function moveBlockRelative(blk, dx, dy) {
	    // Move a block (and its label) by dx, dy.
	    if (blockList[blk].bitmap == null) {
		    blockList[blk].x += dx
		    blockList[blk].y += dy
		} else {
		    blockList[blk].bitmap.x += dx
		    blockList[blk].bitmap.y += dy
		    blockList[blk].x = blockList[blk].bitmap.x
		    blockList[blk].y = blockList[blk].bitmap.y
		}
	    if (isExpandableBlock(blk)) {
		moveExtraParts(blk, dx, dy);
	    }
	    adjustLabelPosition(blk, blockList[blk].x, blockList[blk].y);
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

        function loadBlocks() {
	    // This is temporary code for testing.

	    // Add the blocks
	    newBlock(startBlock);
	    blockList[0].x = 400;
	    blockList[0].y = 50;
	    blockList[0].connections = [null, 1, null];

	    newBlock(clearBlock);
	    blockList[1].connections = [0, 2];

	    newBlock(storeinBlock);
	    blockList[2].connections = [1, 3, 4, 5];
	    newBlock(textBlock);
	    blockList[3].connections = [2];
	    blockList[3].value = "size";
	    newBlock(numberBlock);
	    blockList[4].value = 100;
	    blockList[4].connections = [2];

	    newBlock(repeatBlock);
	    blockList[5].connections = [2, 6, 7, null];
	    newBlock(numberBlock);
	    blockList[6].value = 8;
	    blockList[6].connections = [5];

	    newBlock(runBlock);
	    blockList[7].connections = [5, 8, 9];
	    newBlock(textBlock);
	    blockList[8].connections = [7];
	    blockList[8].value = "square";

	    newBlock(rightBlock);
	    blockList[9].connections = [7, 10, null];
	    newBlock(numberBlock);
	    blockList[10].value = 45;
	    blockList[10].connections = [9];

	    newBlock(actionBlock);
	    blockList[11].connections = [null, 12, 13, null];
	    blockList[11].x = 25;
	    blockList[11].y = 50;
	    newBlock(textBlock);
	    blockList[12].connections = [11];
	    blockList[12].value = "square";

	    newBlock(repeatBlock);
	    blockList[13].connections = [11, 14, 15, null];
	    newBlock(numberBlock);
	    blockList[14].value = 4;
	    blockList[14].connections = [13];

	    newBlock(forwardBlock);
	    blockList[15].connections = [13, 16, 18];
	    newBlock(boxBlock);
	    blockList[16].connections = [15, 17];
	    newBlock(textBlock);
	    blockList[17].connections = [16];
	    blockList[17].value = "size";

	    newBlock(rightBlock);
	    blockList[18].connections = [15, 19, null];
	    newBlock(numberBlock);
	    blockList[19].value = 90;
	    blockList[19].connections = [18];

	    newBlock(setcolorBlock);
	    blockList[20].connections = [null, 21, null];
	    blockList[20].x = 25;
	    blockList[20].y = 350;
	    newBlock(numberBlock);
	    blockList[21].value = 70;
	    blockList[21].connections = [20];

	    newBlock(colorBlock);
	    blockList[22].connections = [null];
	    blockList[22].x = 200;
	    blockList[22].y = 300;

	    newBlock(plusBlock);
	    blockList[23].connections = [null, 24, 25];
	    blockList[23].x = 300;
	    blockList[23].y = 300;
	    newBlock(numberBlock);
	    blockList[24].value = 100;
	    blockList[24].connections = [23];
	    newBlock(numberBlock);
	    blockList[25].value = 100;
	    blockList[25].connections = [23];

	    updateBlockImages();
	    updateBlockLabels();
	    // where to put this?
	    updatePalettes();
        }

        function runLogoCommands() {
	    // We run the logo commands here.

	    // Where to put this???
	    expandClamps();
	    update = true;

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
		if (blockList[stackList[blk]].name == "start") {
		    startBlock = stackList[blk];
		} else if (blockList[stackList[blk]].name == "action") {
		    // does the action stack have a name?
		    c = blockList[stackList[blk]].connections[1];
		    b = blockList[stackList[blk]].connections[2];
		    if (c != null && b != null) {
			actionList.push([blockList[c].value, b]);
		    }
		}
	    }

	    // (2) Execute the stack.
	    if (startBlock != null) {
		runFromBlock(startBlock);
	    } else {
		for (var blk = 0; blk < stackList.length; blk++) {
		    if (isNoRunBlock(blk)) {
			continue;
		    } else {
			runFromBlock(stackList[blk]);
		    }
		}
	    }
            update = true;
        }

	function runFromBlock(blk) { 
	    // Highlight current block by scaling
	    if (turtle_delay == null) {
		runFromBlockNow(blk);
	    } else {
		if (blk == null) {
		    activity.showAlert('WARNING',
				       'trying to run null block', null,
				       function() {});
		    return;
		}
		console.log('running ' + blk + ': ' + blockList[blk].name)
		blockList[blk].bitmap.scaleX = 1.2;
		blockList[blk].bitmap.scaleY = 1.2;
		blockList[blk].bitmap.scale = 1.2;
		runFromBlockNow(blk);
		// setTimeout(function(){runFromBlockNow(blk);}, turtle_delay); 
	    }
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
	    switch (blockList[blk].name) {
	    case 'start':
 		if (args.length == 1) {
		    doStart(args[0]);
		}
		break;
	    case 'run':
 		if (args.length == 1) {
		    doRun(args[0]);
		}
		break;
	    case 'repeat':
 		if (args.length == 2) {
		    doRepeat(args[0], args[1]);
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
            case 'setcolor':
		if (args.length == 1) {
		    doSetColor(args[0]);
         	}
		break;
	    }

	    if (turtle_delay != null) {
		// Unhighlight current block by rescaling
		blockList[blk].bitmap.scaleX = 1;
		blockList[blk].bitmap.scaleY = 1;
		blockList[blk].bitmap.scale = 1;
	    }

	    // (3) Run block below this block, if any;
	    var nextBlock = blockList[blk].connections.last();
	    if (nextBlock != null) {
		if (!isArgBlock(nextBlock)) {
		    runFromBlock(nextBlock);
		}
	    }
	}

	function parseArg(blk) {
	    // Retrieve the value of a block.
	    // TODO: recurse while applying some operator
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
		case 'plus':
		    cblk1 = blockList[blk].connections[1];
		    cblk2 = blockList[blk].connections[2];
		    a = parseArg(cblk1);
		    b = parseArg(cblk2);
		    blockList[blk].value = doPlus(a, b);
		    break;
		case 'color':
		    blockList[blk].value = turtleColor;
		    break;
		}
		return blockList[blk].value;
	    } else {
		return blk;
	    }
	}

	function hideBlocks() {
	    // Hide all the blocks.
	    for (blk = 0; blk < blockList.length; blk++) {
		blockList[blk].bitmap.visible = false;
	    }
	}

	function showBlocks() {
	    // Show all the blocks.
	    for (blk = 0; blk < blockList.length; blk++) {
		blockList[blk].bitmap.visible = true;
	    }
	}

	// Logo functions
	function doStart(blk) {
	    console.log('doStart: calling runFromBlock(' + blk + ')');
	    runFromBlock(blk);
	}

	function doRun(name) {
	    // run the stack with name == name
	    for (i = 0; i < actionList.length; i++) {
		if (actionList[i][0] == name) {
		    runFromBlock(actionList[i][1]);
		    break;
		}
	    }
	}

        function doRepeat(count, blk) {
	    for (var i = 0; i < count; i++) {
		runFromBlock(blk);
	    }
	}

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

	// Turtle functions
        function doForward(steps) {
	    // Move forward.
            update = true;
	    // old turtle point
            oldPt = new createjs.Point(screenX2turtleX(turtle_bitmap.x),
					   invertY(turtle_bitmap.y));
            color = colorTable[turtleColor];
            stroke = turtleStroke;
	    // new turtle point
	    var rad = turtleOrientation * Math.PI / 180.0;
	    var newPt = new createjs.Point(
		oldPt.x + Number(steps) * Math.sin(rad),
		oldPt.y + Number(steps) * Math.cos(rad))
	    moveTurtle(newPt.x, newPt.y, true);
	    turtle_bitmap.x = turtleX2screenX(newPt.x);
	    turtle_bitmap.y = invertY(newPt.y);
	}

	function doRight(degrees) {
	    // Turn right and display corresponding turtle graphic.
	    turtleOrientation += Number(degrees);
	    turtleOrientation %= 360;
	    turtle_bitmap.rotation = turtleOrientation;
            update = true;
	}

	function doSetColor(color) {
	    turtleColor = Math.round(color);
	    turtleColor %= 100;
	}

	function doClear() {
	    // Clear all graphics and reset turtle.
            update = true;
            drawingCanvas.graphics.clear();
	    turtleX = 0;
	    turtleY = 0;
	    turtleOrientation = 0.0;
	    turtleColor = 0;
	    turtleStroke = 5;
	    turtle_bitmap.x = turtleX2screenX(turtleX);
	    turtle_bitmap.y = invertY(turtleY);
	    turtle_bitmap.rotation = 0;
	    // Also clear all the boxes
	    boxList = [];
	}

	// Utility functions

	function isValueBlock(blk) {
	    if (valueBlocks.indexOf(blockList[blk].name) != -1) {
		return true;
	    } else {
		return false;
	    }
	}

	function isArgBlock(blk) {
	    if (argBlocks.indexOf(blockList[blk].name) != -1) {
		return true;
	    } else {
		return false;
	    }
	}

	function isSpecialBlock(blk) {
	    if (specialBlocks.indexOf(blockList[blk].name) != -1) {
		return true;
	    } else {
		return false;
	    }
	}

	function isClampBlock(blk) {
	    if (clampBlocks.indexOf(blockList[blk].name) != -1) {
		return true;
	    } else {
		return false;
	    }
	}

	function isNoRunBlock(blk) {
	    if (noRunBlocks.indexOf(blockList[blk].name) != -1) {
		return true;
	    } else {
		return false;
	    }
	}

	function isExpandableBlock(blk) {
	    if (expandableBlocks.indexOf(blockList[blk].name) != -1) {
		return true;
	    } else {
		return false;
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

	function screenX2turtleX(x) {
	    return x - canvas.width / 2.0
	}

        function turtleX2screenX(x) {
            return canvas.width / 2.0 + x
	}

        function invertY(y) {
            return canvas.height / 2.0 - y;
	}

    });

});
