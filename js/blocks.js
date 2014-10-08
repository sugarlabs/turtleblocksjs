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

ProtoBlock.prototype.getBottomSvgPath = function() {
    return 'images/' + this.name + '-bottom.svg';
}

// Instantiate the proto blocks
var protoBlockList = []

var clearBlock = new ProtoBlock('clear');
protoBlockList.push(clearBlock);
clearBlock.palette = turtlePalette;
clearBlock.args = 0;
clearBlock.docks = [[20, 0, 'out'], [20, 40, 'in']];

var forwardBlock = new ProtoBlock('forward');
protoBlockList.push(forwardBlock);
forwardBlock.palette = turtlePalette;
forwardBlock.args = 1;
forwardBlock.docks = [[20, 0, 'out'], [100, 20, 'numberin'], [20, 40, 'in']];

var rightBlock = new ProtoBlock('right');
protoBlockList.push(rightBlock);
rightBlock.palette = turtlePalette;
rightBlock.args = 1;
rightBlock.docks = [[20, 0, 'out'], [100, 20, 'numberin'], [20, 40, 'in']];

var backBlock = new ProtoBlock('back');
protoBlockList.push(backBlock);
backBlock.palette = turtlePalette;
backBlock.args = 1;
backBlock.docks = [[20, 0, 'out'], [100, 20, 'numberin'], [20, 40, 'in']];

var leftBlock = new ProtoBlock('left');
protoBlockList.push(leftBlock);
leftBlock.palette = turtlePalette;
leftBlock.args = 1;
leftBlock.docks = [[20, 0, 'out'], [100, 20, 'numberin'], [20, 40, 'in']];

var numberBlock = new ProtoBlock('number');
protoBlockList.push(numberBlock);
numberBlock.palette = numberPalette;
numberBlock.args = 0;
numberBlock.docks = [[0, 20, 'numberout']];

var repeatBlock = new ProtoBlock('repeat');
protoBlockList.push(repeatBlock);
repeatBlock.palette = flowPalette;
repeatBlock.yoff = 52;
repeatBlock.args = 2;
repeatBlock.docks = [[20, 0, 'out'], [115, 20, 'numberin'], [37, 39, 'in'],
		     [20, 96, 'in']];

var startBlock = new ProtoBlock('start');
protoBlockList.push(startBlock);
startBlock.palette = blockPalette;
startBlock.yoff = 64;
startBlock.args = 1;
startBlock.docks = [[20, 0, 'unavailable'], [37, 50, 'in'],
		    [20, 80, 'unavailable']];

for (blk = 0; blk < protoBlockList.length; blk++) {
    // alert(protoBlockList[blk].getInfo());
}

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
    this.connections = [];
}

Block.prototype.getInfo = function() {
    return this.name + ' block';
}

// A place to keep the blocks we create...
var blockList = [];
// Blocks that are expandable.
var expandableBlocks = ["repeat", "start"];
// Blocks that are used as arguments to other blocks
var argBlocks = ["number"];
// Blocks that return values
var valueBlocks = ["number"];
// Blocks that cannot be run on their own
var noRunBlocks = ["hat"];
// Label elements for each of our blocks...
var arrLabels = [];
// and a place in the DOM to put them.
var labelElem = document.getElementById("labelDiv");

// var inputElem = document.getElementById("inputDiv");
// inputElem.innerHTML = '<input type="text" id="myNumber" name="myNumber" class="myNumber">';
// We keep a textarea around to modify numbers
// inputElem.innerHTML = '<textarea id="myNumber" name="myNumber" class="myNumber" cols="6" rows="1" maxlength="6"></textarea>';
// var foo = document.getElementById("myNumber");
// foo.defaultValue = "666";
// foo.onchange=textareaChanged
// function textareaChanged() {
//     var foo = document.getElementById("myNumber");
//     console.log('textarea changed: ' + foo.value);
// }
