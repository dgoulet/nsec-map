var $ = require("jquery"),
    _ = require("underscore"),
    Marionette = require("backbone.marionette"),
    d3 = require("d3"),
    topojson = require("topojson"),
    // This isn't a proper module, so don't use the geoZoom directly
    // as if it were. Instead, requiring the file will add the
    // d3.geo.zoom function to the existing d3 object
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

    zoomMin: 0.7,
    zoomMax: 10,
    scale: 250,
    clipAngle: 90,
    precision: 0.1,
    circleRadius: 5,

    initialize: function(options) {
        options = options || {};
        this.margin = options.margin || this.margin;
        this.selector = options.selector || ".map";
        this.world = options.worldData;
        this.routers = options.routersData;
        this.links = options.linksData;

        this.setDimensions();
        this.replaceElement();
        this.initializeVisualisation();

        this.resizeMap = _.debounce(this.resizeMap, 250);
        _.bindAll(this, "zoomRedraw", "resizeMap", "appendRouter",
                  "appendLink", "getRouterFill");

        this.listenTo(this.world, "sync", this.drawMap);
        this.listenTo(this.routers, "sync", this.handleSync);
        this.listenTo(this.links, "sync", this.handleSync);
        d3.select(window).on("resize", this.resizeMap);
    },

    onRender: function() {
        this.initMap();
    },

    handleSync: function() {
        if(this.routers.data && this.links.data) {
            this.drawLinks();
            this.drawRouters();
        }
    },

    initializeVisualisation: function() {
        if(!this.projection) {
            this.projection = d3.geo.orthographic()
                .scale(this.scale)
                .translate([this.width / 2, this.height / 2])
                .clipAngle(this.clipAngle)
                .precision(this.precision);
        } else {
            this.projection.translate([this.width / 2, this.height / 2]);
        }

        this.geoZoomFunction = d3.geo.zoom()
            .projection(this.projection)
            .scaleExtent([this.projection.scale() * this.zoomMin,
                          this.projection.scale() * this.zoomMax])
            .on("zoom.redraw", _.bind(this.zoomRedraw, this));

        this.path = d3.geo.path()
            .projection(this.projection);

        this.graticule = d3.geo.graticule();
    },

    initMap: function() {
        this.svg = d3.select(this.el)
            .append("g")
            .attr("transform", "translate(" + this.margin.left +
                  "," + this.margin.top + ")");

        this.svg.append("defs").append("path")
            .datum({type: "Sphere"})
            .attr("id", "sphere")
            .attr("class", "globe")
            .attr("d", this.path)
            .on("mousedown.grab", this.onMouseGrab);

        this.svg.append("use")
            .attr("class", "stroke grabbable")
            .attr("xlink:href", "#sphere")
            .on("mousedown.grab", this.onMouseGrab);

        this.svg.append("use")
            .attr("class", "fill grabbable")
            .attr("xlink:href", "#sphere")
            .on("mousedown.grab", this.onMouseGrab);

        this.svg.append("path")
            .datum(this.graticule)
            .attr("class", "graticule grabbable")
            .attr("d", this.path)
            .on("mousedown.grab", this.onMouseGrab);
    },

    drawMap: function() {
        this.svg.insert("path", ".graticule")
            .datum(topojson.feature(this.world.data,
                                    this.world.data.objects.land))
            .attr("class", "land  grabbable")
            .attr("d", this.path)
            .on("mousedown.grab", this.onMouseGrab);

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
            .on("mousedown.grab", this.onMouseGrab);

        // Allow zoom and rotation of map
        this.svg.selectAll("path")
            .call(this.geoZoomFunction);
    },

    drawRouters: function() {
        this.routers.data.forEach(this.appendRouter);
    },

    drawLinks: function() {
        this.links.data.forEach(this.appendLink);
    },

    appendRouter: function(d) {
        this.svg.append("path")
            .datum({type: "Point", coordinates: [d.lng, d.lat], data: d})
            .attr("class", "router grabbable")
            .attr("d", this.path.pointRadius(this.circleRadius))
            .attr("fill", this.getRouterFill)
            .call(this.geoZoomFunction);
    },

    appendLink: function(d) {
        var leftPos = this.routers.coordinatesByLxcName[d.left];
        var rightPos = this.routers.coordinatesByLxcName[d.right];

        if(!leftPos || !rightPos) {
            // Invalid/unknown LXC name, no coordinates returned
            return;
        }

        var link = {
            type: "LineString",
            coordinates: [[leftPos.lng, leftPos.lat],
                          [rightPos.lng, rightPos.lat]]
        };

        this.svg.append("path")
            .datum(link)
            .attr("d", this.path)
            .attr("class", "link grabbable")
            .call(this.geoZoomFunction);
    },

    zoomRedraw: function() {
        if (d3.event.sourceEvent.preventDefault) {
            d3.event.sourceEvent.preventDefault();
        }

        this.svg.selectAll("path").attr("d", this.path);
    },

    resizeMap: function() {
        if(!this.svgWidth || !this.world.data) return;

        this.svg.remove();

        this.setDimensions();

        this.$el.attr("width", this.svgWidth);
        this.$el.attr("height", this.svgHeight);

        this.initializeVisualisation();
        this.initMap();
        this.drawMap();
        this.drawRouters();
    },

    onMouseGrab: function() {
        var path = d3.select(this).classed("grabbed", true);
        var w = d3.select(window)
            .on("mouseup.grab." + this.classList,
                function() {
                    path.classed("grabbed", false);
                    w.on("mouseup.grab", null);
                });
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
    },

    getRouterFill: function(d) {
        tier = d.data.tier
        if(tier === 0) return "chartreuse";
        if(tier === 1) return "red";
        if(tier === 2) return "orange";
        if(tier === 3) return "yellow";
        console.error("Invalid router tier:" + tier);
    }
});

module.exports = MapView;
