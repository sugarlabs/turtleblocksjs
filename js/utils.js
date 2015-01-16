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


function HttpRequest(url, loadCallback, userCallback) {
    // userCallback is an optional callback-handler.
    var req = this.request = new XMLHttpRequest();
    this.handler = loadCallback;
    this.url = url;
    this.localmode = Boolean(self.location.href.search(/^file:/i) == 0);
    this.userCallback = userCallback;
    var objref = this;
    try {
        req.open('GET', url);
        req.onreadystatechange = function() { objref.handler(); };
        req.send('');
    }
    catch(e) {
        if (self.console) console.log('Failed to load resource from ' + url + ': Network error.');
        if (typeof userCallback == 'function') userCallback(false, 'network error');
        this.request = this.handler = this.userCallback = null;
    }
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


function processRawPluginData(rawData, palettes, blocks, errorMsg, evalFlowDict, evalArgDict) {
    var lineData = rawData.split('\n');
    var cleanData = '';

    // We need to remove blank lines and comments and then
    // join the data back together for processing as JSON.
    for (i = 0; i < lineData.length; i++) {
        if (lineData[i].length == 0) {
            continue;
        }
        if (lineData[i][0] == '/') {
            continue;
        }
        cleanData += lineData[i];
    }

    // Note to plugin developers: You may want to comment out this
    // try/catch while debugging your plugin.
    try {
        var obj = processPluginData(cleanData.replace(/\n/g,''), palettes, blocks, evalFlowDict, evalArgDict);
    } catch (e) {
       var obj = null;
       errorMsg('Error loading plugin: ' + e);
    }
    return obj;
}


function processPluginData(pluginData, palettes, blocks, evalFlowDict, evalArgDict) {
    // Plugins are JSON-encoded dictionaries.
    var obj = JSON.parse(pluginData);

    // Create a palette entry.
    var newPalette = false;
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
	    newPalette = true;
        }
    }

    if (newPalette) {
        palettes.makeMenu();
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

    // Create the globals.
    if ('GLOBALS' in obj) {
      eval(obj['GLOBALS']);
    }

    // Push the protoblocks onto their palettes.
    for (var protoblock in blocks.protoBlockDict) {
	if (blocks.protoBlockDict[protoblock].palette == undefined) {
	    console.log('Cannot find palette for protoblock ' + protoblock);
	} else {
            blocks.protoBlockDict[protoblock].palette.add(blocks.protoBlockDict[protoblock]);
	}
    }

    palettes.updatePalettes();

    // Populate the lists of block types.
    blocks.findBlockTypes();

    // Return the object in case we need to save it to local storage.
    return obj;
}


function preparePluginExports(obj) {
    // add obj to plugin dictionary and return as JSON encoded text
    for (var name in obj['PALETTEPLUGINS']) {
        pluginObjs['PALETTEPLUGINS'][name] = obj['PALETTEPLUGINS'][name];
    }
    for (var name in obj['PALETTEFILLCOLORS']) {
        pluginObjs['PALETTEFILLCOLORS'][name] = obj['PALETTEFILLCOLORS'][name];
    }
    for (var name in obj['PALETTESTROKECOLORS']) {
        pluginObjs['PALETTESTROKECOLORS'][name] = obj['PALETTESTROKECOLORS'][name];
    }
    for (var name in obj['PALETTEHIGHLIGHTCOLORS']) {
        pluginObjs['PALETTEHIGHLIGHTCOLORS'][name] = obj['PALETTEHIGHLIGHTCOLORS'][name];
    }
    for (var flow in obj['FLOWPLUGINS']) {
        pluginObjs['FLOWPLUGINS'][flow] = obj['FLOWPLUGINS'][flow];
    }
    for (var arg in obj['ARGPLUGINS']) {
        pluginObjs['ARGPLUGINS'][arg] = obj['ARGPLUGINS'][arg];
    }
    for (var block in obj['BLOCKPLUGINS']) {
        pluginObjs['BLOCKPLUGINS'][block] = obj['BLOCKPLUGINS'][block];
    }
    if ('GLOBALS' in obj) {
        pluginObjs['GLOBALS'] = obj['GLOBALS'];
    }

    return JSON.stringify(pluginObjs);
}


function doSaveSVG(canvas, turtles, desc) {
    var head = '<!DOCTYPE html>\n<html>\n<head>\n<title>' + desc + '</title>\n</head>\n<body>\n';
    var svg = doSVG(canvas, turtles, canvas.width, canvas.height, 1.0);
    var tail = '</body>\n</html>';
    // TODO: figure out if popups are blocked
    var svgWindow = window.open('data:image/svg+xml;utf8,' + svg, desc, '"width=' + canvas.width + ', height=' + canvas.height + '"');
}

function download(filename, text) {
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Some block-specific code

// Publish to FB
function doPublish(desc) {
    var url = doSave();
    console.log('push ' + url + ' to FB');
    var descElem = docById("description");
    var msg = desc + ' ' + descElem.value + ' ' + url;
    console.log('comment: ' + msg);
    var post_cb = function() {
        FB.api('/me/feed', 'post', {
            message: msg
        });
    };

    FB.login(post_cb, {
        scope: 'publish_actions'
    });
}
