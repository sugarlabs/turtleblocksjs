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

// Definition of special blocks less commonly included.

// Define block actions here (flow blocks and arg blocks)
var evalFlowDict = {
    'publish': "if (args.length == 1) {doPublish(args[0]);};",
    'savesvg': "if (args.length == 1) {doSaveSVG(canvas, turtles, args[0])};",
    'showblocks': "showBlocks(); turtleDelay = defaultDelay;",
    'hideblocks': "hideBlocks(); turtleDelay = 0;",
};

var evalArgDict = {
    'time': 'var d = new Date(); blocks.blockList[blk].value = (d.getTime() - time) / 1000;',
    'mousex': 'blocks.blockList[blk].value = stageX;',
    'mousey': 'blocks.blockList[blk].value = stageY;',
    'mousebutton': 'blocks.blockList[blk].value = stageMouseDown;',
};

// Define block prototypes here
function initAdvancedProtoBlocks(palettes, blocks) {
    blocks.palettes = palettes;

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

    var printBlock = new ProtoBlock('print');
    printBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['print'] = printBlock;
    printBlock.oneArgBlock();
    printBlock.staticLabels.push('print');
    printBlock.docks[1][2] = 'anyin';

    var showBlocks = new ProtoBlock('showblocks');
    showBlocks.palette = palettes.dict['extras'];
    blocks.protoBlockDict['showblocks'] = showBlocks;
    showBlocks.zeroArgBlock();
    showBlocks.staticLabels.push('show');

    var hideBlocks = new ProtoBlock('hideblocks');
    hideBlocks.palette = palettes.dict['extras'];
    blocks.protoBlockDict['hideblocks'] = hideBlocks;
    hideBlocks.zeroArgBlock();
    hideBlocks.staticLabels.push('hide');

    // Push protoblocks onto their palettes.
    for (var protoblock in blocks.protoBlockDict) {
        blocks.protoBlockDict[protoblock].palette.add(blocks.protoBlockDict[protoblock]);
    }

    // Populate the lists of block types.
    blocks.findBlockTypes();
}

// Block-specific code goes here

// Publish to FB
function doPublish(desc) {
    var url = doSave();
    console.log('push ' + url + ' to FB');
    var descElem = docById("description");
    var msg = desc + ' ' + descElem.value + ' ' + url;
    console.log('comment: ' + msg);
    var post_cb = function() {
        FB.api('/me/feed', 'post', {message: msg});
    };

    FB.login(post_cb, {scope: 'publish_actions'});
}

function doSaveSVG(canvas, turtles, desc) {
    var head = '<!DOCTYPE html>\n<html>\n<head>\n<title>' + desc + '</title>\n</head>\n<body>\n';
    var svg = doSVG(canvas, turtles, canvas.width, canvas.height, 1.0);
    var tail = '</body>\n</html>';
    // TODO: figure out if popups are blocked
    var svgWindow = window.open('data:image/svg+xml;utf8,' + svg, desc, '"width=' + canvas.width + ', height=' + canvas.height + '"');
}
