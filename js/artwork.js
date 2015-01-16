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
// Define below are the inline SVGs used for turtles and blocks. SVGs
// are modified by fill_color, stroke_color, block_label, et al. using
// .replace, e.g.,
// BASICBLOCK.replace(/fill_color/g,
// PALETTEFILLCOLORS['turtle']).replace(/stroke_color/g,
// PALETTESTROKECOLORS['turtle']).replace('block_label', 'clear'));
// Chrome can load the image type "data:image/svg+xml;utf8," inline,
// but Firefox cannot, so we set it in the async methods instead.
// The relative position of the button added to collapsible blocks,
// e.g., start and action. (TODO: Calculate these values.)
var COLLAPSEBUTTONXOFF = -48;
var COLLAPSEBUTTONYOFF = 9;

// Without any scaling, blocks are multiples of a standard height.
var STANDARDBLOCKHEIGHT = 42;

// The default turtles are generated from the TURTLESVG template.
var FILLCOLORS = ['#ed001d', '#a34600', '#fb5f00', '#466e00', '#00843c', '#008283', '#007ac9', '#005dff', '#b500e3', '#ec008a'];
var STROKECOLORS = ['#ffada6', '#ffa300', '#ffc000', '#aade00', '#00fa8c', '#00f3db', '#00e3ff', '#8dceff', '#f3aeff', '#ff97d5'];

// (fill_color, stroke_color)
var TURTLESVG = '<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55">' + '<g transform="matrix(1,0,0,1,-1.5,-0.60)">' + '<path d="m 27.5,48.3 c -0.6,0 -1.1,-0.1 -1.6,-0.1 l 1.3,2.3 1.4,-2.3 c -0.4,0 -0.7,0.1 -1.1,0.1 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 40.2,11.7 c -2.2,0 -4,1.6 -4.4,3.6 1.9,1.4 3.5,3.1 4.7,5.2 2.3,-0.1 4.1,-2 4.1,-4.3 0,-2.5 -2,-4.5 -4.4,-4.5 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 40.7,39.9 c -1.2,2.2 -2.8,4.1 -4.8,5.5 0.5,1.9 2.2,3.3 4.3,3.3 2.4,0 4.4,-2 4.4,-4.4 0,-2.3 -1.7,-4.1 -3.9,-4.4 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 14.3,39.9 c -2.3,0.2 -4.1,2.1 -4.1,4.4 0,2.4 2,4.4 4.5,4.4 2,0 3.8,-1.4 4.2,-3.3 -1.8,-1.5 -3.4,-3.3 -4.6,-5.5 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 19,15.4 c -0.3,-2.1 -2.1,-3.7 -4.3,-3.7 -2.5,0 -4.5,2 -4.5,4.5 0,2.3 1.9,4.3 4.3,4.4 1.2,-2.1 2.7,-3.8 4.5,-5.2 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 27.5,12.56 c 1.91,0 3.73,0.41 5.42,1.13 0.74,-1.07 1.91,-2.42 1.33,-3.69 -1.3,-2.76 -3.06,-7.69 -6.75,-7.69 -3.69,0 -5.08,4.93 -6.75,7.69 -0.74,1.22 0.44,2.66 1.21,3.74 1.72,-0.75 3.6,-1.18 5.54,-1.18 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 43.1,30.4 c 0,4.8 -1.6,9.3 -4.6,12.6 -2.9,3.4 -6.9,5.3 -11,5.3 -4.1,0 -8.1,-1.9 -11,-5.3 -3,-3.3 -4.6,-7.8 -4.6,-12.6 0,-9.8 7,-17.8 15.6,-17.8 8.6,0 15.6,8 15.6,17.8 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 25.9,33.8 -1.6,-4.7 3.2,-2.6 3.6,2.7 -1.5,4.6 z" style="fill:stroke_color;stroke:none" />' + '<path d="M 27.5,41.6 C 23.5,41.4 22,39.5 22,39.5 l 3.5,-4.1 4.5,0.1 3.1,4.2 c 0,0 -2.9,2 -5.6,1.9 z" style="fill:stroke_color;stroke:none" />' + '<path d="M 18.5,33.8 C 17.6,30.9 18.6,27 18.6,27 l 4,2.1 1.5,4.7 -3.6,4.2 c 0,0 -1.4,-2 -2.1,-4.2 z" style="fill:stroke_color;stroke:none" />' + '<path d="m 19.5,25.1 c 0,0 0.5,-1.9 3,-3.8 2.2,-1.6 4.5,-1.7 4.5,-1.7 l -0.1,5 -3.5,2.7 -3.9,-2.2 z" style="fill:stroke_color;stroke:none" />' + '<path d="M 32.1,27.8 28.6,25 29,19.8 c 0,0 1.8,-0.1 4,1.6 2.2,1.8 3.3,5 3.3,5 l -4.2,1.4 z" style="fill:stroke_color;stroke:none" />' + '<path d="m 31.3,34 1.3,-4.4 4.2,-1.6 c 0,0 0.7,2.7 0,5.7 -0.6,2.3 -2.1,4.4 -2.1,4.4 L 31.3,34 z" style="fill:stroke_color;stroke:none" />' + '</g>' + '</svg>';

// basic block, 0 args (fill_color, stroke_color, block_label)
var BASICBLOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="46">' + '<g transform="scale(2,2)">' + '<path d="m 0.5,8.5 0,-4 c 0,-2.09 1.91,-4 4,-4 l 4,0 0,2 10,0 0,-2 30,0 4,0 c 2.09,0 4,1.91 4,4 l 0,12 c 0,2.09 -1.91,4 -4,4 l -4,0 -30,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.09,0 -4,-1.91 -4,-4 l 0,-4 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="105" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var BASICBLOCKDOCKS = [
    [20, 0, 'out'],
    [20, 42, 'in']
];

var BASICBLOCKNOFLOW = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="56">' + '<g transform="matrix(2,0,0,2,0,-2)">' + '<path d="m 0.5,14.5 0,-9 c 0,-2.1 1.96,-3.5 4,-4 l 4,0 0,2 10,0 0,-2 30,0 4,0 c 2.1,0 4,1.9 4,4 l 0,9 0,4 c 0,2.1 -1.9,4 -4,4 l -4,0 -30,0 -5,6 -5,-6 -4,0 c -2.1,0 -4,-1.9 -4,-4 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var BASICBLOCKNOFLOWDOCKS = [
    [20, 0, 'out'],
    [20, 42, 'unavailable']
];

// basic block, 1 arg (fill_color, stroke_color, block_label)
var BASICBLOCK1ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="46">' + '<g transform="scale(2,2)">' + '<path d="m 0.5,8.5 0,-4 a 4,4 90 0 1 4,-4 l 4,0 0,2 10,0 0,-2 30,0 4,0 a 4,4 90 0 1 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 a 4,4 90 0 1 -4,4 l -4,0 -30,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 a 4,4 90 0 1 -4,-4 l 0,-4 0,-4 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var BASICBLOCK1ARGDOCKS = [
    [20, 0, 'out'],
    [98, 20, 'numberin'],
    [20, 42, 'in']
];

// basic block, 2 args (fill_color, stroke_color, block_label, top_label)
var BASICBLOCK2ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="51">' + '<g transform="matrix(2,0,0,2,29,0)">' + '<path d="m -14,4.5 c 0,-2.0943951 1.905605,-4 4,-4 l 4,0 0,2 10,0 0,-2 22.5,0 7.5,0 4,0 c 2.094395,0 3.492035,1.9681383 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,12.5 -56,0 c 0,-4 0,-16.5 0,-20.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="110" height="2" x="2" y="49" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="25" style="font-size:12px">top_label</tspan>' + '</text>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="45" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var BASICBLOCK2ARGDOCKS = [
    [20, 0, 'out'],
    [98, 20, 'textin'],
    [98, 62, 'numberin'],
    [20, 84, 'in']
];

// basic block 2 arg filler (fill_color, stroke_color)
var BASICBLOCK2ARGFILLER = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="114" height="42">' + '<path d="m 0,0 0,42 114,0 0,-42 z" style="fill:fill_color;fill-opacity:1;stroke:none" />' + '<rect width="2" height="42" x="0" y="0" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<rect width="2" height="42" x="112" y="0" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '</svg>';

// basic block 2 arg bottom (fill_color, stroke_color, bottom_label)
var BASICBLOCK2ARGBOTTOM = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="114" height="42">' + '<g transform="matrix(2,0,0,2,30,-49)">' + '<path d="m 41.5,25 0,4.5 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 c 0,2.09 -1.91,4 -4,4 l -4,0 -31,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.09,0 -4,-1.87 -4,-4 l 0,-4 0,-8.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="110" height="2" x="2" y="0" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="19" style="font-size:12px">bottom_label</tspan>' + '</text>' + '</svg>';

// value block (fill_color, stroke_color, block_label)
var VALUEBLOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="152" height="42">' + '<path d="m 17,1 134,0 0,40 -134,0 0,-16 0,-2 -12,0 0,6 -4,0 0,-16 4,0 0,6 12,0 0,-2 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:2;stroke-linecap:round;stroke-opacity:1" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:start;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="25" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var VALUEBLOCKDOCKS = [
    [0, 20, 'numberout']
];

// Offsets for placing text ontop of value blocks.
var BOXTEXTX = 120;
var PARAMETERTEXTX = 140;
var VALUETEXTX = 70;
var VALUETEXTY = 26;

// media block (fill_color, stroke_color, block_label)
var MEDIABLOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="152" height="84">' + '<path d="m 17,1 134,0 0,82 -134,0 0,-58 0,-2 -12,0 0,6 -4,0 0,-16 4,0 0,6 12,0 0,-2 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:2;stroke-linecap:round;stroke-opacity:1" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="135" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var MEDIABLOCKDOCKS = [
    [0, 20, 'mediaout']
];

// 1arg block (fill_color, stroke_color, block_label)
var ARG1BLOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="152" height="42">' + '<g transform="matrix(2,0,0,2,-20,0)">' + '<path d="m 12.5,9.5 6,0 0,-9 c 15.333333,0 43.666667,0 59,0 l 4,0 c 2.094395,0 3.492035,1.9681384 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 c 0,2.094395 -1.905605,4 -4,4 l -4,0 c -15.333333,0 -43.666667,0 -59,0 l 0,-9 -6,0 0,3 -2,0 0,-8 2,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="125" y="28" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var ARG1LABELBLOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="152" height="42">' + '<g transform="matrix(2,0,0,2,-20,0)">' + '<path d="m 12.5,9.5 6,0 0,-9 c 15.333333,0 43.666667,0 59,0 l 4,0 c 2.094395,0 3.492035,1.9681384 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 c 0,2.094395 -1.905605,4 -4,4 l -4,0 c -15.333333,0 -43.666667,0 -59,0 l 0,-9 -6,0 0,3 -2,0 0,-8 2,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="35" y="28" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var ARG1BLOCKDOCKS = [
    [0, 20, 'numberout'],
    [136, 20, 'numberin']
];

// 2arg block (fill_color, stroke_color, block_label, top_label)
var ARG2BLOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="84" height="49">' + '<g transform="scale(2,2)" style="stroke-width:1;stroke-miterlimit:4;stroke-dasharray:none">' + '<path d="m 8.5,8.5 0,-4 c 0,-2.0943951 1.905605,-4 4,-4 l 4,0 10,0 7,0 4,0 c 2.094395,0 3.492035,1.9681383 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,11.5 -33,0 0,-11.5 0,-1 -6,0 0,3 -2,0 0,-8 2,0 0,3 6,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" />' + '</g>' + '<rect width="64" height="2" x="18" y="47" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:center;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:middle;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="50" y="48" style="font-size:font_size;text-align:center;text-anchor:middle">block_label</tspan>' + '</text>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="64" y="25" style="font-size:12px">top_label</tspan>' + '</text>' + '</svg>';

var ARG2BLOCKDOCKS = [
    [0, 20, 'numberout'],
    [68, 20, 'numberin'],
    [68, 62, 'numberin']
];

var ARG3BLOCKDOCKS = [
    [0, 20, 'numberout'],
    [68, 20, 'numberin'],
    [68, 62, 'numberin'],
    [68, 108, 'numberin']
];

// (fill_color, stroke_color)
var ARG2BLOCKFILLER = '<svg xmlns="http://www.w3.org/2000/svg" width="84" height="42">' + '<path d="m 16,0 0,42 68,0 0,-42 z" style="fill:fill_color;fill-opacity:1;stroke:none" />' + '<rect width="2" height="42" x="16" y="0" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<rect width="2" height="42" x="82" y="0" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '</svg>';

// (fill_color, stroke_color, middle_label)
var ARGBLOCKMIDDLE = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96.93206" height="45"> <g transform="translate(0,34.000098)" > <g transform="matrix(2,0,0,2,12.932057,-84.000098)" > <path d="m 41.5,25 0,4.5 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 -2.18e-4,9.999823 L 37.5,47.5 l -4,0 -7,0 -10,0 -4,0 L 8.4997818,47.499823 8.5,37.5 l 0,-4 0,-8.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> </g> <rect width="64" height="2" x="30.932007" y="-34.803619" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" /> <rect width="64" height="2" x="30.932007" y="8.1963806" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" /> <text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans"> <tspan x="77.332031" y="-17.633698" style="font-size:12px">middle_label</tspan> </text> </g> </svg>'

// (fill_color, stroke_color, bottom_label)
var ARG2BLOCKBOTTOM = '<svg xmlns="http://www.w3.org/2000/svg" width="84" height="35">' + '<g transform="matrix(2,0,0,2,0,-49)">' + '<path d="m 41.5,25 0,4.5 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 c 0,2.09, 1.9,4 -4,4 l -4,0 -7,0 -10,0 -4,0 c -2.09,0 -4,-1.9 -4,-4 l 0,-4 0,-8.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="64" height="2" x="18" y="0" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="64" y="19" style="font-size:12px">bottom_label</tspan>' + '</text>' + '</svg>';

// forever (fill_color, stroke_color, block_label)
var FLOWCLAMP0ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="74">' + '<g transform="scale(2,2)">' + '<path d="m 0.5,8.5 0,-4 c 0,-2.09 1.91,-4 4,-4 l 4,0 0,2 10,0 0,-2 9,0 21,0 4,0 c 2.09,0 3.74,1.92 4,4 l 0,12 c 0,2.09 -1.91,4 -4,4 l -4,0 -21,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.62,0 -5,2.38 -5,5 l 0,11 -8,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="14" height="4" x="2" y="70" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="105" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var FLOWCLAMP0ARGDOCKS = [
    [20, 0, 'out'],
    [38, 42, 'in'],
    [20, 126, 'in']
];

// Text label positions
var STARTTEXTX = 20;
var ACTIONTEXTX = 100;
var ACTIONTEXTY = 40;

// repeat (fill_color, stroke_color, block_label)
var FLOWCLAMP1ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="74">' + '<g transform="scale(2,2)">' + '<path d="m 0.5,8.5 0,-4 c 0,-2.09 1.91,-4 4,-4 l 4,0 0,2 10,0 0,-2 9,0 21,0 4,0 c 2.09,0 3.74,1.92 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 c 0,2.09 -1.91,4 -4,4 l -4,0 -21,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.62,0 -5,2.38 -5,5 l 0,11 -8,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="14" height="4" x="2" y="70" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var FLOWCLAMP1ARGDOCKS = [
    [20, 0, 'out'],
    [98, 20, 'numberin'],
    [38, 42, 'in'],
    [20, 126, 'in']
];

// (fill_color, stroke_color)
var CLAMPFILLER = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="42">' + '<path d="m 0,0 18,0 c 0,14.000002 0,27.999998 0,42 L 0,42 z" style="fill:fill_color;fill-opacity:1;stroke:none" />' + '<rect width="2" height="42" x="0" y="0" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<rect width="2" height="42" x="16" y="0" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '</svg>';

// (fill_color, stroke_color, bot_label)
var FLOWCLAMPMIDDLE = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="72" height="84">' + '<path d="m 17,1 c 0,5.235988 4.764012,10 10,10 l 8,0 0,4 20,0 0,-4 8,0 c 3.8873,0 8,4.112699 8,8 l 0,24 c 0,4.18879 -3.81121,8 -8,8 -4,0 -4,0 -8,0 l -2,0 0,4 -16,0 0,-4 -10,0 c -5.449927,0.84679 -9.773861,4.781342 -10,10 L 17,83 1,83 1,1 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:2;stroke-linecap:round;stroke-opacity:1" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="61" y="43" style="font-size:12px">mid_label</tspan>' + '</text>' + '<rect width="13" height="1" x="2.5" y="82.5" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:fill_color;stroke-width:1;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0" />' + '<rect width="13" height="1" x="2.5" y="0.5" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:fill_color;stroke-width:1;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0" />' + '</svg>';

// (fill_color, stroke_color)
var FLOWCLAMPBOTTOM = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="56">' + '<path d="m 17,1 c 0,5.235988 4.764012,10 10,10 l 8,0 0,4 20,0 0,-4 50,0 c 3.8873,0 8,4.112699 8,8 l 0,24 c 0,4.18879 -3.81121,8 -8,8 l -50,0 -18,0 -2,0 0,4 -16,0 0,-4 -2,0 -8,0 C 4.8112098,51 1,47.18879 1,43 L 1,1 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:2;stroke-linecap:round;stroke-opacity:1" />' + '<rect width="13" height="1" x="2.5025792" y="0.50257939" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:fill_color;stroke-width:1;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0" />' + '</svg>';

// if (fill_color, stroke_color, block_label, top_label)
var FLOWCLAMPBOOLEANARG = '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="116">' + '<g transform="scale(2,2)">' + '<path d="m 0.5,8.5 0,-4 c 0,-2.0943951 1.9056049,-4 4,-4 l 4,0 0,2 10,0 0,-2 9,0 4,0 c 2.094395,0 4,1.9056049 4,4 l 0,15 c -4.18879,0 -8,3.81121 -8,8 0,4.18879 3.81121,8 8,8 l 0,2 c 0,2.094395 -1.905605,4 -4,4 l -4,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.617994,0 -5,2.382006 -5,5 l 0,11 -8,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="13" height="1" x="2.5" y="114.5" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:fill_color;stroke-width:1;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="49" y="60" style="font-size:font_size">block_label</tspan>' + '</text>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="59" y="78" style="font-size:12px">top_label</tspan>' + '</text>' + '</svg>';

var FLOWCLAMPBOOLEANDOCKS = [
    [20, 0, 'out'],
    [56, 40, 'booleanin'],
    [38, 84, 'in'],
    [20, 168, 'in']
];

var DOUBLEFLOWCLAMPBOOLEANDOCKS = [
    [20, 0, 'out'],
    [56, 40, 'booleanin'],
    [38, 84, 'in'],
    [38, 168, 'in'],
    [20, 252, 'in']
];

// start (fill_color, stroke_color, block_label)
var ACTIONCLAMP0ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="88">' + '<g transform="matrix(2,0,0,2,0,14)" style="fill:fill_color;fill-opacity:1">' + '<path d="m 0.5,8.5 0,-4 c 0,-2.0943951 1.9056049,-4 4,-4 l 4,0 5,-7 5,7 9,0 21,0 4,0 c 2.094395,0 4,1.9056049 4,4 l 0,12 c 0,2.094395 -1.905605,4 -4,4 l -4,0 -21,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.617994,0 -5,2.382006 -5,5 l -8,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="56" y="43" style="font-size:font_size">block_label</tspan>' + '</text>' + '<rect width="14" height="4" x="2" y="62" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<path d="m 1.1048469,67.104845 15.7903081,0 c 0,6.59677 0,13.193539 0,19.790309 l -15.7903081,0 z" style="fill:fill_color;fill-opacity:1;stroke:fill_color;stroke-width:2.20969129;stroke-linecap:round;stroke-opacity:1" />' + '<path d="m 1.0355239,67.18479 0,19.594575" style="fill:fill_color;fill-opacity:1;stroke:none" />' + '<rect width="2" height="22" x="-2.904625e-09" y="66" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<rect width="2" height="22" x="16" y="66" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '</svg>';

var ACTIONCLAMP0ARGDOCKS = [
    [20, 0, 'unavailable'],
    [38, 55, 'in'],
    [20, 80, 'unavailable']
];

// action (fill_color, stroke_color, block_label)
var ACTIONCLAMP1ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="88">' + '<g transform="matrix(2,0,0,2,0,14)" style="fill:fill_color;fill-opacity:1;stroke:#c48d00;stroke-opacity:1">' + '<path d="m 0.5,8.5 0,-4 c 0,-2.0943951 1.9056049,-4 4,-4 l 4,0 5,-7 5,7 9,0 21,0 4,0 c 2.094395,0 3.740222,1.9217781 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 c 0,2.094395 -1.905605,4 -4,4 l -4,0 -21,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.617994,0 -5,2.382006 -5,5 l -8,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="14" height="4" x="2" y="62" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="40" style="font-size:font_size">block_label</tspan>' + '</text>' + '<path d="m 1.104846,67.104846 15.790308,0 c 0,6.59677 0,13.193538 0,19.790308 l -15.790308,0 z" style="fill:fill_color;fill-opacity:1;stroke:fill_color;stroke-width:2.20969129;stroke-linecap:round;stroke-opacity:0.94117647" />' + '<path d="m 1.035523,67.18479 0,19.594575" style="fill:stroke_color;fill-opacity:1;stroke:none" />' + '<rect width="2" height="22" x="0" y="66" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<rect width="2" height="22" x="16" y="66" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '</svg>';

var ACTIONCLAMP1ARGDOCKS = [
    [20, 0, 'unavailable'],
    [98, 34, 'anyin'],
    [38, 55, 'in'],
    [20, 80, 'unavailable']
];

// (fill_color, stroke_color)
var ACTIONCLAMPBOTTOM = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="64">' + '<path d="m 17,1 c 0,5.235988 4.764012,10 10,10 l 8,0 0,4 20,0 0,-4 50,0 c 3.8873,0 8,4.112699 8,8 l 0,24 c 0,4.18879 -3.81121,8 -8,8 L 55,51 37,51 27,63 17,51 9,51 C 4.8112098,51 1,47.18879 1,43 L 1,1 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:2;stroke-linecap:round;stroke-opacity:1" />' + '<rect width="13" height="1" x="2.5" y="0.5" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:fill_color;stroke-width:1;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0" />' + '</svg>';

var ACTIONCLAMPCOLLAPSED = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="68">' + '<g transform="matrix(2,0,0,2,0,10)">' + '<path d="m 0.5,14.5 0,-9 c 0,-2.0943951 1.9681383,-3.4920346 4,-4 l 4,0 5,-6 5,6 30,0 4,0 c 2.094395,0 4,1.9056049 4,4 l 0,9 0,4 c 0,2.094395 -1.905605,4 -4,4 l -4,0 -30,0 -5,6 -5,-6 -4,0 c -2.0943951,0 -4,-1.905605 -4,-4 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:start;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="20" y="43" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

// mouse button (fill_color, stroke_color, block_label)
var BOOLEAN0ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="175" height="42">' + '<g transform="matrix(2,0,0,2,0,4)" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-opacity:1">' + '<path d="m 0.5,8.5 c 0,-3.6651914 3.3348086,-7 7,-7 l 1,0 0,-3 78.5,0 0,20 -78.5,0 0,-3 -1,0 c -3.6651914,0 -7,-3.334809 -7,-7 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="158" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var BOOLEAN0ARGDOCKS = [
    [0, 6, 'booleanout']
];

// (fill_color, stroke_color)
var BOOLEAN1BOOLEANARG = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="101" height="62"> <g transform="matrix(2,0,0,2,-1,-22)"> <path d="m 1,27.5 c 0,-3.685 2.86,-7 6.5,-7 l 1,0 0,-1 c 0,-4.2 3.8,-8 8,-8 l 34,0 0,8 c 0,0 -8.505162,-0.14648 -8.5,8 0.0052,8.14648 8.5,8 8.5,8 l 0,6 -30,0 -12,0 0,-7 -1,0 C 3.8,34.5 1,31.185 1,27.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" /></g> <text style="font-size:font_size;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans"><tspan x="73" y="34">block_label</tspan></text> </svg>';

var BOOLEAN1BOOLEANARGDOCKS = [
    [0, 18, 'booleanout'],
    [84, 18, 'booleanin']
];

var BOOLEAN2BOOLEANARGS = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="101" height="124"> <g transform="matrix(2,0,0,2,-1,40)"> <path d="m 1,27.5 c 0,-3.685 2.86,-7 6.5,-7 l 1,0 0,-32 c 0,-4.2 3.8,-8 8,-8 l 34,0 0,7.5 c 0,0 -8.616981,0.639408 -8.5,8 0.116981,7.3605918 8.5,8 8.5,8 l 0,5.75 0,9.75 c 0,0 -8.505162,-0.14648 -8.5,8 0.0052,8.14648 8.5,8 8.5,8 l 0,6 -30,0 -12,0 0,-7 -1,0 C 3.8,34.5 1,31.185 1,27.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" /></g> <text style="font-size:font_size;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans"><tspan x="73" y="65">block_label</tspan></text> </svg>';

var BOOLEAN2BOOLEANARGSDOCKS = [
    [0, 80, 'booleanout'],
    [84, 18, 'booleanin'],
    [84, 81, 'booleanin']
];

// = (fill_color, stroke_color, block_label)
var BOOLEAN1ARG = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="102" height="44"> <g transform="matrix(2,0,0,2,0,-40)" style="fill:fill_color;stroke:stroke_color;stroke-opacity:1"> <path d="m 1,27.5 c 0,-3.67 2.86,-7 6.5,-7 l 1,0 0,0 c 0,0 3.8,0 8,0 l 34,0 0,9 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,8 -30,0 -12,0 0,-7 -1,0 C 3.8,34.5 1,31.2 1,27.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" /> </g> <text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans"> <tspan x="74" y="28" id="tspan10">block_label</tspan> </text> </svg>';

var BOOLEAN1ARGDOCKS = [
    [0, 40, 'booleanout'],
    [86, 20, 'numberin']
];

// = (fill_color, stroke_color, block_label)
var BOOLEAN2ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="102" height="84">' + '<g transform="scale(2,2)">' + '<path d="m 1,27.5 c 0,-3.67 2.86,-7 6.5,-7 l 1,0 0,-12 c 0,-4.2 3.8,-8 8,-8 l 34,0 0,8 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,17 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,8 -30,0 -12,0 0,-7 -1,0 C 3.8,34.5 1,31.2 1,27.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="74" y="56" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var BOOLEAN2ARGDOCKS = [
    [0, 40, 'booleanout'],
    [86, 20, 'numberin'],
    [86, 62, 'numberin']
];

// Palette-related artwork

var MENUWIDTH = 200;

var PALETTEFILLER = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="filler_height">' + '<rect width="200" height="filler_height" x="0" y="0" style="fill:#b3b3b3;fill-opacity:1;stroke:none" />' + '</svg>';

var PALETTEHEADER = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="42">' + '<rect width="200" height="42" x="0" y="0" style="fill:fill_color;fill-opacity:1;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan  x="55" y="30" style="font-size:24px;text-align:start;text-anchor:start;fill:#ffffff">palette_label</tspan>' + '</text>' + '</svg>';

var PALETTEBUTTON = '<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55">' + '<rect width="55" height="55" x="0" y="0" style="fill:fill_color;fill-opacity:1;stroke:none" />' + '</svg>';

// samples-viewer related artwork

var BACKGROUND = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="650" height="590">' + '<rect width="650" height="590" x="0" y="0" style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<g transform="translate(595,0)" style="fill:#000000;display:block">' + '<path d="m 27.557,5.053 c -12.43,0 -22.5,10.076 -22.5,22.497 0,12.432 10.07,22.503 22.5,22.503 12.431,0 22.5,-10.071 22.5,-22.503 0,-12.421 -10.07,-22.497 -22.5,-22.497 z m 10.199,28.159 c 1.254,1.256 1.257,3.291 0,4.545 -0.628,0.629 -1.451,0.943 -2.274,0.943 -0.822,0 -1.644,-0.314 -2.27,-0.94 l -5.76,-5.761 -5.76,5.761 c -0.627,0.626 -1.449,0.94 -2.271,0.94 -0.823,0 -1.647,-0.314 -2.275,-0.943 -1.254,-1.254 -1.254,-3.289 0.004,-4.545 l 5.758,-5.758 -5.758,-5.758 c -1.258,-1.254 -1.258,-3.292 -0.004,-4.546 1.255,-1.254 3.292,-1.259 4.546,0 l 5.76,5.759 5.76,-5.759 c 1.252,-1.259 3.288,-1.254 4.544,0 1.257,1.254 1.254,3.292 0,4.546 l -5.758,5.758 5.758,5.758 z" style="fill:#000000;display:inline" />' + '</g>' + '</svg>';

var NEXTBUTTON = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="55" height="55">' + '<path d="M27.5,50C39.927,50,50,39.927,50,27.5C50,15.072,39.927,5,27.5,5S5,15.072,5,27.5 C5,39.927,15.073,50,27.5,50z M17.093,22.725c0.626-0.624,1.447-0.939,2.271-0.939c0.822,0,1.645,0.315,2.271,0.939l5.84,5.833 l5.657-5.802c0.63-0.645,1.464-0.967,2.3-0.967c0.808,0,1.62,0.305,2.246,0.914c1.266,1.238,1.295,3.271,0.056,4.546l-7.929,8.126 c-0.002,0-0.002,0-0.003,0c-0.01,0.011-0.015,0.021-0.022,0.028c-0.116,0.115-0.245,0.208-0.371,0.302 c-0.039,0.028-0.071,0.064-0.111,0.093c-0.114,0.075-0.24,0.133-0.36,0.194c-0.068,0.035-0.131,0.078-0.2,0.107 c-0.1,0.039-0.203,0.064-0.306,0.093c-0.099,0.032-0.191,0.068-0.292,0.09c-0.083,0.018-0.169,0.018-0.251,0.028 c-0.122,0.015-0.244,0.033-0.366,0.036c-0.071,0-0.147-0.014-0.219-0.021c-0.133-0.007-0.266-0.011-0.395-0.036 c-0.075-0.014-0.147-0.043-0.223-0.064c-0.124-0.035-0.251-0.061-0.373-0.111c-0.083-0.032-0.161-0.082-0.244-0.121 c-0.106-0.055-0.215-0.104-0.316-0.165c-0.084-0.058-0.16-0.13-0.239-0.194c-0.086-0.064-0.176-0.122-0.254-0.201 c-0.005-0.003-0.009-0.011-0.013-0.014c-0.007-0.004-0.011-0.008-0.014-0.011l-8.142-8.13 C15.837,26.019,15.834,23.986,17.093,22.725z" fill="#000000"/>' + '</svg>';

var PREVBUTTON = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="55" height="55">' + '<path d="M27.5,5C15.073,5,5,15.073,5,27.5C5,39.928,15.073,50,27.5,50S50,39.928,50,27.5 C50,15.073,39.927,5,27.5,5z M37.906,32.275c-0.626,0.624-1.447,0.939-2.271,0.939c-0.821,0-1.645-0.315-2.271-0.939l-5.84-5.833 l-5.657,5.802c-0.63,0.645-1.464,0.967-2.3,0.967c-0.808,0-1.62-0.305-2.246-0.914c-1.266-1.238-1.295-3.271-0.056-4.546 l7.929-8.126c0.002,0,0.002,0,0.003,0c0.01-0.011,0.015-0.021,0.022-0.028c0.116-0.115,0.245-0.208,0.371-0.302 c0.039-0.028,0.071-0.064,0.111-0.093c0.114-0.075,0.24-0.133,0.36-0.194c0.068-0.035,0.131-0.078,0.2-0.107 c0.1-0.039,0.203-0.064,0.306-0.093c0.099-0.032,0.191-0.068,0.292-0.09c0.083-0.018,0.169-0.018,0.251-0.028 c0.122-0.015,0.244-0.033,0.366-0.036c0.071,0,0.147,0.014,0.219,0.021c0.133,0.007,0.266,0.011,0.395,0.036 c0.075,0.014,0.146,0.043,0.223,0.064c0.123,0.035,0.251,0.061,0.373,0.111c0.082,0.032,0.161,0.082,0.243,0.121 c0.106,0.055,0.216,0.104,0.316,0.165c0.084,0.058,0.159,0.13,0.238,0.194c0.086,0.064,0.176,0.122,0.255,0.201 c0.005,0.003,0.009,0.011,0.013,0.014c0.007,0.004,0.011,0.008,0.014,0.011l8.142,8.13C39.162,28.981,39.166,31.014,37.906,32.275 z" fill="#000000"/>' + '</svg>';

// for print and error messages
var MSGBLOCK = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1000" height="42">' + '<g transform="matrix(2,0,0,2,0,8)">' + '<path d="m 0.5,8.5 0,-8 c 0,-2.09 1.91,-4 4,-4 l 4,0 10,0 473,0 4,0 c 2.09,0 4.26,1.92 4,4 l 0,8 0,4 c 0,2.09 -1.91,4 -4,4 l -4,0 -473,0 -10,0 -4,0 c -2.09,0 -4,-1.91 -4,-4 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '</svg>';

// border for trashcan
var BORDER = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120">' + '<rect width="315" height="115" x="2.5" y="2.5" style="fill:none;stroke:stroke_color;stroke-width:5.0;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:15, 15;stroke-dashoffset:0" />' + '</svg>';

// palette artwork
// Palettes have different colored blocks
var PALETTEFILLCOLORS = {
    'turtle': '#00b700',
    'pen': '#00c0e7',
    'blocks': '#ffc000',
    'media': '#ffc000',
    'number': '#ff00ff',
    'boolean': '#ff00ff',
    'flow': '#fd6600',
    'sensors': '#ff0066',
    'extras': '#ff0066',
    'mashape': '#ff0066'
};

var PALETTESTROKECOLORS = {
    'turtle': '#007b00',
    'pen': '#0081a9',
    'blocks': '#c48d00',
    'media': '#c48d00',
    'number': '#c700d3',
    'boolean': '#c700d3',
    'flow': '#ac3d00',
    'sensors': '#ef003e',
    'extras': '#ef003e',
    'mashape': '#ef003e'
};

var PALETTEHIGHLIGHTCOLORS = {
    'turtle': '#00f200',
    'pen': '#00f2ff',
    'blocks': '#ffdc00',
    'media': '#ffdc00',
    'number': '#ff9fff',
    'boolean': '#ff9fff',
    'flow': '#ffa548',
    'sensors': '#ffb1b3',
    'extras': '#ffb1b3',
    'mashape': '#ffb1b3'
};

var CLOSEICON = '<svg width="55" height="55" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55 55"><g transform="translate(0-997.36)"><path fill="#282828" d="m0 997.36h55v54.998h-55z"/><g fill="#fff"><path d="m44.971 1036.26c1.675 1.674 1.675 4.39 0 6.06-1.675 1.674-4.391 1.674-6.07 0l-28.875-28.872c-1.675-1.674-1.675-4.39 0-6.06 1.675-1.674 4.391-1.674 6.07 0l28.875 28.872"/><path d="m16.09 1042.33c-1.675 1.674-4.391 1.674-6.07 0-1.675-1.674-1.675-4.39 0-6.06l28.875-28.871c1.675-1.674 4.391-1.674 6.07 0 1.675 1.674 1.675 4.39 0 6.06l-28.875 28.871"/></g></g></svg>';

var TURTLEPALETTEICON = '<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55"> <path d="m 27.567493,45.252146 c -0.46948,0 -0.933016,-0.02903 -1.389761,-0.08296 l 1.178368,1.948634 1.161389,-1.918769 c -0.314968,0.02489 -0.629086,0.05309 -0.949996,0.05309 z" style="fill:none;stroke:#ffffff;stroke-width:1.20000005;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <path d="m 38.317981,14.929279 c -1.837168,0 -3.360217,1.289964 -3.68707,2.992219 1.578232,1.115757 2.934884,2.584076 3.968928,4.320343 1.939893,-0.142684 3.475677,-1.709721 3.475677,-3.641764 0,-2.027442 -1.682656,-3.670798 -3.757535,-3.670798 z" style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-width:2.29999995;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <path d="m 38.787461,38.290488 c -1.039138,1.851575 -2.42805,3.426908 -4.072502,4.609029 0.442312,1.546298 1.878767,2.686942 3.603022,2.686942 2.07403,0 3.757535,-1.642527 3.757535,-3.669969 0,-1.870656 -1.437304,-3.397874 -3.288055,-3.626002 z" style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-width:2.29999995;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <path d="m 16.340734,38.277215 c -1.912727,0.170889 -3.41625,1.724653 -3.41625,3.639275 0,2.026612 1.680958,3.669969 3.755837,3.669969 1.752271,0 3.212497,-1.177974 3.626793,-2.764091 -1.598607,-1.174655 -2.950165,-2.728419 -3.96638,-4.545153 z" style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-width:2.29999995;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <path d="m 20.375881,18.007772 c -0.291196,-1.744563 -1.828678,-3.078493 -3.69556,-3.078493 -2.074879,0 -3.755837,1.643356 -3.755837,3.669968 0,1.97601 1.601155,3.575399 3.603872,3.655037 1.006876,-1.694789 2.319381,-3.139051 3.847525,-4.246512 z" style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-width:2.29999995;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <path d="m 27.567493,15.62362 c 1.619832,0 3.164955,0.340948 4.599711,0.935742 0.629086,-0.892605 1.000085,-1.971862 1.000085,-3.138221 0,-3.058584 -2.537567,-5.5389654 -5.668563,-5.5389654 -3.130146,0 -5.667713,2.4803814 -5.667713,5.5389654 0,1.18461 0.383734,2.280457 1.032345,3.180529 1.463622,-0.62134 3.04525,-0.97805 4.704135,-0.97805 z" style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-width:2.29999995;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <g transform="matrix(0.8489685,0,0,0.82955893,4.2234061,5.2018707)" style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-width:1.42992032;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"> <path d="m 43.102,30.421 c 0,4.7344 -1.6452,9.2798 -4.5706,12.6275 -2.9254,3.3478 -6.8973,5.2305 -11.0344,5.2305 -4.1371,0 -8.109,-1.8827 -11.0344,-5.2305 -2.9254,-3.3477 -4.5706,-7.8931 -4.5706,-12.6275 0,-9.7966 7.0444,-17.858 15.605,-17.858 8.5606,0 15.605,8.0614 15.605,17.858 z" style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-width:1.42992032;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> </g> <g transform="matrix(0.8489685,0,0,0.82955893,4.2234061,5.2018707)" style="fill:#ffffff;fill-opacity:1;stroke:none"> <path d="m 25.875,33.75 -1.542,-4.625 3.164,-2.587 3.615,2.626 -1.487,4.669 z" style="fill:#ffffff;fill-opacity:1;stroke:none" /> <path d="m 27.501,41.551 c -3.968,-0.16 -5.543,-2.009 -5.543,-2.009 l 3.57,-4.163 4.465,0.168 3.132,4.12 c 0,0 -2.89,1.994 -5.624,1.884 z" style="fill:#ffffff;fill-opacity:1;stroke:none" /> <path d="m 18.453,33.843 c -0.849,-2.968 0.172,-6.884 0.172,-6.884 l 4,2.167 1.493,4.629 -3.582,4.233 c 0,-10e-4 -1.465,-1.99 -2.083,-4.145 z" style="fill:#ffffff;fill-opacity:1;stroke:none" /> <path d="m 19.458,25.125 c 0,0 0.5,-1.958 3.039,-3.822 2.237,-1.643 4.465,-1.72 4.465,-1.72 l -0.037,4.981 -3.521,2.75 -3.946,-2.189 z" style="fill:#ffffff;fill-opacity:1;stroke:none" /> <path d="M 32.084,27.834 28.625,24.959 29,19.75 c 0,0 1.834,-0.042 3.959,1.667 2.228,1.791 3.362,4.983 3.362,4.983 l -4.237,1.434 z" style="fill:#ffffff;fill-opacity:1;stroke:none" /> <path d="m 31.292,34.042 1.313,-4.464 4.187,-1.536 c 0,0 0.677,2.663 -0.042,5.667 -0.54,2.256 -2.084,4.361 -2.084,4.361 l -3.374,-4.028 z" style="fill:#ffffff;fill-opacity:1;stroke:none" /> </g> </svg>';

var PENPALETTEICON = '<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55"> <path d="m 11.152285,41.709935 c 1.43401,0.788706 5.23977,1.402428 7.528553,1.290609 1.626167,-0.07945 3.914929,-0.479849 5.234137,-1.43401 2.238123,-1.618798 3.032695,-5.829627 5.090736,-7.671954 1.225701,-1.097229 3.231844,-2.444635 4.875634,-2.509518 2.003851,-0.07909 4.468168,1.514349 6.166244,2.581219 1.290216,0.810619 3.800127,3.369923 3.800127,3.369923" style="fill:none;stroke:#ffffff;stroke-width:2.5;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1" /> <path d="m 35.566307,13.352385 2.437818,-2.366117 1.200984,0.84248 1.416085,1.200984 0.985882,1.272684 0.914181,1.487786 -2.366117,2.509519 -0.896257,-1.505711 -2.186866,-2.366117 -1.50571,-1.075508 z" style="fill:none;stroke:#ffffff;stroke-width:1px;stroke-opacity:1" /> <path d="m 32.877538,16.112854 2.294417,-2.079315 1.200984,0.84248 1.416085,1.200984 0.985882,1.272684 0.914181,1.487786 -2.079315,1.864214 -0.967957,-1.147208 -2.330267,-2.222716 -1.43401,-1.218909 z" style="fill:none;stroke:#ffffff;stroke-width:1px;stroke-opacity:1" /> <path d="m 13.423248,38.807621 0.891754,-3.80169 18.820708,-18.21056 -0.469344,-0.680549 2.252852,-2.135517 5.115854,5.115853 -2.229385,2.135517 -0.774419,-0.539747 -19.05538,18.022823 -3.70782,0.657082 -0.84482,-0.563212 z" style="fill:none;stroke:#ffffff;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1" /> <path d="m 33.482432,17.358584 3.660886,3.473148" style="fill:none;stroke:#ffffff;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1" /> <path d="m 10.935723,41.905293 2.769132,-2.816066" style="fill:none;stroke:#ffffff;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1" /> <path d="m 14.690478,35.287537 c 0,0 1.594197,0.393866 2.158983,0.93869 0.574138,0.553844 1.032558,2.158984 1.032558,2.158984" style="fill:none;stroke:#ffffff;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1" /> </svg>';

var NUMBERPALETTEICON = '<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55"> <g transform="translate(6.1026134,-1.6740561)" style="fill:#ffffff;fill-opacity:1"> <text style="font-size:12px;fill:#ffffff;fill-opacity:1;stroke:none;font-family:Bitstream Vera Sans"><tspan x="3.9423084" y="26.866751" id="tspan2386" style="font-size:18px;font-weight:normal;fill:#ffffff;fill-opacity:1;-inkscape-font-specification:AlArabiya">123</tspan></text> <text style="font-size:12px;fill:#ffffff;fill-opacity:1;stroke:none;font-family:Bitstream Vera Sans"><tspan x="1.8153553" y="44.840736" style="font-size:18px;font-weight:normal;fill:#ffffff;fill-opacity:1;-inkscape-font-specification:AlArabiya">+–=</tspan></text> </g> </svg>';

var BOOLEANPALETTEICON = '<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 55 55"><g style="fill:none;stroke:#ffffff;stroke-width:2.5;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;display:block"><path d="m 10,25 c 0,-6 6,-12 12,-12 6,0 12,6 12,12 0,6 -6,12 -12,12 -6,0 -12,-6 -12,-12 m 11,0 c 0,-6 6,-12 12,-12 6,0 12,6 12,12 0,6 -6,12 -12,12 -6,0 -12,-6 -12,-12" style="fill:none;stroke:#ffffff;stroke-width:2.5;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /></g></svg>';

var FLOWPALETTEICON = '<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" id="svg2"> <path d="m 14.85,27.1 -0.45,13.15 4.35,-2.4 c 0,0 6.349418,4.294879 10.2,4.05 4.946317,-0.314563 11.65,-7.5 11.65,-7.5 l -2.25,-2.3 c 0,0 -5.615371,6.15399 -9.4,6.65 -2.286298,0.29964 -7.05,-2.5 -7.05,-2.5 L 26,34.1 14.85,27.1 z" style="fill:none;stroke:#ffffff;stroke-width:2.29999995;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <path d="m 40.15,28.955044 0.45,-13.150001 -4.35,2.4 c 0,0 -6.349418,-4.294879 -10.2,-4.05 -4.946317,0.314563 -11.65,7.5 -11.65,7.5 l 2.25,2.3 c 0,0 5.615371,-6.15399 9.4,-6.65 2.286298,-0.29964 7.05,2.5 7.05,2.5 l -4.1,2.15 11.15,7.000001 z" style="fill:none;stroke:#ffffff;stroke-width:2.29999995;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> </svg>';

var BLOCKSPALETTEICON = '<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55"> <path d="m 15.719636,31.331478 0.114372,5.261133 11.437247,6.290486 L 27.5,29.387146" style="fill:none;stroke:#ffffff;stroke-width:2;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <path d="m 27.728744,29.501519 0.05719,13.381578 11.723178,-7.548583 0,-4.689272 -5.947368,3.545548" style="fill:none;stroke:#ffffff;stroke-width:2;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <path d="m 10.001012,27.328441 5.604251,-5.146761 -5.832996,-2.973684 12.123482,-7.091093 5.718623,3.316801 5.489879,-3.088056 12.123482,7.319838 -5.832996,2.401822 5.489878,5.032388 -11.322874,7.205466 -5.947369,-5.261134 -6.290485,5.261134 -11.322875,-6.976721 z" style="fill:none;stroke:#ffffff;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <path d="M 16.40587,21.952935 27.156883,15.204959 38.937247,22.067308 27.614372,28.815283 16.40587,21.952935 z" style="fill:none;stroke:#ffffff;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> </svg>';

var MEDIAPALETTEICON = '<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55"> <g transform="matrix(0.67,0,0,0.67,9.075,9.075)"> <path d="m 46.7405,44.669 c 0,2.511 -1.528,4.331 -4.332,4.331 l -29.457,0 0,-43 29.458,0 c 2.15,0 4.332,2.154 4.332,4.33 l -0.001,34.339 0,0 z" style="fill:none;stroke:#ffffff;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1" /> <line style="fill:none;stroke:#ffffff;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1" x1="22.2155" x2="22.2155" y1="6.1209998" y2="48.881001" /> <path d="m 8.2585,14.464 c 0,0 2.084,0.695 4.17,0.695 2.086,0 4.173,-0.695 4.173,-0.695" style="fill:none;stroke:#ffffff;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1" /> <path d="m 8.2585,28.021 c 0,0 1.912,0.695 4.345,0.695 2.433,0 3.999,-0.695 3.999,-0.695" style="fill:none;stroke:#ffffff;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1" /> <path d="m 8.2585,41.232 c 0,0 1.736,0.695 4.518,0.695 2.781,0 3.825,-0.695 3.825,-0.695" style="fill:none;stroke:#ffffff;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1" /> </g> </svg> ';

var SENSORSPALETTEICON = '<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 55 55"> <g transform="matrix(0.87078705,0,0,0.87078705,3.2821055,2.9298726)" style="display:block"> <line y2="23.993" y1="32.438999" x2="16.966999" x1="16.966999" style="fill:none;stroke:#ffffff;stroke-width:3.5;stroke-linecap:round" /> <line y2="28.215" y1="28.215" x2="34.938" x1="29.636999" style="fill:none;stroke:#ffffff;stroke-width:3.5;stroke-linecap:round" /> <rect width="9.7939997" height="7.599" x="42.157001" y="24.312" style="fill:#ffffff;stroke:#ffffff;stroke-width:2.25;stroke-linecap:round" /> <path d="m 16.967,23.993 c 0,-2.334 -1.892,-4.224 -4.224,-4.224 -2.332,0 -4.223,1.889 -4.223,4.224" style="fill:none;stroke:#ffffff;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round" /> <path d="m 25.413,32.439 c 0,2.334 -1.891,4.224 -4.224,4.224 -2.332,0 -4.223,-1.89 -4.223,-4.224" style="fill:none;stroke:#ffffff;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round" /> <path d="m 25.413,32.439 c 0,-2.332 1.893,-4.226 4.224,-4.226" style="fill:none;stroke:#ffffff;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round" /> <path d="m 8.52,23.993 c 0,2.332 -1.892,4.222 -4.223,4.222" style="fill:none;stroke:#ffffff;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round" /> <rect width="14.477" height="11.35" x="31.945" y="22.438" style="fill:#ffffff;stroke:#ffffff;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round" /> </g></svg> ';

var EXTRASPALETTEICON = '<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55"> <g transform="matrix(0.64,0,0,0.63959066,9.90448,9.9400384)" > <polygon points="26.891,12.363 17.238,16.369 14.659,4.975 20.555,2.531 " style="fill:#ffffff" /> <polygon points="42.646,26.88 38.649,17.228 50.04,14.654 52.477,20.55 " style="fill:#ffffff" /> <polygon points="28.117,42.645 37.775,38.645 40.349,50.029 34.453,52.471 " style="fill:#ffffff" /> <polygon points="37.824,16.315 28.171,12.309 34.394,2.439 40.295,4.882 " style="fill:#ffffff" /> <polygon points="38.628,37.791 42.623,28.139 52.493,34.365 50.055,40.258 " style="fill:#ffffff" /> <polygon points="16.385,37.76 12.391,28.105 2.515,34.34 4.953,40.234 " style="fill:#ffffff" /> <polygon points="12.319,26.875 16.32,17.216 4.936,14.643 2.493,20.539 " style="fill:#ffffff" /> <polygon points="26.939,42.623 17.287,38.629 14.719,50.018 20.609,52.461 " style="fill:#ffffff" /> <path d="m 39.925,22.352 c 2.845,6.863 -0.412,14.728 -7.274,17.574 -6.867,2.85 -14.734,-0.418 -17.578,-7.281 -2.84,-6.862 0.418,-14.733 7.279,-17.572 6.862,-2.845 14.734,0.417 17.573,7.279 z" style="fill:none;stroke:#ffffff;stroke-width:11.69439983" /> </g> </svg> ';

var PALETTEICONS = {
    'turtle': TURTLEPALETTEICON,
    'pen': PENPALETTEICON,
    'number': NUMBERPALETTEICON,
    'boolean': BOOLEANPALETTEICON,
    'flow': FLOWPALETTEICON,
    'blocks': BLOCKSPALETTEICON,
    'media': MEDIAPALETTEICON,
    'sensors': SENSORSPALETTEICON,
    'extras': EXTRASPALETTEICON
}

