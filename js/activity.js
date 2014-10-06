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
	// Stage is an Easel construct
        var canvas, stage;
	// Need to update the stage
        var update = true;

        // The display object currently under the mouse, or being dragged
        var mouseTarget;

        // Indicates whether we are currently in a drag operation
        var dragStarted;

	// Group of blocks being dragged
	var dragGroup = [];
	// And the blocks at the tops of stacks
        var stackList = [];

        var offset;
        var drawingCanvas;
        var oldPt;
        var midPt;
        var oldMidPt;
	var i;
	var j;
        var color;
        var stroke;
        var colors;
        var index;

	var activeBlock = null;

        var turtle_bitmap;
        var Turtle = "images/turtle.svg";

	// Get things started
	init();

        function init() {
            if (window.top != window) {
                document.getElementById("header").style.display = "none";
            }
            document.getElementById("loader").className = "loader";
            // Create the stage and point it to the canvas:
            canvas = document.getElementById("myCanvas");

	    // Load a project
	    loadBlocks();

	    // Make sure blocks are aligned
	    findStacks();
	    for (i = 0; i < stackList.length; i++) {
		findDragGroup(stackList[i]);
		adjustBlockPositions();
	    }

            index = 0;
            colors = ["#828b20", "#b0ac31", "#cbc53d", "#fad779", "#f9e4ad",
                  "#faf2db", "#563512", "#9b4a0b", "#d36600", "#fe8a00",
                  "#f9a71f"];
            oldPt = new createjs.Point(400, 300);
            midPt = oldPt;
            oldMidPt = oldPt;

            // Check to see if we are running in a browser with touch support
            stage = new createjs.Stage(canvas);

            // Enable touch interactions if supported on the current device:
            createjs.Touch.enable(stage);

            // Keep tracking the mouse even when it leaves the canvas
            stage.mouseMoveOutside = true;

            // Enabled mouse over and mouse out events
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
            createjs.Ticker.removeEventListener("tick", tick);
        }

        function handleImageLoad(event) {
            var image = event.target;
            var imgW = image.width;
            var imgH = image.height;
            var bitmap;
            var container = new createjs.Container();
            stage.addChild(container);

	    var thisBlock = -1
            for (i = 0; i < blockList.length; i++) {
		if (blockList[i].image == image) {
		    thisBlock = i;
		    break;
                }
            }
            // Create and populate the screen with blocks
            bitmap = new createjs.Bitmap(image);
            blockList[thisBlock].bitmap = bitmap // Save now so we can reposition later.
            container.addChild(bitmap);
            bitmap.x = blockList[thisBlock].x
            bitmap.y = blockList[thisBlock].y
            bitmap.regX = imgW / 2 | 0;
            bitmap.regY = imgH / 2 | 0;
	    bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1
            bitmap.name = "bmp_" + thisBlock;

            bitmap.cursor = "pointer";

	    adjustLabelPosition(thisBlock, bitmap.x, bitmap.y);

            // Create a shape that represents the center of the icon:
            var hitArea = new createjs.Shape();
            hitArea.graphics.beginFill("#FFF").drawEllipse(-22, -28, 48, 36);
            // Position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
            hitArea.x = imgW - 24;
            hitArea.y = imgH / 2;
            bitmap.hitArea = hitArea;

            // Wrapper function to provide scope for the event handlers:
            (function (target) {
		var moved = false
                bitmap.onPress = function (evt) {
                    // Bump the target in front of its siblings:
                    container.addChild(target);
                    var offset = {
                        x: target.x - evt.stageX,
                        y: target.y - evt.stageY
                    };

                    evt.onMouseMove = function (ev) {
			// TODO: Disconnect from block above
			moved = true
			var oldX = bitmap.x
			var oldY = bitmap.y
                        target.x = ev.stageX + offset.x;
                        target.y = ev.stageY + offset.y;

			// Move the label too
			blk = -1
			for (i = 0; i < blockList.length; i++) {
			    if (blockList[i].bitmap == bitmap) {
				blk = i;
				break;
			    }
			}
			// Move any connected blocks
			findDragGroup(blk)
			var dx = bitmap.x - oldX
			var dy = bitmap.y - oldY
			if (dragGroup.length > 0) {
			    for (b = 0; b < dragGroup.length; b++) {
				blk = dragGroup[b]
				if (b == 0) {
				    // already moved above
				} else {
				    blockList[blk].bitmap.x += dx
				    blockList[blk].bitmap.y += dy
				}
				adjustLabelPosition(
				    blk, blockList[blk].bitmap.x,
				    blockList[blk].bitmap.y);
			    }
			}

                        // Indicate that the stage should be updated
                        // on the next tick:
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
			console.log('not the active block');
			return;
		    }
		    if (moved) {
			// When a block is moved:
			// (1) disconnect connection[0]
			console.log('connections for block ' + thisBlock + ': ' + blockList[thisBlock].connections)
			var c = blockList[thisBlock].connections[0];
			if (c != null) {
			    console.log('blk has a connection 0 with ' + c)
			    // disconnect both ends of the connection
			    for (i = 1;
				 i < blockList[c].connections.length; i++) {
				if (blockList[c].connections[i] == thisBlock) {
				    blockList[c].connections[i] = null;
				    console.log('disconnecting from ' + c);
				    break;
				}
			    }
  			    blockList[thisBlock].connections[0] = null;
			}
                        // (2) look for a new connection
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
			    // Don't connect to yourself
			    if (b == thisBlock) {
				continue;
			    }
			    for (c = 1; c < blockList[b].connections.length; c++) {
				// TODO: handle cases where number dock is already occupied;
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
			    console.log(dist + ' ' + thisBlock + ' ' + newBlock + ' ' + newConnection);
			    // We found a match
			    console.log('connecting ' + thisBlock + ' to ' + newBlock);
			    blockList[thisBlock].connections[0] = newBlock;
			    var connection = blockList[newBlock].connections[newConnection];
			    // TODO: move number blocks to trash
			    if(connection != null) {
				console.log(connection);
				bottom = findBottomBlock(thisBlock);
				console.log('connection was ' + connection);
				console.log('bottom block is ' + bottom);
				console.log('connecting ' + connection + ' to ' + bottom);
				blockList[connection].connections[0] = bottom;
				console.log('connecting ' + bottom + ' to ' + connection);
				blockList[bottom].connections[blockList[bottom].connections.length-1] = connection;
			    }
			    console.log('connecting ' + newBlock + ' to ' + thisBlock);
			    blockList[newBlock].connections[newConnection] = thisBlock;
			    console.log('adjustDocks beginning from ' + newBlock)
			    adjustDocks(newBlock);

			    var foo = document.getElementById("myNumber");
			    console.log(foo)
			    console.log(foo.value);
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
	    turtle_bitmap = bitmap
            container.addChild(bitmap);
	    // FIXME
            bitmap.x = 200
            bitmap.y = 200
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
                        var midPt = new createjs.Point(oldPt.x + stage.mouseX >> 1,
                            oldPt.y + stage.mouseY >> 1);

                        drawingCanvas.graphics.setStrokeStyle(
			    stroke, 'round', 'round'
			).beginStroke(color).moveTo(
			    midPt.x, midPt.y
			).curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

                        oldPt.x = stage.mouseX;
                        oldPt.y = stage.mouseY;

                        oldMidPt.x = midPt.x;
                        oldMidPt.y = midPt.y;
                    }
                }
                bitmap.onMouseOver = function () {
                    target.scaleX = target.scaleY = target.scale * 1.2;
                    update = true;
                    color = colors[(index++) % colors.length];
                    stroke = Math.random() * 30 + 10 | 0;
                    oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
                    oldMidPt = oldPt;
                }
                bitmap.onMouseOut = function () {
                    target.scaleX = target.scaleY = target.scale;
                    update = true;
                }
            })(bitmap);

            document.getElementById("loader").className = "";
            createjs.Ticker.addEventListener("tick", tick);
        }

        function adjustBlockPositions() {
	    // Adjust the docking postions of all blocks in the drag group
	    if (dragGroup.length < 2) {
		return;
	    }

	    adjustDocks(dragGroup[0])
	}

	function adjustDocks(blk) {
	    // Give a block, adjust the dock positions
	    // of all of the blocks connected to it
	    // And their corresponding labels
	    if (blockList[blk].connections == null) {
		return;
	    }
	    if (blockList[blk].connections.length == 0) {
		return;
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
		if (blockList[blk].bitmap == null) {
                    nx = blockList[blk].x + bdock[0] - cdock[0]
                    ny = blockList[blk].y + bdock[1] - cdock[1]
		    blockList[cblk].x = nx
		    blockList[cblk].y = ny
		} else {
                    ny = blockList[blk].bitmap.y + bdock[1] - cdock[1]
                    nx = blockList[blk].bitmap.x + bdock[0] - cdock[0]
		    blockList[cblk].x = nx
		    blockList[cblk].y = ny
		    blockList[cblk].bitmap.x = nx
		    blockList[cblk].bitmap.y = ny
		}
		adjustLabelPosition(cblk, nx, ny);
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
	    // Find any blocks with null in the first connection
	    for (i = 0; i < blockList.length; i++) {
		if (blockList[i].connections[0] == null) {
		    stackList.push(i)
		}
	    }
	}

        function findTopBlock(blk) {
	    // Find the top block in a stack
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
	    // Find the bottom block in a stack
	    if (blk == null) {
		return null;
	    }
	    if (blockList[blk].connections == null) {
		return blk;
	    }
	    if (blockList[blk].connections.length == 0) {
		return blk;
	    }
	    while (blockList[blk].connections[blockList[blk].connections.length-1] != null) {
		blk = blockList[blk].connections[blockList[blk].connections.length-1];
	    }
	    return blk;
	}

        function tick(event) {
            // This set makes it so the stage only re-renders when
            // an event handler indicates a change has happened.
            if (update) {
                update = false; // Only update once
                stage.update(event);
            }
        }

        function runLogoCommands() {
	    // run the logo commands here

	    // When we update the number, we will...
	    document.getElementById("_" + arrLabels[1]).innerHTML = "200";

            drawingCanvas.graphics.clear();
            update = true;
        }

        function loadBlocks() {
	    // This is temporary code for testing

	    // Add the blocks
	    blockList[0] = new Block(forwardBlock);
	    blockList[0].x = 100;
	    blockList[0].y = 100;
	    blockList[0].connections = [null, 1, 2];
	    blockList[1] = new Block(numberBlock);
	    blockList[1].value = 100;
	    blockList[1].connections = [0];
	    blockList[2] = new Block(rightBlock);
	    blockList[2].connections = [0, 3, null];
	    blockList[3] = new Block(numberBlock);
	    blockList[3].value = 90;
	    blockList[3].connections = [2];

	    updateBlockLabels();

	    // Simulate adding blocks
	    blockList[4] = new Block(forwardBlock);
	    blockList[4].x = 400;
	    blockList[4].y = 200;
	    blockList[4].connections = [null, 5, null];
	    blockList[5] = new Block(numberBlock);
	    blockList[5].value = 100;
	    blockList[5].connections = [4];

	    updateBlockLabels();

	    for (i = 0; i < blockList.length; i++) {
		// alert(blockList[i].getInfo());
	    }
        }

        function updateBlockLabels() {
	    // The labels are stored in the DOM with a unique id for each block.
            var html = ''
            for (i = 0; i < blockList.length; i++) {
		if (blockList[i].name == "number") {
		    arrLabels[i] = blockList[i].value.toString() + "_" +
			i.toString();
		    text = '<h2 id="_' + arrLabels[i] +
			'" style="position: absolute; ' + 
			'-webkit-user-select: text;">' +
			blockList[i].value.toString() + '</h2>'
		} else {
		    arrLabels[i] = blockList[i].name + "_" + i.toString();
		    text = '<h2 id="_' + arrLabels[i] +
			'" style="position: absolute; ' + 
			'-webkit-user-select: none;">' +
			blockList[i].name + '</h2>'
		}
		html = html + text
            }
            labelElem.innerHTML = html;

	    // Then create a list of the label elements
            for (i = 0; i < blockList.length; i++) {
		blockList[i].label = document.getElementById("_" + arrLabels[i])
		if (blockList[i].bitmap == null) {
		    var x = blockList[i].x
		    var y = blockList[i].y
		} else {
		    var x = blockList[i].bitmap.x
		    var y = blockList[i].bitmap.y
		}
		adjustLabelPosition(i, x, y);
		if (blockList[i].image == null) {
		    blockList[i].image = new Image();
		    blockList[i].image.src = blockList[i].protoblock.getSvgPath();
		    blockList[i].image.onload = handleImageLoad;
		}
            }
	}

	function adjustLabelPosition(i, x, y) {
	    if (blockList[i].protoblock.name == "number") {
		blockList[i].label.style.left = Math.round(
		    x + canvas.offsetLeft - 25) + "px";
	    } else {
		blockList[i].label.style.left = Math.round(
		    x + canvas.offsetLeft - 40) + "px";
	    }
            blockList[i].label.style.top = Math.round(
		y + canvas.offsetTop - 30) + "px";
	}

    });

});
