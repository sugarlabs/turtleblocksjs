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
            new_positions();
        }

        // Make the activity stop with the stop button.
        var stopButton = document.getElementById("stop-button");
        stopButton.addEventListener('click', function (e) {
            activity.close();
        });

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
	blockList[4] = new Block(forwardBlock);
	blockList[4].x = 400;
	blockList[4].y = 200;
	blockList[4].connections = [null, 5, null];
	blockList[5] = new Block(numberBlock);
	blockList[5].value = 100;
	blockList[5].connections = [4];

	// Make sure blocks are aligned
	var stackList = [];
	findStacks();
	for (i = 0; i < stackList.length; i++) {
	    findDragGroup(stackList[i]);
	    adjustBlockPositions();
	}

	for (i = 0; i < blockList.length; i++) {
	    // alert(blockList[i].getInfo());
	}

	// Create label elements for each of our blocks.
	// The labels are stored in the DOM with a unique id for each block.
        var arrLabels = [];
        var html = ''
        for (i = 0; i < blockList.length; i++) {
	    if (blockList[i].name == "number") {
		arrLabels[i] = blockList[i].value.toString() + "_" +
                    i.toString();
		text = '<h2 id="_' + arrLabels[i] +
		    '" style="position: absolute; ' + 
		    '-webkit-user-select: none;">' +
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
        var labelElem = document.getElementById("labelDiv");
        labelElem.innerHTML = html;

	// When we update the number, we will...
	// document.getElementById("_" + arrLabels[i]).innerHTML = "New text!";

	// Then create a list of the label elements
        for (i = 0; i < blockList.length; i++) {
	    blockList[i].label = document.getElementById("_" + arrLabels[i])
        }

	// Stage is an Easel construct
        var canvas, stage;
	// Need to update the stage
        var update = true;

        // The display object currently under the mouse, or being dragged
        var mouseTarget;

        // Indicates whether we are currently in a drag operation
        var dragStarted;

	// Group of blocks being dragged
	var dragGroup = []

        var offset;
        var drawingCanvas;
        var oldPt;
        var midPt;
        var oldMidPt;
	var j;
        var color;
        var stroke;
        var colors;
        var index;

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

            // Load the source images
            for (i = 0; i < blockList.length; i++) {
                blockList[i].image = new Image();
                blockList[i].image.src = blockList[i].protoblock.getSvgPath();
                blockList[i].image.onload = handleImageLoad;
            }

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

	    j = -1
            for (i = 0; i < blockList.length; i++) {
		if (blockList[i].image == image) {
		    j = i;
		    break;
                }
            }
            // Create and populate the screen with blocks
            bitmap = new createjs.Bitmap(image);
            blockList[j].bitmap = bitmap // Save now so we can reposition later.
            container.addChild(bitmap);
            bitmap.x = blockList[j].x
            bitmap.y = blockList[j].y
            bitmap.regX = imgW / 2 | 0;
            bitmap.regY = imgH / 2 | 0;
	    bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1
            bitmap.name = "bmp_" + j;

            bitmap.cursor = "pointer";

	    if (blockList[j].protoblock.name == "number") {
		blockList[j].label.style.left = Math.round(bitmap.x + canvas.offsetLeft - 5) + "px";
	    } else {
		blockList[j].label.style.left = Math.round(bitmap.x + canvas.offsetLeft - 40) + "px";
	    }
            blockList[j].label.style.top = Math.round(bitmap.y + canvas.offsetTop - 30) + "px";

            // Create a shape that represents the center of the icon:
            var hitArea = new createjs.Shape();
            hitArea.graphics.beginFill("#FFF").drawEllipse(-22, -28, 48, 36);
            // Position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
            hitArea.x = imgW / 2;
            hitArea.y = imgH / 2;
            bitmap.hitArea = hitArea;

            // Wrapper function to provide scope for the event handlers:
            (function (target) {
                bitmap.onRelease = function (evt) {
		    // TODO: Try to dock
                    update = true;
		    }
                bitmap.onPress = function (evt) {
                    // Bump the target in front of its siblings:
                    container.addChild(target);
                    var offset = {
                        x: target.x - evt.stageX,
                        y: target.y - evt.stageY
                    };

                    evt.onMouseMove = function (ev) {
			// TODO: Disconnect from block above
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
				if (blockList[blk].protoblock.name == "number") {
				    blockList[blk].label.style.left = Math.round(blockList[blk].bitmap.x + canvas.offsetLeft - 5) + "px";

				} else {
				    blockList[blk].label.style.left = Math.round(blockList[blk].bitmap.x + canvas.offsetLeft - 40) + "px";
				}
				blockList[blk].label.style.top = Math.round(blockList[blk].bitmap.y + canvas.offsetTop - 30) + "px";
			    }
			}

                        // Indicate that the stage should be updated
                        // on the next tick:
                        update = true;
                    }
                }
                bitmap.onMouseOver = function () {
                    target.scaleX = target.scaleY = target.scale * 1.2;
                    update = true;
                }
                bitmap.onMouseOut = function () {
                    target.scaleX = target.scaleY = target.scale;
                    update = true;
                }
            })(bitmap);

            document.getElementById("loader").className = "";
            createjs.Ticker.addEventListener("tick", tick);
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

                        drawingCanvas.graphics.setStrokeStyle(stroke, 'round', 'round').beginStroke(color).moveTo(midPt.x, midPt.y).curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

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
                    nx = blockList[blk].bitmap.x + bdock[0] - cdock[0]
                    ny = blockList[blk].bitmap.y + bdock[1] - cdock[1]
		    blockList[cblk].bitmap.x = nx
		    blockList[cblk].bitmap.y = ny
		}
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
	    while (blockList[blk].connections[-1] != null) {
		blk = blockList[blk].connections[-1];
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

            drawingCanvas.graphics.clear();
            update = true;
        }

    });

});
