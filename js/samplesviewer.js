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

function SamplesViewer(canvas, stage, refreshCanvas, server, close, load, trash) {
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;
    this.server = server;
    this.closeViewer = close;
    this.sendAllToTrash = trash;
    this.loadProject = load;
    this.dict = {};
    this.projectFiles = [];
    this.container = null;

    console.log('SERVER is ' + this.server);

    this.hide = function() {
	this.container.visible = false;
	this.refreshCanvas;
    }

    this.show = function() {
	if (this.server) {
            try {
		var rawData = httpGet();
		console.log('receiving ' + rawData);
		var obj = JSON.parse(rawData);
		// Look for .svg files
		for (file in obj) {
                    if (fileExt(obj[file]) == 'svg') {
			this.projectFiles.push(fileBasename(obj[file]));
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
	    // How do you glob in JS?
	    this.projectFiles = ['card-01', 'card-31'];
	}
        console.log('found these projects: ' + this.projectFiles);

        // Question: would this be better as a pop-up?
	if (this.container == null) {
	    this.container = new createjs.Container();
	    bitmap = new createjs.Bitmap(BACKGROUND);
	    this.container.addChild(bitmap);
	    this.stage.addChild(this.container);
	    this.container.x = Math.floor((this.canvas.width - 650) / 2);
	    this.container.y = 27;
            this.loadThumbnailContainerHandler(this);
	}

	this.container.visible = true;
        var x = 5;
        var y = 55;
	// TODO: paging
        // TODO: add Easel caching???
        for (p in this.projectFiles) {
            if (this.projectFiles[p] in this.dict) {
                this.dict[this.projectFiles[p]].visible = true;
            } else {
                var header = 'data:image/svg+xml;utf8,';
		if (this.server) {
		    console.log('getting ' + this.projectFiles[p] + '.svg from server');
                    var svg = header + httpGet(this.projectFiles[p] + '.svg');
		} else {
		    console.log('getting ' + this.projectFiles[p] + '.svg from local file system');
		    // FIXME
		    svg = header + '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="650" height="590"> <rect width="320" height="240" x="0" y="0" style="fill:#0000ff;fill-opacity:1;fill-rule:nonzero;stroke:none" /> </svg>';
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
        }
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
	    } else {
		var col = Math.floor((x - 5) / 160);
		var row = Math.floor((y - 55) / 120);
		var p = row * 4 + col;
		// TODO: account for paging
		if (p < viewer.projectFiles.length) {
		    console.log('thumbnail ' + p + ' was clicked');
		    viewer.closeViewer();
		    viewer.sendAllToTrash(false);
		    viewer.loadProject(viewer.projectFiles[p] + '.tb');
		}
	    }
	});
    }

}
