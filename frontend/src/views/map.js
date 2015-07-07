var $ = require("jquery"),
    _ = require("underscore"),
    Marionette = require("backbone.marionette"),
    d3 = require("d3"),
    topojson = require("topojson"),
    // This isn't a proper module, so don't use the geoZoom directly
    // as if it were. Instead, requiring the file will add the
    // d3.geo.zoom function to the existing d3 object
    geoZoom = require("../utils/d3.geo.zoom"),
    RelaysTooltipView = require("./relaysTooltip");

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
    zoomMax: 15,
    scale: 250,
    clipAngle: 90,
    precision: 0.1,
    circleRadius: 2,
    velocity: 0.005,

    initialize: function(options) {
        options = options || {};
        this.margin = options.margin || this.margin;
        this.selector = options.selector || ".map";
        this.world = options.worldData;
        this.relays = options.relaysData;
        this.tooltip = new RelaysTooltipView();
        this.initDate = Date.now();
        // Sorry about the global
        window.mapGrabbed = false;

        this.setDimensions();
        this.replaceElement();
        this.initializeVisualisation();

        this.resizeMap = _.debounce(this.resizeMap, 250);
        _.bindAll(this,
                  "redrawMap", "resizeMap", "appendRelay",
                  "getRelayFill", "handleRelayMouseover",
                  "handleRelayMouseout", "rotateMap");

        this.listenTo(this.world, "sync", this.drawMap);
        this.listenTo(this.relays, "sync", this.handleSync);
        d3.select(window).on("resize", this.resizeMap);
        d3.timer(this.rotateMap);
    },

    onRender: function() {
        this.initMap();
    },

    handleSync: function() {
        if(this.relays.data) {
            this.drawRelays();
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
            .scaleExtent([this.scale * this.zoomMin,
                          this.scale * this.zoomMax])
            .on("zoom.redraw", _.bind(this.redrawMap, this));

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

    drawRelays: function() {
        this.relays.data.forEach(this.appendRelay);
    },

    appendRelay: function(d) {
		var bw = d.observed_bw;
		var radius = 2;
		if(bw <= 1.0) {
			radius = 1;
		} else if (bw >= 10.0) {
			radius = 5;
		}
		pathFunc = this.path.pointRadius(radius);
        this.svg.append("path")
            .datum({type: "Point", coordinates: [d.lng, d.lat], data: d})
            .attr("class", "relay grabbable")
            //.attr("d", this.path.pointRadius(radius))
			.attr("d", pathFunc)
            .attr("fill", this.getRelayFill)
            .on("mouseover", this.handleRelayMouseover)
            .on("mouseout", this.handleRelayMouseout)
            .on("mousedown.grab", this.onMouseGrab)
            .call(this.geoZoomFunction);
    },

    redrawMap: function() {
        if(!this.svgWidth || !this.world.data) return;

        if (d3.event && d3.event.sourceEvent.preventDefault) {
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
        this.drawRelays();
    },

    rotateMap: function() {
        // End the animation as soon as the user grabs the map
        if(window.mapGrabbed) return true;

        var angle = this.velocity * (Date.now() - this.initDate);
        var rotate = [angle, 0, 0];
        this.projection.rotate(rotate);
        this.redrawMap();
    },

    onMouseGrab: function() {
        if(!window.mapGrabbed) {
            window.mapGrabbed = true;
        }

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

    getRelayFill: function(d) {
		var bw = d.data.observed_bw;
		// Change color based on observed BW.
		if(bw <= 1.0) {
			return "DarkOrange";
		} else if (bw >= 10.0) {
			return "Blue";
		} else {
			return "LightGreen";
		}
    },

    handleRelayMouseover: function(d) {
        this.tooltip.show(d.data);
    },

    handleRelayMouseout: function(d) {
        this.tooltip.hide();
    }
});

module.exports = MapView;
