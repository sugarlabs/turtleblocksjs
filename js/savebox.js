const SAVEBOXSVG = '<svg xmlns="http://www.w3.org/2000/svg" height="133" width="360" version="1.1"> <rect style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none" y="0" x="0" height="133" width="360" /> <g style="fill:#000000;display:block" transform="translate(306.943,-1.053)"> <path style="fill:#000000;display:inline" d="m 27.557,5.053 c -12.43,0 -22.5,10.076 -22.5,22.497 0,12.432 10.07,22.503 22.5,22.503 12.431,0 22.5,-10.071 22.5,-22.503 0,-12.421 -10.07,-22.497 -22.5,-22.497 z m 10.199,28.159 c 1.254,1.256 1.257,3.291 0,4.545 -0.628,0.629 -1.451,0.943 -2.274,0.943 -0.822,0 -1.644,-0.314 -2.27,-0.94 l -5.76,-5.761 -5.76,5.761 c -0.627,0.626 -1.449,0.94 -2.271,0.94 -0.823,0 -1.647,-0.314 -2.275,-0.943 -1.254,-1.254 -1.254,-3.289 0.004,-4.545 l 5.758,-5.758 -5.758,-5.758 c -1.258,-1.254 -1.258,-3.292 -0.004,-4.546 1.255,-1.254 3.292,-1.259 4.546,0 l 5.76,5.759 5.76,-5.759 c 1.252,-1.259 3.288,-1.254 4.544,0 1.257,1.254 1.254,3.292 0,4.546 l -5.758,5.758 5.758,5.758 z" /> </g> <rect style="fill:#92b5c8;fill-opacity:1;stroke:none" y="51" x="0" height="82" width="360" /> <rect y="0.76763773" x="0.76764059" height="131.46472" width="358.46472" style="display:inline;visibility:visible;opacity:1;fill:none;fill-opacity:1;stroke:#000000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;" /></svg>';

function SaveBox(canvas, stage, refreshCanvas, saveAsTB, saveAsSVG, saveAsPNG, uploadPlanet, shareFb) {
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;

    this.doSaveTB = saveAsTB;
    this.doSaveSVG = saveAsSVG;
    this.doSavePNG = saveAsPNG;
    this.doUploadToPlanet = uploadPlanet;
    this.doShareOnFacebook = shareFb;
    
    this.container = null;
    this.save = null;
    this.close = null;
    this.scale = 1;

    this.init = function(scale, x, y, makeButton) {
        if (this.container === null) {
            this.createBox(scale, x, y);
            var box = this;

            this.saveTB = makeButton('save-tb', _('Save as .tb'), this.container.x + 50, this.container.y + 85, 55, 0, this.stage);
            this.saveTB.visible = true;
            this.positionHoverText(this.saveTB);
            this.saveTB.on('click', function(event) {
                box.hide();
                box.doSaveTB();
            });

            this.saveSVG = makeButton('save-svg', _('Save as .svg'), this.container.x + 115, this.container.y + 85, 55, 0, this.stage);
            this.saveSVG.visible = true;
            this.positionHoverText(this.saveSVG);
            this.saveSVG.on('click', function(event) {
                box.hide();
                box.doSaveSVG();
            });

            this.savePNG = makeButton('save-png-inactive', _('Save as .png'), this.container.x + 180, this.container.y + 85, 55, 0, this.stage);
            this.savePNG.visible = true;
            this.positionHoverText(this.savePNG);
            this.savePNG.on('click', function(event) {
                box.hide();
                box.doSavePNG();
            });

            this.uploadToPlanet = makeButton('upload-planet', _('Upload to Planet'), this.container.x + 245, this.container.y + 85, 55, 0, this.stage);
            this.uploadToPlanet.visible = true;
            this.positionHoverText(this.uploadToPlanet);
            this.uploadToPlanet.on('click', function(event) {
                box.hide();
                box.doUploadToPlanet();
            });

            this.shareOnFb = makeButton('fb-inactive', _('Share on Facebook'), this.container.x + 310, this.container.y + 85, 55, 0, this.stage);
            this.shareOnFb.visible = true;
            this.positionHoverText(this.shareOnFb);
            this.shareOnFb.on('click', function(event) {
                box.hide();
                box.doShareOnFacebook();
                // change 'fb-inactive' to 'fb' when the button becomes operational
            });
        } else {
            this.show();
        }
    };

    this.positionHoverText = function(button) {
        for (var c = 0; c < button.children.length; c++) {
            if (button.children[c].text != undefined) {
                button.children[c].textAlign = 'left';
                button.children[c].x = -27;
                button.children[c].y = 27;
                break;
            }
        }
    };

    this.hide = function() {
        if (this.container !== null) {
            this.saveTB.visible = false;
            this.saveSVG.visible = false;
            this.savePNG.visible = false;
            this.uploadToPlanet.visible = false;
            this.shareOnFb.visible = false;
            this.container.visible = false;
            this.refreshCanvas();
        }
    };

    this.show = function() {
        if (this.container !== null) {
            this.saveTB.visible = true;
            this.saveSVG.visible = true;
            this.savePNG.visible = true;
            this.uploadToPlanet.visible = true;
            this.shareOnFb.visible = true;
            this.container.visible = true;
            this.refreshCanvas();
        }
    };

    this.createBox = function(scale, x, y) {
        this.scale = scale;

        function __processBackground(box, name, bitmap, extras) {
            box.container.addChild(bitmap);
            box._loadUtilityContainerHandler();

            var hitArea = new createjs.Shape();
            box.bounds = box.container.getBounds();
            box.container.cache(box.bounds.x, box.bounds.y, box.bounds.width, box.bounds.height);
            hitArea.graphics.beginFill('#FFF').drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
            hitArea.x = 0;
            hitArea.y = 0;
            box.container.hitArea = hitArea;
        };

        if (this.container == null) {
            this.container = new createjs.Container();
            this.stage.addChild(this.container);
            this.container.x = x - 360;
            this.container.y = y - 133;

            var SAVEBOX = SAVEBOXSVG;
            this._makeBoxBitmap(SAVEBOX, 'box', __processBackground, null);
        }
    };

    this._makeBoxBitmap = function(data, name, callback, extras) {
        // Async creation of bitmap from SVG data
        // Works with Chrome, Safari, Firefox (untested on IE)
        var img = new Image();
        var box = this;

        img.onload = function() {
            bitmap = new createjs.Bitmap(img);
            callback(box, name, bitmap, extras);
        };

        img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(data)));
    };

    this._loadUtilityContainerHandler = function() {
        var locked = false;
        var box = this;

        box.container.on('click', function(event) {
            if (locked) {
                console.log('debouncing click');
                return;
            }
            locked = true;
            setTimeout(function() {
                locked = false;
            }, 500);
            
            var x = (event.stageX / box.scale) - box.container.x;
            var y = (event.stageY / box.scale) - box.container.y;
            if (y < 55) {
                box.hide();
            }
        });
    };
};