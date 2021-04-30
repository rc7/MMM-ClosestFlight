# MMM-ClosestFlight
MagicMirror Module that displays the closest flight to a given point on Earth. Output distance can be in NM, KM, or SM. Altitude can be displayed in feet or meters. 

# Example
<img width="416" alt="Screen Shot 2021-04-29 at 5 45 25 PM (1)" src="https://user-images.githubusercontent.com/10154421/116622592-f59acb00-a912-11eb-83ff-932d0525adf0.png">

# Installation
Run the following commands:
`git clone https://github.com/rc7/MMM-ClosestFlight` into your `~/MagicMirror/modules` directory.

`npm install` inside your `~/MagicMirror/modules/MMM-ClosestFlight` directory.

The module finds the nearest aircraft by comparing aircraft Lat/Long against the lat/long that you provide (typically wherever you have installed your mirror). To get the lat/long of your location:
1) Open google maps. Find the location of your mirror.
2) Right click. The latitude and longitude will be displayed.
3) Copy those into the appropriate fields (myLatitude and myLongitude) in the `config.js`. Only 4 decimal places of precision are necessary (ex: XX.XXXX).

You will also need to provide your own bounding-box coordinates in the form of minimum latitude/longitude and maximum latitude/longitude. The bounding-box is a geographical area surrounding the location of your mirror. The module works by comparing locations of all aircraft inside of the bounding-box to the mirror location. You can make the bounding-box as big or as small as you'd like. If you are in a remote area with little nearby air traffic, you probably want a bigger box. Conversely, if you are nearby a large airport, a smaller box will work just fine. Use the same steps with Google Maps to get the coordinates for your bounding-box, and copy them into `config.js` in the `boxLatitudeMin`, `boxLatitudeMax`, `boxLongitudeMin`, and `boxLongitudeMax` fields as appropriate. 

# Add to your config.js
```{
  module: "MMM-ClosestFlight",
  position: "top_left",
  config: {
        myLatitude: 35.2295, // Latitude of MagicMirror
        myLongitude: -80.8431, // Longitude of MagicMirror
        distanceUnits: "NM", // 'NM' for nautical miles, 'SM' for statute miles
        altitudeUnits: "FT", // 'FT' for feet or 'M' for meters
        boxLatitudeMin: 34.8020, // minimum latitude of the bounding box
        boxLongitudeMin: -82.4282, // minimum longitude of the bounding box
        boxLatitudeMax: 36.2900, // maximum latitude of the bounding box
        boxLongitudeMax: 78.1815 // maximum longtitude of the bounding box
        maxWidth: "250px",
        animationSpeed: 3000, // Fade in/out speed on update
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 20000 // How often to update
	}
},`
