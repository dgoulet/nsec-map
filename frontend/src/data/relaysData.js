var _ = require("underscore"),
    d3 = require("d3"),
    Marionette = require("backbone.marionette");

var RelaysData = Marionette.Object.extend({
    url: "./assets/internet/Relays.csv",

    initialize: function(options) {
        _.bindAll(this, "onSync", "parseRow");
    },

    fetch: function() {
        d3.csv(this.url)
            .row(this.parseRow)
            .get(this.onSync);
    },

    parseRow: function(d) {
        var relay = {};
        // The headers for the current CSV files say that the format
        // is long/lat, but it is actually lat/long
        var coordinates = d["GPS (Long/Lat)"].split("/");

        relay.name = d["Name"];
        relay.fingerprint = d["Fingerprint"];
        relay.as = d["AS"];
		relay.ip = d["IP"];
		relay.orport = d["OrPort"];
		relay.observed_bw = d["ObservedBW"];
        relay.lng = +coordinates[1];
        relay.lat = +coordinates[0];

        return relay;
    },

    onSync: function(error, data) {
        if(error) throw error;

        this.data = data;
        this.trigger("sync");
    }
});

module.exports = RelaysData;
