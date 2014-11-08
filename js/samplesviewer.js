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
    this.page = 0;
    this.server = true;

    this.setServer = function(server) {
	this.server = server;
    }

    this.hide = function() {
	this.container.visible = false;
	this.refreshCanvas;
    }

    this.show = function() {
	this.page = 0;
	if (this.server) {
            try {
		var rawData = httpGet();
		console.log('receiving ' + rawData);
		var obj = JSON.parse(rawData);
		// Look for .svg files
		for (file in obj) {
                    if (fileExt(obj[file]) == 'svg') {
			var name = fileBasename(obj[file]);
			if (this.projectFiles[name] == undefined) {
			    this.projectFiles.push(name);
			}
                    }
		}
		// and corresponding .tb files
		for (file in this.projectFiles) {
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

        // FIXME: would this be better as a pop-up?
	if (this.container == null) {
	    this.container = new createjs.Container();
	    bitmap = new createjs.Bitmap(BACKGROUND);
	    this.container.addChild(bitmap);
	    this.stage.addChild(this.container);
	    this.container.x = Math.floor((this.canvas.width - 650) / 2);
	    this.container.y = 27;
            this.loadThumbnailContainerHandler(this);
	    this.prev = new createjs.Bitmap(PREVBUTTON);
	    this.container.addChild(this.prev);
	    this.prev.x = 270;
	    this.prev.y = 535;
	    this.next = new createjs.Bitmap(NEXTBUTTON);
	    this.next.x = 325;
	    this.next.y = 535;
	    this.container.addChild(this.next);
	}

	this.container.visible = true;
        var x = 5;
        var y = 55;
	// TODO: paging
        // TODO: add Easel caching???
	var i = 0;
        for (p in this.projectFiles.sort()) {
            if (this.projectFiles[p] in this.dict) {
                this.dict[this.projectFiles[p]].visible = true;
            } else {
                var header = 'data:image/svg+xml;utf8,';
		var name = this.projectFiles[p] + '.svg';
		if (this.server) {
		    console.log('getting ' + name + ' from server');
                    var svg = header + httpGet(name);
		} else {
		    console.log('getting ' + name + ' from samples');
		    svg = header + SAMPLESSVG[name];
		}
                bitmap = new createjs.Bitmap(svg);
		bitmap.scaleX = 0.5;
		bitmap.scaleY = 0.5;
                this.container.addChild(bitmap);
                this.dict[this.projectFiles[p]] = bitmap;
            }
            this.dict[this.projectFiles[p]].x = x;
            this.dict[this.projectFiles[p]].y = y;
            x += 160;
            if (x > 500) {
                x = 5
                y += 120;
            }
	    if (i < 16) {
		this.dict[this.projectFiles[p]].visible = true;
	    } else {
		this.dict[this.projectFiles[p]].visible = false;
	    }
	    i += 1;
	    if (i % 16 == 0) {
		y = 55;
	    }
        }
	if (i > 15) {
	    this.next.visible = true;
	}
	this.prev.visible = false;
	this.refreshCanvas;
    }

    this.loadThumbnailContainerHandler = function(viewer) {
        var hitArea = new createjs.Shape();
        var w = 650;
        var h = 590;
        hitArea.graphics.beginFill('#FFF').drawRect(0, 0, w, h);
        hitArea.x = 0;
        hitArea.y = 0;
        viewer.container.hitArea = hitArea;
        viewer.container.on('click', function(event) {
	    var x = event.stageX - viewer.container.x;
	    var y = event.stageY - viewer.container.y;
	    if (x > 600 && y < 55) {
		viewer.closeViewer();
	    } else if (y > 535) {
		if (viewer.prev.visible && x < 325) {
		    viewer.page -= 1;
		    if (viewer.page == 0) {
			viewer.prev.visible = false;
		    }
		    if ((viewer.page + 1) * 16 < viewer.projectFiles.length) {
			viewer.next.visible = true;
		    }
		} else if (viewer.next.visible && x > 325) {
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
		    if (i >= min && i <= max) {
			viewer.dict[viewer.projectFiles[p]].visible = true;
		    } else {
			viewer.dict[viewer.projectFiles[p]].visible = false;
		    }
		    i += 1;
		}
		viewer.refreshCanvas();
	    } else {
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
