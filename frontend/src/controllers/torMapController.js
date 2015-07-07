var Backbone = require("backbone"),
    Marionette = require("backbone.marionette"),
    // Data
    WorldData = require("../data/worldData"),
    RelaysData = require("../data/relaysData"),
    // Views
    MapView = require("../views/map");

var TorMapController = Marionette.Controller.extend({
    initialize: function() {
        // This line intentionally left blank
    },

    start: function() {
        this.showMap();
    },

    showMap: function() {
        this.worldData = new WorldData();
        this.relaysData = new RelaysData();

        TorMap.map.show(new MapView({
            worldData: this.worldData,
            relaysData: this.relaysData,
        }));

        this.worldData.fetch();
        this.relaysData.fetch();
    }
});

module.exports = TorMapController;
