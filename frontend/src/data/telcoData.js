var _ = require("underscore"),
    d3 = require("d3"),
    Marionette = require("backbone.marionette");

var TelcoData = Marionette.Object.extend({
    url: "/assets/internet/Telco.csv",

    initialize: function(options) {
        this.coordinatesByLxcName = {};
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

        // Used get coordinates of links, whose ends are given by
        // Lxc-name of the node
        this.coordinatesByLxcName[d["Lxc-name"]] = {
            lng: +coordinates[1],
            lat: +coordinates[0]
        };

        return router;
    },

    onSync: function(error, data) {
        if(error) throw error;

        this.data = data;
        this.trigger("sync");
    }
});

module.exports = TelcoData;
