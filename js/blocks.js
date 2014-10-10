// Define palette objects
function Palette (name) {
    this.name = name;
    this.color = "green";
    this.blockList = [];
};

Palette.prototype.getInfo = function() {
    return this.color + ' ' + this.name + ' palette: ' + this.blockList;
};

// Instantiate the palettes
var paletteList = [];

var turtlePalette = new Palette('turtle');
paletteList.push(turtlePalette);
turtlePalette.color = "green";

var numberPalette = new Palette('number');
paletteList.push(numberPalette);
numberPalette.color = "purple";

var flowPalette = new Palette('flow');
paletteList.push(flowPalette);
flowPalette.color = "orange";

var blocksPalette = new Palette('blocks');
paletteList.push(blocksPalette);
blocksPalette.color = "yellow";

// Define block proto objects
function ProtoBlock (name) {
    this.name = name;
    this.palette = null;
    this.style = null;
    this.expandable = false;
    this.args = 0;
    this.size = 1;
    this.docks = [];
}

ProtoBlock.prototype.getInfo = function() {
    return this.color + ' ' + this.name + ' block';
}

ProtoBlock.prototype.getSvgPath = function() {
    return 'images/' + this.name + '.svg';
}

ProtoBlock.prototype.getFillerSvgPath = function() {
    return 'images/' + this.palette.name + '-filler.svg';
}

ProtoBlock.prototype.getFillerLargeSvgPath = function() {
    return 'images/' + this.palette.name + '-filler-large.svg';
}

ProtoBlock.prototype.getBottomSvgPath = function() {
    return 'images/' + this.palette.name + '-bottom.svg';
}

ProtoBlock.prototype.getArgFillerSvgPath = function() {
    return 'images/' + this.palette.name + '-arg-filler.svg';
}

ProtoBlock.prototype.getArgFillerLargeSvgPath = function() {
    return 'images/' + this.palette.name + '-arg-filler-large.svg';
}

ProtoBlock.prototype.getArgBottomSvgPath = function() {
    return 'images/' + this.palette.name + '-arg-bottom.svg';
}

ProtoBlock.prototype.getSpecialFillerSvgPath = function() {
    return 'images/' + this.name + '-filler.svg';
}

ProtoBlock.prototype.getSpecialFillerLargeSvgPath = function() {
    return 'images/' + this.name + '-filler-large.svg';
}

ProtoBlock.prototype.getSpecialBottomSvgPath = function() {
    return 'images/' + this.name + '-bottom.svg';
}

// Instantiate the proto blocks
var protoBlockList = []

var clearBlock = new ProtoBlock('clear');
protoBlockList.push(clearBlock);
clearBlock.palette = turtlePalette;
clearBlock.docks = [[20, 0, 'out'], [20, 42, 'in']];

var forwardBlock = new ProtoBlock('forward');
protoBlockList.push(forwardBlock);
forwardBlock.palette = turtlePalette;
forwardBlock.args = 1;
forwardBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'], [20, 42, 'in']];

var rightBlock = new ProtoBlock('right');
protoBlockList.push(rightBlock);
rightBlock.palette = turtlePalette;
rightBlock.args = 1;
rightBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'], [20, 42, 'in']];

var backBlock = new ProtoBlock('back');
protoBlockList.push(backBlock);
backBlock.palette = turtlePalette;
backBlock.args = 1;
backBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'], [20, 42, 'in']];

var leftBlock = new ProtoBlock('left');
protoBlockList.push(leftBlock);
leftBlock.palette = turtlePalette;
leftBlock.args = 1;
leftBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'], [20, 42, 'in']];

var numberBlock = new ProtoBlock('number');
protoBlockList.push(numberBlock);
numberBlock.palette = numberPalette;
numberBlock.style = "value";
numberBlock.docks = [[0, 20, 'numberout']];

var textBlock = new ProtoBlock('text');
protoBlockList.push(textBlock);
textBlock.palette = blocksPalette;
textBlock.style = "value";
textBlock.docks = [[0, 20, 'textout']];

var boxBlock = new ProtoBlock('box');
protoBlockList.push(boxBlock);
boxBlock.palette = blocksPalette;
boxBlock.args = 1;
boxBlock.style = "arg";
boxBlock.docks = [[0, 20, 'numberout'], [68, 20, 'textin']];

var plusBlock = new ProtoBlock('plus');
protoBlockList.push(plusBlock);
plusBlock.palette = numberPalette;
plusBlock.yoff = 32;
plusBlock.foff = 17;
plusBlock.loff = 42;
plusBlock.expandable = true;
plusBlock.style = "arg";
plusBlock.size = 2;
plusBlock.args = 2;
plusBlock.docks = [[0, 20, 'numberout'], [68, 20, 'numberin'],
		   [68, 62, 'numberin']];

var storeinBlock = new ProtoBlock('storein');
protoBlockList.push(storeinBlock);
storeinBlock.palette = blocksPalette;
storeinBlock.yoff = 32;
storeinBlock.foff = 17;
storeinBlock.loff = 42;
storeinBlock.expandable = true;
storeinBlock.style = "special";
storeinBlock.size = 2;
storeinBlock.args = 2;
storeinBlock.docks = [[20, 0, 'out'], [98, 20, 'textin'],
		      [98, 62, 'numberin'], [20, 84, 'in']];

var repeatBlock = new ProtoBlock('repeat');
protoBlockList.push(repeatBlock);
repeatBlock.palette = flowPalette;
repeatBlock.yoff = 52;
repeatBlock.foff = 22;
repeatBlock.loff = 42;
repeatBlock.expandable = true;
repeatBlock.style = "clamp";
repeatBlock.size = 3;  // One empty slot by default
repeatBlock.args = 2;
repeatBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'], [38, 42, 'in'],
		     [20, 126, 'in']];

var startBlock = new ProtoBlock('start');
protoBlockList.push(startBlock);
startBlock.palette = blocksPalette;
startBlock.yoff = 64;
startBlock.foff = 22;
startBlock.loff = 42;
startBlock.args = 1;
startBlock.expandable = true;
startBlock.style = "clamp";
startBlock.docks = [[20, 0, 'unavailable'], [38, 55, 'in'],
		    [20, 80, 'unavailable']];

var runBlock = new ProtoBlock('run');
protoBlockList.push(runBlock);
runBlock.palette = blocksPalette;
runBlock.args = 1;
runBlock.docks = [[20, 0, 'out'], [98, 20, 'textin'], [20, 42, 'in']];

var actionBlock = new ProtoBlock('action');
protoBlockList.push(actionBlock);
actionBlock.palette = blocksPalette;
actionBlock.yoff = 64;
actionBlock.foff = 22;
actionBlock.loff = 42;
actionBlock.args = 1;
actionBlock.expandable = true;
actionBlock.style = "clamp";
actionBlock.docks = [[20, 0, 'unavailable'], [98, 34, 'textin'],
		     [38, 55, 'in'], [20, 80, 'unavailable']];

// Define block instance objects
function Block (protoblock) {
    this.protoblock = protoblock;
    this.name = protoblock.name;
    this.label = null;
    this.value = null;
    this.image = null;
    this.bitmap = null;
    this.x = 0;
    this.y = 0;
    this.docks = [];  // Proto dock is copied here.
    this.connections = [];
}

Block.prototype.copyDocks = function() {
    for (var i = 0; i < this.protoblock.docks.length; i++) {
	this.docks.push(this.protoblock.docks[i]);
    }
}

Block.prototype.getInfo = function() {
    return this.name + ' block';
}

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
    if (protoBlockList[i].style == "clamp") {
	clampBlocks.push(protoBlockList[i].name);
    }
    if (protoBlockList[i].style == "special") {
	specialBlocks.push(protoBlockList[i].name);
    }
    if (protoBlockList[i].style == "arg") {
	argBlocks.push(protoBlockList[i].name);
    }
    if (protoBlockList[i].style == "value") {
	argBlocks.push(protoBlockList[i].name);
	valueBlocks.push(protoBlockList[i].name);
    }
}

// Blocks that cannot be run on their own
var noRunBlocks = ["action"];

// Label elements for each of our blocks...
var arrLabels = [];

// and a place in the DOM to put them.
var labelElem = document.getElementById("labelDiv");
