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

function paletteButtonPush(name) {
    palettePalettes.toggle(name);
}

function paletteBlockButtonPush(name, arg) {
    paletteBlocks.makeBlock(name, arg);
}

// All things related to palettes
function Palettes (canvas, stage, refreshCanvas) {
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;

    // The collection of palettes.
    this.dict = {};

    this.visible = true;

    // TODO: replace with easel palettes
    // and a place in the DOM to put palettes.
    this.paletteElem = docById('header');

    this.current = 'turtle';

    this.container = new createjs.Container();
    this.stage.addChild(this.container);

    this.makeMenus = function() {
	var x = canvas.width / 2 - 100;  // centered
	var y = 0;  // top aligned
	for (var name in this.dict) {
	    this.dict[name].makeMenu();
	    this.dict[name].moveMenu(x, y);
	    y += 42;
	}
    }

    this.showMenus = function() {
	for (var name in this.dict) {
	    this.dict[name].showMenu();
	}
	this.refreshCanvas();
    }

    this.hideMenus = function() {
	for (var name in this.dict) {
	    this.dict[name].hideMenu();
	}
	this.refreshCanvas();
    }

    this.getInfo = function() {
	for (var key in this.dict) {
	    console.log(this.dict[key].getInfo());
	}
    }

    // Generate the IDs for the DOM elements we need
    this.genPaletteButtonId = function(name) {
	return '_' + name + '_palette_button';
    }

    this.genPaletteId = function(name) {
	return '_' + name + '_palette_div';
    }

    this.genBlockButtonId = function(name, blk) {
	return '_' + this.dict[name].protoList[blk].name + '_block_button';
    }

    this.toggle = function(name) {
	// Toggle which palette is visible, updating button colors
	var palette = Number(name);
	var paletteButtonId = this.genPaletteButtonId(name);
	var paletteId = this.genPaletteId(name);
	var currentPaletteId = this.genPaletteId(this.current);
	var currentPaletteButtonId = this.genPaletteButtonId(this.current);

	docById(currentPaletteButtonId).style.backgroundColor = '#808080';
	docById(currentPaletteButtonId).style.color = '#ffffff';
	docById(paletteButtonId).style.backgroundColor = this.dict[name].backgroundColor;
	docById(paletteButtonId).style.color = this.dict[name].color;

	toggler(currentPaletteId);
	toggler(paletteId);
	this.current = name;
    }

    // Palettes live in the DOM for the time being:
    // a row of palette buttons and a row of block buttons for each palette
    this.updatePalettes = function() {
	var protoBlockCount = 0;
	// Modify the header id with palette info.
	var html = '';
	for (var name in this.dict) {
	    var text = '<button id="' + this.genPaletteButtonId(name) + '" ' +
		'onclick="return paletteButtonPush(\'' + name +
		'\');">' + name + '</button>';
	    html += text;
	}

	for (var name in this.dict) {
	    var myPalette = this.dict[name];
	    var text = '<div id="' + this.genPaletteId(name) + '">';
	    html += text;
	    for (var blk in myPalette.protoList) {
		protoBlockCount += myPalette.protoList[blk].size;
		// Special case for do block
		var blkname = myPalette.protoList[blk].name;
		if (blkname == '') {
		    console.log('FIXME: extra, empty blk in palette blocklist');
		    continue;
		}
		var arg = '__NOARG__';
		switch (blkname) {
		case 'do':
		    // Use the name of the action in the label
		    blkname = 'do ' + myPalette.protoList[blk].defaults[0];
		    // Call makeBlock with the name of the action
		    var arg = myPalette.protoList[blk].defaults[0];
		    break;
		case 'storein':
		    // Use the name of the box in the label
		    blkname = 'store in ' + myPalette.protoList[blk].defaults[0];
		    var arg = myPalette.protoList[blk].defaults[0];
		    break;
		case 'box':
		    // Use the name of the box in the label
		    blkname = myPalette.protoList[blk].defaults[0];
		    var arg = myPalette.protoList[blk].defaults[0];
		    break;
		}
		text = '<button id="' + 
		    this.genBlockButtonId(name, blk) + '"' +
		    ' class="' + name + '"' + 
		    // ' onclick="return blocks.makeBlock(\'' +
		    ' onclick="return paletteBlockButtonPush(\'' +
		    myPalette.protoList[blk].name + '\', \'' + arg + '\');">' +
		    blkname + '</button>';
		html += text;
	    }
	    text = '</div>';
	    html = html + text;
	}
	this.paletteElem.innerHTML = html;

	// Open the turtle palette to start
	this.toggle(this.current);
	// and hide all the others
	for (var name in this.dict) {
	    if (name != this.current) {
		toggler(this.genPaletteId(name));
	    }
	}
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

    this.makeMenu = function() {
	// Create the menu button
	if (this.menuBitmap == null) {
	    var image = new Image();
	    image.src = 'images/palettes/' + this.name + '.svg';
	    this.menuBitmap = new createjs.Bitmap(image);
	    this.palettes.container.addChild(this.menuBitmap);
	    var hitArea = new createjs.Shape();
	    hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -21, 200, 42);
	    hitArea.x = 100;
	    hitArea.y = 21;
	    this.menuBitmap.hitArea = hitArea;
	    this.menuBitmap.visible = false;
	    loadPaletteMenuHandler(this);
	}
	for (var blk in this.protoList) {
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
	    // FIXME: do something with mode name
	    if (!this.protoContainers[modname]) {
		// create graphics for the palette entry for this block
		this.protoContainers[modname] = new createjs.Container();
		this.protoContainers[modname].x = this.palettes.canvas.width / 2 + 100;  // FIXME
		this.protoContainers[modname].y = this.y;
		this.palettes.stage.addChild(this.protoContainers[modname]);

		// We use a filler for the menu background
		var height = 42 * Math.ceil(last(this.protoList[blk].docks)[1] / 42);
		// FIXME: autodetect somehow?
		if (['action', 'start'].indexOf(blkname) != -1) {
		    height += 84;
		} else if (['media'].indexOf(blkname) != -1) {
		    height += 42;
		}
		for (var h = 0; h < height; h += 42) {
		    var image = new Image();
		    image.src = 'images/palettes/palette-filler.svg';
		    var bitmap = new createjs.Bitmap(image);
		    this.protoContainers[modname].addChild(bitmap);
		    bitmap.y = h;
		}

		var image = new Image();
		if (blkname != modname || blkname == 'text' || blkname == 'number') {
		    image.src = 'images/' + blkname + '-palette.svg';
		} else {
		    image.src = 'images/' + blkname + '.svg';
		}
		var bitmap = new createjs.Bitmap(image);
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

		if (blkname != modname) {
		    var text = new createjs.Text(this.protoList[blk].defaults[0], '12px Courier', '#00000');
		    this.protoContainers[modname].addChild(text);
		    text.textAlign = 'center';
		    text.textBaseline = 'alphabetic';
		    text.x = 60;
		    text.y = 20;
		}

		if (this.protoList[blk].expandable) {
		    var yoff = Math.floor(this.protoList[blk].yoff * paletteScale); 

		    var image = new Image();
		    if (blkname == modname) {
			if (this.protoList[blk].style == 'arg') {
			    image.src = 'images/number-arg-bottom.svg';
			} else if (this.protoList[blk].style == 'special'){
			    image.src = 'images/' + blkname + '-bottom.svg';
			} else {
			    image.src = 'images/' + name + '-bottom.svg';
			}
		    } else {
			if (this.protoList[blk].style == 'special'){
			    image.src = 'images/' + blkname + '-bottom-palette.svg';
			} else {
			    image.src = 'images/' + name + '-bottom-palette.svg';
			}
		    }

		    var bitmap = new createjs.Bitmap(image);
		    this.protoContainers[modname].addChild(bitmap);
		    bitmap.scaleX = paletteScale;
		    bitmap.scaleY = paletteScale;
		    bitmap.scale = paletteScale;
		    bitmap.x = 20;
		    bitmap.y = yoff;

		    if (blkname != modname) {
			this.protoContainers[modname].addChild(text);
			if (blkname == 'storein') {
			    text.y = yoff + 15;
			}
		    }
		}
		this.protoContainers[modname].visible = false;
		this.y += Math.floor(height * paletteScale);
		loadPaletteMenuItemHandler(this, blk, modname, this);
	    }
	}
    }

    this.moveMenu = function(x, y) {
	this.menuBitmap.x = x;
	this.menuBitmap.y = y;
    }

    this.moveMenuRelative = function(dx, dy) {
	this.menuBitmap.x += dx;
	this.menuBitmap.y += dy;
    }

    this.hideMenu = function() {
	if (this.menuBitmap != null) {
	    this.menuBitmap.visible = false;
	    this.hideMenuItems();
	}
    }

    this.showMenu = function() {
	this.menuBitmap.visible = true;
    }

    this.hideMenuItems = function() {
	for (var i in this.protoContainers) {
	    this.protoContainers[i].visible = false;
	}
	this.visible = false;
    }

    this.showMenuItems = function() {
	for (var i in this.protoContainers) {
	    this.protoContainers[i].visible = true;
	}
	this.visible = true;
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

// Utility function for toggling visibilities of DOM elements.
function toggler(obj) {
    for ( var i=0; i < arguments.length; i++ ) {
	$(arguments[i]).style.display = ($(arguments[i]).style.display != 'none' ? 'none' : '');
    }
}

// Menu Item event handlers
function loadPaletteMenuItemHandler(self, blk, blkname, palette) {
    // On a click make a new block; then close the menu.
    // FIXME: add drag and add move (move them all)
    self.protoContainers[blkname].on('click', function(event) {
	console.log('CLICK');
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
	paletteBlockButtonPush(palette.protoList[blk].name, arg);
	palette.hideMenuItems();
	palette.palettes.refreshCanvas();
    });
}

// Palette Menu event handlers
function loadPaletteMenuHandler(palette) {
    palette.menuBitmap.on('mouseover', function(event) {
	// palette.highlight();
	// palette.palettes.refreshCanvas();
    });

    palette.menuBitmap.on('mouseout', function(event) {
	// palette.unhighlight();
	// palette.palettes.refreshCanvas();
    });
    
    palette.menuBitmap.on('click', function(event) {
	console.log('click on palette');
	for (p in palette.palettes.dict) {
	    palette.palettes.dict[p].hideMenuItems();
	}
	if (palette.visible) {
	} else {
	    palette.showMenuItems();
	}
	palette.palettes.refreshCanvas();
    });

    palette.menuBitmap.on('mousedown', function(event) {
	// FIXME: move them all
	return;
	var offset = {
	    x: palette.menuBitmap.x - event.stageX,
	    y: palette.menuBitmap.y - event.stageY
	};

	palette.menuBitmap.on('pressmove', function(event) {
	    moved = true;
	    var oldX = palette.menuBitmap.x;
	    var oldY = palette.menuBitmap.y;
	    palette.menuBitmap.x = event.stageX + offset.x;
	    palette.menuBitmap.y = event.stageY + offset.y;
	    palette.palettes.refreshCanvas();
	});
    });
}
