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
function Trashcan (canvas, stage, refreshCanvas, restore, clearall) {
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;
    this.restore = restore;
    this.clearAll = clearall;

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
    
    var bounds = this.container.getBounds();
    this.container.x = canvas.width - 55; // bounds.width;
    this.container.y = 0;

    var w = 55; // bounds.width;
    var h = 55; // bounds.height;
    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill('#FFF').drawEllipse(-w/2, -h/2, w, h);
    hitArea.x = w/2;
    hitArea.y = h/2;
    this.container.hitArea = hitArea;

    this.bitmap.name = 'bmp_trash';
    this.highlightBitmap.name = 'bmp_trash_highlight';

    this.bitmap.visible = true;
    this.highlightBitmap.visible = false;

    this.refreshCanvas();

    this.restoreContainer = new createjs.Container();
    this.restoreBitmap = new createjs.Bitmap(PALETTEHEADER.replace('fill_color', '#282828').replace('palette_label', 'restore all'));
    this.restoreContainer.addChild(this.restoreBitmap);
    this.restoreHighlightBitmap = new createjs.Bitmap(PALETTEHEADER.replace('fill_color', '#4d4d4d').replace('palette_label', 'restore all'));
    this.restoreContainer.addChild(this.restoreHighlightBitmap);
    var restoreIcon = this.bitmap.clone();
    restoreIcon.scaleX = 0.8;
    restoreIcon.scaleY = 0.8;
    this.restoreContainer.addChild(restoreIcon);
    this.stage.addChild(this.restoreContainer);
    this.restoreContainer.x = canvas.width - 200;
    this.restoreContainer.y = 55; // h;
    this.restoreContainer.visible = false;
    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -21, 200, 42);
    hitArea.x = 100;
    hitArea.y = 21;
    this.restoreContainer.hitArea = hitArea;

    this.clearallContainer = new createjs.Container();
    this.clearallBitmap = new createjs.Bitmap(PALETTEHEADER.replace('fill_color', '#282828').replace('palette_label', 'clear all'));
    this.clearallContainer.addChild(this.clearallBitmap);
    this.clearallHighlightBitmap = new createjs.Bitmap(PALETTEHEADER.replace('fill_color', '#4d4d4d').replace('palette_label', 'clear all'));
    this.clearallContainer.addChild(this.clearallHighlightBitmap);
    var clearallIcon = this.bitmap.clone();
    clearallIcon.scaleX = 0.8;
    clearallIcon.scaleY = 0.8;
    this.clearallContainer.addChild(clearallIcon);
    this.stage.addChild(this.clearallContainer);
    this.clearallContainer.x = this.restoreContainer.x;
    this.clearallContainer.y = this.restoreContainer.y + 42;
    this.clearallContainer.visible = false;
    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -21, 200, 42);
    hitArea.x = 100;
    hitArea.y = 21;
    this.clearallContainer.hitArea = hitArea;

    this.confirmContainer = new createjs.Container();
    this.confirmBitmap = new createjs.Bitmap(PALETTEHEADER.replace('fill_color', '#282828').replace('palette_label', 'confirm'));
    this.confirmContainer.addChild(this.confirmBitmap);
    this.confirmHighlightBitmap = new createjs.Bitmap(PALETTEHEADER.replace('fill_color', '#4d4d4d').replace('palette_label', 'confirm'));
    this.confirmContainer.addChild(this.confirmHighlightBitmap);
    this.stage.addChild(this.confirmContainer);
    this.confirmContainer.x = this.clearallContainer.x;
    this.confirmContainer.y = this.clearallContainer.y + 42;
    this.confirmContainer.visible = false;
    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -21, 200, 42);
    hitArea.x = 100;
    hitArea.y = 21;
    this.confirmContainer.hitArea = hitArea;

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

    this.hideMenu = function() {
        this.restoreContainer.visible = false;
        this.clearallContainer.visible = false;
        this.confirmContainer.visible = false;
    }

    this.overTrashcan = function(x, y) {
        // FIX ME: what is the size of the trash can?
        if (x < this.container.x) {
            return false;
        } else if (x > this.container.x + 55) {
            return false;
        }
        if (y < this.container.y) {
            return false;
        } else if (y > this.container.y + 55) {
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

    trash.restoreContainer.on('mouseover', function(event) {
        trash.restoreBitmap.visible = false;
        trash.restoreHighlightBitmap.visible = true;
        trash.refreshCanvas();
    });

    trash.clearallContainer.on('mouseover', function(event) {
        trash.clearallBitmap.visible = false;
        trash.clearallHighlightBitmap.visible = true;
        trash.refreshCanvas();
    });

    trash.confirmBitmap.on('mouseover', function(event) {
        trash.confirmBitmap.visible = false;
        trash.confirmHighlightBitmap.visible = true;
        trash.refreshCanvas();
    });

    trash.container.on('mouseout', function(event) {
        trash.unhighlight();
        trash.refreshCanvas();
    });
    
    trash.restoreContainer.on('mouseout', function(event) {
        trash.restoreBitmap.visible = true;
        trash.restoreHighlightBitmap.visible = false;
        trash.refreshCanvas();
    });

    trash.clearallHighlightBitmap.on('mouseout', function(event) {
        trash.clearallBitmap.visible = true;
        trash.clearallHighlightBitmap.visible = false;
        trash.refreshCanvas();
    });

    trash.container.on('click', function(event) {
        console.log('click: trash');
        if (trash.restoreContainer.visible) {
            trash.hideMenu();
        } else {
            trash.restoreContainer.visible = true;
            trash.clearallContainer.visible = true;
        }
        trash.refreshCanvas();
    });

    trash.restoreContainer.on('click', function(event) {
        console.log('click: trash restore');
        trash.restore();
        trash.hideMenu();
    });

    trash.clearallContainer.on('click', function(event) {
        console.log('click: trash clear all');
        trash.confirmContainer.visible = true;
        trash.refreshCanvas();
    });

    trash.confirmContainer.on('click', function(event) {
        console.log('click: confirm');
        trash.clearAll(true);
        trash.hideMenu();
        trash.refreshCanvas();
    });
}
