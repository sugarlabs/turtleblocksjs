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
	// And the blocks at the tops of stacks
        var stackList = [];

	var blk;
	var i;
	var j;
        var color;
        var stroke;
        var colors;
        var index;

	// To avoid infinite loops
	var loopCounter;

	var activeBlock = null;

	var turtle_delay = 1000;
        var turtle_bitmaps = [];
        var Turtles = ["images/turtle0.svg", "images/turtle15.svg",
		       "images/turtle30.svg", "images/turtle45.svg",
		       "images/turtle60.svg", "images/turtle75.svg",
		       "images/turtle90.svg", "images/turtle105.svg",
		       "images/turtle120.svg", "images/turtle135.svg",
		       "images/turtle150.svg", "images/turtle165.svg",
		       "images/turtle180.svg", "images/turtle195.svg",
		       "images/turtle210.svg", "images/turtle225.svg",
		       "images/turtle240.svg", "images/turtle255.svg",
		       "images/turtle270.svg", "images/turtle285.svg",
		       "images/turtle300.svg", "images/turtle315.svg",
		       "images/turtle330.svg", "images/turtle345.svg"];
	var turtleOrientation = 0.0;
	var turtleColor = 0;
	var turtleStroke = 5;
        var oldPt;
	var turtleX = 0;
	var turtleY = 0;

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
	    loadBlocks();

	    // Make sure blocks are aligned.
	    findStacks();
	    for (i = 0; i < stackList.length; i++) {
		findDragGroup(stackList[i]);
		adjustBlockPositions();
	    }

            index = 0;
            colors = ["#ff0000", "#828b20", "#b0ac31", "#cbc53d", "#fad779",
		      "#f9e4ad", "#faf2db", "#563512", "#9b4a0b", "#d36600",
		      "#fe8a00", "#f9a71f"];

            // Check to see if we are running in a browser with touch support.
            stage = new createjs.Stage(canvas);
            // Enable touch interactions if supported on the current device.
            createjs.Touch.enable(stage);
            // Keep tracking the mouse even when it leaves the canvas.
            stage.mouseMoveOutside = true;
            // Enabled mouse over and mouse out events.
            stage.enableMouseOver(10);

	    turtles = [];
	    for (i = 0; i < Turtles.length; i++) {
		turtles.push(new Image());
		turtles[i].src = Turtles[i];
		turtles[i].onload = handleTurtleLoad;
	    }

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
	    // Load a block
            var image = event.target;
            var bitmap;
            var container = new createjs.Container();
            stage.addChild(container);

	    var thisBlock = -1
            for (blk = 0; blk < blockList.length; blk++) {
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
	    console.log(bitmap);

	    // Expandable blocks have some extra parts.
	    if (isExpandableBlock(thisBlock)) {
		blockList[thisBlock].extra_bitmaps = [];
		extra_bitmaps = [];
		var yoff = blockList[thisBlock].protoblock.yoff;
		for (var i = 0; i < blockList[thisBlock].extra_images.length - 1; i++) {
		    extra_bitmaps.push(new createjs.Bitmap(blockList[thisBlock].extra_images[i]));
		    blockList[thisBlock].extra_bitmaps.push(extra_bitmaps[i]);
		    container.addChild(extra_bitmaps[i]);
		    extra_bitmaps[i].x = blockList[thisBlock].x;
		    extra_bitmaps[i].y = blockList[thisBlock].y + yoff + i * 18;
		    extra_bitmaps[i].scaleX = extra_bitmaps[i].scaleY = extra_bitmaps[i].scale = 1;
		    extra_bitmaps[i].name = "bmp_" + thisBlock + "_filler_" + i;
		}

		extra_bitmaps.push(new createjs.Bitmap(blockList[thisBlock].extra_images[i]));
		blockList[thisBlock].extra_bitmaps.push(extra_bitmaps[i]);
		container.addChild(extra_bitmaps[i]);
		extra_bitmaps[i].x = blockList[thisBlock].x;
		extra_bitmaps[i].y = blockList[thisBlock].y + yoff + i * 18;
		extra_bitmaps[i].scaleX = extra_bitmaps[i].scaleY = extra_bitmaps[i].scale = 1;
		extra_bitmaps[i].name = "bmp_" + thisBlock + "_bottom";
	    }

            // Create a shape that represents the center of the icon.
            var hitArea = new createjs.Shape();
            // Position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
	    // * number blocks have a handle on the right side;
	    // * other blocks should be sensitive in the middle.
	    if (blockList[thisBlock].name == "number") {
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
                bitmap.onPress = function (evt) {
                    // Bump the target in front of its siblings.
                    container.addChild(target);
                    var offset = {
                        x: target.x - evt.stageX,
                        y: target.y - evt.stageY
                    };

                    evt.onMouseMove = function (ev) {
			// reset scale when moving (easier to dock that way)
			bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;

			moved = true;
			var oldX = bitmap.x;
			var oldY = bitmap.y;
                        target.x = ev.stageX + offset.x;
                        target.y = ev.stageY + offset.y;

			// Which block is this?
			blk = -1;
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
                bitmap.onMouseOver = function () {
		    if (activeBlock == null) {
			target.scaleX = target.scaleY = target.scale * 1.2;
			activeBlock = thisBlock;
			update = true;
		    }
                }
                bitmap.onMouseOut = function () {
		    if (activeBlock != thisBlock) {
			return;
		    }
		    if (moved) {
			// When a block is moved:
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
				blockList[thisBlock].protoblock.docks[0][0];
			var dy1 = blockList[thisBlock].bitmap.y + 
				blockList[thisBlock].protoblock.docks[0][1];
			// Find the nearest dock; if it is close enough,
			// connect;
			var newBlock = null
			var newConnection = null
			var min = 400;
			var blkType = blockList[thisBlock].protoblock.docks[0][2]
			for (b = 0; b < blockList.length; b++) {
			    // Don't connect to yourself.
			    if (b == thisBlock) {
				continue;
			    }
			    for (c = 1; c < blockList[b].connections.length; c++) {
				// TODO: handle block expansion/contraction
				// Look for available connections
				if (testConnectionType(
				    blkType,
				    blockList[b].protoblock.docks[c][2])) {
				    dx2 = blockList[b].bitmap.x + 
					blockList[b].protoblock.docks[c][0];
				    dy2 = blockList[b].bitmap.y + 
					blockList[b].protoblock.docks[c][1];
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
				    bottom = findBottomBlock(thisBlock);
				    blockList[connection].connections[0] = bottom;
				    blockList[bottom].connections[blockList[bottom].connections.length-1] = connection;
				}
			    }
			    blockList[newBlock].connections[newConnection] = thisBlock;
			    loopCounter = 0
			    adjustDocks(newBlock);
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
	    for (var i = 0; i < blockList[blk].extra_bitmaps.length; i++) {
		blockList[blk].extra_bitmaps[i].x += dx;
		blockList[blk].extra_bitmaps[i].y += dy;
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
            hitArea.graphics.beginFill("#FFF").drawEllipse(-22, -28, 48, 36);
            // Position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
            hitArea.x = imgW / 2;
            hitArea.y = imgH / 2;

            // Create a turtle
            bitmap = new createjs.Bitmap(image);
	    turtle_bitmaps.push(bitmap)
            container.addChild(bitmap);

	    // Hide all turtles except for turtle 0 on load().
	    if (turtle_bitmaps.length > 1) {
		turtle_bitmaps[turtle_bitmaps.length - 1].visible = false
	    }

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
                bitmap.onPress = function (evt) {
                    // Bump the target in front of its siblings:
                    container.addChild(target);
                    var offset = {
                        x: target.x - evt.stageX,
                        y: target.y - evt.stageY
                    };

                    evt.onMouseMove = function (ev) {
                        target.x = ev.stageX + offset.x;
                        target.y = ev.stageY + offset.y;
                        // Indicate that the stage should be updated
                        // on the next tick:
                        update = true;
			moveTurtle(stage.mouseX, stage.mouseY, false);
                    }
                }
                bitmap.onMouseOver = function () {
                    target.scaleX = target.scaleY = target.scale * 1.2;
                    update = true;
                    color = colors[(index++) % colors.length];
                    stroke = Math.random() * 30 + 10 | 0;
                    oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
                }
                bitmap.onMouseOut = function () {
                    target.scaleX = target.scaleY = target.scale;
		    for (i = 0; i < turtle_bitmaps.length; i++) {
			turtle_bitmaps[i].x = stage.mouseX;
			turtle_bitmaps[i].y = stage.mouseY;
		    }
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

	function adjustDocks(blk) {
	    // Give a block, adjust the dock positions
	    // of all of the blocks connected to it
	    // (and their corresponding labels).

	    // FIXME: there is an infinite loop in here somewhere.
	    if (blockList[blk].connections == null) {
		return;
	    }
	    if (blockList[blk].connections.length == 0) {
		return;
	    }
	    loopCounter += 1;
	    if (loopCounter > blockList.length) {
		console.log('infinite loop encountered while adjusting docks');
		return
	    }
	    for (c = 1; c < blockList[blk].connections.length; c++) {
		var bdock = blockList[blk].protoblock.docks[c];
		cblk = blockList[blk].connections[c];
		if (cblk == null) {
		    return
		}
		for (b = 0; b < blockList[cblk].connections.length; b++) {
		    if (blockList[cblk].connections[b] == blk) {
			break
		    }
		}
		var cdock = blockList[cblk].protoblock.docks[b];
		dx = bdock[0] - cdock[0]
		dy = bdock[1] - cdock[1]
		if (blockList[blk].bitmap == null) {
                    nx = blockList[blk].x + dx;
                    ny = blockList[blk].y + dy;
		} else {
                    nx = blockList[blk].bitmap.x + dx;
                    ny = blockList[blk].bitmap.y + dy;
		}
		moveBlock(cblk, nx, ny);
		adjustDocks(cblk)
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
	    dragGroup.push(blk)
	    if (blockList[blk].connections == null) {
		return;
	    }
	    if (blockList[blk].connections.length == 0) {
		return;
	    }
	    for (c = 1; c < blockList[blk].connections.length; c++) {
		cblk = blockList[blk].connections[c];
		if (cblk != null) {
		    // Recurse
		    calculateDragGroup(cblk);
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
	    while (blockList[blk].connections[blockList[blk].connections.length - 1] != null) {
		blk = blockList[blk].connections[blockList[blk].connections.length - 1];
	    }
	    return blk;
	}

        function createBlockImages() {
	    // Create the block image if it doesn't yet exist.
            for (blk = 0; blk < blockList.length; blk++) {
		if (blockList[blk].image == null) {
		    blockList[blk].image = new Image();
		    blockList[blk].image.src = blockList[blk].protoblock.getSvgPath();
		    blockList[blk].image.onload = handleImageLoad;
		    if (isExpandableBlock(blk)) {
			blockList[blk].extra_images = [];
			blockList[blk].extra_images.push(new Image());
			blockList[blk].extra_images[0].src = blockList[blk].protoblock.getFillerSvgPath();
			blockList[blk].extra_images.push(new Image());
			blockList[blk].extra_images[1].src = blockList[blk].protoblock.getBottomSvgPath();
		    }
		}
	    }
	}

        function updateBlockLabels() {
	    // The modifiable labels are stored in the DOM with a
	    // unique id for each block.  For the moment, we only have
	    // labels for number blocks.
            var html = ''
            for (blk = 0; blk < blockList.length; blk++) {
		if (blockList[blk].name == "number") {
		    arrLabels[blk] = "_" + blk.toString();
		    text = '<textarea id="_' + arrLabels[blk] +
			'" style="position: absolute; ' + 
			'-webkit-user-select: text;" ' +
			// 'onselect="labelSelected", ' +
			'onchanged="labelChanged", ' +
			'cols="6", rows="1", maxlength="6">' +
			blockList[blk].value.toString() + '</textarea>'
		} else {
		    arrLabels[blk] = null
		    text = ''
		}
		html = html + text
            }
            labelElem.innerHTML = html;

	    // Then create a list of the label elements
            for (blk = 0; blk < blockList.length; blk++) {
		if (blockList[blk].bitmap == null) {
		    var x = blockList[blk].x
		    var y = blockList[blk].y
		} else {
		    var x = blockList[blk].bitmap.x
		    var y = blockList[blk].bitmap.y
		}
		if (blockList[blk].name == "number") {
		    blockList[blk].label = document.getElementById("_" + arrLabels[blk])
		    // Not sure why this event is not triggered, but
		    // it doesn't matter as long as we read from the
		    // textareas before we run the blocks.
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

        function loadBlocks() {
	    // This is temporary code for testing.

	    // Add the blocks
	    blockList.push(new Block(clearBlock));
	    blockList[0].x = 300;
	    blockList[0].y = 50;
	    blockList[0].connections = [null, 1];
	    blockList.push(new Block(forwardBlock));
	    blockList[1].connections = [0, 2, 3];
	    blockList.push(new Block(numberBlock));
	    blockList[2].value = 100;
	    blockList[2].connections = [1];
	    blockList.push(new Block(rightBlock));
	    blockList[3].connections = [1, 4, 5];
	    blockList.push(new Block(numberBlock));
	    blockList[4].value = 90;
	    blockList[4].connections = [3];
	    blockList.push(new Block(rightBlock));
	    blockList[5].connections = [3, 6, null];
	    blockList.push(new Block(numberBlock));
	    blockList[6].value = 45;
	    blockList[6].connections = [5];

	    blockList.push(new Block(repeatBlock));
	    blockList[7].x = 100;
	    blockList[7].y = 50;
	    blockList[7].connections = [null, 8, null, null];

	    blockList.push(new Block(numberBlock));
	    blockList[8].value = 4;
	    blockList[8].connections = [7];

	    blockList.push(new Block(startBlock));
	    blockList[9].x = 400;
	    blockList[9].y = 50;
	    blockList[9].connections = [null, null, null];

	    blockList.push(new Block(repeatBlock));
	    blockList[10].x = 100;
	    blockList[10].y = 200;
	    blockList[10].connections = [null, 11, null, null];

	    blockList.push(new Block(numberBlock));
	    blockList[11].value = 8;
	    blockList[11].connections = [10];

	    createBlockImages();
	    updateBlockLabels();

	    for (blk = 0; blk < blockList.length; blk++) {
		// alert(blockList[blk].getInfo());
	    }
        }

        function runLogoCommands() {
	    // We run the logo commands here.

	    // First we need to reconcile the values in all the number blocks
	    // with their associated textareas.
	    for (blk = 0; blk < blockList.length; blk++) {
		if (blockList[blk].label != null) {
		    blockList[blk].value = blockList[blk].label.value;
		}
	    }

	    for (blk = 0; blk < blockList.length; blk++) {
		console.log(blk + ': ' + blockList[blk].connections);
	    }

	    // Execute turtle code here...
	    // (1) Find the start block (or the top of each stack).
	    var startBlock = null
	    findStacks();
	    console.log(stackList);
	    for (blk = 0; blk < stackList.length; blk++) {
		if (blockList[stackList[blk]].name == "start") {
		    console.log('found a start block');
		    startBlock = stackList[blk];
		    break;
		}
	    }

	    // (2) Execute the stack.
	    if (startBlock != null) {
		runFromBlock(startBlock);
	    } else {
		for (blk = 0; blk < stackList.length; blk++) {
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
		console.log('running ' + blk);
		if (blk == null) {
		    activity.showAlert('WARNING',
				       'trying to run null block', null,
				       function() {});
		    return;
		}
		console.log(blockList[blk].name)
		blockList[blk].bitmap.scaleX = blockList[blk].bitmap.scaleY = blockList[blk].bitmap.scale = 1.2;
		runFromBlockNow(blk);
		// setTimeout(function(){runFromBlockNow(blk);}, turtle_delay); 
	    }
	} 

        function runFromBlockNow(blk) {
	    // Run a stack of blocks, beginning with blk.
	    // (1) Evaluate any arguments (beginning with connection[1]);
	    var args = [];
	    if(blockList[blk].protoblock.args > 0) {
		for (arg = 1; arg < blockList[blk].protoblock.args + 1; arg++) {
		    console.log('args.push: ' + parseArg(blockList[blk].connections[arg]));
		    args.push(parseArg(blockList[blk].connections[arg]));
		}
	    }

	    // (2) Run function associated with the block;
	    console.log('running ' + blockList[blk].name + ': ' + args);
	    switch (blockList[blk].name) {
	    case 'start':
 		if (args.length == 1) {
		    doStart(args[0]);
		}
		break;
	    case 'repeat':
 		if (args.length == 2) {
		    doRepeat(args[0], args[1]);
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
	    }

	    if (turtle_delay != null) {
		// Unhighlight current block by rescaling
		blockList[blk].bitmap.scaleX = blockList[blk].bitmap.scaleY = blockList[blk].bitmap.scale = 1;
	    }

	    // (3) Run block below this block, if any;
	    var nextBlock = blockList[blk].connections[blockList[blk].connections.length - 1];
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

	// Logo functions
	function doStart(blk) {
	    console.log('doStart: calling runFromBlock(' + blk + ')');
	    runFromBlock(blk);
	}

        function doRepeat(count, blk) {
	    for (var i = 0; i < count; i++) {
		console.log('repeat: i = ' + i)
		runFromBlock(blk);
	    }
	}

	// Turtle functions
        function doForward(steps) {
	    // Move forward.
            update = true;
	    // old turtle point
            oldPt = new createjs.Point(screenX2turtleX(turtle_bitmaps[0].x),
				       invertY(turtle_bitmaps[0].y));
            color = colors[turtleColor];
            stroke = turtleStroke;
	    // new turtle point
	    var newPt = new createjs.Point(
		oldPt.x + Number(steps) * Math.sin(turtleOrientation * Math.PI / 180.0),
		oldPt.y + Number(steps) * Math.cos(turtleOrientation  * Math.PI / 180.0));
	    moveTurtle(newPt.x, newPt.y, true);
	    for (var i = 0; i < turtle_bitmaps.length; i++) {
		turtle_bitmaps[i].x = turtleX2screenX(newPt.x);
		turtle_bitmaps[i].y = invertY(newPt.y);
	    }
	}

	function doRight(degrees) {
	    // Turn right and display corresponding turtle graphic.
            update = true;
	    turtleOrientation += Number(degrees);
	    turtleOrientation %= 360;
            var t = Math.round(turtleOrientation + 7.5) % 360 / (360 / 24) | 0
	    for (var i = 0; i < turtle_bitmaps.length; i++) {
		if (i == t) {
		    turtle_bitmaps[i].visible = true;
		} else {
		    turtle_bitmaps[i].visible = false;
		}
	    }
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
	    for (var i = 0; i < turtle_bitmaps.length; i++) {
		// Hide all the turtles except 0.
		if (i == 0) {
		    turtle_bitmaps[i].visible = true;
		} else {
		    turtle_bitmaps[i].visible = false;
		}
		turtle_bitmaps[i].x = turtleX2screenX(turtleX);
		turtle_bitmaps[i].y = invertY(turtleY);
	    }
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
