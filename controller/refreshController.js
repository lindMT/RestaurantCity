const sampleData = require("../sampleData/sampleData.js");

// UNCOMMENT TO LOAD REORDER POINT TRIGGER
// const reorderTrigger = require('../public/js/reorderTrigger.js');

// UNCOMMENT TO LOAD DATA
sampleData.addSamples();

const refreshController = {
    // for redirecting login and signup
    getRefresh: function(req, res) {
        return 0;
    },
    
}

module.exports = refreshController;