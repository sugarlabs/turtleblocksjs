// Copyright (c) 2014,15 Walter Bender
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 3 of the License, or
// (at your option) any later version.
//
// You should have received a copy of the GNU General Public License
// along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA
// All things related to palettes
require(['activity/utils']);

var paletteBlocks = null;
var PROTOBLOCKSCALE = 1.0;
var PALETTELEFTMARGIN = 10;
var BUILTINPALETTES = ['turtle', 'pen', 'number', 'boolean', 'flow', 'blocks',
    'media', 'sensors', 'extras', 'myblocks'
];


function maxPaletteHeight(menuSize) {
    // Palettes don't start at the top of the screen and the last
    // block in a palette cannot start at the bottom of the screen,
    // hence - 3 * menuSize.
    var h = windowHeight() * canvasPixelRatio() - (3 * menuSize);
    return h - (h % STANDARDBLOCKHEIGHT) + STANDARDBLOCKHEIGHT / 2;
}


function paletteBlockButtonPush(name, arg) {
    // console.log('paletteBlockButtonPush' + name + ' ' + arg);
    blk = paletteBlocks.makeBlock(name, arg);
    return blk;
}


// There are several components to the palette system:
//
// (1) A palette button (in the Palettes.buttons dictionary) is a
// button that envokes a palette; The buttons have artwork associated
// with them: a bitmap and a highlighted bitmap that is shown when the
// mouse is over the button.
//
// loadPaletteButtonHandler is the event handler for pelette buttons.
//
// (2) A menu (in the Palettes.dict dictionary) is the palette
// itself. It consists of a title bar (with an icon, label, and close
// button), and individual containers for each protoblock on the
// menu. There is a background behind each protoblock that is part of
// the palette container.
//
// loadPaletteMenuItemHandler


function Palettes(canvas, stage, cellSize, refreshCanvas, trashcan) {
    this.canvas = canvas;
    this.stage = stage;
    this.cellSize = cellSize;
    this.halfCellSize = Math.floor(cellSize / 2);
    this.scrollDiff = 0;
    this.refreshCanvas = refreshCanvas;
    this.originalSize = 55; // this is the original svg size
    this.trashcan = trashcan;

    // The collection of palettes.
    this.dict = {};
    this.buttons = {}; // The toolbar button for each palette.
    this.highlightBitmaps = {};

    this.visible = true;
    this.scale = 1.0;
    this.x = 0;
    this.y = this.cellSize;

    this.current = 'turtle';

    this.container = new createjs.Container();
    this.container.snapToPixelEnabled = true;
    this.stage.addChild(this.container);

    this.setScale = function(scale) {
        this.scale = scale;

        this.updateButtonMasks();
        for (var i in this.dict) {
            this.dict[i].resizeEvent();
        }
    }

    // We need access to the macro dictionary because we load them.
    this.setMacroDictionary = function(obj) {
        this.macroDict = obj;
    }

    this.menuScrollEvent = function(direction, scrollSpeed) {
        var keys = Object.keys(this.buttons);

        var diff = direction * scrollSpeed;
        if (this.buttons[keys[0]].y + diff > this.cellSize && direction > 0) {
            return;
        }
        if (this.buttons[last(keys)].y + diff < windowHeight() / this.scale - this.cellSize && direction < 0) {
            return;
        }


        this.scrollDiff += diff;
        for (var name in this.buttons) {
            this.buttons[name].y += diff;
            this.buttons[name].visible = true;
        }
        this.updateButtonMasks();
        this.stage.update();
    }

    this.updateButtonMasks = function() {
        for (var name in this.buttons) {
            var s = new createjs.Shape();
            s.graphics.r(0, 0, this.cellSize, windowHeight() / this.scale);
            s.x = 0;
            s.y = this.cellSize / 2;
            this.buttons[name].mask = s;
        }
    }

    this.makeMenu = function() {
        // First, an icon/button for each palette
        for (var name in this.dict) {
            if (name in this.buttons) {
                this.dict[name].updateMenu(true);
            } else {
                this.buttons[name] = new createjs.Container();
                this.buttons[name].snapToPixelEnabled = true;
                this.stage.addChild(this.buttons[name]);
                this.buttons[name].x = this.x;
                this.buttons[name].y = this.y + this.scrollDiff;
                this.y += this.cellSize;
                var me = this;

                function processHighlightButton(me, name, bitmap, extras) {
                    if (me.cellSize != me.originalSize) {
                        bitmap.scaleX = me.cellSize / me.originalSize;
                        bitmap.scaleY = me.cellSize / me.originalSize;
                    }
                    me.highlightBitmaps[name] = bitmap;
                    me.buttons[name].addChild(me.highlightBitmaps[name]);
                    me.highlightBitmaps[name].visible = false;

                    function processButtonIcon(me, name, bitmap, extras) {
                        me.buttons[name].addChild(bitmap);
                        if (me.cellSize != me.originalSize) {
                            bitmap.scaleX = me.cellSize / me.originalSize;
                            bitmap.scaleY = me.cellSize / me.originalSize;
                        }

                        var hitArea = new createjs.Shape();
                        hitArea.graphics.beginFill('#FFF').drawEllipse(-me.halfCellSize, -me.halfCellSize, me.cellSize, me.cellSize);
                        hitArea.x = me.halfCellSize;
                        hitArea.y = me.halfCellSize;
                        me.buttons[name].hitArea = hitArea;
                        me.buttons[name].visible = false;

                        me.dict[name].makeMenu();
                        me.dict[name].moveMenu(me.cellSize, me.cellSize);
                        me.dict[name].updateMenu(false);

                        loadPaletteButtonHandler(me, name);
                    }
                    makePaletteBitmap(me, PALETTEICONS[name], name, processButtonIcon, null);
                }
                makePaletteBitmap(me, PALETTEBUTTON.replace('fill_color', '#4d4d4d'), name, processHighlightButton, null);

            }
        }
    }

    this.showMenus = function() {
        // Show the menu buttons, but not the palettes.
        for (var name in this.buttons) {
            this.buttons[name].visible = true;
        }
        for (var name in this.dict) {
            // this.dict[name].showMenu(true);
        }
        this.refreshCanvas();
    }

    this.hideMenus = function() {
        // Hide the menu buttons and the palettes themselves.
        for (var name in this.buttons) {
            this.buttons[name].visible = false;
        }
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
        this.makeMenu(); // the easel menus
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

    this.remove = function(name) {
        if (!(name in this.buttons)) {
            console.log('Palette.remove: Cannot find palette ' + name);
            return;
        }
        this.buttons[name].removeAllChildren();
        var btnKeys = Object.keys(this.dict);
        for (var btnKey = btnKeys.indexOf(name) + 1; btnKey < btnKeys.length; btnKey++) {
            this.buttons[btnKeys[btnKey]].y -= this.cellSize;
        }
        delete this.buttons[name];
        delete this.dict[name];
        this.y -= this.cellSize;
        this.makeMenu();
    }

    this.bringToTop = function() {
        // Move all the palettes to the top layer of the stage
        for (var name in this.dict) {
            this.stage.removeChild(this.dict[name].menuContainer);
            this.stage.addChild(this.dict[name].menuContainer);
            for (var item in this.dict[name].protoContainers) {
                this.stage.removeChild(this.dict[name].protoContainers[item]);
                this.stage.addChild(this.dict[name].protoContainers[item]);
            }
        }
        this.refreshCanvas();
    }

    this.findPalette = function(x, y) {
        for (var name in this.dict) {
            var px = this.dict[name].menuContainer.x;
            var py = this.dict[name].menuContainer.y;
            var height = Math.min(maxPaletteHeight(this.cellSize), this.dict[name].y);
            if (this.dict[name].menuContainer.visible && px < x &&
                x < px + MENUWIDTH && py < y && y < py + height) {
                return this.dict[name];
            }
        }
        return null;
    }

    return this;
}


// Palette Button event handlers
function loadPaletteButtonHandler(palettes, name) {
    var locked = false;
    var scrolling = false;

    palettes.buttons[name].on('mousedown', function(event) {
        scrolling = true;
        lastY = event.stageY;

        palettes.buttons[name].on('pressmove', function(event) {
            if (!scrolling) {
                return;
            }

            diff = event.stageY - lastY;
            palettes.menuScrollEvent(diff, 1);
            lastY = event.stageY;
        });

        palettes.buttons[name].on('pressup', function(event) {
            scrolling = false;
        }, null, true); // once = true
    });


    // A palette button opens or closes a palette.
    palettes.buttons[name].on('mouseover', function(event) {
        palettes.highlightBitmaps[name].visible = true;
        palettes.refreshCanvas();
    });

    palettes.buttons[name].on('pressup', function(event) {
        palettes.highlightBitmaps[name].visible = false;
        palettes.refreshCanvas();
    });

    palettes.buttons[name].on('mouseout', function(event) {

        palettes.highlightBitmaps[name].visible = false;
        palettes.refreshCanvas();
    });

    palettes.buttons[name].on('click', function(event) {
        if (locked) {
            return;
        }
        locked = true;
        setTimeout(function() {
            locked = false;
        }, 500);
        for (var i in palettes.dict) {
            if (palettes.dict[i] == palettes.dict[name]) {
                palettes.dict[name].showMenu(true);
                palettes.dict[name].showMenuItems(true);
            } else {
                if (palettes.dict[i].visible) {
                    palettes.dict[i].hideMenu(true);
                    palettes.dict[i].hideMenuItems(false);
                }
            }
        }
        palettes.refreshCanvas();
    });
}


// Define objects for individual palettes.
function Palette(palettes, name, color, bgcolor) {
    this.palettes = palettes;
    this.name = name;
    this.color = color;
    this.backgroundColor = bgcolor;
    this.visible = false;
    this.menuContainer = null;
    this.protoList = [];
    this.protoContainers = {};
    this.background = null;
    this.scrollDiff = 0
    this.y = 0;
    this.size = 0;
    this.columns = 0;
    this.draggingProtoBlock = false;
    this.mouseHandled = false;

    this.makeMenu = function(createHeader) {
        if (this.menuContainer == null) {
            this.menuContainer = new createjs.Container();
            this.menuContainer.snapToPixelEnabled = true;
        }
        if (!createHeader) {
            return;
        };
        var paletteWidth = MENUWIDTH + (this.columns * 160);
        this.menuContainer.removeAllChildren();

        // Create the menu button
        function processHeader(palette, name, bitmap, extras) {
            palette.menuContainer.addChild(bitmap);

            function processButtonIcon(palette, name, bitmap, extras) {
                bitmap.scaleX = 0.8;
                bitmap.scaleY = 0.8;
                palette.menuContainer.addChild(bitmap);
                palette.palettes.container.addChild(palette.menuContainer);

                function processCloseIcon(palette, name, bitmap, extras) {
                    palette.menuContainer.addChild(bitmap);
                    bitmap.scaleX = 0.7;
                    bitmap.scaleY = 0.7;
                    bitmap.x = paletteWidth - STANDARDBLOCKHEIGHT;

                    var hitArea = new createjs.Shape();
                    hitArea.graphics.beginFill('#FFF').drawEllipse(-paletteWidth / 2, -STANDARDBLOCKHEIGHT / 2, paletteWidth, STANDARDBLOCKHEIGHT);
                    hitArea.x = paletteWidth / 2;
                    hitArea.y = STANDARDBLOCKHEIGHT / 2;
                    palette.menuContainer.hitArea = hitArea;
                    palette.menuContainer.visible = false;
                    if (!palette.mouseHandled) {
                        loadPaletteMenuHandler(palette);
                        palette.mouseHandled = true;
                    };
                }
                makePaletteBitmap(palette, CLOSEICON, name, processCloseIcon, null);
            }
            makePaletteBitmap(palette, PALETTEICONS[name], name, processButtonIcon, null);
        }

        makePaletteBitmap(this, PALETTEHEADER.replace('fill_color', '#282828').replace('palette_label', _(this.name)).replace(/header_width/g, paletteWidth), this.name, processHeader, null);
    }

    this.resizeEvent = function() {
        this.updateBackground();
        this.updateBlockMasks();
    }

    this.updateBlockMasks = function() {
        var h = Math.min(maxPaletteHeight(this.palettes.cellSize), this.y);
        for (var i in this.protoContainers) {
            var s = new createjs.Shape();
            s.graphics.r(0, 0, MENUWIDTH, h);
            s.x = this.background.x;
            s.y = this.background.y;
            this.protoContainers[i].mask = s;
        }
    }

    this.updateBackground = function() {
        if (this.menuContainer === null) {
            return;
        }

        if (this.background !== null) {
            this.background.removeAllChildren();
        } else {
            this.background = new createjs.Container();
            this.background.snapToPixelEnabled = true;
            this.background.visible = false;
            this.palettes.stage.addChild(this.background);
            setupBackgroundEvents(this);
        }

        var h = Math.min(maxPaletteHeight(this.palettes.cellSize), this.y);
        var shape = new createjs.Shape();
        shape.graphics.f('#b3b3b3').r(0, 0, MENUWIDTH, h).ef();
        shape.width = MENUWIDTH;
        shape.height = h;
        this.background.addChild(shape);

        this.background.x = this.menuContainer.x;
        this.background.y = this.menuContainer.y + STANDARDBLOCKHEIGHT;
    }

    this.updateMenu = function(hide) {
        if (this.menuContainer == null) {
            this.makeMenu(false);
        } else {
            // Hide the menu while we update.
            if (hide) {
                this.hide();
            }
        }
        this.y = 0;
        for (var blk in this.protoList) {
            // Don't show hidden blocks on the menus
            if (this.protoList[blk].hidden) {
                continue;
            }

            // Create a proto block for each palette entry.
            var blkname = this.protoList[blk].name;
            var modname = blkname;

            switch (blkname) {
                // Use the name of the action in the label
                case 'do':
                    modname = 'do ' + this.protoList[blk].defaults[0];
                    // Call makeBlock with the name of the action
                    var arg = this.protoList[blk].defaults[0];
                    break;
                case 'storein':
                    modname = 'store in ' + this.protoList[blk].defaults[0];
                    var arg = this.protoList[blk].defaults[0];
                    break;
                case 'box':
                    modname = this.protoList[blk].defaults[0];
                    var arg = this.protoList[blk].defaults[0];
                    break;
            }

            function calculateContainerXY(palette) {
                var y = palette.menuContainer.y + palette.y + STANDARDBLOCKHEIGHT;
            }

            function calculateHeight(palette, blkname) {
                // We use a filler for the menu background
                var height = STANDARDBLOCKHEIGHT * Math.ceil((last(palette.protoList[blk].docks)[1] - 1) / STANDARDBLOCKHEIGHT);
                // Need to identify multiple arg blocks.
                if (['if', 'while', 'until', 'ifthenelse', 'waitFor'].indexOf(modname) != -1) {
                    // Some blocks are not shown full-size on the palette.
                    height = STANDARDBLOCKHEIGHT;
                } else if (['start', 'action'].indexOf(blkname) != -1) {
                    height -= STANDARDBLOCKHEIGHT;
                } else if (palette.protoList[blk].docks.length > 2 && last(palette.protoList[blk].docks)[2] != 'in' && ['anyout', 'numberout', 'booleanout'].indexOf(palette.protoList[blk].docks[0][2]) == -1) {
                    height += STANDARDBLOCKHEIGHT;
                } else if (['media', 'camera', 'video'].indexOf(blkname) != -1) {
                    height += STANDARDBLOCKHEIGHT;
                } else if (palette.protoList[blk].image) {
                    height += STANDARDBLOCKHEIGHT;
                }
                return height
            }

            if (!this.protoContainers[modname]) {
                // create graphics for the palette entry for this block
                this.protoContainers[modname] = new createjs.Container();
                this.protoContainers[modname].snapToPixelEnabled = true;

                calculateContainerXY(this)

                this.protoContainers[modname].x = this.menuContainer.x;
                this.protoContainers[modname].y = this.menuContainer.y + this.y + this.scrollDiff + STANDARDBLOCKHEIGHT;
                this.palettes.stage.addChild(this.protoContainers[modname]);
                this.protoContainers[modname].visible = false;

                var height = calculateHeight(this, blkname);
                this.size += Math.ceil(height * PROTOBLOCKSCALE);
                this.y += Math.ceil(height * PROTOBLOCKSCALE);
                this.updateBackground();

                function processFiller(palette, modname, bitmap, extras) {
                    bitmap.y = 0;
                    var blkname = extras[0];
                    var blk = extras[1];
                    var myBlock = paletteBlocks.protoBlockDict[blkname];
                    if (myBlock == null) {
                        console.log('Could not find block ' + blkname);
                        return;
                    }

                    var block_label = '';

                    switch (myBlock.name) {
                        case 'text':
                            block_label = _('text');
                            break;
                        case 'number':
                            block_label = '100';
                            break;
                        case 'less':
                        case 'greater':
                        case 'equal':
                            block_label = _(myBlock.staticLabels[0]);
                            break;
                        default:
                            if (blkname != modname) {
                                // Override label for do, storein, and box
                                block_label = palette.protoList[blk].defaults[0];
                            } else if (myBlock.staticLabels.length > 0) {
                                block_label = _(myBlock.staticLabels[0]);
                                if (block_label == '') {
                                    if (blkname == 'loadFile') {
                                        block_label = _('open file')
                                    } else {
                                        block_label = blkname;
                                    }
                                }
                            } else {
                                block_label = blkname;
                            }
                    }

                    // Don't display the label on image blocks.
                    if (myBlock.image) {
                        block_label = '';
                    }

                    switch (myBlock.name) {
                        case 'box':
                            // so the label will fit
                            var svg = new SVG();
                            svg.init();
                            svg.setScale(2);
                            svg.setExpand(60, 0, 0, 0);
                            svg.setOutie(true);
                            var artwork = svg.basicBox();
                            break;
                        case 'if':
                        case 'until':
                        case 'while':
                        case 'waitFor':
                            // so the block will fit
                            var svg = new SVG();
                            svg.init();
                            svg.setScale(2);
                            svg.setTab(true);
                            svg.setSlot(true);
                            var artwork = svg.basicBlock();
                            break;
                        case 'ifthenelse':
                            // so the block will fit
                            var svg = new SVG();
                            svg.init();
                            svg.setScale(2);
                            svg.setTab(true);
                            svg.setSlot(true);
                            var artwork = svg.basicBlock();
                            block_label = _(myBlock.staticLabels[0]) + ' ' + _(myBlock.staticLabels[2]);
                            break;
                        default:
                            var artwork = myBlock.artwork;
                            break;
                    }

                    function calculateBounds(palette, blk, modname) {
                        var bounds = palette.protoContainers[modname].getBounds();
                        palette.protoContainers[modname].cache(bounds.x, bounds.y, Math.ceil(bounds.width), Math.ceil(bounds.height));

                        var hitArea = new createjs.Shape();
                        hitArea.graphics.beginFill('#FFF').drawRect(0, 0, Math.ceil(bounds.width), Math.ceil(bounds.height));
                        palette.protoContainers[modname].hitArea = hitArea;

                        loadPaletteMenuItemHandler(palette, blk, modname);
                        palette.palettes.refreshCanvas();
                    }

                    function processBitmap(palette, modname, bitmap, args) {
                        var myBlock = args[0];
                        var blk = args[1];
                        palette.protoContainers[modname].addChild(bitmap);
                        bitmap.x = PALETTELEFTMARGIN;
                        bitmap.y = 0;
                        bitmap.scaleX = PROTOBLOCKSCALE;
                        bitmap.scaleY = PROTOBLOCKSCALE;
                        bitmap.scale = PROTOBLOCKSCALE;

                        if (myBlock.image) {
                            var image = new Image();
                            image.onload = function() {
                                var bitmap = new createjs.Bitmap(image);
                                if (image.width > image.height) {
                                    bitmap.scaleX = bitmap.scaleY = bitmap.scale = MEDIASAFEAREA[2] / image.width;
                                } else {
                                    bitmap.scaleX = bitmap.scaleY = bitmap.scale = MEDIASAFEAREA[3] / image.height;
                                }
                                palette.protoContainers[modname].addChild(bitmap);
                                bitmap.x = MEDIASAFEAREA[0];
                                bitmap.y = MEDIASAFEAREA[1];
                                calculateBounds(palette, blk, modname);
                            }
                            image.src = myBlock.image;
                        } else {
                            calculateBounds(palette, blk, modname);
                        }
                    }

                    artwork = artwork.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.palette.name]).replace('block_label', block_label);

                    while (myBlock.staticLabels.length < myBlock.args + 1) {
                        myBlock.staticLabels.push('');
                    }
                    for (var i = 1; i < myBlock.staticLabels.length; i++) {
                        artwork = artwork.replace('arg_label_' + i, _(myBlock.staticLabels[i]));
                    }

                    makePaletteBitmap(palette, artwork, modname, processBitmap, [myBlock, blk]);
                }

                makePaletteBitmap(this, PALETTEFILLER.replace(/filler_height/g, height.toString()), modname, processFiller, [blkname, blk]);
            } else {
                calculateContainerXY(this)
                var height = calculateHeight(this, blkname);
                this.y += Math.ceil(height * PROTOBLOCKSCALE);
            }
        }
        this.makeMenu(true);
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

    this.hide = function() {
        this.hideMenu();
    }

    this.show = function() {
        this.showMenu();

        for (var i in this.protoContainers) {
            this.protoContainers[i].visible = true;
        }
        this.updateBlockMasks();
        if (this.background !== null) {
            this.background.visible = true;
        }
    }

    this.hideMenu = function() {
        if (this.menuContainer != null) {
            this.menuContainer.visible = false;
            this.hideMenuItems(true);
        }
        this.moveMenu(this.palettes.cellSize, this.palettes.cellSize);
    }

    this.showMenu = function() {
        this.menuContainer.visible = true;
    }

    this.hideMenuItems = function(init) {
        for (var i in this.protoContainers) {
            this.protoContainers[i].visible = false;
        }
        if (this.background !== null) {
            this.background.visible = false;
        }
        this.visible = false;
    }

    this.showMenuItems = function(init) {
        for (var i in this.protoContainers) {
            this.protoContainers[i].visible = true;
        }
        this.updateBlockMasks();
        if (this.background !== null) {
            this.background.visible = true;
        }
        this.visible = true;
    }

    this.moveMenuItems = function(x, y) {
        for (var i in this.protoContainers) {
            this.protoContainers[i].x = x;
            this.protoContainers[i].y = y;
        }
        if (this.background !== null) {
            this.background.x = x;
            this.background.y = y;
        }
    }

    this.moveMenuItemsRelative = function(dx, dy) {
        for (var i in this.protoContainers) {
            this.protoContainers[i].x += dx;
            this.protoContainers[i].y += dy;
        }
        if (this.background !== null) {
            this.background.x += dx;
            this.background.y += dy;
        }
    }

    this.scrollEvent = function(direction, scrollSpeed) {
        var diff = direction * scrollSpeed;
        var h = Math.min(maxPaletteHeight(this.palettes.cellSize), this.y);

        if (this.y < maxPaletteHeight(this.palettes.cellSize)) {
            return;
        }
        if (this.scrollDiff + diff > 0 && direction > 0) {
            return;
        }
        if (this.y + this.scrollDiff < h && direction < 0) {
            return;
        }

        this.scrollDiff += diff;
        for (var i in this.protoContainers) {
            this.protoContainers[i].y += diff;
            this.protoContainers[i].visible = true;
        }
        this.updateBlockMasks();

        var stage = this.palettes.stage;
        stage.setChildIndex(this.menuContainer, stage.getNumChildren() - 1);
        this.palettes.stage.update();
    }

    this.getInfo = function() {
        var returnString = this.name + ' palette:';
        for (var thisBlock in this.protoList) {
            returnString += ' ' + this.protoList[thisBlock].name;
        }
        return returnString;
    };

    this.add = function(protoblock) {
        if (this.protoList.indexOf(protoblock) == -1) {
            this.protoList.push(protoblock);
        }
        return this;
    }

    return this;
};


var blocks = undefined;

function initPalettes(canvas, stage, cellSize, refreshCanvas, trashcan, b) {
    // Instantiate the palettes object on first load.
    var palettes = new Palettes(canvas, stage, cellSize, refreshCanvas, trashcan).
    add('turtle', 'black', '#00b700').
    add('pen', 'black', '#00c0e7').
    add('number', 'black', '#ff00ff').
    add('boolean', 'black', '#ff00ff').
    add('flow', 'black', '#fd6600').
    add('blocks', 'black', '#ffc000').
    add('media', 'black', '#ffc000').
    add('sensors', 'white', '#ff0066').
    add('extras', 'white', '#ff0066');
    blocks = b;

    // Give the palettes time to load.
    setTimeout(function() {
        palettes.show();
        palettes.bringToTop();
    }, 2000);
    return palettes;
}


var MODEUNSURE = 0;
var MODEDRAG = 1;
var MODESCROLL = 2;
var DECIDEDISTANCE = 20;


function setupBackgroundEvents(palette) {
    var scrolling = false;
    palette.background.on('mousedown', function(event) {
        scrolling = true;
        var lastY = event.stageY;

        palette.background.on('pressmove', function(event) {
            if (!scrolling) {
                return;
            }

            var diff = event.stageY - lastY;
            palette.scrollEvent(diff, 1);
            lastY = event.stageY;
        });

        palette.background.on('pressup', function(event) {
            scrolling = false;
        }, null, true); // once = true
    });
}


// Menu Item event handlers
function loadPaletteMenuItemHandler(palette, blk, blkname) {
    // A menu item is a protoblock that is used to create a new block.
    var locked = false;
    var moved = false;
    var saveX = palette.protoContainers[blkname].x;
    var saveY = palette.protoContainers[blkname].y;
    var bgScrolling = false;

    function makeBlockFromPalette(blk, blkname, palette) {
        var arg = '__NOARG__';
        switch (palette.protoList[blk].name) {
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

    palette.protoContainers[blkname].on('mousedown', function(event) {
        var stage = palette.palettes.stage;
        stage.setChildIndex(palette.protoContainers[blkname], stage.getNumChildren() - 1);
        palette.protoContainers[blkname].mask = null;

        moved = false;
        saveX = palette.protoContainers[blkname].x;
        saveY = palette.protoContainers[blkname].y - palette.scrollDiff;
        var startX = event.stageX;
        var startY = event.stageY;
        var lastY = event.stageY;
        if (palette.draggingProtoBlock) {
            return;
        }
        if (locked) {
            return;
        }
        locked = true;
        setTimeout(function() {
            locked = false;
        }, 500);

        var mode = MODEUNSURE;

        palette.protoContainers[blkname].on('pressmove', function(event) {
            if (mode === MODEDRAG) {
                moved = true;
                palette.draggingProtoBlock = true;
                palette.protoContainers[blkname].x = Math.round(event.stageX / palette.palettes.scale) - PALETTELEFTMARGIN;
                palette.protoContainers[blkname].y = Math.round(event.stageY / palette.palettes.scale);
                palette.palettes.refreshCanvas();
                return;
            }

            if (mode === MODESCROLL) {
                var diff = event.stageY - lastY;
                palette.scrollEvent(diff, 1);
                lastY = event.stageY;
                return;
            }

            var xd = Math.abs(event.stageX - startX);
            var yd = Math.abs(event.stageY - startY);
            var diff = Math.sqrt(xd * xd + yd * yd);
            if (mode === MODEUNSURE && diff > DECIDEDISTANCE) {
                mode = yd > xd ? MODESCROLL : MODEDRAG;
            }
        });
    });

    palette.protoContainers[blkname].on('pressup', function(event) {
        if (moved) {
            moved = false;
            palette.draggingProtoBlock = false;
            if (palette.name == 'myblocks') {
                // If we are on the myblocks palette, it is a macro.
                var macroName = blkname.replace('macro_', '');
                var obj = palette.palettes.macroDict[macroName];
                // Set the position of the top block in the stack
                // before loading.
                obj[0][2] = palette.protoContainers[blkname].x;
                obj[0][3] = palette.protoContainers[blkname].y;
                console.log('loading macro ' + macroName);
                paletteBlocks.loadNewBlocks(obj);
                // FIXME: collapse is wrong.
            } else {
                // Create the block.
                var newBlock = makeBlockFromPalette(blk, blkname, palette);
                // Move the drag group under the cursor.
                paletteBlocks.findDragGroup(newBlock);
                for (i in paletteBlocks.dragGroup) {
                    paletteBlocks.moveBlockRelative(paletteBlocks.dragGroup[i], Math.round(event.stageX / palette.palettes.scale) - paletteBlocks.stage.x, Math.round(event.stageY / palette.palettes.scale) - paletteBlocks.stage.y);
                }
                // Dock with other blocks if needed
                blocks.blockMoved(newBlock);
            }
            // Return protoblock we've been dragging back to the palette.
            palette.protoContainers[blkname].x = saveX;
            palette.protoContainers[blkname].y = saveY + palette.scrollDiff;
            palette.updateBlockMasks();
            palette.palettes.refreshCanvas();
        }
    });
}


// Palette Menu event handlers
function loadPaletteMenuHandler(palette) {
    // The palette menu is the container for the protoblocks. One
    // palette per palette button.

    var locked = false;
    var trashcan = palette.palettes.trashcan;
    var paletteWidth = MENUWIDTH + (palette.columns * 160);

    palette.menuContainer.on('click', function(event) {
        if (Math.round(event.stageX / palette.palettes.scale) > palette.menuContainer.x + paletteWidth - STANDARDBLOCKHEIGHT) {
            palette.hide();
            palette.palettes.refreshCanvas();
            return;
        }

        if (locked) {
            return;
        }
        locked = true;
        setTimeout(function() {
            locked = false;
        }, 500);

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
        trashcan.show();
        // Move them all?
        var offset = {
            x: palette.menuContainer.x - Math.round(event.stageX / palette.palettes.scale),
            y: palette.menuContainer.y - Math.round(event.stageY / palette.palettes.scale)
        };

        palette.menuContainer.on('pressup', function(event) {
            if (trashcan.overTrashcan(event.stageX / palette.palettes.scale, event.stageY / palette.palettes.scale)) {
                palette.hide();
                palette.palettes.refreshCanvas();
                // Only delete plugin palettes.
                if (BUILTINPALETTES.indexOf(palette.name) === -1) {
                    promptPaletteDelete(palette);
                } else if (palette.name == 'myblocks') {
                    promptMacrosDelete(palette);
                }
            }
            trashcan.hide();
        });

        palette.menuContainer.on('mouseout', function(event) {
            if (trashcan.overTrashcan(event.stageX / palette.palettes.scale, event.stageY / palette.palettes.scale)) {
                palette.hide();
                palette.palettes.refreshCanvas();
            }
            trashcan.hide();
        });

        palette.menuContainer.on('pressmove', function(event) {
            var oldX = palette.menuContainer.x;
            var oldY = palette.menuContainer.y;
            palette.menuContainer.x = Math.round(event.stageX / palette.palettes.scale) + offset.x;
            palette.menuContainer.y = Math.round(event.stageY / palette.palettes.scale) + offset.y;
            palette.palettes.refreshCanvas();
            var dx = palette.menuContainer.x - oldX;
            var dy = palette.menuContainer.y - oldY;

            // If we are over the trash, warn the user.
            if (trashcan.overTrashcan(event.stageX / palette.palettes.scale, event.stageY / palette.palettes.scale)) {
                trashcan.highlight();
            } else {
                trashcan.unhighlight();
            }

            // Hide the menu items while drag.
            palette.hideMenuItems(false);
            palette.moveMenuItemsRelative(dx, dy);
        });
    });

    palette.menuContainer.on('mouseout', function(event) {
    });
}


function promptPaletteDelete(palette) {
    var msg = 'Do you want to remove all "%s" blocks from your project?'.replace('%s', palette.name)
    if (!confirm(msg)) {
        return;
    }

    console.log('removing palette ' + palette.name);
    palette.palettes.remove(palette.name);

    delete pluginObjs['PALETTEHIGHLIGHTCOLORS'][palette.name];
    delete pluginObjs['PALETTESTROKECOLORS'][palette.name];
    delete pluginObjs['PALETTEFILLCOLORS'][palette.name];
    delete pluginObjs['PALETTEPLUGINS'][palette.name];

    for (var i = 0; i < palette.protoList.length; i++) {
        var name = palette.protoList[i].name;
        delete pluginObjs['FLOWPLUGINS'][name];
        delete pluginObjs['ARGPLUGINS'][name];
        delete pluginObjs['BLOCKPLUGINS'][name];
    }

    localStorage.plugins = preparePluginExports({});
}


function promptMacrosDelete(palette) {
    var msg = 'Do you want to remove all the stacks from your custom palette?';
    if (!confirm(msg)) {
        return;
    }

    console.log('removing macros from ' + palette.name);
    for (var i = 0; i < palette.protoList.length; i++) {
        var name = palette.protoList[i].name;
        delete palette.protoContainers[name];
        delete palette.protoBackgrounds[name];
        palette.protoList.splice(i, 1);
    }
    palette.palettes.updatePalettes();
    localStorage.macros = prepareMacroExports(null, null, {});
}


function makePaletteBitmap(palette, data, name, callback, extras) {
    // Async creation of bitmap from SVG data
    // Works with Chrome, Safari, Firefox (untested on IE)
    var img = new Image();
    img.onload = function() {
        bitmap = new createjs.Bitmap(img);
        callback(palette, name, bitmap, extras);
    }
    img.src = 'data:image/svg+xml;base64,' + window.btoa(
        unescape(encodeURIComponent(data)));
}
