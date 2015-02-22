var $ = require("jquery"),
    _ = require("underscore"),
    Marionette = require("backbone.marionette"),
    d3 = require("d3"),
    topojson = require("topojson"),
    // This isn't a proper module, so don't use geoZoom as if it were
    // Instead requiring the file will add the d3.geo.zoom function to
    // the existing d3 object
    geoZoom = require("../utils/d3.geo.zoom");

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
        this.world = options.worldData;

        this.setDimensions();
        this.replaceElement();
        this.initializeVisualisation();

        _.bindAll(this, "zoomRedraw");

        this.listenTo(this.world, "sync", this.drawMap);
    },

    onRender: function() {
        this.initMap();
    },

    initializeVisualisation: function() {
        this.projection = d3.geo.orthographic()
            .scale(250)
            .translate([this.width / 2, this.height / 2])
            .clipAngle(90)
            .precision(0.1);

        this.path = d3.geo.path()
            .projection(this.projection);

        this.graticule = d3.geo.graticule();

        this.lambda = d3.scale.linear()
            .domain([0, this.width])
            .range([-180, 180]);

        this.phi = d3.scale.linear()
            .domain([0, this.height])
            .range([90, -90]);
    },

    handleSync: function() {
    },

    initMap: function() {
        this.svg = d3.select(this.el)
            .append("g")
            .attr("transform", "translate(" + this.margin.left +
                  "," + this.margin.top + ")");

        this.svg.append("defs").append("path")
            .datum({type: "Sphere"})
            .attr("id", "sphere")
            .attr("d", this.path);

        this.svg.append("use")
            .attr("class", "stroke")
            .attr("xlink:href", "#sphere");

        this.svg.append("use")
            .attr("class", "fill")
            .attr("xlink:href", "#sphere");

        this.svg.append("path")
            .datum(this.graticule)
            .attr("class", "graticule grabbable")
            .attr("d", this.path)
    },

    drawMap: function() {
        this.svg.insert("path", ".graticule")
            .datum(topojson.feature(this.world.data,
                                    this.world.data.objects.land))
            .attr("class", "land  grabbable")
            .attr("d", this.path)

        this.svg.insert("path", ".graticule")
            .datum(topojson.mesh(this.world.data,
                                 this.world.data.objects.countries,
                                 function(a, b) {
                                     return a !== b;
                                 }
                                )
                  )
            .attr("class", "boundary  grabbable")
            .attr("d", this.path)

        // Allow zoom and rotation of map
        this.svg.selectAll("path")
            .call(d3.geo.zoom().projection(this.projection)
                  .scaleExtent([this.projection.scale() * .7,
                                this.projection.scale() * 10])
                  .on("zoom.redraw", this.zoomRedraw));
    },

    zoomRedraw: function() {
        if (d3.event.sourceEvent.preventDefault) {
            d3.event.sourceEvent.preventDefault();
        }

        this.svg.selectAll("path").attr("d", this.path);
    },

    setDimensions: function() {
        this.svgWidth = this.getWidth();
        this.svgHeight = this.getHeight();

        this.width = this.svgWidth - this.margin.left - this.margin.right;
        this.height = this.svgHeight - this.margin.top - this.margin.bottom;
    },

    // This function replaces the view's el in order to have the right svg
    // namespace for the d3 visualisations
    replaceElement: function() {
        this.setElement(d3.select(this.selector)
                        .append("svg")
                        .attr("width", this.svgWidth)
                        .attr("height", this.svgHeight)
                        [0]);
    },

    getWidth: function() {
        return parseInt(d3.select(this.selector).style("width"));
    },

    getHeight: function() {
        return parseInt(d3.select(this.selector).style("height"));
    }
});

module.exports = MapView;
