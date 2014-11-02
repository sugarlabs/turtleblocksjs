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

// For DOM access to the palettes
var palettePalettes = null;
var paletteBlocks = null;

var paletteScale = 0.75;

function paletteBlockButtonPush(name, arg) {
    blk = paletteBlocks.makeBlock(name, arg);
    return blk;
}

// All things related to palettes
function Palettes (canvas, stage, refreshCanvas) {
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;

    // The collection of palettes.
    this.dict = {};

    this.visible = true;

    this.current = 'turtle';

    this.container = new createjs.Container();
    this.stage.addChild(this.container);

    this.makeMenus = function() {
        var x = 330; // hardwired to palette button position
        var y = 0;  // top aligned
        for (var name in this.dict) {
            this.dict[name].makeMenu();
            this.dict[name].moveMenu(x, y);
            y += 42;
        }
    }

    this.showMenus = function() {
        for (var name in this.dict) {
            this.dict[name].showMenu(true);
        }
        this.refreshCanvas();
    }

    this.hideMenus = function() {
        for (var name in this.dict) {
            this.dict[name].hideMenu(true);
        }
        this.refreshCanvas();
    }

    this.getInfo = function() {
        for (var key in this.dict) {
            console.log(this.dict[key].getInfo());
        }
    }

    this.updatePalettes = function() {
        this.makeMenus();  // the easel menus
        this.refreshCanvas();
    }

    this.hide = function() {
        this.hideMenus();
        this.visible = false;
    }

    this.show = function() {
        this.showMenus();
        this.visible = true;
    }

    this.setBlocks = function(blocks) {
        paletteBlocks = blocks;
    }

    this.add = function(name, color, bgcolor) {
        this.dict[name] = new Palette(this, name, color, bgcolor);
        return this;
    }

    this.bringToTop = function() {
        // Move all the palettes to the top layer of the stage
        for (var name in this.dict) {
            this.stage.removeChild(this.dict[name].menuBitmap);
            this.stage.addChild(this.dict[name].menuBitmap);
            for (var item in this.dict[name].protoContainers) {
                this.stage.removeChild(this.dict[name].protoContainers[item]);
                this.stage.addChild(this.dict[name].protoContainers[item]);
            }
        }
        this.refreshCanvas();
    }

    return this;
}

// Define objects for individual palettes.
function Palette (palettes, name, color, bgcolor) {
    this.palettes = palettes;
    this.name = name;
    this.color = color;
    this.backgroundColor = bgcolor;
    this.visible = false;
    this.menuBitmap = null;
    this.protoList = [];
    this.protoContainers = {};
    this.y = 0;
    this.size = 0;

    this.makeMenu = function() {
        // Create the menu button
        if (this.menuBitmap == null) {
	    this.menuContainer = new createjs.Container();
	    var background = new createjs.Bitmap(PALETTEHEADER.replace('fill_color', '#282828').replace('palette_label', this.name));
	    this.menuContainer.addChild(background);
            var image = new Image();
            image.src = 'images/' + this.name + '.svg';
            var icon = new createjs.Bitmap(image);
	    icon.scaleX = 0.8;
	    icon.scaleY = 0.8;
	    this.menuContainer.addChild(icon);
            this.palettes.container.addChild(this.menuContainer);
            var hitArea = new createjs.Shape();
            hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -21, 200, 42);
            hitArea.x = 100;
            hitArea.y = 21;
            this.menuContainer.hitArea = hitArea;
            this.menuContainer.visible = false;
            loadPaletteMenuHandler(this);
        }
        for (var blk in this.protoList) {
            // Create a proto block for each palette entry.
            var blkname = this.protoList[blk].name;
            var modname = blkname;
            switch (blkname) {
            case 'do':
                // Use the name of the action in the label
                modname = 'do ' + this.protoList[blk].defaults[0];
                // Call makeBlock with the name of the action
                var arg = this.protoList[blk].defaults[0];
                break;
            case 'storein':
                // Use the name of the box in the label
                modname = 'store in ' + this.protoList[blk].defaults[0];
                var arg = this.protoList[blk].defaults[0];
                break;
            case 'box':
                // Use the name of the box in the label
                modname = this.protoList[blk].defaults[0];
                var arg = this.protoList[blk].defaults[0];
                break;
            }
            if (!this.protoContainers[modname]) {
                // create graphics for the palette entry for this block
                this.protoContainers[modname] = new createjs.Container();
                this.protoContainers[modname].x = 0;
                this.protoContainers[modname].y = this.y + 42;
                this.palettes.stage.addChild(this.protoContainers[modname]);

                // We use a filler for the menu background
                var height = 42 * Math.ceil(last(this.protoList[blk].docks)[1] / 42);
                if (['action', 'start'].indexOf(blkname) != -1) {
                    height += 84;
                } else if (['media'].indexOf(blkname) != -1) {
                    height += 42;
                }
                this.size += height * paletteScale;

                for (var h = 0; h < height; h += 42) {
                    var bitmap = new createjs.Bitmap(PALETTEFILLER);
                    this.protoContainers[modname].addChild(bitmap);
                    bitmap.y = h * paletteScale;
                }

                var myBlock = paletteBlocks.protoBlockDict[blkname];
                if (blkname == 'text') {
                    var block_label = 'text';
                } else if (blkname == 'number') {
                    var block_label = '100';
                } else if (blkname != modname) {
                    // Override label for do, storein, and box
                    var block_label = this.protoList[blk].defaults[0];
                } else if (myBlock.staticLabels.length > 0) {
                    var block_label = myBlock.staticLabels[0];
                } else {
                    var block_label = blkname;
                }
                if (myBlock.staticLabels.length > 1) {
                    var top_label = myBlock.staticLabels[1];
                } else {
                    var top_label = '';
                }
                if (myBlock.staticLabels.length > 2) {
                    var bottom_label = myBlock.staticLabels[2];
                } else {
                    var bottom_label = '';
                }
                if (myBlock.name == 'box') {
                    var artwork = VALUEBLOCK;  // so the label will fit
                } else {
                    var artwork = myBlock.artwork;
                }

                var bitmap = new createjs.Bitmap(artwork.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.palette.name]).replace('block_label', block_label).replace('top_label', top_label).replace('bottom_label', bottom_label).replace('font_size', myBlock.fontsize));

                this.protoContainers[modname].addChild(bitmap);
                bitmap.x = 20;
                bitmap.y = 0;
                bitmap.scaleX = paletteScale;
                bitmap.scaleY = paletteScale;
                bitmap.scale = paletteScale;
                var hitArea = new createjs.Shape();
                hitArea.graphics.beginFill('#FFF').drawEllipse(-50, -21, 100, 42);
                hitArea.x = 50;
                hitArea.y = 21;
                this.protoContainers[modname].hitArea = hitArea;

                if (this.protoList[blk].expandable) {
                    var yoff = Math.floor(this.protoList[blk].yoff * paletteScale); 
                    if (myBlock.style == 'arg') {
                        var bottomArtwork = ARG2BLOCKBOTTOM;
                    } else if (myBlock.style == 'special') {
                        var bottomArtwork = BASICBLOCK2ARGBOTTOM;
                    } else if (myBlock.style == 'value') {
                        var bottomArtwork = BASICBLOCK2ARGBOTTOM;
                    } else if (myBlock.palette == 'flow') {
                        var bottomArtwork = FLOWCLAMPBOTTOM;
                    } else {
                        var bottomArtwork = ACTIONCLAMPBOTTOM;
                    }
                    var bitmap = new createjs.Bitmap(bottomArtwork.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.palette.name]).replace('bottom_label', bottom_label).replace('font_size', myBlock.fontsize));
                    this.protoContainers[modname].addChild(bitmap);
                    bitmap.scaleX = paletteScale;
                    bitmap.scaleY = paletteScale;
                    bitmap.scale = paletteScale;
                    bitmap.x = 20;
                    bitmap.y = yoff;
                }
                this.protoContainers[modname].visible = false;
                this.y += Math.floor(height * paletteScale);
                loadPaletteMenuItemHandler(this, blk, modname, this);
                bounds = this.protoContainers[modname].getBounds();
                // TODO: Fix caching
                // console.log(bounds);
                // this.protoContainers[modname].cache(bounds.x, bounds.y, bounds.width, Math.ceil(bounds.height));
            }
        }
    }

    this.moveMenu = function(x, y) {
        dx = x - this.menuContainer.x;
        dy = y - this.menuContainer.y;
        this.menuContainer.x = x;
        this.menuContainer.y = y;
        this.moveMenuItemsRelative(dx, dy);
    }

    this.moveMenuRelative = function(dx, dy) {
        this.menuContainer.x += dx;
        this.menuContainer.y += dy;
        this.moveMenuItemsRelative(dx, dy);
    }

    this.hideMenu = function() {
        if (this.menuContainer != null) {
            this.menuContainer.visible = false;
            this.hideMenuItems(true);
        }
    }

    this.showMenu = function() {
        this.menuContainer.visible = true;
    }

    this.hideMenuItems = function(init) {
        for (var i in this.protoContainers) {
            this.protoContainers[i].visible = false;
            // this.protoContainers[i].updateCache();
        }
        this.visible = false;
        // Move the menus below up
        var below = false;
        for (var p in this.palettes.dict) {
            if (!init && below) {
                this.palettes.dict[p].moveMenuRelative(0, -this.size);
            }
            if (p == this.name) {
                below = true;
            }
        }
    }

    this.showMenuItems = function(init) {
        for (var i in this.protoContainers) {
            this.protoContainers[i].visible = true;
            // this.protoContainers[i].updateCache();
        }
        this.visible = true;
        // Move the menus below down
        var below = false;
        for (var p in this.palettes.dict) {
            if (!init && below) {
                this.palettes.dict[p].moveMenuRelative(0, this.size);
            }
            if (p == this.name) {
                below = true;
            }
        }
    }

    this.moveMenuItems = function(x, y) {
        for (var i in this.protoContainers) {
            this.protoContainers[i].x = x;
            this.protoContainers[i].y = y;
        }
    }

    this.moveMenuItemsRelative = function(dx, dy) {
        for (var i in this.protoContainers) {
            this.protoContainers[i].x += dx;
            this.protoContainers[i].y += dy;
        }
    }

    this.getInfo = function() {
        var returnString = this.name + ' palette:';
        for (var thisBlock in this.protoList) {
            returnString += ' ' + this.protoList[thisBlock].name;
        }
        return returnString;
    };

    this.add = function(protoblock) {
        this.protoList.push(protoblock);
        return this;
    }

    return this;

};

function initPalettes(canvas, stage, refreshCanvas) {
    // Instantiate the palettes object.
    var palettes = new Palettes(canvas, stage, refreshCanvas).
        add('turtle', 'black', '#00b700').
        add('pen', 'black', '#00c0e7').
        add('number', 'black', '#ff00ff').
        add('flow', 'black', '#fd6600').
        add('blocks', 'black', '#ffc000').
        add('sensors', 'white', '#ff0066').
        add('extras', 'white', '#ff0066');
    palettePalettes = palettes;
    palettes.hide();
    return palettes;
}

// Menu Item event handlers
function loadPaletteMenuItemHandler(self, blk, blkname, palette) {
    // On a click make a new block; then close the menu.
    // FIXME: add drag and add move (move them all)
    self.protoContainers[blkname].on('click', function(event) {
        // makeBlock(blk, blkname, palette);
        // palette.hideMenuItems();
        // palette.palettes.refreshCanvas();
    });

    function makeBlock(blk, blkname, palette) {
        var arg = '__NOARG__';
        switch (blkname) {
        case 'do':
            blkname = 'do ' + palette.protoList[blk].defaults[0];
            var arg = palette.protoList[blk].defaults[0];
            break;
        case 'storein':
            // Use the name of the box in the label
            blkname = 'store in ' + palette.protoList[blk].defaults[0];
            var arg = palette.protoList[blk].defaults[0];
            break;
        case 'box':
            // Use the name of the box in the label
            blkname = palette.protoList[blk].defaults[0];
            var arg = palette.protoList[blk].defaults[0];
            break;
        }
        return paletteBlockButtonPush(palette.protoList[blk].name, arg);
    }

    self.protoContainers[blkname].on('mousedown', function(event) {
        // Create the block.
        newBlock = makeBlock(blk, blkname, palette);
        // Move the drag group under the cursor.
        paletteBlocks.findDragGroup(newBlock);
        for (i in paletteBlocks.dragGroup) {
            paletteBlocks.moveBlockRelative(paletteBlocks.dragGroup[i], event.stageX - 30, event.stageY - 20);
        }
        palette.palettes.refreshCanvas();
    });
}

// Palette Menu event handlers
function loadPaletteMenuHandler(palette) {
    palette.menuContainer.on('mouseover', function(event) {
        // palette.highlight();
        // palette.palettes.refreshCanvas();
    });

    palette.menuContainer.on('mouseout', function(event) {
        // palette.unhighlight();
        // palette.palettes.refreshCanvas();
    });
    
    palette.menuContainer.on('click', function(event) {
        for (p in palette.palettes.dict) {
            if (palette.name != p) {
                if (palette.palettes.dict[p].visible) {
                    palette.palettes.dict[p].hideMenuItems(false);
                }
            }
        }
        if (palette.visible) {
            palette.hideMenuItems(false);
        } else {
            palette.showMenuItems(false);
        }
        palette.palettes.refreshCanvas();
    });

    palette.menuContainer.on('mousedown', function(event) {
        // FIXME: move them all
        var offset = {
            x: palette.menuContainer.x - event.stageX,
            y: palette.menuContainer.y - event.stageY
        };

        palette.menuContainer.on('pressmove', function(event) {
            moved = true;
            var oldX = palette.menuContainer.x;
            var oldY = palette.menuContainer.y;
            palette.menuContainer.x = event.stageX + offset.x;
            palette.menuContainer.y = event.stageY + offset.y;
            palette.palettes.refreshCanvas();
            var dx = palette.menuContainer.x - oldX;
            var dy = palette.menuContainer.y - oldY;
            palette.moveMenuItemsRelative(dx, dy);
        });
    });

    palette.menuContainer.on('mouseout',function(event) {
    });
}
