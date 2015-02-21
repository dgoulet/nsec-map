var $ = require("jquery"),
    _ = require("underscore"),
    Marionette = require("backbone.marionette"),
    d3 = require("d3"),
    topojson = require("topojson");

var MapView = Marionette.ItemView.extend({
    template: false,
    tagName: "svg",

    margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    },

    initialize: function(options) {
        options = options || {}
        this.margin = options.margin || this.margin;
        this.selector = options.selector || ".map";

        this.setDimensions();

        this.initializeVisualisation();

        this.setElement(d3.select(this.selector)
                        .append("svg")
                        .attr("width", this.svgWidth)
                        .attr("height", this.svgHeight)
                        [0]);
    },

    onRender: function() {
        this.svg = d3.select(this.el)
            .append("g")
            .attr("transform", "translate(" + this.margin.left +
                  "," + this.margin.top + ")");

        this.drawMap();
    },

    initializeVisualisation: function() {
        this.projection = d3.geo.orthographic()
            .scale(250)
            .translate([this.width / 2, this.height / 2])
            .clipAngle(90)
            .precision(0.1);

        this.path = d3.geo.path()
            .projection(this.projection);

        this.lambda = d3.scale.linear()
            .domain([0, this.width])
            .range([-180, 180]);

        this.phi = d3.scale.linear()
            .domain([0, this.height])
            .range([90, -90]);
    },

    drawMap: function() {
        var onSuccess = _.bind(function(error, world) {
            this.svg.append("path")
                .datum(topojson.feature(world, world.objects.land))
                .attr("class", "land")
                .attr("d", this.path);
        }, this);

        d3.json("/assets/topo/world-countries.json", onSuccess);
    },

    setDimensions: function() {
        this.svgWidth = this.getWidth();
        this.svgHeight = this.getHeight();

        this.width = this.svgWidth - this.margin.left - this.margin.right;
        this.height = this.svgHeight - this.margin.top - this.margin.bottom;
    },

    getWidth: function() {
        return parseInt(d3.select(this.selector).style("width"));
    },

    getHeight: function() {
        return parseInt(d3.select(this.selector).style("height"));
    }
});

module.exports = MapView;
