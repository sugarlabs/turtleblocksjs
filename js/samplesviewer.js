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
        if (this.container != null) {
            this.container.visible = false;
            this.refreshCanvas();
        }
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
                return false;
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

            function processBackground(viewer, name, bitmap, extras) {
                viewer.container.addChild(bitmap);

                function processPrev(viewer, name, bitmap, extras) {
                    viewer.prev = bitmap;
                    viewer.container.addChild(viewer.prev);
                    viewer.prev.x = 270;
                    viewer.prev.y = 535;

                    function processNext(viewer, name, bitmap, scale) {
                        viewer.next = bitmap;
                        viewer.container.addChild(viewer.next);
                        viewer.next.x = 325;
                        viewer.next.y = 535;
                        viewer.container.visible = true;
                        viewer.refreshCanvas();
                        viewer.completeInit();
			loadThumbnailContainerHandler(viewer);
                        return true;
                    }
                    makeViewerBitmap(viewer, NEXTBUTTON, 'viewer', processNext, null);
                }
                makeViewerBitmap(viewer, PREVBUTTON, 'viewer', processPrev, null);
            }
            makeViewerBitmap(this, BACKGROUND, 'viewer', processBackground, null);
        } else {
            this.container.visible = true;
            this.refreshCanvas();
            this.completeInit();
            return true;
        }
    }

    this.downloadImage = function(p, prepareNextImage) {
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
        var viewer = this;

        image.onload = function() {
            bitmap = new createjs.Bitmap(data);
            bitmap.scaleX = 0.5;
            bitmap.scaleY = 0.5;
            viewer.container.addChild(bitmap);
            lastChild = last(viewer.container.children);
            viewer.container.swapChildren(bitmap, lastChild);

            viewer.dict[viewer.projectFiles[p]] = bitmap;
            x = 5 + (p % 4) * 160;
            y = 55 + Math.floor((p % 16) / 4) * 120;
            viewer.dict[viewer.projectFiles[p]].x = x;
            viewer.dict[viewer.projectFiles[p]].y = y;
            viewer.dict[viewer.projectFiles[p]].visible = true;
            viewer.refreshCanvas();
            if (prepareNextImage != null) {
                prepareNextImage(viewer, p + 1);
            }
        }
        image.src = data;
    }

    this.completeInit = function() {
        var p = 0;
        this.prepareNextImage(this, p);
    }

    this.prepareNextImage = function(viewer, p) {
        // TODO: this.projectFiles.sort()
        // Only download the images on the first page.
        if (p < viewer.projectFiles.length && p < (viewer.page * 16 + 16)) {
            if (viewer.projectFiles[p] in viewer.dict) {
                x = 5 + (p % 4) * 160;
                y = 55 + Math.floor((p % 16) / 4) * 120;
                viewer.dict[viewer.projectFiles[p]].x = x;
                viewer.dict[viewer.projectFiles[p]].y = y;
                viewer.dict[viewer.projectFiles[p]].visible = true;
                viewer.prepareNextImage(viewer, p + 1)
            } else {
                viewer.downloadImage(p, viewer.prepareNextImage);
            }
        } else {
            if (viewer.page == 0) {
                viewer.prev.visible = false;
            }
            if ((viewer.page + 1) * 16 < viewer.projectFiles.length) {
                viewer.next.visible = true;
            }
            viewer.refreshCanvas();
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

    var locked = false;
    viewer.container.on('click', function(event) {
        // We need a lock to "debouce" the click.
        if (locked) {
            console.log('debouncing click');
            return;
        }
        locked = true;
        setTimeout(function() {
            locked = false;
        }, 500);

        var x = (event.stageX / viewer.scale) - viewer.container.x;
        var y = (event.stageY / viewer.scale) - viewer.container.y;
        if (x > 600 && y < 55) {
            console.log('closing viewer');
            // Cancel
            // for (var p = 0; p < viewer.projectFiles.length; p++) {
            //     if (viewer.projectsFiles[p] in viewer.dict) {
            //         viewer.dict[viewer.projectFiles[p]].visible = false;
            //     }
            // }
            viewer.hide();
            viewer.closeViewer();
        } else if (y > 535) {
            var min = viewer.page * 16;
            var max = Math.min(viewer.projectFiles.length, (viewer.page + 1) * 16);
            if (viewer.prev.visible && x < 325) {
                // Hide the current page.
                for (var p = min; p < max; p++) {
                    viewer.dict[viewer.projectFiles[p]].visible = false;
                }
                // Go back to previous page.
                viewer.page -= 1;
                if (viewer.page == 0) {
                    viewer.prev.visible = false;
                }
                if ((viewer.page + 1) * 16 < viewer.projectFiles.length) {
                    viewer.next.visible = true;
                }
                // Show the current page.
                var min = viewer.page * 16;
                var max = Math.min(viewer.projectFiles.length, (viewer.page + 1) * 16);
                for (var p = min; p < max; p++) {
                    viewer.dict[viewer.projectFiles[p]].visible = true;
                }
            } else if (viewer.next.visible && x > 325) {
                // Hide the current page.
                for (var p = min; p < max; p++) {
                    viewer.dict[viewer.projectFiles[p]].visible = false;
                }
                // Advance to next page.
                viewer.page += 1;
                viewer.prev.visible = true;
                if ((viewer.page + 1) * 16 + 1 > viewer.projectFiles.length) {
                    viewer.next.visible = false;
                }
                viewer.prepareNextImage(viewer, max);
            }
            viewer.refreshCanvas();
        } else {
            // Select an entry
            var col = Math.floor((x - 5) / 160);
            var row = Math.floor((y - 55) / 120);
            var p = row * 4 + col + 16 * viewer.page;
            if (p < viewer.projectFiles.length) {
                viewer.hide();
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


function makeViewerBitmap(viewer, data, name, callback, extras) {
    // Async creation of bitmap from SVG data
    // Works with Chrome, Safari, Firefox (untested on IE)
    var img = new Image();
    img.onload = function() {
        bitmap = new createjs.Bitmap(img);
        callback(viewer, name, bitmap, extras);
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
