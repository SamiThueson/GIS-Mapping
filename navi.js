require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/rest/locator",
    "esri/Graphic",
    "esri/rest/route",
    "esri/rest/support/RouteParameters",
     "esri/rest/support/FeatureSet"
    ], function(esriConfig,Map, MapView,locator, Graphic, route, RouteParameters, FeatureSet) {


    var key = config.SECRET_API_KEY;

    esriConfig.apiKey = key;

    const map = new Map({
      basemap: "arcgis-navigation" // Basemap layer service
    });

    const view = new MapView({
      container: "viewDiv", // Div element
      map: map,
      center: [-111.792, 43.825], //Longitude, latitude
      zoom: 13 // Zoom level
    });

    const places = ["Choose a place type...", "Parks and Outdoors", "Coffee shop", "Gas station", "Food", "Hotel"];

    const select = document.createElement("select","");
      select.setAttribute("class", "esri-widget esri-select");
      select.setAttribute("style", "width: 175px; font-family: 'Avenir Next W00'; font-size: 1em");

    places.forEach(function(p){
      const option = document.createElement("option");
      option.value = p;
      option.innerHTML = p;
      select.appendChild(option);
    });

    view.ui.add(select, "top-right");

    const locatorUrl = "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

   // Find places and add them to the map
   function findPlaces(category, pt) {
    locator.addressToLocations(locatorUrl, {
      location: pt,
      categories: [category],
      maxLocations: 25,
      outFields: ["Place_addr", "PlaceName"]
    })

    .then(function(results) {
      view.popup.close();
      view.graphics.removeAll();

      results.forEach(function(result){
        view.graphics.add(
          new Graphic({
            attributes: result.attributes,  // Data attributes returned
            geometry: result.location, // Point returned
            symbol: {
             type: "simple-marker",
             color: "#000000",
             size: "12px",
             outline: {
               color: "#ffffff",
               width: "2px"
             }
            },

            popupTemplate: {
              title: "{PlaceName}", // Data attribute names
              content: "{Place_addr}"
            }
         }));
      });

    });

  }

  // Search for places in center of map
  view.watch("stationary", function(val) {
    if (val) {
       findPlaces(select.value, view.center);
    }
    });

  // Listen for category changes and find places
  select.addEventListener('change', function (event) {
    findPlaces(event.target.value, view.center);
  });

  const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

    view.on("immediate-double-click", function(event){

      if (view.graphics.length === 0) {
        addGraphic("origin", event.mapPoint);
      } else if (view.graphics.length === 1) {
        addGraphic("destination", event.mapPoint);

        getRoute(); // Call the route service

      } else {
        view.graphics.removeAll();
        addGraphic("origin",event.mapPoint);
      }

    });

    function addGraphic(type, point) {
      const graphic = new Graphic({
        symbol: {
          type: "simple-marker",
          color: (type === "origin") ? "white" : "black",
          size: "8px"
        },
        geometry: point
      });
      view.graphics.add(graphic);
    }

    function getRoute() {
      const routeParams = new RouteParameters({
        stops: new FeatureSet({
          features: view.graphics.toArray()
        }),

        returnDirections: true

      });

      route.solve(routeUrl, routeParams)
        .then(function(data) {
          data.routeResults.forEach(function(result) {
            result.route.symbol = {
              type: "simple-line",
              color: [5, 150, 255],
              width: 3
            };
            view.graphics.add(result.route);
          });

          // Display directions
         if (data.routeResults.length > 0) {
           const directions = document.createElement("ol");
           directions.classList = "esri-widget esri-widget--panel esri-directions__scroller";
           directions.style.marginTop = "0";
           directions.style.padding = "15px 15px 15px 30px";
           const features = data.routeResults[0].directions.features;

           // Show each direction
           features.forEach(function(result,i){
             const direction = document.createElement("li");
             direction.innerHTML = result.attributes.text + " (" + result.attributes.length.toFixed(2) + " miles)";
             directions.appendChild(direction);
           });

          view.ui.empty("bottom-left");
          view.ui.add(directions, "bottom-left");

         }

        })

        .catch(function(error){
            console.log(error);
        })

    }

});