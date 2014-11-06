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
