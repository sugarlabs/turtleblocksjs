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

        // Make the activity stop with the stop button.
        var stopButton = document.getElementById("stop-button");
        stopButton.addEventListener('click', function (e) {
            activity.close();
        });

    });

});
