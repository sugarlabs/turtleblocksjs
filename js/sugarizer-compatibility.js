define(["sugar-web/env", "sugar-web/activity/activity"], function(env, activity) {

  var sugarizerCompability = {
    activity: activity,
    env: env,
    xoColor: {
      stroke: "#00A0FF",
      fill: "#8BFF7A"
    },

    activity: undefined,

    loadStart: function(blocks, justLoadStart) {
      activity.getDatastoreObject().loadAsText(function(error, metadata, jsonData) {
        if (jsonData != undefined) {
          blocks.loadNewBlocks(JSON.parse(jsonData));
        } else {
          justLoadStart();
        }
      })
    },

    saveLocally: function(data, callback) {
      activity.getDatastoreObject().setDataAsText(data)
      activity.getDatastoreObject().save(function() {
        if (callback) {
          callback();
        }
      })
    },

    isInsideSugarizer: function() {
      return env.isSugarizer();
    },

    loadXoColor: function() {
      t = this;
      activity.getDatastoreObject().loadAsText(function(error, metadata, jsonData) {
        if (metadata.buddy_color) {
          t.xoColor = metadata.buddy_color;
        }
      })
    },

    hideLoading: function() {
      var imageLoading = document.getElementById("loading-image-container");
      imageLoading.style.display = "none";
    },

    sugarizerStop: function() {
      document.getElementById("stop-button").click()
    },

    setup: function() {
      if (this.isInsideSugarizer() === false) {
        return;
      }

      this.hideLoading();
      activity.setup();

    }
  };

  window.sugarizerCompability = sugarizerCompability;
  sugarizerCompability.setup();

  return sugarizerCompability;

})
