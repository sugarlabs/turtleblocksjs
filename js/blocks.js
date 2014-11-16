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

// All things related to blocks

// A place in the DOM to put modifiable labels (textareas).
var labelElem = docById('labelDiv');

var blockBlocks = null;

var COLLAPSEBUTTONXOFF = -45
var COLLAPSEBUTTONYOFF = 14

// There are three "classes" defined in this file: ProtoBlocks,
// Blocks, and Block. Protoblocks are the prototypes from which Blocks
// are created; Blocks is the list of all blocks; and Block is a block
// instance.

// Protoblock contain generic information about blocks and some
// methods common to all blocks.
function ProtoBlock(name) {
    this.name = name; // used for svg filename, run switch, and palette label
    this.palette = null;
    this.style = null;
    this.expandable = false;
    this.parameter = false;
    this.yoff = 0;
    this.loff = 0;
    this.args = 0;
    this.defaults = [];
    this.size = 1;
    this.staticLabels = []; // Generated as part of static inline SVG
    this.fontsize = '18px';
    this.artwork = null;
    this.docks = [];

    // We need to copy, since docks get modified.
    this.copyDock = function(dockStyle) {
        for (var i = 0; i < dockStyle.length; i++) {
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

    this.basicBlockNoFlow = function() {
        this.args = 0;
        this.artwork = BASICBLOCKNOFLOW;
        this.copyDock(BASICBLOCKNOFLOWDOCKS);
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

    this.flowClamp0ArgBlock = function() {
        this.style = 'clamp';
        this.yoff = 74;
        this.loff = 42;
        this.expandable = true;
        this.size = 2;
        this.args = 1;
        this.artwork = FLOWCLAMP0ARG;
        this.copyDock(FLOWCLAMP0ARGDOCKS);
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
        this.parameter = true;
        this.size = 1;
        this.args = 0;
        this.artwork = VALUEBLOCK;
        this.copyDock(VALUEBLOCKDOCKS);
    }
}

// Blocks holds the list of blocks and most of the block-associated
// methods, since most block manipulations are inter-block.
function Blocks(canvas, stage, refreshCanvas, trashcan) {
    // Things we need from outside
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;
    this.trashcan = trashcan;

    // The proto blocks...
    this.protoBlockDict = {}
    // And a place to keep the blocks we create.
    this.blockList = [];

    // Selected stack for pasting.
    this.selectingStack = false;
    this.selectedStack = null;

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
    // Number of blocks to load
    this.loadCounter = 0;
    // Stacks of blocks that need adjusting
    this.adjustTheseDocks = [];

    // We need to keep track of certain classes of blocks that exhibit
    // different types of behavior:
    this.expandableBlocks = []; // Blocks with parts that expand
    this.clampBlocks = []; // Blocks that contain other blocks
    this.argBlocks = []; // Blocks that are used as arguments to other blocks
    this.valueBlocks = []; // Blocks that return values
    this.specialBlocks = []; // Two-arg blocks with special parts
    this.noRunBlocks = ['action'];

    this.setTurtles = function(turtles) {
        this.turtles = turtles;
    }

    this.setLogo = function(runLogo) {
        this.runLogo = runLogo;
    }

    this.setScale = function(scale) {
        this.scale = scale;
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

    // Adjust the docking postions of all blocks in the drag group
    this.adjustBlockPositions = function() {
        // console.log('adjust block positions');
        if (this.dragGroup.length < 2) {
            return;
        }

        this.loopCounter = 0;
        this.adjustDocks(this.dragGroup[0])
    }

    // Adjust the size of the clamp in an expandable block
    this.adjustExpandableBlock = function(blk) {
        var myBlock = this.blockList[blk];
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
        if (c > 0 && myBlock.connections[c] != null) {
            var size = this.getStackSize(myBlock.connections[c]);
            if (size < 1) {
                size = 1; // Minimum clamp size
            }
        } else {
            size = 1;
        }

        // (2) adjust the clamp size to match.
        var yoff = myBlock.protoblock.yoff;
        var loff = myBlock.protoblock.loff;
        var j = myBlock.fillerCount;
        if (size < j + 1) {
            var n = j - size + 1;
            for (var i = 0; i < n; i++) {
                this.removeFiller(blk);
                myBlock.fillerCount -= 1;
                last(myBlock.docks)[1] -= loff;
            }
            if (last(myBlock.connections) != null) {
                this.loopCounter = 0;
                this.adjustDocks(blk);
            }
        } else if (size > j) {
            var n = size - j - 1;
            for (var i = 0; i < n; i++) {
                var c = i + j;
                this.addFiller(blk, yoff + c * loff, c);
                myBlock.fillerCount += 1;
                last(myBlock.docks)[1] += loff;
            }
            if (last(myBlock.connections) != null) {
                this.loopCounter = 0;
                this.adjustDocks(blk);
            }
        }
    }

    this.getBlockSize = function(blk) {
        // TODO recurse on first arg
        return this.blockList[blk].size;
    }

    this.adjust2ArgBlock = function(blk) {
        // Adjust the size of a 2-arg block
        var myBlock = this.blockList[blk];

        // (1) What the size of the first argument?
        var c = myBlock.connections[1];
        if (c == null) {
            var size = 0;
        } else {
            var size = this.getBlockSize(c);
        }
        if (size < 1) {
            size = 1; // Minimum size
        }

        // (2) adjust the block size to match.
        var yoff = myBlock.protoblock.yoff;
        var loff = myBlock.protoblock.loff;
        var j = myBlock.fillerCount;
        if (size < j + 1) {
            var n = j - size + 1; // one slot built in
            for (var i = 0; i < n; i++) {
                this.removeFiller(blk);
                myBlock.fillerCount -= 1;
                myBlock.docks[2][1] -= loff;
                if (!myBlock.isArgBlock()) {
                    myBlock.docks[3][1] -= loff;
                }
                myBlock.size -= 1;
            }
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
        } else if (size > j) {
            var n = size - j - 1; // one slot built in
            for (var i = 0; i < n; i++) {
                var c = i + j;
                this.addFiller(blk, yoff + c * loff, c);
                myBlock.fillerCount += 1;
                myBlock.docks[2][1] += loff;
                if (!myBlock.isArgBlock()) {
                    myBlock.docks[3][1] += loff;
                }
                myBlock.size += 1;
            }
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
    }

    this.removeFiller = function(blk) {
        var myBlock = this.blockList[blk];
        var fillerBitmap = myBlock.fillerBitmaps.pop();

        myBlock.container.removeChild(fillerBitmap);
        if (this.findBitmap(fillerBitmap.name) == null) {
            this.bitmapCache.push(fillerBitmap);
        }

        myBlock.bottomBitmap.y -= myBlock.protoblock.loff;
        myBlock.highlightBottomBitmap.y = myBlock.bottomBitmap.y;

        try {
            // There is a potential race conditon such that the
            // container cache is not yet ready.
            myBlock.container.uncache();
            myBlock.bounds = myBlock.container.getBounds();
            myBlock.container.cache(myBlock.bounds.x, myBlock.bounds.y, myBlock.bounds.width, myBlock.bounds.height);
        } catch (e) {
            console.log(e);
        }
    }

    this.addFiller = function(blk, offset, c) {
        var myBlock = this.blockList[blk];
        var name = 'bmp_' + blk + '_filler_' + c;

        function processBitmap(me, name, bitmap) {
            myBlock.fillerBitmaps.push(bitmap);
            myBlock.container.addChild(bitmap);
            bitmap.x = myBlock.bitmap.x;
            bitmap.y = myBlock.bitmap.y + offset;
            bitmap.name = name;

            me.refreshCanvas();
        }

        var bi = this.findBitmap(name);
        if (bi == null) {
            if (myBlock.isArgBlock()) {
                var artwork = ARG2BLOCKFILLER;
            } else if (myBlock.isSpecialBlock()) {
                var artwork = BASICBLOCK2ARGFILLER;
            } else {
                var artwork = CLAMPFILLER;
            }
            makeBitmap(this, artwork.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]), name, processBitmap);
        } else {
            processBitmap(this, name, this.bitmapCache[bi]);
        }

        function processHighlightBitmap(me, name, bitmap) {
            myBlock.highlightFillerBitmaps.push(bitmap);
            myBlock.container.addChild(bitmap);
            bitmap.x = myBlock.bitmap.x;
            bitmap.y = myBlock.bitmap.y + offset;
            bitmap.name = name;
            // Hide highlight to start
            bitmap.visible = false;

            myBlock.bottomBitmap.y += myBlock.protoblock.loff;
            myBlock.highlightBottomBitmap.y = myBlock.bottomBitmap.y;

            try {
                // There is a potential race conditon such that the
                // container cache is not yet ready.
                myBlock.container.uncache();
                myBlock.bounds = myBlock.container.getBounds();
                myBlock.container.cache(myBlock.bounds.x, myBlock.bounds.y, myBlock.bounds.width, myBlock.bounds.height);
            } catch (e) {
                console.log(e);
            }

            me.refreshCanvas();
        }

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
            makeBitmap(this, artwork.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]), name, processHighlightBitmap);
        } else {
            processHighlightBitmap(this, name, this.bitmapCache[bi]);
        }
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
            console.log('infinite loop detecting size of expandable block? ' + blk);
            return size;
        }

        if (blk == null) {
            return size;
        }

        var myBlock = this.blockList[blk];
        if (myBlock == null) {
            console.log('SOMETHING VERY BROKEN');
        }

        if (myBlock.isClampBlock()) {
            var c = myBlock.connections.length - 2;
            if (c > 0) {
                 var cblk = myBlock.connections[c];
                if (cblk != null) {
                    size = this.getStackSize(cblk);
                    if (size == 0) {
                        size = 1; // minimum of 1 slot in clamp
                    }
                }
                // add top and bottom of clamp
                size += myBlock.size;
            }
        } else {
            size = myBlock.size;
        }

        // check on any connected block
        if (!myBlock.isValueBlock()) {
            var cblk = last(myBlock.connections);
            if (cblk != null) {
                size += this.getStackSize(cblk);
            }
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
            // console.log(this.blockList[blk].name + ' must be a value block... nothing to do.');
            return;
        }

        // console.log('adjusting connections for ' + this.blockList[blk].name);
        // console.log('connections ' + this.blockList[blk].connections);
        // console.log('docks ' + this.blockList[blk].docks);

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

            if (this.blockList[cblk] == null) {
                console.log('this is not good: encountered a null block ' + cblk);
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
            // console.log('checking if ' + blk + ' is expandable');
            checkExpandableBlocks.push(blk);
            blk = this.insideExpandableBlock(blk);
        }

        var check2ArgBlocks = [];
        var myBlock = this.blockList[thisBlock];
        // console.log('block moved ' + myBlock.name);
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
                    // console.log(this.blockList[b].name + ': connection ' + i + ' > ' + this.blockList[b].docks.length);
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
            if (connection != null) {
                if (myBlock.isArgBlock()) {
                    this.blockList[connection].connections[0] = null;
                    // Fixme: could be more than one block.
                    this.moveBlockRelative(connection, 40, 40);
                } else {
                    var bottom = this.findBottomBlock(thisBlock);
                    this.blockList[connection].connections[0] = bottom;
                    this.blockList[bottom].connections[this.blockList[bottom].connections.length - 1] = connection;
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
            // console.log('checking if ' + blk + ' is expandable (' + this.blockList[blk].name + ')');
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
        if (type1 == 'anyin' && ['textout', 'mediaout', 'numberout'].indexOf(type2) != -1) {
            return true;
        }
        if (type2 == 'anyin' && ['textout', 'mediaout', 'numberout'].indexOf(type1) != -1) {
            return true;
        }
        return false;
    }

    this.updateBlockPositions = function() {
        // Create the block image if it doesn't yet exist.
        for (var blk = 0; blk < this.blockList.length; blk++) {
            this.moveBlock(blk, this.blockList[blk].x, this.blockList[blk].y);
        }
    }

    this.bringToTop = function() {
        // Move all the blocks to the top layer of the stage
        // console.log('bring blocks to top');
        for (var blk in this.blockList) {
            var myBlock = this.blockList[blk];
            this.stage.removeChild(myBlock.container);
            this.stage.addChild(myBlock.container);
            if (myBlock.collapseButton != null) {
                this.stage.removeChild(myBlock.collapseButton);
                this.stage.addChild(myBlock.collapseButton);
            }
        }
        this.refreshCanvas();
    }

    this.moveBlock = function(blk, x, y) {
        // Move a block (and its label) to x, y.
        var myBlock = this.blockList[blk];
        // console.log('move block ' + myBlock.name);
        if (myBlock.container != null) {
            myBlock.container.x = x;
            myBlock.container.y = y;
            myBlock.x = x
            myBlock.y = y
            this.adjustLabelPosition(blk, myBlock.container.x, myBlock.container.y);
            if (myBlock.collapseButton != null) {
                myBlock.collapseButton.x = x + COLLAPSEBUTTONXOFF;
                myBlock.collapseButton.y = y + COLLAPSEBUTTONYOFF;
            }
        } else {
            console.log('no container yet');
            myBlock.x = x
            myBlock.y = y
        }
    }

    this.moveBlockRelative = function(blk, dx, dy) {
        // Move a block (and its label) by dx, dy.
        var myBlock = this.blockList[blk];
        // console.log('move block relative' + myBlock.name);
        if (myBlock.container != null) {
            myBlock.container.x += dx;
            myBlock.container.y += dy;
            myBlock.x = myBlock.container.x;
            myBlock.y = myBlock.container.y;
            this.adjustLabelPosition(blk, myBlock.container.x, myBlock.container.y);
            if (myBlock.collapseButton != null) {
                myBlock.collapseButton.x += dx;
                myBlock.collapseButton.y += dy;
            }
        } else {
            console.log('no container yet');
            myBlock.x += dx
            myBlock.y += dy
        }
    }

    this.updateBlockText = function(blk) {
        // When we create new blocks, we may not have assigned the
        // value yet.
        var myBlock = this.blockList[blk];
        // console.log('update block text ' + myBlock.name);
        // FIXME: queue these updates for after the blocks have loaded
        if (myBlock.text == null) {
            // console.log('block not ready');
            return;
        }
        var label = myBlock.value.toString();
        if (label.length > 8) {
            label = label.substr(0, 7) + '...';
        }
        myBlock.text.text = label;

        // Make sure text is on top.
        lastChild = last(myBlock.container.children);
        myBlock.container.swapChildren(myBlock.text, lastChild);

        try {
            this.blockList[blk].container.updateCache();
        } catch (e) {
            console.log(e);
        }
    }

    this.updateBlockLabels = function() {
        // The modifiable labels are stored in the DOM with a
        // unique id for each block.  For the moment, we only have
        // labels for number and text blocks.
        var html = ''
        var text = ''
        var value = ''
        // console.log('update block labels');
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
                    'cols="8", rows="1", maxlength="80">' +
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
            if (myBlock == null) {
                console.log('null block in block list');
                continue;
            }
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
                    'change', function() {
                        labelChanged();
                    });
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
        var myBlock = this.blockList[blk];
        // console.log('adjust label positions ' + myBlock.name);
        var canvasLeft = canvas.offsetLeft + 28;
        var canvasTop = canvas.offsetTop + 6;

        if (myBlock.label == null) {
            return;
        }
        if (myBlock.protoblock.name == 'number') {
            myBlock.label.style.left = Math.round(x * this.scale + canvasLeft) + 'px';
        } else if (myBlock.protoblock.name == 'text') {
            myBlock.label.style.left = Math.round(x * this.scale + canvasLeft) + 'px';
        }
        myBlock.label.style.top = Math.round(y * this.scale + canvasTop) + 'px';
    }

    this.findTopBlock = function(blk) {
        // Find the top block in a stack.
        if (blk == null) {
            return null;
        }
        var myBlock = this.blockList[blk];
        // console.log('find top block ' + myBlock.name);
        if (myBlock.connections == null) {
            return blk;
        }
        if (myBlock.connections.length == 0) {
            return blk;
        }
        var topBlockLoop = 0;
        while (myBlock.connections[0] != null) {
            topBlockLoop += 1;
            if (topBlockLoop > 2 * this.blockList.length) {
                console.log('infinite loop finding topBlock?');
                break;
            }
            blk = myBlock.connections[0];
        }
        return blk;
    }

    this.findBottomBlock = function(blk) {
        // Find the bottom block in a stack.
        if (blk == null) {
            return null;
        }
        var myBlock = this.blockList[blk];
        // console.log('find bottom block ' + myBlock.name);
        if (myBlock.connections == null) {
            return blk;
        }
        if (myBlock.connections.length == 0) {
            return blk;
        }
        var bottomBlockLoop = 0;
        while (last(myBlock.connections) != null) {
            bottomBlockLoop += 1;
            if (bottomBlockLoop > 2 * this.blockList.length) {
                console.log('infinite loop finding bottomBlock?');
                break;
            }
            blk = last(myBlock.connections);
        }
        return blk;
    }

    this.findStacks = function() {
        // Find any blocks with null in the first connection.
        // console.log('find stacks');
        this.stackList = [];
        for (i = 0; i < this.blockList.length; i++) {
            if (this.blockList[i].connections[0] == null) {
                this.stackList.push(i)
            }
        }
    }

    this.findClamps = function() {
        // Find any clamp blocks.
        // console.log('find clamps');
        this.expandablesList = [];
        this.findStacks(); // We start by finding the stacks
        for (var i = 0; i < this.stackList.length; i++) {
            this.searchCounter = 0;
            this.searchForExpandables(this.stackList[i]);
        }
    }

    this.find2Args = function() {
        // Find any expandable arg blocks.
        // console.log('find 2args');
        this.expandablesList = [];
        for (var i = 0; i < this.blockList.length; i++) {
            if (this.blockList[i].isArgBlock() && this.blockList[i].isExpandableBlock()) {
                this.expandablesList.push(i);
            } else if (this.blockList[i].isSpecialBlock()) {
                this.expandablesList.push(i);
            }
        }
    }

    this.searchForExpandables = function(blk) {
        // Find the expandable blocks below blk in a stack.
        // console.log('search for expandables');
        while (blk != null && this.blockList[blk] != null && !this.blockList[blk].isValueBlock()) {
            this.searchCounter += 1;
            if (this.searchCounter > 2 * this.blockList.length) {
                console.log('infinite loop searching for Expandables? ' + this.searchCounter);
                console.log(blk + ' ' + this.blockList[blk].name);
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
        // console.log('expandClamps');
        this.findClamps();
        for (var i = 0; i < this.expandablesList.length; i++) {
            this.adjustExpandableBlock(this.expandablesList[i]);
        }
        this.refreshCanvas();
    }

    this.imageLoad = function(myBlock) {
        // Load a block image and create any extra parts.  Image
        // components are loaded asynchronously so most the work
        // happens in callbacks.

        var thisBlock = this.blockList.indexOf(myBlock);

	// We need a label for most blocks.
        myBlock.text = new createjs.Text('', '20px Arial', '#000000');

        // Get the block labels from the protoblock
        var block_label = '';
        if (myBlock.protoblock.staticLabels.length > 0) {
            block_label = myBlock.protoblock.staticLabels[0];
        }

        var top_label = '';
        if (myBlock.protoblock.staticLabels.length > 1) {
            top_label = myBlock.protoblock.staticLabels[1];
        }

        // Create the bitmap for the block.
        function processBitmap(me, name, bitmap) {
            myBlock.bitmap = bitmap;
            myBlock.container.addChild(myBlock.bitmap);
            myBlock.bitmap.x = 0;
            myBlock.bitmap.y = 0;
            myBlock.bitmap.name = 'bmp_' + thisBlock;
            myBlock.bitmap.cursor = 'pointer';
            me.refreshCanvas();
        }

        makeBitmap(this, myBlock.protoblock.artwork.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('block_label', block_label).replace('top_label', top_label).replace('font_size', myBlock.protoblock.fontsize), myBlock.name, processBitmap);

        // Create the highlight bitmap for the block.
        function processHighlightBitmap(me, name, bitmap) {
            myBlock.highlightBitmap = bitmap;
            myBlock.container.addChild(myBlock.highlightBitmap);
            myBlock.highlightBitmap.x = 0;
            myBlock.highlightBitmap.y = 0;
            myBlock.highlightBitmap.name = 'bmp_highlight_' + thisBlock;
            myBlock.highlightBitmap.cursor = 'pointer';
            // Hide it to start
            myBlock.highlightBitmap.visible = false;

            if (myBlock.text != null) {
                // Make sure text is on top.
                lastChild = last(myBlock.container.children);
                myBlock.container.swapChildren(myBlock.text, lastChild);
            }

            // At this point, it should be safe to calculate the
            // bounds of the container and cache its contents.
            myBlock.bounds = myBlock.container.getBounds();
            myBlock.container.cache(myBlock.bounds.x, myBlock.bounds.y, myBlock.bounds.width, myBlock.bounds.height);
            loadEventHandlers(me, me.turtles, myBlock);
            me.refreshCanvas();

            me.finishImageLoad(myBlock);
        }

        makeBitmap(this, myBlock.protoblock.artwork.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('block_label', block_label).replace('top_label', top_label).replace('font_size', myBlock.protoblock.fontsize), '', processHighlightBitmap);
    }

    this.finishImageLoad = function(myBlock) {

        var thisBlock = this.blockList.indexOf(myBlock);

        var bottom_label = '';
        if (myBlock.protoblock.staticLabels.length > 2) {
            bottom_label = myBlock.protoblock.staticLabels[2];
        }

        // Value blocks get a modifiable text label
        if (myBlock.isValueBlock() && myBlock.name != 'media') {
            if (myBlock.value == null) {
                if (myBlock.name == 'text') {
                    myBlock.value = '---';
                } else {
                    myBlock.value = 100;
                }
            }

            var label = myBlock.value.toString();
            if (label.length > 8) {
                label = label.substr(0, 7) + '...';
            }
            myBlock.text.text = label;
            myBlock.text.textAlign = 'center';
            myBlock.text.textBaseline = 'alphabetic';
            myBlock.container.addChild(myBlock.text);
            myBlock.text.x = 70;
            myBlock.text.y = 27;

            this.adjustLabelPosition(thisBlock, myBlock.container.x, myBlock.container.y);

            // Make sure text is on top.
            lastChild = last(myBlock.container.children);
            myBlock.container.swapChildren(myBlock.text, lastChild);
            myBlock.container.updateCache();
        }

        if (myBlock.protoblock.parameter) {
            // Parameter blocks get a text label to show their current value
            myBlock.text.textAlign = 'right';
            myBlock.text.textBaseline = 'alphabetic';
            myBlock.container.addChild(myBlock.text);
	    if (myBlock.name == 'box') {
		myBlock.text.x = 120;
	    } else {
		myBlock.text.x = 140;
	    }
            myBlock.text.y = 27;

            lastChild = last(myBlock.container.children);
            myBlock.container.swapChildren(myBlock.text, lastChild);
            myBlock.container.updateCache();
        }

        if (myBlock.isExpandableBlock()) {
            // Expandable blocks also have some extra parts.
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

            function processBottomBitmap(me, name, bitmap) {
                myBlock.bottomBitmap = bitmap;
                myBlock.container.addChild(myBlock.bottomBitmap);
                myBlock.bottomBitmap.x = myBlock.bitmap.x;
                myBlock.bottomBitmap.y = myBlock.bitmap.y + yoff;
                myBlock.bottomBitmap.name = 'bmp_' + thisBlock + '_bottom';
                me.refreshCanvas();
            }

            makeBitmap(this, bottomArtwork.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('bottom_label', bottom_label), '', processBottomBitmap);

            function processHighlightBottomBitmap(me, name, bitmap) {
                myBlock.highlightBottomBitmap = bitmap;
                myBlock.container.addChild(myBlock.highlightBottomBitmap);
                myBlock.highlightBottomBitmap.x = myBlock.bitmap.x;
                myBlock.highlightBottomBitmap.y = myBlock.bitmap.y + yoff;
                myBlock.highlightBottomBitmap.name = 'bmp_' + thisBlock + '_highlight_bottom';
                myBlock.highlightBottomBitmap.visible = false;

                // We added a bottom block, so we need to recache.
                myBlock.container.uncache();
                myBlock.bounds = myBlock.container.getBounds();
                myBlock.container.cache(myBlock.bounds.x, myBlock.bounds.y, myBlock.bounds.width, myBlock.bounds.height);
                // console.log('recaching ' + myBlock.name);
                myBlock.loadComplete = true;
                me.refreshCanvas();
                me.cleanupAfterLoad();
            }

            makeBitmap(this, bottomArtwork.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('bottom_label', bottom_label), '', processHighlightBottomBitmap);
        } else {
            myBlock.loadComplete = true;
            this.refreshCanvas();
            this.cleanupAfterLoad();
        }

        // Start blocks and Action blocks can collapse, so add an
        // event handler
        if (['start', 'action'].indexOf(myBlock.name) != -1) {
            block_label = ''; // We use a Text element for the label

            function processCollapseBitmap(me, name, bitmap) {
                myBlock.collapseBlockBitmap = bitmap;
                myBlock.container.addChild(myBlock.collapseBlockBitmap);
                myBlock.collapseBlockBitmap.visible = false;
                me.refreshCanvas();
            }

            makeBitmap(this, ACTIONCLAMPCOLLAPSED.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('block_label', block_label).replace('font_size', myBlock.protoblock.fontsize), '', processCollapseBitmap);

            function processHighlightCollapseBitmap(me, name, bitmap) {
                myBlock.highlightCollapseBlockBitmap = bitmap;
                myBlock.container.addChild(myBlock.highlightCollapseBlockBitmap);
                myBlock.highlightCollapseBlockBitmap.visible = false;
                me.refreshCanvas();

                if (myBlock.name == 'action') {
                    myBlock.collapseText = new createjs.Text('action', '20px Arial', '#000000');
                    myBlock.collapseText.x = 100;
                    myBlock.collapseText.y = 40;
                    myBlock.collapseText.textAlign = 'right';
                } else {
                    myBlock.collapseText = new createjs.Text('start', '20px Arial', '#000000');
                    myBlock.collapseText.x = 20;
                    myBlock.collapseText.y = 40;
                    myBlock.collapseText.textAlign = 'left';
                }
                myBlock.collapseText.textBaseline = 'alphabetic';
                myBlock.container.addChild(myBlock.collapseText);
                myBlock.collapseText.visible = false;

                myBlock.collapseButton = new createjs.Container();

                var image = new Image();
                image.src = 'images/collapse.svg';
                myBlock.collapseBitmap = new createjs.Bitmap(image);
                myBlock.collapseButton.addChild(myBlock.collapseBitmap);

                var image = new Image();
                image.src = 'images/expand.svg';
                myBlock.expandBitmap = new createjs.Bitmap(image);
                myBlock.collapseButton.addChild(myBlock.expandBitmap);
                myBlock.expandBitmap.visible = false;
                me.stage.addChild(myBlock.collapseButton);

                myBlock.collapseButton.x = myBlock.container.x + COLLAPSEBUTTONXOFF;
                myBlock.collapseButton.y = myBlock.container.y + COLLAPSEBUTTONYOFF;
                // FIXME
                // var bounds = myBlock.collapseButton.getBounds();
                // console.log('collapse button bounds ' + bounds);
                // myBlock.collapseButton.cache(bounds.x, bounds.y, bounds.width, bounds.height);
                loadCollapsibleEventHandlers(me, myBlock);
            }

            makeBitmap(this, ACTIONCLAMPCOLLAPSED.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('block_label', block_label).replace('font_size', myBlock.protoblock.fontsize), '', processHighlightCollapseBitmap);
        }
    }

    this.unhighlightAll = function() {
        // console.log('unhighlight all');
        for (blk in this.blockList) {
            this.unhighlight(blk);
        }
    }

    this.unhighlight = function(blk) {
        if (!this.visible) {
            return;
        }

        if (blk != null) {
            var thisBlock = blk;
        } else {
            var thisBlock = this.highlightedBlock;
        }

        // console.log('unhighlight');
        if (thisBlock != null) {
            var myBlock = this.blockList[thisBlock];
            if (myBlock.collapsed) {
                if (['start', 'action'].indexOf(myBlock.name) != -1) {
                    myBlock.highlightCollapseBlockBitmap.visible = false;
                    myBlock.collapseBlockBitmap.visible = true;
                    myBlock.collapseText.visible = true;
                }
            } else {
                myBlock.bitmap.visible = true;
                myBlock.highlightBitmap.visible = false;
                if (this.blockList[thisBlock].isExpandableBlock()) {
                    for (var i = 0; i < myBlock.fillerBitmaps.length; i++) {
                        myBlock.fillerBitmaps[i].visible = true;
                        myBlock.highlightFillerBitmaps[i].visible = false;
                    }
                    if (myBlock.bottomBitmap != null) {
                        myBlock.bottomBitmap.visible = true;
                        myBlock.highlightBottomBitmap.visible = false;
                    }
                    if (['start', 'action'].indexOf(myBlock.name) != -1) {
                        myBlock.collapseText.visible = false;
                    }
                }
            }
            try {
                myBlock.container.updateCache();
            } catch (e) {
                console.log(e);
            }
            this.refreshCanvas();
        }
        if (this.highlightedBlock = thisBlock) {
            this.highlightedBlock = null;
        }
    }

    this.highlight = function(blk, unhighlight) {
        if (!this.visible) {
            return;
        }
        // console.log('highlight');
        if (blk != null) {
            if (unhighlight) {
                this.unhighlight(null);
            }
            var myBlock = this.blockList[blk];
            if (myBlock.collapsed) {
                if (['start', 'action'].indexOf(myBlock.name) != -1) {
                    myBlock.highlightCollapseBlockBitmap.visible = true;
                    myBlock.collapseBlockBitmap.visible = false;
                    myBlock.collapseText.visible = true;
                }
            } else {
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
                    if (['start', 'action'].indexOf(myBlock.name) != -1) {
                        myBlock.collapseText.visible = false;
                    }
                }
            }
            try {
                myBlock.container.updateCache();
            } catch (e) {
                console.log(e);
            }
            this.highlightedBlock = blk;
            this.refreshCanvas();
        }
    }

    this.hide = function() {
        // console.log('hide');
        for (var blk in this.blockList) {
            this.blockList[blk].hide();
        }
        this.visible = false;
    }

    this.show = function() {
        // console.log('show');
        for (var blk in this.blockList) {
            this.blockList[blk].show();
        }
        this.visible = true;
    }

    this.makeNewBlockWithConnections = function(name, blockOffset, connections) {
        // console.log('make new block with connections ' + name);
        myBlock = this.makeNewBlock(name);
        if (myBlock == null) {
            console.log('could not make block ' + name);
            return;
        }
        for (var c in connections) {
            if (c == myBlock.docks.length) {
                // console.log('block ' + myBlock.name + ' had an extra connection: ' + connections[c]);
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
        // console.log('makeNewBlock: (' + name + ')');
        if (!name in this.protoBlockDict) {
            console.log('makeNewBlock: no prototype for ' + name);
            return null;
        }
        if (this.protoBlockDict[name] == null) {
            console.log('makeNewBlock: no prototype for ' + name);
            return null;
        }
        this.blockList.push(new Block(this.protoBlockDict[name]));
        if (last(this.blockList) == null) {
            console.log('failed to make protoblock for ' + name);
            return null;
        }
        // We copy the dock because expandable blocks modify it.
        var myBlock = last(this.blockList);
        myBlock.copyDocks();
        myBlock.copySize();

        // We need a container for the block graphics.
        myBlock.container = new createjs.Container();
        this.stage.addChild(myBlock.container);
        myBlock.container.x = myBlock.x;
        myBlock.container.y = myBlock.y;

        // and we need to load the images into the container.
        // console.log('calling image load for ' + myBlock.name);
        this.imageLoad(myBlock);
        return myBlock;
    }

    this.makeBlock = function(name, arg) {
        // Make a new block from a proto block.
        // Called from palettes (and from the load block).
        // console.log('makeBlock: ' + name + ' ' + arg);
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

        var blk = this.blockList.length - 1;
        var myBlock = this.blockList[blk];

        // Each start block gets its own turtle.
        if (name == 'start') {
            // console.log('assigning start block to turtle ' + this.turtles.turtleList.length);
            myBlock.value = this.turtles.turtleList.length;
            this.turtles.add(myBlock);
        }

        for (var i = 0; i < myBlock.docks.length; i++) {
            myBlock.connections.push(null);
        }

        // Attach default args if any
        var cblk = blk + 1;
        for (var i = 0; i < myBlock.protoblock.defaults.length; i++) {
            var value = myBlock.protoblock.defaults[i];
            if (myBlock.docks[i + 1][2] == 'anyin') {
                if (value == null) {
                    console.log('cannot set default value');
                } else if (typeof(value) == 'string') {
                    this.makeNewBlock('text');
                    last(this.blockList).value = value;
                    var label = value.toString();
                    if (label.length > 8) {
                        label = label.substr(0, 7) + '...';
                    }
                    if (last(this.blockList).text == null) {
                        console.log('new block not ready yet: cannot set value for text ' + last(this.blockList).name);
                    } else {
                        last(this.blockList).text.text = label;
                    }
                } else {
                    this.makeNewBlock('number');
                    last(this.blockList).value = value;
                    if (last(this.blockList).text == null) {
                        console.log('new block not ready yet: cannot set value for text ' + last(this.blockList).name);
                    } else {
                        last(this.blockList).text.text = value.toString();
                    }
                }
            } else if (myBlock.docks[i + 1][2] == 'textin') {
                this.makeNewBlock('text');
                last(this.blockList).value = value;
                if (last(this.blockList).text == null) {
                    console.log('new block not ready yet: cannot set value for text ' + last(this.blockList).name);
                } else {
                    if (value == null) {
                        last(this.blockList).text.text = '---';
                    } else {
                        var label = value.toString();
                        if (label.length > 8) {
                            label = label.substr(0, 7) + '...';
                        }
                        last(this.blockList).text.text = label;
                    }
                }
            } else if (myBlock.docks[i + 1][2] == 'mediain') {
                this.makeNewBlock('media');
                last(this.blockList).value = value;
            } else {
                this.makeNewBlock('number');
                if (last(this.blockList).text == null) {
                    console.log('cannot set value for text ' + last(this.blockList).name);
                } else {
                    last(this.blockList).value = value;
                    last(this.blockList).text.text = value.toString();
                }
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
        this.updateBlockPositions();
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

        var myBlock = this.blockList[blk];
        // If this happens, something is really broken.
        if (myBlock == null) {
            console.log('null block encountered... this is bad. ' + blk);
            return;
        }

        // console.log('calc drag group ' + myBlock.name);

        // As before, does these ever happen?
        if (myBlock.connections == null) {
            return;
        }

        if (myBlock.connections.length == 0) {
            return;
        }

        this.dragGroup.push(blk);

        for (var c = 1; c < myBlock.connections.length; c++) {
            var cblk = myBlock.connections[c];
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
            // console.log('does ' + value + ' = ' + name + i.toString() + '?');
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
                        try {
                            this.blockList[blk].container.updateCache();
                        } catch (e) {
                            console.log(e);
                        }
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
                        try {
                            this.blockList[blk].container.updateCache();
                        } catch (e) {
                            console.log(e);
                        }
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
        myStoreinBlock.docks = [
            [20, 0, 'out'],
            [98, 20, 'textin'],
            [98, 62, 'numberin'],
            [20, 84, 'in']
        ];
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
        myBoxBlock.docks = [
            [0, 20, 'numberout'],
            [68, 20, 'textin']
        ];
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
        myDoBlock.docks = [
            [20, 0, 'out'],
            [98, 20, 'textin'],
            [20, 42, 'in']
        ];
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
        myActionBlock.docks = [
            [20, 0, 'unavailable'],
            [98, 34, 'textin'],
            [38, 55, 'in'],
            [20, 80, 'unavailable']
        ];
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

    this.pasteStack = function() {
        // Copy a stack of blocks by creating a blockObjs and passing
        // it to this.load.
        if (this.selectedStack == null) {
            return;
        }
        var blockObjs = [];
        var blockMap = {};

        this.findDragGroup(this.selectedStack);
        for (var b = 0; b < this.dragGroup.length; b++) {
            myBlock = this.blockList[this.dragGroup[b]];
            if (b == 0) {
                x = 25;
                y = 25;
            } else {
                x = 0;
                y = 0;
            }
            if (myBlock.isValueBlock()) {
                blockItem = [b, [myBlock.name, myBlock.value], x, y, []];
            } else {
                blockItem = [b, myBlock.name, x, y, []];
            }
            blockMap[this.dragGroup[b]] = b;
            blockObjs.push(blockItem);
        }
        for (var b = 0; b < this.dragGroup.length; b++) {
            myBlock = this.blockList[this.dragGroup[b]];
            for (var c = 0; c < myBlock.connections.length; c++) {
                if (myBlock.connections[c] == null) {
                    blockObjs[b][4].push(null);
                } else {
                    blockObjs[b][4].push(blockMap[myBlock.connections[c]]);
                }
            }
        }
        this.loadNewBlocks(blockObjs);
    }

    this.loadNewBlocks = function(blockObjs) {
        // We'll need a list of existing storein and action names.
        console.log(blockObjs);
        // Check for blocks connected to themselves,
        // and for action blocks not connected to text blocks.
        for (var b = 0; b < blockObjs.length; b++) {
            var blkData = blockObjs[b];
            for (var c in blkData[4]) {
                if (blkData[4][c] == blkData[0]) {
                    console.log('Circular connection in block data: ' + blkData);
                    console.log('Punting loading of new blocks!');
                    return;
                }
            }
        }

        var currentActionNames = [];
        var currentStoreinNames = [];
        for (var b = 0; b < this.blockList.length; b++) {
            if (this.blockList[b].name == 'action') {
                if (this.blockList[b].connections[1] != null) {
                    currentActionNames.push(this.blockList[this.blockList[b].connections[1]].value);
                }
            } else if (this.blockList[b].name == 'storein') {
                if (this.blockList[b].connections[1] != null) {
                    currentStoreinNames.push(this.blockList[this.blockList[b].connections[1]].value);
                }
            }
        }

        // Don't make duplicate action names.
        // Add a palette entry for any new storein blocks.
        // TODO: check for new storein blocks
        var stringNames = [];
        var stringValues = {}; // label: [blocks with that label]
        var actionNames = {}; // action block: label block
        var storeinNames = {}; // storein block: label block
        var doNames = {}; // do block: label block
        // Scan for any action blocks to identify duplicates.
        for (var b = 0; b < blockObjs.length; b++) {
            var blkData = blockObjs[b];
            if (typeof(blkData[1]) != 'string') {
                if (blkData[1][0] == 'text') {
                    var key = blkData[1][1];
                    if (stringValues[key] == undefined) {
                        stringValues[key] = [];
                    }
                    stringValues[key].push(b);
                } else if (blkData[1][0] == 'hat') {
                    if (blkData[4][1] != null) {
                        actionNames[b] = blkData[4][1];
                    }
                } else if (blkData[1][0] == 'storein') {
                    // console.log('saw a storein block');
                    if (blkData[4][1] != null) {
                        storeinNames[b] = blkData[4][1];
                    }
                }
            } else if (blkData[1] == 'action') {
                if (blkData[4][1] != null) {
                    actionNames[b] = blkData[4][1];
                }
            } else if (blkData[1] == 'storein') {
                // console.log('saw a storein block');
                if (blkData[4][1] != null) {
                    storeinNames[b] = blkData[4][1];
                }
            } else if (blkData[1] == 'do' || blkData[1] == 'stack') {
                if (blkData[4][1] != null) {
                    doNames[b] = blkData[4][1];
                }
            }
        }

        var updatePalettes = false;
        // Make sure new storein names have palette entries.
        // console.log('storin names ' + storeinNames);
        for (var b in storeinNames) {
            var blkData = blockObjs[storeinNames[b]];
            // console.log('processing ' + blkData[1][1]);
            if (currentStoreinNames.indexOf(blkData[1][1]) == -1) {
                console.log('adding new palette entries for ' + blkData[1][1]);
                this.newStoreinBlock(blkData[1][1]);
                this.newBoxBlock(blkData[1][1]);
                updatePalettes = true;
            }
        }

        // Make sure action names are unique.
        for (var b in actionNames) {
            // Is there a proto do block with this name? If so, find a
            // new name.
            // Name = the value of the connected label.
            var blkData = blockObjs[actionNames[b]];
            var name = blkData[1][1];
            var oldName = name;
            var i = 0;
            while (currentActionNames.indexOf(name) != -1) {
                // console.log(name);
                name = blkData[1][1] + i.toString();
                i += 1;
                // Should never happen... but just in case.
                if (i > this.blockList.length) {
                    console.log('could not generate unique action name');
                    break;
                }
            }
            // Change the name of the action...
            console.log('action ' + oldName + ' is being renamed ' + name);
            blkData[1][1] = name;
            // add a new do block to the palette...
            this.newDoBlock(name);
            updatePalettes = true;
            // and any do blocks
            for (var d in doNames) {
                var doBlkData = blockObjs[doNames[d]];
                if (doBlkData[1][1] == oldName) {
                    doBlkData[1][1] = name;
                }
            }
        }

        if (updatePalettes) {
            this.palettes.updatePalettes();
        }

        // Append to the current set of blocks.
        this.adjustTheseDocks = [];
        this.loadCounter = blockObjs.length;
        console.log(this.loadCounter + ' blocks to load');
        var blockOffset = this.blockList.length;
        for (var b = 0; b < blockObjs.length; b++) {
            var thisBlock = blockOffset + b;
            var blkData = blockObjs[b];
            if (typeof(blkData[1]) == 'string') {
                var name = blkData[1];
                var value = null;
            } else {
                var name = blkData[1][0];
                var value = blkData[1][1];
            }

            // console.log(thisBlock + ' ' + name + ' ' + value + ' ' + blkData[4]);

            if (name in NAMEDICT) {
                name = NAMEDICT[name];
            }
            switch (name) {
                // A few special cases.
                case 'start':
                    blkData[4][0] = null;
                    blkData[4][2] = null;
                    this.makeNewBlockWithConnections('start', blockOffset, blkData[4]);
                    // console.log('assigning start block to turtle ' + this.turtles.turtleList.length);
                    last(this.blockList).value = this.turtles.turtleList.length;

                    this.turtles.add(last(this.blockList));
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

                    // Load the thumbnail into a media block.
                case 'media':
                    this.makeNewBlockWithConnections(name, blockOffset, blkData[4]);
                    this.blockList[thisBlock].value = value;
                    if (value != null) {
                        loadThumbnail(this, thisBlock);
                    }
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
                    this.adjustTheseDocks.push(thisBlock);
                }
            }
        }
    }

    this.cleanupAfterLoad = function() {
        // If all the blocks are loaded, we can make the final adjustments.
        this.loadCounter -= 1;
        if (this.loadCounter > 0) {
            // console.log('Still waiting to load ' + this.loadCounter + ' more blocks');
            return;
        }
        console.log('load completed!');
        this.updateBlockPositions();
        this.updateBlockLabels();
        for (var blk = 0; blk < this.adjustTheseDocks.length; blk++) {
            this.loopCounter = 0;
            this.adjustDocks(this.adjustTheseDocks[blk]);
        }

        this.refreshCanvas();

        // We need to wait for the blocks to load before expanding them.
        setTimeout(function() {
            blockBlocks.expand2Args();
        }, 1000);
        setTimeout(function() {
            blockBlocks.expandClamps();
        }, 2000);
    }

    blockBlocks = this;
    return this;
}


// Define block instance objects and any methods that are intra-block.
function Block(protoblock) {
    if (protoblock == null) {
        console.log('null protoblock sent to Block');
        return;
    }
    this.protoblock = protoblock;
    this.name = protoblock.name;
    this.x = 0;
    this.y = 0;
    this.collapsed = false; // Is this block in a collapsed stack?
    this.trash = false; // Is this block in the trash?
    this.loadComplete = false;  // Has the block finished loading?
    this.label = null; // Editable textview in DOM.
    this.text = null; // A dynamically generated text label on block itself.
    this.value = null; // Value for number, text, and media blocks.

    // All blocks have at a container and least one bitmap.
    this.container = null;
    this.bounds = null;
    this.bitmap = null;
    this.highlightBitmap = null;

    // Expandable block features.
    this.fillerCount = 0;
    this.fillerBitmaps = [];
    this.bottomBitmap = null;
    this.highlightFillerBitmaps = [];
    this.highlightBottomBitmap = null;

    // Start and Action blocks has a collapse button (in a separate
    // container).
    this.collapseButton = null;
    this.collapseBitmap = null;
    this.expandBitmap = null;
    this.collapseBlockBitmap = null;
    this.highlightCollapseBlockBitmap = null;
    this.collapseText = null;

    this.size = 1; // Proto size is copied here.
    this.docks = []; // Proto dock is copied here.
    this.connections = []; // Blocks that cannot be run on their own.

    this.copySize = function() {
        this.size = this.protoblock.size;
    }

    this.copyDocks = function() {
        for (var i in this.protoblock.docks) {
            var dock = [this.protoblock.docks[i][0], this.protoblock.docks[i][1], this.protoblock.docks[i][2]];
            this.docks.push(dock);
        }
    }

    this.getInfo = function() {
        return this.name + ' block';
    }

    this.hide = function() {
        this.container.visible = false;
        if (this.collapseButton != null) {
            this.collapseButton.visible = false;
            this.collapseText.visible = false;
        }
    }

    this.show = function() {
        if (!this.trash) {
            // If it is an action block or it is not collapsed then show it.
            if (!(['action', 'start'].indexOf(this.name) == -1 && this.collapsed)) {
                this.container.visible = true;
                if (this.collapseButton != null) {
                    this.collapseButton.visible = true;
                    this.collapseText.visible = true;
                }
            }
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


// Update the block values as they change in the DOM label
function labelChanged() {
    // For some reason, arg passing from the DOM is not working
    // properly, so we need to find the label that changed.

    var blocks = blockBlocks;
    var myBlock = null;
    var oldValue = '';
    var newValue = '';
    for (var blk = 0; blk < blocks.blockList.length; blk++) {
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
    }

    // Update the block value and label.
    if (myBlock.label != null) {
        myBlock.value = myBlock.label.value;
        var label = myBlock.value.toString();
        if (label.length > 8) {
            label = label.substr(0, 7) + '...';
        }
        myBlock.text.text = label;
        // and hide the DOM textview...
        myBlock.label.style.display = 'none';
        // Make sure text is on top.
        lastChild = last(myBlock.container.children);
        myBlock.container.swapChildren(myBlock.text, lastChild);
        try {
            myBlock.container.updateCache();
        } catch (e) {
            console.log(e);
        }
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


// load an image thumbnail onto into block
function loadThumbnail(blocks, thisBlock) {
    if (blocks.blockList[thisBlock].value == null) {
        console.log('loadThumbnail: no image to load?');
        return;
    }
    var image = new Image();
    image.src = blocks.blockList[thisBlock].value;
    var bitmap = new createjs.Bitmap(image);
    blocks.blockList[thisBlock].container.addChild(bitmap);
    if (image.width > image.height) {
        bitmap.scaleX = 108 / image.width;
        bitmap.scaleY = 108 / image.width;
        bitmap.scale = 108 / image.width;
    } else {
        bitmap.scaleX = 80 / image.height;
        bitmap.scaleY = 80 / image.height;
        bitmap.scale = 80 / image.height;
    }
    bitmap.x = 18;
    bitmap.y = 2;
    try {
        blocks.blockList[thisBlock].container.updateCache();
    } catch (e) {
        console.log(e);
    }
    blocks.refreshCanvas();
}

// Open a file from the DOM.
function doOpenMedia(blocks, thisBlock) {
    var fileChooser = docById("myMedia");
    fileChooser.addEventListener("change", function(event) {
        var reader = new FileReader();
        reader.onloadend = (function() {
            if (reader.result) {
                // console.log(reader);
                var dataURL = reader.result;
                blocks.blockList[thisBlock].value = reader.result
                if (blocks.blockList[thisBlock].container.children.length > 2) {
                    blocks.blockList[thisBlock].container.removeChild(last(blocks.blockList[thisBlock].container.children));
                }
                loadThumbnail(blocks, thisBlock);
            }
        });
        reader.readAsDataURL(fileChooser.files[0]);
    }, false);

    fileChooser.focus();
    fileChooser.click();
}


// These are the event handlers for collapsible blocks.
function loadCollapsibleEventHandlers(blocks, myBlock) {
    var thisBlock = blocks.blockList.indexOf(myBlock);
    var hitArea = new createjs.Shape();
    var w2 = 42;
    var h2 = 42;
    hitArea.graphics.beginFill('#FFF').drawEllipse(-w2 / 2, -h2 / 2, w2, h2);
    hitArea.x = w2 / 2;
    hitArea.y = h2 / 2;
    myBlock.collapseButton.hitArea = hitArea;

    var moved = false;
    myBlock.collapseButton.on('click', function(event) {
        if (!moved) {
            // Find the blocks to collapse/expand
            blocks.findDragGroup(thisBlock)
            if (myBlock.collapsed) {
                myBlock.collapsed = false;
                myBlock.collapseBitmap.visible = true;
                myBlock.expandBitmap.visible = false;
                myBlock.collapseBlockBitmap.visible = false;
                myBlock.highlightCollapseBlockBitmap.visible = false;
                myBlock.collapseText.visible = false;
                myBlock.bitmap.visible = false;
                myBlock.highlightBitmap.visible = true;
                myBlock.bottomBitmap.visible = false;
                myBlock.highlightBottomBitmap.visible = true;
                for (var i = 0; i < myBlock.fillerBitmaps.length; i++) {
                    myBlock.fillerBitmaps[i].visible = false;
                    myBlock.highlightFillerBitmaps[i].visible = true;
                }
                if (blocks.dragGroup.length > 0) {
                    for (var b = 0; b < blocks.dragGroup.length; b++) {
                        blk = blocks.dragGroup[b];
                        if (b != 0) {
                            blocks.blockList[blk].collapsed = false;
                            blocks.blockList[blk].container.visible = true;
                        }
                    }
                }
            } else {
                myBlock.collapsed = true;
                myBlock.collapseBitmap.visible = false;
                myBlock.expandBitmap.visible = true;
                myBlock.collapseBlockBitmap.visible = true;
                myBlock.highlightCollapseBlockBitmap.visible = false;
                myBlock.collapseText.visible = true;
                myBlock.bitmap.visible = false;
                myBlock.highlightBitmap.visible = false;
                myBlock.bottomBitmap.visible = false;
                myBlock.highlightBottomBitmap.visible = false;
                for (var i = 0; i < myBlock.fillerBitmaps.length; i++) {
                    myBlock.fillerBitmaps[i].visible = false;
                    myBlock.highlightFillerBitmaps[i].visible = false;
                }
                if (myBlock.name == 'action') {
                    // Label the collapsed block with the action label
                    if (myBlock.connections[1] != null) {
                        myBlock.collapseText.text = blocks.blockList[myBlock.connections[1]].value;
                    } else {
                        myBlock.collapseText.text = '';
                    }
                }
                lastChild = last(myBlock.container.children);
                myBlock.container.swapChildren(myBlock.collapseText, lastChild);
                if (blocks.dragGroup.length > 0) {
                    for (var b = 0; b < blocks.dragGroup.length; b++) {
                        blk = blocks.dragGroup[b];
                        if (b != 0) {
                            blocks.blockList[blk].collapsed = true;
                            blocks.blockList[blk].container.visible = false;
                        }
                    }
                }
            }

            // myBlock.collapseButton.updateCache();
            try {
                myBlock.container.updateCache();
            } catch (e) {
                console.log(e);
            }
            blocks.refreshCanvas();
        }
    });

    myBlock.collapseButton.on('mousedown', function(event) {
        moved = false;
        var offset = {
            x: myBlock.collapseButton.x - event.stageX,
            y: myBlock.collapseButton.y - event.stageY
        };
        myBlock.collapseButton.on('pressmove', function(event) {
            moved = true;
            var oldX = myBlock.collapseButton.x;
            var oldY = myBlock.collapseButton.y;
            myBlock.collapseButton.x = event.stageX + offset.x;
            myBlock.collapseButton.y = event.stageY + offset.y;
            var dx = myBlock.collapseButton.x - oldX;
            var dy = myBlock.collapseButton.y - oldY;
            myBlock.container.x += dx;
            myBlock.container.y += dy;
            myBlock.x = myBlock.container.x;
            myBlock.y = myBlock.container.y;
            myBlock.y = event.stageY + offset.y;

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


    myBlock.container.on('mouseout', function(event) {
        blocks.refreshCanvas();
    });
}


// These are the event handlers for block containers.
function loadEventHandlers(blocks, turtles, myBlock) {
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
        blocks.highlight(thisBlock, true);
        blocks.activeBlock = thisBlock;
        blocks.refreshCanvas();
    });

    var moved = false;
    myBlock.container.on('click', function(event) {
        if (!moved) {
            if (blocks.selectingStack) {
                var topBlock = blocks.findTopBlock(thisBlock);
                blocks.selectedStack = topBlock;
                blocks.selectingStack = false;
            } else if (myBlock.name == 'media') {
                doOpenMedia(blocks, thisBlock);
            } else if (myBlock.isValueBlock() && myBlock.name != 'media') {
                myBlock.label.style.display = '';
            } else {
                var topBlock = blocks.findTopBlock(thisBlock);
                console.log('running from ' + blocks.blockList[topBlock].name);
                blocks.runLogo(topBlock);
            }
        }
    });

    myBlock.container.on('mousedown', function(event) {
        // Bump the bitmap in front of its siblings.
        blocks.stage.swapChildren(myBlock.container, last(blocks.stage.children));
        if (myBlock.collapseButton != null) {
            blocks.stage.swapChildren(myBlock.collapseButton, last(blocks.stage.children));
        }

        moved = false;
        var offset = {
            x: myBlock.container.x - event.stageX,
            y: myBlock.container.y - event.stageY
        };

        myBlock.container.on('pressup', function(event) {});

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
            } else if (myBlock.collapseButton != null) {
                myBlock.collapseButton.x = myBlock.container.x + COLLAPSEBUTTONXOFF;
                myBlock.collapseButton.y = myBlock.container.y + COLLAPSEBUTTONYOFF;
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

    myBlock.container.on('mouseup', function(event) {});

    myBlock.container.on('mouseout', function(event) {
        if (moved) {
            // Check if block is in the trash
            if (trashcan.overTrashcan(event.stageX, event.stageY, blocks.scale)) {
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

                if (myBlock.name == 'start') {
                    turtle = myBlock.value;
                    if (turtle != null) {
                        console.log('putting turtle ' + turtle + ' in the trash');
                        turtles.turtleList[turtle].trash = true;
                        turtles.turtleList[turtle].container.visible = false;
                    } else {
                        console.log('null turtle');
                    }
                }

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
        blocks.unhighlight(null);
        blocks.activeBlock = null;
        blocks.refreshCanvas();
    });
}


function makeBitmap(me, data, name, callback) {
    // Async creation of bitmap from SVG data
    // Works with Chrome, Safari, Firefox (untested on IE)
    var DOMURL = window.URL || window.webkitURL || window;
    var img = new Image();
    var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    var url = DOMURL.createObjectURL(svg);
    img.onload = function () {
        bitmap = new createjs.Bitmap(img);
        DOMURL.revokeObjectURL(url);
        callback(me, name, bitmap);
    }
    img.src = url;
}


function httpGet(projectName)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();

    if (projectName == null) {
        xmlHttp.open("GET", 'https://turtle.sugarlabs.org/server', false);
        xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
    } else {
        xmlHttp.open("GET", 'https://turtle.sugarlabs.org/server/' + projectName, false);
        xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
        // xmlHttp.setRequestHeader('x-project-id', projectName);
    }
    xmlHttp.send();
    return xmlHttp.responseText;
}


function httpPost(projectName, data)
{
    var xmlHttp = null;
    // console.log('sending ' + data);
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", 'https://turtle.sugarlabs.org/server/' + projectName, false);
    xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
    // xmlHttp.setRequestHeader('x-project-id', projectName);
    xmlHttp.send(data);
    // return xmlHttp.responseText;
    return 'https://apps.facebook.com/turtleblocks/?file=' + projectName;
}


function docById(id) {
    return document.getElementById(id);
}


function last(myList) {
    var i = myList.length;
    if (i == 0) {
        return null;
    } else {
        return myList[i - 1];
    }
}
