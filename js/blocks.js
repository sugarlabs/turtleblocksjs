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

var turtlePalette = new Palette('Turtle');
paletteList.push(turtlePalette);
turtlePalette.color = "green";

var numberPalette = new Palette('Number');
paletteList.push(numberPalette);
numberPalette.color = "purple";

var flowPalette = new Palette('Flow');
paletteList.push(flowPalette);
flowPalette.color = "orange";

var blockPalette = new Palette('Blocks');
paletteList.push(blockPalette);
blockPalette.color = "yellow";

// Define block proto objects
function ProtoBlock (name) {
    this.name = name;
    this.palette = null;
    this.style = null;
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
    return 'images/' + this.name + '-filler.svg';
}

ProtoBlock.prototype.getFillerLargeSvgPath = function() {
    return 'images/' + this.name + '-filler-large.svg';
}

ProtoBlock.prototype.getBottomSvgPath = function() {
    return 'images/' + this.name + '-bottom.svg';
}

// Instantiate the proto blocks
var protoBlockList = []

var clearBlock = new ProtoBlock('clear');
protoBlockList.push(clearBlock);
clearBlock.palette = turtlePalette;
clearBlock.args = 0;
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
numberBlock.args = 0;
numberBlock.docks = [[0, 20, 'numberout']];

var textBlock = new ProtoBlock('text');
protoBlockList.push(textBlock);
textBlock.palette = textPalette;
textBlock.args = 0;
textBlock.docks = [[0, 20, 'textout']];

var plusBlock = new ProtoBlock('plus');
protoBlockList.push(plusBlock);
plusBlock.palette = numberPalette;
plusBlock.yoff = 32;
plusBlock.foff = 17;
plusBlock.loff = 42;
plusBlock.size = 2;  // Expandable
plusBlock.args = 2;
plusBlock.docks = [[0, 20, 'numberout'], [68, 20, 'numberin'],
		   [68, 62, 'numberin']];

var repeatBlock = new ProtoBlock('repeat');
protoBlockList.push(repeatBlock);
repeatBlock.palette = flowPalette;
repeatBlock.yoff = 52;
repeatBlock.foff = 22;
repeatBlock.loff = 42;
repeatBlock.size = 3;  // Expandable
repeatBlock.args = 2;
repeatBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'], [38, 42, 'in'],
		     [20, 126, 'in']];

var startBlock = new ProtoBlock('start');
protoBlockList.push(startBlock);
startBlock.palette = blockPalette;
startBlock.yoff = 64;
startBlock.foff = 22;
startBlock.loff = 42;
startBlock.args = 1;
startBlock.docks = [[20, 0, 'unavailable'], [38, 55, 'in'],
		    [20, 80, 'unavailable']];

var runBlock = new ProtoBlock('run');
protoBlockList.push(runBlock);
runBlock.palette = blockPalette;
runBlock.args = 1;
runBlock.docks = [[20, 0, 'out'], [98, 20, 'textin'], [20, 42, 'in']];

var actionBlock = new ProtoBlock('action');
protoBlockList.push(actionBlock);
actionBlock.palette = blockPalette;
actionBlock.yoff = 64;
actionBlock.foff = 22;
actionBlock.loff = 42;
actionBlock.args = 1;
actionBlock.docks = [[20, 0, 'unavailable'], [98, 20, 'textin'],
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
    this.docks = [];
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

// Blocks that are expandable.
var expandableBlocks = ["repeat", "start", "plus", "action"];

// Blocks that are used as arguments to other blocks
var argBlocks = ["number", "text", "plus"];

// Blocks that return values
var valueBlocks = ["number", "text"];

// Blocks that cannot be run on their own
var noRunBlocks = ["action"];

// Label elements for each of our blocks...
var arrLabels = [];

// and a place in the DOM to put them.
var labelElem = document.getElementById("labelDiv");
