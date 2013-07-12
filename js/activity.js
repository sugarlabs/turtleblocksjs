define(function (require) {
    var activity = require("sugar-web/activity/activity");
    var icon = require("sugar-web/graphics/icon");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        // Colorize the activity icon.
        var activityButton = document.getElementById("activity-button");
        activity.getXOColor(function (error, colors) {
            icon.colorize(activityButton, colors);
        });

	var newButton = document.getElementById("new-button");
        newButton.onclick = function () {
            new_positions();
        }

        // Make the activity stop with the stop button.
        var stopButton = document.getElementById("stop-button");
        stopButton.addEventListener('click', function (e) {
            activity.close();
        });

        var canvas, stage;

         // the display object currently under the mouse, or being dragged
        var mouseTarget;
         // indicates whether we are currently in a drag operation
        var dragStarted;
        var offset;
        var update = true;
        var drawingCanvas;
        var oldPt;
        var midPt;
        var oldMidPt;
        var color;
        var stroke;
        var colors;
        var index;
        var imagepos = new Array();
        var myimages = new Array();
        var bitmaps = new Array();
	var pen_bitmap;

        function init() {
            if (window.top != window) {
                document.getElementById("header").style.display = "none";
            }
            document.getElementById("loader").className = "loader";
            // create stage and point it to the canvas:
            canvas = document.getElementById("testCanvas");

            index = 0;
            colors = ["#828b20", "#b0ac31", "#cbc53d", "#fad779", "#f9e4ad",
                  "#faf2db", "#563512", "#9b4a0b", "#d36600", "#fe8a00",
                  "#f9a71f"];
            oldPt = new createjs.Point(400, 300);
            midPt = oldPt;
            oldMidPt = oldPt;

            //check to see if we are running in a browser with touch support
            stage = new createjs.Stage(canvas);

            // enable touch interactions if supported on the current device:
            createjs.Touch.enable(stage);

            // keep tracking the mouse even when it leaves the canvas
            stage.mouseMoveOutside = true;

            // enabled mouse over / out events
            stage.enableMouseOver(10);

            // load the source images:
            var ImageNames = new Array();
            for (i = 0; i < 10; i++) {
                ImageNames[i] = "images/dots-" + i + ".svg";
            }
            for (i = 0; i < ImageNames.length; i++) {
                imagepos[i] = [canvas.width * Math.random() | 0,
                          canvas.height * Math.random() | 0];
            }
            for (i = 0; i < ImageNames.length; i++) {
                myimages[i] = new Image();
                myimages[i].src = ImageNames[i];
                myimages[i].onload = handleImageLoad;
            }

            pen = new Image();
            pen.src = "images/pen.svg"
            pen.onload = handlePenLoad;

            drawingCanvas = new createjs.Shape();
            stage.addChild(drawingCanvas);
            stage.update();
        }

        function stop() {
            createjs.Ticker.removeEventListener("tick", tick);
        }

        function handleImageLoad(event) {
            var image = event.target;
            var imgW = image.width;
            var imgH = image.height;
            var bitmap;
            var container = new createjs.Container();
            stage.addChild(container);

            // create a shape that represents the center of the icon:
            var hitArea = new createjs.Shape();
            hitArea.graphics.beginFill("#FFF").drawEllipse(-11, -14, 24, 18);
            // position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
            hitArea.x = imgW / 2;
            hitArea.y = imgH / 2;

            i = myimages.indexOf(image)
            // create and populate the screen with random Sugar icon
            bitmap = new createjs.Bitmap(image);
            bitmaps[i] = bitmap  // save now so we can reposition later
            container.addChild(bitmap);
            bitmap.x = imagepos[i][0]
            bitmap.y = imagepos[i][1]
            bitmap.regX = imgW / 2 | 0;
            bitmap.regY = imgH / 2 | 0;
            bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1
            bitmap.name = "bmp_" + i;

            bitmap.cursor = "pointer";

            // assign the hitArea to each bitmap to use it for hit tests:
            bitmap.hitArea = hitArea;

            // wrapper function to provide scope for the event handlers:
            (function (target) {
                bitmap.onPress = function (evt) {}
                bitmap.onMouseOver = function () {}
                bitmap.onMouseOut = function () {}
            })(bitmap);

            document.getElementById("loader").className = "";
            createjs.Ticker.addEventListener("tick", tick);
        }

        function handlePenLoad(event) {
            var image = event.target;
            var imgW = image.width;
            var imgH = image.height;
            var bitmap;
            var container = new createjs.Container();
            stage.addChild(container);

            // create a shape that represents the center of the icon
            var hitArea = new createjs.Shape();
            hitArea.graphics.beginFill("#FFF").drawEllipse(-11, -14, 24, 18);
            // position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
            hitArea.x = imgW / 2;
            hitArea.y = imgH / 2;

            // create a pen
            pen_bitmap = new createjs.Bitmap(image);
            container.addChild(pen_bitmap);
            pen_bitmap.x = imagepos[0][0]
            pen_bitmap.y = imagepos[0][1]
            pen_bitmap.regX = imgW / 2 | 0;
            pen_bitmap.regY = imgH / 2 | 0;
            pen_bitmap.scaleX = pen_bitmap.scaleY = pen_bitmap.scale = 1
            pen_bitmap.name = "bmp_pen";

            pen_bitmap.cursor = "pointer";

            // assign the hitArea to each bitmap to use it for hit tests:
            pen_bitmap.hitArea = hitArea;

            // wrapper function to provide scope for the event handlers:
            (function (target) {
                pen_bitmap.onPress = function (evt) {
                    // bump the target in front of it's siblings:
                    container.addChild(target);
                    var offset = {
                        x: target.x - evt.stageX,
                        y: target.y - evt.stageY
                    };

                    // add a handler to the event object's onMouseMove callback
                    // this will be active until the user releases the mouse button:
                    evt.onMouseMove = function (ev) {
                        target.x = ev.stageX + offset.x;
                        target.y = ev.stageY + offset.y;
                        // indicate that the stage should be updated on the next tick:
                        update = true;
                        var midPt = new createjs.Point(oldPt.x + stage.mouseX >> 1,
                            oldPt.y + stage.mouseY >> 1);

                        drawingCanvas.graphics.setStrokeStyle(stroke, 'round', 'round').beginStroke(color).moveTo(midPt.x, midPt.y).curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

                        oldPt.x = stage.mouseX;
                        oldPt.y = stage.mouseY;

                        oldMidPt.x = midPt.x;
                        oldMidPt.y = midPt.y;
                    }
                }
                pen_bitmap.onMouseOver = function () {
                    target.scaleX = target.scaleY = target.scale * 1.2;
                    update = true;
                    color = colors[(index++) % colors.length];
                    stroke = Math.random() * 30 + 10 | 0;
                    oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
                    oldMidPt = oldPt;
                }
                pen_bitmap.onMouseOut = function () {
                    target.scaleX = target.scaleY = target.scale;
                    update = true;
                }
            })(pen_bitmap);

            document.getElementById("loader").className = "";
            createjs.Ticker.addEventListener("tick", tick);
        }

        function tick(event) {
            // this set makes it so the stage only re-renders when an event handler indicates a change has happened.
            if (update) {
                update = false; // only update once
                stage.update(event);
            }
        }

        function new_positions() {
	    console.log('new')
            for (i = 0; i < bitmaps.length; i++) {
		bitmaps[i].x = canvas.width * Math.random() | 0;
		bitmaps[i].y = canvas.height * Math.random() | 0;
            }
            pen_bitmap.x = bitmaps[0].x
            pen_bitmap.y = bitmaps[0].y

            drawingCanvas.graphics.clear();

            update = true;
        }

	console.log('calling init')
        init();
    });

});
