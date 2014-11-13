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
    this.page = 0;  // 4x4 image matrix per page
    this.server = true;

    this.setServer = function(server) {
        this.server = server;
    }

    this.hide = function() {
        this.container.visible = false;
        this.refreshCanvas;
    }

    this.show = function(scale) {
        this.page = 0;
        if (this.server) {
            try {
                var rawData = httpGet();
                var obj = JSON.parse(rawData);
                // console.log('json parse: ' + obj);
                // Look for .svg files
                for (var file in obj) {
                    if (fileExt(obj[file]) == 'svg') {
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
            }

            makeViewerBitmap(this, BACKGROUND, 'viewer', processBackground, null);

            function processPrev(me, name, bitmap, extras) {
                me.prev = bitmap;
                me.container.addChild(me.prev);
                me.prev.x = 270;
                me.prev.y = 535;
            }

            makeViewerBitmap(this, PREVBUTTON, 'viewer', processPrev, null);

            function processNext(me, name, bitmap, scale) {
                me.next = bitmap;
                me.container.addChild(me.next);
                me.next.x = 325;
                me.next.y = 535;

		me.loadThumbnailContainerHandler(me, scale);
                me.completeInit(scale);
            }

            makeViewerBitmap(this, NEXTBUTTON, 'viewer', processNext, scale);
        } else {
            this.completeInit(scale);
        }
    }

    this.downloadImage = function(p) {
        var header = 'data:image/svg+xml;utf8,';
        var name = this.projectFiles[p] + '.svg';
        if (this.server) {
            // console.log('getting ' + name + ' from server');
            var svg = header + httpGet(name);
        } else {
            // console.log('getting ' + name + ' from samples');
            svg = header + SAMPLESSVG[name];
        }
        bitmap = new createjs.Bitmap(svg);
        bitmap.scaleX = 0.5;
        bitmap.scaleY = 0.5;
        this.container.addChild(bitmap);
        this.dict[this.projectFiles[p]] = bitmap;
    }

    this.completeInit = function(scale) {
        this.container.visible = true;
        this.refreshCanvas;
        var x = 5;
        var y = 55;
        var i = 0;
        for (p in this.projectFiles.sort()) {
            if (this.projectFiles[p] in this.dict) {
                this.dict[this.projectFiles[p]].visible = true;
            } else {
		this.downloadImage(p);
            }
	    x = 5 + (i % 4) * 160;
	    y = 55 + Math.floor(i / 4) * 120;
            this.dict[this.projectFiles[p]].x = x;
            this.dict[this.projectFiles[p]].y = y;
            if (i < 16) {
                this.dict[this.projectFiles[p]].visible = true;
            } else {
                this.dict[this.projectFiles[p]].visible = false;
            }
            i += 1;
            if (i % 16 == 0) {
		this.next.visible = true;
		break;	// Only download the first page's images.
            }
        }
        this.prev.visible = false;
        this.refreshCanvas;
    }

    this.loadThumbnailContainerHandler = function(viewer, scale) {
        var hitArea = new createjs.Shape();
        var w = 650;
        var h = 590;
        hitArea.graphics.beginFill('#FFF').drawRect(0, 0, w, h);
        hitArea.x = 0;
        hitArea.y = 0;
        viewer.container.hitArea = hitArea;
        viewer.container.on('click', function(event) {
            var x = (event.stageX / scale) - viewer.container.x;
            var y = (event.stageY / scale) - viewer.container.y;
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
			    viewer.downloadImage(p);
			    x = 5 + (i % 4) * 160;
			    y = 55 + Math.floor((i % 16) / 4) * 120;
			    viewer.dict[viewer.projectFiles[p]].x = x;
			    viewer.dict[viewer.projectFiles[p]].y = y;
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
    if (parts.length == 1 ) {
        return parts[0];
    } else if (parts[0] == '' && parts.length == 2) {
        return file;
    } else {
        parts.pop(); // throw away suffix
        return parts.join('.');
    }
}


function httpGet(projectName)
{
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
    var DOMURL = window.URL || window.webkitURL || window;
    var img = new Image();
    var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    var url = DOMURL.createObjectURL(svg);
    img.onload = function () {
        bitmap = new createjs.Bitmap(img);
        DOMURL.revokeObjectURL(url);
        callback(me, name, bitmap, extras);
    }
    img.src = url;
}
