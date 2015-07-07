var Marionette = require("backbone.marionette"),
    d3 = require("d3");

var RelaysTooltipView = Marionette.Object.extend({
    xOffset: 15,
    yOffset: -28,

    initialize: function() {
        // Remove existing tooltips first
        d3.select("body").selectAll(".tooltip").remove();

        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    },

    show: function(options) {
        var html;

        this.tooltip.transition()
            .duration(200)
            .style("opacity", 1);

		html = this.getRelaysHtml(options);

        this.tooltip.html(html)
            .style("left", (d3.event.pageX + this.xOffset) + "px")
            .style("top", (d3.event.pageY + this.yOffset) + "px");
    },

    hide: function() {
        this.tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    },

    getRelaysHtml: function(data) {
        var br = "<br/>";

        var html = data.name + br +
            "Fingerprint: " + data.fingerprint + br +
			data.ip + ":" + data.orport + br +
            "Observed BW " + data.observed_bw + " MB/s"

        return html;
    }
});

module.exports = RelaysTooltipView;
