requirejs.config({
    baseUrl: "lib",
    shim: {
        easel: {
            exports: "createjs"
        }
    },
    paths: {
        activity: "../js",
        easel: "../lib/easeljs",
    }
});

requirejs(["activity/activity"]);
