var Backbone = require("backbone"),
    Marionette = require("backbone.marionette"),
    // Data
    WorldData = require("../data/worldData"),
    // Views
    MapView = require("../views/map");

var NsecMapController = Marionette.Controller.extend({
    initialize: function() {
        // This line intentionally left blank
    },

    start: function() {
        this.showMap();
    },

    showMap: function() {
        this.worldData = new WorldData();

        NsecMap.map.show(new MapView({
            worldData: this.worldData
        }));

        this.worldData.fetch();
    }
});

module.exports = NsecMapController;
