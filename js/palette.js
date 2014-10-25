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
function Palettes (stage, refreshCanvas) {
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;

    // The collection of palettes.
    this.dict = {};
    this.protoDict = {};

    this.visible = true;
    this.y = 42;

    // and a place in the DOM to put palettes.
    this.paletteElem = docById('header');
    this.current = 'turtle';

    // this.container = new createjs.Container();
    // this.stage.addChild(this.container);

    // var image = new Image();
    // image.src = 'images/palette-top.svg';
    // this.bitmapTop = new createjs.Bitmap(image);
    // this.container.addChild(this.bitmapTop);
    // var image = new Image();
    // image.src = 'images/palette-bottom.svg';
    // this.bitmapBottom = new createjs.Bitmap(image);
    // this.container.addChild(this.bitmapBottom);
    // this.bitmapBottom.y = 42;
    // this.bitmapFillers = [];

    // var hitArea = new createjs.Shape();
    // hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -42, 200, 84);
    // hitArea.x = 100;
    // hitArea.y = 42;
    // this.container.hitArea = hitArea;

    // loadPalettesHandlers(this);

    this.addFiller = function() {
	var image = new Image();
	image.src = 'images/palette-filler.svg';
	this.bitmapFillers.push(new createjs.Bitmap(image));
	this.container.addChild(last(this.bitmapFillers));
	last(this.bitmapFillers).y = this.bitmapBottom.y;
	this.bitmapBottom.y += 42;
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
	return '_' + this.dict[name].blockList[blk].name + '_block_button';
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
	    for (var blk in myPalette.blockList) {
		protoBlockCount += myPalette.blockList[blk].size;
		// Special case for do block
		var blkname = myPalette.blockList[blk].name;
		if (blkname == '') {
		    console.log('FIXME: extra, empty blk in palette blocklist');
		    continue;
		}
		var arg = '__NOARG__';
		switch (blkname) {
		case 'do':
		    // Use the name of the action in the label
		    blkname = 'do ' + myPalette.blockList[blk].defaults[0];
		    // Call makeBlock with the name of the action
		    var arg = myPalette.blockList[blk].defaults[0];
		    break;
		case 'storein':
		    // Use the name of the box in the label
		    blkname = 'store in ' + myPalette.blockList[blk].defaults[0];
		    var arg = myPalette.blockList[blk].defaults[0];
		    break;
		case 'box':
		    // Use the name of the box in the label
		    blkname = myPalette.blockList[blk].defaults[0];
		    var arg = myPalette.blockList[blk].defaults[0];
		    break;
		}
		text = '<button id="' + 
		    this.genBlockButtonId(name, blk) + '"' +
		    ' class="' + name + '"' + 
		    // ' onclick="return blocks.makeBlock(\'' +
		    ' onclick="return paletteBlockButtonPush(\'' +
		    myPalette.blockList[blk].name + '\', \'' + arg + '\');">' +
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

	return;
	// and the Easel version of the palette
	console.log(protoBlockCount);
	for (i = 0; i < protoBlockCount - this.bitmapFillers.length; i++) {
	    this.addFiller();
	}
	var height = 84 + 42 * this.bitmapFillers.length;
	var hitArea = new createjs.Shape();
	hitArea.graphics.beginFill('#FFF').drawEllipse(-100, -height / 2, 200, height);
	hitArea.x = 100;
	hitArea.y = height / 2;
	this.container.hitArea = hitArea;

	for (var name in this.dict) {
	    var myPalette = this.dict[name];
	    for (var blk in myPalette.blockList) {
		var blkname = myPalette.blockList[blk].name;
		if (!this.protoDict[blkname]) {
		    // create a graphic for the palette entry for this block
		    var image = new Image();
		    image.src = 'images/' + blkname + '.svg';
		    this.protoDict[blkname] = [];
		    this.protoDict[blkname].push(new createjs.Bitmap(image));
		    this.container.addChild(this.protoDict[blkname][0]);
		    this.protoDict[blkname][0].scaleX = paletteScale;
		    this.protoDict[blkname][0].scaleY = paletteScale;
		    this.protoDict[blkname][0].scale = paletteScale;
		    this.protoDict[blkname][0].x = 20;
		    this.protoDict[blkname][0].y = this.y;
		    var hitArea = new createjs.Shape();
		    hitArea.graphics.beginFill('#FFF').drawEllipse(-50, -21, 100, 42);
		    hitArea.x = 50;
		    hitArea.y = 21;
		    this.protoDict[blkname][0].hitArea = hitArea;
		    if (myPalette.blockList[blk].expandable) {
			this.y += Math.floor(myPalette.blockList[blk].yoff * paletteScale);
			var image = new Image();
			if (myPalette.blockList[blk].style == 'arg') {
			    image.src = 'images/number-arg-bottom.svg';
			} else if (myPalette.blockList[blk].style == 'special'){
			    image.src = 'images/' + blkname + '-bottom.svg';
			} else {
			    image.src = 'images/' + name + '-bottom.svg';
			}
			this.protoDict[blkname].push(new createjs.Bitmap(image));
			this.container.addChild(this.protoDict[blkname][1]);
			this.protoDict[blkname][1].scaleX = paletteScale;
			this.protoDict[blkname][1].scaleY = paletteScale;
			this.protoDict[blkname][1].scale = paletteScale;
			this.protoDict[blkname][1].x = 20;
			this.protoDict[blkname][1].y = this.y;
			var hitArea = new createjs.Shape();
			hitArea.graphics.beginFill('#FFF').drawEllipse(-50, -21, 100, 42);
			hitArea.x = 50;
			hitArea.y = 21;
			this.protoDict[blkname][1].hitArea = hitArea;
		    }
		    this.y += Math.floor(42 * paletteScale);
		    loadBlockHandler(this, blk, blkname, myPalette);
		}
	    }
	}
	this.refreshCanvas();
    }

    this.hide = function() {
	this.visible = false;
    }

    this.show = function() {
	this.visible = true;
    }

    this.setBlocks = function(blocks) {
	paletteBlocks = blocks;
    }

    this.add = function(name, color, bgcolor) {
	this.dict[name] = new Palette(name, color, bgcolor);
	return this;
    }

    return this;
}

// Define objects for individual palettes.
function Palette (name, color, bgcolor) {
    this.name = name;
    this.color = color;
    this.backgroundColor = bgcolor;
    this.blockList = [];

    this.getInfo = function() {
	var returnString = this.name + ' palette:';
	for (var thisBlock in this.blockList) {
	    returnString += ' ' + this.blockList[thisBlock].name;
	}
	return returnString;
    };

    this.add = function(protoblock) {
	this.blockList.push(protoblock);
	return this;
    }

    return this;

};

function initPalettes(stage, refreshCanvas) {
    // Instantiate the palettes object.
    var palettes = new Palettes(stage, refreshCanvas).
	add('turtle', 'black', '#00b700').
	add('pen', 'black', '#00c0e7').
	add('number', 'black', '#ff00ff').
	add('flow', 'black', '#fd6600').
	add('blocks', 'black', '#ffc000').
	add('sensors', 'white', '#ff0066').
	add('extras', 'white', '#ff0066');
    palettePalettes = palettes;
    return palettes;
}

// Utility function for toggling visibilities of DOM elements.
function toggler(obj) {
    for ( var i=0; i < arguments.length; i++ ) {
	$(arguments[i]).style.display = ($(arguments[i]).style.display != 'none' ? 'none' : '');
    }
}

// Block event handlers
function loadBlockHandler(self, blk, blkname, myPalette) {
    for (var i = 0; i < self.protoDict[blkname]; i++) {
	self.protoDict[blkname][i].on('click', function(event) {
	    console.log('CLICK');
	    var arg = '__NOARG__';
	    switch (blkname) {
	    case 'do':
		blkname = 'do ' + myPalette.blockList[blk].defaults[0];
		var arg = myPalette.blockList[blk].defaults[0];
		break;
	    case 'storein':
		// Use the name of the box in the label
		blkname = 'store in ' + myPalette.blockList[blk].defaults[0];
		var arg = myPalette.blockList[blk].defaults[0];
		break;
	    case 'box':
		// Use the name of the box in the label
		blkname = myPalette.blockList[blk].defaults[0];
		var arg = myPalette.blockList[blk].defaults[0];
		break;
	    }
	    paletteBlockButtonPush(myPalette.blockList[blk].name, arg);
	});
    }
}

// Palette event handlers
function loadPalettesHandlers(palettes) {
    palettes.container.on('mouseover', function(event) {
	// palettes.highlight();
	palettes.refreshCanvas();
    });

    palettes.container.on('mouseout', function(event) {
	// palettes.unhighlight();
	palettes.refreshCanvas();
    });
    
    //palettes.container.on('click', function(event) {
    // console.log('click on palette');
    // palettes.refreshCanvas();
    // });

    palettes.container.on('mousedown', function(event) {
	var offset = {
	    x: palettes.container.x - event.stageX,
	    y: palettes.container.y - event.stageY
	};

	palettes.container.on('pressmove', function(event) {
	    moved = true;
	    var oldX = palettes.container.x;
	    var oldY = palettes.container.y;
	    palettes.container.x = event.stageX + offset.x;
	    palettes.container.y = event.stageY + offset.y;
	    palettes.refreshCanvas();
	});
    });
}
