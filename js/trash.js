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

    this.refreshCanvas();

    var image = new Image();
    image.src = 'images/trash/restore.svg';
    this.restoreBitmap = new createjs.Bitmap(image);
    this.stage.addChild(this.restoreBitmap);
    this.restoreBitmap.x = canvas.width - 200;
    this.restoreBitmap.y = 55;
    this.restoreBitmap.visible = false;
    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -21, 200, 42);
    hitArea.x = 100;
    hitArea.y = 21;
    this.restoreBitmap.hitArea = hitArea;
    var image = new Image();
    image.src = 'images/trash/restore-highlight.svg';
    this.restoreHighlightBitmap = new createjs.Bitmap(image);
    this.stage.addChild(this.restoreHighlightBitmap);
    this.restoreHighlightBitmap.x = this.restoreBitmap.x;
    this.restoreHighlightBitmap.y = this.restoreBitmap.y;
    this.restoreHighlightBitmap.visible = false;
    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -21, 200, 42);
    hitArea.x = 100;
    hitArea.y = 21;
    this.restoreHighlightBitmap.hitArea = hitArea;

    var image = new Image();
    image.src = 'images/trash/clearall.svg';
    this.clearAllBitmap = new createjs.Bitmap(image);
    this.stage.addChild(this.clearAllBitmap);
    this.clearAllBitmap.x = this.restoreBitmap.x;
    this.clearAllBitmap.y = this.restoreBitmap.y + 42;
    this.clearAllBitmap.visible = false;
    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -21, 200, 42);
    hitArea.x = 100;
    hitArea.y = 21;
    this.clearAllBitmap.hitArea = hitArea;
    var image = new Image();
    image.src = 'images/trash/clearall-highlight.svg';
    this.clearAllHighlightBitmap = new createjs.Bitmap(image);
    this.stage.addChild(this.clearAllHighlightBitmap);
    this.clearAllHighlightBitmap.x = this.clearAllBitmap.x;
    this.clearAllHighlightBitmap.y = this.clearAllBitmap.y;
    this.clearAllHighlightBitmap.visible = false;
    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -21, 200, 42);
    hitArea.x = 100;
    hitArea.y = 21;
    this.clearAllHighlightBitmap.hitArea = hitArea;

    var image = new Image();
    image.src = 'images/trash/confirm.svg';
    this.confirmBitmap = new createjs.Bitmap(image);
    this.stage.addChild(this.confirmBitmap);
    this.confirmBitmap.x = this.clearAllBitmap.x;
    this.confirmBitmap.y = this.clearAllBitmap.y + 42;
    this.confirmBitmap.visible = false;
    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -21, 200, 42);
    hitArea.x = 100;
    hitArea.y = 21;
    this.confirmBitmap.hitArea = hitArea;
    var image = new Image();
    image.src = 'images/trash/confirm-highlight.svg';
    this.confirmHighlightBitmap = new createjs.Bitmap(image);
    this.stage.addChild(this.confirmHighlightBitmap);
    this.confirmHighlightBitmap.x = this.confirmBitmap.x;
    this.confirmHighlightBitmap.y = this.confirmBitmap.y;
    this.confirmHighlightBitmap.visible = false;
    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -21, 200, 42);
    hitArea.x = 100;
    hitArea.y = 21;
    this.confirmHighlightBitmap.hitArea = hitArea;

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
        this.restoreBitmap.visible = false;
        this.clearAllBitmap.visible = false;
        this.confirmBitmap.visible = false;
        this.restoreHighlightBitmap.visible = false;
        this.clearAllHighlightBitmap.visible = false;
        this.confirmHighlightBitmap.visible = false;
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

    trash.restoreBitmap.on('mouseover', function(event) {
        trash.restoreBitmap.visible = false;
        trash.restoreHighlightBitmap.visible = true;
        trash.refreshCanvas();
    });

    trash.clearAllBitmap.on('mouseover', function(event) {
        trash.clearAllBitmap.visible = false;
        trash.clearAllHighlightBitmap.visible = true;
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
    
    trash.restoreHighlightBitmap.on('mouseout', function(event) {
        trash.restoreBitmap.visible = true;
        trash.restoreHighlightBitmap.visible = false;
        trash.refreshCanvas();
    });

    trash.clearAllHighlightBitmap.on('mouseout', function(event) {
        trash.clearAllBitmap.visible = true;
        trash.clearAllHighlightBitmap.visible = false;
        trash.refreshCanvas();
    });

    trash.container.on('click', function(event) {
        console.log('click: trash');
        if (trash.restoreBitmap.visible) {
            trash.hideMenu();
        } else if (trash.restoreHighlightBitmap.visible) {
            trash.hideMenu();
        } else {
            trash.restoreBitmap.visible = true;
            trash.clearAllBitmap.visible = true;
        }
        trash.refreshCanvas();
    });

    trash.restoreHighlightBitmap.on('click', function(event) {
        console.log('click: trash restore');
        trash.restore();
        trash.hideMenu();
    });

    trash.clearAllHighlightBitmap.on('click', function(event) {
        console.log('click: trash clear all');
        trash.confirmBitmap.visible = true;
        trash.refreshCanvas();
    });

    trash.confirmHighlightBitmap.on('click', function(event) {
        console.log('click: confirm');
        trash.clearAll();
        trash.hideMenu();
        trash.refreshCanvas();
    });
}
