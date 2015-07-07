var $ = require("jquery"),
    Backbone = require("backbone");
// Must be set before requiring Marionette
Backbone.$ = $;
var Marionette = require("backbone.marionette");

var NsecMap = new Marionette.Application({
    logEvents: function(log) {
        if(log) {
            if(!this.loggingEvents) {
                NsecMap.vent.on("all", this.logEvent);
                this.loggingEvents = true;
            }
        } else {
            NsecMap.vent.off("all", this.logEvent);
            this.loggingEvents = false;
        }
    },

    logEvent: function(event, payload) {
        console.log(event, payload);
    }
});

NsecMap.addRegions({
    map: ".map"
});

module.exports = NsecMap;
