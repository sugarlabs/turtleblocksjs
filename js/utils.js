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
    // FIXME: Not quite centered properly
    var dx = Math.floor((1024 - canvas.width) * scale);
    var dy = Math.floor((canvas.height - 768) * scale);
    svg += '<g transform="matrix(' + scale + ',0,0,' + scale + ',' + dx + ',' + dy + ')">\n'

    // svg += '<g transform="scale(' + scale + ',' + scale + ')">\n';
    svg += this.svgOutput;
    for (var t in turtles.turtleList) {
        svg += turtles.turtleList[t].svgOutput;
    }
    svg += '</g>';
    svg += '</svg>';
    return svg;
}
