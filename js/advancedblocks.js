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
    'print': "if (args.length == 1) {var msgContainer = msgText.parent; msgContainer.visible = true; msgText.text = args[0].toString(); msgContainer.updateCache(); stage.swapChildren(msgContainer, last(stage.children));};",
    'showblocks': "showBlocks(); turtleDelay = DEFAULTDELAY;",
    'hideblocks': "hideBlocks(); turtleDelay = 0;",
    'speak': "meSpeak.speak(args[0]);"
};

var evalArgDict = {
    'time': 'var d = new Date(); blocks.blockList[blk].value = (d.getTime() - time) / 1000;',
    'mousex': 'blocks.blockList[blk].value = stageX;',
    'mousey': 'blocks.blockList[blk].value = stageY;',
    'mousebutton': 'blocks.blockList[blk].value = stageMouseDown;',
    'keyboard': 'blocks.blockList[blk].value = currentKeyCode; lastKeyCode = currentKeyCode; currentKey = ""; currentKeyCode = 0;',
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
    mousebuttonBlock.booleanZeroArgBlock()
    mousebuttonBlock.staticLabels.push('mouse button');

    var keyboardBlock = new ProtoBlock('keyboard');
    keyboardBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['keyboard'] = keyboardBlock;
    keyboardBlock.parameterBlock();
    keyboardBlock.staticLabels.push('keyboard');

    var loudnessBlock = new ProtoBlock('loudness');
    loudnessBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['loudness'] = loudnessBlock;
    loudnessBlock.parameterBlock();
    loudnessBlock.staticLabels.push('loudness');

    // Extras palette
    var waitBlock = new ProtoBlock('wait');
    waitBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['wait'] = waitBlock;
    waitBlock.oneArgBlock();
    waitBlock.staticLabels.push('wait');
    waitBlock.defaults.push(1);

    var vspaceBlock = new ProtoBlock('vspace');
    vspaceBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['vspace'] = vspaceBlock;
    vspaceBlock.zeroArgBlock();
    // vspaceBlock.staticLabels.push('');

    var printBlock = new ProtoBlock('print');
    printBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['print'] = printBlock;
    printBlock.oneArgBlock();
    printBlock.staticLabels.push('print');
    printBlock.docks[1][2] = 'anyin';

    var getxTurtleBlock = new ProtoBlock('xturtle');
    getxTurtleBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['xturtle'] = getxTurtleBlock;
    getxTurtleBlock.oneArgMathBlock();
    getxTurtleBlock.staticLabels.push('turtle x');
    getxTurtleBlock.defaults.push(0);
    getxTurtleBlock.docks[1][2] = 'anyin';

    var getyTurtleBlock = new ProtoBlock('yturtle');
    getyTurtleBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['yturtle'] = getyTurtleBlock;
    getyTurtleBlock.oneArgMathBlock();
    getyTurtleBlock.staticLabels.push('turtle y');
    getyTurtleBlock.defaults.push(0);
    getyTurtleBlock.docks[1][2] = 'anyin';

    var startTurtleBlock = new ProtoBlock('startTurtle');
    startTurtleBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['startTurtle'] = startTurtleBlock;
    startTurtleBlock.oneArgBlock();
    startTurtleBlock.fontsize = '16px';
    startTurtleBlock.docks[1][2] = 'anyin';
    startTurtleBlock.defaults.push(0);
    startTurtleBlock.staticLabels.push('start turtle');

    var stopTurtleBlock = new ProtoBlock('stopTurtle');
    stopTurtleBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['stopTurtle'] = stopTurtleBlock;
    stopTurtleBlock.oneArgBlock();
    stopTurtleBlock.fontsize = '16px';
    stopTurtleBlock.docks[1][2] = 'anyin';
    stopTurtleBlock.defaults.push(0);
    stopTurtleBlock.staticLabels.push('stop turtle');

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

    var evalBlock = new ProtoBlock('eval');
    evalBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['eval'] = evalBlock;
    evalBlock.twoArgMathBlock();
    evalBlock.docks[1][2] = 'textin';
    evalBlock.defaults.push('x');
    evalBlock.defaults.push(100);
    evalBlock.staticLabels.push('eval');
    evalBlock.staticLabels.push('f(x)');
    evalBlock.staticLabels.push('x');

    var speakBlock = new ProtoBlock('speak');
    speakBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['speak'] = speakBlock;
    speakBlock.oneArgBlock();
    speakBlock.staticLabels.push('speak');
    speakBlock.defaults.push('hello');
    speakBlock.docks[1][2] = 'textin';

    var audioBlock = new ProtoBlock('playback');
    audioBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['playback'] = audioBlock;
    audioBlock.defaults.push(null);
    audioBlock.oneArgBlock();
    audioBlock.docks[1][2] = 'mediain';
    audioBlock.staticLabels.push('playback');

    var audioStopBlock = new ProtoBlock('stopplayback');
    audioStopBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['stopplayback'] = audioStopBlock;
    audioStopBlock.zeroArgBlock();
    audioStopBlock.staticLabels.push('stop');

    // Mashape palette

    var TranslateBlock = new ProtoBlock('translate');
    TranslateBlock.palette = palettes.dict['mashape'];
    blocks.protoBlockDict['translate'] = TranslateBlock;
    TranslateBlock.oneArgMathBlock();
    TranslateBlock.docks[0][2] = 'textout'
    TranslateBlock.docks[1][2] = 'textin'
    TranslateBlock.defaults.push('Hello');
    TranslateBlock.staticLabels.push('translate');

    var DetectLangBlock = new ProtoBlock('detectlang');
    DetectLangBlock.palette = palettes.dict['mashape'];
    blocks.protoBlockDict['detectlang'] = DetectLangBlock;
    DetectLangBlock.oneArgMathBlock();
    DetectLangBlock.docks[0][2] = 'textout';
    DetectLangBlock.docks[1][2] = 'anyin';
    DetectLangBlock.defaults.push('Hello');
    DetectLangBlock.staticLabels.push('detect lang');

    var SetLangBlock = new ProtoBlock('setlang');
    SetLangBlock.palette = palettes.dict['mashape'];
    blocks.protoBlockDict['setlang'] = SetLangBlock;
    SetLangBlock.twoArgBlock();
    SetLangBlock.docks[1][2] = 'anyin';
    SetLangBlock.docks[2][2] = 'anyin';
    SetLangBlock.defaults.push('English', 'Spanish');
    SetLangBlock.staticLabels.push('set lang', 'source', 'target');

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
