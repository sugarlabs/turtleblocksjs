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

// FIXME: Use busy cursor

// A viewer for sample projects
function SamplesViewer(canvas, stage, refreshCanvas, close, load, trash) {
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;
    this.closeViewer = close;
    this.sendAllToTrash = trash;
    this.loadProject = load;
    this.dict = {};
    this.projectFiles = [];
    this.container = null;
    this.prev = null;
    this.next = null;
    this.page = 0; // 4x4 image matrix per page
    this.server = true;

    this.setServer = function(server) {
        this.server = server;
    }

    this.hide = function() {
        this.container.visible = false;
        this.refreshCanvas();
    }

    this.show = function(scale) {
        this.scale = scale;
        this.page = 0;
        if (this.server) {
            try {
                var rawData = httpGet();
                var obj = JSON.parse(rawData);
                // console.log('json parse: ' + obj);
                // Look for base64-encoded png
                for (var file in obj) {
                    if (fileExt(obj[file]) == 'b64') {
                        var name = fileBasename(obj[file]);
                        if (this.projectFiles.indexOf(name) == -1) {
                            this.projectFiles.push(name);
                        }
                    }
                }
                // and corresponding .tb files
                for (var file in this.projectFiles) {
                    var tbfile = this.projectFiles[file] + '.tb';
                    if (!tbfile in obj) {
                        this.projectFiles.remove(this.projectFiles[file]);
                    }
                }
            } catch (e) {
                console.log(e);
                return;
            }
        } else {
            // FIXME: grab files from a local server?
            this.projectFiles = SAMPLES;
        }
        console.log('found these projects: ' + this.projectFiles.sort());

        if (this.container == null) {
            this.container = new createjs.Container();
            this.stage.addChild(this.container);
            this.container.x = Math.floor(((this.canvas.width / scale) - 650) / 2);
            this.container.y = 27;

            function processBackground(me, name, bitmap, extras) {
                me.container.addChild(bitmap);

		function processPrev(me, name, bitmap, extras) {
                    me.prev = bitmap;
                    me.container.addChild(me.prev);
                    me.prev.x = 270;
                    me.prev.y = 535;

		    function processNext(me, name, bitmap, scale) {
			me.next = bitmap;
			me.container.addChild(me.next);
			me.next.x = 325;
			me.next.y = 535;
			me.container.visible = true;
			me.refreshCanvas();
			me.completeInit();
		    }
		    makeViewerBitmap(me, NEXTBUTTON, 'viewer', processNext, null);
		}
		makeViewerBitmap(me, PREVBUTTON, 'viewer', processPrev, null);
            }
            makeViewerBitmap(this, BACKGROUND, 'viewer', processBackground, null);
        } else {
            this.container.visible = true;
            this.refreshCanvas();
            this.completeInit();
        }
    }

    this.downloadImage = function(p, i, prepareNextImage) {
        if (this.server) {
            var header = ''; // 'data:image/png;base64,';
            var name = this.projectFiles[p] + '.b64';
            // console.log('getting ' + name + ' from server');
            var data = header + httpGet(name);
        } else {
            var header = 'data:image/svg+xml;utf8,';
            var name = this.projectFiles[p] + '.svg';
            // console.log('getting ' + name + ' from samples');
            var data = header + SAMPLESSVG[name];
        }
        var image = new Image();
        var me = this;

        image.onload = function() {
            bitmap = new createjs.Bitmap(data);
            bitmap.scaleX = 0.5;
            bitmap.scaleY = 0.5;
            me.container.addChild(bitmap);
            lastChild = last(me.container.children);
            me.container.swapChildren(bitmap, lastChild);

            me.dict[me.projectFiles[p]] = bitmap;
            x = 5 + (i % 4) * 160;
            y = 55 + Math.floor((i % 16) / 4) * 120;
            me.dict[me.projectFiles[p]].x = x;
            me.dict[me.projectFiles[p]].y = y;
            me.dict[me.projectFiles[p]].visible = true;
            console.log('update after creating image ' + i);
            // me.refreshCanvas;
            if (prepareNextImage != null) {
                prepareNextImage(me, i + 1, p + 1);
            }
        }
        image.src = data;
    }

    this.completeInit = function() {
        var i = 0;
        var p = 0;
        this.prepareNextImage(this, i, p);
    }

    this.prepareNextImage = function(me, i, p) {
        // TODO: this.projectFiles.sort()
        // Only download the images on the first page.
        if (p < me.projectFiles.length && i < (me.page * 16 + 16)) {
            console.log('prepareNextImage ' + i + ' ' + p);
            if (me.projectFiles[p] in me.dict) {
                me.dict[me.projectFiles[p]].visible = true;
                x = 5 + (i % 4) * 160;
                y = 55 + Math.floor((i % 16) / 4) * 120;
                me.dict[me.projectFiles[p]].x = x;
                me.dict[me.projectFiles[p]].y = y;
                me.dict[me.projectFiles[p]].visible = true;
                me.prepareNextImage(me, i + 1, p + 1)
            } else {
                me.downloadImage(p, i, me.prepareNextImage);
            }
        } else {
            console.log('showing buttons');
            if (i % 16 == 0) {
                me.next.visible = true;
            }
            me.prev.visible = false;
            me.refreshCanvas();
            loadThumbnailContainerHandler(me);
        }
    }
}


function loadThumbnailContainerHandler(viewer) {
    var hitArea = new createjs.Shape();
    var w = 650;
    var h = 590;
    hitArea.graphics.beginFill('#FFF').drawRect(0, 0, w, h);
    hitArea.x = 0;
    hitArea.y = 0;
    viewer.container.hitArea = hitArea;
    viewer.container.on('click', function(event) {
        var x = (event.stageX / viewer.scale) - viewer.container.x;
        var y = (event.stageY / viewer.scale) - viewer.container.y;
        if (x > 600 && y < 55) {
            // Cancel
            viewer.closeViewer();
        } else if (y > 535) {
            if (viewer.prev.visible && x < 325) {
                // Previous page
                viewer.page -= 1;
                if (viewer.page == 0) {
                    viewer.prev.visible = false;
                }
                if ((viewer.page + 1) * 16 < viewer.projectFiles.length) {
                    viewer.next.visible = true;
                }
            } else if (viewer.next.visible && x > 325) {
                // Next page
                viewer.page += 1;
                viewer.prev.visible = true;
                if ((viewer.page + 1) * 16 + 1 > viewer.projectFiles.length) {
                    viewer.next.visible = false;
                }
            }
            var min = viewer.page * 16;
            var max = min + 16;
            var i = 0;
            for (p in viewer.projectFiles) {
                if (i >= min && i < max) {
                    // Show it if it has already been downloaded.
                    if (viewer.projectFiles[p] in viewer.dict) {
                        viewer.dict[viewer.projectFiles[p]].visible = true;
                    } else {
                        viewer.downloadImage(p, i, null);
                    }
                } else {
                    // Hide it if it has already been downloaded.
                    if (viewer.projectFiles[p] in viewer.dict) {
                        viewer.dict[viewer.projectFiles[p]].visible = false;
                    }
                }
                i += 1;
            }
            viewer.refreshCanvas();
        } else {
            // Select an entry
            var col = Math.floor((x - 5) / 160);
            var row = Math.floor((y - 55) / 120);
            var p = row * 4 + col + 16 * viewer.page;
            if (p < viewer.projectFiles.length) {
                viewer.closeViewer();
                viewer.sendAllToTrash(false);
                viewer.loadProject(viewer.projectFiles[p] + '.tb');
            }
        }
    });
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


function httpGet(projectName) {
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();

    if (projectName == null) {
        xmlHttp.open("GET", 'https://turtle.sugarlabs.org/server', false);
        xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
    } else {
        xmlHttp.open("GET", 'https://turtle.sugarlabs.org/server/' + projectName, false);
        xmlHttp.setRequestHeader('x-api-key', '3tgTzMXbbw6xEKX7');
        // xmlHttp.setRequestHeader('x-project-id', projectName);
    }
    xmlHttp.send();
    return xmlHttp.responseText;
}


function makeViewerBitmap(me, data, name, callback, extras) {
    // Async creation of bitmap from SVG data
    // Works with Chrome, Safari, Firefox (untested on IE)
    var img = new Image();
    img.onload = function() {
        bitmap = new createjs.Bitmap(img);
        callback(me, name, bitmap, extras);
    }
    img.src = 'data:image/svg+xml;base64,' + window.btoa(
        unescape(encodeURIComponent(data)));
}


function last(myList) {
    var i = myList.length;
    if (i == 0) {
        return null;
    } else {
        return myList[i - 1];
    }
}
