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
function httpGet(projectName) {
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();

    if (projectName == null) {
        xmlHttp.open("GET", window.location.origin + '/server/', false);
        xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
    } else {
        xmlHttp.open("GET", window.location.origin + '/server/' + projectName, false);
        xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
    }
    xmlHttp.send();
    return xmlHttp.responseText;
}


function httpPost(projectName, data) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", window.location.origin + '/server/' + projectName, false);
    xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
    xmlHttp.send(data);
    // return xmlHttp.responseText;
    return 'https://apps.facebook.com/turtleblocks/?file=' + projectName;
}


function docByTagName(tag) {
    document.getElementsByTagName(tag);
}


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
    for (var turtle in turtles.turtleList) {
        turtles.turtleList[turtle].closeSVG();
        svg += turtles.turtleList[turtle].svgOutput;
    }
    svg += '</g>';
    svg += '</svg>';
    return svg;
}


function fileExt(file) {
    var parts = file.split('.');
    if (parts.length == 1 || (parts[0] == '' && parts.length == 2)) {
        return '';
    }
    return parts.pop();
}


function fileBasename(file) {
    var parts = file.split('.');
    if (parts.length == 1) {
        return parts[0];
    } else if (parts[0] == '' && parts.length == 2) {
        return file;
    } else {
        parts.pop(); // throw away suffix
        return parts.join('.');
    }
}


function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}


function _(text) {
    replaced = text;
    replace = [",", "(", ")", "?", "¿", "<", ">", ".", '"\n', '"', ":", "%s", "%d", "/", "'", ";", "×"];
    for (p = 0; p < replace.length; p++) {
        replaced = replaced.replace(replace[p], "");
    }
    replaced = replaced.replace(" ", "-");
    try {
        translation = document.webL10n.get(replaced);
        if (translation == '') {
            translation = text;
        };
        return translation;
    } catch (e) {
        return text;
    }
};


function processPluginData(pluginData, palettes, blocks) {
    // Plugins are JSON-encoded dictionaries.
    var obj = JSON.parse(pluginData);

    // Create a palette entry.
    for (var name in obj['PALETTEPLUGINS']) {
        PALETTEICONS[name] = obj['PALETTEPLUGINS'][name];

        var fillColor = '#ff0066';
        if (obj['PALETTEFILLCOLORS'] != null) {
            if (obj['PALETTEFILLCOLORS'][name] != null) {
                var fillColor = obj['PALETTEFILLCOLORS'][name];
		console.log(fillColor);
            }
        }
        PALETTEFILLCOLORS[name] = fillColor;

        var strokeColor = '#ef003e';
        if (obj['PALETTESTROKECOLORS'] != null) {
            if (obj['PALETTESTROKECOLORS'][name] != null) {
                var strokeColor = obj['PALETTESTROKECOLORS'][name];
		console.log(strokeColor);
            }
        }
        PALETTESTROKECOLORS[name] = strokeColor;

        var highlightColor = '#ffb1b3';
        if (obj['PALETTEHIGHLIGHTCOLORS'] != null) {
            if (obj['PALETTEHIGHLIGHTCOLORS'][name] != null) {
                var highlightColor = obj['PALETTEHIGHLIGHTCOLORS'][name];
		console.log(highlightColor);
            }
        }
        PALETTEHIGHLIGHTCOLORS[name] = highlightColor;

	if (name in palettes.buttons) {
            console.log('palette ' + name + ' already exists');
        } else {
            console.log('adding palette ' + name);
            palettes.add(name, 'white', '#ff0066');
            palettes.makeMenu();
        }
    }

    // Populate the flow-block dictionary, i.e., the code that is
    // eval'd by this block.
    for (var flow in obj['FLOWPLUGINS']) {
        evalFlowDict[flow] = obj['FLOWPLUGINS'][flow];
    }

    // Populate the arg-block dictionary, i.e., the code that is
    // eval'd by this block.
    for (var arg in obj['ARGPLUGINS']) {
        evalArgDict[arg] = obj['ARGPLUGINS'][arg];
    }

    // Create the plugin protoblocks.
    for (var block in obj['BLOCKPLUGINS']) {
        console.log('adding plugin block ' + block);
        eval(obj['BLOCKPLUGINS'][block]);
    }

    // Push the protoblocks onto their palettes.
    for (var protoblock in blocks.protoBlockDict) {
        blocks.protoBlockDict[protoblock].palette.add(blocks.protoBlockDict[protoblock]);
    }

    palettes.updatePalettes();

    // Populate the lists of block types.
    blocks.findBlockTypes();

    // Return the object in case we need to save it to local storage.
    return obj;
}
