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

// Minimum distance (squared) between to docks required before
// connecting them.
var MINIMUMDOCKDISTANCE = 400;

// Length of a long touch
var LONGPRESSTIME = 2000;

// There are three "classes" defined in this file: ProtoBlocks,
// Blocks, and Block. Protoblocks are the prototypes from which Blocks
// are created; Blocks is the list of all blocks; and Block is a block
// instance.

// Protoblock contain generic information about blocks and some
// methods common to all blocks.

function ProtoBlock(name) {
    // Name is used run-dictionary index, and palette label.
    this.name = name;
    // The palette to which this block is assigned.
    this.palette = null;
    // The graphic style used by the block.
    this.style = null;
    // Does the block expand (or collapse) when other blocks are
    // attached? e.g., start, repeat...
    this.expandable = false;
    // When a block is expandable, its bottom is drawn with a separate
    // SVG. Bottom offset is the y position of that SVG relative to
    // the top of the block.
    this.bottomOffset = 0;
    // When a block is expanded, filler blocks are inserted. Filler
    // offset is the height of the filler blocks.
    this.fillerOffset = STANDARDBLOCKHEIGHT;
    // Is this block a parameter? Parameters have their labels
    // overwritten with their current value.
    this.parameter = false;
    // How many "non-flow" arguments does a block have? (flow is
    // vertical down a stack; args are horizontal. The pendown block
    // has 0 args; the forward block has 1 arg; the setxy block has 2
    // args.
    this.args = 0;
    // Default values for block parameters, e.g., forward 100 or right 90.
    this.defaults = [];
    // What is the size of the block prior to any expansion?
    this.size = 1;
    // Static labels are generated as part of the inline SVG.
    this.staticLabels = [];
    // Default fontsize used for static labels.
    this.fontsize = '18px';
    // The SVG template used to generate the block graphic.
    this.artwork = [];
    // Docks define where blocks connect and which connections are
    // valid.
    this.docks = [];

    // We need a copy of the dock, since it is modified by individual
    // blocks as they are expanded or contracted.
    this.copyDock = function(dockStyle) {
        for (var i = 0; i < dockStyle.length; i++) {
            var dock = [dockStyle[i][0], dockStyle[i][1], dockStyle[i][2]];
            this.docks.push(dock);
        }
    }

    // What follows are the initializations for different block
    // styles.

    // E.g., penup, pendown
    this.zeroArgBlock = function() {
        this.args = 0;
        this.artwork.push(BASICBLOCK);
        this.copyDock(BASICBLOCKDOCKS);
    }

    // E.g., break
    this.basicBlockNoFlow = function() {
        this.args = 0;
        this.artwork.push(BASICBLOCKNOFLOW);
        this.copyDock(BASICBLOCKNOFLOWDOCKS);
    }

    // E.g., forward, right
    this.oneArgBlock = function() {
        this.args = 1;
        this.artwork.push(BASICBLOCK1ARG);
        this.copyDock(BASICBLOCK1ARGDOCKS);
    }

    // E.g., setxy. These are expandable.
    this.twoArgBlock = function() {
        this.bottomOffset = 49;
        this.expandable = true;
        this.style = 'twoarg';
        this.size = 2;
        this.args = 2;
        this.artwork.push(BASICBLOCK2ARG);
        this.artwork.push(BASICBLOCK2ARGBOTTOM);
        this.copyDock(BASICBLOCK2ARGDOCKS);
    }

    // E.g., sqrt
    this.oneArgMathBlock = function() {
        this.style = 'arg';
        this.size = 1;
        this.args = 1;
        this.artwork.push(ARG1BLOCK);
        this.copyDock(ARG1BLOCKDOCKS);
    }

    // E.g., plus, minus, multiply, divide. These are also expandable.
    this.twoArgMathBlock = function() {
        this.bottomOffset = 49;
        this.expandable = true;
        this.style = 'arg';
        this.size = 2;
        this.args = 2;
        this.artwork.push(ARG2BLOCK);
        this.artwork.push(ARG2BLOCKBOTTOM);
        this.copyDock(ARG2BLOCKDOCKS);
    }

    // E.g., number, string. Value blocks get DOM textareas associated
    // with them so their values can be edited by the user.
    this.valueBlock = function() {
        this.style = 'value';
        this.size = 1;
        this.args = 0;
        this.artwork.push(VALUEBLOCK);
        this.copyDock(VALUEBLOCKDOCKS);
    }

    // E.g., media. Media blocks invoke a chooser and a thumbnail
    // image is overlayed to represent the data associated with the
    // block.
    this.mediaBlock = function() {
        this.style = 'value';
        this.size = 1;
        this.args = 0;
        this.artwork.push(MEDIABLOCK);
        this.copyDock(MEDIABLOCKDOCKS);
    }

    // E.g., start. A "child" flow is docked in an expandable clamp.
    // There are no additional arguments and no flow above or below.
    this.flowClampZeroArgBlock = function() {
        this.style = 'clamp';
        this.bottomOffset = 74;
        this.expandable = true;
        this.size = 2;
        this.args = 1;
        this.artwork.push(FLOWCLAMP0ARG);
        this.artwork.push(FLOWCLAMPBOTTOM);
        this.copyDock(FLOWCLAMP0ARGDOCKS);
    }

    // E.g., action. A "child" flow is docked in an expandable clamp.
    // The additional argument is a name. Again, no flow above or below.
    this.flowClampOneArgBlock = function() {
        this.style = 'clamp';
        this.bottomOffset = 74;
        this.expandable = true;
        this.size = 2;
        this.args = 2;
        this.artwork.push(FLOWCLAMP1ARG);
        this.artwork.push(FLOWCLAMPBOTTOM);
        this.copyDock(FLOWCLAMP1ARGDOCKS);
    }

    // E.g., if.  A "child" flow is docked in an expandable clamp. The
    // additional argument is a boolean. There is flow above and below.
    this.flowClampBooleanArgBlock = function() {
        this.style = 'clamp';
        this.bottomOffset = 116;
        this.expandable = true;
        this.size = 3;
        this.args = 2;
        this.artwork.push(FLOWCLAMPBOOLEANARG);
        this.artwork.push(FLOWCLAMPBOTTOM);
        this.copyDock(FLOWCLAMPBOOLEANDOCKS);
    }

    // E.g., if then else.  Two "child" flows are docked in expandable
    // clamps. The additional argument is a boolean. There is flow
    // above and below.
    this.doubleFlowClampBooleanArgBlock = function() {
        this.style = 'doubleclamp';
        this.middleOffset = 116;
        this.bottomOffset = 84;
        this.expandable = true;
        this.size = 5;
        this.args = 3;
        this.artwork.push(FLOWCLAMPBOOLEANARG);
        this.artwork.push(FLOWCLAMPMIDDLE);
        this.artwork.push(FLOWCLAMPBOTTOM);
        this.copyDock(DOUBLEFLOWCLAMPBOOLEANDOCKS);
    }

    // E.g., forever. Unlike start, there is flow above and below.
    this.blockClampZeroArgBlock = function() {
        this.style = 'clamp';
        this.bottomOffset = 86;
        this.expandable = true;
        this.size = 2;
        this.args = 1;
        this.artwork.push(ACTIONCLAMP0ARG);
        this.artwork.push(FLOWCLAMPBOTTOM);
        this.copyDock(ACTIONCLAMP0ARGDOCKS);
    }

    // E.g., repeat. Unlike action, there is a flow above and below.
    this.blockClampOneArgBlock = function() {
        this.style = 'clamp';
        this.bottomOffset = 86;
        this.expandable = true;
        this.size = 2;
        this.args = 1;
        this.artwork.push(ACTIONCLAMP1ARG);
        this.artwork.push(FLOWCLAMPBOTTOM);
        this.copyDock(ACTIONCLAMP1ARGDOCKS);
    }

    // E.g., mouse button.
    this.booleanZeroArgBlock = function() {
        this.style = 'arg';
        this.size = 1;
        this.args = 0;
        this.artwork.push(BOOLEAN0ARG);
        this.copyDock(BOOLEAN0ARGDOCKS);
    }

    // E.g., not
    this.booleanOneBooleanArgBlock = function() {
        this.style = 'arg';
        this.size = 2;
        this.args = 1;
        this.artwork.push(BOOLEAN1BOOLEANARG);
        this.copyDock(BOOLEAN1BOOLEANARGDOCKS);
    }

    // E.g., and
    this.booleanTwoBooleanArgBlock = function() {
        this.style = 'arg';
        this.size = 3;
        this.args = 2;
        this.artwork.push(BOOLEAN2BOOLEANARGS);
        this.copyDock(BOOLEAN2BOOLEANARGSDOCKS);
    }

    // E.g., greater, less, equal. (FIXME: These should be
    // expandable.)
    this.booleanTwoArgBlock = function() {
        this.style = 'arg';
        this.size = 2;
        this.args = 2;
        this.artwork.push(BOOLEAN2ARG);
        this.copyDock(BOOLEAN2ARGDOCKS);
    }

    // E.g., color, shade, pensize, ...
    this.parameterBlock = function() {
        this.style = 'arg';
        this.parameter = true;
        this.size = 1;
        this.args = 0;
        this.artwork.push(VALUEBLOCK);
        this.copyDock(VALUEBLOCKDOCKS);
    }
}


// Blocks holds the list of blocks and most of the block-associated
// methods, since most block manipulations are inter-block.

function Blocks(canvas, stage, refreshCanvas, trashcan) {
    // Things we need from outside include access to the canvas, the
    // stage, and the trashcan.
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;
    this.trashcan = trashcan;

    // We keep a dictionary for the proto blocks,
    this.protoBlockDict = {}
    // and a list of the blocks we create.
    this.blockList = [];

    // Track the time with mouse down.
    this.time = 0;
    this.timeOut = null;

    // "Copy stack" selects a stack for pasting. Are we selecting?
    this.selectingStack = false;
    // and what did we select?
    this.selectedStack = null;

    // If we somehow have a malformed block database (for example,
    // from importing a corrupted datafile, we need to avoid infinite
    // loops while crawling the block list.
    this.loopCounter = 0;
    this.sizeCounter = 0;
    this.searchCounter = 0;

    // We need a reference to the palettes.
    this.palettes = null;
    // Which block, if any, is highlighted?
    this.highlightedBlock = null;
    // Which block, if any, is active?
    this.activeBlock = null;
    // Are the blocks visible?
    this.visible = true;
    // The group of blocks being dragged or moved together
    this.dragGroup = [];
    // The blocks at the tops of stacks
    this.stackList = [];
    // The blocks that need expanding
    this.expandablesList = [];
    // Cached filler bitmaps that have been removed from expandable
    // blocks. We can reuse them.
    this.bitmapCache = {};
    // Number of blocks to load
    this.loadCounter = 0;
    // Stacks of blocks that need adjusting as blocks are repositioned
    // due to expanding and contracting or insertion into the flow.
    this.adjustTheseDocks = [];

    // We need to keep track of certain classes of blocks that exhibit
    // different types of behavior.

    // Blocks with parts that expand, e.g.,
    this.expandableBlocks = [];
    // Blocks that contain child flows of blocks
    this.clampBlocks = [];
    this.doubleExpandable = [];
    // Blocks that are used as arguments to other blocks
    this.argBlocks = [];
    // Blocks that return values
    this.valueBlocks = [];
    // Two-arg blocks with two arguments (expandable).
    this.twoArgBlocks = [];
    // Blocks that don't run when clicked.
    this.noRunBlocks = ['action'];

    // We need access to the msg block.
    this.setMsgText = function(msgText) {
        this.msgText = msgText;
    }

    // We need access to the turtles list because we associate a
    // turtle with each start block.
    this.setTurtles = function(turtles) {
        this.turtles = turtles;
    }

    // We need to access the "pseudo-Logo interpreter" when we click
    // on blocks.
    this.setLogo = function(runLogo) {
        this.runLogo = runLogo;
    }

    // The scale of the graphics is determined by screen size.
    this.setScale = function(scale) {
        this.scale = scale;
    }

    // We need to tell the activity if we are dragging so it won't
    // scroll the canvas
    this.setDragging = function(setDraggingFlag) {
        this.setDraggingFlag = setDraggingFlag;
    }

    // set up copy/paste buttons
    this.makeCopyPasteButtons = function(makeButton, updatePasteButton) {
        var blocks = this;
        this.updatePasteButton = updatePasteButton;
        this.copyButton = makeButton('copy-button', 0, 0, 55);
        this.copyButton.visible = false;
        this.copyButton.on('click', function(event) {
            var topBlock = blocks.findTopBlock(blocks.activeBlock);
            blocks.selectedStack = topBlock;
            blocks.copyButton.visible = false;
            blocks.dismissButton.visible = false;
            blocks.updatePasteButton();
            blocks.refreshCanvas();
        });
        this.dismissButton = makeButton('cancel-button', 0, 0, 55);
        this.dismissButton.visible = false;
        this.dismissButton.on('click', function(event) {
            blocks.copyButton.visible = false;
            blocks.dismissButton.visible = false;
            blocks.refreshCanvas();
        });
    }

    // Walk through all of the proto blocks in order to make lists of
    // any blocks that need special treatment.
    this.findBlockTypes = function() {
        for (var proto in this.protoBlockDict) {
            if (this.protoBlockDict[proto].expandable) {
                this.expandableBlocks.push(this.protoBlockDict[proto].name);
            }
            if (this.protoBlockDict[proto].style == 'clamp') {
                this.clampBlocks.push(this.protoBlockDict[proto].name);
            }
            if (this.protoBlockDict[proto].style == 'twoarg') {
                this.twoArgBlocks.push(this.protoBlockDict[proto].name);
            }
            if (this.protoBlockDict[proto].style == 'arg') {
                this.argBlocks.push(this.protoBlockDict[proto].name);
            }
            if (this.protoBlockDict[proto].style == 'value') {
                this.argBlocks.push(this.protoBlockDict[proto].name);
                this.valueBlocks.push(this.protoBlockDict[proto].name);
            }
            if (this.protoBlockDict[proto].style == 'doubleclamp') {
                this.doubleExpandable.push(this.protoBlockDict[proto].name);
            }

        }
    }

    // Adjust the docking postions of all blocks in the current drag
    // group.
    this.adjustBlockPositions = function() {
        if (this.dragGroup.length < 2) {
            return;
        }

        // Just in case the block list is corrupted, count iterations.
        this.loopCounter = 0;
        this.adjustDocks(this.dragGroup[0])
    }

    // Adjust the size of the clamp in an expandable block when blocks
    // are inserted into (or removed from) the child flow. This is a
    // common operation for start and action blocks, but also for
    // repeat, forever, if, etc.
    this.adjustExpandableClampBlock = function(blk) {
        var myBlock = this.blockList[blk];

        // Make sure it is the proper type of expandable block.
        if (myBlock.isArgBlock() || myBlock.isTwoArgBlock()) {
            return;
        }

        // First we need to count up the number of (and size of) the
        // blocks inside the clamp; The child flow is the
        // second-to-last argument.
        var c = myBlock.connections.length - 2;
        this.sizeCounter = 0;
        if (c > 0 && myBlock.connections[c] != null) {
            var childFlowSize = this.getStackSize(myBlock.connections[c]);
            if (childFlowSize < 1) {
                // The clamp size is never less than 1.
                childFlowSize = 1;
            }
        } else {
            var childFlowSize = 1;
        }

        // Next, we adjust the clamp size to match the size of the
        // child flow.
        var docksChanged = false;
        var bottomOffset = myBlock.protoblock.bottomOffset;
        var fillerOffset = myBlock.protoblock.fillerOffset;
        var currentFillerCount = myBlock.fillerCount;
        if (childFlowSize < currentFillerCount + 1) {
            // We may have to remove filler.
            var n = currentFillerCount - childFlowSize + 1;
            for (var i = 0; i < n; i++) {
                // We need to remove filler.
                this.removeFiller(blk);
                // And decrement the count and the offset to the
                // bottom dock position.
                myBlock.fillerCount -= 1;
                last(myBlock.docks)[1] -= fillerOffset;
                docksChanged = true;
            }
        } else if (childFlowSize > currentFillerCount) {
            // We may have to add filler.
            var n = childFlowSize - currentFillerCount - 1;
            for (var i = 0; i < n; i++) {
                var c = i + currentFillerCount;
                // We need to add filler.
                this.addFiller(blk, bottomOffset + c * fillerOffset, c);
                // And increment the count and the offset to the
                // bottom dock position.
                myBlock.fillerCount += 1;
                last(myBlock.docks)[1] += fillerOffset;
                docksChanged = true;
            }
        }

        // Finally, since the block size has changed and consequently
        // the dock positions have changed, we need to make sure that
        // any flow that continues from this block is positioned
        // properly.
        if (docksChanged) {
            if (last(myBlock.connections) != null) {
                this.loopCounter = 0;
                this.adjustDocks(blk);
            }
        }
    }

    // Returns the block size. (TODO recurse on first argument in
    // twoarg blocks.)
    this.getBlockSize = function(blk) {
        return this.blockList[blk].size;
    }

    // We also adjust the size of twoarg blocks. It is similar to how
    // we adjust clamps, but enough different that it is in its own
    // function.
    this.adjustExpandableTwoArgBlock = function(blk) {
        var myBlock = this.blockList[blk];

        // First we determine the size of the first argument.
        var c = myBlock.connections[1];
        if (c == null) {
            var firstArgumentSize = 0;
        } else {
            var firstArgumentSize = this.getBlockSize(c);
        }

        if (firstArgumentSize < 1) {
            firstArgumentSize = 1; // Minimum size
        }

        // Next, adjust the block size to match.
        var docksChanged = false;
        var bottomOffset = myBlock.protoblock.bottomOffset;
        var fillerOffset = myBlock.protoblock.fillerOffset;
        var currentFillerCount = myBlock.fillerCount;
        if (firstArgumentSize < currentFillerCount + 1) {
            // We need to remove filler.
            var n = currentFillerCount - firstArgumentSize + 1;
            for (var i = 0; i < n; i++) {
                // Remove the filler from the container.
                this.removeFiller(blk);
                // And decrement the count and the offset to the
                // bottom dock position.
                myBlock.fillerCount -= 1;
                myBlock.docks[2][1] -= fillerOffset;
                docksChanged = true;
                if (!myBlock.isArgBlock()) {
                    // Blocks with "out flow", e.g., setxy, have
                    // another dock position to adjust.
                    myBlock.docks[3][1] -= fillerOffset;
                }
                myBlock.size -= 1;
            }
        } else if (firstArgumentSize > currentFillerCount) {
            // We need to add filler.
            var n = firstArgumentSize - currentFillerCount - 1;
            for (var i = 0; i < n; i++) {
                var c = i + currentFillerCount;
                // Add the filler to the container.
                this.addFiller(blk, bottomOffset + c * fillerOffset, c);
                // And increment the count and the offset to the
                // bottom dock position.
                myBlock.fillerCount += 1;
                myBlock.docks[2][1] += fillerOffset;
                docksChanged = true;
                if (!myBlock.isArgBlock()) {
                    // Blocks with "out flow", e.g., setxy, have
                    // another dock position to adjust.
                    myBlock.docks[3][1] += fillerOffset;
                }
                myBlock.size += 1;
            }
        }

        // Finally, since the block size has changed and consequently
        // the dock positions have changed, we need to make sure that
        // any argument flows from this block are positioned properly.
        if (docksChanged) {
            if (myBlock.isArgBlock()) {
                // Arg blocks such as plus, minus, etc.
                if (myBlock.connections[2] != null) {
                    this.loopCounter = 0;
                    this.adjustDocks(blk);
                }
            } else {
                // In the case of flow blocks, e.g., setxy
                if (myBlock.connections[2] != null) {
                    // The position of the second argument has changed.
                    this.loopCounter = 0;
                    this.adjustDocks(blk);
                } else if (myBlock.connections[3] != null) {
                    // The "out flow" needs to be moved
                    this.loopCounter = 0;
                    this.adjustDocks(blk);
                }
            }
        }
    }

    this.removeFiller = function(blk) {
        // When we remove filler, we cache it in case it is added back
        // in later.
        var myBlock = this.blockList[blk];
        var fillerBitmap = myBlock.fillerBitmaps.pop();

        myBlock.container.removeChild(fillerBitmap);
        this.bitmapCache[fillerBitmap.name] = fillerBitmap;

        myBlock.bottomBitmap.y -= myBlock.protoblock.fillerOffset;
        myBlock.highlightBottomBitmap.y = myBlock.bottomBitmap.y;

        try {
            // FIXME: There is a potential race conditon such that the
            // container cache is not yet ready.
            myBlock.container.uncache();
            myBlock.bounds = myBlock.container.getBounds();
            myBlock.container.cache(myBlock.bounds.x, myBlock.bounds.y, myBlock.bounds.width, myBlock.bounds.height);
        } catch (e) {
            console.log(e);
        }
    }

    this.addFiller = function(blk, offset, c) {
        // Add filler to an expandable block.
        var myBlock = this.blockList[blk];

        function processBitmap(me, name, bitmap, myBlock) {
            myBlock.fillerBitmaps.push(bitmap);
            myBlock.container.addChild(bitmap);
            bitmap.x = myBlock.bitmap.x;
            bitmap.y = myBlock.bitmap.y + offset;
            bitmap.name = name;

            me.refreshCanvas();
        }

        // We generate a unique name to use as the key in the cache.
        var name = 'bmp_' + blk + '_filler_' + c;
        // FIXME: Why doesn't !name in this.bitmapCache work?
        if (this.bitmapCache[name] == undefined) {
            if (myBlock.isArgBlock()) {
                var artwork = ARG2BLOCKFILLER;
            } else if (myBlock.isTwoArgBlock()) {
                var artwork = BASICBLOCK2ARGFILLER;
            } else {
                var artwork = CLAMPFILLER;
            }
            makeBitmap(this, artwork.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]), name, processBitmap, myBlock);
        } else {
            processBitmap(this, name, this.bitmapCache[name], myBlock);
        }

        function processHighlightBitmap(me, name, bitmap, myBlock) {
            myBlock.highlightFillerBitmaps.push(bitmap);
            myBlock.container.addChild(bitmap);
            bitmap.x = myBlock.bitmap.x;
            bitmap.y = myBlock.bitmap.y + offset;
            bitmap.name = name;
            // Hide highlight to start
            bitmap.visible = false;

            myBlock.bottomBitmap.y += myBlock.protoblock.fillerOffset;
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
        if (this.bitmapCache[name] == undefined) {
            if (myBlock.isArgBlock()) {
                var artwork = ARG2BLOCKFILLER;
            } else if (myBlock.isTwoArgBlock()) {
                var artwork = BASICBLOCK2ARGFILLER;
            } else {
                var artwork = CLAMPFILLER;
            }
            makeBitmap(this, artwork.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]), name, processHighlightBitmap, myBlock);
        } else {
            processHighlightBitmap(this, name, this.bitmapCache[name], myBlock);
        }
    }

    this.getStackSize = function(blk) {
        // How many block units (fillerOffest) in this stack?
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

    this.adjustDocks = function(blk, resetLoopCounter) {
        // Give a block, adjust the dock positions
        // of all of the blocks connected to it

        // For when we come in from makeBlock
        if (resetLoopCounter != null) {
            this.loopCounter = 0;
        }

        // These checks are to test for malformed data. All blocks
        // should have connections.
        if (this.blockList[blk] == null) {
            console.log('Saw a null block: ' + blk);
            return;
        }
        if (this.blockList[blk].connections == null) {
            console.log('Saw a block with null connections: ' + blk);
            return;
        }
        if (this.blockList[blk].connections.length == 0) {
            console.log('Saw a block with [] connections: ' + blk);
            return;
        }

        // Value blocks only have one dock.
        if (this.blockList[blk].docks.length == 1) {
            return;
        }

        this.loopCounter += 1;
        if (this.loopCounter > this.blockList.length * 2) {
            console.log('Infinite loop encountered while adjusting docks: ' + blk + ' ' + this.blockList);
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

            // Another database integrety check.
            if (this.blockList[cblk] == null) {
                console.log('This is not good: we encountered a null block: ' + cblk);
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

            // Yet another database integrety check.
            if (!foundMatch) {
                console.log('Did not find match for ' + this.blockList[blk].name + ' and ' + this.blockList[cblk].name);
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
        // (1) Is it an arg block connected to a two-arg block?
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

        var checkTwoArgBlocks = [];
        var myBlock = this.blockList[thisBlock];
        // console.log('block moved ' + myBlock.name);
        var c = myBlock.connections[0];
        if (c != null) {
            var cBlock = this.blockList[c];
        }
        // If it is an arg block, where is it coming from?
        if (myBlock.isArgBlock() && c != null) {
            // We care about twoarg (2arg) blocks with
            // connections to the first arg;
            if (this.blockList[c].isTwoArgBlock()) {
                if (cBlock.connections[1] == thisBlock) {
                    checkTwoArgBlocks.push(c);
                }
            } else if (this.blockList[c].isArgBlock() && this.blockList[c].isExpandableBlock()) {
                if (cBlock.connections[1] == thisBlock) {
                    checkTwoArgBlocks.push(c);
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
        // TODO: Make minimum distance relative to scale.
        var min = MINIMUMDOCKDISTANCE;
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
            // TODO: some graphical feedback re new connection?
        }

        // If it is an arg block, where is it coming from?
        if (myBlock.isArgBlock() && newBlock != null) {
            // We care about twoarg blocks with connections to the
            // first arg;
            if (this.blockList[newBlock].isTwoArgBlock()) {
                if (this.blockList[newBlock].connections[1] == thisBlock) {
                    if (checkTwoArgBlocks.indexOf(newBlock) == -1) {
                        checkTwoArgBlocks.push(newBlock);
                    }
                }
            } else if (this.blockList[newBlock].isArgBlock() && this.blockList[newBlock].isExpandableBlock()) {
                if (this.blockList[newBlock].connections[1] == thisBlock) {
                    if (checkTwoArgBlocks.indexOf(newBlock) == -1) {
                        checkTwoArgBlocks.push(newBlock);
                    }
                }
            }
        }
        // If we changed the contents of a two-arg block, we need to
        // adjust it.
        if (checkTwoArgBlocks.length > 0) {
            for (var i = 0; i < checkTwoArgBlocks.length; i++) {
                this.adjustExpandableTwoArgBlock(checkTwoArgBlocks[i]);
            }
        }

        // Recheck if the connection is inside of a expandable block.
        var blk = this.insideExpandableBlock(thisBlock);
        var expandableLoopCounter = 0;
        while (blk != null) {
            // Extra check for malformed data.
            expandableLoopCounter += 1;
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
        // If we changed the contents of an expandable block, we need
        // to adjust its clamp.
        if (checkExpandableBlocks.length > 0) {
            for (var i = 0; i < checkExpandableBlocks.length; i++) {
                this.adjustExpandableClampBlock(checkExpandableBlocks[i]);
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
        for (var blk in this.blockList) {
            var myBlock = this.blockList[blk];
            this.stage.removeChild(myBlock.container);
            this.stage.addChild(myBlock.container);
            if (myBlock.collapseContainer != null) {
                this.stage.removeChild(myBlock.collapseContainer);
                this.stage.addChild(myBlock.collapseContainer);
            }
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
            if (myBlock.collapseContainer != null) {
                myBlock.collapseContainer.x = x + COLLAPSEBUTTONXOFF;
                myBlock.collapseContainer.y = y + COLLAPSEBUTTONYOFF;
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
        if (myBlock.container != null) {
            myBlock.container.x += dx;
            myBlock.container.y += dy;
            myBlock.x = myBlock.container.x;
            myBlock.y = myBlock.container.y;
            this.adjustLabelPosition(blk, myBlock.container.x, myBlock.container.y);
            if (myBlock.collapseContainer != null) {
                myBlock.collapseContainer.x += dx;
                myBlock.collapseContainer.y += dy;
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
        if (myBlock.text == null) {
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

        if (myBlock.loadComplete) {
            myBlock.container.updateCache();
        }
    }

    this.updateBlockLabels = function() {
        // The modifiable labels are stored in the DOM with a unique
        // id for each block.  For the moment, we only have labels for
        // number and text blocks.
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
                console.log(myBlock.name);
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
        this.findStacks(); // We start by finding the stacks
        for (var i = 0; i < this.stackList.length; i++) {
            this.searchCounter = 0;
            this.searchForExpandables(this.stackList[i]);
        }
    }

    this.findTwoArgs = function() {
        // Find any expandable arg blocks.
        this.expandablesList = [];
        for (var i = 0; i < this.blockList.length; i++) {
            if (this.blockList[i].isArgBlock() && this.blockList[i].isExpandableBlock()) {
                this.expandablesList.push(i);
            } else if (this.blockList[i].isTwoArgBlock()) {
                this.expandablesList.push(i);
            }
        }
    }

    this.searchForExpandables = function(blk) {
        // Find the expandable blocks below blk in a stack.
        while (blk != null && this.blockList[blk] != null && !this.blockList[blk].isValueBlock()) {
            // More checks for malformed or corrupted block data.
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

    this.expandTwoArgs = function() {
        // Expand expandable 2-arg blocks as needed.
        this.findTwoArgs();
        for (var i = 0; i < this.expandablesList.length; i++) {
            this.adjustExpandableTwoArgBlock(this.expandablesList[i]);
        }
        this.refreshCanvas();
    }

    this.expandClamps = function() {
        // Expand expandable clamp blocks as needed.
        this.findClamps();
        for (var i = 0; i < this.expandablesList.length; i++) {
            this.adjustExpandableClampBlock(this.expandablesList[i]);
        }
        this.refreshCanvas();
    }

    this.imageLoad = function(myBlock) {
        // Load a block image and create any extra parts. Image
        // components are loaded asynchronously so most the work
        // happens in callbacks.

        var thisBlock = this.blockList.indexOf(myBlock);

        // We need a label for most blocks.
        // TODO: use Text exclusively for all block labels.
        myBlock.text = new createjs.Text('', '20px Arial', '#000000');
        doubleExpandable = this.doubleExpandable;

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
        function processBitmap(me, name, bitmap, myBlock) {
            myBlock.bitmap = bitmap;
            myBlock.container.addChild(myBlock.bitmap);
            myBlock.bitmap.x = 0;
            myBlock.bitmap.y = 0;
            myBlock.bitmap.name = 'bmp_' + thisBlock;
            myBlock.bitmap.cursor = 'pointer';
            me.refreshCanvas();
        }

        makeBitmap(this, myBlock.protoblock.artwork[0].replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('block_label', block_label).replace('top_label', top_label).replace('font_size', myBlock.protoblock.fontsize), myBlock.name, processBitmap, myBlock);

        // Create the highlight bitmap for the block.
        function processHighlightBitmap(me, name, bitmap, myBlock) {
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
            loadEventHandlers(me, myBlock);
            me.refreshCanvas();
            if (doubleExpandable.indexOf(myBlock.name) != -1) {
              me.middleImageLoad(myBlock);
            }
            else {
              me.finishImageLoad(myBlock);
            }

          }

          makeBitmap(this, myBlock.protoblock.artwork[0].replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('block_label', block_label).replace('top_label', top_label).replace('font_size', myBlock.protoblock.fontsize), '', processHighlightBitmap, myBlock);
        }

      this.middleImageLoad = function(myBlock) {
          // Load a block image and create any extra parts. Image
          // components are loaded asynchronously so most the work
          // happens in callbacks.

          var thisBlock = this.blockList.indexOf(myBlock);

          // We need a label for most blocks.
          // TODO: use Text exclusively for all block labels.
          myBlock.text = new createjs.Text('', '20px Arial', '#000000');

          // Get the block labels from the protoblock
          var block_label = myBlock.protoblock.staticLabels[2];

          var middleOffset = myBlock.protoblock.middleOffset;

          // Create the bitmap for the block.
          function processBitmap(me, name, bitmap, myBlock) {
            myBlock.bitmap = bitmap;
            myBlock.container.addChild(myBlock.bitmap);
            myBlock.bitmap.x = myBlock.bitmap.x;
            myBlock.bitmap.y = myBlock.bitmap.y + middleOffset;
            myBlock.bitmap.name = 'bmp_' + thisBlock;
            myBlock.bitmap.cursor = 'pointer';
            me.refreshCanvas();
          }

          makeBitmap(this, myBlock.protoblock.artwork[1].replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('mid_label', block_label).replace('top_label', '').replace('font_size', myBlock.protoblock.fontsize), myBlock.name, processBitmap, myBlock);

          // Create the highlight bitmap for the block.
          function processHighlightBitmap(me, name, bitmap, myBlock) {
            myBlock.middleHighlightBitmap = bitmap;
            myBlock.container.addChild(myBlock.middleHighlightBitmap);
            myBlock.middleHighlightBitmap.x = myBlock.bitmap.x;
            myBlock.middleHighlightBitmap.y = myBlock.bitmap.y;;
            myBlock.middleHighlightBitmap.name = 'bmp_highlight_' + thisBlock;
            myBlock.middleHighlightBitmap.cursor = 'pointer';
            myBlock.middleHighlightBitmap.visible = false;
            me.finishImageLoad(myBlock);
          }

          makeBitmap(this, myBlock.protoblock.artwork[1].replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('mid_label', block_label).replace('top_label', '').replace('font_size', myBlock.protoblock.fontsize), '', processHighlightBitmap, myBlock);
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
            myBlock.text.x = VALUETEXTX;
            myBlock.text.y = VALUETEXTY;

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
                myBlock.text.x = BOXTEXTX;
            } else {
                myBlock.text.x = PARAMETERTEXTX;
            }
            myBlock.text.y = VALUETEXTY;

            lastChild = last(myBlock.container.children);
            myBlock.container.swapChildren(myBlock.text, lastChild);
            myBlock.container.updateCache();
        }

        if (myBlock.isExpandableBlock()) {
            // Expandable blocks also have some extra parts.
            bottomArtwork = last(myBlock.protoblock.artwork);
            var bottomOffset = myBlock.protoblock.bottomOffset;
            myBlock.fillerBitmaps = [];
            myBlock.bottomBitmap = null;

            function processBottomBitmap(me, name, bitmap, myBlock) {
                myBlock.bottomBitmap = bitmap;
                myBlock.container.addChild(myBlock.bottomBitmap);
                myBlock.bottomBitmap.x = myBlock.bitmap.x;
                myBlock.bottomBitmap.y = myBlock.bitmap.y + bottomOffset;
                myBlock.bottomBitmap.name = 'bmp_' + thisBlock + '_bottom';
                me.refreshCanvas();
            }

            makeBitmap(this, bottomArtwork.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('bottom_label', bottom_label), '', processBottomBitmap, myBlock);

            function processHighlightBottomBitmap(me, name, bitmap, myBlock) {
                myBlock.highlightBottomBitmap = bitmap;
                myBlock.container.addChild(myBlock.highlightBottomBitmap);
                myBlock.highlightBottomBitmap.x = myBlock.bitmap.x;
                myBlock.highlightBottomBitmap.y = myBlock.bitmap.y + bottomOffset;
                myBlock.highlightBottomBitmap.name = 'bmp_' + thisBlock + '_highlight_bottom';
                myBlock.highlightBottomBitmap.visible = false;

                // We added a bottom block, so we need to recache.
                myBlock.container.uncache();
                myBlock.bounds = myBlock.container.getBounds();
                myBlock.container.cache(myBlock.bounds.x, myBlock.bounds.y, myBlock.bounds.width, myBlock.bounds.height);
                // console.log('recaching ' + myBlock.name);
                myBlock.loadComplete = true;
                if (myBlock.postProcess != null) {
                    myBlock.postProcess(myBlock.postProcessArg);
                }
                me.refreshCanvas();
                me.cleanupAfterLoad();
            }

            makeBitmap(this, bottomArtwork.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('bottom_label', bottom_label), '', processHighlightBottomBitmap, myBlock);
        } else {
            myBlock.loadComplete = true;
            if (myBlock.postProcess != null) {
                myBlock.postProcess(myBlock.postProcessArg);
            }
            this.refreshCanvas();
            this.cleanupAfterLoad();
        }

        // Start blocks and Action blocks can collapse, so add an
        // event handler
        if (['start', 'action'].indexOf(myBlock.name) != -1) {
            block_label = ''; // We use a Text element for the label

            function processCollapseBitmap(me, name, bitmap, myBlock) {
                myBlock.collapseBlockBitmap = bitmap;
                myBlock.container.addChild(myBlock.collapseBlockBitmap);
                myBlock.collapseBlockBitmap.visible = false;
                me.refreshCanvas();
            }

            makeBitmap(this, ACTIONCLAMPCOLLAPSED.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('block_label', block_label).replace('font_size', myBlock.protoblock.fontsize), '', processCollapseBitmap, myBlock);

            function processHighlightCollapseBitmap(me, name, bitmap, myBlock) {
                myBlock.highlightCollapseBlockBitmap = bitmap;
                myBlock.container.addChild(myBlock.highlightCollapseBlockBitmap);
                myBlock.highlightCollapseBlockBitmap.visible = false;
                me.refreshCanvas();

                if (myBlock.name == 'action') {
                    myBlock.collapseText = new createjs.Text('action', '20px Arial', '#000000');
                    myBlock.collapseText.x = ACTIONTEXTX;
                    myBlock.collapseText.y = ACTIONTEXTY;
                    myBlock.collapseText.textAlign = 'right';
                } else {
                    myBlock.collapseText = new createjs.Text('start', '20px Arial', '#000000');
                    myBlock.collapseText.x = STARTTEXTX;
                    myBlock.collapseText.y = ACTIONTEXTY;
                    myBlock.collapseText.textAlign = 'left';
                }
                myBlock.collapseText.textBaseline = 'alphabetic';
                myBlock.container.addChild(myBlock.collapseText);
                myBlock.collapseText.visible = false;

                myBlock.collapseContainer = new createjs.Container();

                var image = new Image();
                image.onload = function() {
                    myBlock.collapseBitmap = new createjs.Bitmap(image);
                    myBlock.collapseContainer.addChild(myBlock.collapseBitmap);
                    finishCollapseButton(myBlock);
                }
                image.src = 'images/collapse.svg';

                finishCollapseButton = function(myBlock) {
                    var image = new Image();
                    image.onload = function() {
                        myBlock.expandBitmap = new createjs.Bitmap(image);
                        myBlock.collapseContainer.addChild(myBlock.expandBitmap);
                        myBlock.expandBitmap.visible = false;
                        var bounds = myBlock.collapseContainer.getBounds();
                        myBlock.collapseContainer.cache(bounds.x, bounds.y, bounds.width, bounds.height);
                        loadCollapsibleEventHandlers(me, myBlock);
                    }
                    image.src = 'images/expand.svg';
                }

                me.stage.addChild(myBlock.collapseContainer);
                myBlock.collapseContainer.x = myBlock.container.x + COLLAPSEBUTTONXOFF;
                myBlock.collapseContainer.y = myBlock.container.y + COLLAPSEBUTTONYOFF;
            }

            makeBitmap(this, ACTIONCLAMPCOLLAPSED.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[myBlock.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.protoblock.palette.name]).replace('block_label', block_label).replace('font_size', myBlock.protoblock.fontsize), '', processHighlightCollapseBitmap, myBlock);
        }
    }

    this.unhighlightAll = function() {
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

        if (thisBlock != null) {
            var myBlock = this.blockList[thisBlock];
            try {
              myBlock.middleHighlightBitmap.visible = false;
            } catch(e) {}
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
        if (blk != null) {
            if (unhighlight) {
                this.unhighlight(null);
            }
            var myBlock = this.blockList[blk];

            try {
              myBlock.middleHighlightBitmap.visible = true;
            } catch(e) {}

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

    this.makeNewBlockWithConnections = function(name, blockOffset, connections, postProcess, postProcessArg) {
        myBlock = this.makeNewBlock(name, postProcess, postProcessArg);
        if (myBlock == null) {
            console.log('could not make block ' + name);
            return;
        }
        for (var c in connections) {
            if (c == myBlock.docks.length) {
                break;
            }
            if (connections[c] == null) {
                myBlock.connections.push(null);
            } else {
                myBlock.connections.push(connections[c] + blockOffset);
            }
        }
    }

    this.makeNewBlock = function(name, postProcess, postProcessArg) {
        // Create a new block
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

        // We may need to do some postProcessing to the block
        myBlock.postProcess = postProcess;
        myBlock.postProcessArg = postProcessArg;

        // We need a container for the block graphics.
        myBlock.container = new createjs.Container();
        this.stage.addChild(myBlock.container);
        myBlock.container.x = myBlock.x;
        myBlock.container.y = myBlock.y;

        // and we need to load the images into the container.
        this.imageLoad(myBlock);
        return myBlock;
    }

    this.makeBlock = function(name, arg) {
        // Make a new block from a proto block.
        // Called from palettes (and from the load block).

        var postProcess = null;
        var postProcessArg = null;
	var me = this;
	var thisBlock = this.blockList.length;
	if (name == 'media') {
	    postProcess = function(args) {
		var thisBlock = args[0];
		var value = args[1];
		me.blockList[thisBlock].value = value;
                if (value == null) {
                    loadThumbnail(me, thisBlock, 'images/load-media.svg');
                } else {
                    loadThumbnail(me, thisBlock, null);
		}
	    }
	    postProcessArg = [thisBlock, null];
	}

        for (var proto in this.protoBlockDict) {
            if (this.protoBlockDict[proto].name == name) {
                if (arg == '__NOARG__') {
                    this.makeNewBlock(proto, postProcess, postProcessArg);
                    break;
                } else {
                    if (this.protoBlockDict[proto].defaults[0] == arg) {
                        this.makeNewBlock(proto, postProcess, postProcessArg);
                        break;
                    }
                }
            }
        }

        var blk = this.blockList.length - 1;
        var myBlock = this.blockList[blk];

        // Each start block gets its own turtle.
        if (name == 'start') {
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
	    var me = this;
	    var thisBlock = this.blockList.length;
            if (myBlock.docks[i + 1][2] == 'anyin') {
                if (value == null) {
                    console.log('cannot set default value');
                } else if (typeof(value) == 'string') {
		    postProcess = function(args) {
			var thisBlock = args[0];
			var value = args[1];
			me.blockList[thisBlock].value = value;
			var label = value.toString();
			if (label.length > 8) {
                            label = label.substr(0, 7) + '...';
			}
                        me.blockList[thisBlock].text.text = label;
		    }
                    this.makeNewBlock('text', postProcess, [thisBlock, value]);
                } else {
		    postProcess = function(args) {
			var thisBlock = args[0];
			var value = args[1];
			me.blockList[thisBlock].value = value;
                        me.blockList[thisBlock].text.text = value.toString();
		    }
                    this.makeNewBlock('number', postProcess, [thisBlock, value]);
                }
            } else if (myBlock.docks[i + 1][2] == 'textin') {
		postProcess = function(args) {
		    var thisBlock = args[0];
		    var value = args[1];
		    me.blockList[thisBlock].value = value;
		    var label = value.toString();
		    if (label.length > 8) {
                        label = label.substr(0, 7) + '...';
		    }
                    me.blockList[thisBlock].text.text = label;
		}
                this.makeNewBlock('text', postProcess, [thisBlock, value]);
            } else if (myBlock.docks[i + 1][2] == 'mediain') {
		postProcess = function(args) {
		    var thisBlock = args[0];
		    var value = args[1];
		    me.blockList[thisBlock].value = value;
                    if (value == null) {
                        loadThumbnail(me, thisBlock, 'images/load-media.svg');
                    } else {
                        loadThumbnail(me, thisBlock, null);
		    }
		}
                this.makeNewBlock('media', postProcess, [thisBlock, value]);
            } else {
		postProcess = function(args) {
		    var thisBlock = args[0];
		    var value = args[1];
		    me.blockList[thisBlock].value = value;
                    me.blockList[thisBlock].text.text = value.toString();
		}
                this.makeNewBlock('number', postProcess, [thisBlock, value]);
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
        myActionBlock.bottomOffset = 86;
        myActionBlock.fillerOffset = 42;
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

    this.triggerLongPress = function(myBlock) {
        this.timeOut == null;
        // FIXME: top block in stack
        console.log('BRING UP COPY BUTTON FOR BLOCK ' + myBlock.name);
        this.copyButton.visible = true;
        this.copyButton.x = myBlock.container.x - 27;
        this.copyButton.y = myBlock.container.y - 27;
        this.dismissButton.visible = true;
        this.dismissButton.x = myBlock.container.x + 27;
        this.dismissButton.y = myBlock.container.y - 27;
        this.refreshCanvas();
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
                    if (blkData[4][1] != null) {
                        storeinNames[b] = blkData[4][1];
                    }
                }
            } else if (blkData[1] == 'action') {
                if (blkData[4][1] != null) {
                    actionNames[b] = blkData[4][1];
                }
            } else if (blkData[1] == 'storein') {
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
        for (var b in storeinNames) {
            var blkData = blockObjs[storeinNames[b]];
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

            if (name in NAMEDICT) {
                name = NAMEDICT[name];
            }

            var me = this;
            switch (name) {
                // A few special cases.
            case 'start':
                blkData[4][0] = null;
                blkData[4][2] = null;

                postProcess = function(thisBlock) {
                    me.blockList[thisBlock].value = me.turtles.turtleList.length;

                    me.turtles.add(me.blockList[thisBlock]);
                }
                this.makeNewBlockWithConnections('start', blockOffset, blkData[4], postProcess, thisBlock);
                break;
            case 'action':
            case 'hat':
                blkData[4][0] = null;
                blkData[4][3] = null;
                this.makeNewBlockWithConnections('action', blockOffset, blkData[4], null, null);
                break;

                // Value blocks need a default value set.
            case 'number':
            case 'text':
                postProcess = function(args) {
                    var thisBlock = args[0];
                    var value = args[1];
                    me.blockList[thisBlock].value = value;
                    me.updateBlockText(thisBlock);
                }
                this.makeNewBlockWithConnections(name, blockOffset, blkData[4], postProcess, [thisBlock, value]);
                break;

                // Load the thumbnail into a media block.
            case 'media':
                postProcess = function(args) {
                    var thisBlock = args[0];
                    var value = args[1];
                    me.blockList[thisBlock].value = value;
                    if (value == null) {
                        loadThumbnail(me, thisBlock, 'images/load-media.svg');
                    } else {
                        loadThumbnail(me, thisBlock, null);
		    }
                }
                this.makeNewBlockWithConnections(name, blockOffset, blkData[4], postProcess, [thisBlock, value]);
                break;

                // Define some constants for legacy blocks for
                // backward compatibility with Python projects.
            case 'red':
            case 'white':
                postProcess = function(thisBlock) {
                    me.blockList[thisBlock].value = 0;
                    me.updateBlockText(thisBlock);
                }
                this.makeNewBlockWithConnections('number', blockOffset, blkData[4], postProcess, thisBlock);
                break;
            case 'orange':
                postProcess = function(thisBlock) {
                    me.blockList[thisBlock].value = 10;
                    me.updateBlockText(thisBlock);
                }
                this.makeNewBlockWithConnections('number', blockOffset, blkData[4], postProcess, thisBlock);
                break;
            case 'yellow':
                postProcess = function(thisBlock) {
                    me.blockList[thisBlock].value = 20;
                    me.updateBlockText(thisBlock);
                }
                this.makeNewBlockWithConnections('number', blockOffset, blkData[4], postProcess, thisBlock);
                break;
            case 'green':
                postProcess = function(thisBlock) {
                    me.blockList[thisBlock].value = 40;
                    me.updateBlockText(thisBlock);
                }
                this.makeNewBlockWithConnections('number', blockOffset, blkData[4], postProcess, thisBlock);
                break;
            case 'blue':
                postProcess = function(thisBlock) {
                    me.blockList[thisBlock].value = 70;
                    me.updateBlockText(thisBlock);
                }
                this.makeNewBlockWithConnections('number', blockOffset, blkData[4], postProcess, thisBlock);
                break;
            case 'leftpos':
                postProcess = function(thisBlock) {
                    me.blockList[thisBlock].value = -(canvas.width / 2);
                    me.updateBlockText(thisBlock);
                }
                this.makeNewBlockWithConnections('number', blockOffset, blkData[4], postProcess, thisBlock);
                break;
            case 'rightpos':
                postProcess = function(thisBlock) {
                    me.blockList[thisBlock].value = (canvas.width / 2);
                    me.updateBlockText(thisBlock);
                }
                this.makeNewBlockWithConnections('number', blockOffset, blkData[4], postProcess, thisBlock);
                break;
            case 'toppos':
                postProcess = function(thisBlock) {
                    me.blockList[thisBlock].value = (canvas.height / 2);
                    me.updateBlockText(thisBlock);
                }
                this.makeNewBlockWithConnections('number', blockOffset, blkData[4], postProcess, thisBlock);
                break;
            case 'botpos':
            case 'bottompos':
                postProcess = function(thisBlock) {
                    me.blockList[thisBlock].value = -(canvas.height / 2);
                    me.updateBlockText(thisBlock);
                }
                this.makeNewBlockWithConnections('number', blockOffset, blkData[4], postProcess, thisBlock);
                break;
            case 'width':
                postProcess = function(thisBlock) {
                    me.blockList[thisBlock].value = canvas.width;
                    me.updateBlockText(thisBlock);
                }
                this.makeNewBlockWithConnections('number', blockOffset, blkData[4], postProcess, thisBlock);
                break;
            case 'height':
                postProcess = function(thisBlock) {
                    me.blockList[thisBlock].value = canvas.height;
                    me.updateBlockText(thisBlock);
                }
                this.makeNewBlockWithConnections('number', blockOffset, blkData[4], postProcess, thisBlock);
                break;
            default:
                this.makeNewBlockWithConnections(name, blockOffset, blkData[4], null);
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
            return;
        }

        this.updateBlockPositions();
        this.updateBlockLabels();
        for (var blk = 0; blk < this.adjustTheseDocks.length; blk++) {
            this.loopCounter = 0;
            this.adjustDocks(this.adjustTheseDocks[blk]);
        }

        this.refreshCanvas();

        // We need to wait for the blocks to load before expanding them.
        setTimeout(function() {blockBlocks.expandTwoArgs();}, 1000);
        setTimeout(function() {blockBlocks.expandClamps();}, 2000);
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
    this.collapseContainer = null;
    this.collapseBitmap = null;
    this.expandBitmap = null;
    this.collapseBlockBitmap = null;
    this.highlightCollapseBlockBitmap = null;
    this.collapseText = null;

    this.size = 1; // Proto size is copied here.
    this.docks = []; // Proto dock is copied here.
    this.connections = []; // Blocks that cannot be run on their own.

    // Some blocks have some post process after they are first loaded.
    this.postProcess = null;
    this.postProcessArg = null;

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
        if (this.collapseContainer != null) {
            this.collapseContainer.visible = false;
            this.collapseText.visible = false;
        }
    }

    this.show = function() {
        if (!this.trash) {
            // If it is an action block or it is not collapsed then show it.
            if (!(['action', 'start'].indexOf(this.name) == -1 && this.collapsed)) {
                this.container.visible = true;
                if (this.collapseContainer != null) {
                    this.collapseContainer.visible = true;
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

    this.isTwoArgBlock = function() {
        return this.protoblock.style == 'twoarg';
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


// Load an image thumbnail onto into block.
function loadThumbnail(blocks, thisBlock, imagePath) {
    if (blocks.blockList[thisBlock].value == null && imagePath == null) {
        console.log('loadThumbnail: no image to load?');
        return;
    }
    var image = new Image();

    image.onload = function() {
        var bitmap = new createjs.Bitmap(image);
        // FIXME: Determine these values computationally based on the size
        // of the media block.
        if (image.width > image.height) {
            bitmap.scaleX = 108 / image.width;
            bitmap.scaleY = 108 / image.width;
            bitmap.scale = 108 / image.width;
        } else {
            bitmap.scaleX = 80 / image.height;
            bitmap.scaleY = 80 / image.height;
            bitmap.scale = 80 / image.height;
        }
        blocks.blockList[thisBlock].container.addChild(bitmap);
        bitmap.x = 18;
        bitmap.y = 2;

        blocks.blockList[thisBlock].container.updateCache();
        blocks.refreshCanvas();
    }

    if (imagePath == null) {
	image.src = blocks.blockList[thisBlock].value;
    } else {
	image.src = imagePath;
    }
}


// Open a file from the DOM.
function doOpenMedia(blocks, thisBlock) {
    var fileChooser = docById("myMedia");
    fileChooser.addEventListener("change", function(event) {
        var reader = new FileReader();
        reader.onloadend = (function() {
            if (reader.result) {
                var dataURL = reader.result;
                blocks.blockList[thisBlock].value = reader.result
                if (blocks.blockList[thisBlock].container.children.length > 2) {
                    blocks.blockList[thisBlock].container.removeChild(last(blocks.blockList[thisBlock].container.children));
                }
                loadThumbnail(blocks, thisBlock, null);
            }
        });
        reader.readAsDataURL(fileChooser.files[0]);
    }, false);

    fileChooser.focus();
    fileChooser.click();
}


// TODO: Consolidate into loadEventHandlers
// These are the event handlers for collapsible blocks.
function loadCollapsibleEventHandlers(blocks, myBlock) {
    var thisBlock = blocks.blockList.indexOf(myBlock);

    var bounds = myBlock.collapseContainer.getBounds();
    var hitArea = new createjs.Shape();
    var w2 = bounds.width;
    var h2 = bounds.height;
    hitArea.graphics.beginFill('#FFF').drawEllipse(-w2 / 2, -h2 / 2, w2, h2);
    hitArea.x = w2 / 2;
    hitArea.y = h2 / 2;
    myBlock.collapseContainer.hitArea = hitArea;

    myBlock.collapseContainer.on('mouseover', function(event) {
        blocks.highlight(thisBlock, true);
        blocks.activeBlock = thisBlock;
        blocks.refreshCanvas();
    });

    var moved = false;
    myBlock.collapseContainer.on('click', function(event) {
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

            myBlock.collapseContainer.updateCache();
            myBlock.container.updateCache();
            blocks.refreshCanvas();
        }
    });

    myBlock.collapseContainer.on('mousedown', function(event) {
        // Always show the trash when there is a block selected.
        trashcan.show();
        moved = false;
        var offset = {
            x: myBlock.collapseContainer.x - Math.round(event.stageX / blocks.scale),
            y: myBlock.collapseContainer.y - Math.round(event.stageY / blocks.scale)
        };

        myBlock.collapseContainer.on('pressmove', function(event) {
            moved = true;
            var oldX = myBlock.collapseContainer.x;
            var oldY = myBlock.collapseContainer.y;
            myBlock.collapseContainer.x = Math.round(event.stageX / blocks.scale + offset.x);
            myBlock.collapseContainer.y = Math.round(event.stageY / blocks.scale + offset.y);
            var dx = myBlock.collapseContainer.x - oldX;
            var dy = myBlock.collapseContainer.y - oldY;
            myBlock.container.x += dx;
            myBlock.container.y += dy;
            myBlock.x = myBlock.container.x;
            myBlock.y = myBlock.container.y;

            // If we are over the trash, warn the user.
            if (trashcan.overTrashcan(event.stageX / blocks.scale, event.stageY / blocks.scale)) {
                trashcan.highlight();
            } else {
                trashcan.unhighlight();
            }

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

    myBlock.collapseContainer.on('mouseout', function(event) {
        // Always hide the trash when there is no block selected.
        trashcan.hide();
        blocks.unhighlight(thisBlock);
        if (moved) {
            // Check if block is in the trash.
            if (trashcan.overTrashcan(event.stageX / blocks.scale, event.stageY / blocks.scale)) {
                sendStackToTrash(blocks, myBlock);
            } else {
                // Otherwise, process move.
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


// These are the event handlers for block containers.
function loadEventHandlers(blocks, myBlock) {
    var thisBlock = blocks.blockList.indexOf(myBlock);
    var hitArea = new createjs.Shape();
    var bounds = myBlock.container.getBounds()
    hitArea.graphics.beginFill('#FFF').drawRect(0, 0, bounds.width, bounds.height);
    myBlock.container.hitArea = hitArea;

    myBlock.container.on('mouseover', function(event) {
        blocks.setDraggingFlag(true);
        displayMsg(blocks, 'mouseover');
        blocks.highlight(thisBlock, true);
        blocks.activeBlock = thisBlock;
        blocks.refreshCanvas();
    }, true);

    var moved = false;
    myBlock.container.on('click', function(event) {
        displayMsg(blocks, 'click');
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
    }, true);

    myBlock.container.on('mousedown', function(event) {
        blocks.setDraggingFlag(true);
        displayMsg(blocks, 'mousedown');

        // Track time for detecting long pause.
        var d = new Date();
        blocks.time = d.getTime();
        blocks.timeOut = setTimeout(function(){blocks.triggerLongPress(myBlock);}, LONGPRESSTIME);

        // Always show the trash when there is a block selected.
        trashcan.show();

        // Bump the bitmap in front of its siblings.
        blocks.stage.swapChildren(myBlock.container, last(blocks.stage.children));
        if (myBlock.collapseContainer != null) {
            blocks.stage.swapChildren(myBlock.collapseContainer, last(blocks.stage.children));
        }

        moved = false;
        var offset = {
            x: myBlock.container.x - Math.round(event.stageX / blocks.scale),
            y: myBlock.container.y - Math.round(event.stageY / blocks.scale)
        };

        myBlock.container.on('mouseout', function(event) {
            blocks.setDraggingFlag(false);
            displayMsg(blocks, 'mousedown->mouseout');
            mouseoutCallback(blocks, myBlock, event, moved);
        });

        myBlock.container.on('pressup', function(event) {
            blocks.setDraggingFlag(false);
            displayMsg(blocks, 'mousedown->pressup');
            mouseoutCallback(blocks, myBlock, event, moved);
        });

        myBlock.container.on('pressmove', function(event) {
            // FIXME: More voodoo
            event.nativeEvent.preventDefault();

            displayMsg(blocks, 'mousedown->pressmove');

            // FIXME: need to remove timer
            if (blocks.timeOut != null) {
                clearTimeout(blocks.timeOut);
                blocks.timeOut = null;
            }
            moved = true;
            var oldX = myBlock.container.x;
            var oldY = myBlock.container.y;
            myBlock.container.x = Math.round(event.stageX / blocks.scale) + offset.x;
            myBlock.container.y = Math.round(event.stageY / blocks.scale) + offset.y;
            myBlock.x = myBlock.container.x;
            myBlock.y = myBlock.container.y;
            var dx = Math.round(myBlock.container.x - oldX);
            var dy = Math.round(myBlock.container.y - oldY);

            // If we are over the trash, warn the user.
            if (trashcan.overTrashcan(event.stageX / blocks.scale, event.stageY / blocks.scale)) {
                trashcan.highlight();
            } else {
                trashcan.unhighlight();
            }

            if (myBlock.isValueBlock() && myBlock.name != 'media') {
                // Ensure text is on top
                var lastChild = last(myBlock.container.children);
                myBlock.container.swapChildren(myBlock.text, lastChild);
            } else if (myBlock.collapseContainer != null) {
                myBlock.collapseContainer.x = myBlock.container.x + COLLAPSEBUTTONXOFF;
                myBlock.collapseContainer.y = myBlock.container.y + COLLAPSEBUTTONYOFF;
            }

            // Move the label.
            blocks.adjustLabelPosition(thisBlock, myBlock.container.x, myBlock.container.y);

            // Move any connected blocks.
            blocks.findDragGroup(thisBlock)
            if (blocks.dragGroup.length > 0) {
                for (var b = 0; b < blocks.dragGroup.length; b++) {
                    var blk = blocks.dragGroup[b];
                    if (b != 0) {
                        blocks.moveBlockRelative(blk, dx, dy);
                    }
                }
            }
            blocks.refreshCanvas();
        }, true);
    }, true);

    myBlock.container.on('mouseout', function(event) {
        blocks.setDraggingFlag(false);
        displayMsg(blocks, 'mouseout');
        mouseoutCallback(blocks, myBlock, event, moved);
    }, true);
}


function displayMsg(blocks, text) {
    return;
    var msgContainer = blocks.msgText.parent;
    msgContainer.visible = true;
    blocks.msgText.text = text;
    msgContainer.updateCache();
    blocks.stage.swapChildren(msgContainer, last(blocks.stage.children));
}


function mouseoutCallback(blocks, myBlock, event, moved) {
    var thisBlock = blocks.blockList.indexOf(myBlock);
    // Always hide the trash when there is no block selected.
    // FIXME: need to remove timer
    if (blocks.timeOut != null) {
        clearTimeout(blocks.timeOut);
        blocks.timeOut = null;
    }
    trashcan.hide();
    if (moved) {
        // Check if block is in the trash.
        if (trashcan.overTrashcan(event.stageX / blocks.scale, event.stageY / blocks.scale)) {
            sendStackToTrash(blocks, myBlock);
        } else {
            // Otherwise, process move.
            blocks.blockMoved(thisBlock);
        }
    }

    if (blocks.activeBlock != myBlock) {
        return;
    }
    blocks.unhighlight(null);
    blocks.activeBlock = null;
    blocks.refreshCanvas();
}


function sendStackToTrash(blocks, myBlock) {
    var thisBlock = blocks.blockList.indexOf(myBlock);
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
            blocks.turtles.turtleList[turtle].trash = true;
            blocks.turtles.turtleList[turtle].container.visible = false;
        } else {
            console.log('null turtle');
        }
    }

    // put drag group in trash
    blocks.findDragGroup(thisBlock);
    for (var b = 0; b < blocks.dragGroup.length; b++) {
        var blk = blocks.dragGroup[b];
        console.log('putting ' + blocks.blockList[blk].name + ' in the trash');
        blocks.blockList[blk].trash = true;
        blocks.blockList[blk].hide();
        blocks.refreshCanvas();
    }
}


function makeBitmap(me, data, name, callback, args) {
    // Async creation of bitmap from SVG data
    // Works with Chrome, Safari, Firefox (untested on IE)
    var img = new Image();
    img.onload = function () {
        bitmap = new createjs.Bitmap(img);
        callback(me, name, bitmap, args);
    }
    img.src = 'data:image/svg+xml;base64,' + window.btoa(
        unescape(encodeURIComponent(data)));

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
