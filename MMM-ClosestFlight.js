/* MMM-ClosestFlight
 * Shows user the closest aircraft to their given location based upon
 * ADS-B data.
 * Thanks to @mykle1 for creating a template for new module developers.
 * By: RC7 2021
 */
Module.register("MMM-ClosestFlight", {
    // Default values - change as needed
    defaults: {
        header: "Nearest Aircraft", // Header text
        maxWidth: "250px",
        animationSpeed: 3000, // fade in and out speed
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 20000, // How often to update
        closestCallsignGlobal: "Loading...",
        closestDistanceGlobal: 9999,
        closestAltitudeGlobal: 9999,
        myLatitude: 35.4165, // Latitude of MagicMirror
        myLongitude: -80.8221, // Longitude of MagicMirror
        distanceUnits: "NM", // 'NM' for nautical miles, 'SM' for statute miles
        altitudeUnits: "FT", // 'FT' for feet or 'M' for meters
        boxLatitudeMin: 34.8020, // minimum latitude of the bounding box
        boxLongitudeMin: -82.4282, // minimum longitude of the bounding box
        boxLatitudeMax: 36.2900, // maximum latitude of the bounding box
        boxLongitudeMax: 78.1815 // maximum longtitude of the bounding box
    },

    getStyles: function() {
        return ["MMM-Closest.css"];
    },


    start: function() {
        Log.info("Starting module: " + this.name);
      //  requiresVersion: "2.1.0";

        // Get ADS-B data for aircraft within a defined box of airspace -
        // these are the aircraft that will be checked for closeness to
        // user provided point. In remote areas, consider increasing size
        // of BBOX. In busy airspace, a smaller box will provide better
        // performance.


        this.url = "https://opensky-network.org/api/states/all?lamin="
                    + this.config.boxLatitudeMin + "&lomin=" +
                    this.config.boxLongitudeMin + "&lamax="
                    + this.config.boxLatitudeMax + "&lomax=" +
                      this.config.boxLongitudeMax;
        //this.planesArray = [];
        this.scheduleUpdate();
    },

    getDom: function() {

		// Create a wrapper
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

		// Load
        if (!this.loaded) {
            wrapper.innerHTML = "Checking the airspace...";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

		// Create header
        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "light", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }


// Create divs to display the data
     var top = document.createElement("div");
     top.classList.add("list-row");

     var callsign = document.createElement("div");
      callsign.classList.add("xsmall", "stuff", "shape");
      callsign.innerHTML = "Callsign: " + this.closestCallsignGlobal;
      wrapper.appendChild(callsign);

     var dist = document.createElement("div");
      dist.classList.add("xsmall", "stuff", "date");
      dist.innerHTML = "Distance: " + this.closestDistanceGlobal + " " +
                        this.config.distanceUnits;
      wrapper.appendChild(dist);

     var altitude = document.createElement("div");
      altitude.classList.add("xsmall", "stuff", "cityState");
      altitude.innerHTML = "Altitude: " + this.closestAltitudeGlobal + " " +
                            this.config.altitudeUnits;
      wrapper.appendChild(altitude);

    return wrapper;

    }, 

    // helper function to calculate distances
    // M is SM, N is NM
     distance: function(lat1, lon1, lat2, lon2, unit) {
    	if ((lat1 == lat2) && (lon1 == lon2)) {
    		return 0; // Check for equal lat and long
    	}
    	else {
        // Calculate radians from lat/long
    		var radlat1 = Math.PI * lat1/180;
    		var radlat2 = Math.PI * lat2/180;
    		var theta = lon1-lon2;
    		var radtheta = Math.PI * theta/180;

        // do some magical math shit
    		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1)
                  * Math.cos(radlat2) * Math.cos(radtheta);
    		if (dist > 1) {
    			dist = 1;
    		}
    		dist = Math.acos(dist);
    		dist = dist * 180/Math.PI;
    		dist = dist * 60 * 1.1515;

        // Dist is calculated in SM
        // Convert to user requested unit
    		if (unit=="KM") {
          dist = dist * 1.609344;
          }
    		if (unit=="NM") {
          dist = dist * 0.8684;
          }
          return dist;
    	  }
        },

	// Processes the data (JSON) from OpenSky
    processADSB: function(data) {
     //   this.planesArray = data;
        //Variables for calculation
        var myLat = this.config.myLatitude;
        var myLong = this.config.myLongitude;
        var acLat, acLong, acCallsign;
        var minDistance = 1000; // set to 1000 by default
        var closestCallsign = "N/A";

        // for each aircraft in the BBOX
        for (i = 0; i < data.length; i++) {
          acCallsign = data[i][1];
          acLat = data[i][6];
          acLong = data[i][5];

        // calculate distance between aircraft and user defined lat/long
        var distanceToAircraft = this.distance(myLat, myLong, acLat, acLong,
                                  this.config.distanceUnits);

        // check if it's smaller than minDistance
        if (distanceToAircraft < minDistance) {
          minDistance = distanceToAircraft;
          closestCallsign = acCallsign;
          this.closestCallsignGlobal = acCallsign;
          this.closestDistanceGlobal = distanceToAircraft.toFixed(2);
          if (this.config.altitudeUnits == "FT") {
            this.closestAltitudeGlobal = Math.trunc(data[i][7] * 3.28084);//feet
            } else {
            this.closestAltitudeGlobal = Math.trunc(data[i][7]); // meters
            }
          }
      } // end for loop
      console.log("closest is: " + closestCallsign);
      this.loaded = true;
    },

    // Schedules the update
    scheduleUpdate: function() {
        setInterval(() => {
            this.getADSB();
        }, this.config.updateInterval);
        this.getADSB(this.config.initialLoadDelay);
        var self = this;
    },

	// Talks to the node_helper
    getADSB: function() {
        this.sendSocketNotification('GET_ADSB', this.url);
    },

	// When node_helper sends a notification, do something with it (process data and update DOM)
    socketNotificationReceived: function(notification, payload) {
        if (notification === "ADSB_RESULT") {
            this.processADSB(payload);
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
