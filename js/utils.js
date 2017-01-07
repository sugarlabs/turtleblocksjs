// Copyright (c) 2014,2015 Walter Bender
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the The GNU Affero General Public
// License as published by the Free Software Foundation; either
// version 3 of the License, or (at your option) any later version.
//
// You should have received a copy of the GNU Affero General Public
// License along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA
//

function format(str, data) {
  str = str.replace(/{([a-zA-Z0-9.]*)}/g,
                     function (match, name) {
    x = data;
    name.split('.').forEach(function (v) {
      if (x === undefined) {
        console.log('Undefined value in template string', str, name, x, v);
      }
      x = x[v];
    });
    return x;
  });
  return str.replace(/{_([a-zA-Z0-9]+)}/g,
                     function (match, item) {
    return _(item);
  });
};


function canvasPixelRatio() {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var context = document.querySelector('#myCanvas').getContext('2d');
    var backingStoreRatio = context.webkitBackingStorePixelRatio ||
                            context.mozBackingStorePixelRatio ||
                            context.msBackingStorePixelRatio ||
                            context.oBackingStorePixelRatio ||
                            context.backingStorePixelRatio || 1;
    return devicePixelRatio / backingStoreRatio;
};


function windowHeight() {
    var onAndroid = /Android/i.test(navigator.userAgent);
    if (onAndroid) {
        return window.outerHeight;
    } else {
        return window.innerHeight;
    }
};


function httpGet(projectName) {
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();

    if (projectName === null) {
        xmlHttp.open("GET", window.server, false);
        xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
    } else {
        xmlHttp.open("GET", window.server + projectName, false);
        xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
    }
    xmlHttp.send();
    if (xmlHttp.status > 299) {
        throw 'Error from server';
    }
    return xmlHttp.responseText;
};


function httpPost(projectName, data) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", window.server + projectName, false);
    xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
    xmlHttp.send(data);
    // return xmlHttp.responseText;
    return 'https://apps.facebook.com/turtleblocks/?file=' + projectName;
};


function HttpRequest(url, loadCallback, userCallback) {
    // userCallback is an optional callback-handler.
    var req = this.request = new XMLHttpRequest();
    this.handler = loadCallback;
    this.url = url;
    this.localmode = Boolean(self.location.href.search(/^file:/i) === 0);
    this.userCallback = userCallback;
    var objref = this;
    try {
        req.open('GET', url);
        req.onreadystatechange = function() { objref.handler(); };
        req.send('');
    }
    catch(e) {
        if (self.console) console.log('Failed to load resource from ' + url + ': Network error.');
        if (typeof userCallback === 'function') userCallback(false, 'network error');
        this.request = this.handler = this.userCallback = null;
    }
};


function docByTagName(tag) {
    document.getElementsByTagName(tag);
};


function docById(id) {
    return document.getElementById(id);
};


function last(myList) {
    var i = myList.length;
    if (i === 0) {
        return null;
    } else {
        return myList[i - 1];
    }
};


function doSVG(canvas, logo, turtles, width, height, scale) {
    var svg = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">\n';
    svg += '<g transform="scale(' + scale + ',' + scale + ')">\n';
    svg += logo.svgOutput;
    for (var turtle in turtles.turtleList) {
        turtles.turtleList[turtle].closeSVG();
        svg += turtles.turtleList[turtle].svgOutput;
    }
    svg += '</g>';
    svg += '</svg>';
    return svg;
};


function isSVGEmpty(turtles) {
    for (var turtle in turtles.turtleList) {
        turtles.turtleList[turtle].closeSVG();
        if (turtles.turtleList[turtle].svgOutput !== '') {
            return false;
        }
    }
    return true;
};


function fileExt(file) {
    var parts = file.split('.');
    if (parts.length === 1 || (parts[0] === '' && parts.length === 2)) {
        return '';
    }
    return parts.pop();
};


function fileBasename(file) {
    var parts = file.split('.');
    if (parts.length === 1) {
        return parts[0];
    } else if (parts[0] === '' && parts.length === 2) {
        return file;
    } else {
        parts.pop(); // throw away suffix
        return parts.join('.');
    }
};


// Needed to generate new data for localization.ini
// var translated = "";
function _(text) {
    replaced = text;
    replace = [",", "(", ")", "?", "¿", "<", ">", ".", '"\n', '"', ":", "%s", "%d", "/", "'", ";", "×", "!", "¡"];
    for (p = 0; p < replace.length; p++) {
        replaced = replaced.replace(replace[p], "");
    }
    replaced = replaced.replace(/ /g, '-');
    // Needed to generate new data for localization.ini
    // txt = "\n" + replaced + " = " + text;
    // if (translated.lastIndexOf(txt) === -1) {
    //     translated = translated + txt;
    //  }
    // You can log translated in console.log(translated)
    try {
        translation = document.webL10n.get(replaced);
        if (translation === '') {
            translation = text;
        };
        return translation;
    } catch (e) {
        return text;
    }
};


function processRawPluginData(rawData, palettes, blocks, errorMsg, evalFlowDict, evalArgDict, evalParameterDict, evalSetterDict, evalOnStartList, evalOnStopList) {
    // console.log(rawData);
    var lineData = rawData.split('\n');
    var cleanData = '';

    // We need to remove blank lines and comments and then
    // join the data back together for processing as JSON.
    for (i = 0; i < lineData.length; i++) {
        if (lineData[i].length === 0) {
            continue;
        }
        if (lineData[i][0] === '/') {
            continue;
        }
        cleanData += lineData[i];
    }

    // Note to plugin developers: You may want to comment out this
    // try/catch while debugging your plugin.
    //try {
        var obj = processPluginData(cleanData.replace(/\n/g,''), palettes, blocks, evalFlowDict, evalArgDict, evalParameterDict, evalSetterDict, evalOnStartList, evalOnStopList);
    //} catch (e) {
    //    var obj = null;
    //    errorMsg('Error loading plugin: ' + e);
    //}
    return obj;
};


function processPluginData(pluginData, palettes, blocks, evalFlowDict, evalArgDict, evalParameterDict, evalSetterDict, evalOnStartList, evalOnStopList) {
    // Plugins are JSON-encoded dictionaries of lists.
    // console.log(pluginData);
    var obj = JSON.parse(pluginData);
    // Create a palette entry.
    var newPalette = false;
    if ('PALETTEPLUGINS' in obj) {
        if ('PALETTEFILLCOLORS' in obj) {
            for(var i = 0; i < obj['PALETTEFILLCOLORS'].length; i++) {
                PALETTEFILLCOLORS[obj['PALETTEFILLCOLORS'][i][0]] = obj['PALETTEFILLCOLORS'][i][1];
            }
        }

        if ('PALETTESTROKECOLORS' in obj) {
            for(var i = 0; i < obj['PALETTESTROKECOLORS'].length; i++) {
                PALETTESTROKECOLORS[obj['PALETTESTROKECOLORS'][i][0]] = obj['PALETTESTROKECOLORS'][i][1];
            }
        }

        if ('PALETTEHIGHLIGHTCOLORS' in obj) {
            for(var i = 0; i < obj['PALETTEHIGHLIGHTCOLORS'].length; i++) {
                PALETTEHIGHLIGHTCOLORS[obj['PALETTEHIGHLIGHTCOLORS'][i][0]] = obj['PALETTEHIGHLIGHTCOLORS'][i][1];
            }
        }

        if ('HIGHLIGHTSTROKECOLORS' in obj) {
            for(var i = 0; i < obj['HIGHLIGHTSTROKECOLORS'].length; i++) {
                HIGHLIGHTSTROKECOLORS[obj['HIGHLIGHTSTROKECOLORS'][i][0]] = obj['HIGHLIGHTSTROKECOLORS'][i][1];
            }
        }

        for (var i = 0; i < obj['PALETTEPLUGINS'].length; i++) {
            var palettePlugin = obj['PALETTEPLUGINS'][i];
            PALETTEICONS[palettePlugin[0]] = palettePlugin[1];
            if(!(palettePlugin[0] in PALETTEFILLCOLORS)) PALETTEFILLCOLORS[palettePlugin[0]] = '#ff0066';
            if(!(palettePlugin[0] in PALETTESTROKECOLORS)) PALETTESTROKECOLORS[palettePlugin[0]] = '#ef003e';
            if(!(palettePlugin[0] in PALETTEHIGHLIGHTCOLORS)) PALETTEHIGHLIGHTCOLORS[palettePlugin[0]] = '#ffb1b3';
            if(!(palettePlugin[0] in HIGHLIGHTSTROKECOLORS)) HIGHLIGHTSTROKECOLORS[palettePlugin[0]] = '#404040';

            if (palettePlugin[0] in palettes.buttons) {
                console.log('palette ' + palettePlugin[0] + ' already exists');
            } else {
                console.log('adding palette ' + palettePlugin[0]);
                palettes.add(palettePlugin[0]);
                newPalette = true;
            }
        }
    }

    if (newPalette) {
        try {
            palettes.makePalettes();
        } catch (e) {
            console.log('makePalettes: ' + e);
        }
    }

    // Define the image blocks
    if ('IMAGES' in obj)  {
        for (var i = 0; i < obj['IMAGES'].length; i++)  {
            pluginsImages[obj['IMAGES'][i][0]] = obj['IMAGES'][i][1];
        }
    }

    // Populate the flow-block dictionary, i.e., the code that is
    // eval'd by this block.
    if ('FLOWPLUGINS' in obj) {
        for (var i = 0; i < obj['FLOWPLUGINS'].length; i++) {
            evalFlowDict[obj['FLOWPLUGINS'][i][0]] = obj['FLOWPLUGINS'][i][1];
        }
    }

    // Populate the arg-block dictionary, i.e., the code that is
    // eval'd by this block.
    if ('ARGPLUGINS' in obj) {
        for (var i = 0; i < obj['ARGPLUGINS'].length; i++) {
            evalArgDict[obj['ARGPLUGINS'][i][0]] = obj['ARGPLUGINS'][i][1];
        }
    }

    // Populate the setter dictionary, i.e., the code that is
    // used to set a value block.
    if ('SETTERPLUGINS' in obj) {
        for (var i = 0; i < obj['SETTERPLUGINS'].length; i++) {
            evalSetterDict[obj['SETTERPLUGINS'][i][0]] = obj['SETTERPLUGINS'][i][1];
        }
    }

    // Create the plugin protoblocks.
    if ('BLOCKPLUGINS' in obj) {
        for (var i = 0; i < obj['BLOCKPLUGINS'].length; i++) {
            var blockPlugin = obj['BLOCKPLUGINS'][i];
            try {
                eval(blockPlugin[1]);
            } catch (e) {
                console.log('Failed to load plugin for ' + blockPlugin[0] + ': ' + e);
            }
        }
    }

    // Create the globals.
    if ('GLOBALS' in obj) {
        eval(obj['GLOBALS']);
    }

    if ('PARAMETERPLUGINS' in obj) {
        for (var i = 0; i < obj['PARAMETERPLUGINS'].length; i++) {
            evalParameterDict[obj['PARAMETERPLUGINS'][i][0]] = obj['PARAMETERPLUGINS'][i][1];
        }
    }

    // Code to execute when plugin is loaded
    if ('ONLOAD' in obj) {
        for (var i = 0; i < obj['ONLOAD'].length; i++) {
            eval(obj['ONLOAD'][i][1]);
        }
    }

    // Code to execute when turtle code is started
    if ('ONSTART' in obj) {
        for (var i = 0; i < obj['ONSTART'].length; i++) {
            evalOnStartList[obj['ONSTART'][i][0]] = obj['ONSTART'][i][1];
        }
    }

    // Code to execute when turtle code is stopped
    if ('ONSTOP' in obj) {
        for (var i = 0; i < obj['ONSTOP'].length; i++) {
            evalOnStopList[obj['ONSTOP'][i][0]] = obj['ONSTOP'][i][1];
        }
    }

    // Push the protoblocks onto their palettes.
    for (var protoblock in blocks.protoBlockDict) {
        if (blocks.protoBlockDict[protoblock].palette === undefined) {
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
};


function updatePluginObj(obj) {
    if('PALETTEPLUGINS' in obj)
        for (var i = 0; i < obj['PALETTEPLUGINS'].length; i++) {
            pluginObjs['PALETTEPLUGINS'][obj['PALETTEPLUGINS'][i][0]] = obj['PALETTEPLUGINS'][i][1];
        }
    if('PALETTEFILLCOLORS' in obj)
        for (var i = 0; i < obj['PALETTEFILLCOLORS'].length; i++) {
            pluginObjs['PALETTEFILLCOLORS'][obj['PALETTEFILLCOLORS'][i][0]] = obj['PALETTEFILLCOLORS'][i][1];
        }
    if('PALETTESTROKECOLORS' in obj)
        for (var i = 0; i < obj['PALETTESTROKECOLORS'].length; i++) {
            pluginObjs['PALETTESTROKECOLORS'][obj['PALETTESTROKECOLORS'][i][0]] = obj['PALETTESTROKECOLORS'][i][1];
        }
    if('PALETTEHIGHLIGHTCOLORS' in obj)
        for (var i = 0; i < obj['PALETTEHIGHLIGHTCOLORS'].length; i++) {
            pluginObjs['PALETTEHIGHLIGHTCOLORS'][obj['PALETTEHIGHLIGHTCOLORS'][i][0]] = obj['PALETTEHIGHLIGHTCOLORS'][i][1];
        }
    if('FLOWPLUGINS' in obj)
        for (var i = 0; i < obj['FLOWPLUGINS'].length; i++) {
            pluginObjs['FLOWPLUGINS'][obj['FLOWPLUGINS'][i][0]] = obj['FLOWPLUGINS'][i][1];
        }
    if('ARGPLUGINS' in obj)
        for (var i = 0; i < obj['ARGPLUGINS'].length; i++) {
            pluginObjs['ARGPLUGINS'][obj['ARGPLUGINS'][i][0]] = obj['ARGPLUGINS'][i][1];
        }
    if('BLOCKPLUGINS' in obj)
        for (var i = 0; i < obj['BLOCKPLUGINS'].length; i++) {
            pluginObjs['BLOCKPLUGINS'][obj['BLOCKPLUGINS'][i][0]] = obj['BLOCKPLUGINS'][i][1];
        }
    if ('GLOBALS' in obj) {
        if (!('GLOBALS' in pluginObjs)) {
            pluginObjs['GLOBALS'] = '';
        }
        pluginObjs['GLOBALS'] += obj['GLOBALS'];
    }
    if ('IMAGES' in obj)
        for(var i = 0; i < obj['IMAGES'].length; i++) {
            pluginObjs['IMAGES'][obj['IMAGES'][i][0]] = obj['IMAGES'][i][1];
        }
    if('ONLOAD' in obj)
        for (var i = 0; i < obj['ONLOAD'].length; i++) {
            pluginObjs['ONLOAD'][obj['ONLOAD'][i][0]] = obj['ONLOAD'][i][1];
        }
    if('ONSTART' in obj)
        for (var i = 0; i < obj['ONSTART'].length; i++) {
            pluginObjs['ONSTART'][obj['ONSTART'][i][0]] = obj['ONSTART'][i][1];
        }
    if('ONSTOP' in obj)
        for (var i = 0; i < obj['ONSTOP'].length; i++) {
            pluginObjs['ONSTOP'][obj['ONSTOP'][i][0]] = obj['ONSTOP'][i][1];
        }
};


function preparePluginExports(obj) {
    // add obj to plugin dictionary and return as JSON encoded text
    updatePluginObj(obj);
    console.log(pluginObjs);
    var pluginObjs_JSON = {};
    for (var piece in pluginObjs) {
        var values = pluginObjs[piece];
        if (piece != 'GLOBALS') {
            pluginObjs_JSON[piece] = [];
            for (var key in values) {
                pluginObjs_JSON[piece].push([key, values[key]]);
            }
        }
        else
            pluginObjs_JSON['GLOBALS'] = values;
    }
    console.log(pluginObjs_JSON);
    return JSON.stringify(pluginObjs_JSON)
};


function processMacroData(macroData, palettes, blocks, macroDict) {
    // Macros are stored in a JSON-encoded dictionary.
    if (macroData !== '{}') {
        var obj = JSON.parse(macroData);
        console.log('adding myblocks palette');
        palettes.add('myblocks', 'black', '#a0a0a0');
        for (name in obj) {
            console.log('adding ' + name + ' to macroDict');
            macroDict[name] = obj[name];
            blocks.addToMyPalette(name, macroDict[name]);
        }
        palettes.makePalettes();
    }
};


function prepareMacroExports(name, stack, macroDict) {
    if (name !== null) {
        macroDict[name] = stack;
    }
    return JSON.stringify(macroDict);
};


function doSaveSVG(logo, desc) {
    var svg = doSVG(logo.canvas, logo, logo.turtles, logo.canvas.width, logo.canvas.height, 1.0);
    download(desc, 'data:image/svg+xml;utf8,' + svg, desc, '"width=' + logo.canvas.width + ', height=' + logo.canvas.height + '"');
};


function download(filename, data) {
    var a = document.createElement('a');
    a.setAttribute('href', data);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// Some block-specific code

// Publish to FB
function doPublish(desc) {

        function __saveProject(projectName) {
            // palettes.updatePalettes();
            // Show busy cursor.
            document.body.style.cursor = 'wait';
            setTimeout(function () {
                var punctuationless = projectName.replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^`{|}~']/g, '');
                projectName = punctuationless.replace(/ /g, '_');
                if (fileExt(projectName) !== 'tb') {
                    projectName += '.tb';
                }
                try {
                    // Post the project
                    var returnValue = httpPost(projectName, prepareExport());
                    console.log('Saved ' + projectName + ' to ' + window.location.host);

                    var img = new Image();
                    var svgData = doSVG(canvas, logo, turtles, 320, 240, 320 / canvas.width);
                    img.onload = function () {
                        var bitmap = new createjs.Bitmap(img);
                        var bounds = bitmap.getBounds();
                        bitmap.cache(bounds.x, bounds.y, bounds.width, bounds.height);
                        // and base64-encoded png
                        httpPost((projectName).replace('.tb', '.b64'), bitmap.getCacheDataURL());
                    };

                    img.src = 'data:image/svg+xml;base64,' + window.btoa(
                        unescape(encodeURIComponent(svgData)));
                    // Restore default cursor
                    document.body.style.cursor = 'default';
                    return returnValue;
                } catch (e) {
                    console.log(e);
                    // Restore default cursor
                    document.body.style.cursor = 'default';
                    return;
                }
            }, 200);
        };


    var url = __saveProject(desc.replace(/ /g,'-'));
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
};


// TODO: Move to camera plugin
var hasSetupCamera = false;
function doUseCamera(args, turtles, turtle, isVideo, cameraID, setCameraID, errorMsg) {
    var w = 320;
    var h = 240;

    var video = document.querySelector('#camVideo');
    var canvas = document.querySelector('#camCanvas');
 
    var cameraErrorTimeout = setTimeout(function () {
        errorMsg(_('Cannot launch camera'));
    }, 5000);

    if (navigator.mediaDevices.getUserMedia) {
        if (!hasSetupCamera) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                video.src = window.URL.createObjectURL(stream);
                video.play();
                hasSetupCamera = true;
            }, function(reason) {
                errorMsg(_('Cannot launch camera.'));
                console.log(reason);
                return;
            });
        } else {
            video.play();
            if (isVideo) {
                cameraID = window.setInterval(draw, 100);
                setCameraID(cameraID);
            } else {
                draw();
            }
        }
    } else {
        errorMsg(_('Cannot launch camera.'));
        return;
    }

    video.addEventListener('canplay', function (event) {
        video.setAttribute('width', w);
        video.setAttribute('height', h);
        canvas.setAttribute('width', w);
        canvas.setAttribute('height', h);
        if (isVideo) {
            cameraID = window.setInterval(draw, 100);
            setCameraID(cameraID);
        } else {
            draw();
        }
    }, false);

    function draw() {
        canvas.getContext('2d').drawImage(video, 0, 0, w, h);
        var data = canvas.toDataURL('image/jpeg');
        turtles.turtleList[turtle].doShowImage(args[0], data);
        // Success? Clear error message timeout.
        clearTimeout(cameraErrorTimeout);
    }
};


function doStopVideoCam(cameraID, setCameraID) {
    if (cameraID !== null) {
        window.clearInterval(cameraID);
    }
    setCameraID(null);
    document.querySelector('#camVideo').pause();
};


function hideDOMLabel() {
    var textLabel = docById('textLabel');
    if (textLabel !== null) {
        textLabel.style.display = 'none';
    }
    var numberLabel = docById('numberLabel');
    if (numberLabel !== null) {
        numberLabel.style.display = 'none';
    }
};


function displayMsg(blocks, text) {
    return;
    var msgContainer = blocks.msgText.parent;
    msgContainer.visible = true;
    blocks.msgText.text = text;
    msgContainer.updateCache();
    blocks.stage.setChildIndex(msgContainer, blocks.stage.getNumChildren() - 1);
};
