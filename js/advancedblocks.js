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
// FIXME: find these from local storage
var evalFlowDict = JSON.parse(FLOWPLUGINS);
var evalArgDict = JSON.parse(ARGPLUGINS);

// Define block prototypes here
function initAdvancedProtoBlocks(palettes, blocks) {
    var pluginBlocksDict = JSON.parse(BLOCKPLUGINS);
    blocks.palettes = palettes;


    // Create the plugin protoblocks from the dictionary
    for (var name in pluginBlocksDict) {
	// console.log('loading plugin block ' + name);
	eval(pluginBlocksDict[name]);
    }

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
