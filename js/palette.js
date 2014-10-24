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

function paletteButtonPush(name) {
    palettePalettes.toggle(name);
}

function paletteBlockButtonPush(name, arg) {
    paletteBlocks.makeBlock(name, arg);
}

// All things related to palettes
function Palettes () {
    // The collection of palettes.
    this.dict = {};
    // and a place in the DOM to put palettes.
    this.paletteElem = docById('header');
    this.current = 'turtle';

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

function initPalettes() {
    // Instantiate the palettes object.
    var palettes = new Palettes().
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
