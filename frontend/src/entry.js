var Backbone = require("backbone"),
    TorMap = require("./torMap"),
    // Controllers
    TorMapController = require("./controllers/torMapController");

TorMap.addInitializer(function () {
    window.TorMap = this;
});

// Controllers initializers
TorMap.addInitializer(function() {
    var torMapController = new TorMapController();
    TorMap.torMapController = torMapController;
    TorMap.torMapController.start();
});

TorMap.start();
