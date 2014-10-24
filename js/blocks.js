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

// For DOM access
var blockBlocks = null;

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


// A place to put the block instances.
// The real workhorse.
function Blocks (canvas, stage, refreshCanvas, addTick, trashcan) {
    // Things we need from outside
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;
    this.addTick = addTick;
    this.trashcan = trashcan;

    // The proto blocks...
    this.protoBlockDict = {}
    // And a place to keep the blocks we create.
    this.blockList = [];

    // To avoid infinite loops in dock search
    this.loopCounter = 0;

    // We'll need a reference to the palettes.
    this.palettes = null;

    // Which block, if any, is highlighted?
    this.highlightedBlock = null;
    // Which block, if any, is active?
    this.activeBlock = null;
    // Are the blocks visible?
    this.blocksVisible = true;
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

    // Utility functions
    this.isValueBlock = function(blk) {
	if (blk == null) {
	    return false;
	}
	if (this.valueBlocks.indexOf(this.blockList[blk].name) != -1) {
	    return true;
	} else {
	    return false;
	}
    }

    this.isArgBlock = function(blk) {
	if (blk == null) {
	    return false;
	}
	if (this.argBlocks.indexOf(this.blockList[blk].name) != -1) {
	    return true;
	} else {
	    return false;
	}
    }

    this.isSpecialBlock = function(blk) {
	if (blk == null) {
	    return false;
	}
	if (this.specialBlocks.indexOf(this.blockList[blk].name) != -1) {
	    return true;
	} else {
	    return false;
	}
    }

    this.isClampBlock = function(blk) {
	if (blk == null) {
	    return false;
	}
	if (this.clampBlocks.indexOf(this.blockList[blk].name) != -1) {
	    return true;
	} else {
	    return false;
	}
    }

    this.isNoRunBlock = function(blk) {
	if (blk == null) {
	    return false;
	}
	if (this.noRunBlocks.indexOf(this.blockList[blk].name) != -1) {
	    return true;
	} else {
	    return false;
	}
    }

    this.isExpandableBlock = function(blk) {
	if (blk == null) {
	    return false;
	}
	if (this.blockList[blk] == null) {
	    console.log('null block??? ' + blk);
	    return false;
	}
	if (this.expandableBlocks.indexOf(this.blockList[blk].name) != -1) {
	    return true;
	} else {
	    return false;
	}
    }

    this.insideExpandableBlock = function(blk) {
	// Returns a containing expandable block or null
	if (this.blockList[blk].connections[0] == null) {
	    return null;
	} else {
	    var cblk = this.blockList[blk].connections[0];
	    if (this.isExpandableBlock(cblk)) {
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
    
	// TODO: expand arg blocks
	if (this.isArgBlock(blk)) {
	    return;
	}
    
	// TODO: expand special blocks
	if (this.isSpecialBlock(blk)) {
	    return;
	}
    
	// (1) count up the number of blocks inside the clamp;
	// always the second to last argument.
	var c = this.blockList[blk].connections.length - 2;
	var size = this.getStackSize(this.blockList[blk].connections[c]);
	if( size < 1 ) {
	    size = 1;  // Minimum clamp size
	}
    
	// (2) adjust the clamp size to match.
	var yoff = this.blockList[blk].protoblock.yoff;
	var loff = this.blockList[blk].protoblock.loff;
	var j = this.blockList[blk].fillerBitmaps.length;
	if (size < this.blockList[blk].fillerBitmaps.length + 1) {
	    var n = j - size + 1;  // one slot built in
	    for (var i = 0; i < n; i++) {
		this.removeFiller(blk);
		last(this.blockList[blk].docks)[1] -= loff;
	    }
            j = this.blockList[blk].fillerBitmaps.length;
	    var o = yoff + j * loff;
	    this.blockList[blk].bottomBitmap.y = this.blockList[blk].bitmap.y + o;
	    this.blockList[blk].highlightBottomBitmap.y = this.blockList[blk].bitmap.y + o;
	    if (last(this.blockList[blk].connections) != null) {
		this.loopCounter = 0;
		this.adjustDocks(blk);
	    }
	    this.refreshCanvas();
	} else if (size > this.blockList[blk].fillerBitmaps.length) {
	    var n = size - j - 1;  // one slot built in
	    for (var i = 0; i < n; i++) {
		var c = i + j;
		this.addFiller(blk, yoff + c * loff, c);
		last(this.blockList[blk].docks)[1] += loff;
	    }
            j = this.blockList[blk].fillerBitmaps.length;
	    var o = yoff + j * loff;
	    this.blockList[blk].bottomBitmap.y = this.blockList[blk].bitmap.y + o;
	    this.blockList[blk].highlightBottomBitmap.y = this.blockList[blk].bitmap.y + o;
	    if (last(this.blockList[blk].connections) != null) {
		this.loopCounter = 0;
		this.adjustDocks(blk);
	    }
	    this.refreshCanvas();
	}	    
    }

    this.getBlockSize = function(blk) {
	// TODO recurse on first arg
	return this.blockList[blk].size;
    }

    this.adjust2ArgBlock = function(blk) {
	// Adjust the size of a 2-arg block
	// (1) What the size of the first argument?
	var c = this.blockList[blk].connections[1];
	if (c == null) {
	    var size = 0;
	} else {
	    var size = this.getBlockSize(c);
	}
	if( size < 1 ) {
	    size = 1;  // Minimum size
	}
    
	// (2) adjust the block size to match.
	var yoff = this.blockList[blk].protoblock.yoff;
	var loff = this.blockList[blk].protoblock.loff;
	var j = this.blockList[blk].fillerBitmaps.length;
	if (size < this.blockList[blk].fillerBitmaps.length + 1) {
	    var n = j - size + 1;  // one slot built in
	    for (var i = 0; i < n; i++) {
		this.removeFiller(blk);
		this.blockList[blk].docks[2][1] -= loff;
		if (!isArgBlock(blk)) {
		    this.blockList[blk].docks[3][1] -= loff;
		}
		this.blockList[blk].size -= 1;
	    }
            j = this.blockList[blk].fillerBitmaps.length;
	    var o = yoff + j * loff;
	    this.blockList[blk].bottomBitmap.y = this.blockList[blk].bitmap.y + o;
	    this.blockList[blk].highlightBottomBitmap.y = this.blockList[blk].bitmap.y + o;
	    if (this.isArgBlock(blk)) {
		if (this.blockList[blk].connections[2] != null) {
		    this.loopCounter = 0;
		    this.adjustDocks(blk);
		}
	    } else {
		if (this.blockList[blk].connections[2] != null) {
		    this.loopCounter = 0;
		    this.adjustDocks(blk);
		} else if (this.blockList[blk].connections[3] != null) {
		    this.loopCounter = 0;
		    this.adjustDocks(blk);
		}
	    }
	    this.refreshCanvas();
	} else if (size > this.blockList[blk].fillerBitmaps.length) {
	    var n = size - j - 1;  // one slot built in
	    for (var i = 0; i < n; i++) {
		var c = i + j;
		this.addFiller(blk, yoff + c * loff, c);
		this.blockList[blk].docks[2][1] += loff;
		if (!isArgBlock(blk)) {
		    this.blockList[blk].docks[3][1] += loff;
		}
		this.blockList[blk].size += 1;
	    }
            j = this.blockList[blk].fillerBitmaps.length;
	    var o = yoff + j * loff;
	    this.blockList[blk].bottomBitmap.y = this.blockList[blk].bitmap.y + o;
	    this.blockList[blk].highlightBottomBitmap.y = this.blockList[blk].bitmap.y + o;
	    if (this.isArgBlock(blk)) {
		if (this.blockList[blk].connections[2] != null) {
		    this.loopCounter = 0;
		    this.adjustDocks(blk);
		}
	    } else {
		if (this.blockList[blk].connections[2] != null) {
		    this.loopCounter = 0;
		    this.adjustDocks(blk);
		} else if (this.blockList[blk].connections[3] != null) {
		    this.loopCounter = 0;
		    this.adjustDocks(blk);
		}
	    }
	    this.refreshCanvas();
	}
    }

    this.removeFiller = function(blk) {
	var fillerBitmap = this.blockList[blk].fillerBitmaps.pop();
	this.blockList[blk].container.removeChild(fillerBitmap);
	if (this.findBitmap(fillerBitmap.name) == null) {
	    this.bitmapCache.push(fillerBitmap);
	}
	this.refreshCanvas();
    }

    this.addFiller = function(blk, offset, c) {
	var myBlock = this.blockList[blk];
	var name = 'bmp_' + blk + '_filler_' + c;
	var bi = this.findBitmap(name);
	if (bi == null) { 
	    var image = new Image();
	    if (this.isArgBlock(blk)) {
		image.src = myBlock.protoblock.getArgFillerSvgPath();
	    } else if (this.isSpecialBlock(blk)) {
		image.src = myBlock.protoblock.getSpecialFillerSvgPath();
	    } else {
		image.src = myBlock.protoblock.getFillerSvgPath();
	    }
	    var bitmap = new createjs.Bitmap(image)
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
	    var image = new Image();
	    if (this.isArgBlock(blk)) {
		image.src = myBlock.protoblock.getHighlightArgFillerSvgPath();
	    } else if (this.isSpecialBlock(blk)) {
		image.src = myBlock.protoblock.getHighlightSpecialFillerSvgPath();
	    } else {
		image.src = myBlock.protoblock.getHighlightFillerSvgPath();
	    }
	    var bitmap = new createjs.Bitmap(image)
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
	
	this.refreshCanvas();
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
    
	if (blk == null) {
	    return size;
	}
	
	if (this.isClampBlock(blk)) {
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
	var cblk = last(this.blockList[blk].connections);
	size += this.getStackSize(cblk);
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
    
	this.loopCounter += 1;
	if (this.loopCounter > this.blockList.length * 2) {
	    // FIXME: is there still an infinite loop in here somewhere?
	    console.log('infinite loop encountered while adjusting docks');
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
	    for (var b = 0; b < this.blockList[cblk].connections.length; b++) {
		if (this.blockList[cblk].connections[b] == blk) {
		    break
		}
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
	while (blk != null) {
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
	if (this.isArgBlock(thisBlock) && c != null) {
	    // We care about special (2arg) blocks with
	    // connections to the first arg;
	    if (this.isSpecialBlock(c)) {
		if (cBlock.connections[1] == thisBlock) {
		    check2ArgBlocks.push(c);
		}
	    } else if (this.isArgBlock(c) && this.isExpandableBlock(c)) {
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
		if (this.isArgBlock(thisBlock)) {
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
	if (this.isArgBlock(thisBlock) && newBlock != null) {
	    // We care about special (2arg) blocks with
	    // connections to the first arg;
	    if (this.isSpecialBlock(newBlock)) {
		if (this.blockList[newBlock].connections[1] == thisBlock) {
		    if (check2ArgBlocks.indexOf(newBlock) == -1) {
			check2ArgBlocks.push(newBlock);
		    }
		}
	    } else if (this.isArgBlock(newBlock) && this.isExpandableBlock(newBlock)) {
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
	while (blk != null) {
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

    this.makeBlockImages = function(myBlock) {
	blk = this.blockList.indexOf(myBlock);
	if (myBlock.image == null) {
	    myBlock.image = new Image();
	    myBlock.image.src = myBlock.protoblock.getSvgPath();
	    if (this.isExpandableBlock(blk)) {
		if (this.isArgBlock(blk)) {
		    myBlock.bottomImage = new Image();
		    myBlock.bottomImage.src =
			myBlock.protoblock.getArgBottomSvgPath();
		} else if (this.isSpecialBlock(blk)) {
		    myBlock.bottomImage = new Image();
		    myBlock.bottomImage.src = myBlock.protoblock.getSpecialBottomSvgPath();
		} else {
		    myBlock.bottomImage = new Image();
		    myBlock.bottomImage.src = myBlock.protoblock.getBottomSvgPath();
		}
	    }
	    // Same for highlights
	    myBlock.highlightImage = new Image();
	    myBlock.highlightImage.src = myBlock.protoblock.getHighlightSvgPath();
	    if (this.isExpandableBlock(blk)) {
		if (this.isArgBlock(blk)) {
		    myBlock.highlightBottomImage = new Image();
		    myBlock.highlightBottomImage.src = myBlock.protoblock.getHighlightArgBottomSvgPath();
		} else if (this.isSpecialBlock(blk)) {
		    myBlock.highlightBottomImage = new Image();
		    myBlock.highlightBottomImage.src = myBlock.protoblock.getHighlightSpecialBottomSvgPath();
		} else {
		    myBlock.highlightBottomImage = new Image();
		    myBlock.highlightBottomImage.src = myBlock.protoblock.getHighlightBottomSvgPath();
		}
	    }
	}
    }

    this.updateBlockImages = function() {
	// Create the block image if it doesn't yet exist.
	for (var blk = 0; blk < this.blockList.length; blk++) {
	    if (this.blockList[blk].image == null) {
		this.makeBlockImages(this.blockList[blk]);
	    } else {
		this.moveBlock(blk, this.blockList[blk].x, this.blockList[blk].y);
	    }
	}
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
		text = '<textarea id="' + getBlockId(blk) +
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
		text = '<textarea id="' + getBlockId(blk) +
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
	    if (this.isValueBlock(blk) && myBlock.name != 'media') {
		myBlock.label = document.getElementById(getBlockId(blk));
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
	while (this.blockList[blk].connections[0] != null) {
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
	while (last(this.blockList[blk].connections) != null) {
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
	    this.searchForExpandables(this.stackList[i]);
	}
    }

    this.find2Args = function() {
	// Find any expandable arg blocks.
	this.expandablesList = [];
	for (var i = 0; i < this.blockList.length; i++) {
	    if (this.isArgBlock(i) && this.isExpandableBlock(i)) {
		this.expandablesList.push(i);
	    }
	}
    }

    this.searchForExpandables = function(blk) {
	// Find the expandable blocks below blk in a stack.
	while (blk != null) {
	    if (this.isClampBlock(blk)) {
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

	if (myBlock.image == null) {
	    this.makeBlockImages(myBlock);
	}
        // Create the bitmap for the block.
	myBlock.bitmap = new createjs.Bitmap(myBlock.image);
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
	myBlock.highlightBitmap = new createjs.Bitmap(myBlock.highlightImage);
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
	if (this.isValueBlock(thisBlock) && myBlock.name != 'media') {
	    if (myBlock.value == null) {
		myBlock.value = '---';
	    }
	    myBlock.text = new createjs.Text(myBlock.value.toString(), '20px Courier', '#00000');
	    myBlock.text.textAlign = 'center';
	    myBlock.text.x = 100;
            myBlock.text.textBaseline = 'alphabetic';
	    myBlock.container.addChild(myBlock.text);
	    myBlock.text.x = 70 + myBlock.bitmap.x;
	    myBlock.text.y = 27 + myBlock.bitmap.y;
	    myBlock.text.scaleX = myBlock.text.scaleY = myBlock.text.scale = 1;
	}

	// Expandable blocks also have some extra parts.
	if (this.isExpandableBlock(thisBlock)) {
	    var yoff = myBlock.protoblock.yoff;
	    myBlock.fillerBitmaps = [];
	    myBlock.bottomBitmap = null;
	    myBlock.bottomBitmap = new createjs.Bitmap(myBlock.bottomImage);
	    myBlock.container.addChild(myBlock.bottomBitmap);
	    myBlock.bottomBitmap.x = myBlock.bitmap.x;
	    myBlock.bottomBitmap.y = myBlock.bitmap.y + yoff;
	    myBlock.bottomBitmap.scaleX = 1;
	    myBlock.bottomBitmap.scaleY = 1;
	    myBlock.bottomBitmap.scale = 1;
	    myBlock.bottomBitmap.name = 'bmp_' + thisBlock + '_bottom';

	    myBlock.highlightBottomBitmap = new createjs.Bitmap(myBlock.highlightBottomImage);
	    myBlock.container.addChild(myBlock.highlightBottomBitmap);
	    myBlock.highlightBottomBitmap.x = myBlock.bitmap.x;
	    myBlock.highlightBottomBitmap.y = myBlock.bitmap.y + yoff;
	    myBlock.highlightBottomBitmap.scaleX = 1;
	    myBlock.highlightBottomBitmap.scaleY = 1;
	    myBlock.highlightBottomBitmap.scale = 1;
	    myBlock.highlightBottomBitmap.name = 'bmp_' + thisBlock + '_highlight_bottom';
	    myBlock.highlightBottomBitmap.visible = false;
	}
    }

    this.unhighlight = function() {
	if (!this.blocksVisible) {
	    return;
	}
	if (this.highlightedBlock != null) {
	    var myBlock = this.blockList[this.highlightedBlock];
	    myBlock.bitmap.visible = true;
	    myBlock.highlightBitmap.visible = false;
	    if (this.isExpandableBlock(this.highlightedBlock)) {
		for (var i = 0; i < myBlock.fillerBitmaps.length; i++) {
		    myBlock.fillerBitmaps[i].visible = true;
		    myBlock.highlightFillerBitmaps[i].visible = false;
		}
		if (myBlock.bottomBitmap != null) {
		    myBlock.bottomBitmap.visible = true;
		    myBlock.highlightBottomBitmap.visible = false;
		}
	    }
	    this.refreshCanvas();
	}
	this.highlightedBlock = null;
    }

    this.highlight = function(blk) {
	if (!this.blocksVisible) {
	    return;
	}
	if (blk != null) {
	    this.unhighlight();
	    var myBlock = this.blockList[blk];
	    myBlock.bitmap.visible = false;
	    myBlock.highlightBitmap.visible = true;
	    if (this.isExpandableBlock(blk)) {
		for (var i = 0; i < myBlock.fillerBitmaps.length; i++) {
		    myBlock.fillerBitmaps[i].visible = false;
		    myBlock.highlightFillerBitmaps[i].visible = true;
		}
		if (myBlock.bottomBitmap != null) {
		    myBlock.bottomBitmap.visible = false;
		    myBlock.highlightBottomBitmap.visible = true;
		}
	    }

	    this.highlightedBlock = blk;
	    this.refreshCanvas();
	}
    }

    this.hideBlock = function(blk) {
	this.blockList[blk].container.visible = false;
	return;
    }

    this.showBlock = function(blk) {
	var myBlock = this.blockList[blk];
	if (myBlock.trash) {
	    return;  // Don't show blocks in the trash.
	}
	myBlock.container.visible = true;
	return;
    }

    this.makeNewBlock = function(name) {
	// Create a new block
	// console.log('makeNewBlock: (' + name + ')');
	if (!name in this.protoBlockDict) {
	    console.log('makeNewBlock: no prototype for ' + name);
	    return;
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
	this.imageLoad(myBlock);
	loadEventHandlers(this, myBlock);
    }

    this.makeBlock = function(name, arg) {
	// Make a new block from a proto block.
	// Called from palettes (and eventually from the load block).
	console.log('makeBlock ' + name + ' ' + arg);

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
	this.dragGroup.push(blk);
    
	// As before, does these ever happen?
	if (this.blockList[blk].connections == null) {
	    return;
	}
	if (this.blockList[blk].connections.length == 0) {
	    return;
	}

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

    blockBlocks = this;
    return this;
}

function initProtoBlocks(palettes, blocks) {
    blocks.palettes = palettes;

    // Turtle palette
    var clearBlock = new ProtoBlock('clear');
    clearBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['clear'] = clearBlock;
    clearBlock.zeroArgBlock();
    
    var forwardBlock = new ProtoBlock('forward');
    forwardBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['forward'] = forwardBlock;
    forwardBlock.oneArgBlock();
    forwardBlock.defaults.push(100);
    
    var rightBlock = new ProtoBlock('right');
    rightBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['right'] = rightBlock;
    rightBlock.oneArgBlock();
    rightBlock.defaults.push(90);
    
    var backBlock = new ProtoBlock('back');
    backBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['back'] = backBlock;
    backBlock.oneArgBlock();
    backBlock.defaults.push(100);
    
    var leftBlock = new ProtoBlock('left');
    leftBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['left'] = leftBlock;
    leftBlock.oneArgBlock();
    leftBlock.defaults.push(90);
    
    var arcBlock = new ProtoBlock('arc');
    arcBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['arc'] = arcBlock;
    arcBlock.twoArgBlock();
    arcBlock.defaults.push(90);
    arcBlock.defaults.push(100);
    arcBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'],
		      [98, 62, 'numberin'], [20, 84, 'in']];
    
    var setheadingBlock = new ProtoBlock('setheading');
    setheadingBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['setheading'] = setheadingBlock;
    setheadingBlock.oneArgBlock();
    setheadingBlock.defaults.push(0);
    
    var headingBlock = new ProtoBlock('heading');
    headingBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['heading'] = headingBlock;
    headingBlock.style = 'arg';
    headingBlock.docks = [[0, 20, 'numberout']];
    
    var setxyBlock = new ProtoBlock('setxy');
    setxyBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['setxy'] = setxyBlock;
    setxyBlock.twoArgBlock();
    setxyBlock.defaults.push(0);
    setxyBlock.defaults.push(0);
    setxyBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'],
			[98, 62, 'numberin'], [20, 84, 'in']];
    
    var xBlock = new ProtoBlock('x');
    xBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['x'] = xBlock;
    xBlock.parameterBlock();
    
    var yBlock = new ProtoBlock('y');
    yBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['y'] = yBlock;
    yBlock.parameterBlock();
    
    var showBlock = new ProtoBlock('show');
    showBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['show'] = showBlock;
    showBlock.twoArgBlock();
    showBlock.defaults.push(24);
    showBlock.defaults.push('text');
    showBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'],
		       [98, 62, 'textin'], [20, 84, 'in']];
    
    var imageBlock = new ProtoBlock('image');
    imageBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['image'] = imageBlock;
    imageBlock.twoArgBlock();
    imageBlock.defaults.push(100);
    imageBlock.defaults.push(null);
    imageBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'],
			[98, 62, 'textin'], [20, 84, 'in']];
    
    var shellBlock = new ProtoBlock('turtleshell');
    shellBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['shell'] = shellBlock;
    shellBlock.twoArgBlock();
    shellBlock.defaults.push(55);
    shellBlock.defaults.push(null);
    shellBlock.docks = [[20, 0, 'out'], [98, 20, 'numberin'],
			[98, 62, 'mediain'], [20, 84, 'in']];
    
    // Pen palette
    var setcolorBlock = new ProtoBlock('setcolor');
    setcolorBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setcolor'] = setcolorBlock;
    setcolorBlock.oneArgBlock();
    setcolorBlock.defaults.push(0);
    
    var colorBlock = new ProtoBlock('color');
    colorBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['color'] = colorBlock;
    colorBlock.parameterBlock();
    
    var setshadeBlock = new ProtoBlock('setshade');
    setshadeBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setshade'] = setshadeBlock;
    setshadeBlock.oneArgBlock();
    setshadeBlock.defaults.push(50);
    
    var shadeBlock = new ProtoBlock('shade');
    shadeBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['shade'] = shadeBlock;
    shadeBlock.parameterBlock();
    
    var setchromaBlock = new ProtoBlock('setgrey');
    setchromaBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setchroma'] = setchromaBlock;
    setchromaBlock.oneArgBlock();
    setchromaBlock.defaults.push(100);
    
    var chromaBlock = new ProtoBlock('grey');
    chromaBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['chroma'] = chromaBlock;
    chromaBlock.parameterBlock();
    
    var setpensizeBlock = new ProtoBlock('setpensize');
    setpensizeBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['setpensize'] = setpensizeBlock;
    setpensizeBlock.oneArgBlock();
    setpensizeBlock.defaults.push(5);
    
    var pensizeBlock = new ProtoBlock('pensize');
    pensizeBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['pensize'] = pensizeBlock;
    pensizeBlock.parameterBlock();
    
    var penupBlock = new ProtoBlock('penup');
    penupBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['penup'] = penupBlock;
    penupBlock.zeroArgBlock();
    
    var pendownBlock = new ProtoBlock('pendown');
    pendownBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['pendown'] = pendownBlock;
    pendownBlock.zeroArgBlock();
    
    var startfillBlock = new ProtoBlock('beginfill');
    startfillBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['startfill'] = startfillBlock;
    startfillBlock.zeroArgBlock();
    
    var endfillBlock = new ProtoBlock('endfill');
    endfillBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['endfill'] = endfillBlock;
    endfillBlock.zeroArgBlock();
    
    var backgroundBlock = new ProtoBlock('fillscreen');
    backgroundBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['background'] = backgroundBlock;
    backgroundBlock.zeroArgBlock();
    
    // Numbers palette
    var numberBlock = new ProtoBlock('number');
    numberBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['number'] = numberBlock;
    numberBlock.style = 'value';
    numberBlock.docks = [[0, 20, 'numberout']];
    
    var randomBlock = new ProtoBlock('random');
    randomBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['random'] = randomBlock;
    randomBlock.twoArgMathBlock();
    randomBlock.defaults.push(0);
    randomBlock.defaults.push(100);
    
    var plusBlock = new ProtoBlock('plus');
    plusBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['plus'] = plusBlock;
    plusBlock.twoArgMathBlock();
    
    var minusBlock = new ProtoBlock('minus');
    minusBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['minus'] = minusBlock;
    minusBlock.twoArgMathBlock();
    
    var multiplyBlock = new ProtoBlock('multiply');
    multiplyBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['multiply'] = multiplyBlock;
    multiplyBlock.twoArgMathBlock();
    
    var divideBlock = new ProtoBlock('divide');
    divideBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['divide'] = divideBlock;
    divideBlock.twoArgMathBlock();
    
    var sqrtBlock = new ProtoBlock('sqrt');
    sqrtBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['sqrt'] = sqrtBlock;
    sqrtBlock.args = 1;
    sqrtBlock.style = 'arg';
    sqrtBlock.docks = [[0, 20, 'numberout'], [68, 20, 'numberin']];
    
    var modBlock = new ProtoBlock('mod');
    modBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['mod'] = modBlock;
    modBlock.twoArgMathBlock();
    
    var greaterBlock = new ProtoBlock('greater');
    greaterBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['greater'] = greaterBlock;
    greaterBlock.booleanBlock();
    
    var lessBlock = new ProtoBlock('less');
    lessBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['less'] = lessBlock;
    lessBlock.booleanBlock();
    
    var equalBlock = new ProtoBlock('equal');
    equalBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['equal'] = equalBlock;
    equalBlock.booleanBlock();
    
    // Blocks palette
    var mediaBlock = new ProtoBlock('media');
    mediaBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['media'] = mediaBlock;
    mediaBlock.style = 'value';
    mediaBlock.docks = [[0, 20, 'mediaout']];
    
    var textBlock = new ProtoBlock('text');
    textBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['text'] = textBlock;
    textBlock.style = 'value';
    textBlock.docks = [[0, 20, 'textout']];
    
    var storeinBlock = new ProtoBlock('storein');
    storeinBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['storein'] = storeinBlock;
    storeinBlock.defaults.push('box');
    storeinBlock.defaults.push(100);
    storeinBlock.twoArgBlock();
    storeinBlock.docks = [[20, 0, 'out'], [98, 20, 'textin'],
			  [98, 62, 'numberin'], [20, 84, 'in']];
    
    var boxBlock = new ProtoBlock('box');
    boxBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['box'] = boxBlock;
    boxBlock.args = 1;
    boxBlock.defaults.push('box');
    boxBlock.style = 'arg';
    boxBlock.docks = [[0, 20, 'numberout'], [68, 20, 'textin']];
    
    var actionBlock = new ProtoBlock('action');
    actionBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['action'] = actionBlock;
    actionBlock.yoff = 86;
    actionBlock.loff = 42;
    actionBlock.args = 1;
    actionBlock.expandable = true;
    actionBlock.defaults.push('action');
    actionBlock.style = 'clamp';
    actionBlock.docks = [[20, 0, 'unavailable'], [98, 34, 'textin'],
			 [38, 55, 'in'], [20, 80, 'unavailable']];
        
    var doBlock = new ProtoBlock('do');
    doBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['do'] = doBlock;
    doBlock.defaults.push('action');
    doBlock.args = 1;
    doBlock.docks = [[20, 0, 'out'], [98, 20, 'textin'], [20, 42, 'in']];
        
    var startBlock = new ProtoBlock('start');
    startBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['start'] = startBlock;
    startBlock.yoff = 86;
    startBlock.loff = 42;
    startBlock.args = 1;
    startBlock.expandable = true;
    startBlock.style = 'clamp';
    startBlock.docks = [[20, 0, 'unavailable'], [38, 55, 'in'],
			[20, 80, 'unavailable']];
    
    // Flow palette
    var repeatBlock = new ProtoBlock('repeat');
    repeatBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['repeat'] = repeatBlock;
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
    ifBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['if'] = ifBlock;
    ifBlock.yoff = 116;
    ifBlock.loff = 42;
    ifBlock.expandable = true;
    ifBlock.style = 'clamp';
    ifBlock.size = 3;
    ifBlock.args = 2;
    ifBlock.docks = [[20, 0, 'out'], [56, 40, 'booleanin'], [38, 84, 'in'],
 		     [20, 168, 'in']];
    
    var vspaceBlock = new ProtoBlock('vspace');
    vspaceBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['vspace'] = vspaceBlock;
    vspaceBlock.zeroArgBlock();
    
    // Sensors palette
    var pubBlock = new ProtoBlock('publish');
    pubBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['publish'] = pubBlock;
    pubBlock.oneArgBlock();
    pubBlock.defaults.push('comment');
    pubBlock.docks = [[20, 0, 'out'], [98, 20, 'textin'], [20, 42, 'in']];
    
    var timeBlock = new ProtoBlock('time');
    timeBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['time'] = timeBlock;
    timeBlock.parameterBlock();
    
    var mousexBlock = new ProtoBlock('mousex');
    mousexBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['mousex'] = mousexBlock;
    mousexBlock.parameterBlock();
    
    var mouseyBlock = new ProtoBlock('mousey');
    mouseyBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['mousey'] = mouseyBlock;
    mouseyBlock.parameterBlock();
    
    // Push protoblocks onto their palettes.
    for (var protoblock in blocks.protoBlockDict) {
	    blocks.protoBlockDict[protoblock].palette.add(blocks.protoBlockDict[protoblock]);
    }
    
    // Populate the lists of block types.
    blocks.findBlockTypes();
}

// Define block instance objects
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
    this.text = null;  // A text label on block itself.
    this.value = null; // Value for number, text, and media blocks.

    this.image = null;
    this.highlightImage = null;

    // All blocks have at a container and least one bitmap.
    this.container = null;
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
	for (var i = 0; i < this.protoblock.docks.length; i++) {
	    var dock = [this.protoblock.docks[i][0], this.protoblock.docks[i][1], this.protoblock.docks[i][2]];
	    this.docks.push(dock);
	}
    }

    this.getInfo = function() {
	return this.name + ' block';
    }
}

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

// A place in the DOM to put modifiable labels (textareas).
var labelElem = document.getElementById('labelDiv');

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
    var fileChooser = document.getElementById("myMedia");
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
	    } else if (blocks.isValueBlock(thisBlock) && myBlock.name != 'media') {
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
	    
	    if (blocks.isValueBlock(thisBlock) && myBlock.name != 'media') {
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
		    blocks.hideBlock(blk);
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
    
    document.getElementById('loader').className = '';
    blocks.addTick();
}
