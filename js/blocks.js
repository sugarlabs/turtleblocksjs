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

// All things related to blocks and palettes

// Define block proto objects
function ProtoBlock (name) {
    this.name = name;  // used for svg filename, run switch, and palette label
    this.palette = null;
    this.style = null;
    this.expandable = false;
    this.yoff = 0;
    this.loff = 0;
    this.args = 0;
    this.defaults = [];
    this.size = 1;
    this.docks = [];

    // helper methods for finding block graphics components
    this.getSvgPath = function() {
	return 'images/' + this.name + '.svg';
    }
    this.getFillerSvgPath = function() {
	return 'images/' + this.palette.name + '-filler.svg';
    }
    this.getBottomSvgPath = function() {
	return 'images/' + this.palette.name + '-bottom.svg';
    }
    this.getArgFillerSvgPath = function() {
	return 'images/' + this.palette.name + '-arg-filler.svg';
    }
    this.getArgBottomSvgPath = function() {
	return 'images/' + this.palette.name + '-arg-bottom.svg';
    }
    this.getSpecialFillerSvgPath = function() {
	return 'images/' + this.name + '-filler.svg';
    }
    this.getSpecialBottomSvgPath = function() {
	return 'images/' + this.name + '-bottom.svg';
    }
    this.getHighlightSvgPath = function() {
	return 'images/highlights/' + this.name + '.svg';
    }
    this.getHighlightFillerSvgPath = function() {
	return 'images/highlights/' + this.palette.name + '-filler.svg';
    }
    this.getHighlightBottomSvgPath = function() {
	return 'images/highlights/' + this.palette.name + '-bottom.svg';
    }
    this.getHighlightArgFillerSvgPath = function() {
	return 'images/highlights/' + this.palette.name + '-arg-filler.svg';
    }
    this.getHighlightArgBottomSvgPath = function() {
	return 'images/highlights/' + this.palette.name + '-arg-bottom.svg';
    }
    this.getHighlightSpecialFillerSvgPath = function() {
	return 'images/highlights/' + this.name + '-filler.svg';
    }
    this.getHighlightSpecialBottomSvgPath = function() {
	return 'images/highlights/' + this.name + '-bottom.svg';
    }

    // Inits for different block styles.
    this.zeroArgBlock = function() {
	this.docks = [[20, 0, 'out'], [20, 42, 'in']];
    }

    this.oneArgBlock = function() {
	this.args = 1;
	this.docks = [[20, 0, 'out'], [98, 20, 'numberin'], [20, 42, 'in']];
    }

    this.twoArgBlock = function() {
	this.yoff = 49;
	this.loff = 42;
	this.expandable = true;
	this.style = 'special';
	this.size = 2;
	this.args = 2;
    }

    this.twoArgMathBlock = function() {
	this.twoArgBlock();
	this.style = 'arg';
	this.docks = [[0, 20, 'numberout'], [68, 20, 'numberin'], [68, 62, 'numberin']];
    }

    this.booleanBlock = function() {
	this.style = 'arg';
	this.size = 2;
	this.args = 2;
	this.docks = [[0, 40, 'booleanout'], [86, 20, 'numberin'], [86, 62, 'numberin']];
    }

    this.parameterBlock = function() {
	this.style = 'arg';
	this.docks = [[0, 20, 'numberout']];
    }
}

// Instantiate the proto blocks
var protoBlockList = []

// Turtle palette
var clearBlock = new ProtoBlock('clear');
clearBlock.palette = turtlePalette;
protoBlockList.push(clearBlock);
clearBlock.zeroArgBlock();

var forwardBlock = new ProtoBlock('forward');
forwardBlock.palette = turtlePalette;
protoBlockList.push(forwardBlock);
forwardBlock.oneArgBlock();
forwardBlock.defaults.push(100);

var rightBlock = new ProtoBlock('right');
rightBlock.palette = turtlePalette;
protoBlockList.push(rightBlock);
rightBlock.oneArgBlock();
rightBlock.defaults.push(90);

var backBlock = new ProtoBlock('back');
backBlock.palette = turtlePalette;
protoBlockList.push(backBlock);
backBlock.oneArgBlock();
backBlock.defaults.push(100);

var leftBlock = new ProtoBlock('left');
leftBlock.palette = turtlePalette;
protoBlockList.push(leftBlock);
leftBlock.oneArgBlock();
leftBlock.defaults.push(90);

var arcBlock = new ProtoBlock('arc');
arcBlock.palette = turtlePalette;
protoBlockList.push(arcBlock);
arcBlock.twoArgBlock();
arcBlock.defaults.push(90);
arcBlock.defaults.push(100);
arcBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'],
		  [98, 62, 'numberin'], [20, 84, 'in']];

var setheadingBlock = new ProtoBlock('setheading');
setheadingBlock.palette = turtlePalette;
protoBlockList.push(setheadingBlock);
setheadingBlock.oneArgBlock();
setheadingBlock.defaults.push(0);

var headingBlock = new ProtoBlock('heading');
headingBlock.palette = turtlePalette;
protoBlockList.push(headingBlock);
headingBlock.style = 'arg';
headingBlock.docks = [[0, 20, 'numberout']];

var setxyBlock = new ProtoBlock('setxy');
setxyBlock.palette = turtlePalette;
protoBlockList.push(setxyBlock);
setxyBlock.twoArgBlock();
setxyBlock.defaults.push(0);
setxyBlock.defaults.push(0);
setxyBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'],
		    [98, 62, 'numberin'], [20, 84, 'in']];

var xBlock = new ProtoBlock('x');
xBlock.palette = turtlePalette;
protoBlockList.push(xBlock);
xBlock.parameterBlock();

var yBlock = new ProtoBlock('y');
yBlock.palette = turtlePalette;
protoBlockList.push(yBlock);
yBlock.parameterBlock();

var showBlock = new ProtoBlock('show');
showBlock.palette = turtlePalette;
protoBlockList.push(showBlock);
showBlock.twoArgBlock();
showBlock.defaults.push(24);
showBlock.defaults.push('text');
showBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'],
		   [98, 62, 'textin'], [20, 84, 'in']];

var imageBlock = new ProtoBlock('image');
imageBlock.palette = turtlePalette;
protoBlockList.push(imageBlock);
imageBlock.twoArgBlock();
imageBlock.defaults.push(100);
imageBlock.defaults.push(null);
imageBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'],
		    [98, 62, 'textin'], [20, 84, 'in']];

var shellBlock = new ProtoBlock('turtleshell');
shellBlock.palette = turtlePalette;
protoBlockList.push(shellBlock);
shellBlock.twoArgBlock();
shellBlock.defaults.push(55);
shellBlock.defaults.push(null);
shellBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'],
		    [98, 62, 'textin'], [20, 84, 'in']];

// Pen palette
var setcolorBlock = new ProtoBlock('setcolor');
setcolorBlock.palette = penPalette;
protoBlockList.push(setcolorBlock);
setcolorBlock.oneArgBlock();
setcolorBlock.defaults.push(0);

var colorBlock = new ProtoBlock('color');
colorBlock.palette = penPalette;
protoBlockList.push(colorBlock);
colorBlock.parameterBlock();

var setshadeBlock = new ProtoBlock('setshade');
setshadeBlock.palette = penPalette;
protoBlockList.push(setshadeBlock);
setshadeBlock.oneArgBlock();
setshadeBlock.defaults.push(50);

var shadeBlock = new ProtoBlock('shade');
shadeBlock.palette = penPalette;
protoBlockList.push(shadeBlock);
shadeBlock.parameterBlock();

var setchromaBlock = new ProtoBlock('setgrey');
setchromaBlock.palette = penPalette;
protoBlockList.push(setchromaBlock);
setchromaBlock.oneArgBlock();
setchromaBlock.defaults.push(100);

var chromaBlock = new ProtoBlock('grey');
chromaBlock.palette = penPalette;
protoBlockList.push(chromaBlock);
chromaBlock.parameterBlock();

var setpensizeBlock = new ProtoBlock('setpensize');
setpensizeBlock.palette = penPalette;
protoBlockList.push(setpensizeBlock);
setpensizeBlock.oneArgBlock();
setpensizeBlock.defaults.push(5);

var pensizeBlock = new ProtoBlock('pensize');
pensizeBlock.palette = penPalette;
protoBlockList.push(pensizeBlock);
pensizeBlock.parameterBlock();

var penupBlock = new ProtoBlock('penup');
penupBlock.palette = penPalette;
protoBlockList.push(penupBlock);
penupBlock.zeroArgBlock();

var pendownBlock = new ProtoBlock('pendown');
pendownBlock.palette = penPalette;
protoBlockList.push(pendownBlock);
pendownBlock.zeroArgBlock();

var startfillBlock = new ProtoBlock('beginfill');
startfillBlock.palette = penPalette;
protoBlockList.push(startfillBlock);
startfillBlock.zeroArgBlock();

var endfillBlock = new ProtoBlock('endfill');
endfillBlock.palette = penPalette;
protoBlockList.push(endfillBlock);
endfillBlock.zeroArgBlock();

var backgroundBlock = new ProtoBlock('fillscreen');
backgroundBlock.palette = penPalette;
protoBlockList.push(backgroundBlock);
backgroundBlock.zeroArgBlock();

// Numbers palette
var numberBlock = new ProtoBlock('number');
numberBlock.palette = numberPalette;
protoBlockList.push(numberBlock);
numberBlock.style = 'value';
numberBlock.docks = [[0, 20, 'numberout']];

var randomBlock = new ProtoBlock('random');
randomBlock.palette = numberPalette;
protoBlockList.push(randomBlock);
randomBlock.twoArgMathBlock();
randomBlock.defaults.push(0);
randomBlock.defaults.push(100);

var plusBlock = new ProtoBlock('plus');
plusBlock.palette = numberPalette;
protoBlockList.push(plusBlock);
plusBlock.twoArgMathBlock();

var minusBlock = new ProtoBlock('minus');
minusBlock.palette = numberPalette;
protoBlockList.push(minusBlock);
minusBlock.twoArgMathBlock();

var multiplyBlock = new ProtoBlock('multiply');
multiplyBlock.palette = numberPalette;
protoBlockList.push(multiplyBlock);
multiplyBlock.twoArgMathBlock();

var divideBlock = new ProtoBlock('divide');
divideBlock.palette = numberPalette;
protoBlockList.push(divideBlock);
divideBlock.twoArgMathBlock();

var sqrtBlock = new ProtoBlock('sqrt');
sqrtBlock.palette = numberPalette;
protoBlockList.push(sqrtBlock);
sqrtBlock.args = 1;
sqrtBlock.style = 'arg';
sqrtBlock.docks = [[0, 20, 'numberout'], [68, 20, 'numberin']];

var modBlock = new ProtoBlock('mod');
modBlock.palette = numberPalette;
protoBlockList.push(modBlock);
modBlock.twoArgMathBlock();

var greaterBlock = new ProtoBlock('greater');
greaterBlock.palette = numberPalette;
protoBlockList.push(greaterBlock);
greaterBlock.booleanBlock();

var lessBlock = new ProtoBlock('less');
lessBlock.palette = numberPalette;
protoBlockList.push(lessBlock);
lessBlock.booleanBlock();

var equalBlock = new ProtoBlock('equal');
equalBlock.palette = numberPalette;
protoBlockList.push(equalBlock);
equalBlock.booleanBlock();

// Blocks palette
var mediaBlock = new ProtoBlock('media');
mediaBlock.palette = blocksPalette;
protoBlockList.push(mediaBlock);
mediaBlock.style = 'value';
mediaBlock.docks = [[0, 20, 'mediaout']];

var textBlock = new ProtoBlock('text');
textBlock.palette = blocksPalette;
protoBlockList.push(textBlock);
textBlock.style = 'value';
textBlock.docks = [[0, 20, 'textout']];

var storeinBlock = new ProtoBlock('storein');
storeinBlock.palette = blocksPalette;
storeinBlock.twoArgBlock();
storeinBlock.docks = [[20, 0, 'out'], [98, 20, 'textin'],
			[98, 62, 'numberin'], [20, 84, 'in']];

function newStoreinBlock(name) {
    var myStoreinBlock = new ProtoBlock('storein');
    protoBlockList.push(myStoreinBlock);
    myStoreinBlock.palette = blocksPalette;
    myStoreinBlock.twoArgBlock();
    myStoreinBlock.defaults.push(name);
    myStoreinBlock.defaults.push(100);
    myStoreinBlock.docks = [[20, 0, 'out'], [98, 20, 'textin'],
			  [98, 62, 'numberin'], [20, 84, 'in']];
}

newStoreinBlock('box');

var boxBlock = new ProtoBlock('box');
boxBlock.palette = blocksPalette;
boxBlock.args = 1;
boxBlock.style = 'arg';
boxBlock.docks = [[0, 20, 'numberout'], [68, 20, 'textin']];

function newBoxBlock(name) {
    var myBoxBlock = new ProtoBlock('box');
    protoBlockList.push(myBoxBlock);
    myBoxBlock.palette = blocksPalette;
    myBoxBlock.args = 1;
    myBoxBlock.defaults.push(name);
    myBoxBlock.style = 'arg';
    myBoxBlock.docks = [[0, 20, 'numberout'], [68, 20, 'textin']];
}

newBoxBlock('box');

var actionBlock = new ProtoBlock('action');
actionBlock.palette = blocksPalette;
actionBlock.yoff = 86;
actionBlock.loff = 42;
actionBlock.args = 1;
actionBlock.expandable = true;
actionBlock.defaults.push('action');
actionBlock.style = 'clamp';
actionBlock.docks = [[20, 0, 'unavailable'], [98, 34, 'textin'],
		     [38, 55, 'in'], [20, 80, 'unavailable']];

function newActionBlock(name) {
    var myActionBlock = new ProtoBlock('action');
    protoBlockList.push(myActionBlock);
    myActionBlock.palette = blocksPalette;
    myActionBlock.yoff = 86;
    myActionBlock.loff = 42;
    myActionBlock.args = 1;
    myActionBlock.defaults.push(name);
    myActionBlock.expandable = true;
    myActionBlock.style = 'clamp';
    myActionBlock.docks = [[20, 0, 'unavailable'], [98, 34, 'textin'],
			 [38, 55, 'in'], [20, 80, 'unavailable']];
}

newActionBlock('action');

var doBlock = new ProtoBlock('do');
doBlock.palette = blocksPalette;
doBlock.args = 1;
doBlock.docks = [[20, 0, 'out'], [98, 20, 'textin'], [20, 42, 'in']];

function newDoBlock(name) {
    var myDoBlock = new ProtoBlock('do');
    protoBlockList.push(myDoBlock);
    myDoBlock.palette = blocksPalette;
    myDoBlock.args = 1;
    myDoBlock.defaults.push(name);
    myDoBlock.docks = [[20, 0, 'out'], [98, 20, 'textin'], [20, 42, 'in']];
}

newDoBlock('action');

var startBlock = new ProtoBlock('start');
startBlock.palette = blocksPalette;
protoBlockList.push(startBlock);
startBlock.yoff = 86;
startBlock.loff = 42;
startBlock.args = 1;
startBlock.expandable = true;
startBlock.style = 'clamp';
startBlock.docks = [[20, 0, 'unavailable'], [38, 55, 'in'],
		    [20, 80, 'unavailable']];

// Flow palette
var repeatBlock = new ProtoBlock('repeat');
repeatBlock.palette = flowPalette;
protoBlockList.push(repeatBlock);
repeatBlock.yoff = 74;
repeatBlock.loff = 42;
repeatBlock.expandable = true;
repeatBlock.style = 'clamp';
repeatBlock.size = 2;
repeatBlock.args = 2;
repeatBlock.defaults.push(4);
repeatBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'], [38, 42, 'in'],
		     [20, 126, 'in']];

var ifBlock = new ProtoBlock('if');
ifBlock.palette = flowPalette;
protoBlockList.push(ifBlock);
ifBlock.yoff = 116;
ifBlock.loff = 42;
ifBlock.expandable = true;
ifBlock.style = 'clamp';
ifBlock.size = 3;
ifBlock.args = 2;
ifBlock.docks = [[20, 0, 'out'], [56, 40, 'booleanin'], [38, 84, 'in'],
 		 [20, 168, 'in']];

var vspaceBlock = new ProtoBlock('vspace');
vspaceBlock.palette = flowPalette;
protoBlockList.push(vspaceBlock);
vspaceBlock.zeroArgBlock();

// Sensors palette
var timeBlock = new ProtoBlock('time');
timeBlock.palette = sensorsPalette;
protoBlockList.push(timeBlock);
timeBlock.parameterBlock();

var mousexBlock = new ProtoBlock('mousex');
mousexBlock.palette = sensorsPalette;
protoBlockList.push(mousexBlock);
mousexBlock.parameterBlock();

var mouseyBlock = new ProtoBlock('mousey');
mouseyBlock.palette = sensorsPalette;
protoBlockList.push(mouseyBlock);
mouseyBlock.parameterBlock();

// Push protoblocks onto their palettes.
for (var i = 0; i < protoBlockList.length; i++) {
    protoBlockList[i].palette.blockList.push(protoBlockList[i]);
}

// Define block instance objects
function Block (protoblock) {
    this.protoblock = protoblock;
    this.name = protoblock.name;
    this.label = null;  // editable textview in DOM
    this.text = null;  // text label on block itself
    this.value = null;
    this.image = null;
    this.highlightImage = null;
    this.bitmap = null;
    this.highlightBitmap = null;
    this.x = 0;
    this.y = 0;
    this.trash = false;  // is this block in the trash?
    this.fillerBitmaps = [];  // Expandable block feature
    this.bottomBitmap = null;  // Expandable block feature
    this.highlightFillerBitmaps = [];  // Expandable block feature
    this.highlightBottomBitmap = null;  // Expandable block feature
    this.size = 1;  // Proto size is copied here.
    this.docks = [];  // Proto dock is copied here.
    this.connections = [];
}

Block.prototype.copySize = function() {
    this.size = 0 + this.protoblock.size;
}

Block.prototype.copyDocks = function() {
    for (var i = 0; i < this.protoblock.docks.length; i++) {
	var dock = [this.protoblock.docks[i][0], this.protoblock.docks[i][1], this.protoblock.docks[i][2]];
	this.docks.push(dock);
    }
}

Block.prototype.getInfo = function() {
    return this.name + ' block';
}

// Some functions we need from activity.js
var updater = null;
var adjuster = null;

// A place to keep the blocks we create...
var blockList = [];

// We need to keep track of certain classes of blocks that exhibit
// different types of behavior:

var expandableBlocks = [];  // Blocks with parts that expand
var clampBlocks = [];  // Blocks that contain other blocks
var argBlocks = [];  // Blocks that are used as arguments to other blocks
var valueBlocks = [];  // Blocks that return values
var specialBlocks = [];  // Blocks with special parts
for (i = 0; i < protoBlockList.length; i++) {
    if (protoBlockList[i].expandable) {
	expandableBlocks.push(protoBlockList[i].name);
    }
    if (protoBlockList[i].style == 'clamp') {
	clampBlocks.push(protoBlockList[i].name);
    }
    if (protoBlockList[i].style == 'special') {
	specialBlocks.push(protoBlockList[i].name);
    }
    if (protoBlockList[i].style == 'arg') {
	argBlocks.push(protoBlockList[i].name);
    }
    if (protoBlockList[i].style == 'value') {
	argBlocks.push(protoBlockList[i].name);
	valueBlocks.push(protoBlockList[i].name);
    }
}

// Blocks that cannot be run on their own
var noRunBlocks = ['action'];

// and a place in the DOM to put them.
var labelElem = document.getElementById('labelDiv');

// and a place in the DOM to put palettes.
var paletteElem = document.getElementById('header');

function $() {
    var elements = new Array();

    for (var i = 0; i < arguments.length; i++) {
	var element = arguments[i];
	if (typeof element == 'string')
	    element = document.getElementById(element);
	if (arguments.length == 1)
	    return element;
	elements.push(element);
    }
    return elements;
}


function getBlockId(blk) {
    return '_' + blk.toString();
}

function makeBlock(name, arg) {
    // Make a new block from a proto block.
    console.log('makeBlock ' + name);

    for (var proto=0; proto < protoBlockList.length; proto++) {
	if (protoBlockList[proto].name == name) {
	    if (arg == '__NOARG__') {
		blockmaker(protoBlockList[proto]);
		// blockList.push(new Block(protoBlockList[proto]));
		break;
	    } else {
		if (protoBlockList[proto].defaults[0] == arg) {
		    blockmaker(protoBlockList[proto]);
		    // blockList.push(new Block(protoBlockList[proto]));
		    break;
		}
	    }
	}
    }
    // Each start block gets its own turtle.
    if (name == 'start') {
	addturtle();
    }

    var blk = blockList.length - 1;
    var myBlock = blockList[blk];
    for (var i = 0; i < myBlock.docks.length; i++) {
	myBlock.connections.push(null);
    }

    // Attach default args if any
    var cblk = blk + 1;
    for (var i = 0; i < myBlock.protoblock.defaults.length; i++) {
	var value = myBlock.protoblock.defaults[i];
	if (myBlock.docks[i + 1][2] == 'textin') {
	    blockmaker(textBlock);
	    // blockList.push(new Block(textBlock));
	    console.log('text block ' + value);
	    blockList.last().value = value;
	    updatetext(blockList.length - 1);
	} else if (myBlock.docks[i + 1][2] == 'mediain') {
	    blockmaker(mediaBlock);
	    // blockList.push(new Block(textBlock));
	    blockList.last().value = value;
	} else {
	    blockmaker(numberBlock);
	    // blockList.push(new Block(numberBlock));
	    console.log('number block ' + value);
	    blockList.last().value = value;
	    blockList.last().text.text = value.toString();
	}
	var myConnectionBlock = blockList[cblk + i];
	// myConnectionBlock.copyDocks();
	// myConnectionBlock.copySize();
	// newcontainer(myConnectionBlock);
	myConnectionBlock.connections = [blk];
	if (myBlock.name == 'action') {
	    // Make sure we don't make two actions with the same name.
	    value = findUniqueActionName('action');
	    if (value != 'action') {
		newDoBlock(value);
		updatePalettes();
	    }
	}
	myConnectionBlock.value = value;
	myBlock.connections[i + 1] = cblk + i;
    }

    // Generate and position the block bitmaps and labels
    updater();
    adjuster(blk, true);
    refresher();
}

function findUniqueActionName(name) {
    // Make sure we don't make two actions with the same name.
    var actionNames = [];
    for (var blk = 0; blk < blockList.length; blk++) {
	if (blockList[blk].name == 'text') {
	    var c = blockList[blk].connections[0];
	    if (c != null && blockList[c].name == 'action') {
		actionNames.push(blockList[blk].value);
	    }
	}
    }
    var i = 1;
    var value = name;
    while (actionNames.indexOf(value) != -1) {
	value = name + i.toString();
	i += 1;
    }
    return value;
}

// Utility functions
function isValueBlock(blk) {
    if (blk == null) {
	return false;
    }
    if (valueBlocks.indexOf(blockList[blk].name) != -1) {
	return true;
    } else {
	return false;
    }
}

function isArgBlock(blk) {
    if (blk == null) {
	return false;
    }
    if (argBlocks.indexOf(blockList[blk].name) != -1) {
	return true;
    } else {
	return false;
    }
}

function isSpecialBlock(blk) {
    if (blk == null) {
	return false;
    }
    if (specialBlocks.indexOf(blockList[blk].name) != -1) {
	return true;
    } else {
	return false;
    }
}

function isClampBlock(blk) {
    if (blk == null) {
	return false;
    }
    if (clampBlocks.indexOf(blockList[blk].name) != -1) {
	return true;
    } else {
	return false;
    }
}

function isNoRunBlock(blk) {
    if (blk == null) {
	return false;
    }
    if (noRunBlocks.indexOf(blockList[blk].name) != -1) {
	return true;
    } else {
	return false;
    }
}

function isExpandableBlock(blk) {
    if (blk == null) {
	return false;
    }
    if (expandableBlocks.indexOf(blockList[blk].name) != -1) {
	return true;
    } else {
	return false;
    }
}

function labelClicked(block) {
    console.log('clicked on ' + block.name);
}

function labelChanged() {
    // Update the block values as they change in the DOM label

    // For some reason, arg passing from the DOM is not working
    // properly, so we need to find the label that changed.
    var myBlock = null;
    var oldValue = '';
    var newValue = '';
    for (var blk = 0 ; blk < blockList.length ; blk++) {
	if (blockList[blk].name == 'text') {
	    if (blockList[blk].value != blockList[blk].label.value) {
		myBlock = blockList[blk];
		oldValue = myBlock.value;
		newValue = myBlock.label.value;
		break;
	    }
	}
	if (blockList[blk].name == 'number') {
	    if (blockList[blk].value != blockList[blk].label.value) {
		myBlock = blockList[blk];
		oldValue = myBlock.value;
		newValue = myBlock.label.value;
		break;
	    }
	}
    }

    if (myBlock == null) {
	console.log('cannot find the label that changed');
	return;
    }

    // Update the block value and label.
    if (myBlock.label != null) {
	myBlock.value = myBlock.label.value;
	myBlock.text.text = myBlock.value.toString();
	// and hide the DOM textview...
	myBlock.label.style.display = 'none';
	// Make sure text is on top.
	lastChild = myBlock.myContainer.children.last();
	myBlock.myContainer.swapChildren(myBlock.text, lastChild);
	refresher();
    }

    // TODO: Garbage collection in palette (remove old proto block)
    // TODO: Don't allow duplicate action names
    var c = myBlock.connections[0];
    if (myBlock.name == 'text' && c != null) {
	var cblock = blockList[c];
	switch (cblock.name) {
	case 'action':
	    // If the label was the name of an action, update the
	    // associated run blocks and the palette buttons
	    if (myBlock.value != 'action') {
		newDoBlock(myBlock.value);
	    }
	    renameDos(oldValue, newValue);
	    updatePalettes();
	    break;
	case 'storein':
	    // If the label was the name of a storein, update the
	    //associated box blocks and the palette buttons
	    if (myBlock.value != 'box') {
		newStoreinBlock(myBlock.value);
		newBoxBlock(myBlock.value);
	    }
	    renameBoxes(oldValue, newValue);
	    updatePalettes();
	    break;
	}
    }
}

function renameBoxes(oldName, newName) {
    for (blk = 0; blk < blockList.length; blk++) {
	if (blockList[blk].name == 'text') {
	    var c = blockList[blk].connections[0];
	    if (c != null && blockList[c].name == 'box') {
		if (blockList[blk].value == oldName) {
		    blockList[blk].value = newName;
		    blockList[blk].label.value = newName;
		}
	    }
	}
    }
}

function renameDos(oldName, newName) {
    for (blk = 0; blk < blockList.length; blk++) {
	if (blockList[blk].name == 'text') {
	    var c = blockList[blk].connections[0];
	    if (c != null && blockList[c].name == 'do') {
		if (blockList[blk].value == oldName) {
		    blockList[blk].value = newName;
		    blockList[blk].label.value = newName;
		}
	    }
	}
    }
}
