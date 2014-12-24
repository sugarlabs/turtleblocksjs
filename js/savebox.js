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

// A pop up for saving projects
function SaveBox(canvas, stage, refreshCanvas, save) {
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;
    this.doSave = save;
    this.container = null;
    this.save = null;
    this.close = null;
    this.scale = 1;

    this.hide = function() {
        if (this.container != null) {
            this.container.visible = false;
            this.refreshCanvas();
        }
	var saveName = docById('mySaveName');
	saveName.style.visibility = 'hidden';
    }

    this.show = function(scale) {
        this.scale = scale;
        if (this.container == null) {
            this.container = new createjs.Container();
            this.stage.addChild(this.container);
            this.container.x = Math.floor(((this.canvas.width / scale) - 140) / 2);
            this.container.y = 27;

            function processBackground(box, name, bitmap, extras) {
                box.container.addChild(bitmap);
		loadThumbnailContainerHandler(box);
		box.completeShow();
            }
            makeBoxBitmap(this, BUTTONBOX, 'box', processBackground, null);
        } else {
            this.completeShow();
        }
    }

    this.completeShow = function() {
	this.container.visible = true;
	this.refreshCanvas();
	var saveName = docById('mySaveName');
	saveName.style.visibility = '';
        saveName.style.position = 'absolute';
        saveName.style.left = this.container.x + 'px';
	var top = this.container.y + 140;
        saveName.style.top = top + 'px';
    }
}


function loadThumbnailContainerHandler(box) {
    var hitArea = new createjs.Shape();
    this.bounds = box.container.getBounds();
    hitArea.graphics.beginFill('#FFF').drawRect(bounds.x, bounds.y, bounds. width, bounds.height);
    hitArea.x = 0;
    hitArea.y = 0;
    box.container.hitArea = hitArea;

    var locked = false;
    box.container.on('click', function(event) {
        // We need a lock to "debouce" the click.
        if (locked) {
            console.log('debouncing click');
            return;
        }
        locked = true;
        setTimeout(function() {
            locked = false;
        }, 500);

        var x = (event.stageX / box.scale) - box.container.x;
        var y = (event.stageY / box.scale) - box.container.y;
        if (x > 85 && y < 55) {
            console.log('closing box');
            box.hide();
        } else if (y > 55) {
	    // Save
	    box.doSave();
	    box.hide();
        }
    });
}


function makeBoxBitmap(box, data, name, callback, extras) {
    // Async creation of bitmap from SVG data
    // Works with Chrome, Safari, Firefox (untested on IE)
    var img = new Image();
    img.onload = function() {
        bitmap = new createjs.Bitmap(img);
        callback(box, name, bitmap, extras);
    }
    img.src = 'data:image/svg+xml;base64,' + window.btoa(
        unescape(encodeURIComponent(data)));
}


function docById(id) {
    return document.getElementById(id);
}
