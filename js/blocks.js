// Copyright (c) 2014,2015 Walter Bender
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

// Special value flags to uniquely identify these media blocks.
var CAMERAVALUE = '##__CAMERA__##';
var VIDEOVALUE = '##__VIDEO__##';

// Length of a long touch
var LONGPRESSTIME = 2000;

// Block bitmaps
var TOP = 0;
var MID = 1;
var BOT = 2;

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
    // When a block is expandable, its artwork is drawn with a separate
    // SVGs. artworkOffset is the y position of the SVGs relative to
    // the top of the block.
    this.artworkOffset = [];
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
        this.artwork.push(null);
        this.artwork.push(null);
        this.copyDock(BASICBLOCKDOCKS);
    }

    // E.g., break
    this.basicBlockNoFlow = function() {
        this.args = 0;
        this.artwork.push(BASICBLOCKNOFLOW);
        this.artwork.push(null);
        this.artwork.push(null);
        this.copyDock(BASICBLOCKNOFLOWDOCKS);
    }

    // E.g., forward, right
    this.oneArgBlock = function() {
        this.args = 1;
        this.artwork.push(BASICBLOCK1ARG);
        this.artwork.push(null);
        this.artwork.push(null);
        this.copyDock(BASICBLOCK1ARGDOCKS);
    }

    // E.g., setxy. These are expandable.
    this.twoArgBlock = function() {
        this.artworkOffset = [0, 0, 49];
        this.expandable = true;
        this.style = 'twoarg';
        this.size = 2;
        this.args = 2;
        this.artwork.push(BASICBLOCK2ARG);
        this.artwork.push(null);
        this.artwork.push(BASICBLOCK2ARGBOTTOM);
        this.copyDock(BASICBLOCK2ARGDOCKS);
    }

    // E.g., sqrt
    this.oneArgMathBlock = function() {
        this.style = 'arg';
        this.size = 1;
        this.args = 1;
        this.artwork.push(ARG1BLOCK);
        this.artwork.push(null);
        this.artwork.push(null);
        this.copyDock(ARG1BLOCKDOCKS);
    }

    // E.g., box
    this.oneArgMathWithLabelBlock = function() {
        this.style = 'arg';
        this.size = 1;
        this.args = 1;
        this.artwork.push(ARG1LABELBLOCK);
        this.artwork.push(null);
        this.artwork.push(null);
        this.copyDock(ARG1BLOCKDOCKS);
    }

    // E.g., plus, minus, multiply, divide. These are also expandable.
    this.twoArgMathBlock = function() {
        this.artworkOffset = [0, 0, 49];
        this.expandable = true;
        this.style = 'arg';
        this.size = 2;
        this.args = 2;
        this.artwork.push(ARG2BLOCK);
        this.artwork.push(null);
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
        this.artwork.push(null);
        this.artwork.push(null);
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
        this.artwork.push(null);
        this.artwork.push(null);
        this.copyDock(MEDIABLOCKDOCKS);
    }

    // E.g., start. A "child" flow is docked in an expandable clamp.
    // There are no additional arguments and no flow above or below.
    this.flowClampZeroArgBlock = function() {
        this.style = 'clamp';
        this.artworkOffset = [0, 0, 74];
        this.expandable = true;
        this.size = 2;
        this.args = 1;
        this.artwork.push(FLOWCLAMP0ARG);
        this.artwork.push(null);
        this.artwork.push(FLOWCLAMPBOTTOM);
        this.copyDock(FLOWCLAMP0ARGDOCKS);
    }

    // E.g., repeat. Unlike action, there is a flow above and below.
    this.flowClampOneArgBlock = function() {
        this.style = 'clamp';
        this.artworkOffset = [0, 0, 74];
        this.expandable = true;
        this.size = 2;
        this.args = 2;
        this.artwork.push(FLOWCLAMP1ARG);
        this.artwork.push(null);
        this.artwork.push(FLOWCLAMPBOTTOM);
        this.copyDock(FLOWCLAMP1ARGDOCKS);
    }

    // E.g., if.  A "child" flow is docked in an expandable clamp. The
    // additional argument is a boolean. There is flow above and below.
    this.flowClampBooleanArgBlock = function() {
        this.style = 'clamp';
        this.artworkOffset = [0, 0, 116];
        this.expandable = true;
        this.size = 3;
        this.args = 2;
        this.artwork.push(FLOWCLAMPBOOLEANARG);
        this.artwork.push(null);
        this.artwork.push(FLOWCLAMPBOTTOM);
        this.copyDock(FLOWCLAMPBOOLEANDOCKS);
    }

    // E.g., if then else.  Two "child" flows are docked in expandable
    // clamps. The additional argument is a boolean. There is flow
    // above and below.
    this.doubleFlowClampBooleanArgBlock = function() {
        this.style = 'doubleclamp';
        this.artworkOffset = [0, 116, 200];
        this.expandable = true;
        this.size = 4;
        this.args = 3;
        this.artwork.push(FLOWCLAMPBOOLEANARG);
        this.artwork.push(FLOWCLAMPMIDDLE);
        this.artwork.push(FLOWCLAMPBOTTOM);
        this.copyDock(DOUBLEFLOWCLAMPBOOLEANDOCKS);
    }

    // E.g., forever. Unlike start, there is flow above and below.
    this.blockClampZeroArgBlock = function() {
        this.style = 'clamp';
        this.artworkOffset = [0, 0, 86];
        this.expandable = true;
        this.size = 2;
        this.args = 1;
        this.artwork.push(ACTIONCLAMP0ARG);
        this.artwork.push(null);
        this.artwork.push(ACTIONCLAMPBOTTOM);
        this.copyDock(ACTIONCLAMP0ARGDOCKS);
    }

    // E.g., action. A "child" flow is docked in an expandable clamp.
    // The additional argument is a name. Again, no flow above or below.
    this.blockClampOneArgBlock = function() {
        this.style = 'clamp';
        this.artworkOffset = [0, 0, 86];
        this.expandable = true;
        this.size = 2;
        this.args = 1;
        this.artwork.push(ACTIONCLAMP1ARG);
        this.artwork.push(null);
        this.artwork.push(ACTIONCLAMPBOTTOM);
        this.copyDock(ACTIONCLAMP1ARGDOCKS);
    }

    // E.g., mouse button.
    this.booleanZeroArgBlock = function() {
        this.style = 'arg';
        this.size = 1;
        this.args = 0;
        this.artwork.push(BOOLEAN0ARG);
        this.artwork.push(null);
        this.artwork.push(null);
        this.copyDock(BOOLEAN0ARGDOCKS);
    }

    // E.g., not
    this.booleanOneBooleanArgBlock = function() {
        this.style = 'arg';
        this.size = 2;
        this.args = 1;
        this.artwork.push(BOOLEAN1BOOLEANARG);
        this.artwork.push(null);
        this.artwork.push(null);
        this.copyDock(BOOLEAN1BOOLEANARGDOCKS);
    }

    // E.g., and
    this.booleanTwoBooleanArgBlock = function() {
        this.style = 'arg';
        this.size = 3;
        this.args = 2;
        this.artwork.push(BOOLEAN2BOOLEANARGS);
        this.artwork.push(null);
        this.artwork.push(null);
        this.copyDock(BOOLEAN2BOOLEANARGSDOCKS);
    }

    this.booleanOneArgBlock = function() {
        this.style = 'arg';
        this.size = 1;
        this.args = 1;
        this.artwork.push(BOOLEAN1ARG);
        this.artwork.push(null);
        this.artwork.push(null);
        this.copyDock(BOOLEAN1ARGDOCKS);
    }

    // E.g., greater, less, equal. (FIXME: These should be
    // expandable.)
    this.booleanTwoArgBlock = function() {
        this.style = 'arg';
        this.size = 2;
        this.args = 2;
        this.artwork.push(BOOLEAN2ARG);
        this.artwork.push(null);
        this.artwork.push(null);
        this.copyDock(BOOLEAN2ARGDOCKS);
    }

    // E.g., color, shade, pensize, ...
    this.parameterBlock = function() {
        this.style = 'arg';
        this.parameter = true;
        this.size = 1;
        this.args = 0;
        this.artwork.push(VALUEBLOCK);
        this.artwork.push(null);
        this.artwork.push(null);
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

    // Toggle state of collapsible blocks.
    this.toggleCollapsibles = function() {
        for (var blk in this.blockList) {
            var myBlock = this.blockList[blk];
            if (['start', 'action'].indexOf(myBlock.name) != -1) {
                collapseToggle(this, myBlock);
            }
        }
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

        function clampAdjuster(me, blk, myBlock, clamp) {
            // First we need to count up the number of (and size of) the
            // blocks inside the clamp; The child flow is the
            // second-to-last argument.
            if (clamp == BOT) {
                var c = myBlock.connections.length - 2;
            } else { // MID
                var c = myBlock.connections.length - 3;
            }
            me.sizeCounter = 0;
            var childFlowSize = 1;
            if (c > 0 && myBlock.connections[c] != null) {
                childFlowSize = Math.max(me.getStackSize(myBlock.connections[c]), 1);
            }

            function adjustFillerAndDocks(myBlock, clamp, delta) {
                myBlock.fillerCount[clamp] += delta;
                var offset = delta * myBlock.protoblock.fillerOffset;
                if (clamp == BOT) {
                    last(myBlock.docks)[1] += offset;
                } else { // MID
                    myBlock.docks[3][1] += offset;
                    myBlock.docks[4][1] += offset;
                    for (var filler in myBlock.fillerBitmaps[BOT]) {
                        myBlock.fillerBitmaps[BOT][filler].y += offset;
                    }
                    for (var filler in myBlock.highlightFillerBitmaps[BOT]) {
                        myBlock.highlightFillerBitmaps[BOT][filler].y += offset;
                    }
                }
            }

            // Next, we adjust the clamp size to match the size of the
            // child flow.
            var docksChanged = false;
            while (childFlowSize < myBlock.fillerCount[clamp] + 1) {
                // Remove filler.
                adjustFillerAndDocks(myBlock, clamp, -1);
                myBlock.removeFiller(clamp);
                docksChanged = true;
            }
            while (childFlowSize > myBlock.fillerCount[clamp] + 1) {
                // Add filler.
                var c = myBlock.fillerCount[clamp];
                adjustFillerAndDocks(myBlock, clamp, 1);
                myBlock.addFiller(clamp, c);
                docksChanged = true;
            }
            return docksChanged;
        }

        var docksChanged = false;
        if (myBlock.isDoubleClampBlock()) {
            docksChanged = clampAdjuster(this, blk, myBlock, MID);
        }
        if (clampAdjuster(this, blk, myBlock, BOT)) {
            docksChanged = true;
        }

        // Finally, since the block size has changed and consequently
        // the dock positions have changed, we need to make sure that
        // any flow that continues from this block is positioned
        // properly.
        if (docksChanged) {
            this.loopCounter = 0;
            this.adjustDocks(blk);
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
        var firstArgumentSize = 1; // Minimum size
        if (c != null) {
            firstArgumentSize = Math.max(this.getBlockSize(c), 1);
        }

        // Next, adjust the block size to match.
        var docksChanged = false;
        while (firstArgumentSize < myBlock.fillerCount[BOT] + 1) {
            // Remove filler.
            myBlock.removeFiller(BOT);
            myBlock.fillerCount[BOT] -= 1;
            myBlock.docks[2][1] -= myBlock.protoblock.fillerOffset;
            docksChanged = true;
            if (!myBlock.isArgBlock()) {
                // Blocks with "out flow", e.g., setxy, have
                // another dock position to adjust.
                myBlock.docks[3][1] -= myBlock.protoblock.fillerOffset;
            }
            myBlock.size -= 1;
        }
        while (firstArgumentSize > myBlock.fillerCount[BOT] + 1) {
            // Add filler.
            myBlock.addFiller(BOT, myBlock.fillerCount[BOT]);
            myBlock.fillerCount[BOT] += 1;
            myBlock.docks[2][1] += myBlock.protoblock.fillerOffset;
            docksChanged = true;
            if (!myBlock.isArgBlock()) {
                // Blocks with "out flow", e.g., setxy, have
                // another dock position to adjust.
                myBlock.docks[3][1] += myBlock.protoblock.fillerOffset;
            }
            myBlock.size += 1;
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

    this.addRemoveVspaceBlock = function(blk) {
        var myBlock = blockBlocks.blockList[blk];

        var c = myBlock.connections[myBlock.connections.length - 2];
        var secondArgumentSize = 1;
        if (c != null) {
            var secondArgumentSize = Math.max(this.getBlockSize(c), 1);
        }

        var vSpaceCount = howManyVSpaceBlocksBelow(blk);
        if (secondArgumentSize < vSpaceCount + 1) {
            // Remove a vspace block
            var n = Math.abs(secondArgumentSize - vSpaceCount - 1);
            for (var i = 0; i < n; i++) {
                var lastConnection = myBlock.connections.length - 1;
                var vspaceBlock = this.blockList[myBlock.connections[lastConnection]];
                var nextBlockIndex = vspaceBlock.connections[1];
                myBlock.connections[lastConnection] = nextBlockIndex;
                if (nextBlockIndex != null) {
                    this.blockList[nextBlockIndex].connections[0] = blk;
                }
                vspaceBlock.connections = [null, null];
                vspaceBlock.hide();
            }
        } else if (secondArgumentSize > vSpaceCount + 1) {
            // Add a vspace block
            var n = secondArgumentSize - vSpaceCount - 1;
            for (var nextBlock, newPos, i = 0; i < n; i++) {
                nextBlock = last(myBlock.connections);
                newPos = blockBlocks.blockList.length;

                blockBlocks.makeNewBlockWithConnections('vspace', newPos, [null, null], function(args) {
                    var vspace = args[1];
                    var nextBlock = args[0];
                    var vspaceBlock = blockBlocks.blockList[vspace];
                    vspaceBlock.connections[0] = blk;
                    vspaceBlock.connections[1] = nextBlock;
                    myBlock.connections[myBlock.connections.length - 1] = vspace;
                    if (nextBlock) {
                        blockBlocks.blockList[nextBlock].connections[0] = vspace;
                    }
                }, [nextBlock, newPos]);
            }
        }

        function howManyVSpaceBlocksBelow(blk) {
            // Need to know how many vspace blocks are below the block
            // we're checking against.
            var nextBlock = last(blockBlocks.blockList[blk].connections);
            if (nextBlock && blockBlocks.blockList[nextBlock].name == 'vspace') {
                return 1 + howManyVSpaceBlocksBelow(nextBlock);
                // Recurse until it isn't a vspace
            }
            return 0;
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
            var csize = 0;
            if (c > 0) {
                var cblk = myBlock.connections[c];
                if (cblk != null) {
                    csize = this.getStackSize(cblk);
                }
                if (csize == 0) {
                    size = 1; // minimum of 1 slot in clamp
                } else {
                    size = csize;
                }
            }
            if (myBlock.isDoubleClampBlock()) {
                var c = myBlock.connections.length - 3;
                var csize = 0;
                if (c > 0) {
                    var cblk = myBlock.connections[c];
                    if (cblk != null) {
                        var csize = this.getStackSize(cblk);
                    }
                    if (csize == 0) {
                        size += 1; // minimum of 1 slot in clamp
                    } else {
                        size += csize;
                    }
                }
            }
            // add top and bottom of clamp
            size += myBlock.size;
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
            if (this.blockList[blk].bitmap[0] == null) {
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
            checkExpandableBlocks.push(blk);
            blk = this.insideExpandableBlock(blk);
        }

        var checkTwoArgBlocks = [];
        var checkArgBlocks = [];
        var myBlock = this.blockList[thisBlock];
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
            // We also care about the second-to-last connection to an arg block.
            var n = this.blockList[newBlock].connections.length;
            if (this.blockList[newBlock].connections[n - 2] == thisBlock) {
                // Only flow blocks.
                if (this.blockList[newBlock].docks[n - 1][2] == 'in') {
                    checkArgBlocks.push(newBlock);
                }
            }
        }
        // If we changed the contents of a arg block, we may need a vspace.
        if (checkArgBlocks.length > 0) {
            for (var i = 0; i < checkArgBlocks.length; i++) {
                this.addRemoveVspaceBlock(checkArgBlocks[i]);
            }
        }

        // If we changed the contents of a two-arg block, we need to
        // adjust it.
        if (checkTwoArgBlocks.length > 0) {
            for (var i = 0; i < checkTwoArgBlocks.length; i++) {
                this.adjustExpandableTwoArgBlock(checkTwoArgBlocks[i]);
            }
        }

        var blocks = this;

        // FIXME: Make these callbacks so there is no race condition.
        setTimeout(function() {
            // First, adjust the docks for any blocks that may have
            // had a vspace added.
            for (var i = 0; i < checkArgBlocks.length; i++) {
                blocks.adjustDocks(checkArgBlocks[i]);
            }
            // Next, recheck if the connection is inside of a
            // expandable block.
            var blk = blocks.insideExpandableBlock(thisBlock);
            var expandableLoopCounter = 0;
            while (blk != null) {
                // Extra check for malformed data.
                expandableLoopCounter += 1;
                if (expandableLoopCounter > 2 * blocks.blockList.length) {
                    console.log('Infinite loop checking for expandables?');
                    console.log(blocks.blockList);
                    break;
                }
                if (checkExpandableBlocks.indexOf(blk) == -1) {
                    checkExpandableBlocks.push(blk);
                }
                blk = blocks.insideExpandableBlock(blk);
            }
            blocks.refreshCanvas();
        }, 500);

        setTimeout(function() {
            // If we changed the contents of an expandable block, we need
            // to adjust its clamp.
            if (checkExpandableBlocks.length > 0) {
                for (var i = 0; i < checkExpandableBlocks.length; i++) {
                    blocks.adjustExpandableClampBlock(checkExpandableBlocks[i]);
                }
            }
            blocks.refreshCanvas();
        }, 1000);
    }

    this.testConnectionType = function(type1, type2) {
        // Can these two blocks dock?
        if (type1 == 'in' && type2 == 'out') {
            return true;
        }
        if (type1 == 'out' && type2 == 'in') {
            return true;
        }
        if (type1 == 'numberin' && ['numberout', 'anyout'].indexOf(type2) != -1) {
            return true;
        }
        if (['numberout', 'anyout'].indexOf(type1) != -1 && type2 == 'numberin') {
            return true;
        }
        if (type1 == 'textin' && ['textout', 'anyout'].indexOf(type2) != -1) {
            return true;
        }
        if (['textout', 'anyout'].indexOf(type1) != -1 && type2 == 'textin') {
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
        if (type2 == 'mediain' && type1 == 'textout') {
            return true;
        }
        if (type1 == 'anyin' && ['textout', 'mediaout', 'numberout', 'anyout'].indexOf(type2) != -1) {
            return true;
        }
        if (type2 == 'anyin' && ['textout', 'mediaout', 'numberout', 'anyout'].indexOf(type1) != -1) {
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
        } else {
            console.log('load not yet complete for ' + blk);
        }
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
                // Could happen if the block data is malformed.
                console.log('infinite loop finding topBlock?');
                console.log(myBlock.name);
                break;
            }
            blk = myBlock.connections[0];
            myBlock = this.blockList[blk];
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
                // Could happen if the block data is malformed.
                console.log('infinite loop finding bottomBlock?');
                break;
            }
            blk = last(myBlock.connections);
            myBlock = this.blockList[blk];
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
            this.blockList[thisBlock].unhighlight();
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
            this.blockList[blk].highlight();
            this.highlightedBlock = blk;
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

    this.makeNewBlockWithConnections = function(name, blockOffset, connections, postProcess, postProcessArg, collapsed) {
        if (typeof(collapsed) === 'undefined') {
            collapsed = false
        }
        myBlock = this.makeNewBlock(name, postProcess, postProcessArg);
        if (myBlock == null) {
            console.log('could not make block ' + name);
            return;
        }
        myBlock.collapsed = !collapsed;
        for (var c = 0; c < connections.length; c++) {
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
        this.blockList.push(new Block(this.protoBlockDict[name], this));
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
        myBlock.imageLoad();
        return myBlock;
    }

    this.makeBlock = function(name, arg) {
        // Make a new block from a proto block.
        // Called from palettes.

        var postProcess = null;
        var postProcessArg = null;
        var me = this;
        var thisBlock = this.blockList.length;
        if (name == 'start') {
            postProcess = function(thisBlock) {
                me.blockList[thisBlock].value = me.turtles.turtleList.length;
                me.turtles.add(me.blockList[thisBlock]);
            }
            postProcessArg = thisBlock;
        } else if (name == 'text') {
            postProcess = function(args) {
                var thisBlock = args[0];
                var value = args[1];
                me.blockList[thisBlock].value = value;
                me.blockList[thisBlock].text.text = value;
                me.blockList[thisBlock].container.updateCache();
            }
            postProcessArg = [thisBlock, _('text')];
        } else if (name == 'number') {
            postProcess = function(args) {
                var thisBlock = args[0];
                var value = Number(args[1]);
                me.blockList[thisBlock].value = value;
                me.blockList[thisBlock].text.text = value.toString();
                me.blockList[thisBlock].container.updateCache();
            }
            postProcessArg = [thisBlock, 100];
        } else if (name == 'media') {
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
        } else if (name == 'camera') {
            postProcess = function(args) {
                var thisBlock = args[0];
                var value = args[1];
                me.blockList[thisBlock].value = CAMERAVALUE;
                if (value == null) {
                    loadThumbnail(me, thisBlock, 'images/camera.svg');
                } else {
                    loadThumbnail(me, thisBlock, null);
                }
            }
            postProcessArg = [thisBlock, null];
        } else if (name == 'video') {
            postProcess = function(args) {
                var thisBlock = args[0];
                var value = args[1];
                me.blockList[thisBlock].value = VIDEOVALUE;
                if (value == null) {
                    loadThumbnail(me, thisBlock, 'images/video.svg');
                } else {
                    loadThumbnail(me, thisBlock, null);
                }
            }
            postProcessArg = [thisBlock, null];
        }

        for (var proto in this.protoBlockDict) {
            if (this.protoBlockDict[proto].name == name) {
                if (arg == '__NOARG__') {
                    // console.log('creating ' + name + ' block with no args');
                    this.makeNewBlock(proto, postProcess, postProcessArg);
                    break;
                } else {
                    if (this.protoBlockDict[proto].defaults[0] == arg) {
                        // console.log('creating ' + name + ' block with default arg ' + arg);
                        this.makeNewBlock(proto, postProcess, postProcessArg);
                        break;
                    }
                }
            }
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
                        me.blockList[thisBlock].container.updateCache();
                    }
                    this.makeNewBlock('text', postProcess, [thisBlock, value]);
                } else {
                    postProcess = function(args) {
                        var thisBlock = args[0];
                        var value = Number(args[1]);
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
                value = this.findUniqueActionName(_('action'));
                console.log('renaming action block to ' + value);
                if (value != _('action')) {
                    // There is a race condition with creation of new
                    // text block, hence the timeout.
                    setTimeout(function() {
                        myConnectionBlock.text.text = value;
                        myConnectionBlock.value = value;
                        myConnectionBlock.container.updateCache();
                    }, 1000);
                    this.newDoBlock(value);
                    this.palettes.updatePalettes();
                }
            }
            myConnectionBlock.value = value;
            myBlock.connections[i + 1] = cblk + i;
        }

        // Generate and position the block bitmaps and labels
        this.updateBlockPositions();
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
        for (var blk = 0; blk < this.blockList.length; blk++) {
            if (this.blockList[blk].name == 'text') {
                var c = this.blockList[blk].connections[0];
                if (c != null && this.blockList[c].name == 'box') {
                    if (this.blockList[blk].value == oldName) {
                        this.blockList[blk].value = newName;
                        this.blockList[blk].text.text = newName;
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
        for (var blk = 0; blk < this.blockList.length; blk++) {
            if (this.blockList[blk].name == 'text') {
                var c = this.blockList[blk].connections[0];
                if (c != null && this.blockList[c].name == 'do') {
                    if (this.blockList[blk].value == oldName) {
                        this.blockList[blk].value = newName;
                        this.blockList[blk].text.text = newName;
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
        this.protoBlockDict['myStorein_' + name] = myStoreinBlock;
        myStoreinBlock.palette = this.palettes.dict['blocks'];
        myStoreinBlock.twoArgBlock();
        myStoreinBlock.defaults.push(name);
        myStoreinBlock.defaults.push(100);
        myStoreinBlock.staticLabels.push(_('store in'));
        myStoreinBlock.staticLabels.push(_('name'));
        myStoreinBlock.staticLabels.push(_('value'));
        if (name == 'box') {
            return;
        }
        myStoreinBlock.palette.add(myStoreinBlock);
    }

    this.newBoxBlock = function(name) {
        var myBoxBlock = new ProtoBlock('box');
        this.protoBlockDict['myBox_' + name] = myBoxBlock;
        myBoxBlock.oneArgMathWithLabelBlock();
        myBoxBlock.palette = this.palettes.dict['blocks'];
        myBoxBlock.defaults.push(name);
        myBoxBlock.staticLabels.push(_('box'));
        myBoxBlock.style = 'arg';
        if (name == 'box') {
            return;
        }
        myBoxBlock.palette.add(myBoxBlock);
    }

    this.newDoBlock = function(name) {
        var myDoBlock = new ProtoBlock('do');
        this.protoBlockDict['myDo_' + name] = myDoBlock;
        myDoBlock.oneArgBlock();
        myDoBlock.palette = this.palettes.dict['blocks'];
        myDoBlock.defaults.push(name);
        myDoBlock.staticLabels.push(_('do'));
        if (name == 'action') {
            return;
        }
        myDoBlock.palette.add(myDoBlock);
    }

    this.newActionBlock = function(name) {
        var myActionBlock = new ProtoBlock('action');
        this.protoBlockDict['myAction_' + name] = myActionBlock;
        myActionBlock.blockClampOneArgBlock();
        myActionBlock.palette = this.palettes.dict['blocks'];
        myActionBlock.artworkOffset = [0, 0, 86];
        myActionBlock.fillerOffset = 42;
        myActionBlock.defaults.push(name);
        myActionBlock.staticLabels.push(_('action'));
        myActionBlock.expandable = true;
        myActionBlock.style = 'clamp';
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
                switch (myBlock.name) {
                    case 'media':
                        blockItem = [b, [myBlock.name, null], x, y, []];
                        break;
                    default:
                        blockItem = [b, [myBlock.name, myBlock.value], x, y, []];
                        break;
                }
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
        // Check for blocks connected to themselves,
        // and for action blocks not connected to text blocks.
        for (var b = 0; b < blockObjs.length; b++) {
            var blkData = blockObjs[b];
            for (var c in blkData[4]) {
                if (blkData[4][c] == blkData[0]) {
                    console.log('Circular connection in block data: ' + blkData);
                    console.log('Punting loading of new blocks!');
                    console.log(blockObjs);
                    return;
                }
            }
        }

        // We'll need a list of existing storein and action names.
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
            oldData = blkData;
            var collapsed = undefined;

            // Old support
            if (typeof(oldData[1]) == 'string') {
                blkData[1] = [blkData[1], true];
            }
            if (typeof(oldData[1]) == 'object' && typeof(oldData[1][1]) != 'boolean' && typeof(oldData[1][2]) == 'undefined') {
                blkData[1] = [blkData[1][0], blkData[1][1], true];
            }

            if (blkData[1].length == 2 && blkData[1][0][0] == 'start') {
                // xcor, ycor, heading, color, shade, pensize, grey
                blkData[1] = [
                    [blkData[1][0], blkData[1][1]], null, null, null, null, null, null, null
                ]
            }
            if (blkData[1].length == 2) {
                var name = blkData[1][0];
                var collapsed = blkData[1][1]
                var value = null;
            } else if (blkData[1].length == 8) {
		// Start block
                var name = blkData[1][0][0];
                var collapsed = blkData[1][0][1];
                var turtleX = blkData[1][1];
                var turtleY = blkData[1][2];
                var turtleH = blkData[1][3];
                var turtleC = blkData[1][4];
                var turtleS = blkData[1][5];
                var turtleP = blkData[1][6];
                var turtleG = blkData[1][7];
                var value = null;
            } else {
                var name = blkData[1][0];
                var value = blkData[1][1];
                var collapsed = blkData[1][2];
            }

            if (name in NAMEDICT) {
                name = NAMEDICT[name];
            }
            var me = this;
            // A few special cases.
            switch (name) {
                // Only add 'collapsed' arg to start, action blocks.
                case 'start':
                    blkData[4][0] = null;
                    blkData[4][2] = null;

                    postProcess = function(args) {
                        thisBlock = args[0]
                        turtleX = args[1];
                        turtleY = args[2];
                        turtleH = args[3];
                        turtleC = args[4];
                        turtleS = args[5];
                        turtleP = args[6];
                        turtleG = args[7];
                        me.blockList[thisBlock].value = me.turtles.turtleList.length;
                        me.turtles.add(me.blockList[thisBlock], turtleX, turtleY, turtleH, turtleC, turtleS, turtleP, turtleG);
                    }
                    this.makeNewBlockWithConnections('start', blockOffset, blkData[4], postProcess, [thisBlock, turtleX, turtleY, turtleH, turtleC, turtleS, turtleP, turtleG], collapsed);
                    break;
                case 'action':
                case 'hat':
                    blkData[4][0] = null;
                    blkData[4][3] = null;
                    this.makeNewBlockWithConnections('action', blockOffset, blkData[4], null, null, collapsed);
                    break;

                    // Value blocks need a default value set.
                case 'number':
                    postProcess = function(args) {
                        var thisBlock = args[0];
                        var value = args[1];
                        me.blockList[thisBlock].value = Number(value);
                        me.updateBlockText(thisBlock);
                    }
                    this.makeNewBlockWithConnections(name, blockOffset, blkData[4], postProcess, [thisBlock, value]);
                    break;
                case 'text':
                    postProcess = function(args) {
                        var thisBlock = args[0];
                        var value = args[1];
                        me.blockList[thisBlock].value = value;
                        me.updateBlockText(thisBlock);
                    }
                    this.makeNewBlockWithConnections(name, blockOffset, blkData[4], postProcess, [thisBlock, value]);
                    break;

                    // Load a thumbnail into a media blocks.
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
                case 'camera':
                    postProcess = function(args) {
                        var thisBlock = args[0];
                        var value = args[1];
                        me.blockList[thisBlock].value = CAMERAVALUE;
                        loadThumbnail(me, thisBlock, 'images/camera.svg');

                    }
                    this.makeNewBlockWithConnections(name, blockOffset, blkData[4], postProcess, [thisBlock, value]);
                    break;
                case 'video':
                    postProcess = function(args) {
                        var thisBlock = args[0];
                        var value = args[1];
                        me.blockList[thisBlock].value = VIDEOVALUE;
                        loadThumbnail(me, thisBlock, 'images/video.svg');

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
        for (var blk = 0; blk < this.adjustTheseDocks.length; blk++) {
            this.loopCounter = 0;
            this.adjustDocks(this.adjustTheseDocks[blk]);
        }

        this.refreshCanvas();

        // FIXME: Make these callbacks so there is no race condition.
        // We need to wait for the blocks to load before expanding them.
        setTimeout(function() {
            blockBlocks.expandTwoArgs();
        }, 1000);
        setTimeout(function() {
            blockBlocks.expandClamps();
        }, 2000);
    }

    blockBlocks = this;
    return this;
}


// Define block instance objects and any methods that are intra-block.
function Block(protoblock, blocks) {
    if (protoblock == null) {
        console.log('null protoblock sent to Block');
        return;
    }
    this.protoblock = protoblock;
    this.name = protoblock.name;
    this.blocks = blocks;
    this.x = 0;
    this.y = 0;
    this.collapsed = false; // Is this block in a collapsed stack?
    this.trash = false; // Is this block in the trash?
    this.loadComplete = false; // Has the block finished loading?
    this.label = null; // Editable textview in DOM.
    this.text = null; // A dynamically generated text label on block itself.
    this.value = null; // Value for number, text, and media blocks.

    // All blocks have at a container and least one bitmap.
    this.container = null;
    this.bounds = null;
    this.bitmap = [null, null, null];
    this.highlightBitmap = [null, null, null];

    // Expandable block features.
    this.fillerCount = [0, 0, 0];
    this.fillerBitmaps = [
        [],
        [],
        []
    ];
    this.highlightFillerBitmaps = [
        [],
        [],
        []
    ];
    // Cached filler bitmaps that have been removed from expandable
    // blocks. We can reuse them.
    this.bitmapCache = {};

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

    this.highlight = function() {
        if (this.collapsed) {
            if (['start', 'action'].indexOf(this.name) != -1) {
                this.highlightCollapseBlockBitmap.visible = true;
                this.collapseBlockBitmap.visible = false;
                this.collapseText.visible = true;
            }
        } else {
            this.bitmap[TOP].visible = false;
            this.highlightBitmap[TOP].visible = true;
            if (this.isExpandableBlock()) {
                for (var i = 0; i < this.fillerBitmaps[MID].length; i++) {
                    this.fillerBitmaps[MID][i].visible = false;
                    this.highlightFillerBitmaps[MID][i].visible = true;
                }
                for (var i = 0; i < this.fillerBitmaps[BOT].length; i++) {
                    this.fillerBitmaps[BOT][i].visible = false;
                    this.highlightFillerBitmaps[BOT][i].visible = true;
                }
                if (this.bitmap[MID] != null) {
                    this.bitmap[MID].visible = false;
                    this.highlightBitmap[MID].visible = true;
                }
                if (this.bitmap[BOT] != null) {
                    this.bitmap[BOT].visible = false;
                    this.highlightBitmap[BOT].visible = true;
                }
                if (['start', 'action'].indexOf(this.name) != -1) {
                    // There could be a race condition when making a
                    // new action block.
                    if (this.collapseText != null) {
                        this.collapseText.visible = false;
                    }
                    if (this.collapseBlockBitmap.visible != null) {
                        this.collapseBlockBitmap.visible = false;
                    }
                    if (this.highlightCollapseBlockBitmap.visible != null) {
                        this.highlightCollapseBlockBitmap.visible = false;
                    }
                }
            }
        }
        this.container.updateCache();
        this.blocks.refreshCanvas();
    }

    this.unhighlight = function() {
        if (this.collapsed) {
            if (['start', 'action'].indexOf(this.name) != -1) {
                this.highlightCollapseBlockBitmap.visible = false;
                this.collapseBlockBitmap.visible = true;
                this.collapseText.visible = true;
            }
        } else {
            this.bitmap[TOP].visible = true;
            this.highlightBitmap[TOP].visible = false;
            if (this.isExpandableBlock()) {
                for (var i = 0; i < this.fillerBitmaps[MID].length; i++) {
                    this.fillerBitmaps[MID][i].visible = true;
                    this.highlightFillerBitmaps[MID][i].visible = false;
                }
                for (var i = 0; i < this.fillerBitmaps[BOT].length; i++) {
                    this.fillerBitmaps[BOT][i].visible = true;
                    this.highlightFillerBitmaps[BOT][i].visible = false;
                }
                if (this.bitmap[MID] != null) {
                    this.bitmap[MID].visible = true;
                    this.highlightBitmap[MID].visible = false;
                }
                if (this.bitmap[BOT] != null) {
                    this.bitmap[BOT].visible = true;
                    this.highlightBitmap[BOT].visible = false;
                }
                if (['start', 'action'].indexOf(this.name) != -1) {
                    this.highlightCollapseBlockBitmap.visible = false;
                    this.collapseBlockBitmap.visible = false;
                    this.collapseText.visible = false;
                }
            }
        }
        this.container.updateCache();
        this.blocks.refreshCanvas();
    }

    this.removeFiller = function(clamp) {
        // When we remove filler, we cache it in case it is added back
        // in later.
        var thisBlock = this.blocks.blockList.indexOf(this);
        var fillerBitmap = this.fillerBitmaps[clamp].pop();

        this.container.removeChild(fillerBitmap);
        this.bitmapCache[fillerBitmap.name] = fillerBitmap;

        if (clamp == MID) {
            this.bitmap[MID].y -= this.protoblock.fillerOffset;
            this.highlightBitmap[MID].y = this.bitmap[MID].y;
        }
        this.bitmap[BOT].y -= this.protoblock.fillerOffset;
        this.highlightBitmap[BOT].y = this.bitmap[BOT].y;

        try {
            // FIXME: There is a potential race conditon such that the
            // container cache is not yet ready.
            this.container.uncache();
            this.bounds = this.container.getBounds();
            this.container.cache(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
        } catch (e) {
            console.log(e);
        }
    }

    this.addFiller = function(clamp, c) {
        // Add filler to an expandable block.
        var thisBlock = this.blocks.blockList.indexOf(this);
        var offset = this.protoblock.artworkOffset[clamp] + c * this.protoblock.fillerOffset;
        if (clamp == BOT) {
            offset += this.fillerCount[MID] * this.protoblock.fillerOffset;
        }

        function processBitmap(name, bitmap, args) {
            me = args[0];
            offset = args[1];
            clamp = args[2];
            me.fillerBitmaps[clamp].push(bitmap);
            me.container.addChild(bitmap);
            bitmap.x = me.bitmap[TOP].x;
            bitmap.y = me.bitmap[TOP].y + offset;
            bitmap.name = name;
            me.blocks.refreshCanvas();
        }

        // We generate a unique name to use as the key in the cache.
        var name = 'bmp_' + thisBlock + '_filler_' + clamp + '_' + c;
        if (!(name in this.bitmapCache)) {
            if (this.isArgBlock()) {
                var artwork = ARG2BLOCKFILLER;
            } else if (this.isTwoArgBlock()) {
                var artwork = BASICBLOCK2ARGFILLER;
            } else {
                var artwork = CLAMPFILLER;
            }
            makeBitmap(artwork.replace(/fill_color/g, PALETTEFILLCOLORS[this.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[this.protoblock.palette.name]), name, processBitmap, [this, offset, clamp]);
        } else {
            processBitmap(name, this.bitmapCache[name], [this, offset, clamp]);
        }

        function processHighlightBitmap(name, bitmap, args) {
            me = args[0];
            offset = args[1];
            clamp = args[2];
            me.highlightFillerBitmaps[clamp].push(bitmap);
            me.container.addChild(bitmap);
            bitmap.x = me.bitmap[TOP].x;
            bitmap.y = me.bitmap[TOP].y + offset;
            bitmap.name = name;

            // Hide highlight to start.
            bitmap.visible = false;

            // Move the block parts.
            if (clamp == MID) {
                me.bitmap[MID].y += me.protoblock.fillerOffset;
                me.highlightBitmap[MID].y = me.bitmap[MID].y;
            }
            me.bitmap[BOT].y += me.protoblock.fillerOffset;
            me.highlightBitmap[BOT].y = me.bitmap[BOT].y;

            try {
                // There is a potential race conditon such that the
                // container cache is not yet ready.
                me.container.uncache();
                me.bounds = me.container.getBounds();
                me.container.cache(me.bounds.x, me.bounds.y, me.bounds.width, me.bounds.height);
            } catch (e) {
                console.log(e);
            }
            me.blocks.refreshCanvas();
        }

        // And the same for the highlight blocks
        var name = 'bmp_' + thisBlock + '_highlight_filler_' + clamp + '_' + c;
        if (this.bitmapCache[name] == undefined) {
            if (this.isArgBlock()) {
                var artwork = ARG2BLOCKFILLER;
            } else if (this.isTwoArgBlock()) {
                var artwork = BASICBLOCK2ARGFILLER;
            } else {
                var artwork = CLAMPFILLER;
            }
            makeBitmap(artwork.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[this.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[this.protoblock.palette.name]), name, processHighlightBitmap, [this, offset, clamp]);
        } else {
            processHighlightBitmap(name, this.bitmapCache[name], [this, offset, clamp]);
        }
    }

    this.imageLoad = function() {
        // Load any artwork associated with the block and create any
        // extra parts. Image components are loaded asynchronously so
        // most the work happens in callbacks.

        var thisBlock = this.blocks.blockList.indexOf(this);

        // We need a label for most blocks.
        // TODO: use Text exclusively for all block labels.
        this.text = new createjs.Text('', '20px Arial', '#000000');
        doubleExpandable = this.blocks.doubleExpandable;

        // Get the block labels from the protoblock
        var block_label = '';
        if (this.protoblock.staticLabels.length > 0) {
            block_label = _(this.protoblock.staticLabels[0]);
        }

        var top_label = '';
        if (this.protoblock.staticLabels.length > 1) {
            top_label = _(this.protoblock.staticLabels[1]);
        }
        // Create the bitmap for the block.
        function processBitmap(name, bitmap, me) {
            me.bitmap[TOP] = bitmap;
            me.container.addChild(me.bitmap[TOP]);
            me.bitmap[TOP].x = 0;
            me.bitmap[TOP].y = 0;
            me.bitmap[TOP].name = 'bmp_' + thisBlock;
            me.bitmap[TOP].cursor = 'pointer';
            me.blocks.refreshCanvas();
        }

        makeBitmap(this.protoblock.artwork[TOP].replace(/fill_color/g, PALETTEFILLCOLORS[this.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[this.protoblock.palette.name]).replace('block_label', block_label).replace('top_label', top_label).replace('font_size', this.protoblock.fontsize), this.name, processBitmap, this);

        // Create the highlight bitmap for the block.
        function processHighlightBitmap(name, bitmap, me) {
            me.highlightBitmap[TOP] = bitmap;
            me.container.addChild(me.highlightBitmap[TOP]);
            me.highlightBitmap[TOP].x = 0;
            me.highlightBitmap[TOP].y = 0;
            me.highlightBitmap[TOP].name = 'bmp_highlight_' + thisBlock;
            me.highlightBitmap[TOP].cursor = 'pointer';
            // Hide it to start
            me.highlightBitmap[TOP].visible = false;

            if (me.text != null) {
                // Make sure text is on top.
                lastChild = last(me.container.children);
                me.container.swapChildren(me.text, lastChild);
            }

            // At me point, it should be safe to calculate the
            // bounds of the container and cache its contents.
            me.bounds = me.container.getBounds();
            me.container.cache(me.bounds.x, me.bounds.y, me.bounds.width, me.bounds.height);
            loadEventHandlers(blocks, me);
            me.blocks.refreshCanvas();
            if (doubleExpandable.indexOf(me.name) != -1) {
                me.middleImageLoad();
            } else {
                me.finishImageLoad();
            }

        }

        makeBitmap(this.protoblock.artwork[TOP].replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[this.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[this.protoblock.palette.name]).replace('block_label', block_label).replace('top_label', top_label).replace('font_size', this.protoblock.fontsize), '', processHighlightBitmap, this);
    }

    this.middleImageLoad = function() {
        // Load a block image and create any extra parts. Image
        // components are loaded asynchronously so most the work
        // happens in callbacks.

        var thisBlock = this.blocks.blockList.indexOf(this);

        // We need a label for most blocks.
        // TODO: use Text exclusively for all block labels.
        this.text = new createjs.Text('', '20px Arial', '#000000');

        // Get the block labels from the protoblock
        var block_label = this.protoblock.staticLabels[2];

        var middleOffset = this.protoblock.artworkOffset[MID];

        // Create the bitmap for the block.
        function processBitmap(name, bitmap, me) {
            me.bitmap[MID] = bitmap;
            me.container.addChild(me.bitmap[MID]);
            me.bitmap[MID].x = me.bitmap[TOP].x;
            me.bitmap[MID].y = me.bitmap[TOP].y + middleOffset;
            me.bitmap[MID].name = 'bmp_middle_' + thisBlock;
            me.blocks.refreshCanvas();
        }

        makeBitmap(this.protoblock.artwork[MID].replace(/fill_color/g, PALETTEFILLCOLORS[this.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[this.protoblock.palette.name]).replace('mid_label', block_label).replace('top_label', '').replace('font_size', this.protoblock.fontsize), this.name, processBitmap, this);

        // Create the highlight bitmap for the block.
        function processHighlightBitmap(name, bitmap, me) {
            me.highlightBitmap[MID] = bitmap;
            me.container.addChild(me.highlightBitmap[MID]);
            me.highlightBitmap[MID].x = me.bitmap[TOP].x;
            me.highlightBitmap[MID].y = me.bitmap[TOP].y + middleOffset;
            me.highlightBitmap[MID].name = 'bmp_middle_highlight_' + thisBlock;
            me.highlightBitmap[MID].visible = false;
            me.finishImageLoad();
        }

        makeBitmap(this.protoblock.artwork[MID].replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[this.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[this.protoblock.palette.name]).replace('mid_label', block_label).replace('top_label', '').replace('font_size', this.protoblock.fontsize), '', processHighlightBitmap, this);
    }

    this.finishImageLoad = function() {

        var thisBlock = this.blocks.blockList.indexOf(this);

        var bottom_label = '';
        if (this.protoblock.staticLabels.length > 2) {
            bottom_label = _(this.protoblock.staticLabels[2]);
        }

        // Value blocks get a modifiable text label
        if (this.name == 'text' || this.name == 'number') {
            if (this.value == null) {
                if (this.name == 'text') {
                    this.value = '---';
                } else {
                    this.value = 100;
                }
            }

            var label = this.value.toString();
            if (label.length > 8) {
                label = label.substr(0, 7) + '...';
            }
            this.text.text = label;
            this.text.textAlign = 'center';
            this.text.textBaseline = 'alphabetic';
            this.container.addChild(this.text);
            this.text.x = VALUETEXTX;
            this.text.y = VALUETEXTY;

            // Make sure text is on top.
            lastChild = last(this.container.children);
            this.container.swapChildren(this.text, lastChild);
            this.container.updateCache();
        }

        if (this.protoblock.parameter) {
            // Parameter blocks get a text label to show their current value
            this.text.textAlign = 'right';
            this.text.textBaseline = 'alphabetic';
            this.container.addChild(this.text);
            if (this.name == 'box') {
                this.text.x = BOXTEXTX;
            } else {
                this.text.x = PARAMETERTEXTX;
            }
            this.text.y = VALUETEXTY;

            lastChild = last(this.container.children);
            this.container.swapChildren(this.text, lastChild);
            this.container.updateCache();
        }

        if (this.isExpandableBlock()) {
            // Expandable blocks also have some extra parts.
            bottomArtwork = this.protoblock.artwork[BOT];
            var artworkOffset = this.protoblock.artworkOffset[BOT];

            function processBottomBitmap(name, bitmap, me) {
                me.bitmap[BOT] = bitmap;
                me.container.addChild(me.bitmap[BOT]);
                me.bitmap[BOT].x = me.bitmap[TOP].x;
                me.bitmap[BOT].y = me.bitmap[TOP].y + artworkOffset;
                me.bitmap[BOT].name = 'bmp_' + thisBlock + '_bottom';
                me.blocks.refreshCanvas();
            }

            makeBitmap(bottomArtwork.replace(/fill_color/g, PALETTEFILLCOLORS[this.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[this.protoblock.palette.name]).replace('bottom_label', bottom_label), '', processBottomBitmap, this);

            function processHighlightBottomBitmap(name, bitmap, me) {
                me.highlightBitmap[BOT] = bitmap;
                me.container.addChild(me.highlightBitmap[BOT]);
                me.highlightBitmap[BOT].x = me.bitmap[TOP].x;
                me.highlightBitmap[BOT].y = me.bitmap[TOP].y + artworkOffset;
                me.highlightBitmap[BOT].name = 'bmp_' + thisBlock + '_highlight_bottom';
                me.highlightBitmap[BOT].visible = false;

                // We added a bottom block, so we need to recache.
                me.container.uncache();
                me.bounds = me.container.getBounds();
                me.container.cache(me.bounds.x, me.bounds.y, me.bounds.width, me.bounds.height);
                me.loadComplete = true;
                if (me.postProcess != null) {
                    me.postProcess(me.postProcessArg);
                }
                me.blocks.refreshCanvas();
                me.blocks.cleanupAfterLoad();
            }

            makeBitmap(bottomArtwork.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[this.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[this.protoblock.palette.name]).replace('bottom_label', bottom_label), '', processHighlightBottomBitmap, this);
        } else {
            this.loadComplete = true;
            if (this.postProcess != null) {
                this.postProcess(this.postProcessArg);
            }
            this.blocks.refreshCanvas();
            this.blocks.cleanupAfterLoad();
        }

        // Start blocks and Action blocks can collapse, so add an
        // event handler
        if (['start', 'action'].indexOf(this.name) != -1) {
            block_label = ''; // We use a Text element for the label

            function processCollapseBitmap(name, bitmap, me) {
                me.collapseBlockBitmap = bitmap;
                me.container.addChild(me.collapseBlockBitmap);
                me.collapseBlockBitmap.visible = false;
                me.blocks.refreshCanvas();
            }

            makeBitmap(ACTIONCLAMPCOLLAPSED.replace(/fill_color/g, PALETTEFILLCOLORS[this.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[this.protoblock.palette.name]).replace('block_label', _(block_label)).replace('font_size', this.protoblock.fontsize), '', processCollapseBitmap, this);

            function processHighlightCollapseBitmap(name, bitmap, me) {
                me.highlightCollapseBlockBitmap = bitmap;
                me.container.addChild(me.highlightCollapseBlockBitmap);
                me.highlightCollapseBlockBitmap.visible = false;
                me.blocks.refreshCanvas();

                if (me.name == 'action') {
                    me.collapseText = new createjs.Text('action', '20px Arial', '#000000');
                    me.collapseText.x = ACTIONTEXTX;
                    me.collapseText.y = ACTIONTEXTY;
                    me.collapseText.textAlign = 'right';
                } else {
                    me.collapseText = new createjs.Text('start', '20px Arial', '#000000');
                    me.collapseText.x = STARTTEXTX;
                    me.collapseText.y = ACTIONTEXTY;
                    me.collapseText.textAlign = 'left';
                }
                me.collapseText.textBaseline = 'alphabetic';
                me.container.addChild(me.collapseText);
                me.collapseText.visible = false;

                me.collapseContainer = new createjs.Container();

                var image = new Image();
                image.onload = function() {
                    me.collapseBitmap = new createjs.Bitmap(image);
                    me.collapseContainer.addChild(me.collapseBitmap);
                    finishCollapseButton(me);
                }
                image.src = 'images/collapse.svg';

                finishCollapseButton = function(me) {
                    var image = new Image();
                    image.onload = function() {
                        me.expandBitmap = new createjs.Bitmap(image);
                        me.collapseContainer.addChild(me.expandBitmap);
                        me.expandBitmap.visible = false;
                        var bounds = me.collapseContainer.getBounds();
                        me.collapseContainer.cache(bounds.x, bounds.y, bounds.width, bounds.height);
                        loadCollapsibleEventHandlers(me.blocks, me);
                    }
                    image.src = 'images/expand.svg';
                }

                me.blocks.stage.addChild(me.collapseContainer);
                me.collapseContainer.x = me.container.x + COLLAPSEBUTTONXOFF;
                me.collapseContainer.y = me.container.y + COLLAPSEBUTTONYOFF;
            }

            makeBitmap(ACTIONCLAMPCOLLAPSED.replace(/fill_color/g, PALETTEHIGHLIGHTCOLORS[this.protoblock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[this.protoblock.palette.name]).replace('block_label', block_label).replace('font_size', this.protoblock.fontsize), '', processHighlightCollapseBitmap, this);
        }
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
        return this.protoblock.style == 'clamp' || this.isDoubleClampBlock();
    }

    this.isDoubleClampBlock = function() {
        return this.protoblock.style == 'doubleclamp';
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
function labelChanged(myBlock) {
    // For some reason, arg passing from the DOM is not working
    // properly, so we need to find the label that changed.

    if (myBlock == null) {
        return;
    }

    console.log('label changed on ' + myBlock.name);
    var oldValue = myBlock.value;
    var newValue = myBlock.label.value;

    // Update the block value and block text.
    if (myBlock.name == 'number') {
        try {
            myBlock.value = Number(newValue);
            console.log('assigned ' + myBlock.value + ' to number block (' + typeof(myBlock.value) + ')');
        } catch (e) {
            console.log(e);
            // FIXME: Expose errorMsg to blocks
            // errorMsg('Not a number.');
        }
    } else {
        myBlock.value = newValue;
    }
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
    myBlock.blocks.refreshCanvas();

    // TODO: Garbage collection in palette (remove old proto block)
    // TODO: Don't allow duplicate action names
    var c = myBlock.connections[0];
    if (myBlock.name == 'text' && c != null) {
        var cblock = myBlock.blocks.blockList[c];
        console.log('label changed' + ' ' + myBlock.name);
        switch (cblock.name) {
            case 'action':
                // If the label was the name of an action, update the
                // associated run myBlock.blocks and the palette buttons
                if (myBlock.value != _('action')) {
                    myBlock.blocks.newDoBlock(myBlock.value);
                }
                console.log('rename action: ' + myBlock.value);
                myBlock.blocks.renameDos(oldValue, newValue);
                myBlock.blocks.palettes.updatePalettes();
                break;
            case 'storein':
                // If the label was the name of a storein, update the
                //associated box myBlock.blocks and the palette buttons
                if (myBlock.value != 'box') {
                    myBlock.blocks.newStoreinBlock(myBlock.value);
                    myBlock.blocks.newBoxBlock(myBlock.value);
                }
                myBlock.blocks.renameBoxes(oldValue, newValue);
                myBlock.blocks.palettes.updatePalettes();
                break;
        }
    }
}


// Load an image thumbnail onto block.
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
    var fileChooser = docById('myMedia');
    fileChooser.addEventListener('change', function(event) {
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
        blocks.setDraggingFlag(true);
        blocks.highlight(thisBlock, true);
        blocks.activeBlock = thisBlock;
        blocks.refreshCanvas();
    });

    var moved = false;
    var locked = false;
    myBlock.collapseContainer.on('click', function(event) {
        if (locked) {
            console.log('debouncing click');
            return;
        }
        locked = true;
        setTimeout(function() {
            locked = false;
        }, 500);
        hideDOMLabel();
        if (!moved) {
            collapseToggle(blocks, myBlock);
        }
    });

    myBlock.collapseContainer.on('mousedown', function(event) {
        hideDOMLabel();
        blocks.setDraggingFlag(true);
        // Always show the trash when there is a block selected.
        trashcan.show();
        moved = false;
        var offset = {
            x: myBlock.collapseContainer.x - Math.round(event.stageX / blocks.scale),
            y: myBlock.collapseContainer.y - Math.round(event.stageY / blocks.scale)
        };

        myBlock.collapseContainer.on('pressup', function(event) {
            collapseOut(blocks, myBlock, thisBlock, moved, event);
            moved = false;
        });

        myBlock.collapseContainer.on('mouseout', function(event) {
            collapseOut(blocks, myBlock, thisBlock, moved, event);
            moved = false;
        });

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
                    var blk = blocks.dragGroup[b];
                    if (b != 0) {
                        blocks.moveBlockRelative(blk, dx, dy);
                    }
                }
            }

            blocks.refreshCanvas();
        });
    });

    myBlock.collapseContainer.on('pressup', function(event) {
        collapseOut(blocks, myBlock, thisBlock, moved, event);
        moved = false;
    });

    myBlock.collapseContainer.on('mouseout', function(event) {
        collapseOut(blocks, myBlock, thisBlock, moved, event);
        moved = false;
    });
}


function collapseToggle(blocks, myBlock) {
    if (['start', 'action'].indexOf(myBlock.name) == -1) {
	console.log('Do not collapse ' + myBlock.name);
        return;
    }

    // Find the blocks to collapse/expand
    var thisBlock = blocks.blockList.indexOf(myBlock);
    blocks.findDragGroup(thisBlock)

    function toggle(collapse) {
	console.log('toggle collapse ' + myBlock.name + ' ' + collapse);
        myBlock.collapsed = !collapse;
        myBlock.collapseBitmap.visible = collapse;
        myBlock.expandBitmap.visible = !collapse;
        myBlock.collapseBlockBitmap.visible = !collapse;
        myBlock.highlightCollapseBlockBitmap.visible = false;
        myBlock.collapseText.visible = !collapse;

        for (var b in myBlock.bitmap) {
            if (myBlock.bitmap[b] != null) {
                myBlock.bitmap[b].visible = false;
            }
        }

        for (var b in myBlock.highlightBitmap) {
            if (myBlock.highlightBitmap[b] != null) {
                myBlock.highlightBitmap[b].visible = collapse;
            }
        }

        for (var i = 0; i < myBlock.fillerBitmaps[MID].length; i++) {
            myBlock.fillerBitmaps[MID][i].visible = false;
            myBlock.highlightFillerBitmaps[MID][i].visible = collapse;
        }

        for (var i = 0; i < myBlock.fillerBitmaps[BOT].length; i++) {
            myBlock.fillerBitmaps[BOT][i].visible = false;
            myBlock.highlightFillerBitmaps[BOT][i].visible = collapse;
        }

        if (myBlock.name != 'start') {
            // Label the collapsed block with the action label
            if (myBlock.connections[1] != null) {
                myBlock.collapseText.text = blocks.blockList[myBlock.connections[1]].value;
            } else {
                myBlock.collapseText.text = '';
            }
        }
        var lastChild = last(myBlock.container.children);
        myBlock.container.swapChildren(myBlock.collapseText, lastChild);

        if (blocks.dragGroup.length > 0) {
            for (var b = 0; b < blocks.dragGroup.length; b++) {
                var blk = blocks.dragGroup[b];
                if (b != 0) {
                    blocks.blockList[blk].collapsed = !collapse;
                    blocks.blockList[blk].container.visible = collapse;
                }
            }
        }
    }

    toggle(myBlock.collapsed);
    myBlock.collapseContainer.updateCache();
    myBlock.container.updateCache();
    blocks.refreshCanvas();
    return;
}


function collapseOut(blocks, myBlock, thisBlock, moved, event) {
    blocks.setDraggingFlag(false);
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
    });

    var moved = false;
    var locked = false;
    myBlock.container.on('click', function(event) {
        if (locked) {
            console.log('debouncing click');
            return;
        }
        locked = true;
        setTimeout(function() {
            locked = false;
        }, 500);
        displayMsg(blocks, 'click');
        hideDOMLabel();
        if (!moved) {
            if (blocks.selectingStack) {
                var topBlock = blocks.findTopBlock(thisBlock);
                blocks.selectedStack = topBlock;
                blocks.selectingStack = false;
            } else if (myBlock.name == 'media') {
                doOpenMedia(blocks, thisBlock);
            } else if (myBlock.name == 'text' || myBlock.name == 'number') {
                var x = myBlock.container.x
                var y = myBlock.container.y
                var canvasLeft = blocks.canvas.offsetLeft + 28;
                var canvasTop = blocks.canvas.offsetTop + 6;

                if (myBlock.name == 'text') {
                    labelElem.innerHTML = '<textarea id="' + 'textLabel' +
                        '" style="position: absolute; ' +
                        '-webkit-user-select: text;" ' +
                        'class="text", ' +
                        'onkeypress="if(event.keyCode==13){return false;}"' +
                        'cols="8", rows="1", maxlength="256">' +
                        myBlock.value + '</textarea>';
                    myBlock.label = docById('textLabel');
                    myBlock.label.addEventListener(
                        'change',
                        function() {
                            labelChanged(myBlock);
                        });
                    myBlock.label.style.left = Math.round(x * blocks.scale + canvasLeft) + 'px';
                    myBlock.label.style.top = Math.round(y * blocks.scale + canvasTop) + 'px';
                    myBlock.label.style.display = '';
                } else {
                    labelElem.innerHTML = '<textarea id="' + 'numberLabel' +
                        '" style="position: absolute; ' +
                        '-webkit-user-select: text;" ' +
                        'class="number", ' +
                        'onkeypress="if(event.keyCode==13){return false;}"' +
                        'cols="8", rows="1", maxlength="8">' +
                        myBlock.value + '</textarea>';
                    myBlock.label = docById('numberLabel');
                    myBlock.label.addEventListener(
                        'change',
                        function() {
                            labelChanged(myBlock);
                        });
                    myBlock.label.style.left = Math.round(x * blocks.scale + canvasLeft) + 'px';
                    myBlock.label.style.top = Math.round(y * blocks.scale + canvasTop) + 'px';
                    myBlock.label.style.display = '';
                }
            } else {
                var topBlock = blocks.findTopBlock(thisBlock);
                console.log('running from ' + blocks.blockList[topBlock].name);
                blocks.runLogo(topBlock);
            }
        }
    });

    myBlock.container.on('mousedown', function(event) {
        hideDOMLabel();
        blocks.setDraggingFlag(true);
        displayMsg(blocks, 'mousedown');

        // Track time for detecting long pause.
        var d = new Date();
        blocks.time = d.getTime();
        blocks.timeOut = setTimeout(function() {
            blocks.triggerLongPress(myBlock);
        }, LONGPRESSTIME);

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
            moved = false;
        });

        myBlock.container.on('pressup', function(event) {
            blocks.setDraggingFlag(false);
            displayMsg(blocks, 'mousedown->pressup');
            mouseoutCallback(blocks, myBlock, event, moved);
            moved = false;
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
            if (!moved && myBlock.label != null) {
                myBlock.label.style.display = 'none';
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
        });
    });

    myBlock.container.on('mouseout', function(event) {
        blocks.setDraggingFlag(false);
        displayMsg(blocks, 'mouseout');
        mouseoutCallback(blocks, myBlock, event, moved);
    });
}


function hideDOMLabel() {
    var textLabel = docById('textLabel');
    if (textLabel != null) {
        textLabel.style.display = 'none';
    }
    var numberLabel = docById('numberLabel');
    if (numberLabel != null) {
        numberLabel.style.display = 'none';
    }
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


function makeBitmap(data, name, callback, args) {
    // Async creation of bitmap from SVG data
    // Works with Chrome, Safari, Firefox (untested on IE)
    var img = new Image();
    img.onload = function() {
        bitmap = new createjs.Bitmap(img);
        callback(name, bitmap, args);
    }
    img.src = 'data:image/svg+xml;base64,' + window.btoa(
        unescape(encodeURIComponent(data)));
}

