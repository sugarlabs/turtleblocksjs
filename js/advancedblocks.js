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
    'publish': "if (args.length == 1) {var url = doSave(); var descElem = docById('description'); var msg = args[0] + ' ' + descElem.value + ' ' + url; var post_cb = function() {FB.api('/me/feed', 'post', {message: msg});}; FB.login(post_cb, {scope: 'publish_actions'});}",
    'savesvg': "var head = '<!DOCTYPE html>\n<html>\n<head>\n<title>' + args[0] + '</title>\n</head>\n<body>\n'; var svg = doSVG(canvas.width, canvas.height, 1.0); var tail = '</body>\n</html>'; + var svgWindow = window.open('data:image/svg+xml;utf8,' + svg, desc, '" + '"width=' + "' + canvas.width + ', height=' + canvas.height + '" + '"' + "');",
    'wait': 'if (args.length == 1) {waitTime = Number(args[0]) * 1000;}',
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
