var Backbone = require("backbone"),
    Marionette = require("backbone.marionette"),
    MapView = require("../views/map");

var NsecMapController = Marionette.Controller.extend({
    initialize: function() {
        // This line intentionally left blank
    },

    start: function() {
        this.showMap();
    },

    showMap: function() {
        NsecMap.map.show(new MapView());
    }
});

module.exports = NsecMapController;
