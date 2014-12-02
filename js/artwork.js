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
var COLLAPSEBUTTONXOFF = -45;
var COLLAPSEBUTTONYOFF = 14;

// Without any scaling, blocks are multiples of a standard height.
var STANDARDBLOCKHEIGHT = 42;

// The default turtles are generated from the TURTLESVG template.
var FILLCOLORS = ['#ed001d', '#a34600', '#fb5f00', '#466e00', '#00843c', '#008283', '#007ac9', '#005dff', '#b500e3', '#ec008a'];
var STROKECOLORS = ['#ffada6', '#ffa300', '#ffc000', '#aade00', '#00fa8c', '#00f3db', '#00e3ff', '#8dceff', '#f3aeff', '#ff97d5'];

// Palettes have different colored blocks
var PALETTEFILLCOLORS = {'turtle': '#00b700', 'pen': '#00c0e7', 'blocks': '#ffc000', 'number': '#ff00ff', 'flow': '#fd6600', 'sensors': '#ff0066', 'extras': '#ff0066'};
var PALETTESTROKECOLORS = {'turtle': '#007b00', 'pen': '#0081a9', 'blocks': '#c48d00', 'number': '#c700d3', 'flow': '#ac3d00', 'sensors': '#ef003e', 'extras': '#ef003e'};
var PALETTEHIGHLIGHTCOLORS = {'turtle': '#00f200', 'pen': '#00f2ff', 'blocks': '#ffdc00', 'number': '#ff9fff', 'flow': '#ffa548', 'sensors': '#ffb1b3', 'extras': '#ffb1b3'};

// (fill_color, stroke_color)
var TURTLESVG = '<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55">' + '<g transform="matrix(1,0,0,1,-1.5,-0.60)">' + '<path d="m 27.5,48.3 c -0.6,0 -1.1,-0.1 -1.6,-0.1 l 1.3,2.3 1.4,-2.3 c -0.4,0 -0.7,0.1 -1.1,0.1 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 40.2,11.7 c -2.2,0 -4,1.6 -4.4,3.6 1.9,1.4 3.5,3.1 4.7,5.2 2.3,-0.1 4.1,-2 4.1,-4.3 0,-2.5 -2,-4.5 -4.4,-4.5 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 40.7,39.9 c -1.2,2.2 -2.8,4.1 -4.8,5.5 0.5,1.9 2.2,3.3 4.3,3.3 2.4,0 4.4,-2 4.4,-4.4 0,-2.3 -1.7,-4.1 -3.9,-4.4 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 14.3,39.9 c -2.3,0.2 -4.1,2.1 -4.1,4.4 0,2.4 2,4.4 4.5,4.4 2,0 3.8,-1.4 4.2,-3.3 -1.8,-1.5 -3.4,-3.3 -4.6,-5.5 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 19,15.4 c -0.3,-2.1 -2.1,-3.7 -4.3,-3.7 -2.5,0 -4.5,2 -4.5,4.5 0,2.3 1.9,4.3 4.3,4.4 1.2,-2.1 2.7,-3.8 4.5,-5.2 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 27.5,12.56 c 1.91,0 3.73,0.41 5.42,1.13 0.74,-1.07 1.91,-2.42 1.33,-3.69 -1.3,-2.76 -3.06,-7.69 -6.75,-7.69 -3.69,0 -5.08,4.93 -6.75,7.69 -0.74,1.22 0.44,2.66 1.21,3.74 1.72,-0.75 3.6,-1.18 5.54,-1.18 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 43.1,30.4 c 0,4.8 -1.6,9.3 -4.6,12.6 -2.9,3.4 -6.9,5.3 -11,5.3 -4.1,0 -8.1,-1.9 -11,-5.3 -3,-3.3 -4.6,-7.8 -4.6,-12.6 0,-9.8 7,-17.8 15.6,-17.8 8.6,0 15.6,8 15.6,17.8 z" style="fill:fill_color;stroke:stroke_color;stroke-width:3.5" />' + '<path d="m 25.9,33.8 -1.6,-4.7 3.2,-2.6 3.6,2.7 -1.5,4.6 z" style="fill:stroke_color;stroke:none" />' + '<path d="M 27.5,41.6 C 23.5,41.4 22,39.5 22,39.5 l 3.5,-4.1 4.5,0.1 3.1,4.2 c 0,0 -2.9,2 -5.6,1.9 z" style="fill:stroke_color;stroke:none" />' + '<path d="M 18.5,33.8 C 17.6,30.9 18.6,27 18.6,27 l 4,2.1 1.5,4.7 -3.6,4.2 c 0,0 -1.4,-2 -2.1,-4.2 z" style="fill:stroke_color;stroke:none" />' + '<path d="m 19.5,25.1 c 0,0 0.5,-1.9 3,-3.8 2.2,-1.6 4.5,-1.7 4.5,-1.7 l -0.1,5 -3.5,2.7 -3.9,-2.2 z" style="fill:stroke_color;stroke:none" />' + '<path d="M 32.1,27.8 28.6,25 29,19.8 c 0,0 1.8,-0.1 4,1.6 2.2,1.8 3.3,5 3.3,5 l -4.2,1.4 z" style="fill:stroke_color;stroke:none" />' + '<path d="m 31.3,34 1.3,-4.4 4.2,-1.6 c 0,0 0.7,2.7 0,5.7 -0.6,2.3 -2.1,4.4 -2.1,4.4 L 31.3,34 z" style="fill:stroke_color;stroke:none" />' + '</g>' + '</svg>';

// basic block, 0 args (fill_color, stroke_color, block_label)
var BASICBLOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="46">' + '<g transform="scale(2,2)">' + '<path d="m 0.5,8.5 0,-4 c 0,-2.09 1.91,-4 4,-4 l 4,0 0,2 10,0 0,-2 30,0 4,0 c 2.09,0 4,1.91 4,4 l 0,12 c 0,2.09 -1.91,4 -4,4 l -4,0 -30,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.09,0 -4,-1.91 -4,-4 l 0,-4 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="105" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var BASICBLOCKDOCKS = [[20, 0, 'out'], [20, 42, 'in']];

var BASICBLOCKNOFLOW = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="56">' + '<g transform="matrix(2,0,0,2,0,-2)">' + '<path d="m 0.5,14.5 0,-9 c 0,-2.1 1.96,-3.5 4,-4 l 4,0 0,2 10,0 0,-2 30,0 4,0 c 2.1,0 4,1.9 4,4 l 0,9 0,4 c 0,2.1 -1.9,4 -4,4 l -4,0 -30,0 -5,6 -5,-6 -4,0 c -2.1,0 -4,-1.9 -4,-4 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var BASICBLOCKNOFLOWDOCKS = [[20, 0, 'out'], [20, 42, 'unavailable']];

// basic block, 1 arg (fill_color, stroke_color, block_label)
var BASICBLOCK1ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="46">' + '<g transform="scale(2,2)">' + '<path d="m 0.5,8.5 0,-4 a 4,4 90 0 1 4,-4 l 4,0 0,2 10,0 0,-2 30,0 4,0 a 4,4 90 0 1 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 a 4,4 90 0 1 -4,4 l -4,0 -30,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 a 4,4 90 0 1 -4,-4 l 0,-4 0,-4 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var BASICBLOCK1ARGDOCKS = [[20, 0, 'out'], [98, 20, 'numberin'], [20, 42, 'in']];

// basic block, 2 args (fill_color, stroke_color, block_label, top_label)
var BASICBLOCK2ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="51">' + '<g transform="matrix(2,0,0,2,29,0)">' + '<path d="m -14,4.5 c 0,-2.0943951 1.905605,-4 4,-4 l 4,0 0,2 10,0 0,-2 22.5,0 7.5,0 4,0 c 2.094395,0 3.492035,1.9681383 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,12.5 -56,0 c 0,-4 0,-16.5 0,-20.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="110" height="2" x="2" y="49" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="25" style="font-size:12px">top_label</tspan>' + '</text>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="45" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var BASICBLOCK2ARGDOCKS = [[20, 0, 'out'], [98, 20, 'textin'], [98, 62, 'numberin'], [20, 84, 'in']];

// basic block 2 arg filler (fill_color, stroke_color)
var BASICBLOCK2ARGFILLER = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="114" height="42">' + '<path d="m 0,0 0,42 114,0 0,-42 z" style="fill:fill_color;fill-opacity:1;stroke:none" />' + '<rect width="2" height="42" x="0" y="0" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<rect width="2" height="42" x="112" y="0" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '</svg>';

// basic block 2 arg bottom (fill_color, stroke_color, bottom_label)
var BASICBLOCK2ARGBOTTOM = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="114" height="42">' + '<g transform="matrix(2,0,0,2,30,-49)">' + '<path d="m 41.5,25 0,4.5 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 c 0,2.09 -1.91,4 -4,4 l -4,0 -31,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.09,0 -4,-1.87 -4,-4 l 0,-4 0,-8.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="110" height="2" x="2" y="0" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="19" style="font-size:12px">bottom_label</tspan>' + '</text>' + '</svg>';

// value block (fill_color, stroke_color, block_label)
var VALUEBLOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="152" height="42">' + '<path d="m 17,1 134,0 0,40 -134,0 0,-16 0,-2 -12,0 0,6 -4,0 0,-16 4,0 0,6 12,0 0,-2 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:2;stroke-linecap:round;stroke-opacity:1" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:start;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="25" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var VALUEBLOCKDOCKS = [[0, 20, 'numberout']];

// Offsets for placing text ontop of value blocks.
var BOXTEXTX = 120;
var PARAMETERTEXTX = 140;
var VALUETEXTX = 70;
var VALUETEXTY = 26;

// media block (fill_color, stroke_color, block_label)
var MEDIABLOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="152" height="84">' + '<path d="m 17,1 134,0 0,82 -134,0 0,-58 0,-2 -12,0 0,6 -4,0 0,-16 4,0 0,6 12,0 0,-2 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:2;stroke-linecap:round;stroke-opacity:1" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="75" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var MEDIABLOCKDOCKS = [[0, 20, 'mediaout']];

// 1arg block (fill_color, stroke_color, block_label)
var ARG1BLOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="152" height="42">' + '<g transform="matrix(2,0,0,2,-20,0)">' + '<path d="m 12.5,9.5 6,0 0,-9 c 15.333333,0 43.666667,0 59,0 l 4,0 c 2.094395,0 3.492035,1.9681384 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 c 0,2.094395 -1.905605,4 -4,4 l -4,0 c -15.333333,0 -43.666667,0 -59,0 l 0,-9 -6,0 0,3 -2,0 0,-8 2,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="55" y="28" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var ARG1BLOCKDOCKS = [[0, 20, 'numberout'], [136, 20, 'numberin']];

// 2arg block (fill_color, stroke_color, block_label)
var ARG2BLOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="84" height="49">' + '<g transform="scale(2,2)" style="stroke-width:1;stroke-miterlimit:4;stroke-dasharray:none">' + '<path d="m 8.5,8.5 0,-4 c 0,-2.0943951 1.905605,-4 4,-4 l 4,0 10,0 7,0 4,0 c 2.094395,0 3.492035,1.9681383 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,11.5 -33,0 0,-11.5 0,-1 -6,0 0,3 -2,0 0,-8 2,0 0,3 6,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" />' + '</g>' + '<rect width="64" height="2" x="18" y="47" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:center;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:middle;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="50" y="48" style="font-size:font_size;text-align:center;text-anchor:middle">block_label</tspan>' + '</text>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="64" y="25" style="font-size:12px">top_label</tspan>' + '</text>' + '</svg>';

var ARG2BLOCKDOCKS = [[0, 20, 'numberout'], [68, 20, 'numberin'], [68, 62, 'numberin']];

// (fill_color, stroke_color)
var ARG2BLOCKFILLER = '<svg xmlns="http://www.w3.org/2000/svg" width="84" height="42">' + '<path d="m 16,0 0,42 68,0 0,-42 z" style="fill:fill_color;fill-opacity:1;stroke:none" />' + '<rect width="2" height="42" x="16" y="0" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<rect width="2" height="42" x="82" y="0" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '</svg>';

// (fill_color, stroke_color)
var ARG2BLOCKBOTTOM = '<svg xmlns="http://www.w3.org/2000/svg" width="84" height="35">' + '<g transform="matrix(2,0,0,2,0,-49)">' + '<path d="m 41.5,25 0,4.5 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 c 0,2.09, 1.9,4 -4,4 l -4,0 -7,0 -10,0 -4,0 c -2.09,0 -4,-1.9 -4,-4 l 0,-4 0,-8.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="64" height="2" x="18" y="0" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="64" y="19" style="font-size:12px">bottom_label</tspan>' + '</text>' + '</svg>';

// forever (fill_color, stroke_color, block_label)
var FLOWCLAMP0ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="74">' + '<g transform="scale(2,2)">' + '<path d="m 0.5,8.5 0,-4 c 0,-2.09 1.91,-4 4,-4 l 4,0 0,2 10,0 0,-2 9,0 21,0 4,0 c 2.09,0 3.74,1.92 4,4 l 0,12 c 0,2.09 -1.91,4 -4,4 l -4,0 -21,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.62,0 -5,2.38 -5,5 l 0,11 -8,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="14" height="4" x="2" y="70" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="105" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var FLOWCLAMP0ARGDOCKS = [[20, 0, 'out'], [38, 42, 'in'], [20, 126, 'in']];

// Text label positions
var STARTTEXTX = 20;
var ACTIONTEXTX = 100;
var ACTIONTEXTY = 40;

// repeat (fill_color, stroke_color, block_label)
var FLOWCLAMP1ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="74">' + '<g transform="scale(2,2)">' + '<path d="m 0.5,8.5 0,-4 c 0,-2.09 1.91,-4 4,-4 l 4,0 0,2 10,0 0,-2 9,0 21,0 4,0 c 2.09,0 3.74,1.92 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 c 0,2.09 -1.91,4 -4,4 l -4,0 -21,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.62,0 -5,2.38 -5,5 l 0,11 -8,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="14" height="4" x="2" y="70" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var FLOWCLAMP1ARGDOCKS = [[20, 0, 'out'], [98, 20, 'numberin'], [38, 42, 'in'], [20, 126, 'in']];

// (fill_color, stroke_color)
var CLAMPFILLER = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="42">' + '<path d="m 0,0 18,0 c 0,14.000002 0,27.999998 0,42 L 0,42 z" style="fill:fill_color;fill-opacity:1;stroke:none" />' + '<rect width="2" height="42" x="0" y="0" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<rect width="2" height="42" x="16" y="0" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '</svg>';

// (fill_color, stroke_color)
var FLOWCLAMPBOTTOM = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="56">' + '<path d="m 17,1 c 0,5.235988 4.764012,10 10,10 l 8,0 0,4 20,0 0,-4 50,0 c 3.8873,0 8,4.112699 8,8 l 0,24 c 0,4.18879 -3.81121,8 -8,8 l -50,0 -18,0 -2,0 0,4 -16,0 0,-4 -2,0 -8,0 C 4.8112098,51 1,47.18879 1,43 L 1,1 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:2;stroke-linecap:round;stroke-opacity:1" />' + '<rect width="13" height="1" x="2.5025792" y="0.50257939" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:fill_color;stroke-width:1;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0" />' + '</svg>';

// if (fill_color, stroke_color, block_label, top_label)
var FLOWCLAMPBOOLEANARG = '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="116">' + '<g transform="scale(2,2)">' + '<path d="m 0.5,8.5 0,-4 c 0,-2.0943951 1.9056049,-4 4,-4 l 4,0 0,2 10,0 0,-2 9,0 4,0 c 2.094395,0 4,1.9056049 4,4 l 0,15 c -4.18879,0 -8,3.81121 -8,8 0,4.18879 3.81121,8 8,8 l 0,2 c 0,2.094395 -1.905605,4 -4,4 l -4,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.617994,0 -5,2.382006 -5,5 l 0,11 -8,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="13" height="1" x="2.5" y="114.5" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:fill_color;stroke-width:1;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="49" y="60" style="font-size:font_size">block_label</tspan>' + '</text>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="59" y="78" style="font-size:12px">top_label</tspan>' + '</text>' + '</svg>';

var FLOWCLAMPBOOLEANDOCKS = [[20, 0, 'out'], [56, 40, 'booleanin'], [38, 84, 'in'], [20, 168, 'in']];

// start (fill_color, stroke_color, block_label)
var ACTIONCLAMP0ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="88">' + '<g transform="matrix(2,0,0,2,0,14)" style="fill:fill_color;fill-opacity:1">' + '<path d="m 0.5,8.5 0,-4 c 0,-2.0943951 1.9056049,-4 4,-4 l 4,0 5,-7 5,7 9,0 21,0 4,0 c 2.094395,0 4,1.9056049 4,4 l 0,12 c 0,2.094395 -1.905605,4 -4,4 l -4,0 -21,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.617994,0 -5,2.382006 -5,5 l -8,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="56" y="43" style="font-size:font_size">block_label</tspan>' + '</text>' + '<rect width="14" height="4" x="2" y="62" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<path d="m 1.1048469,67.104845 15.7903081,0 c 0,6.59677 0,13.193539 0,19.790309 l -15.7903081,0 z" style="fill:fill_color;fill-opacity:1;stroke:fill_color;stroke-width:2.20969129;stroke-linecap:round;stroke-opacity:1" />' + '<path d="m 1.0355239,67.18479 0,19.594575" style="fill:fill_color;fill-opacity:1;stroke:none" />' + '<rect width="2" height="22" x="-2.904625e-09" y="66" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<rect width="2" height="22" x="16" y="66" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '</svg>';

var ACTIONCLAMP0ARGDOCKS = [[20, 0, 'unavailable'], [38, 55, 'in'], [20, 80, 'unavailable']];

// action (fill_color, stroke_color, block_label)
var ACTIONCLAMP1ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="88">' + '<g transform="matrix(2,0,0,2,0,14)" style="fill:fill_color;fill-opacity:1;stroke:#c48d00;stroke-opacity:1">' + '<path d="m 0.5,8.5 0,-4 c 0,-2.0943951 1.9056049,-4 4,-4 l 4,0 5,-7 5,7 9,0 21,0 4,0 c 2.094395,0 3.740222,1.9217781 4,4 l 0,4 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,4 c 0,2.094395 -1.905605,4 -4,4 l -4,0 -21,0 -1,0 0,2 -8,0 0,-2 -1,0 -4,0 c -2.617994,0 -5,2.382006 -5,5 l -8,0 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<rect width="14" height="4" x="2" y="62" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="90" y="40" style="font-size:font_size">block_label</tspan>' + '</text>' + '<path d="m 1.104846,67.104846 15.790308,0 c 0,6.59677 0,13.193538 0,19.790308 l -15.790308,0 z" style="fill:fill_color;fill-opacity:1;stroke:fill_color;stroke-width:2.20969129;stroke-linecap:round;stroke-opacity:0.94117647" />' + '<path d="m 1.035523,67.18479 0,19.594575" style="fill:stroke_color;fill-opacity:1;stroke:none" />' + '<rect width="2" height="22" x="0" y="66" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '<rect width="2" height="22" x="16" y="66" style="fill:stroke_color;fill-opacity:1;fill-rule:nonzero;stroke:none" />' + '</svg>';

var ACTIONCLAMP1ARGDOCKS = [[20, 0, 'unavailable'], [98, 34, 'textin'], [38, 55, 'in'], [20, 80, 'unavailable']];

// (fill_color, stroke_color)
var ACTIONCLAMPBOTTOM = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="64">' + '<path d="m 17,1 c 0,5.235988 4.764012,10 10,10 l 8,0 0,4 20,0 0,-4 50,0 c 3.8873,0 8,4.112699 8,8 l 0,24 c 0,4.18879 -3.81121,8 -8,8 L 55,51 37,51 27,63 17,51 9,51 C 4.8112098,51 1,47.18879 1,43 L 1,1 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:2;stroke-linecap:round;stroke-opacity:1" />' + '<rect width="13" height="1" x="2.5" y="0.5" style="fill:fill_color;fill-opacity:1;fill-rule:nonzero;stroke:fill_color;stroke-width:1;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0" />' + '</svg>';

var ACTIONCLAMPCOLLAPSED = '<svg xmlns="http://www.w3.org/2000/svg" width="114" height="68">' + '<g transform="matrix(2,0,0,2,0,10)">' + '<path d="m 0.5,14.5 0,-9 c 0,-2.0943951 1.9681383,-3.4920346 4,-4 l 4,0 5,-6 5,6 30,0 4,0 c 2.094395,0 4,1.9056049 4,4 l 0,9 0,4 c 0,2.094395 -1.905605,4 -4,4 l -4,0 -30,0 -5,6 -5,-6 -4,0 c -2.0943951,0 -4,-1.905605 -4,-4 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:start;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="20" y="43" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

// mouse button (fill_color, stroke_color, block_label)
var BOOLEAN0ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="175" height="42">' + '<g transform="matrix(2,0,0,2,0,4)" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-opacity:1">' + '<path d="m 0.5,8.5 c 0,-3.6651914 3.3348086,-7 7,-7 l 1,0 0,-3 78.5,0 0,20 -78.5,0 0,-3 -1,0 c -3.6651914,0 -7,-3.334809 -7,-7 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="158" y="26" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var BOOLEAN0ARGDOCKS = [[0, 6, 'booleanout']];

// (fill_color, stroke_color)
var BOOLEAN1ARG = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="101" height="62"> <g transform="matrix(2,0,0,2,-1,-22)"> <path d="m 1,27.5 c 0,-3.685 2.86,-7 6.5,-7 l 1,0 0,-1 c 0,-4.2 3.8,-8 8,-8 l 34,0 0,8 c 0,0 -8.505162,-0.14648 -8.5,8 0.0052,8.14648 8.5,8 8.5,8 l 0,6 -30,0 -12,0 0,-7 -1,0 C 3.8,34.5 1,31.185 1,27.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" /></g> <text style="font-size:font_size;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans"><tspan x="73" y="34">not</tspan></text> </svg>';

var BOOLEAN1ARGDOCKS = [[0, 18, 'booleanout'], [84, 18, 'booleanin']];

// = (fill_color, stroke_color, block_label)
var BOOLEAN2ARG = '<svg xmlns="http://www.w3.org/2000/svg" width="102" height="84">' + '<g transform="scale(2,2)">' + '<path d="m 1,27.5 c 0,-3.67 2.86,-7 6.5,-7 l 1,0 0,-12 c 0,-4.2 3.8,-8 8,-8 l 34,0 0,8 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,17 -4,0 0,-3 -4,0 0,10 4,0 0,-3 4,0 0,8 -30,0 -12,0 0,-7 -1,0 C 3.8,34.5 1,31.2 1,27.5 z" style="fill:fill_color;fill-opacity:1;stroke:stroke_color;stroke-width:1;stroke-linecap:round;stroke-opacity:1" />' + '</g>' + '<text style="font-size:16px;font-style:normal;font-weight:normal;text-align:end;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:end;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans">' + '<tspan x="74" y="56" style="font-size:font_size">block_label</tspan>' + '</text>' + '</svg>';

var BOOLEAN2ARGDOCKS = [[0, 40, 'booleanout'], [86, 20, 'numberin'], [86, 62, 'numberin']];

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
