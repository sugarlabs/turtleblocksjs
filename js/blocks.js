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

// Some names changed between the Python verison and the
// JS version so look up name in the conversion dictionary.
var NAMEDICT = {'xpos': 'x', 'ypos': 'y', 'seth': 'setheading', 'plus2': 'plus', 'product2': 'multiply', 'division2': 'divide', 'minus2': 'minus', 'stack': 'do', 'hat': 'action', 'clean': 'clear', 'setxy2': 'setxy', 'greater2': 'greater', 'less2': 'less', 'equal2': 'equal', 'random2': 'random', 'sethue': 'setcolor', 'setvalue': 'setshade', 'setchroma': 'setgrey', 'setgray': 'setgrey', 'gray': 'grey', 'chroma': 'grey', 'value': 'shade', 'hue': 'color', 'startfill': 'beginfill', 'stopfill': 'endfill', 'string': 'text'};

// For DOM access
var blockBlocks = null;

// There are three "classes" defined in this file: ProtoBlocks,
// Blocks, and Block. Protoblocks are the prototypes from which Blocks
// are created; Blocks is the list of all blocks; and Block is a block
// instance.

// Protoblock contain generic information about blocks and some
// methods common to all blocks.
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
    this.staticLabels = [];  // Generated as part of static inline SVG
    this.artwork = null;
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

    // We need to copy, since docks get modified.
    this.copyDock = function(dockStyle) {
	for(var i = 0; i < dockStyle.length; i++) {
	    var dock = [dockStyle[i][0], dockStyle[i][1], dockStyle[i][2]];
	    this.docks.push(dock);
	}
    }

    // Inits for different block styles.
    this.zeroArgBlock = function() {
	this.args = 0;
	this.artwork = BASICBLOCK;
	this.copyDock(BASICBLOCKDOCKS);
    }

    this.oneArgBlock = function() {
	this.args = 1;
	this.artwork = BASICBLOCK1ARG;
	this.copyDock(BASICBLOCK1ARGDOCKS);
    }

    this.twoArgBlock = function() {
	this.yoff = 49;
	this.loff = 42;
	this.expandable = true;
	this.style = 'special';
	this.size = 2;
	this.args = 2;
	this.artwork = BASICBLOCK2ARG;
	this.copyDock(BASICBLOCK2ARGDOCKS);
    }

    this.oneArgMathBlock = function() {
	this.style = 'arg';
	this.size = 1;
	this.args = 1;
	this.artwork = ARG1BLOCK;
	this.copyDock(ARG1BLOCKDOCKS);
    }

    this.twoArgMathBlock = function() {
	this.yoff = 49;
	this.loff = 42;
	this.expandable = true;
	this.style = 'arg';
	this.size = 2;
	this.args = 2;
	this.artwork = ARG2BLOCK;
	this.copyDock(ARG2BLOCKDOCKS);
    }

    this.valueBlock = function() {
	this.style = 'value';
	this.size = 1;
	this.args = 0;
	this.artwork = VALUEBLOCK;
	this.copyDock(VALUEBLOCKDOCKS);
    }

    this.mediaBlock = function() {
	this.style = 'value';
	this.size = 1;
	this.args = 0;
	this.artwork = MEDIABLOCK;
	this.copyDock(MEDIABLOCKDOCKS);
    }

    this.flowClamp1ArgBlock = function() {
	this.style = 'clamp';
	this.yoff = 74;
	this.loff = 42;
	this.expandable = true;
	this.size = 2;
	this.args = 2;
	this.artwork = FLOWCLAMP1ARG;
	this.copyDock(FLOWCLAMP1ARGDOCKS);
    }

    this.flowClampBooleanArgBlock = function() {
	this.style = 'clamp';
	this.yoff = 116;
	this.loff = 42;
	this.expandable = true;
	this.size = 3;
	this.args = 2;
	this.artwork = FLOWCLAMPBOOLEANARG;
	this.copyDock(FLOWCLAMPBOOLEANDOCKS);
    }

    this.blockClamp0ArgBlock = function() {
	this.style = 'clamp';
	this.yoff = 86;
	this.loff = 42;
	this.expandable = true;
	this.size = 2;
	this.args = 1;
	this.artwork = ACTIONCLAMP0ARG;
	this.copyDock(ACTIONCLAMP0ARGDOCKS);
    }

    this.blockClamp1ArgBlock = function() {
	this.style = 'clamp';
	this.yoff = 86;
	this.loff = 42;
	this.expandable = true;
	this.size = 2;
	this.args = 1;
	this.artwork = ACTIONCLAMP1ARG;
	this.copyDock(ACTIONCLAMP1ARGDOCKS);
    }

    this.boolean0ArgBlock = function() {
	this.style = 'arg';
	this.size = 1;
	this.args = 0;
	this.artwork = BOOLEAN0ARG;
	this.copyDock(BOOLEAN0ARGDOCKS);
    }

    this.boolean2ArgBlock = function() {
	this.style = 'arg';
	this.size = 2;
	this.args = 2;
	this.artwork = BOOLEAN2ARG;
	this.copyDock(BOOLEAN2ARGDOCKS);
    }

    this.parameterBlock = function() {
	this.style = 'arg';
	this.size = 1;
	this.args = 0;
	this.artwork = VALUEBLOCK;
	this.copyDock(VALUEBLOCKDOCKS);
    }
}

// Blocks holds the list of blocks and most of the block-associated
// methods, since most block manipulations are inter-block.
function Blocks (canvas, stage, refreshCanvas, trashcan) {
    // Things we need from outside
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;
    this.trashcan = trashcan;

    // The proto blocks...
    this.protoBlockDict = {}
    // And a place to keep the blocks we create.
    this.blockList = [];

    // To avoid infinite loops in dock search
    this.loopCounter = 0;
    this.sizeCounter = 0;
    this.searchCounter = 0;

    // We'll need a reference to the palettes.
    this.palettes = null;

    // Which block, if any, is highlighted?
    this.highlightedBlock = null;
    // Which block, if any, is active?
    this.activeBlock = null;
    // Are the blocks visible?
    this.visible = true;
    // Group of blocks being dragged
    this.dragGroup = [];
    // The blocks at the tops of stacks
    this.stackList = [];
    // Expandable blocks
    this.expandablesList = [];
    // Cache bitmaps that have been removed from expandable blocks
    this.bitmapCache = [];

    // We need to keep track of certain classes of blocks that exhibit
    // different types of behavior:
    this.expandableBlocks = [];  // Blocks with parts that expand
    this.clampBlocks = [];  // Blocks that contain other blocks
    this.argBlocks = [];  // Blocks that are used as arguments to other blocks
    this.valueBlocks = [];  // Blocks that return values
    this.specialBlocks = [];  // Two-arg blocks with special parts
    this.noRunBlocks = ['action'];

    this.setTurtles = function(turtles) {
	this.turtles = turtles;
    }

    this.setLogo = function(runLogo) {
	this.runLogo = runLogo;
    }

    this.findBlockTypes = function() {
	for (var proto in this.protoBlockDict) {
	    if (this.protoBlockDict[proto].expandable) {
		this.expandableBlocks.push(this.protoBlockDict[proto].name);
	    }
	    if (this.protoBlockDict[proto].style == 'clamp') {
		this.clampBlocks.push(this.protoBlockDict[proto].name);
	    }
	    if (this.protoBlockDict[proto].style == 'special') {
		this.specialBlocks.push(this.protoBlockDict[proto].name);
	    }
	    if (this.protoBlockDict[proto].style == 'arg') {
		this.argBlocks.push(this.protoBlockDict[proto].name);
	    }
	    if (this.protoBlockDict[proto].style == 'value') {
		this.argBlocks.push(this.protoBlockDict[proto].name);
		this.valueBlocks.push(this.protoBlockDict[proto].name);
	    }
	}
    }

    this.adjustBlockPositions = function() {
	// Adjust the docking postions of all blocks in the drag group
	if (this.dragGroup.length < 2) {
	    return;
	}
    
	this.loopCounter = 0;
	this.adjustDocks(this.dragGroup[0])
    }

    this.adjustExpandableBlock = function(blk) {
	// Adjust the size of the clamp in an expandable block
	var myBlock = this.blockList[blk];
	myBlock.container.uncache();
    
	if (myBlock.isArgBlock()) {
	    return;
	}
    
	if (myBlock.isSpecialBlock()) {
	    return;
	}
    
	// (1) count up the number of blocks inside the clamp;
	// always the second to last argument.
	var c = myBlock.connections.length - 2;
	this.sizeCounter = 0;
	var size = this.getStackSize(myBlock.connections[c]);
	if( size < 1 ) {
	    size = 1;  // Minimum clamp size
	}
	// console.log('blk[' + blk + '].size == ' + size);

	// (2) adjust the clamp size to match.
	var yoff = myBlock.protoblock.yoff;
	var loff = myBlock.protoblock.loff;
	var j = myBlock.fillerBitmaps.length;
	if (size < myBlock.fillerBitmaps.length + 1) {
	    var n = j - size + 1;  // one slot built in
	    for (var i = 0; i < n; i++) {
		this.removeFiller(blk);
		last(myBlock.docks)[1] -= loff;
		myBlock.bounds.height -= loff;
	    }
            j = myBlock.fillerBitmaps.length;
	    var o = yoff + j * loff;
	    myBlock.bottomBitmap.y = myBlock.bitmap.y + o;
	    myBlock.highlightBottomBitmap.y = myBlock.bitmap.y + o;
	    if (last(myBlock.connections) != null) {
		this.loopCounter = 0;
		this.adjustDocks(blk);
	    }
	} else if (size > myBlock.fillerBitmaps.length) {
	    var n = size - j - 1;  // one slot built in
	    for (var i = 0; i < n; i++) {
		var c = i + j;
		this.addFiller(blk, yoff + c * loff, c);
		last(myBlock.docks)[1] += loff;
		myBlock.bounds.height += loff;
	    }
            j = myBlock.fillerBitmaps.length;
	    var o = yoff + j * loff;
	    myBlock.bottomBitmap.y = myBlock.bitmap.y + o;
	    myBlock.highlightBottomBitmap.y = myBlock.bitmap.y + o;
	    if (last(myBlock.connections) != null) {
		this.loopCounter = 0;
		this.adjustDocks(blk);
	    }
	}	    
	console.log('change ' + myBlock.bounds.height);
	myBlock.container.cache(myBlock.bounds.x, myBlock.bounds.y, myBlock.bounds.width, myBlock.bounds.height);
	this.refreshCanvas();
    }

    this.getBlockSize = function(blk) {
	// TODO recurse on first arg
	return this.blockList[blk].size;
    }

    this.adjust2ArgBlock = function(blk) {
	// Adjust the size of a 2-arg block
	var myBlock = this.blockList[blk];
	myBlock.container.uncache();

	// (1) What the size of the first argument?
	var c = myBlock.connections[1];
	if (c == null) {
	    var size = 0;
	} else {
	    var size = this.getBlockSize(c);
	}
	if( size < 1 ) {
	    size = 1;  // Minimum size
	}
    
	// (2) adjust the block size to match.
	var yoff = myBlock.protoblock.yoff;
	var loff = myBlock.protoblock.loff;
	var j = myBlock.fillerBitmaps.length;
	if (size < myBlock.fillerBitmaps.length + 1) {
	    var n = j - size + 1;  // one slot built in
	    for (var i = 0; i < n; i++) {
		this.removeFiller(blk);
		myBlock.docks[2][1] -= loff;
		if (!myBlock.isArgBlock()) {
		    myBlock.docks[3][1] -= loff;
		}
		myBlock.size -= 1;
		myBlock.bounds.height -= loff;
	    }
            j = myBlock.fillerBitmaps.length;
	    var o = yoff + j * loff;
	    myBlock.bottomBitmap.y = myBlock.bitmap.y + o;
	    myBlock.highlightBottomBitmap.y = myBlock.bitmap.y + o;
	    if (myBlock.isArgBlock()) {
		if (myBlock.connections[2] != null) {
		    this.loopCounter = 0;
		    this.adjustDocks(blk);
		}
	    } else {
		if (myBlock.connections[2] != null) {
		    this.loopCounter = 0;
		    this.adjustDocks(blk);
		} else if (myBlock.connections[3] != null) {
		    this.loopCounter = 0;
		    this.adjustDocks(blk);
		}
	    }
	} else if (size > myBlock.fillerBitmaps.length) {
	    var n = size - j - 1;  // one slot built in
	    for (var i = 0; i < n; i++) {
		var c = i + j;
		this.addFiller(blk, yoff + c * loff, c);
		myBlock.docks[2][1] += loff;
		if (!myBlock.isArgBlock()) {
		    myBlock.docks[3][1] += loff;
		}
		myBlock.size += 1;
		myBlock.bounds.height += loff;
	    }
            j = myBlock.fillerBitmaps.length;
	    var o = yoff + j * loff;
	    myBlock.bottomBitmap.y = myBlock.bitmap.y + o;
	    myBlock.highlightBottomBitmap.y = myBlock.bitmap.y + o;
	    if (myBlock.isArgBlock()) {
		if (myBlock.connections[2] != null) {
		    this.loopCounter = 0;
		    this.adjustDocks(blk);
		}
	    } else {
		if (myBlock.connections[2] != null) {
		    this.loopCounter = 0;
		    this.adjustDocks(blk);
		} else if (myBlock.connections[3] != null) {
		    this.loopCounter = 0;
		    this.adjustDocks(blk);
		}
	    }
	}
	console.log('change ' + myBlock.bounds.height);
	myBlock.container.cache(myBlock.bounds.x, myBlock.bounds.y, myBlock.bounds.width, myBlock.bounds.height);
	this.refreshCanvas();
    }

    this.removeFiller = function(blk) {
	var myBlock = this.blockList[blk];
	var fillerBitmap = myBlock.fillerBitmaps.pop();
	myBlock.container.uncache();

	myBlock.container.removeChild(fillerBitmap);
	if (this.findBitmap(fillerBitmap.name) == null) {
	    this.bitmapCache.push(fillerBitmap);
	}
    }

    this.addFiller = function(blk, offset, c) {
	var myBlock = this.blockList[blk];
	var name = 'bmp_' + blk + '_filler_' + c;

	var bi = this.findBitmap(name);
	if (bi == null) { 
	    if (myBlock.isArgBlock()) {
		var artwork = ARG2BLOCKFILLER;
	    } else if (myBlock.isSpecialBlock()) {
		var artwork = BASICBLOCK2ARGFILLER;
	    } else {
		var artwork = CLAMPFILLER;
	    }
	    var bitmap = new createjs.Bitmap(artwork.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]));
	    bitmap.name = name;
	} else {
	    var bitmap = this.bitmapCache[bi];
	}
	myBlock.fillerBitmaps.push(bitmap);
	myBlock.container.addChild(bitmap);
	bitmap.x = myBlock.bitmap.x;
	bitmap.y = myBlock.bitmap.y + offset;
	bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;
	
	// And the same for the highlight blocks
	var name = 'bmp_' + blk + '_highlight_filler_' + c;
	var bi = this.findBitmap(name);
	if (bi == null) { 
	    if (myBlock.isArgBlock()) {
		var artwork = ARG2BLOCKFILLER;
	    } else if (myBlock.isSpecialBlock()) {
		var artwork = BASICBLOCK2ARGFILLER;
	    } else {
		var artwork = CLAMPFILLER;
	    }
	    var bitmap = new createjs.Bitmap(artwork.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]));
	    bitmap.name = name;
	} else {
	    var bitmap = this.bitmapCache[bi];
	}
	myBlock.highlightFillerBitmaps.push(bitmap);
	myBlock.container.addChild(bitmap);
	bitmap.x = myBlock.bitmap.x;
	bitmap.y = myBlock.bitmap.y + offset;
	bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1;
	// Hide highlight to start
	bitmap.visible = false;
    }

    this.findBitmap = function(name) {
	for (var i = 0; i < this.bitmapCache.length; i++) {
	    if (this.bitmapCache[i].name == name) {
		return i;
	    }
	}
	return null;
    }

    this.getStackSize = function(blk) {
	// How many block units (42 px) in this stack?
	var size = 0;
	this.sizeCounter += 1;
	if (this.sizeCounter > this.blockList.length * 2) {
	    console.log('infinite loop detecting size of expandable block?');
	    console.log(blk);
	    console.log(this.blockList);
	    return size;
	}
    
	if (blk == null) {
	    return size;
	}
	
	if (this.blockList[blk].isClampBlock()) {
	    c = this.blockList[blk].connections.length - 2;
	    size = this.getStackSize(this.blockList[blk].connections[c]);
	    if (size == 0) {
		size = 1;  // minimum of 1 slot in clamp
	    }
	    // add top and bottom of clamp
	    size += this.blockList[blk].size;
	} else {
	    size = this.blockList[blk].size;
	}
	
	// check on any connected block
	if (!this.blockList[blk].isValueBlock()) {
	    var cblk = last(this.blockList[blk].connections);
	    size += this.getStackSize(cblk);
	}
	return size;
    }

    this.adjustDocks = function(blk, reset) {
	// Give a block, adjust the dock positions
	// of all of the blocks connected to it
    
	// For when we come in from makeBlock
	if (reset != null) {
	    this.loopCounter = 0;
	}
    
	// Do we need these? All blocks have connections.
	if (this.blockList[blk] == null) {
	    console.log('saw a null block: ' + blk);
	    return;
	}
	if (this.blockList[blk].connections == null) {
	    console.log('saw a block with null connections: ' + blk);
	    return;
	}
	if (this.blockList[blk].connections.length == 0) {
	    console.log('saw a block with [] connections: ' + blk);
	    return;
	}
	if (this.blockList[blk].docks.length == 1) {
	    console.log(this.blockList[blk].name + ' must be a value block... nothing to do.');
	    return;
	}

	console.log('adjusting connections for ' + this.blockList[blk].name);
	console.log('connections ' + this.blockList[blk].connections);
	console.log('docks ' + this.blockList[blk].docks);
    
	this.loopCounter += 1;
	if (this.loopCounter > this.blockList.length * 2) {
	    // FIXME: is there still an infinite loop in here somewhere?
	    console.log('infinite loop encountered while adjusting docks');
	    console.log(blk);
	    console.log(this.blockList);
	    return;
	}
    
	// Walk through each connection except the parent block.
	for (var c = 1; c < this.blockList[blk].connections.length; c++) {
	    // Get the dock position for this connection.
	    var bdock = this.blockList[blk].docks[c];
	
	    // Find the connecting block.
	    var cblk = this.blockList[blk].connections[c];
	    // Nothing connected here so continue to the next connection.
	    if (cblk == null) {
		continue;
	    }
	
	    // Find the dock position in the connected block.
	    var foundMatch = false;
	    for (var b = 0; b < this.blockList[cblk].connections.length; b++) {
		if (this.blockList[cblk].connections[b] == blk) {
		    foundMatch = true;
		    break
		}
	    }

	    if (!foundMatch) {
		console.log('did not find match for ' + this.blockList[blk].name + ' and ' + this.blockList[cblk].name);
		break;
	    }
	    var cdock = this.blockList[cblk].docks[b];
	
	    // Move the connected block.
	    var dx = bdock[0] - cdock[0];
	    var dy = bdock[1] - cdock[1];
	    if (this.blockList[blk].bitmap == null) {
		var nx = this.blockList[blk].x + dx;
		var ny = this.blockList[blk].y + dy;
	    } else {
		var nx = this.blockList[blk].container.x + dx;
		var ny = this.blockList[blk].container.y + dy;
	    }
	    this.moveBlock(cblk, nx, ny);
	    
	    // Recurse on connected blocks.
	    this.adjustDocks(cblk);
	}
    }

    this.blockMoved = function(thisBlock) {
	// When a block is moved, we have lots of things to check:
	// (0) Is it inside of a expandable block?
	// (1) Is it an arg block connected to a 2-arg block?
	// (2) Disconnect its connection[0];
	// (3) Look for a new connection;
	// (4) Is it an arg block connected to a 2-arg block?
	// (5) Recheck if it inside of a expandable block.

	// Find any containing expandable blocks.
	var checkExpandableBlocks = [];
	var blk = this.insideExpandableBlock(thisBlock);
	var expandableLoopCounter = 0;
	while (blk != null) {
	    expandableLoopCounter += 1;
	    if (expandableLoopCounter > 2 * this.blockList.length) {
		console.log('inifinite loop checking for expandables?');
		break;
	    }
	    console.log('checking if ' + blk + ' is expandable');
	    checkExpandableBlocks.push(blk);
	    blk = this.insideExpandableBlock(blk);
	}

	var check2ArgBlocks = [];
	var myBlock = this.blockList[thisBlock];
	var c = myBlock.connections[0];
	if (c != null) {
	    var cBlock = this.blockList[c];
	}
	// If it is an arg block, where is it coming from?
	if (myBlock.isArgBlock() && c != null) {
	    // We care about special (2arg) blocks with
	    // connections to the first arg;
	    if (this.blockList[c].isSpecialBlock()) {
		if (cBlock.connections[1] == thisBlock) {
		    check2ArgBlocks.push(c);
		}
	    } else if (this.blockList[c].isArgBlock() && this.blockList[c].isExpandableBlock()) {
		if (cBlock.connections[1] == thisBlock) {
		    check2ArgBlocks.push(c);
		}
	    }
	}

	// Disconnect from connection[0] (both sides of the connection).
	if (c != null) {
	    // disconnect both ends of the connection
	    for (var i = 1; i < cBlock.connections.length; i++) {
		if (cBlock.connections[i] == thisBlock) {
		    cBlock.connections[i] = null;
		    break;
		}
	    }
  	    myBlock.connections[0] = null;
	}

	// Look for a new connection.
	var x1 = myBlock.container.x + myBlock.docks[0][0];
	var y1 = myBlock.container.y + myBlock.docks[0][1];
	// Find the nearest dock; if it is close
	// enough, connect;
	var newBlock = null;
	var newConnection = null;
	var min = 400;
	var blkType = myBlock.docks[0][2]
	for (var b = 0; b < this.blockList.length; b++) {
	    // Don't connect to yourself.
	    if (b == thisBlock) {
		continue;
	    }
	    for (var i = 1; i < this.blockList[b].connections.length; i++) {
		// When converting from Python to JS, sometimes extra
		// null connections are added. We need to ignore them.
		if (i == this.blockList[b].docks.length) {
		    console.log(this.blockList[b].name + ': connection ' + i + ' > ' + this.blockList[b].docks.length);
		    break;
		}
		// Look for available connections.
		if (this.testConnectionType(
		    blkType,
		    this.blockList[b].docks[i][2])) {
		    x2 = this.blockList[b].container.x + this.blockList[b].docks[i][0];
		    y2 = this.blockList[b].container.y + this.blockList[b].docks[i][1];
		    dist = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
		    if (dist < min) {
			newBlock = b;
			newConnection = i;
			min = dist;
		    }
		} else {
		    // TODO: bounce away from illegal connection?
		    // only if the distance was small
		    // console.log('cannot not connect these two block types');
		}
	    }
	}
	if (newBlock != null) {
	    // We found a match.
	    myBlock.connections[0] = newBlock;
	    var connection = this.blockList[newBlock].connections[newConnection];
	    if(connection != null) {
		if (myBlock.isArgBlock()) {
		    this.blockList[connection].connections[0] = null;
		    // Fixme: could be more than one block.
		    this.moveBlockRelative(connection, 40, 40);
		} else {
		    var bottom = this.findBottomBlock(thisBlock);
		    this.blockList[connection].connections[0] = bottom;
		    this.blockList[bottom].connections[this.blockList[bottom].connections.length-1] = connection;
		}
	    }
	    this.blockList[newBlock].connections[newConnection] = thisBlock;
	    this.loopCounter = 0;
	    this.adjustDocks(newBlock);
	    // TODO: mark new connection?
	}

	// If it is an arg block, where is it coming from?
	if (myBlock.isArgBlock() && newBlock != null) {
	    // We care about special (2arg) blocks with
	    // connections to the first arg;
	    if (this.blockList[newBlock].isSpecialBlock()) {
		if (this.blockList[newBlock].connections[1] == thisBlock) {
		    if (check2ArgBlocks.indexOf(newBlock) == -1) {
			check2ArgBlocks.push(newBlock);
		    }
		}
	    } else if (this.blockList[newBlock].isArgBlock() && this.blockList[newBlock].isExpandableBlock()) {
		if (this.blockList[newBlock].connections[1] == thisBlock) {
		    if (check2ArgBlocks.indexOf(newBlock) == -1) {
			check2ArgBlocks.push(newBlock);
		    }
		}
	    }
	}
	// If we changed the contents of a 2-arg block
	// block, we need to adjust it.
	if (check2ArgBlocks.length > 0) {
	    for (var i = 0; i < check2ArgBlocks.length; i++) {
		this.adjust2ArgBlock(check2ArgBlocks[i]);
	    }
	}

	// Recheck if it inside of a expandable block
	var blk = this.insideExpandableBlock(thisBlock);
	var expandableLoopCounter = 0;
	while (blk != null) {
	    expandableLoopCounter += 1;
	    console.log('checking if ' + blk + ' is expandable (' + this.blockList[blk].name + ')');
	    if (expandableLoopCounter > 2 * this.blockList.length) {
		console.log('inifinite loop checking for expandables?');
		console.log(this.blockList);
		break;
	    }
	    if (checkExpandableBlocks.indexOf(blk) == -1) {
		checkExpandableBlocks.push(blk);
	    }
	    blk = this.insideExpandableBlock(blk);
	}
	// If we changed the contents of an expandable
	// block, we need to adjust its clamp.
	if (checkExpandableBlocks.length > 0) {
	    for (var i = 0; i < checkExpandableBlocks.length; i++) {
		this.adjustExpandableBlock(checkExpandableBlocks[i]);
	    }
	}
    }

    this.testConnectionType = function(type1, type2) {
	// Can these two blocks dock?
	if (type1 == 'in' && type2 == 'out') {
	    return true;
	}
	if (type1 == 'out' && type2 == 'in') {
	    return true;
	}
	if (type1 == 'numberin' && type2 == 'numberout') {
	    return true;
	}
	if (type1 == 'numberout' && type2 == 'numberin') {
	    return true;
	}
	if (type1 == 'textin' && type2 == 'textout') {
	    return true;
	}
	if (type1 == 'textout' && type2 == 'textin') {
	    return true;
	}
	if (type1 == 'booleanout' && type2 == 'booleanin') {
	    return true;
	}
	if (type1 == 'booleanin' && type2 == 'booleanout') {
	    return true;
	}
	if (type1 == 'mediain' && type2 == 'mediaout') {
	    return true;
	}
	if (type1 == 'mediaout' && type2 == 'mediain') {
	    return true;
	}
	if (type1 == 'mediain' && type2 == 'textout') {
	    return true;
	}
	return false;
    }

    this.updateBlockImages = function() {
	// Create the block image if it doesn't yet exist.
	for (var blk = 0; blk < this.blockList.length; blk++) {
	    this.moveBlock(blk, this.blockList[blk].x, this.blockList[blk].y);
	}
    }

    this.bringToTop = function() {
	// Move all the blocks to the top layer of the stage
	for (var blk in this.blockList) {
	    myBlock = this.blockList[blk];
	    this.stage.removeChild(myBlock.container);
	    this.stage.addChild(myBlock.container);
	}
	this.refreshCanvas();
    }

    this.moveBlock = function(blk, x, y) {
	// Move a block (and its label) to x, y.
	var myBlock = this.blockList[blk];
	if (myBlock.container != null) {
	    myBlock.container.x = x;
	    myBlock.container.y = y;
	    myBlock.x = x
	    myBlock.y = y
	    this.adjustLabelPosition(blk, myBlock.container.x, myBlock.container.y);
	} else {
	    console.log('no container yet');
	    myBlock.x = x
	    myBlock.y = y
	}
    }

    this.moveBlockRelative = function(blk, dx, dy) {
	// Move a block (and its label) by dx, dy.
	var myBlock = this.blockList[blk];
	if (myBlock.container != null) {
	    myBlock.container.x += dx;
	    myBlock.container.y += dy;
	    myBlock.x = myBlock.container.x;
	    myBlock.y = myBlock.container.y;
	    this.adjustLabelPosition(blk, myBlock.container.x, myBlock.container.y);
	} else {
	    console.log('no container yet');
	    myBlock.x += dx
	    myBlock.y += dy
	}
    }
    
    this.updateBlockText = function(blk) {
	// When we create new blocks, we may not have assigned the
	// value yet.	    
	this.blockList[blk].text.text = this.blockList[blk].value.toString();
    }

    this.updateBlockLabels = function() {
	// The modifiable labels are stored in the DOM with a
	// unique id for each block.  For the moment, we only have
	// labels for number and text blocks.
	var html = ''
	var text = ''
	var value = ''
	for (var blk = 0; blk < this.blockList.length; blk++) {
	    var myBlock = this.blockList[blk];
	    if (myBlock.name == 'number') {
		if (myBlock.label == null) {
		    if (myBlock.value == null) {
			myBlock.value = 100;
		    }
		    value = myBlock.value.toString();
		} else {
		    value = myBlock.label.value;
		}
		text = '<textarea id="' + myBlock.getBlockId() +
		    '" style="position: absolute; ' + 
		    '-webkit-user-select: text;" ' +
		    'class="number", ' +
		    'onkeypress="if(event.keyCode==13){return false;}"' + 
		    'cols="8", rows="1", maxlength="8">' +
		    value + '</textarea>'
	    } else if (myBlock.name == 'text') {
		if (myBlock.label == null) {
		    if (myBlock.value == null) {
			myBlock.value = 'text';
		    }
		    value = myBlock.value;
		} else {
		    value = myBlock.label.value;
		}
		text = '<textarea id="' + myBlock.getBlockId() +
		    '" style="position: absolute; ' + 
		    '-webkit-user-select: text;" ' +
		    'class="text", ' +
		    'cols="8", rows="1", maxlength="8">' +
		    value + '</textarea>'
	    } else {
		text = ''
	    }
	    html = html + text
	}
	labelElem.innerHTML = html;
	
	// Then create a list of the label elements
	for (var blk = 0; blk < this.blockList.length; blk++) {
	    var myBlock = this.blockList[blk];
	    if (myBlock.bitmap == null) {
		var x = myBlock.x
		var y = myBlock.y
	    } else {
		var x = myBlock.bitmap.x
		var y = myBlock.bitmap.y
	    }
	    if (myBlock.isValueBlock() && myBlock.name != 'media') {
		myBlock.label = docById(myBlock.getBlockId());
		myBlock.label.addEventListener(
		    'change', function() {labelChanged();});
		this.adjustLabelPosition(blk, x, y);
		// Hide the label until we need to change it
		myBlock.label.style.display = 'none';
	    } else {
		myBlock.label = null;
	    }
	}
    }

    this.adjustLabelPosition = function(blk, x, y) {
	// Move the label when the block moves.
	var canvasLeft = canvas.offsetLeft + 28;
	var canvasTop = canvas.offsetTop + 6;

	if (this.blockList[blk].label == null) {
	    return;
	}
	if (this.blockList[blk].protoblock.name == 'number') {
	    this.blockList[blk].label.style.left = Math.round(x + canvasLeft) + 'px';
	} else if (this.blockList[blk].protoblock.name == 'text') {
	    this.blockList[blk].label.style.left = Math.round(x + canvasLeft) + 'px';
	}
	this.blockList[blk].label.style.top = Math.round(y + canvasTop) + 'px';
    }

    this.findTopBlock = function(blk) {
	// Find the top block in a stack.
	if (blk == null) {
	    return null;
	}
	if (this.blockList[blk].connections == null) {
	    return blk;
	}
	if (this.blockList[blk].connections.length == 0) {
	    return blk;
	}
	var topBlockLoop = 0;
	while (this.blockList[blk].connections[0] != null) {
	    topBlockLoop += 1;
	    if (topBlockLoop > 2 * this.blockList.length) {
		console.log('infinite loop finding topBlock?');
		break;
	    }
	    blk = this.blockList[blk].connections[0];
	}
	return blk;
    }

    this.findBottomBlock = function(blk) {
	// Find the bottom block in a stack.
	if (blk == null) {
	    return null;
	}
	if (this.blockList[blk].connections == null) {
	    return blk;
	}
	if (this.blockList[blk].connections.length == 0) {
	    return blk;
	}
	var bottomBlockLoop = 0;
	while (last(this.blockList[blk].connections) != null) {
	    bottomBlockLoop += 1;
	    if (bottomBlockLoop > 2 * this.blockList.length) {
		console.log('infinite loop finding bottomBlock?');
		break;
	    }
	    blk = last(this.blockList[blk].connections);
	}
	return blk;
    }

    this.findStacks = function() {
	// Find any blocks with null in the first connection.
	this.stackList = [];
	for (i = 0; i < this.blockList.length; i++) {
	    if (this.blockList[i].connections[0] == null) {
		this.stackList.push(i)
	    }
	}
    }

    this.findClamps = function() {
	// Find any clamp blocks.
	this.expandablesList = [];
	this.findStacks();  // We start by finding the stacks
	for (var i = 0; i < this.stackList.length; i++) {
	    this.searchCounter = 0;
	    this.searchForExpandables(this.stackList[i]);
	}
    }

    this.find2Args = function() {
	// Find any expandable arg blocks.
	this.expandablesList = [];
	for (var i = 0; i < this.blockList.length; i++) {
	    if (this.blockList[i].isArgBlock() && this.blockList[i].isExpandableBlock()) {
		this.expandablesList.push(i);
	    }
	}
    }

    this.searchForExpandables = function(blk) {
	// Find the expandable blocks below blk in a stack.
	while (blk != null) {
	    this.searchCounter += 1;
	    if (this.searchCounter > 2 * this.blockList.length) {
		console.log('infinite loop searching for Expandables?');
		break;
	    }
	    if (this.blockList[blk].isClampBlock()) {
		this.expandablesList.push(blk);
		var c = this.blockList[blk].connections.length - 2;
		this.searchForExpandables(this.blockList[blk].connections[c]);
	    }
	    blk = last(this.blockList[blk].connections);
	}
    }

    this.expand2Args = function() {
	// Expand expandable 2-arg blocks as needed.
	this.find2Args();
	for (var i = 0; i < this.expandablesList.length; i++) {
	    this.adjust2ArgBlock(this.expandablesList[i]);
	}
	this.refreshCanvas();
    }

    this.expandClamps = function() {
	// Expand expandable clamp blocks as needed.
	this.findClamps();
	for (var i = 0; i < this.expandablesList.length; i++) {
	    this.adjustExpandableBlock(this.expandablesList[i]);
	}
	this.refreshCanvas();
    }

    this.imageLoad = function(myBlock) {
	// Load a block image and create any extra parts.
	var thisBlock = this.blockList.indexOf(myBlock);

        // Create the bitmap for the block.
	// if (myBlock.name == 'clear') {
	var block_label = '';
	var top_label = '';
	var bottom_label = '';
	if (myBlock.protoblock.staticLabels.length > 0) {
	    block_label = myBlock.protoblock.staticLabels[0];
	}
	if (myBlock.protoblock.staticLabels.length > 1) {
	    top_label = myBlock.protoblock.staticLabels[1];
	}
	if (myBlock.protoblock.staticLabels.length > 2) {
	    bottom_label = myBlock.protoblock.staticLabels[2];
	}
	myBlock.bitmap = new createjs.Bitmap(myBlock.protoblock.artwork.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('block_label', block_label).replace('top_label', top_label).replace('bottom_label', bottom_label));

	myBlock.container.addChild(myBlock.bitmap);
	myBlock.container.x = myBlock.x;
	myBlock.container.y = myBlock.y;
	myBlock.bitmap.x = 0;
	myBlock.bitmap.y = 0;
	myBlock.bitmap.scaleX = 1;
	myBlock.bitmap.scaleY = 1;
	myBlock.bitmap.scale = 1;
	myBlock.bitmap.name = 'bmp_' + thisBlock;
	myBlock.bitmap.cursor = 'pointer';
	this.adjustLabelPosition(thisBlock, myBlock.container.x, myBlock.container.y);

        // Create the highlight bitmap for the block.
	myBlock.highlightBitmap = new createjs.Bitmap(myBlock.protoblock.artwork.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('block_label', block_label).replace('top_label', top_label).replace('bottom_label', bottom_label));
	myBlock.container.addChild(myBlock.highlightBitmap);
	myBlock.highlightBitmap.x = 0;
	myBlock.highlightBitmap.y = 0;
	myBlock.highlightBitmap.scaleX = 1;
	myBlock.highlightBitmap.scaleY = 1;
	myBlock.highlightBitmap.scale = 1;
	myBlock.highlightBitmap.name = 'bmp_highlight_' + thisBlock;
	myBlock.highlightBitmap.cursor = 'pointer';
	// Hide it to start
	myBlock.highlightBitmap.visible = false;

	// Value blocks get a modifiable text label
	if (myBlock.isValueBlock() && myBlock.name != 'media') {
	    if (myBlock.value == null) {
		if (myBlock.name == 'text') {
		    myBlock.value = '---';
		} else {
		    myBlock.value = 100;
		}
	    }
	    myBlock.text = new createjs.Text(myBlock.value.toString(), '20px Arial', '#00000');
	    myBlock.text.textAlign = 'center';
	    myBlock.text.x = 100;
            myBlock.text.textBaseline = 'alphabetic';
	    myBlock.container.addChild(myBlock.text);
	    myBlock.text.x = 70 + myBlock.bitmap.x;
	    myBlock.text.y = 27 + myBlock.bitmap.y;
	    myBlock.text.scaleX = myBlock.text.scaleY = myBlock.text.scale = 1;
            // myBlock.container.updateCache();
	}

	// Expandable blocks also have some extra parts.
	if (myBlock.isExpandableBlock()) {
	    if (myBlock.isArgBlock()) {
		var bottomArtwork = ARG2BLOCKBOTTOM;
	    } else if (myBlock.isSpecialBlock()) {
		var bottomArtwork = BASICBLOCK2ARGBOTTOM;
	    } else if (myBlock.protoblock.palette.name == 'flow') {
		var bottomArtwork = FLOWCLAMPBOTTOM;
	    } else {
		var bottomArtwork = ACTIONCLAMPBOTTOM;
	    }
	    var yoff = myBlock.protoblock.yoff;
	    myBlock.fillerBitmaps = [];
	    myBlock.bottomBitmap = null;
	    myBlock.bottomBitmap = new createjs.Bitmap(bottomArtwork.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('bottom_label', bottom_label));
	    myBlock.container.addChild(myBlock.bottomBitmap);
	    myBlock.bottomBitmap.x = myBlock.bitmap.x;
	    myBlock.bottomBitmap.y = myBlock.bitmap.y + yoff;
	    myBlock.bottomBitmap.scaleX = 1;
	    myBlock.bottomBitmap.scaleY = 1;
	    myBlock.bottomBitmap.scale = 1;
	    myBlock.bottomBitmap.name = 'bmp_' + thisBlock + '_bottom';

	    myBlock.highlightBottomBitmap = new createjs.Bitmap(bottomArtwork.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('bottom_label', bottom_label));
	    myBlock.container.addChild(myBlock.highlightBottomBitmap);
	    myBlock.highlightBottomBitmap.x = myBlock.bitmap.x;
	    myBlock.highlightBottomBitmap.y = myBlock.bitmap.y + yoff;
	    myBlock.highlightBottomBitmap.scaleX = 1;
	    myBlock.highlightBottomBitmap.scaleY = 1;
	    myBlock.highlightBottomBitmap.scale = 1;
	    myBlock.highlightBottomBitmap.name = 'bmp_' + thisBlock + '_highlight_bottom';
	    myBlock.highlightBottomBitmap.visible = false;
	}
	myBlock.bounds = myBlock.container.getBounds();
	myBlock.container.cache(myBlock.bounds.x, myBlock.bounds.y, myBlock.bounds.width, myBlock.bounds.height);
        // console.log(myTurtle.bitmap.getCacheDataURL());
    }

    this.unhighlight = function() {
	if (!this.visible) {
	    return;
	}
	if (this.highlightedBlock != null) {
	    var myBlock = this.blockList[this.highlightedBlock];
	    myBlock.bitmap.visible = true;
	    myBlock.highlightBitmap.visible = false;
	    if (this.blockList[this.highlightedBlock].isExpandableBlock()) {
		for (var i = 0; i < myBlock.fillerBitmaps.length; i++) {
		    myBlock.fillerBitmaps[i].visible = true;
		    myBlock.highlightFillerBitmaps[i].visible = false;
		}
		if (myBlock.bottomBitmap != null) {
		    myBlock.bottomBitmap.visible = true;
		    myBlock.highlightBottomBitmap.visible = false;
		}
	    }
	    myBlock.container.updateCache();
	    this.refreshCanvas();
	}
	this.highlightedBlock = null;
    }

    this.highlight = function(blk) {
	if (!this.visible) {
	    return;
	}
	if (blk != null) {
	    this.unhighlight();
	    var myBlock = this.blockList[blk];
	    myBlock.bitmap.visible = false;
	    myBlock.highlightBitmap.visible = true;
	    if (myBlock.isExpandableBlock()) {
		for (var i = 0; i < myBlock.fillerBitmaps.length; i++) {
		    myBlock.fillerBitmaps[i].visible = false;
		    myBlock.highlightFillerBitmaps[i].visible = true;
		}
		if (myBlock.bottomBitmap != null) {
		    myBlock.bottomBitmap.visible = false;
		    myBlock.highlightBottomBitmap.visible = true;
		}
	    }
	    myBlock.container.updateCache();
	    this.highlightedBlock = blk;
	    this.refreshCanvas();
	}
    }

    this.hide = function() {
	for (var blk in this.blockList) {
	    this.blockList[blk].hide();
	}
	this.visible = false;
    }

    this.show = function() {
	for (var blk in this.blockList) {
	    this.blockList[blk].show();
	}
	this.visible = true;
    }

    this.makeNewBlockWithConnections = function(name, blockOffset, connections) {
	myBlock = this.makeNewBlock(name);
	if (myBlock == null) {
	    console.log('could not make block ' + name);
	    return;
	}
	for (var c in connections) {
	    if (c == myBlock.docks.length) {
		console.log('block ' + myBlock.name + ' had an extra connection: ' + connections[c]);
		break;
	    }
	    if (connections[c] == null) {
		myBlock.connections.push(null);
	    } else {
		myBlock.connections.push(connections[c] + blockOffset);
	    }
	}
    }

    this.makeNewBlock = function(name) {
	// Create a new block
	console.log('makeNewBlock: (' + name + ')');
	if (!name in this.protoBlockDict) {
	    console.log('makeNewBlock: no prototype for ' + name);
	    return null;
	}
	this.blockList.push(new Block(this.protoBlockDict[name]));

	// We copy the dock because expandable blocks modify it.
	var myBlock = last(this.blockList);
	myBlock.copyDocks();
	myBlock.copySize();

	// We need a container for the block graphics.
	myBlock.container = new createjs.Container();
	this.stage.addChild(myBlock.container);

	// and we need to load the images into the container.
	console.log('calling image load for ' + myBlock.name);
	this.imageLoad(myBlock);
	loadEventHandlers(this, myBlock);
	return myBlock;
    }

    this.makeBlock = function(name, arg) {
	// Make a new block from a proto block.
	// Called from palettes (and eventually from the load block).
	console.log('makeBlock: ' + name + ' ' + arg);
	for (var proto in this.protoBlockDict) {
	    if (this.protoBlockDict[proto].name == name) {
		if (arg == '__NOARG__') {
		    this.makeNewBlock(proto);
		    break;
		} else {
		    if (this.protoBlockDict[proto].defaults[0] == arg) {
			this.makeNewBlock(proto);
			break;
		    }
		}
	    }
	}
	// Each start block gets its own turtle.
	if (name == 'start') {
	    this.turtles.add();
	}

	var blk = this.blockList.length - 1;
	var myBlock = this.blockList[blk];
	for (var i = 0; i < myBlock.docks.length; i++) {
	    myBlock.connections.push(null);
	}

	// Attach default args if any
	console.log('makeBlock docks: ' + myBlock.docks);
	var cblk = blk + 1;
	for (var i = 0; i < myBlock.protoblock.defaults.length; i++) {
	    var value = myBlock.protoblock.defaults[i];
	    if (myBlock.docks[i + 1][2] == 'textin') {
		this.makeNewBlock('text');
		last(this.blockList).value = value;
		if (value == null) {
		    last(this.blockList).text.text = '---';
		} else {
		    last(this.blockList).text.text = value.toString();
		}
	    } else if (myBlock.docks[i + 1][2] == 'mediain') {
		this.makeNewBlock('media');
		last(this.blockList).value = value;
	    } else {
		this.makeNewBlock('number');
		last(this.blockList).value = value;
		last(this.blockList).text.text = value.toString();
	    }
	    var myConnectionBlock = this.blockList[cblk + i];
	    myConnectionBlock.connections = [blk];
	    if (myBlock.name == 'action') {
		// Make sure we don't make two actions with the same name.
		value = this.findUniqueActionName('action');
		if (value != 'action') {
		    myConnectionBlock.text.text = value;
		    this.newDoBlock(value);
		    this.palettes.updatePalettes();
		}
	    }
	    myConnectionBlock.value = value;
	    myBlock.connections[i + 1] = cblk + i;
	}
	
	// Generate and position the block bitmaps and labels
	this.updateBlockImages();
	this.updateBlockLabels();
	this.adjustDocks(blk, true);
	this.refreshCanvas();

	return blk;
    }

    this.findDragGroup = function(blk) {
	// Generate a drag group from blocks connected to blk
	this.dragGroup = [];
	this.calculateDragGroup(blk);
    }

    this.calculateDragGroup = function(blk) {
	// Give a block, find all the blocks connected to it
	if (blk == null) {
	    return;
	}

	// If this happens, something is really broken.
	if (this.blockList[blk] == null) {
	    console.log('null block encountered... this is bad.');
	    return;
	}

	// As before, does these ever happen?
	if (this.blockList[blk].connections == null) {
	    return;
	}

	if (this.blockList[blk].connections.length == 0) {
	    return;
	}

	this.dragGroup.push(blk);

	for (var c = 1; c < this.blockList[blk].connections.length; c++) {
	    var cblk = this.blockList[blk].connections[c];
	    if (cblk != null) {
		// Recurse
		this.calculateDragGroup(cblk);
	    }
	}
    }

    this.findUniqueActionName = function(name) {
	// Make sure we don't make two actions with the same name.
	var actionNames = [];
	for (var blk = 0; blk < this.blockList.length; blk++) {
	    if (this.blockList[blk].name == 'text') {
		var c = this.blockList[blk].connections[0];
		if (c != null && this.blockList[c].name == 'action') {
		    actionNames.push(this.blockList[blk].value);
		}
	    }
	}

	if (actionNames.length == 1) {
	    return name;
	}

	var i = 1;
	var value = name;
	while (actionNames.indexOf(value) != -1) {
	    console.log('does ' + value + ' = ' + name + i.toString() + '?');
	    value = name + i.toString();
	    i += 1;
	}
	return value;
    }

    this.renameBoxes = function(oldName, newName) {
	for (blk = 0; blk < this.blockList.length; blk++) {
	    if (this.blockList[blk].name == 'text') {
		var c = this.blockList[blk].connections[0];
		if (c != null && this.blockList[c].name == 'box') {
		    if (this.blockList[blk].value == oldName) {
			this.blockList[blk].value = newName;
			this.blockList[blk].text.text = newName;
			this.blockList[blk].label.value = newName;
		    }
		}
	    }
	}
    }

    this.renameDos = function(oldName, newName) {
	for (blk = 0; blk < this.blockList.length; blk++) {
	    if (this.blockList[blk].name == 'text') {
		var c = this.blockList[blk].connections[0];
		if (c != null && this.blockList[c].name == 'do') {
		    if (this.blockList[blk].value == oldName) {
			this.blockList[blk].value = newName;
			this.blockList[blk].text.text = newName;
			this.blockList[blk].label.value = newName;
		    }
		}
	    }
	}
    }

    this.newStoreinBlock = function(name) {
	var myStoreinBlock = new ProtoBlock('storein');
	this.protoBlockDict['myStorein'] = myStoreinBlock;
	myStoreinBlock.palette = this.palettes.dict['blocks'];
	myStoreinBlock.twoArgBlock();
	myStoreinBlock.defaults.push(name);
	myStoreinBlock.defaults.push(100);
	myStoreinBlock.docks = [[20, 0, 'out'], [98, 20, 'textin'],
				[98, 62, 'numberin'], [20, 84, 'in']];
	if (name == 'box') {
	    return;
	}
	myStoreinBlock.palette.add(myStoreinBlock);
    }

    this.newBoxBlock = function(name) {
	var myBoxBlock = new ProtoBlock('box');
	this.protoBlockDict['myBox'] = myBoxBlock;
	myBoxBlock.palette = this.palettes.dict['blocks'];
	myBoxBlock.args = 1;
	myBoxBlock.defaults.push(name);
	myBoxBlock.style = 'arg';
	myBoxBlock.docks = [[0, 20, 'numberout'], [68, 20, 'textin']];
	if (name == 'box') {
	    return;
	}
	myBoxBlock.palette.add(myBoxBlock);
    }
    
    this.newDoBlock = function(name) {
	var myDoBlock = new ProtoBlock('do');
	this.protoBlockDict['myDo'] = myDoBlock;
	myDoBlock.palette = this.palettes.dict['blocks'];
	myDoBlock.args = 1;
	myDoBlock.defaults.push(name);
	myDoBlock.docks = [[20, 0, 'out'], [98, 20, 'textin'], [20, 42, 'in']];
	if (name == 'action') {
	    return;
	}
	myDoBlock.palette.add(myDoBlock);
    }

    this.newActionBlock = function(name) {
	var myActionBlock = new ProtoBlock('action');
	this.protoBlockDict['myAction'] = myActionBlock;
	myActionBlock.palette = this.palettes.dict['blocks'];
	myActionBlock.yoff = 86;
	myActionBlock.loff = 42;
	myActionBlock.args = 1;
	myActionBlock.defaults.push(name);
	myActionBlock.expandable = true;
	myActionBlock.style = 'clamp';
	myActionBlock.docks = [[20, 0, 'unavailable'], [98, 34, 'textin'],
			       [38, 55, 'in'], [20, 80, 'unavailable']];
	if (name == 'action') {
	    return;
	}
	myActionBlock.palette.add(myActionBlock);
    }

    this.insideExpandableBlock = function(blk) {
	// Returns a containing expandable block or null
	if (this.blockList[blk].connections[0] == null) {
	    return null;
	} else {
	    var cblk = this.blockList[blk].connections[0];
	    if (this.blockList[cblk].isExpandableBlock()) {
		// If it is the last connection, keep searching.
		if (blk == last(this.blockList[cblk].connections)) {
		    return this.insideExpandableBlock(cblk);
		} else {
		    return cblk;
		}
	    } else {
		return this.insideExpandableBlock(cblk);
	    }
	}
    }

    this.load = function(blockObjs) {
	// Append to the current set of blocks.
	var adjustTheseDocks = [];
	var blockOffset = this.blockList.length;

	for(var b = 0; b < blockObjs.length; b++) {
	    var thisBlock = blockOffset + b;
	    var blkData = blockObjs[b];
	    if (typeof(blkData[1]) == 'string') {
		var name = blkData[1];
		var value = null;
	    } else {
		var name = blkData[1][0];
		var value = blkData[1][1];
	    }

	    console.log(thisBlock + ' ' + name + ' ' + value + ' ' + blkData[4]);

	    if (name in NAMEDICT) {
		name = NAMEDICT[name];
	    }
	    // console.log(name);
	    switch(name) {
		// A few special cases.
	    case 'start':
		blkData[4][0] = null;
		blkData[4][2] = null;
		this.makeNewBlockWithConnections('start', blockOffset, blkData[4]);
		this.turtles.add();
		break;
	    case 'action':
	    case 'hat':
		blkData[4][0] = null;
		blkData[4][3] = null;
		this.makeNewBlockWithConnections('action', blockOffset, blkData[4]);
		break;

		// Value blocks need a default value set.
	    case 'number':
	    case 'text':
		this.makeNewBlockWithConnections(name, blockOffset, blkData[4]);
		this.blockList[thisBlock].value = value;
		this.updateBlockText(thisBlock);
		break;

		// Define some constants for backward compatibility
	    case 'red':
	    case 'white':
		this.makeNewBlockWithConnections('number', blockOffset, blkData[4]);
		this.blockList[thisBlock].value = 0;
		this.updateBlockText(thisBlock);
		break;
	    case 'orange':
		this.makeNewBlockWithConnections('number', blockOffset, blkData[4]);
		this.blockList[thisBlock].value = 10;
		this.updateBlockText(thisBlock);
		break;
	    case 'yellow':
		this.makeNewBlockWithConnections('number', blockOffset, blkData[4]);
		this.blockList[thisBlock].value = 20;
		this.updateBlockText(thisBlock);
		break;
	    case 'green':
		this.makeNewBlockWithConnections('number', blockOffset, blkData[4]);
		this.blockList[thisBlock].value = 40;
		this.updateBlockText(thisBlock);
		break;
	    case 'blue':
		this.makeNewBlockWithConnections('number', blockOffset, blkData[4]);
		this.blockList[thisBlock].value = 70;
		this.updateBlockText(thisBlock);
		break;
	    case 'leftpos':
		this.makeNewBlockWithConnections('number', blockOffset, blkData[4]);
		this.blockList[thisBlock].value = -(canvas.width / 2);
		this.updateBlockText(thisBlock);
		break;
	    case 'rightpos':
		this.makeNewBlockWithConnections('number', blockOffset, blkData[4]);
		this.blockList[thisBlock].value = (canvas.width / 2);
		this.updateBlockText(thisBlock);
		break;
	    case 'toppos':
		this.makeNewBlockWithConnections('number', blockOffset, blkData[4]);
		this.blockList[thisBlock].value = (canvas.height / 2);
		this.updateBlockText(thisBlock);
		break;
	    case 'botpos':
	    case 'bottompos':
		this.makeNewBlockWithConnections('number', blockOffset, blkData[4]);
		this.blockList[thisBlock].value = -(canvas.height / 2);
		this.updateBlockText(thisBlock);
		break;
	    case 'width':
		this.makeNewBlockWithConnections('number', blockOffset, blkData[4]);
		this.blockList[thisBlock].value = canvas.width;
		this.updateBlockText(thisBlock);
		break;
	    case 'height':
		this.makeNewBlockWithConnections('number', blockOffset, blkData[4]);
		this.blockList[thisBlock].value = canvas.height;
		this.updateBlockText(thisBlock);
		break;

		//
	    default:
		this.makeNewBlockWithConnections(name, blockOffset, blkData[4]);
                break;
	    }
	    if (thisBlock == this.blockList.length - 1) {
		if (this.blockList[thisBlock].connections[0] == null) {
		    this.blockList[thisBlock].x = blkData[2];
		    this.blockList[thisBlock].y = blkData[3];
		    adjustTheseDocks.push(thisBlock);
		}
	    }
	}
	this.updateBlockImages();
	this.updateBlockLabels();
	for (var blk = 0; blk < adjustTheseDocks.length; blk++) {
	    this.loopCounter = 0;
	    this.adjustDocks(adjustTheseDocks[blk]);
	}
	
	update = true;
	
	// We need to wait for the blocks to load before expanding them.
	setTimeout(function(){blockBlocks.expandClamps();}, 1000); 
	setTimeout(function(){blockBlocks.expand2Args();}, 2000); 
    }

    blockBlocks = this;
    return this;
}


// Define block instance objects and any methods that are intra-block.
function Block (protoblock) {
    if (protoblock == null) {
	console.log('null protoblock sent to Block');
	return;
    }
    this.protoblock = protoblock;
    this.name = protoblock.name;
    this.x = 0;
    this.y = 0;
    this.trash = false;  // Is this block in the trash?
    this.label = null;  // Editable textview in DOM.
    this.text = null;  // A dynamically generated text label on block itself.
    this.value = null; // Value for number, text, and media blocks.

    // All blocks have at a container and least one bitmap.
    this.container = null;
    this.bounds = null;
    this.bitmap = null;
    this.highlightBitmap = null;

    // Expandable block features.
    this.fillerBitmaps = [];
    this.bottomBitmap = null;
    this.highlightFillerBitmaps = [];
    this.highlightBottomBitmap = null;

    this.size = 1;  // Proto size is copied here.
    this.docks = [];  // Proto dock is copied here.
    this.connections = [];  // Blocks that cannot be run on their own.

    this.copySize = function() {
	this.size = this.protoblock.size;
    }

    this.copyDocks = function() {
	for (var i in this.protoblock.docks) {
	    var dock = [this.protoblock.docks[i][0], this.protoblock.docks[i][1], this.protoblock.docks[i][2]];
	    this.docks.push(dock);
	}
	if (this.protoblock.name == 'forward') {
	    console.log('copyDocks from ' + this.protoblock.docks);
	    console.log('copyDocks to ' + this.docks);
	}
    }

    this.getInfo = function() {
	return this.name + ' block';
    }

    this.hide = function() {
	this.container.visible = false;
    }

    this.show = function() {
	if (!this.trash) {
	    this.container.visible = true;
	}
    }

    // Utility functions
    this.isValueBlock = function() {
	return this.protoblock.style == 'value';
    }

    this.isArgBlock = function() {
	return this.protoblock.style == 'value' || this.protoblock.style == 'arg';
    }

    this.isSpecialBlock = function() {
	return this.protoblock.style == 'special';
    }

    this.isClampBlock = function() {
	return this.protoblock.style == 'clamp';
    }

    this.isNoRunBlock = function() {
	return this.name in ['action'];
    }

    this.isExpandableBlock = function() {
	return this.protoblock.expandable;
    }

    // Based on the block index into the blockList.
    this.getBlockId = function() {
	var number = blockBlocks.blockList.indexOf(this);
	return '_' + number.toString();
    }
}

function $() {
    var elements = new Array();

    for (var i = 0; i < arguments.length; i++) {
	var element = arguments[i];
	if (typeof element == 'string')
	    element = docById(element);
	if (arguments.length == 1)
	    return element;
	elements.push(element);
    }
    return elements;
}

// A place in the DOM to put modifiable labels (textareas).
var labelElem = docById('labelDiv');

// Update the block values as they change in the DOM label
function labelChanged() {
    // For some reason, arg passing from the DOM is not working
    // properly, so we need to find the label that changed.

    var blocks = blockBlocks;
    var myBlock = null;
    var oldValue = '';
    var newValue = '';
    for (var blk = 0 ; blk < blocks.blockList.length ; blk++) {
	if (blocks.blockList[blk].name == 'text') {
	    if (blocks.blockList[blk].value != blocks.blockList[blk].label.value) {
		myBlock = blocks.blockList[blk];
		oldValue = myBlock.value;
		newValue = myBlock.label.value;
		break;
	    }
	}
	if (blocks.blockList[blk].name == 'number') {
	    if (blocks.blockList[blk].value != blocks.blockList[blk].label.value) {
		myBlock = blocks.blockList[blk];
		oldValue = myBlock.value;
		newValue = myBlock.label.value;
		break;
	    }
	}
    }

    if (myBlock == null) {
	console.log('cannot find the label that changed');
	return;
    } else {
	// console.log('label changed on ' + myBlock.name);
    }

    // Update the block value and label.
    if (myBlock.label != null) {
	myBlock.value = myBlock.label.value;
	myBlock.text.text = myBlock.value.toString();
	// and hide the DOM textview...
	myBlock.label.style.display = 'none';
	// Make sure text is on top.
	lastChild = last(myBlock.container.children);
	myBlock.container.swapChildren(myBlock.text, lastChild);
        // myBlock.container.updateCache();
	blocks.refreshCanvas();
    }

    // TODO: Garbage collection in palette (remove old proto block)
    // TODO: Don't allow duplicate action names
    var c = myBlock.connections[0];
    if (myBlock.name == 'text' && c != null) {
	var cblock = blocks.blockList[c];
	switch (cblock.name) {
	case 'action':
	    // If the label was the name of an action, update the
	    // associated run blocks and the palette buttons
	    if (myBlock.value != 'action') {
		blocks.newDoBlock(myBlock.value);
	    }
	    blocks.renameDos(oldValue, newValue);
	    blocks.palettes.updatePalettes();
	    break;
	case 'storein':
	    // If the label was the name of a storein, update the
	    //associated box blocks and the palette buttons
	    if (myBlock.value != 'box') {
		blocks.newStoreinBlock(myBlock.value);
		blocks.newBoxBlock(myBlock.value);
	    }
	    blocks.renameBoxes(oldValue, newValue);
	    blocks.palettes.updatePalettes();
	    break;
	}
    }
}

// Open a file from the DOM.
function doOpenMedia(blocks, thisBlock) {
    var fileChooser = docById("myMedia");
    fileChooser.addEventListener("change", function(event) {
	var filename;
	var reader = new FileReader();
	reader.onloadend = (function () {
	    if (reader.result) {
		// console.log(reader);
		var dataURL = reader.result;
		blocks.blockList[thisBlock].value = reader.result
		filename = reader.result;
		// console.log('reader.result ' + filename);
		var image = new Image();
		if (blocks.blockList[thisBlock].container.children.length > 2) {
		    blocks.blockList[thisBlock].container.removeChild(last(blocks.blockList[thisBlock].container.children));
		}
		image.src = filename;
		var bitmap = new createjs.Bitmap(image);
		blocks.blockList[thisBlock].container.addChild(bitmap);
		if (image.width > image.height) {
		    bitmap.scaleX = 100 / image.width;
		    bitmap.scaleY = 100 / image.width;
		    bitmap.scale = 100 / image.width;
		} else {
		    bitmap.scaleX = 80 / image.height;
		    bitmap.scaleY = 80 / image.height;
		    bitmap.scale = 80 / image.height;
		}
		bitmap.x = 30;
		bitmap.y = 10;
		// blocks.blockList[thisBlock].container.updateCache();
		update = true;
	    }
	});
	reader.readAsDataURL(fileChooser.files[0]);
    }, false);

    fileChooser.focus();
    fileChooser.click();
}

// These are the event handlers for block containers.
function loadEventHandlers(blocks, myBlock) {
    var thisBlock = blocks.blockList.indexOf(myBlock);
    // Create a shape that represents the center of the icon.
    
    var hitArea = new createjs.Shape();
    // Position hitArea relative to the internal coordinate system
    // of the container.
    // FIXME: Why is image width/height == 0???
    var w2 = 100; // myBlock.image.width / 2;
    var h2 = 42; // myBlock.image.height / 2;
    hitArea.graphics.beginFill('#FFF').drawEllipse(-w2 / 2, -h2 / 2, w2, h2);
    hitArea.x = w2 / 2;
    hitArea.y = h2 / 2;
    myBlock.container.hitArea = hitArea;
    
    myBlock.container.on('mouseover', function(event) {
	blocks.highlight(thisBlock);
	blocks.activeBlock = thisBlock;
	blocks.refreshCanvas();
    });
    
    var moved = false;
    myBlock.container.on('click', function(event) {
	if (!moved) {
	    if (myBlock.name == 'media') {
		doOpenMedia(blocks, thisBlock);
	    } else if (myBlock.isValueBlock() && myBlock.name != 'media') {
		myBlock.label.style.display = '';
	    } else {
		var topBlock = blocks.findTopBlock(thisBlock);
		blocks.runLogo(topBlock);
	    }
	}
    });
    
    myBlock.container.on('mousedown', function(event) {
	// Bump the bitmap in front of its siblings.
	blocks.stage.swapChildren(myBlock.container, last(blocks.stage.children));
	
	moved = false;
	var offset = {
	    x: myBlock.container.x - event.stageX,
	    y: myBlock.container.y - event.stageY
	};
	
	myBlock.container.on('pressup', function(event) {
	});
	
	myBlock.container.on('pressmove', function(event) {
	    moved = true;
	    var oldX = myBlock.container.x;
	    var oldY = myBlock.container.y;
	    myBlock.container.x = event.stageX + offset.x;
	    myBlock.container.y = event.stageY + offset.y;
	    myBlock.x = myBlock.container.x;
	    myBlock.y = myBlock.container.y;
	    myBlock.y = event.stageY + offset.y;
	    var dx = myBlock.container.x - oldX;
	    var dy = myBlock.container.y - oldY;
	    
	    if (myBlock.isValueBlock() && myBlock.name != 'media') {
		// Ensure text is on top
		var lastChild = last(myBlock.container.children);
		myBlock.container.swapChildren(myBlock.text, lastChild);
	    }
	    
	    // Move the label.
	    blocks.adjustLabelPosition(thisBlock, myBlock.container.x, myBlock.container.y);
	    
	    // Move any connected blocks.
	    blocks.findDragGroup(thisBlock)
	    if (blocks.dragGroup.length > 0) {
		for (var b = 0; b < blocks.dragGroup.length; b++) {
		    blk = blocks.dragGroup[b];
		    if (b != 0) {
			blocks.moveBlockRelative(blk, dx, dy);
		    }
		}
	    }
	    blocks.refreshCanvas();
	});
    });
    
    myBlock.container.on('mouseup',function(event) {
    });

    myBlock.container.on('mouseout',function(event) {
	if (moved) {
	    // Check if block is in the trash
	    if (trashcan.overTrashcan(event.stageX, event.stageY)) {
		// disconnect block
		var b = myBlock.connections[0];
		if (b != null) {
		    for (var c in blocks.blockList[b].connections) {
			if (blocks.blockList[b].connections[c] == thisBlock) {
			    blocks.blockList[b].connections[c] = null;
			    break;
			}
		    }
		    myBlock.connections[0] = null;
		}
		myBlock.connections[0] = null;
		// put drag group in trash
		blocks.findDragGroup(thisBlock);
		for (var b = 0; b < blocks.dragGroup.length; b++) {
		    blk = blocks.dragGroup[b];
		    console.log('putting ' + blocks.blockList[blk].name + ' in the trash');
		    blocks.blockList[blk].trash = true;
		    blocks.blockList[blk].hide();
		    blocks.refreshCanvas();
		}
	    } else {
		// otherwise, process move
		blocks.blockMoved(thisBlock);
	    }
	}
	if (blocks.activeBlock != myBlock) {
	    return;
	}
	blocks.unhighlight();
	blocks.activeBlock = null;
	blocks.refreshCanvas();
    });
}

function initProtoBlocks(palettes, blocks) {
    blocks.palettes = palettes;

    // Turtle palette
    var clearBlock = new ProtoBlock('clear');
    clearBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['clear'] = clearBlock;
    clearBlock.zeroArgBlock();
    clearBlock.staticLabels.push('clear');
    
    var forwardBlock = new ProtoBlock('forward');
    forwardBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['forward'] = forwardBlock;
    forwardBlock.oneArgBlock();
    forwardBlock.staticLabels.push('forward');
    forwardBlock.defaults.push(100);

    var rightBlock = new ProtoBlock('right');
    rightBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['right'] = rightBlock;
    rightBlock.oneArgBlock();
    rightBlock.staticLabels.push('right');
    rightBlock.defaults.push(90);
    
    var backBlock = new ProtoBlock('back');
    backBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['back'] = backBlock;
    backBlock.oneArgBlock();
    backBlock.staticLabels.push('back');
    backBlock.defaults.push(100);
    
    var leftBlock = new ProtoBlock('left');
    leftBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['left'] = leftBlock;
    leftBlock.oneArgBlock();
    leftBlock.staticLabels.push('left');
    leftBlock.defaults.push(90);
    
    var arcBlock = new ProtoBlock('arc');
    arcBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['arc'] = arcBlock;
    arcBlock.twoArgBlock();
    arcBlock.defaults.push(90);
    arcBlock.defaults.push(100);
    arcBlock.staticLabels.push('arc');
    arcBlock.staticLabels.push('angle');
    arcBlock.staticLabels.push('radius');
    arcBlock.docks[1][2] = 'numberin';  // override default
    
    var setheadingBlock = new ProtoBlock('setheading');
    setheadingBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['setheading'] = setheadingBlock;
    setheadingBlock.oneArgBlock();
    setheadingBlock.staticLabels.push('set heading');
    setheadingBlock.defaults.push(0);
    
    var headingBlock = new ProtoBlock('heading');
    headingBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['heading'] = headingBlock;
    headingBlock.parameterBlock();
    headingBlock.staticLabels.push('heading');
    
    var setxyBlock = new ProtoBlock('setxy');
    setxyBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['setxy'] = setxyBlock;
    setxyBlock.twoArgBlock();
    setxyBlock.defaults.push(0);
    setxyBlock.defaults.push(0);
    setxyBlock.staticLabels.push('set xy');
    setxyBlock.staticLabels.push('x');
    setxyBlock.staticLabels.push('y');
    setxyBlock.docks[1][2] = 'numberin';  // override default
    
    var xBlock = new ProtoBlock('x');
    xBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['x'] = xBlock;
    xBlock.parameterBlock();
    xBlock.staticLabels.push('x');
    
    var yBlock = new ProtoBlock('y');
    yBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['y'] = yBlock;
    yBlock.parameterBlock();
    yBlock.staticLabels.push('y');

    var showBlock = new ProtoBlock('show');
    showBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['show'] = showBlock;
    showBlock.twoArgBlock();
    showBlock.defaults.push(24);
    showBlock.defaults.push('text');
    showBlock.staticLabels.push('show');
    showBlock.staticLabels.push('size');
    showBlock.staticLabels.push('text');
    showBlock.docks[1][2] = 'numberin';  // override default
    showBlock.docks[2][2] = 'textin';  // override default
    
    var imageBlock = new ProtoBlock('image');
    imageBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['image'] = imageBlock;
    imageBlock.twoArgBlock();
    imageBlock.defaults.push(100);
    imageBlock.defaults.push(null);
    imageBlock.staticLabels.push('show');
    imageBlock.staticLabels.push('size');
    imageBlock.staticLabels.push('image');
    imageBlock.docks[1][2] = 'numberin';  // override default
    imageBlock.docks[2][2] = 'mediain';  // override default
    
    var shellBlock = new ProtoBlock('turtleshell');
    shellBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['shell'] = shellBlock;
    shellBlock.twoArgBlock();
    shellBlock.defaults.push(55);
    shellBlock.defaults.push(null);
    shellBlock.staticLabels.push('shell');
    shellBlock.staticLabels.push('size');
    shellBlock.staticLabels.push('image');
    shellBlock.docks[1][2] = 'numberin';  // override default
    shellBlock.docks[2][2] = 'mediain';  // override default
    
    // Pen palette
    var setcolorBlock = new ProtoBlock('setcolor');
    setcolorBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setcolor'] = setcolorBlock;
    setcolorBlock.oneArgBlock();
    setcolorBlock.defaults.push(0);
    setcolorBlock.staticLabels.push('set color');

    var colorBlock = new ProtoBlock('color');
    colorBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['color'] = colorBlock;
    colorBlock.parameterBlock();
    colorBlock.staticLabels.push('color');
    
    var setshadeBlock = new ProtoBlock('setshade');
    setshadeBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setshade'] = setshadeBlock;
    setshadeBlock.oneArgBlock();
    setshadeBlock.defaults.push(50);
    setshadeBlock.staticLabels.push('set shade');
    
    var shadeBlock = new ProtoBlock('shade');
    shadeBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['shade'] = shadeBlock;
    shadeBlock.parameterBlock();
    shadeBlock.staticLabels.push('shade');
    
    var setchromaBlock = new ProtoBlock('setgrey');
    setchromaBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setchroma'] = setchromaBlock;
    setchromaBlock.oneArgBlock();
    setchromaBlock.defaults.push(100);
    setchromaBlock.staticLabels.push('set grey');

    var chromaBlock = new ProtoBlock('grey');
    chromaBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['chroma'] = chromaBlock;
    chromaBlock.parameterBlock();
    chromaBlock.staticLabels.push('grey');
    
    var setpensizeBlock = new ProtoBlock('setpensize');
    setpensizeBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setpensize'] = setpensizeBlock;
    setpensizeBlock.oneArgBlock();
    setpensizeBlock.defaults.push(5);
    setpensizeBlock.staticLabels.push('set pen');
    
    var pensizeBlock = new ProtoBlock('pensize');
    pensizeBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['pensize'] = pensizeBlock;
    pensizeBlock.parameterBlock();
    pensizeBlock.staticLabels.push('pen size');
    
    var penupBlock = new ProtoBlock('penup');
    penupBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['penup'] = penupBlock;
    penupBlock.zeroArgBlock();
    penupBlock.staticLabels.push('pen up');

    var pendownBlock = new ProtoBlock('pendown');
    pendownBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['pendown'] = pendownBlock;
    pendownBlock.zeroArgBlock();
    pendownBlock.staticLabels.push('pen down');
    
    var startfillBlock = new ProtoBlock('beginfill');
    startfillBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['startfill'] = startfillBlock;
    startfillBlock.zeroArgBlock();
    startfillBlock.staticLabels.push('start fill');
    
    var endfillBlock = new ProtoBlock('endfill');
    endfillBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['endfill'] = endfillBlock;
    endfillBlock.zeroArgBlock();
    endfillBlock.staticLabels.push('end fill');
    
    var backgroundBlock = new ProtoBlock('fillscreen');
    backgroundBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['background'] = backgroundBlock;
    backgroundBlock.zeroArgBlock();
    backgroundBlock.staticLabels.push('background');
    
    // Numbers palette
    var numberBlock = new ProtoBlock('number');
    numberBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['number'] = numberBlock;
    numberBlock.valueBlock();
    
    var randomBlock = new ProtoBlock('random');
    randomBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['random'] = randomBlock;
    randomBlock.twoArgMathBlock();
    randomBlock.defaults.push(0);
    randomBlock.defaults.push(100);
    // FIX ME: label doesn't fix
    randomBlock.staticLabels.push('random');
    randomBlock.staticLabels.push('min');
    randomBlock.staticLabels.push('max');

    var plusBlock = new ProtoBlock('plus');
    plusBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['plus'] = plusBlock;
    plusBlock.twoArgMathBlock();
    plusBlock.staticLabels.push('+');

    var minusBlock = new ProtoBlock('minus');
    minusBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['minus'] = minusBlock;
    minusBlock.twoArgMathBlock();
    minusBlock.staticLabels.push('–');

    var multiplyBlock = new ProtoBlock('multiply');
    multiplyBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['multiply'] = multiplyBlock;
    multiplyBlock.twoArgMathBlock();
    multiplyBlock.staticLabels.push('×');

    var divideBlock = new ProtoBlock('divide');
    divideBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['divide'] = divideBlock;
    divideBlock.twoArgMathBlock();
    divideBlock.staticLabels.push('/');

    var sqrtBlock = new ProtoBlock('sqrt');
    sqrtBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['sqrt'] = sqrtBlock;
    sqrtBlock.oneArgMathBlock();
    sqrtBlock.staticLabels.push('sqrt');
    
    var modBlock = new ProtoBlock('mod');
    modBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['mod'] = modBlock;
    modBlock.twoArgMathBlock();
    modBlock.staticLabels.push('mod');
    
    var greaterBlock = new ProtoBlock('greater');
    greaterBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['greater'] = greaterBlock;
    greaterBlock.boolean2ArgBlock();
    greaterBlock.staticLabels.push('>');
    
    var lessBlock = new ProtoBlock('less');
    lessBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['less'] = lessBlock;
    lessBlock.boolean2ArgBlock();
    lessBlock.staticLabels.push('<');
    
    var equalBlock = new ProtoBlock('equal');
    equalBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['equal'] = equalBlock;
    equalBlock.boolean2ArgBlock();
    equalBlock.staticLabels.push('=');

    // Blocks palette
    var mediaBlock = new ProtoBlock('media');
    mediaBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['media'] = mediaBlock;
    mediaBlock.valueBlock();
    mediaBlock.docks[0][2] = 'mediaout';
    
    var textBlock = new ProtoBlock('text');
    textBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['text'] = textBlock;
    textBlock.valueBlock();
    textBlock.docks[0][2] = 'textout';
    
    var storeinBlock = new ProtoBlock('storein');
    storeinBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['storein'] = storeinBlock;
    storeinBlock.twoArgBlock();
    storeinBlock.defaults.push('box');
    storeinBlock.defaults.push(100);
    storeinBlock.docks[1][2] = 'textin';
    storeinBlock.docks[2][2] = 'numberin';
    storeinBlock.staticLabels.push('store in');
    storeinBlock.staticLabels.push('name');
    storeinBlock.staticLabels.push('value');

    var boxBlock = new ProtoBlock('box');
    boxBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['box'] = boxBlock;
    boxBlock.oneArgBlock();
    boxBlock.defaults.push('box');
    boxBlock.staticLabels.push('box');
    boxBlock.docks[1][2] = 'textin';
    
    var actionBlock = new ProtoBlock('action');
    actionBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['action'] = actionBlock;
    actionBlock.blockClamp1ArgBlock();
    actionBlock.defaults.push('action');
    actionBlock.staticLabels.push('action');
        
    var doBlock = new ProtoBlock('do');
    doBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['do'] = doBlock;
    doBlock.oneArgBlock();
    doBlock.defaults.push('action');
    doBlock.staticLabels.push('do');
    doBlock.docks[1][2] = 'textin';
        
    var startBlock = new ProtoBlock('start');
    startBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['start'] = startBlock;
    startBlock.blockClamp0ArgBlock();
    startBlock.staticLabels.push('start');
    
    // Flow palette
    var repeatBlock = new ProtoBlock('repeat');
    repeatBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['repeat'] = repeatBlock;
    repeatBlock.flowClamp1ArgBlock();
    repeatBlock.staticLabels.push('repeat');
    repeatBlock.defaults.push(4);
    
    var ifBlock = new ProtoBlock('if');
    ifBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['if'] = ifBlock;
    ifBlock.flowClampBooleanArgBlock();
    ifBlock.staticLabels.push('if');
    ifBlock.staticLabels.push('then');
    
    var vspaceBlock = new ProtoBlock('vspace');
    vspaceBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['vspace'] = vspaceBlock;
    vspaceBlock.zeroArgBlock();
    // vspaceBlock.staticLabels.push('');
    
    // Sensors palette    
    var timeBlock = new ProtoBlock('time');
    timeBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['time'] = timeBlock;
    timeBlock.parameterBlock();
    timeBlock.staticLabels.push('time');

    var mousexBlock = new ProtoBlock('mousex');
    mousexBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['mousex'] = mousexBlock;
    mousexBlock.parameterBlock();
    mousexBlock.staticLabels.push('mouse x');

    var mouseyBlock = new ProtoBlock('mousey');
    mouseyBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['mousey'] = mouseyBlock;
    mouseyBlock.parameterBlock();
    mouseyBlock.staticLabels.push('mouse y');

    var mousebuttonBlock = new ProtoBlock('mousebutton');
    mousebuttonBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['mousebutton'] = mousebuttonBlock;
    mousebuttonBlock.boolean0ArgBlock()
    mousebuttonBlock.staticLabels.push('mouse button');

    // Extras palette
    var pubBlock = new ProtoBlock('publish');
    pubBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['publish'] = pubBlock;
    pubBlock.oneArgBlock();
    pubBlock.defaults.push('comment');
    pubBlock.staticLabels.push('publish');
    pubBlock.docks[1][2] = 'textin';

    var svgBlock = new ProtoBlock('savesvg');
    svgBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['savesvg'] = svgBlock;
    svgBlock.oneArgBlock();
    svgBlock.defaults.push('title');
    svgBlock.staticLabels.push('save svg');
    svgBlock.docks[1][2] = 'textin';

    var waitBlock = new ProtoBlock('wait');
    waitBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['wait'] = waitBlock;
    waitBlock.oneArgBlock();
    waitBlock.staticLabels.push('wait');
    waitBlock.defaults.push(1);

    // Push protoblocks onto their palettes.
    for (var protoblock in blocks.protoBlockDict) {
	blocks.protoBlockDict[protoblock].palette.add(blocks.protoBlockDict[protoblock]);
    }
    
    // Populate the lists of block types.
    blocks.findBlockTypes();
}
