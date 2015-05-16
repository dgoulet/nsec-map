var _ = require("underscore"),
    d3 = require("d3"),
    Marionette = require("backbone.marionette");

var LinksData = Marionette.Object.extend({
    url: "/assets/internet/Links.csv",

    initialize: function(options) {
        _.bindAll(this, "onSync", "parseRow");
    },

    fetch: function() {
        d3.csv(this.url)
            .row(this.parseRow)
            .get(this.onSync);
    },

    parseRow: function(d) {
        var link = {};

        link.left = d["Left"];
        link.right = d["Right"];

        return link;
    },

    onSync: function(error, data) {
        if(error) throw error;

        this.data = data;
        this.trigger("sync");
    }
});

module.exports = LinksData;
