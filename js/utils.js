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

function doSVG(canvas, turtles, width, height, scale) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">\n';
    svg += '<g transform="scale(' + scale + ',' + scale + ')">\n';
    svg += this.svgOutput;
    for (var t in turtles.turtleList) {
        svg += turtles.turtleList[t].svgOutput;
    }
    svg += '</g>';
    svg += '</svg>';
    return svg;
}
