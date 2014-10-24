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

// All things related to trash
function Trashcan (canvas, stage, refreshCanvas, addTick, restore) {
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;
    this.addTick = addTick;
    this.restore = restore;

    this.trashBitmap = null;

    this.container = new createjs.Container();
    this.stage.addChild(this.container);

    var image = new Image();
    image.src = 'images/trash.svg';
    this.bitmap = new createjs.Bitmap(image);
    this.container.addChild(this.bitmap);

    var highlightImage = new Image();
    highlightImage.src = 'images/highlights/trash.svg';
    this.highlightBitmap = new createjs.Bitmap(highlightImage);
    this.container.addChild(this.highlightBitmap);
    
    // FIXME
    this.container.x = canvas.width - 55;
    this.container.y = 0;

    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill('#FFF').drawEllipse(-27, -27, 55, 55);
    hitArea.x = 27;
    hitArea.y = 27;
    this.container.hitArea = hitArea;

    this.bitmap.x = 0;
    this.bitmap.y = 0;
    this.bitmap.scaleX = this.bitmap.scaleY = this.bitmap.scale = 1;
    this.bitmap.name = 'bmp_trash';
    this.highlightBitmap.x = 0;
    this.highlightBitmap.y = 0;
    this.highlightBitmap.scaleX = this.highlightBitmap.scaleY = this.highlightBitmap.scale = 1;
    this.highlightBitmap.name = 'bmp_trash_highlight';

    this.bitmap.visible = true;
    this.highlightBitmap.visible = false;

    document.getElementById('loader').className = '';
    this.addTick();

    this.refreshCanvas();

    loadTrashHandlers(this);

    this.hide = function() {
	this.bitmap.visible = false;
	this.highlightBitmap.visible = false;
	this.refreshCanvas();
    }

    this.show = function() {
	this.bitmap.visible = true;
	this.highlightBitmap.visible = false;
	this.refreshCanvas();
    }

    this.highlight = function() {
	this.bitmap.visible = false;
	this.highlightBitmap.visible = true;
	this.refreshCanvas();
    }

    this.unhighlight = function() {
	this.bitmap.visible = true;
	this.highlightBitmap.visible = false;
	this.refreshCanvas();
    }

    this.overTrashcan = function(x, y) {
	if (x < this.container.x) {
	    return false;
	} else if (x > this.container.x + this.container.width) {
	    return false;
	}
	if (y < this.container.y) {
	    return false;
	} else if (y > this.container.y + this.container.height) {
	    return false;
	}
	return true;
    }
}

function loadTrashHandlers(trash) {
    trash.container.on('mouseover', function(event) {
	trash.highlight();
	trash.refreshCanvas();
    });

    trash.container.on('mouseout', function(event) {
	trash.unhighlight();
	trash.refreshCanvas();
    });
    
    trash.container.on('click', function(event) {
	console.log('click: restoring trash');
	trash.restore();
	trash.refreshCanvas();
    });
}
