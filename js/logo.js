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

var DEFAULTDELAY = 500; // milleseconds
var TURTLESTEP = -1;  // Run in step-by-step mode

var NOMICERRORMSG = 'The microphone is not available.';
var NANERRORMSG = 'Not a number.';
var NOSTRINGERRORMSG = 'Not a string.';
var NOBOXERRORMSG = 'Cannot find box';
var NOACTIONERRORMSG = 'Cannot find action.';
var NOINPUTERRORMSG = 'Missing argument.';
var NOSQRTERRORMSG = 'Cannot take square root of negative number.';
var ZERODIVIDEERRORMSG = 'Cannot divide by zero.';
var EMPTYHEAPERRORMSG = 'empty heap.';

function Logo(canvas, blocks, turtles, stage, refreshCanvas, textMsg, errorMsg,
              hideMsgs, onStopTurtle, onRunTurtle, prepareExport, getStageX,
              getStageY, getStageMouseDown, getCurrentKeyCode,
              clearCurrentKeyCode, meSpeak, saveLocally) {

    this.canvas = canvas;
    this.blocks = blocks;
    this.turtles = turtles;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;
    this.textMsg = textMsg;
    this.errorMsg = errorMsg;
    this.hideMsgs = hideMsgs;
    this.onStopTurtle = onStopTurtle;
    this.onRunTurtle = onRunTurtle;
    this.prepareExport = prepareExport;
    this.getStageX = getStageX;
    this.getStageY = getStageY;
    this.getStageMouseDown = getStageMouseDown;
    this.getCurrentKeyCode = getCurrentKeyCode;
    this.clearCurrentKeyCode = clearCurrentKeyCode;
    this.meSpeak = meSpeak;
    this.saveLocally = saveLocally;

    this.evalFlowDict = {};
    this.evalArgDict = {};
    this.evalParameterDict = {};
    this.evalSetterDict = {};
    this.evalOnStartList = {};
    this.evalOnStopList = {};
    this.eventList = {};

    this.boxes = {};
    this.actions = {};
    this.returns = [];
    this.turtleHeaps = {};

    this.time = 0;
    this.waitTimes = {};
    this.turtleDelay = 0;
    this.sounds = [];
    this.cameraID = null;
    this.stopTurtle = false;
    this.lastKeyCode = null;
    this.saveTimeout = 0;

    // When running in step-by-step mode, the next command to run is
    // queued here.
    this.stepQueue = {};
    this.unhighlightStepQueue = {};

    this.svgOutput = '';
    this.svgBackground = true;

    try {
        this.mic = new p5.AudioIn()
    } catch (e) {
        console.log(NOMICERRORMSG);
        this.mic = null;
    }

    this.turtleOscs = {};

    this.setTurtleDelay = function(turtleDelay) {
        this.turtleDelay = turtleDelay;
    }

    this.step = function() {
        // Take one step for each turtle in excuting Logo commands.
        for (turtle in this.stepQueue) {
            if (this.stepQueue[turtle].length > 0) {
                if (turtle in this.unhighlightStepQueue && this.unhighlightStepQueue[turtle] != null) {
                    this.blocks.unhighlight(this.unhighlightStepQueue[turtle]);
                    this.unhighlightStepQueue[turtle] = null;
                }
                var blk = this.stepQueue[turtle].pop();
                if (blk != null) {
                    this.runFromBlockNow(this, turtle, blk, 0, null);
                }
            }
        }
    }

    this.doStopTurtle = function() {
        // The stop button was pressed. Stop the turtle and clean up a
        // few odds and ends.
        this.stopTurtle = true;
        this.turtles.markAsStopped();

        for (var sound in this.sounds) {
            this.sounds[sound].stop();
        }
        this.sounds = [];

        if (this.cameraID != null) {
            doStopVideoCam(this.cameraID, this.setCameraID);
        }

        this.onStopTurtle();
        this.blocks.bringToTop();

        this.stepQueue = {};
        this.unhighlightQueue = {};
    }

    this.clearParameterBlocks = function() {
        for (var blk in this.blocks.blockList) {
            if (this.blocks.blockList[blk].parameter) {
                this.blocks.blockList[blk].text.text = '';
                this.blocks.blockList[blk].container.updateCache();
            }
        }
        this.refreshCanvas();
    }

    this.updateParameterBlock = function(logo, turtle, blk) {
        // Update the label on parameter blocks.
        if (this.blocks.blockList[blk].protoblock.parameter) {
            var name = this.blocks.blockList[blk].name;
            var value = 0;
            switch (name) {
                case 'and':
                case 'or':
                case 'not':
                case 'less':
                case 'greater':
                case 'equal':
                    if (this.blocks.blockList[blk].value) {
                        value = _('true');
                    } else {
                        value = _('false');
                    }
                    break;
                case 'random':
                case 'mod':
                case 'sqrt':
                case 'int':
                case 'plus':
                case 'minus':
                case 'multiply':
                case 'divide':
                    value = this.blocks.blockList[blk].value;
                    break;
                case 'namedbox':
                    var name = this.blocks.blockList[blk].privateData;
                    if (name in this.boxes) {
                        value = this.boxes[name];
                    } else {
                        this.errorMsg(NOBOXERRORMSG, blk, name);
                    }
                    break;
                case 'box':
                    var cblk = this.blocks.blockList[blk].connections[1];
                    var boxname = this.parseArg(logo, turtle, cblk, blk);
                    if (boxname in this.boxes) {
                        value = this.boxes[boxname];
                    } else {
                        this.errorMsg(NOBOXERRORMSG, blk, boxname);
                    }
                    break;
                case 'x':
                    value = this.turtles.turtleList[turtle].x;
                    break;
                case 'y':
                    value = this.turtles.turtleList[turtle].y;
                    break;
                case 'heading':
                    value = this.turtles.turtleList[turtle].orientation;
                    break;
                case 'color':
                case 'hue':
                    value = this.turtles.turtleList[turtle].color;
                    break;
                case 'shade':
                    value = this.turtles.turtleList[turtle].value;
                    break;
                case 'grey':
                    value = this.turtles.turtleList[turtle].chroma;
                    break;
                case 'pensize':
                    value = this.turtles.turtleList[turtle].stroke;
                    break;
                case 'time':
                    var d = new Date();
                    value = (d.getTime() - this.time) / 1000;
                    break;
                case 'mousex':
                    value = this.getStageX();
                    break;
                case 'mousey':
                    value = this.getStageY();
                    break;
                case 'keyboard':
                    value = this.lastKeyCode;
                    break;
                case 'loudness':
                    if (logo.mic == null) {
                        logo.errorMsg(NOMICERRORMSG);
                        value = 0;
                    } else {
                        value = Math.round(logo.mic.getLevel() * 1000);
                    }
                    break;
                default:
                    if (name in this.evalParameterDict) {
                        eval(this.evalParameterDict[name]);
                    } else {
                        return;
                    }
                    break;
            }
            if (typeof(value) == 'string') {
                if (value.length > 6) {
                    value = value.substr(0, 5) + '...';
                }
                this.blocks.blockList[blk].text.text = value;
            } else {
                this.blocks.blockList[blk].text.text = Math.round(value).toString();
            }
            this.blocks.blockList[blk].container.updateCache();
            this.refreshCanvas();
        }
    }

    this.runLogoCommands = function(startHere) {
        // Save the state before running.
        this.saveLocally();

        for (var arg in this.evalOnStartList) {
            eval(this.evalOnStartList[arg]);
        }

        this.stopTurtle = false;
        this.blocks.unhighlightAll();
        this.blocks.bringToTop(); // Draw under blocks.

        this.hideMsgs();

        // We run the Logo commands here.
        var d = new Date();
        this.time = d.getTime();

        // Ensure we have at least one turtle.
        if (this.turtles.turtleList.length == 0) {
            this.turtles.add(null);
        }

        // Each turtle needs to keep its own wait time.
        for (var turtle = 0; turtle < this.turtles.turtleList.length; turtle++) {
            this.waitTimes[turtle] = 0;
        }

        // Remove any listeners that might be still active
        for (var turtle = 0; turtle < this.turtles.turtleList.length; turtle++) {
            for (var listener in this.turtles.turtleList[turtle].listeners) {
                console.log('removing listener ' + listener);
                this.stage.removeEventListener(listener, this.turtles.turtleList[turtle].listeners[listener], false);
            }
            this.turtles.turtleList[turtle].listeners = {};
        }

        // First we need to reconcile the values in all the value
        // blocks with their associated textareas.
        for (var blk = 0; blk < this.blocks.blockList.length; blk++) {
            if (this.blocks.blockList[blk].label != null) {
                this.blocks.blockList[blk].value = this.blocks.blockList[blk].label.value;
            }
        }

        // Init the graphic state.
        for (var turtle = 0; turtle < this.turtles.turtleList.length; turtle++) {
            this.turtles.turtleList[turtle].container.x = this.turtles.turtleX2screenX(this.turtles.turtleList[turtle].x);
            this.turtles.turtleList[turtle].container.y = this.turtles.turtleY2screenY(this.turtles.turtleList[turtle].y);
        }

        // Execute turtle code here...  Find the start block (or the
        // top of each stack) and build a list of all of the named
        // action stacks.
        var startBlocks = [];
        this.blocks.findStacks();
        this.actions = {};
        for (var blk = 0; blk < this.blocks.stackList.length; blk++) {
            if (this.blocks.blockList[this.blocks.stackList[blk]].name == 'start') {
                // Don't start on a start block in the trash.
                if (!this.blocks.blockList[this.blocks.stackList[blk]].trash) {
                    // Don't start on a start block with no connections.
                    if (this.blocks.blockList[this.blocks.stackList[blk]].connections[1] != null) {
                        startBlocks.push(this.blocks.stackList[blk]);
                    }
                }
            } else if (this.blocks.blockList[this.blocks.stackList[blk]].name == 'action') {
                // Does the action stack have a name?
                var c = this.blocks.blockList[this.blocks.stackList[blk]].connections[1];
                var b = this.blocks.blockList[this.blocks.stackList[blk]].connections[2];
                if (c != null && b != null) {
                    // Don't use an action block in the trash.
                    if (!this.blocks.blockList[this.blocks.stackList[blk]].trash) {
                        this.actions[this.blocks.blockList[c].value] = b;
                    }
                }
            }
        }

        this.svgOutput = '';
        this.svgBackground = true;

        this.parentFlowQueue = {};
        this.unhightlightQueue = {};
        this.parameterQueue = {};

        if (this.turtleDelay == 0) {
            // Don't update parameters when running full speed.
            this.clearParameterBlocks();
        }

        this.onRunTurtle();

        // And mark all turtles as not running.
        for (var turtle = 0; turtle < this.turtles.turtleList.length; turtle++) {
            this.turtles.turtleList[turtle].running = false;
        }

        // (2) Execute the stack.
        // A bit complicated because we have lots of corner cases:
        if (startHere != null) {
            console.log('startHere is ' + this.blocks.blockList[startHere].name);
            // If a block to start from was passed, find its
            // associated turtle, i.e., which turtle should we use?
            var turtle = 0;
            if (this.blocks.blockList[startHere].name == 'start') {
                var turtle = this.blocks.blockList[startHere].value;
                console.log('starting on start with turtle ' + turtle);
            } else {
                console.log('starting on ' + this.blocks.blockList[startHere].name + ' with turtle ' + turtle);
            }

            this.turtles.turtleList[turtle].queue = [];
            this.parentFlowQueue[turtle] = [];
            this.unhightlightQueue[turtle] = [];
            this.parameterQueue[turtle] = [];
            this.turtles.turtleList[turtle].running = true;
            this.runFromBlock(this, turtle, startHere, 0, null);
        } else if (startBlocks.length > 0) {
            // If there are start blocks, run them all.
            for (var b = 0; b < startBlocks.length; b++) {
                var turtle = this.blocks.blockList[startBlocks[b]].value;
                this.turtles.turtleList[turtle].queue = [];
                this.parentFlowQueue[turtle] = [];
                this.unhightlightQueue[turtle] = [];
                this.parameterQueue[turtle] = [];
                if (!this.turtles.turtleList[turtle].trash) {
                    console.log('running from turtle ' + turtle);
                    this.turtles.turtleList[turtle].running = true;
                    this.runFromBlock(this, turtle, startBlocks[b], 0, null);
                }
            }
        } else {
            // Or run from the top of each stack.
            // Find a turtle.
            var turtle = null;
            for (var t = 0; t < this.turtles.turtleList.length; t++) {
                if (!this.turtles.turtleList[t].trash) {
                    console.log('found turtle ' + t);
                    turtle = t;
                    break;
                }
            }

            if (turtle == null) {
                console.log('could not find a turtle');
                turtle = this.turtles.turtleList.length;
                this.turtles.add(null);
            }

            // Make sure the turtle we "found" exisits.
            if(this.turtles.turtleList.length < turtle + 1) {
                turtle = 0;
            }

            console.log('running with turtle ' + turtle);

            this.turtles.turtleList[turtle].queue = [];
            this.parentFlowQueue[turtle] = [];
            this.unhightlightQueue[turtle] = [];
            this.parameterQueue[turtle] = [];

            for (var blk = 0; blk < this.blocks.stackList.length; blk++) {
                if (this.blocks.blockList[blk].isNoRunBlock()) {
                    continue;
                } else {
                    if (!this.blocks.blockList[this.blocks.stackList[blk]].trash) {
                        if (this.blocks.blockList[this.blocks.stackList[blk]].name == 'start' && this.blocks.blockList[this.blocks.stackList[blk]].connections[1] == null) {
                            continue;
                        }
                        // This is a degenerative case.
                        this.turtles.turtleList[0].running = true;
                        this.runFromBlock(this, 0, this.blocks.stackList[blk], 0, null);
                    }
                }
            }
        }
        this.refreshCanvas();
    }

    this.runFromBlock = function(logo, turtle, blk, isflow, receivedArg) {
        if (blk == null) {
            return;
        }

        var delay = logo.turtleDelay + logo.waitTimes[turtle];
        logo.waitTimes[turtle] = 0;

        if (!logo.stopTurtle) {
            if (logo.turtleDelay == TURTLESTEP) {
                // Step mode
                if (!(turtle in logo.stepQueue)) {
                    logo.stepQueue[turtle] = [];
                }
                logo.stepQueue[turtle].push(blk);
            } else {
                setTimeout(function() {
                    logo.runFromBlockNow(logo, turtle, blk, isflow, receivedArg);
                }, delay);
            }
        }
    }

    this.blockSetter = function(blk, value, turtleId) {
        var turtle = this.turtles.turtleList[turtleId];

        switch (this.blocks.blockList[blk].name) {
            case 'x':
                turtle.doSetXY(value, turtle.x);
                break;
            case 'y':
                turtle.doSetXY(turtle.y, value);
                break;
            case 'heading':
                turtle.doSetHeading(value);
                break;
            case 'color':
                turtle.doSetColor(value);
                break;
            case 'shade':
                turtle.doSetValue(value);
                break;
            case 'grey':
                turtle.doSetChroma(value);
                break;
            case 'pensize':
                turtle.doSetPensize(value);
                break;
            case 'namedbox':
                var name = this.blocks.blockList[blk].privateData;
                if (name in this.boxes) {
                    this.boxes[name] = value;
                } else {
                    this.errorMsg(NOBOXERRORMSG, blk, name);
                }
                break;
            case 'box':
                var cblk = this.blocks.blockList[blk].connections[1];
                var name = this.parseArg(this, turtle, cblk, blk);
                if (name in this.boxes) {
                    this.boxes[name] = value;
                } else {
                    this.errorMsg(NOBOXERRORMSG, blk, name);
                }
                break;
            default:
                if (this.blocks.blockList[blk].name in this.evalSetterDict) {
                    eval(this.evalSetterDict[this.blocks.blockList[blk].name]);
                    break;
                }
                this.errorMsg('Block does not support incrementing', blk);
        }
    }

this.runFromBlockNow = function(logo, turtle, blk, isflow, receivedArg) {
        // Run a stack of blocks, beginning with blk.
        // (1) Evaluate any arguments (beginning with connection[1]);
        var args = [];
        if (logo.blocks.blockList[blk].protoblock.args > 0) {
            for (var i = 1; i < logo.blocks.blockList[blk].protoblock.args + 1; i++) {
                args.push(logo.parseArg(logo, turtle, logo.blocks.blockList[blk].connections[i], blk, receivedArg));
            }
        }

        // (2) Run function associated with the block;
        if (logo.blocks.blockList[blk].isValueBlock()) {
            var nextFlow = null;
        } else {
            // All flow blocks have a nextFlow, but it can be null
            // (i.e., end of a flow).
            var nextFlow = last(logo.blocks.blockList[blk].connections);
            var queueBlock = new Queue(nextFlow, 1, blk, receivedArg);
            if (nextFlow != null) {  // Not sure why this check is needed.
                logo.turtles.turtleList[turtle].queue.push(queueBlock);
            }
        }

        // Some flow blocks have childflows, e.g., repeat.
        var childFlow = null;
        var childFlowCount = 0;
        var actionArgs = [];

        if (logo.turtleDelay != 0) {
            logo.blocks.highlight(blk, false);
        }
        switch (logo.blocks.blockList[blk].name) {
            case 'dispatch':
                // Dispatch an event.
                if (args.length == 1) {
                    // If the event is not in the event list, add it.
                    if (!(args[0] in logo.eventList)) {
                        var event = new Event(args[0]);
                        logo.eventList[args[0]] = event;
                    }
                    logo.stage.dispatchEvent(args[0]);
                }
                break;
            case 'listen':
                if (args.length == 2) {
                    if (!(args[1] in logo.actions)) {
                        logo.errorMsg(NOACTIONERRORMSG, blk, args[1]);
                        logo.stopTurtle = true;
                    } else {
                        var listener = function (event) {
                            if (logo.turtles.turtleList[turtle].running) {
                                var queueBlock = new Queue(logo.actions[args[1]], 1, blk);
                                logo.parentFlowQueue[turtle].push(blk);
                                logo.turtles.turtleList[turtle].queue.push(queueBlock);
                            } else {
                                // Since the turtle has stopped
                                // running, we need to run the stack
                                // from here.
                                if (isflow)
                                    logo.runFromBlockNow(logo, turtle, logo.actions[args[1]], isflow, receivedArg);
                                else
                                    logo.runFromBlock(logo, turtle, logo.actions[args[1]], isflow, receivedArg);
                            }
                        }
                        // If there is already a listener, remove it
                        // before adding the new one.
                        if (args[0] in logo.turtles.turtleList[turtle].listeners) {
                            logo.stage.removeEventListener(args[0], logo.turtles.turtleList[turtle].listeners[args[0]], false);
                        }
                        logo.turtles.turtleList[turtle].listeners[args[0]] = listener;
                        logo.stage.addEventListener(args[0], listener, false);
                    }
                }
                break;
            case 'start':
                if (args.length == 1) {
                    childFlow = args[0];
                    childFlowCount = 1;
                }
                break;
            case 'nameddo':
                var name = logo.blocks.blockList[blk].privateData;
                if (name in logo.actions) {
                    childFlow = logo.actions[name];
                    childFlowCount = 1;
                } else {
                    logo.errorMsg(NOACTIONERRORMSG, blk, name);
                    logo.stopTurtle = true;
                }
                break;
            // if we clicked on an action block, treat it like a do block.
            case 'action':
            case 'do':
                if (args.length == 1) {
                    if (args[0] in logo.actions) {
                        childFlow = logo.actions[args[0]];
                        childFlowCount = 1;
                    } else {
                        logo.errorMsg(NOACTIONERRORMSG, blk, args[0]);
                        logo.stopTurtle = true;
                    }
                }
                break;
            case 'nameddoArg':
                var name = logo.blocks.blockList[blk].privateData;
                while(actionArgs.length > 0) {
                    actionArgs.pop();
                }
                if (logo.blocks.blockList[blk].argClampSlots.length > 0) {
                    for (var i = 0; i < logo.blocks.blockList[blk].argClampSlots.length; i++){
                        var t = (logo.parseArg(logo, turtle, logo.blocks.blockList[blk].connections[i+1], blk, receivedArg));
                        actionArgs.push(t);
                    }
                }
                if (name in logo.actions) {
                    childFlow = logo.actions[name]
                    childFlowCount = 1;
                } else{
                    logo.errorMsg(NOACTIONERRORMSG, blk, name);
                    logo.stopTurtle = true;
                }
                break;
            case 'doArg':
                while(actionArgs.length > 0) {
                    actionArgs.pop();
                }
                if (logo.blocks.blockList[blk].argClampSlots.length > 0) {
                    for (var i = 0; i < logo.blocks.blockList[blk].argClampSlots.length; i++){
                        var t = (logo.parseArg(logo, turtle, logo.blocks.blockList[blk].connections[i+2], blk, receivedArg));
                        actionArgs.push(t);
                    }
                }
                if (args.length >= 1) {
                    if (args[0] in logo.actions) {
                        actionName = args[0];
                        childFlow = logo.actions[args[0]];
                        childFlowCount = 1;
                    } else {
                        logo.errorMsg(NOACTIONERRORMSG, blk, args[0]);
                        logo.stopTurtle = true;
                    }
                }
                break;
            case 'forever':
                if (args.length == 1) {
                    childFlow = args[0];
                    childFlowCount = -1;
                }
                break;
            case 'break':
                logo.doBreak(turtle);
                // Since we pop the queue, we need to unhighlight our parent.
                var parentBlk = logo.blocks.blockList[blk].connections[0];
                if (parentBlk != null) {
                    logo.unhightlightQueue[turtle].push(parentBlk);
                }
                break;
            case 'wait':
                if (args.length == 1) {
                    logo.doWait(turtle, args[0]);
                }
                break;
            case 'print':
                if (args.length == 1) {
                    logo.textMsg(args[0].toString());
                }
                break;
            case 'speak':
                if (args.length == 1) {
                    if (logo.meSpeak) {
                        logo.meSpeak.speak(args[0]);
                    }
                }
                break;
            case 'repeat':
                if (args.length == 2) {
                    if (typeof(args[0]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        childFlow = args[1];
                        childFlowCount = Math.floor(args[0]);
                    }
                }
                break;
            case 'clamp':
                if (args.length == 1) {
                    childFlow = args[0];
                    childFlowCount = 1;
                }
                break;
            case 'until':
                // Similar to 'while'
                if (args.length == 2) {
                    // Queue the child flow.
                    childFlow = args[1];
                    childFlowCount = 1;
                    if (!args[0]) {
                        // We will add the outflow of the until block
                        // each time through, so we pop it off so as
                        // to not accumulate multiple copies.
                        var queueLength = logo.turtles.turtleList[turtle].queue.length;
                        if (queueLength > 0) {
                            if (logo.turtles.turtleList[turtle].queue[queueLength - 1].parentBlk == blk) {
                                logo.turtles.turtleList[turtle].queue.pop();
                            }
                        }
                        // Requeue.
                        var parentBlk = logo.blocks.blockList[blk].connections[0];
                        var queueBlock = new Queue(blk, 1, parentBlk);
                        logo.parentFlowQueue[turtle].push(parentBlk);
                        logo.turtles.turtleList[turtle].queue.push(queueBlock);
                    } else {
                        // Since an until block was requeued each
                        // time, we need to flush the queue of all but
                        // the last one, otherwise the child of the
                        // until block is executed multiple times.
                        var queueLength = logo.turtles.turtleList[turtle].queue.length;
                        for (var i = queueLength - 1; i > 0; i--) {
                            if (logo.turtles.turtleList[turtle].queue[i].parentBlk == blk) {
                                logo.turtles.turtleList[turtle].queue.pop();
                            }
                        }
                    }
                }
                break;
            case 'waitFor':
                if (args.length == 1) {
                    if (!args[0]) {
                        // Requeue.
                        var parentBlk = logo.blocks.blockList[blk].connections[0];
                        var queueBlock = new Queue(blk, 1, parentBlk);
                        logo.parentFlowQueue[turtle].push(parentBlk);
                        logo.turtles.turtleList[turtle].queue.push(queueBlock);
                        logo.doWait(0.05);
                    } else {
                        // Since a wait for block was requeued each
                        // time, we need to flush the queue of all but
                        // the last one, otherwise the child of the
                        // while block is executed multiple times.
                        var queueLength = logo.turtles.turtleList[turtle].queue.length;
                        for (var i = queueLength - 1; i > 0; i--) {
                            if (logo.turtles.turtleList[turtle].queue[i].parentBlk == blk) {
                                logo.turtles.turtleList[turtle].queue.pop();
                            }
                        }
                    }
                }
                break;
            case 'if':
                if (args.length == 2) {
                    if (args[0]) {
                        childFlow = args[1];
                        childFlowCount = 1;
                    }
                }
                break;
            case 'ifthenelse':
                if (args.length == 3) {
                    if (args[0]) {
                        childFlow = args[1];
                        childFlowCount = 1;
                    } else {
                        childFlow = args[2];
                        childFlowCount = 1;
                    }
                }
                break;
            case 'while':
                // While is tricky because we need to recalculate
                // args[0] each time, so we requeue the While block
                // itself.
                if (args.length == 2) {
                    if (args[0]) {
                        // We will add the outflow of the while block
                        // each time through, so we pop it off so as
                        // to not accumulate multiple copies.
                        var queueLength = logo.turtles.turtleList[turtle].queue.length;
                        if (queueLength > 0) {
                            if (logo.turtles.turtleList[turtle].queue[queueLength - 1].parentBlk == blk) {
                                logo.turtles.turtleList[turtle].queue.pop();
                            }
                        }

                        var parentBlk = logo.blocks.blockList[blk].connections[0];
                        var queueBlock = new Queue(blk, 1, parentBlk);
                        logo.parentFlowQueue[turtle].push(parentBlk);
                        logo.turtles.turtleList[turtle].queue.push(queueBlock);

                        // and queue the interior child flow.
                        childFlow = args[1];
                        childFlowCount = 1;
                    } else {
                        // Since a while block was requeued each time,
                        // we need to flush the queue of all but the
                        // last one, otherwise the child of the while
                        // block is executed multiple times.
                        var queueLength = logo.turtles.turtleList[turtle].queue.length;
                        for (var i = queueLength - 1; i > 0; i--) {
                            if (logo.turtles.turtleList[turtle].queue[i].parentBlk == blk) {
                            // if (logo.turtles.turtleList[turtle].queue[i].blk == blk) {
                                logo.turtles.turtleList[turtle].queue.pop();
                            }
                        }
                    }
                }
                break;
            case 'storein':
                if (args.length == 2) {
                    logo.boxes[args[0]] = args[1];
                }
                break;
            case 'incrementOne':
                var i = 1;
            case 'increment':
                // If the 2nd arg is not set, default to 1.
                if (args.length == 2) {
                    var i = args[1];
                }

                if (args.length >= 1) {
                    var settingBlk = logo.blocks.blockList[blk].connections[1];
                    logo.blockSetter(settingBlk, args[0] + i, turtle);
                }
                break;
            case 'clear':
                logo.svgBackground = true;
                logo.turtles.turtleList[turtle].doClear();
                break;
            case 'setxy':
                if (args.length == 2) {
                    if (typeof(args[0]) == 'string' || typeof(args[1]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doSetXY(args[0], args[1]);
                    }
                }
                break;
            case 'arc':
                if (args.length == 2) {
                    if (typeof(args[0]) == 'string' || typeof(args[1]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doArc(args[0], args[1]);
                    }
                }
                break;
            case 'return':
                if (args.length == 1) {
                    logo.returns.push(args[0]);
                }
                break;
            case 'forward':
                if (args.length == 1) {
                    if (typeof(args[0]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doForward(args[0]);
                    }
                }
                break;
            case 'back':
                if (args.length == 1) {
                    if (typeof(args[0]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doForward(-args[0]);
                    }
                }
                break;
            case 'right':
                if (args.length == 1) {
                    if (typeof(args[0]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doRight(args[0]);
                    }
                }
                break;
            case 'left':
                if (args.length == 1) {
                    if (typeof(args[0]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doRight(-args[0]);
                    }
                }
                break;
            case 'setheading':
                if (args.length == 1) {
                    if (typeof(args[0]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doSetHeading(args[0]);
                    }
                }
                break;
            case 'show':
                if (args.length == 2) {
                    if (typeof(args[1]) == 'string') {
                        var len = args[1].length;
                        if (len == 14 && args[1].substr(0, 14) == CAMERAVALUE) {
                            doUseCamera(args, logo.turtles, turtle, false, logo.cameraID, logo.setCameraID, logo.errorMsg);
                        } else if (len == 13 && args[1].substr(0, 13) == VIDEOVALUE) {
                            doUseCamera(args, logo.turtles, turtle, true, logo.cameraID, logo.setCameraID, logo.errorMsg);
                        } else if (len > 10 && args[1].substr(0, 10) == 'data:image') {
                            logo.turtles.turtleList[turtle].doShowImage(args[0], args[1]);
                        } else if (len > 8 && args[1].substr(0, 8) == 'https://') {
                            logo.turtles.turtleList[turtle].doShowURL(args[0], args[1]);
                        } else if (len > 7 && args[1].substr(0, 7) == 'http://') {
                            logo.turtles.turtleList[turtle].doShowURL(args[0], args[1]);
                        } else if (len > 7 && args[1].substr(0, 7) == 'file://') {
                            logo.turtles.turtleList[turtle].doShowURL(args[0], args[1]);
                        } else {
                            logo.turtles.turtleList[turtle].doShowText(args[0], args[1]);
                        }
                    } else if (typeof(args[1]) == 'object' && logo.blocks.blockList[logo.blocks.blockList[blk].connections[2]].name == 'loadFile') {
                        if (args[1]) {
                            logo.turtles.turtleList[turtle].doShowText(args[0], args[1][1]);
                        } else {
                            logo.errorMsg(_('You must select a file.'));
                        }
                    } else {
                        logo.turtles.turtleList[turtle].doShowText(args[0], args[1]);
                    }
                }
                break;
            case 'turtleshell':
                if (args.length == 2) {
                    if (typeof(args[0]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doTurtleShell(args[0], args[1]);
                    }
                }
                break;
            case 'setcolor':
                if (args.length == 1) {
                    if (typeof(args[0]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doSetColor(args[0]);
                    }
                }
                break;

            case 'setfont' :
                if (args.length == 1) {
                    if (typeof(args[0]) == 'string') {
                        logo.turtles.turtleList[turtle].doSetFont(args[0]);
                    } else {
                        logo.errorMsg(NOSTRINGERRORMSG, blk);
                        logo.stopTurtle = true;
                    }
                }
                break;
            case 'sethue':
                if (args.length == 1) {
                    if (typeof(args[0]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doSetHue(args[0]);
                    }
                }
                break;
            case 'setshade':
                if (args.length == 1) {
                    if (typeof(args[0]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doSetValue(args[0]);
                    }
                }
                break;
            case 'setgrey':
                if (args.length == 1) {
                    if (typeof(args[0]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doSetChroma(args[0]);
                    }
                }
                break;
            case 'setpensize':
                if (args.length == 1) {
                    if (typeof(args[0]) == 'string') {
                        logo.errorMsg(NANERRORMSG, blk);
                        logo.stopTurtle = true;
                    } else {
                        logo.turtles.turtleList[turtle].doSetPensize(args[0]);
                    }
                }
                break;
            case 'beginfill':
                logo.turtles.turtleList[turtle].doStartFill();
                break;
            case 'endfill':
                logo.turtles.turtleList[turtle].doEndFill();
                break;
            case 'beginhollowline':
                logo.turtles.turtleList[turtle].doStartHollowLine();
                break;
            case 'endhollowline':
                logo.turtles.turtleList[turtle].doEndHollowLine();
                break;
            case 'fillscreen':
                if (args.length == 3) {
                    var hue = logo.turtles.turtleList[turtle].color;
                    var value = logo.turtles.turtleList[turtle].value;
                    var chroma = logo.turtles.turtleList[turtle].chroma;
                    logo.turtles.turtleList[turtle].doSetHue(args[0]);
                    logo.turtles.turtleList[turtle].doSetValue(args[1]);
                    logo.turtles.turtleList[turtle].doSetChroma(args[2]);
                    logo.setBackgroundColor(turtle);
                    logo.turtles.turtleList[turtle].doSetHue(hue);
                    logo.turtles.turtleList[turtle].doSetValue(value);
                    logo.turtles.turtleList[turtle].doSetChroma(chroma);
                }
                break;
            case 'nobackground':
                logo.svgBackground = false;
                break;
            case 'background':
                logo.setBackgroundColor(turtle);
                break;
            case 'penup':
                logo.turtles.turtleList[turtle].doPenUp();
                break;
            case 'pendown':
                logo.turtles.turtleList[turtle].doPenDown();
                break;
	    case 'openProject':
                url = args[0];
                function ValidURL(str) {
                    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
                        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
                    if(!pattern.test(str)) {
                        logo.errorMsg("Please enter a valid URL.");
                        return false;
                    } else {
                        return true;
                    }
                }
                if (ValidURL(url)) {
                    var win = window.open(url, '_blank')
                    if (win) {
                        //Browser has allowed it to be opened
                        win.focus();
                    } else {
                        //Broswer has blocked it
                        alert('Please allow popups for this site');
                    }
                }
                break;
            case 'vspace':
                break;
            case 'playback':
                sound = new Howl({
                    urls: [args[0]]
                });
                logo.sounds.push(sound);
                sound.play();
                break;
            case 'stopplayback':
                for (sound in logo.sounds) {
                    logo.sounds[sound].stop();
                }
                logo.sounds = [];
                break;
            case 'stopvideocam':
                if (cameraID != null) {
                    doStopVideoCam(logo.cameraID, logo.setCameraID);
                }
                break;
            case 'startTurtle':
                var startHere = logo.getTargetTurtle(args);

                if (!startHere) {
                    logo.errorMsg('Cannot find turtle: ' + args[0], blk)
                } else {
                    var targetTurtle = logo.blocks.blockList[startHere].value;
                    if (logo.turtles.turtleList[targetTurtle].running) {
                        logo.errorMsg('Turtle is already running.', blk);
                        break;
                    }
                    logo.turtles.turtleList[targetTurtle].queue = [];
                    logo.turtles.turtleList[targetTurtle].running = true;
                    logo.parentFlowQueue[targetTurtle] = [];
                    logo.unhightlightQueue[targetTurtle] = [];
                    logo.parameterQueue[targetTurtle] = [];
                    runFromBlock(logo, targetTurtle, startHere, isflow, receivedArg);
                }
                break;
            case 'stopTurtle':
                var startHere = logo.getTargetTurtle(args);
                var targetTurtle = logo.blocks.blockList[startHere].value;
                logo.turtles.turtleList[targetTurtle].queue = [];
                logo.parentFlowQueue[targetTurtle] = [];
                logo.unhightlightQueue[targetTurtle] = [];
                logo.parameterQueue[targetTurtle] = [];
                logo.doBreak(targetTurtle);
                break;
            case 'showblocks':
                logo.showBlocks();
                logo.setTurtleDelay(DEFAULTDELAY);
                break;
            case 'hideblocks':
                logo.hideBlocks();
                logo.setTurtleDelay(0);
                break;
            case 'savesvg':
                if (args.length == 1) {
                    if (logo.svgBackground) {
                        logo.svgOutput = '<rect x="0" y="0" height="' + this.canvas.height + '" width="' + this.canvas.width + '" fill="' + body.style.background + '"/>\n' + logo.svgOutput;
                    }
                    doSaveSVG(logo, args[0]);
                }
                break;
            case 'tone':
                if (typeof(logo.turtleOscs[turtle]) == "undefined") {
                    logo.turtleOscs[turtle] = new p5.TriOsc();
                }

                osc = logo.turtleOscs[turtle];
                osc.stop();
                osc.start();
                osc.amp(0);

                osc.freq(args[0]);
                osc.fade(0.5, 0.2);

                setTimeout(function(osc) {
                    osc.fade(0, 0.2);
                }, args[1], osc);

                break;
            case 'showHeap':
                if (!(turtle in logo.turtleHeaps)) {
                    logo.turtleHeaps[turtle] = [];
                }
                logo.textMsg(JSON.stringify(logo.turtleHeaps[turtle]));
                break;
            case 'emptyHeap':
                logo.turtleHeaps[turtle] = [];
                break;
            case 'push':
                if (args.length == 1) {
                    if (!(turtle in logo.turtleHeaps)) {
                        logo.turtleHeaps[turtle] = [];
                    }
                    logo.turtleHeaps[turtle].push(args[0]);
                }
                break;
            case 'saveHeap':
                function downloadFile(filename, mimetype, content) {
                    var download = document.createElement('a');
                    download.setAttribute('href', 'data:' + mimetype + ';charset-utf-8,' + content);
                    download.setAttribute('download', filename);
                    document.body.appendChild(download);
                    download.click();
                    document.body.removeChild(download);
                }
                if (args[0] && turtle in logo.turtleHeaps) {
                     downloadFile(args[0], 'text/json', JSON.stringify(logo.turtleHeaps[turtle]));
                }
                break;
            case 'loadHeap':
                var block = logo.blocks.blockList[blk];
                if (turtle in logo.turtleHeaps) {
                    var oldHeap = logo.turtleHeaps[turtle];
                } else {
                    var oldHeap = [];
                }
                var c = block.connections[1];
                if (c != null && blocks.blockList[c].name == 'loadFile') {
                    if (args.length != 1) {
                        logo.errorMsg(_('You need to select a file.'));
                    } else {
                        try { 
                            console.log(blocks.blockList[c].value);
                            logo.turtleHeaps[turtle] = JSON.parse(blocks.blockList[c].value[1]);
                            if (!Array.isArray(logo.turtleHeaps[turtle])) {
                                throw 'is not array';
                            }
                        } catch (e) {
                            logo.turtleHeaps[turtle] = oldHeap;
                            logo.errorMsg(_('The file you selected does not contain a valid heap.'));
                        }
                    }
                } else {
                     logo.errorMsg(_('The loadHeap block needs a loadFile block.'))
                }
                break;
            case 'loadHeapFromApp':
                //var block = logo.blocks.blockList[blk];
                var url = args[1];
                var name = args [0]
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.open("GET", url, false );
                xmlHttp.send();
                if (xmlHttp.readyState == 4  && xmlHttp.status == 200){
                    console.log(xmlHttp.responseText);
                    //TODO: error handling
                    var data = JSON.parse(xmlHttp.responseText);
                }
                else if (xmlHttp.readyState == 4 && xmlHttp.status != 200) {
                    console.log('fetched the wrong page or network error...');
                    logo.errorMsg(_('404: Page not found'));
                    break;
                }
                else {
                    logo.errorMsg(_('xmlHttp.readyState: '+xmlHttp.readyState));
                    break;
                }
                if (name in logo.turtleHeaps){
                    var oldHeap = turtleHeaps[turtle];
                } else {
                    var oldHeap = [];
                }
                logo.turtleHeaps[name] = data;
                break;
            case 'saveHeapToApp':
                var name = args[0];
                var url = args[1];
                var data = JSON.stringify({ x: 5, y: 6 });
                var xmlHttp = new XMLHttpRequest();
                    xmlHttp.open("POST", url, true);
                    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    xmlHttp.send(data);
                if (name in logo.turtleHeaps) {
                    var data = JSON.stringify(logo.turtleHeaps[name]);
                    var xmlHttp = new XMLHttpRequest();
                    xmlHttp.open("POST", url, true);
                    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    xmlHttp.send(data);
                } else {
                    logo.errorMsg(_('turtleHeaps does not contain a valid heap for '+name));
                }
                break;
            case 'setHeapEntry':
                if (args.length == 2) {
                    if (!(turtle in logo.turtleHeaps)) {
                        logo.turtleHeaps[turtle] = [];
                    }
                    var idx = Math.floor(args[0]);
                    if (idx < 1) {
                        logo.errorMsg(_('Index must be > 0.'))
                    }
                    // If index > heap length, grow the heap.
                    while (logo.turtleHeaps[turtle].length < idx) {
                        logo.turtleHeaps[turtle].push(null);
                    }
                    logo.turtleHeaps[turtle][idx - 1] = args[1];
                }
                break;
            default:
                if (logo.blocks.blockList[blk].name in logo.evalFlowDict) {
                    eval(logo.evalFlowDict[logo.blocks.blockList[blk].name]);
                } else {
                    // Could be an arg block, so we need to print its value.
                    console.log('running an arg block?');
                    if (logo.blocks.blockList[blk].isArgBlock()) {
                        args.push(logo.parseArg(logo, turtle, blk));
                        console.log('block: ' + blk + ' turtle: ' + turtle);
                        console.log('block name: ' + logo.blocks.blockList[blk].name);
                        console.log('block value: ' + logo.blocks.blockList[blk].value);
                        if (logo.blocks.blockList[blk].value == null) {
                            logo.textMsg('null block value');
                        } else {
                            logo.textMsg(logo.blocks.blockList[blk].value.toString());
                        }
                    } else {
                        logo.errorMsg('I do not know how to ' + logo.blocks.blockList[blk].name + '.', blk);
                    }
                    logo.stopTurtle = true;
                }
                break;
        }

        // (3) Queue block below the current block.

        // If there is a child flow, queue it.
        if (childFlow != null) {
            if(logo.blocks.blockList[blk].name=='doArg' || logo.blocks.blockList[blk].name=='nameddoArg')
                var queueBlock = new Queue(childFlow, childFlowCount, blk, actionArgs);
            else
                var queueBlock = new Queue(childFlow, childFlowCount, blk, receivedArg);
            // We need to keep track of the parent block to the child
            // flow so we can unlightlight the parent block after the
            // child flow completes.
            logo.parentFlowQueue[turtle].push(blk);
            logo.turtles.turtleList[turtle].queue.push(queueBlock);
        }

        var nextBlock = null;
        // Run the last flow in the queue.
        if (logo.turtles.turtleList[turtle].queue.length > 0) {
            nextBlock = last(logo.turtles.turtleList[turtle].queue).blk;
            passArg = last(logo.turtles.turtleList[turtle].queue).args;
            // Since the forever block starts at -1, it will never == 1.
            if (last(logo.turtles.turtleList[turtle].queue).count == 1) {
                // Finished child so pop it off the queue.
                logo.turtles.turtleList[turtle].queue.pop();
            } else {
                // Decrement the counter for repeating logo flow.
                last(logo.turtles.turtleList[turtle].queue).count -= 1;
            }
        }

        if (nextBlock != null) {
            parentBlk = null;
            if (logo.turtles.turtleList[turtle].queue.length > 0) {
                parentBlk = last(logo.turtles.turtleList[turtle].queue).parentBlk;
            }

            if (parentBlk != blk) {
                // The wait block waits waitTimes longer than other
                // blocks before it is unhighlighted.
                if (logo.turtleDelay == TURTLESTEP) {
                    logo.unhighlightStepQueue[turtle] = blk;
                } else if (logo.turtleDelay > 0) {
                    setTimeout(function() {
                        logo.blocks.unhighlight(blk);
                    }, logo.turtleDelay + logo.waitTimes[turtle]);
                }
            }

            if (last(logo.blocks.blockList[blk].connections) == null) {
                // If we are at the end of the child flow, queue the
                // unhighlighting of the parent block to the flow.
                if (logo.parentFlowQueue[turtle].length > 0 && logo.turtles.turtleList[turtle].queue.length > 0 && last(logo.turtles.turtleList[turtle].queue).parentBlk != last(logo.parentFlowQueue[turtle])) {
                    logo.unhightlightQueue[turtle].push(logo.parentFlowQueue[turtle].pop());
                } else if (logo.unhightlightQueue[turtle].length > 0) {
                    // The child flow is finally complete, so unhighlight.
                    if (logo.turtleDelay != 0) {
                        setTimeout(function() {
                            logo.blocks.unhighlight(logo.unhightlightQueue[turtle].pop());
                        }, logo.turtleDelay);
                    }
                }
            }
            if (logo.turtleDelay != 0) {
                for (var pblk in logo.parameterQueue[turtle]) {
                    logo.updateParameterBlock(logo, turtle, logo.parameterQueue[turtle][pblk]);
                }
            }
            if (isflow){
                logo.runFromBlockNow(logo, turtle, nextBlock, isflow, passArg);
            }
            else{
                logo.runFromBlock(logo, turtle, nextBlock, isflow, passArg);
            }
        } else {
            // Make sure SVG path is closed.
            logo.turtles.turtleList[turtle].closeSVG();
            // Mark the turtle as not running.
            logo.turtles.turtleList[turtle].running = false;
            if (!logo.turtles.running()) {
                logo.onStopTurtle();
            }

            // Nothing else to do... so cleaning up.
            if (logo.turtles.turtleList[turtle].queue.length == 0 || blk != last(logo.turtles.turtleList[turtle].queue).parentBlk) {
                setTimeout(function() {
                    logo.blocks.unhighlight(blk);
                }, logo.turtleDelay);
            }

            // Unhighlight any parent blocks still highlighted.
            for (var b in logo.parentFlowQueue[turtle]) {
                logo.blocks.unhighlight(logo.parentFlowQueue[turtle][b]);
            }

            // Make sure the turtles are on top.
            var i = logo.stage.getNumChildren() - 1;
            logo.stage.setChildIndex(logo.turtles.turtleList[turtle].container, i);
            logo.refreshCanvas();

            for (var arg in logo.evalOnStopList) {
                eval(logo.evalOnStopList[arg]);
            }
        }

        clearTimeout(this.saveTimeout);
        var me = this;
        this.saveTimeout = setTimeout(function () {
            // Save at the end to save an image
            me.saveLocally();
        }, DEFAULTDELAY * 1.5)
    }

    this.getTargetTurtle = function(args) {
        // The target turtle name can be a string or an int.
        if (typeof(args[0]) == 'string') {
            var targetTurtleName = parseInt(args[0])
        } else {
            var targetTurtleName = args[0];
        }

        var startHere = null;

        for (var blk in this.blocks.blockList) {
            var name = this.blocks.blockList[blk].name;
            var targetTurtle = this.blocks.blockList[blk].value;
            if (name == 'start' && targetTurtle == targetTurtleName) {
                startHere = blk;
                break;
            }
        }

        return startHere;
    }



    this.loopBlock = function(name) {
        return ['forever', 'repeat', 'while', 'until'].indexOf(name) != -1;
    }

    this.doBreak = function(turtle) {
        // Look for a parent loopBlock in queue and set its count to 1.
        var parentLoopBlock = null;
        var loopBlkIdx = -1;
        var queueLength = this.turtles.turtleList[turtle].queue.length;
        for (var i = queueLength - 1; i > -1; i--) {
            if (this.loopBlock(this.blocks.blockList[this.turtles.turtleList[turtle].queue[i].blk].name)) {
                // while or until
                loopBlkIdx = this.turtles.turtleList[turtle].queue[i].blk;
                parentLoopBlock = this.blocks.blockList[loopBlkIdx];
                // Flush the parent from the queue.
                this.turtles.turtleList[turtle].queue.pop();
                break;
            } else if (this.loopBlock(this.blocks.blockList[this.turtles.turtleList[turtle].queue[i].parentBlk].name)) {
                // repeat or forever
                loopBlkIdx = this.turtles.turtleList[turtle].queue[i].parentBlk;
                parentLoopBlock = this.blocks.blockList[loopBlkIdx];
                // Flush the parent from the queue.
                this.turtles.turtleList[turtle].queue.pop();
                break;
            }
        }
        if (parentLoopBlock == null) {
            // In this case, we flush the child flow.
            this.turtles.turtleList[turtle].queue.pop();
            return;
        }

        // For while and until, we need to add any childflow from the
        // parent to the queue.
        if (parentLoopBlock.name == 'while' || parentLoopBlock.name == 'until') {
            var childFlow = last(parentLoopBlock.connections);
            if (childFlow != null) {
                var queueBlock = new Queue(childFlow, 1, loopBlkIdx);
                // We need to keep track of the parent block to the
                // child flow so we can unlightlight the parent block
                // after the child flow completes.
                this.parentFlowQueue[turtle].push(loopBlkIdx);
                this.turtles.turtleList[turtle].queue.push(queueBlock);
            }
        }
    }

    this.parseArg = function(logo, turtle, blk, parentBlk, receivedArg) {
        // Retrieve the value of a block.
        if (blk == null) {
            logo.errorMsg('Missing argument.', parentBlk);
            logo.stopTurtle = true;
            return null
        }

        if (logo.blocks.blockList[blk].protoblock.parameter) {
            if (logo.parameterQueue[turtle].indexOf(blk) == -1) {
                logo.parameterQueue[turtle].push(blk);
            }
        }

        if (logo.blocks.blockList[blk].isValueBlock()) {
            if (logo.blocks.blockList[blk].name == 'number' && typeof(logo.blocks.blockList[blk].value) == 'string') {
                try {
                    logo.blocks.blockList[blk].value = Number(logo.blocks.blockList[blk].value);
                } catch (e) {
                    console.log(e);
                }
            }
            return logo.blocks.blockList[blk].value;
        } else if (logo.blocks.blockList[blk].isArgBlock()) {
            switch (logo.blocks.blockList[blk].name) {
                case 'loudness':
                    if (!logo.mic.enabled) {
                        logo.mic.start();
                        logo.blocks.blockList[blk].value = 0;
                    } else {
                        logo.blocks.blockList[blk].value = Math.round(logo.mic.getLevel() * 1000);
                    }
                    break;
                case 'eval':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    logo.blocks.blockList[blk].value = Number(eval(a.replace(/x/g, b.toString())));
                    break;
                case 'calc':
                    var action_args = [];
                    var cblk = logo.blocks.blockList[blk].connections[1];
                    var name = logo.parseArg(logo, turtle, cblk, blk, receivedArg);
                    if (name in logo.actions) {
                        logo.runFromBlockNow(logo, turtle, logo.actions[name], true, action_args)
                            logo.blocks.blockList[blk].value = logo.returns.shift();
                    } else {
                        logo.errorMsg(NOACTIONERRORMSG, blk, name);
                        logo.stopTurtle = true;
                    }
                    break;
                case 'namedcalc':
                    var name = logo.blocks.blockList[blk].privateData;
                    var action_args = [];
                    if (name in logo.actions) {
                        logo.runFromBlockNow(logo, turtle, logo.actions[name], true, action_args)
                            logo.blocks.blockList[blk].value = logo.returns.shift();
                    } else {
                        logo.errorMsg(NOACTIONERRORMSG, blk, name);
                        logo.stopTurtle = true;
                    }
                    break;
                case 'arg':
                    var cblk = logo.blocks.blockList[blk].connections[1];
                    var name = logo.parseArg(logo, turtle, cblk, blk, receivedArg);
                    var action_args=receivedArg
                    if(action_args.length >= Number(name)){
                        var value = action_args[Number(name)-1];
                        logo.blocks.blockList[blk].value = value;
                    }else {
                        logo.errorMsg('Invalid argument',blk);
                        logo.stopTurtle = true;
                    }
                    return logo.blocks.blockList[blk].value;
                    break;
                case 'box':
                    var cblk = logo.blocks.blockList[blk].connections[1];
                    var name = logo.parseArg(logo, turtle, cblk, blk, receivedArg);
                    if (name in logo.boxes) {
                        logo.blocks.blockList[blk].value = logo.boxes[name];
                    } else {
                        logo.errorMsg(NOBOXERRORMSG, blk, name);
                        logo.stopTurtle = true;
                        logo.blocks.blockList[blk].value = null;
                    }
                    break;
                case 'turtlename':
                    logo.blocks.blockList[blk].value = logo.turtles.turtleList[turtle].name;
                    break;
                case 'namedbox':
                    var name = logo.blocks.blockList[blk].privateData;
                    if (name in logo.boxes) {
                        logo.blocks.blockList[blk].value = logo.boxes[name];
                    } else {
                        logo.errorMsg(NOBOXERRORMSG, blk, name);
                        logo.stopTurtle = true;
                        logo.blocks.blockList[blk].value = null;
                    }
                    break;
                case 'namedarg' :
                    var name = logo.blocks.blockList[blk].privateData;
                    var action_args=receivedArg
                    if(action_args.length >= Number(name)){
                        var value = action_args[Number(name)-1];
                        logo.blocks.blockList[blk].value = value;
                    }else {
                        logo.errorMsg('Invalid argument',blk);
                    }
                    return logo.blocks.blockList[blk].value;
                    break;
                case 'sqrt':
                    var cblk = logo.blocks.blockList[blk].connections[1];
                    var a = logo.parseArg(logo, turtle, cblk, blk, receivedArg);
                    if (a < 0) {
                        logo.errorMsg(NOSQRTERRORMSG, blk);
                        logo.stopTurtle = true;
                        a = -a;
                    }
                    logo.blocks.blockList[blk].value = logo.doSqrt(a);
                    break;
                case 'int':
                    var cblk = logo.blocks.blockList[blk].connections[1];
                    var a = logo.parseArg(logo, turtle, cblk, blk, receivedArg);
                    logo.blocks.blockList[blk].value = Math.floor(a);
                    break;
                case 'mod':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    logo.blocks.blockList[blk].value = logo.doMod(a, b);
                    break;
                case 'not':
                    var cblk = logo.blocks.blockList[blk].connections[1];
                    var a = logo.parseArg(logo, turtle, cblk, blk, receivedArg);
                    logo.blocks.blockList[blk].value = !a;
                    break;
                case 'greater':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    logo.blocks.blockList[blk].value = (Number(a) > Number(b));
                    break;
                case 'equal':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    logo.blocks.blockList[blk].value = (a == b);
                    break;
                case 'less':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    var result = (Number(a) < Number(b));
                    logo.blocks.blockList[blk].value = result;
                    break;
                case 'random':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    logo.blocks.blockList[blk].value = logo.doRandom(a, b);
                    break;
                case 'oneOf':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    logo.blocks.blockList[blk].value = logo.doOneOf(a, b);
                    break;
                case 'plus':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    logo.blocks.blockList[blk].value = logo.doPlus(a, b);
                    break;
                case 'multiply':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    logo.blocks.blockList[blk].value = logo.doMultiply(a, b);
                    break;
                case 'divide':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    logo.blocks.blockList[blk].value = logo.doDivide(a, b);
                    break;
                case 'minus':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    logo.blocks.blockList[blk].value = logo.doMinus(a, b);
                    break;
                case 'neg':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    logo.blocks.blockList[blk].value = logo.doMinus(0, a);
                    break;
                case 'myclick':
                    logo.blocks.blockList[blk].value = 'click' + logo.turtles.turtleList[turtle].name;
                    break;
                case 'heading':
                    logo.blocks.blockList[blk].value = logo.turtles.turtleList[turtle].orientation;
                    break;
                case 'x':
                    logo.blocks.blockList[blk].value = logo.turtles.screenX2turtleX(logo.turtles.turtleList[turtle].container.x);
                    break;
                case 'y':
                    logo.blocks.blockList[blk].value = logo.turtles.screenY2turtleY(logo.turtles.turtleList[turtle].container.y);
                    break;
                case 'xturtle':
                case 'yturtle':
                    var cblk = logo.blocks.blockList[blk].connections[1];
                    var targetTurtle = logo.parseArg(logo, turtle, cblk, blk, receivedArg);
                    for (var i = 0; i < logo.turtles.turtleList.length; i++) {
                        var logoTurtle = logo.turtles.turtleList[i];
                        if (targetTurtle == logoTurtle.name) {
                            if (logo.blocks.blockList[blk].name == 'yturtle') {
                                logo.blocks.blockList[blk].value = logo.turtles.screenY2turtleY(logoTurtle.container.y);
                            } else {
                                logo.blocks.blockList[blk].value = logo.turtles.screenX2turtleX(logoTurtle.container.x);
                            }
                            break;
                        }
                    }
                    if (i == logo.turtles.turtleList.length) {
                        logo.errorMsg('Could not find turtle ' + targetTurtle, blk);
                        logo.blocks.blockList[blk].value = 0;
                    }
                    break;
                case 'color':
                case 'hue':
                    logo.blocks.blockList[blk].value = logo.turtles.turtleList[turtle].color;
                    break;
                case 'shade':
                    logo.blocks.blockList[blk].value = logo.turtles.turtleList[turtle].value;
                    break;
                case 'grey':
                    logo.blocks.blockList[blk].value = logo.turtles.turtleList[turtle].chroma;
                    break;
                case 'pensize':
                    logo.blocks.blockList[blk].value = logo.turtles.turtleList[turtle].stroke;
                    break;
                case 'and':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    logo.blocks.blockList[blk].value = a && b;
                    break;
                case 'or':
                    var cblk1 = logo.blocks.blockList[blk].connections[1];
                    var cblk2 = logo.blocks.blockList[blk].connections[2];
                    var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
                    var b = logo.parseArg(logo, turtle, cblk2, blk, receivedArg);
                    logo.blocks.blockList[blk].value = a || b;
                    break;
                case 'time':
                    var d = new Date();
                    logo.blocks.blockList[blk].value = (d.getTime() - logo.time) / 1000;
                    break;
                case 'hspace':
                    var cblk = logo.blocks.blockList[blk].connections[1];
                    var v = logo.parseArg(logo, turtle, cblk, blk, receivedArg);
                    logo.blocks.blockList[blk].value = v;
                    break;
                case 'mousex':
                    logo.blocks.blockList[blk].value = logo.getStageX();
                    break;
                case 'mousey':
                    logo.blocks.blockList[blk].value = logo.getStageY();
                    break;
                case 'mousebutton':
                    logo.blocks.blockList[blk].value = logo.getStageMouseDown();
                    break;
                case 'keyboard':
                    logo.lastKeyCode = logo.getCurrentKeyCode();
                    logo.blocks.blockList[blk].value = logo.lastKeyCode;
                    logo.clearCurrentKeyCode();
                    break;
                case 'getcolorpixel':
                    var wasVisible = logo.turtles.turtleList[turtle].container.visible;
                    logo.turtles.turtleList[turtle].container.visible = false;
                    var x = logo.turtles.turtleList[turtle].container.x;
                    var y = logo.turtles.turtleList[turtle].container.y;
                    logo.refreshCanvas();
                    var ctx = this.canvas.getContext("2d");
                    var imgData = ctx.getImageData(x, y, 1, 1).data;
                    var color = searchColors(imgData[0], imgData[1], imgData[2]);
                    if (imgData[3] == 0) {
                        color = body.style.background.substring(body.style.background.indexOf('(') + 1, body.style.background.lastIndexOf(')')).split(/,\s*/),
                        color = searchColors(color[0], color[1], color[2]);
                    }
                    logo.blocks.blockList[blk].value = color;
                    if (wasVisible) {
                        logo.turtles.turtleList[turtle].container.visible = true;
                    }
                    break;
                case 'loadFile':
                    // No need to do anything here.
                    break;
                case 'tofrequency':
                    var block = logo.blocks.blockList[blk];
                    var cblk = block.connections[1];
                    var v = logo.parseArg(logo, turtle, cblk, blk, receivedArg);
                    try {
                        if (typeof(v) == 'string') {
                            v = v.toUpperCase();
                            var note = ['A', 'A♯/B♭', 'B', 'C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭'].indexOf(v[0]);
                            var octave = v[1];
                            if (note > 2) {
                                octave -= 1;  // New octave starts on C
                            }
                            var i = octave * 12 + note;
                            block.value = 27.5 * Math.pow(1.05946309435929, i);
                        } else {
                            block.value = 440 * Math.pow(2, (v - 69) / 12);
                        }
                    } catch (e) {
                        this.errorMsg(v + ' is not a note.');
                        block.value = 440;
                    }
                    break;
                case 'pop':
                    var block = logo.blocks.blockList[blk];
                    if (turtle in logo.turtleHeaps && logo.turtleHeaps[turtle].length > 0) {
                        block.value = logo.turtleHeaps[turtle].pop();
                    } else {
                        logo.errorMsg(_('empty heap'));
                        block.value = null;
                    }
                    break;
                case 'indexHeap':
                    var block = logo.blocks.blockList[blk];
                    var cblk = logo.blocks.blockList[blk].connections[1];
                    var a = logo.parseArg(logo, turtle, cblk, blk, receivedArg);
                    if (!(turtle in logo.turtleHeaps)) {
                        logo.turtleHeaps[turtle] = [];
                    }
                    // If index > heap length, grow the heap.
                    while (logo.turtleHeaps[turtle].length < a) {
                        logo.turtleHeaps[turtle].push(null);
                    }
                    block.value = logo.turtleHeaps[turtle][a - 1];
                    break;
                case 'heapLength':
                    var block = logo.blocks.blockList[blk];
                    if (!(turtle in logo.turtleHeaps)) {
                        logo.turtleHeaps[turtle] = [];
                    }
                    console.log(logo.turtleHeaps[turtle].length);
                    block.value = logo.turtleHeaps[turtle].length;
                    break;
                case 'heapEmpty':
                    var block = logo.blocks.blockList[blk];
                    if (turtle in logo.turtleHeaps) {
                        block.value = (logo.turtleHeaps[turtle].length == 0);
                    } else {
                        block.value = true;
                    }
                    break;
                default:
                    if (logo.blocks.blockList[blk].name in logo.evalArgDict) {
                        eval(logo.evalArgDict[logo.blocks.blockList[blk].name]);
                    } else {
                        console.log('ERROR: I do not know how to ' + logo.blocks.blockList[blk].name);
                    }
                    break;
            }
            return logo.blocks.blockList[blk].value;
        } else if (logo.blocks.blockList[blk].isArgClamp()) {
            switch (logo.blocks.blockList[blk].name) {
                case 'namedcalcArg':
                    var name = logo.blocks.blockList[blk].privateData;
                    var action_args = [];
                    if (logo.blocks.blockList[blk].argClampSlots.length > 0) {
                        for (var i = 0; i < logo.blocks.blockList[blk].argClampSlots.length; i++){
                            var t=(logo.parseArg(logo, turtle, logo.blocks.blockList[blk].connections[i+1], blk, receivedArg));
                            action_args.push(t);
                        }
                    }
                    if (name in logo.actions) {
                        logo.runFromBlockNow(logo, turtle, logo.actions[name], true, action_args)
                        logo.blocks.blockList[blk].value = logo.returns.pop();
                    } else {
                        logo.errorMsg(NOACTIONERRORMSG, blk, name);
                        logo.stopTurtle = true;
                    }
                    break;
                case 'calcArg':
                    var action_args = [];
                    if (logo.blocks.blockList[blk].argClampSlots.length > 0) {
                        for (var i = 0; i < logo.blocks.blockList[blk].argClampSlots.length; i++){
                            var t=(logo.parseArg(logo, turtle, logo.blocks.blockList[blk].connections[i+2], blk, receivedArg));
                            action_args.push(t);
                        }
                    }
                    var cblk = logo.blocks.blockList[blk].connections[1];
                    var name = logo.parseArg(logo, turtle, cblk, blk, receivedArg);
                    if (name in logo.actions) {
                        logo.runFromBlockNow(logo, turtle, logo.actions[name], true, action_args)
                        logo.blocks.blockList[blk].value = logo.returns.pop();
                    } else {
                        logo.errorMsg(NOACTIONERRORMSG, blk, name);
                        logo.stopTurtle = true;
                    }
                    break;
                case 'nameddoArg':
                    return blk;
                    break;
                case 'doArg' :
                    return blk;
                    break;
                default:
                    if (logo.blocks.blockList[blk].name in logo.evalArgDict) {
                        eval(logo.evalArgDict[logo.blocks.blockList[blk].name]);
                    } else {
                        console.log('ERROR: I do not know how to ' + logo.blocks.blockList[blk].name);
                    }
                    break;
            }
            return logo.blocks.blockList[blk].value;
        } else {
            return blk;
        }
    }

    this.doWait = function(turtle, secs) {
        this.waitTimes[turtle] = Number(secs) * 1000;
    }

    // Math functions
    this.doRandom = function(a, b) {
        if (typeof(a) == 'string' || typeof(b) == 'string') {
            this.errorMsg(NANERRORMSG);
            this.stopTurtle = true;
            return 0;
        }
        return Math.floor(Math.random() * (Number(b) - Number(a) + 1) + Number(a));
    }

    this.doOneOf = function(a, b) {
        if (Math.random() < 0.5) {
            return a;
        } else {
            return b;
        }
    }

    this.doMod = function(a, b) {
        if (typeof(a) == 'string' || typeof(b) == 'string') {
            this.errorMsg(NANERRORMSG);
            this.stopTurtle = true;
            return 0;
        }
        return Number(a) % Number(b);
    }

    this.doSqrt = function(a) {
        if (typeof(a) == 'string') {
            this.errorMsg(NANERRORMSG);
            this.stopTurtle = true;
            return 0;
        }
        return Math.sqrt(Number(a));
    }

    this.doPlus = function(a, b) {
        if (typeof(a) == 'string' || typeof(b) == 'string') {
            if (typeof(a) == 'string') {
                var aString = a;
            } else {
                var aString = a.toString();
            }
            if (typeof(b) == 'string') {
                var bString = b;
            } else {
                var bString = b.toString();
            }
            return aString + bString;
        } else {
            return Number(a) + Number(b);
        }
    }

    this.doMinus = function(a, b) {
        if (typeof(a) == 'string' || typeof(b) == 'string') {
            this.errorMsg(NANERRORMSG);
            this.stopTurtle = true;
            return 0;
        }
        return Number(a) - Number(b);
    }

    this.doMultiply = function(a, b) {
        if (typeof(a) == 'string' || typeof(b) == 'string') {
            this.errorMsg(NANERRORMSG);
            this.stopTurtle = true;
            return 0;
        }
        return Number(a) * Number(b);
    }

    this.doDivide = function(a, b) {
        if (typeof(a) == 'string' || typeof(b) == 'string') {
            this.errorMsg(NANERRORMSG);
            this.stopTurtle = true;
            return 0;
        }
        if (Number(b) == 0) {
            this.errorMsg(ZERODIVIDEERRORMSG);
            this.stopTurtle = true;
            return 0;
        } else {
            return Number(a) / Number(b);
        }
    }

    this.setBackgroundColor = function(turtle) {
        /// Change body background in DOM to current color.
        var body = document.body;
        if (turtle == -1) {
            var c = platformColor.background;
        } else {
            var c = this.turtles.turtleList[turtle].canvasColor;
        }

        body.style.background = c;
        document.querySelector('.canvasHolder').style.background = c;
        this.svgOutput = '';
    }

    this.setCameraID = function(id) {
        this.cameraID = id;
    }

    this.hideBlocks = function() {
            // Hide all the blocks.
            this.blocks.hide();
            // And hide some other things.
            // for (var turtle = 0; turtle < this.turtles.turtleList.length; turtle++) {
                // this.turtles.turtleList[turtle].container.visible = false;
            // }
            //trashcan.hide();
            //palettes.hide();
            this.refreshCanvas();
        }

    this.showBlocks = function() {
            // Show all the blocks.
            this.blocks.show();
            this.blocks.bringToTop();
            // And show some other things.
            // for (var turtle = 0; turtle < this.turtles.turtleList.length; turtle++) {
                // this.turtles.turtleList[turtle].container.visible = true;
            // }
            // trashcan.show();
            this.refreshCanvas();
        }
}
