var _ = require("underscore"),
    d3 = require("d3"),
    Marionette = require("backbone.marionette");

var RoutersData = Marionette.Object.extend({
    url: "/assets/internet/Telco.csv",

    initialize: function(options) {
        _.bindAll(this, "onSync", "parseRow");
    },

    fetch: function() {
        d3.csv(this.url)
            .row(this.parseRow)
            .get(this.onSync);
    },

    parseRow: function(d) {
        var router = {};
        // The headers for the current CSV files say that the format
        // is long/lat, but it is actually lat/long
        var coordinates = d["GPS (Long/Lat)"].split("/");

        router.name = d["Name"];
        router.fqdn = d["FQDN"];
        router.containerName = d["Lxc-name"];
        router.tier = +d["Tier"];
        router.asn = +d["ASN"];
        router.lng = +coordinates[1];
        router.lat = +coordinates[0];

        return router;
    },

    onSync: function(error, data) {
        if(error) throw error;

        this.data = data;
        this.trigger("sync");
    }
});

module.exports = RoutersData;
