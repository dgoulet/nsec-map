var _ = require("underscore"),
    d3 = require("d3"),
    Marionette = require("backbone.marionette");

var WorldData = Marionette.Object.extend({
    url: "./assets/topo/world-countries.json",

    initialize: function(options) {
        _.bindAll(this, "onSync");
    },

    fetch: function() {
        d3.json(this.url, this.onSync);
    },

    onSync: function(error, data) {
        if(error) throw error;

        this.data = data;
        this.trigger("sync");
    }
});

module.exports = WorldData;
