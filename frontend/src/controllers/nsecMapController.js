var Backbone = require("backbone"),
    Marionette = require("backbone.marionette"),
    // Data
    WorldData = require("../data/worldData"),
    RoutersData = require("../data/routersData"),
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
        this.routersData = new RoutersData();

        NsecMap.map.show(new MapView({
            worldData: this.worldData,
            routersData: this.routersData
        }));

        this.worldData.fetch();
        this.routersData.fetch();
    }
});

module.exports = NsecMapController;
