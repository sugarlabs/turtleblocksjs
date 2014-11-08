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

// Turtles
var defaultColor = 5;
var defaultValue = 50;
var defaultChroma = 100;
var defaultStroke = 5;

// Turtle sprite
var turtlePath = 'images/turtle.svg';
var turtleBasePath = 'images/';

function Turtle (name, turtles) {
    this.name = name;
    this.turtles = turtles;

    // In the trash?
    this.trash = false;

    // Things used for drawing the turtle.
    this.container = null;
    this.x = 0;
    this.y = 0;
    this.bitmap = null;
    this.skinChanged = false;  // Should we reskin the turtle on clear?

    // Which start block is assocated with this turtle?
    this.startBlock = null;
    this.decorationBitmap = null;  // Start block decoration.

    // Queue of blocks this turtle is executing.
    this.runQueue = [];

    // Things used for what the turtle draws.
    this.drawingCanvas = null;
    this.svgOutput = '';
    this.color = defaultColor;
    this.value = defaultValue;
    this.chroma = defaultChroma;
    this.stroke = defaultStroke;
    this.canvasColor = '#ff0031';
    this.orientation = 0;
    this.fillState = false;
    this.penState = true;
    this.media = [];  // Media (text, images) we need to remove on clear.

    this.move = function(ox, oy, x, y, invert) {
        if (invert) {
            ox = this.turtles.turtleX2screenX(ox);
            oy = this.turtles.invertY(oy);
            nx = this.turtles.turtleX2screenX(x);
            ny = this.turtles.invertY(y);
        } else {
            nx = x;
            ny = y;
        }

        // Draw a line if the pen is down.
        if (this.penState) {
            this.drawingCanvas.graphics.lineTo(nx, ny);
            var svg = '<line x1="' + ox + '" y1="' + oy + '" x2="' + nx + '" y2="' + ny + '" stroke-linecap="round" stroke-width="' + this.stroke + '" stroke="' + this.canvasColor + '"/>\n';
            this.svgOutput += svg;
        } else {
            this.drawingCanvas.graphics.moveTo(nx, ny);
        }
        // Update turtle position on screen.
        this.container.x = nx;
        this.container.y = ny;
        if (invert) {
            this.x = x;
            this.y = y;
        } else {
            this.x = this.turtles.screenX2turtleX(x);
            this.y = this.turtles.invertY(y);
        }
    }

    this.arc = function(cx, cy, ox, oy, x, y, radius, start, end, anticlockwise, invert) {
        if (invert) {
            cx = this.turtles.turtleX2screenX(cx);
            cy = this.turtles.invertY(cy);
            ox = this.turtles.turtleX2screenX(ox);
            oy = this.turtles.invertY(oy);
            nx = this.turtles.turtleX2screenX(x);
            ny = this.turtles.invertY(y);
        } else {
            nx = x;
            ny = y;
        }

        if (!anticlockwise) {
            sa = start - Math.PI;
            ea = end - Math.PI;
        } else {
            sa = start;
            ea = end;
        }

        // Draw an arc if the pen is down.
        if (this.penState) {
            this.drawingCanvas.graphics.arc(cx, cy, radius, sa, ea, anticlockwise);
            if (this.fillState) {
                svg = '<path d="M' + ox + ' ' + oy + ' A ' + radius + ' ' + radius + ', 0, 0, 1, ' + nx + ' ' + ny + '" stroke-linecap="round" fill="' + this.canvasColor + '" stroke-width="' + this.stroke + '" stroke="' + this.canvasColor + '"/>\n';
            } else {
		svg = '<path d="M' + ox + ' ' + oy + ' A ' + radius + ' ' + radius + ', 0, 0, 1, ' + nx + ' ' + ny + '" stroke-linecap="round" fill="none" stroke-width="' + this.stroke + '" stroke="' + this.canvasColor + '"/>\n';
            }
            this.svgOutput += svg;
        } else {
            this.drawingCanvas.graphics.moveTo(nx, ny);
        }
        // Update turtle position on screen.
        this.container.x = nx;
        this.container.y = ny;
        if (invert) {
            this.x = x;
            this.y = y;
        } else {
            this.x = this.screenX2turtles.turtleX(x);
            this.y = this.turtles.invertY(y);
        }
    }

    // Turtle functions
    this.doClear = function() {
        // Reset turtle.
        this.x = 0;
        this.y = 0;
        this.orientation = 0.0;
        var i = this.turtles.turtleList.indexOf(this) % 10;
        this.color = 5 + (i * 10);
        this.value = defaultValue;
        this.chroma = defaultChroma;
        this.stroke = defaultStroke;
        this.container.x = this.turtles.turtleX2screenX(this.x);
        this.container.y = this.turtles.invertY(this.y);
    
        if (this.skinChanged) {
            this.doTurtleShell(55, turtleBasePath + 'turtle-' + i.toString() + '.svg');
            this.skinChanged = false;
        }

        this.bitmap.rotation = this.orientation;
        this.container.updateCache();

        // Clear all media.
        for (i = 0; i < this.media.length; i++) {
            this.turtles.stage.removeChild(this.media[i]);
        }
        // FIX ME: potential memory leak
        this.media = [];

        // Clear all graphics.
        this.penState = true;
        this.fillState = false;

        this.canvasColor = getMunsellColor(this.color, this.value, this.chroma);
        this.drawingCanvas.graphics.clear();
        this.drawingCanvas.graphics.beginStroke(this.canvasColor);
        this.drawingCanvas.graphics.setStrokeStyle(this.stroke, 'round', 'round');
        this.svgOutput = '';
        this.turtles.refreshCanvas();
    }

    this.doForward = function(steps) {
        if (!this.fillState) {
            this.drawingCanvas.graphics.beginStroke(this.canvasColor);
            this.drawingCanvas.graphics.setStrokeStyle(this.stroke, 'round', 'round');
            this.drawingCanvas.graphics.moveTo(this.container.x, this.container.y);
        }

        // old turtle point
        var ox = this.turtles.screenX2turtleX(this.container.x);
        var oy = this.turtles.invertY(this.container.y);

        // new turtle point
        var rad = this.orientation * Math.PI / 180.0;
        var nx = ox + Number(steps) * Math.sin(rad);
        var ny = oy + Number(steps) * Math.cos(rad);

        this.move(ox, oy, nx, ny, true);
        this.turtles.refreshCanvas();
    }

    this.doSetXY = function(x, y) {
        if (!this.fillState) {
            this.drawingCanvas.graphics.beginStroke(this.canvasColor);
            this.drawingCanvas.graphics.setStrokeStyle(this.stroke, 'round', 'round');
            this.drawingCanvas.graphics.moveTo(this.container.x, this.container.y);
        }

        // old turtle point
        var ox = this.turtles.screenX2turtleX(this.container.x);
        var oy = this.turtles.invertY(this.container.y);

        // new turtle point
        var nx = Number(x)
        var ny = Number(y);

        this.move(ox, oy, nx, ny, true);
        this.turtles.refreshCanvas();
    }

    this.doArc = function(angle, radius) {
        if (!this.fillState) {
            this.drawingCanvas.graphics.beginStroke(this.canvasColor);
            this.drawingCanvas.graphics.setStrokeStyle(this.stroke, 'round', 'round');
            this.drawingCanvas.graphics.moveTo(this.container.x, this.container.y);
        }
        var adeg = Number(angle);
        var arad = (adeg / 180) * Math.PI;
        var orad = (this.orientation / 180) * Math.PI;
        var r = Number(radius);

        // old turtle point
        ox = this.turtles.screenX2turtleX(this.container.x);
        oy = this.turtles.invertY(this.container.y);

        if( adeg < 0 ) {
            var anticlockwise = true;
            adeg = -adeg;
            // center point for arc
            var cx = ox - Math.cos(orad) * r;
            var cy = oy + Math.sin(orad) * r;
            // new position of turtle
            var nx = cx + Math.cos(orad + arad) * r;
            var ny = cy - Math.sin(orad + arad) * r;
        } else {
            var anticlockwise = false;
            // center point for arc
            var cx = ox + Math.cos(orad) * r;
            var cy = oy - Math.sin(orad) * r;
            // new position of turtle
            var nx = cx - Math.cos(orad + arad) * r;
            var ny = cy + Math.sin(orad + arad) * r;
        }
        this.arc(cx, cy, ox, oy, nx, ny, r, orad, orad + arad, anticlockwise, true);

        if (anticlockwise) {
            this.doRight(-adeg);
        } else {
            this.doRight(adeg);
        }
        this.turtles.refreshCanvas();
    }

    this.doShowImage = function(size, myImage) {
        // Add an image object to the canvas
	// Is there a JS test for a valid image path?
        if (myImage == null) {
            return;
        }
        var image = new Image();
        image.src = myImage;
        var bitmap = new createjs.Bitmap(image);
        this.turtles.stage.addChild(bitmap);
        this.media.push(bitmap);
        bitmap.scaleX = Number(size) / image.width;
        bitmap.scaleY = bitmap.scaleX;
        bitmap.scale = bitmap.scaleX;
        bitmap.x = this.container.x;
        bitmap.y = this.container.y;
        bitmap.regX = image.width / 2;
        bitmap.regY = image.height / 2;
        bitmap.rotation = this.orientation;
        this.turtles.refreshCanvas();
    }

    this.doTurtleShell = function(size, myImage) {
        // Add image to turtle
        if (myImage == null) {
            return;
        }
        var image = new Image();
        image.src = myImage;
        this.container.removeChild(this.bitmap);
        this.bitmap = new createjs.Bitmap(image);
        this.container.addChild(this.bitmap);
        this.bitmap.scaleX = Number(size) / image.width;
        this.bitmap.scaleY = this.bitmap.scaleX;
        this.bitmap.scale = this.bitmap.scaleX;
        this.bitmap.x = 0;
        this.bitmap.y = 0;
        this.bitmap.regX = image.width / 2;
        this.bitmap.regY = image.height / 2;
        this.bitmap.rotation = this.orientation;
        this.skinChanged = true;
        this.container.uncache();
	var bounds = this.container.getBounds();
        this.container.cache(bounds.x, bounds.y, bounds.width, bounds.height);

        this.turtles.blocks.blockList[this.startBlock].container.removeChild(this.decorationBitmap);
        this.decorationBitmap = new createjs.Bitmap(myImage);
        this.turtles.blocks.blockList[this.startBlock].container.addChild(this.decorationBitmap);
        this.decorationBitmap.x = 80;
        this.decorationBitmap.y = 20;
        this.decorationBitmap.scaleX = 27.5 / image.width;
        this.decorationBitmap.scaleY = 27.5 / image.height;
        this.decorationBitmap.scale = 27.5 / image.width;
	this.turtles.blocks.blockList[this.startBlock].container.updateCache();
        this.turtles.refreshCanvas();
    }

    this.doShowText = function(size, myText) {
        // Add a text or image object to the canvas
        var textSize = size.toString() + 'px Courier';
        var text = new createjs.Text(myText.toString(), textSize, this.canvasColor);
        text.textAlign = 'left';
        text.textBaseline = 'alphabetic';
        this.turtles.stage.addChild(text);
        this.media.push(text);
        text.x = this.container.x;
        text.y = this.container.y;
        text.rotation = this.orientation;
        this.turtles.refreshCanvas();
    }

    this.doRight = function(degrees) {
        // Turn right and display corresponding turtle graphic.
        this.orientation += Number(degrees);
        this.orientation %= 360;
        this.bitmap.rotation = this.orientation;
        this.container.updateCache();

        this.turtles.refreshCanvas();
    }

    this.doSetHeading = function(degrees) {
        this.orientation = Number(degrees);
        this.orientation %= 360;
        this.bitmap.rotation = this.orientation;
        this.turtles.refreshCanvas();
    }

    this.doSetColor = function(hue) {
        this.color = Number(hue);
        this.canvasColor = getMunsellColor(this.color, this.value, this.chroma);
        this.drawingCanvas.graphics.beginStroke(this.canvasColor);
    }

    this.doSetValue = function(shade) {
        this.value = Number(shade);
        this.canvasColor = getMunsellColor(this.color, this.value, this.chroma);
        this.drawingCanvas.graphics.beginStroke(this.canvasColor);
    }

    this.doSetChroma = function(chroma) {
        this.chroma = Number(chroma);
        this.canvasColor = getMunsellColor(this.color, this.value, this.chroma);
        this.drawingCanvas.graphics.beginStroke(this.canvasColor);
    }

    this.doSetPensize = function(size) {
        this.stroke = size;
        this.drawingCanvas.graphics.setStrokeStyle(this.stroke, 'round', 'round');
    }

    this.doPenUp = function(turtle) {
        this.penState = false;
    }

    this.doPenDown = function(turtle) {
        this.penState = true;
    }

    this.doStartFill = function(turtle) {
        /// start tracking points here
        this.drawingCanvas.graphics.beginFill(this.canvasColor);
        this.fillState = true;
    }

    this.doEndFill = function(turtle) {
        /// redraw the points with fill enabled
        this.drawingCanvas.graphics.endFill();
        this.fillState = false;
    }
};

function Turtles(canvas, stage, refreshCanvas) {
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;

    this.setBlocks = function(blocks) {
        this.blocks = blocks;
    }

    // The list of all of our turtles, one for each start block.
    this.turtleList = [];

    this.add = function(name) {
        // Add a new turtle for each start block
        console.log('adding a new turtle');
        var i = this.turtleList.length;
        var turtleName = i.toString();
        var myTurtle = new Turtle(turtleName, this);
        this.turtleList.push(myTurtle);

        // Each turtle needs its own canvas.
        myTurtle.drawingCanvas = new createjs.Shape();
        this.stage.addChild(myTurtle.drawingCanvas);

        var turtleImage = new Image();
        i %= 10;
        myTurtle.container = new createjs.Container();
        this.stage.addChild(myTurtle.container);
        myTurtle.bitmap = new createjs.Bitmap(TURTLESVG.replace(/fill_color/g, FILLCOLORS[i]).replace(/stroke_color/g, STROKECOLORS[i]));
        myTurtle.container.x = this.turtleX2screenX(myTurtle.x);
        myTurtle.container.y = this.invertY(myTurtle.y);
        myTurtle.bitmap.x = 0;
        myTurtle.bitmap.y = 0;
        myTurtle.bitmap.regX = 27 | 0;
        myTurtle.bitmap.regY = 27 | 0;
        myTurtle.bitmap.name = 'bmp_turtle';
        myTurtle.container.addChild(myTurtle.bitmap);
	var bounds = myTurtle.container.getBounds();
        myTurtle.container.cache(bounds.x, bounds.y, bounds.width, bounds.height);
        myTurtle.bitmap.cursor = 'pointer';
        var hitArea = new createjs.Shape();
        hitArea.graphics.beginFill('#FFF').drawEllipse(-27, -27, 55, 55);
        hitArea.x = 0;
        hitArea.y = 0;
        myTurtle.container.hitArea = hitArea;

        myTurtle.startBlock = this.blocks.blockList.length - 1;
        myTurtle.decorationBitmap = myTurtle.bitmap.clone();
        last(this.blocks.blockList).container.addChild(myTurtle.decorationBitmap);
        myTurtle.decorationBitmap.x = 90;
        myTurtle.decorationBitmap.y = 35;
        myTurtle.decorationBitmap.scaleX = 0.5;
        myTurtle.decorationBitmap.scaleY = 0.5;
        myTurtle.decorationBitmap.scale = 0.5;
	last(this.blocks.blockList).container.updateCache();
        this.stage.update();

        myTurtle.color = 5 + (i * 10);
        myTurtle.canvasColor = getMunsellColor(myTurtle.color, defaultValue, defaultChroma);

        var turtles = this;

        myTurtle.container.on('mousedown', function(event) {
            var offset = {
                x: myTurtle.container.x - event.stageX,
                y: myTurtle.container.y - event.stageY
            }

            myTurtle.container.on('pressmove', function(event) {
                myTurtle.container.x = event.stageX + offset.x;
                myTurtle.container.y = event.stageY + offset.y;
                myTurtle.x = turtles.screenX2turtleX(myTurtle.container.x);
                myTurtle.y = turtles.invertY(myTurtle.container.y);
                turtles.refreshCanvas();
            });
        });

        myTurtle.container.on('mouseover', function(event) {
            myTurtle.bitmap.scaleX = 1.2;
            myTurtle.bitmap.scaleY = 1.2;
            myTurtle.bitmap.scale = 1.2;
            turtles.refreshCanvas();
        });

        myTurtle.container.on('mouseout', function(event) {
            myTurtle.bitmap.scaleX = 1;
            myTurtle.bitmap.scaleY = 1;
            myTurtle.bitmap.scale = 1;
            turtles.refreshCanvas();
        });

        document.getElementById('loader').className = '';
        this.refreshCanvas();
    }

    this.screenX2turtleX = function(x) {
        return x - this.canvas.width / 2.0
    }

    this.turtleX2screenX = function(x) {
        return this.canvas.width / 2.0 + x
    }

    this.invertY = function(y) {
        return this.canvas.height / 2.0 - y;
    }
}

// Queue entry for managing running blocks.
function Queue (blk, count, parentBlk) {
    this.blk = blk;
    this.count = count;
    this.parentBlk = parentBlk;
}
