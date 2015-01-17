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

// Definition of basic blocks common to all branches

// Some names changed between the Python verison and the
// JS version so look up name in the conversion dictionary.
var NAMEDICT = {
    'xcor': 'x',
    'ycor': 'y',
    'seth': 'setheading',
    'plus2': 'plus',
    'product2': 'multiply',
    'division2': 'divide',
    'minus2': 'minus',
    'stack': 'do',
    'hat': 'action',
    'clean': 'clear',
    'setxy2': 'setxy',
    'greater2': 'greater',
    'less2': 'less',
    'equal2': 'equal',
    'random2': 'random',
    'sethue': 'setcolor',
    'setvalue': 'setshade',
    'setchroma': 'setgrey',
    'setgray': 'setgrey',
    'gray': 'grey',
    'chroma': 'grey',
    'value': 'shade',
    'hue': 'color',
    'startfill': 'beginfill',
    'stopfill': 'endfill',
    'string': 'text',
    'shell': 'turtleshell'
};


// Define blocks here
function initBasicProtoBlocks(palettes, blocks) {
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
    arcBlock.docks[1][2] = 'numberin'; // override default

    var setheadingBlock = new ProtoBlock('setheading');
    setheadingBlock.palette = palettes.dict['turtle'];
    blocks.protoBlockDict['setheading'] = setheadingBlock;
    setheadingBlock.oneArgBlock();
    setheadingBlock.staticLabels.push('seth');
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
    setxyBlock.docks[1][2] = 'numberin'; // override default

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

    var sethueBlock = new ProtoBlock('sethue');
    sethueBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['sethue'] = sethueBlock;
    sethueBlock.oneArgBlock();
    sethueBlock.defaults.push(0);
    sethueBlock.staticLabels.push('set hue');

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
    blocks.protoBlockDict['setgrey'] = setchromaBlock;
    setchromaBlock.oneArgBlock();
    setchromaBlock.defaults.push(100);
    setchromaBlock.staticLabels.push('set grey');

    var chromaBlock = new ProtoBlock('grey');
    chromaBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['grey'] = chromaBlock;
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
    blocks.protoBlockDict['beginfill'] = startfillBlock;
    startfillBlock.zeroArgBlock();
    startfillBlock.staticLabels.push('begin fill');

    var endfillBlock = new ProtoBlock('endfill');
    endfillBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['endfill'] = endfillBlock;
    endfillBlock.zeroArgBlock();
    endfillBlock.staticLabels.push('end fill');

    var backgroundBlock = new ProtoBlock('fillscreen');
    backgroundBlock.palette = palettes.dict['pen'];
    blocks.protoBlockDict['fillscreen'] = backgroundBlock;
    backgroundBlock.zeroArgBlock();
    backgroundBlock.staticLabels.push('background');

    var getColorPixel = new ProtoBlock('getcolorpixel');
    getColorPixel.palette = palettes.dict['pen'];
    blocks.protoBlockDict['getcolorpixel'] = getColorPixel;
    getColorPixel.parameterBlock();
    getColorPixel.staticLabels.push('get pixel color');

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
    randomBlock.fontsize = '14px'; // FIX ME: label doesn't fix
    randomBlock.staticLabels.push('random');
    randomBlock.staticLabels.push('min');
    randomBlock.staticLabels.push('max');

    var plusBlock = new ProtoBlock('plus');
    plusBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['plus'] = plusBlock;
    plusBlock.twoArgMathBlock();
    plusBlock.docks[0][2] = 'anyout';
    plusBlock.docks[1][2] = 'anyin';
    plusBlock.docks[2][2] = 'anyin';
    plusBlock.staticLabels.push('+');
    plusBlock.fontsize = '24px';

    var minusBlock = new ProtoBlock('minus');
    minusBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['minus'] = minusBlock;
    minusBlock.twoArgMathBlock();
    minusBlock.staticLabels.push('–');
    minusBlock.fontsize = '24px';

    var multiplyBlock = new ProtoBlock('multiply');
    multiplyBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['multiply'] = multiplyBlock;
    multiplyBlock.twoArgMathBlock();
    multiplyBlock.staticLabels.push('×');
    multiplyBlock.fontsize = '24px';

    var divideBlock = new ProtoBlock('divide');
    divideBlock.palette = palettes.dict['number'];
    blocks.protoBlockDict['divide'] = divideBlock;
    divideBlock.twoArgMathBlock();
    divideBlock.staticLabels.push('/');
    divideBlock.fontsize = '24px';

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
    greaterBlock.palette = palettes.dict['boolean'];
    blocks.protoBlockDict['greater'] = greaterBlock;
    greaterBlock.booleanTwoArgBlock();
    greaterBlock.staticLabels.push('&gt;');
    greaterBlock.fontsize = '24px';

    var lessBlock = new ProtoBlock('less');
    lessBlock.palette = palettes.dict['boolean'];
    blocks.protoBlockDict['less'] = lessBlock;
    lessBlock.booleanTwoArgBlock();
    lessBlock.staticLabels.push('&lt;');
    lessBlock.fontsize = '24px';

    var equalBlock = new ProtoBlock('equal');
    equalBlock.palette = palettes.dict['boolean'];
    blocks.protoBlockDict['equal'] = equalBlock;
    equalBlock.booleanTwoArgBlock();
    equalBlock.staticLabels.push('=');
    equalBlock.fontsize = '24px';

    var andBlock = new ProtoBlock('and');
    andBlock.palette = palettes.dict['boolean'];
    blocks.protoBlockDict['and'] = andBlock;
    andBlock.booleanTwoBooleanArgBlock();
    andBlock.staticLabels.push('and');

    var orBlock = new ProtoBlock('or');
    orBlock.palette = palettes.dict['boolean'];
    blocks.protoBlockDict['or'] = orBlock;
    orBlock.booleanTwoBooleanArgBlock();
    orBlock.staticLabels.push('or');

    var notBlock = new ProtoBlock('not');
    notBlock.palette = palettes.dict['boolean'];
    blocks.protoBlockDict['not'] = notBlock;
    notBlock.booleanOneBooleanArgBlock();
    notBlock.staticLabels.push('not');

    // Blocks palette
    var storeinBlock = new ProtoBlock('storein');
    storeinBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['storein'] = storeinBlock;
    storeinBlock.twoArgBlock();
    storeinBlock.defaults.push(_('box'));
    storeinBlock.defaults.push(100);
    storeinBlock.docks[1][2] = 'anyin';
    storeinBlock.docks[2][2] = 'anyin';
    storeinBlock.staticLabels.push('store in');
    storeinBlock.staticLabels.push('name');
    storeinBlock.staticLabels.push('value');

    var boxBlock = new ProtoBlock('box');
    boxBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['box'] = boxBlock;
    boxBlock.oneArgMathWithLabelBlock();
    boxBlock.defaults.push(_('box'));
    boxBlock.staticLabels.push('box');
    boxBlock.docks[0][2] = 'anyout';
    boxBlock.docks[1][2] = 'anyin';
    // Show the value in the box as if it were a parameter.
    boxBlock.parameter = true;

    var incrementOneBlock = new ProtoBlock('incrementOne');
    incrementOneBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['incrementOne'] = incrementOneBlock;
    incrementOneBlock.oneArgBlock();
    boxBlock.docks[1][2] = 'anyin';
    incrementOneBlock.staticLabels.push('add on 1');

    var incrementBlock = new ProtoBlock('increment');
    incrementBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['increment'] = incrementBlock;
    incrementBlock.twoArgBlock();
    incrementBlock.docks[1][2] = 'anyin';
    incrementBlock.docks[2][2] = 'anyin';
    incrementBlock.staticLabels.push('add on', 'to', 'value');

    var actionBlock = new ProtoBlock('action');
    actionBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['action'] = actionBlock;
    actionBlock.blockClampOneArgBlock();
    actionBlock.defaults.push(_('action'));
    actionBlock.staticLabels.push('action');

    var doBlock = new ProtoBlock('do');
    doBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['do'] = doBlock;
    doBlock.oneArgBlock();
    doBlock.defaults.push(_('action'));
    doBlock.staticLabels.push('do');
    doBlock.docks[1][2] = 'anyin';

    var startBlock = new ProtoBlock('start');
    startBlock.palette = palettes.dict['blocks'];
    blocks.protoBlockDict['start'] = startBlock;
    startBlock.blockClampZeroArgBlock();
    startBlock.staticLabels.push('start');

    // Media palette
    var showBlock = new ProtoBlock('show');
    showBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['show'] = showBlock;
    showBlock.twoArgBlock();
    showBlock.defaults.push(24);
    showBlock.defaults.push('text');
    showBlock.staticLabels.push('show');
    showBlock.staticLabels.push('size');
    showBlock.staticLabels.push('obj');
    showBlock.docks[1][2] = 'numberin'; // override default
    showBlock.docks[2][2] = 'anyin'; // override default

    var shellBlock = new ProtoBlock('turtleshell');
    shellBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['turtleshell'] = shellBlock;
    shellBlock.twoArgBlock();
    shellBlock.defaults.push(55);
    shellBlock.defaults.push(null);
    shellBlock.staticLabels.push('shell');
    shellBlock.staticLabels.push('size');
    shellBlock.staticLabels.push('image');
    shellBlock.docks[1][2] = 'numberin'; // override default
    shellBlock.docks[2][2] = 'mediain'; // override default

    var textBlock = new ProtoBlock('text');
    textBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['text'] = textBlock;
    textBlock.valueBlock();
    textBlock.docks[0][2] = 'textout';

    var mediaBlock = new ProtoBlock('media');
    mediaBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['media'] = mediaBlock;
    mediaBlock.mediaBlock();
    mediaBlock.docks[0][2] = 'mediaout';

    var cameraBlock = new ProtoBlock('camera');
    cameraBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['camera'] = cameraBlock;
    cameraBlock.mediaBlock();

    var videoBlock = new ProtoBlock('video');
    videoBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['video'] = videoBlock;
    videoBlock.mediaBlock();

    var stopVideoCamBlock = new ProtoBlock('stopvideocam');
    stopVideoCamBlock.palette = palettes.dict['media'];
    blocks.protoBlockDict['stopvideocam'] = stopVideoCamBlock;
    stopVideoCamBlock.zeroArgBlock();
    stopVideoCamBlock.staticLabels.push('stop');

    // Flow palette
    var repeatBlock = new ProtoBlock('repeat');
    repeatBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['repeat'] = repeatBlock;
    repeatBlock.flowClampOneArgBlock();
    repeatBlock.staticLabels.push('repeat');
    repeatBlock.defaults.push(4);

    var foreverBlock = new ProtoBlock('forever');
    foreverBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['forever'] = foreverBlock;
    foreverBlock.flowClampZeroArgBlock();
    foreverBlock.staticLabels.push('forever');

    var breakBlock = new ProtoBlock('break');
    breakBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['break'] = breakBlock;
    breakBlock.basicBlockNoFlow();
    breakBlock.staticLabels.push('stop');

    var ifBlock = new ProtoBlock('if');
    ifBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['if'] = ifBlock;
    ifBlock.flowClampBooleanArgBlock();
    ifBlock.staticLabels.push('if');
    ifBlock.staticLabels.push('then');

    var untilBlock = new ProtoBlock('until');
    untilBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['until'] = untilBlock;
    untilBlock.flowClampBooleanArgBlock();
    untilBlock.staticLabels.push('until');
    untilBlock.staticLabels.push('do');

    var waitForBlock = new ProtoBlock('waitFor');
    waitForBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['waitFor'] = waitForBlock;
    waitForBlock.oneBooleanArgBlock();
    waitForBlock.staticLabels.push('wait for');

    var whileBlock = new ProtoBlock('while');
    whileBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['while'] = whileBlock;
    whileBlock.flowClampBooleanArgBlock();
    whileBlock.staticLabels.push('while');
    whileBlock.staticLabels.push('do');

    var ifthenelseBlock = new ProtoBlock('ifthenelse');
    ifthenelseBlock.palette = palettes.dict['flow'];
    blocks.protoBlockDict['ifthenelse'] = ifthenelseBlock;
    ifthenelseBlock.doubleFlowClampBooleanArgBlock();
    ifthenelseBlock.staticLabels.push('if');
    ifthenelseBlock.staticLabels.push('then');
    ifthenelseBlock.staticLabels.push('else');

    var vspaceBlock = new ProtoBlock('vspace');
    vspaceBlock.palette = palettes.dict['extras'];
    blocks.protoBlockDict['vspace'] = vspaceBlock;
    vspaceBlock.zeroArgBlock();

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
    mousebuttonBlock.booleanZeroArgBlock();
    mousebuttonBlock.staticLabels.push('mouse button');

    var keyboardBlock = new ProtoBlock('keyboard');
    keyboardBlock.palette = palettes.dict['sensors'];
    blocks.protoBlockDict['keyboard'] = keyboardBlock;
    keyboardBlock.parameterBlock();
    keyboardBlock.staticLabels.push('keyboard');

    // Push protoblocks onto their palettes.
    for (var protoblock in blocks.protoBlockDict) {
        blocks.protoBlockDict[protoblock].palette.add(blocks.protoBlockDict[protoblock]);
    }

    // Populate the lists of block types.
    blocks.findBlockTypes();
}
