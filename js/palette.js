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

// All things related to palettes
function Palettes () {
    // The collection of palettes.
    this.paletteList = [];
    this.currentPalette = 0;  // Start with Turtle palette open.

    this.getInfo = function() {
	for (var palette = 0; palette < this.paletteList.length; palette++) {
	    console.log(this.paletteList[palette].getInfo());
	}
    }

    // Generate the IDs for the DOM elements we need
    this.getPaletteButtonId = function(palette) {
	return '_' + this.paletteList[palette].name + '_palette_button';
    }

    this.getPaletteId = function(palette) {
	return '_' + this.paletteList[palette].name + '_palette_div';
    }

    this.getBlockButtonId = function(palette, blk) {
	return '_' + this.paletteList[palette].blockList[blk].name + '_block_button';
    }

    this.toggle = function(name) {
	// Toggle which palette is visible, updating button colors
	var palette = Number(name);
	var paletteButtonId = this.getPaletteButtonId(palette);
	var paletteId = this.getPaletteId(palette);
	var currentPaletteId = this.getPaletteId(this.currentPalette);
	var currentPaletteButtonId = this.getPaletteButtonId(this.currentPalette);

	document.getElementById(currentPaletteButtonId).style.backgroundColor = '#808080';
	document.getElementById(currentPaletteButtonId).style.color = '#ffffff';
	document.getElementById(paletteButtonId).style.backgroundColor = this.paletteList[palette].backgroundColor;
	document.getElementById(paletteButtonId).style.color = this.paletteList[palette].color;

	toggler(currentPaletteId);
	toggler(paletteId);
	this.currentPalette = palette;
    }

    // Palettes live in the DOM for the time being:
    // a row of palette buttons and a row of block buttons for each palette
    this.updatePalettes = function() {
	// Modify the header id with palette info.
	var html = ''
	for (var palette = 0; palette < this.paletteList.length; palette++) {
	    var text = '<button id="' + this.getPaletteButtonId(palette) + '" ' +
		'onclick="return palettes.toggle(\'' + palette +
		'\');">' + this.paletteList[palette].name + '</button>';
	    html = html + text;
	}

	for (var palette = 0; palette < this.paletteList.length; palette++) {
	    var myPalette = this.paletteList[palette];
	    var text = '<div id="' + this.getPaletteId(palette) + '">';
	    html = html + text;
	    for (var blk = 0; blk < myPalette.blockList.length; blk++) {
		// Special case for do block
		var name = myPalette.blockList[blk].name;
		var arg = '__NOARG__';
		switch (name) {
		case 'do':
		    // Use the name of the action in the label
		    name = 'do ' + myPalette.blockList[blk].defaults[0];
		    // Call makeBlock with the name of the action
		    var arg = myPalette.blockList[blk].defaults[0];
		    break;
		case 'storein':
		    // Use the name of the box in the label
		    name = 'store in ' + myPalette.blockList[blk].defaults[0];
		    var arg = myPalette.blockList[blk].defaults[0];
		    break;
		case 'box':
		    // Use the name of the box in the label
		    name = myPalette.blockList[blk].defaults[0];
		    var arg = myPalette.blockList[blk].defaults[0];
		    break;
		}
		text = '<button id="' + 
		    this.getBlockButtonId(palette, blk) + '"' +
		    // ' class="' + myPalette.backgroundColor + '"' + 
		    ' class="' + myPalette.name + '"' + 
		    ' onclick="return makeBlock(\'' +
		    myPalette.blockList[blk].name + '\', \'' + arg + '\');">' +
		    name + '</button>';
		html = html + text;
	    }
	    text = '</div>';
	    html = html + text;
	}
	paletteElem.innerHTML = html;

	// Open the turtle palette to start
	this.toggle(this.currentPalette.toString());
	// and hide all the others
	for (var palette = 0; palette < this.paletteList.length; palette++) {
	    if (palette != this.currentPalette) {
		toggler(this.getPaletteId(palette));
	    }
	}
    }
}

// Define objects for individual palettes.
function Palette (name) {
    this.name = name;
    this.color = 'white';
    this.backgroundColor = 'green';
    this.blockList = [];

    this.getInfo = function() {
	var returnString = this.name + ' palette:';
	for (var i = 0; i < this.blockList.length; i++) {
	    returnString += ' ';
	    returnString += this.blockList[i].name;
	}
	return returnString;
    };
};

// Instantiate the palettes object.
var palettes = new Palettes();

// Add palettes here.
var turtlePalette = new Palette('turtle');
palettes.paletteList.push(turtlePalette);
turtlePalette.color = 'black';
turtlePalette.backgroundColor =  '#00b700';

var penPalette = new Palette('pen');
palettes.paletteList.push(penPalette);
penPalette.color = 'black';
penPalette.backgroundColor = '#00c0e7';

var numberPalette = new Palette('number');
palettes.paletteList.push(numberPalette);
numberPalette.color = 'black';
numberPalette.backgroundColor =  '#ff00ff';

var flowPalette = new Palette('flow');
palettes.paletteList.push(flowPalette);
flowPalette.color = 'black';
flowPalette.backgroundColor = '#fd6600';

var blocksPalette = new Palette('blocks');
palettes.paletteList.push(blocksPalette);
blocksPalette.color = 'black';
blocksPalette.backgroundColor = '#ffc000';

var sensorsPalette = new Palette('sensors');
palettes.paletteList.push(sensorsPalette);
sensorsPalette.color = 'white';
sensorsPalette.backgroundColor = '#ff0066';

// Utility function for toggling visibilities of DOM elements.
function toggler(obj) {
    for ( var i=0; i < arguments.length; i++ ) {
	$(arguments[i]).style.display = ($(arguments[i]).style.display != 'none' ? 'none' : '');
    }
}
