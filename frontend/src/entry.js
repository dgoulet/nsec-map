var Backbone = require("backbone"),
    NsecMap = require("./nsecMap"),
    // Controllers
    NsecMapController = require("./controllers/nsecMapController");

NsecMap.addInitializer(function () {
    window.NsecMap = this;
});

// Controllers initializers
NsecMap.addInitializer(function() {
    var nsecMapController = new NsecMapController();
    NsecMap.nsecMapController = nsecMapController;
    NsecMap.nsecMapController.start();
});

NsecMap.start();
