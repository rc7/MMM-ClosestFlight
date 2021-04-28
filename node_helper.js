// Helper for the MMM-ClosestFlight module
const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getADSB: function(url) {
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body).states; // parse JSON from OpenSky
				        //    console.log(result); // uncomment to see in terminal
                    this.sendSocketNotification('ADSB_RESULT', result);
            }
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_ADSB') {
            this.getADSB(payload);
        }
    }
});
