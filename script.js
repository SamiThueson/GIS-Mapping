require(["esri/config","esri/Map", "esri/views/MapView", "esri/widgets/BasemapToggle",
"esri/Graphic",
"esri/layers/GraphicsLayer",
"esri/rest/locator"
], function (esriConfig, Map, MapView, BasemapToggle, Graphic, GraphicsLayer, locator) {

    var key = config.SECRET_API_KEY;

    esriConfig.apiKey = key;

    const map = new Map({
      basemap: "arcgis-topographic" // Basemap layer service
    });

    const view = new MapView({
      map: map,
      center: [-111.792, 43.825], // Longitude, latitude
      zoom: 13, // Zoom level
      container: "viewDiv" // Div element
    });

    const basemapToggle = new BasemapToggle({
        view: view,
        nextBasemap: "arcgis-imagery"
     });

    view.ui.add(basemapToggle,"bottom-right");

    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    const point = { //Create a point
        type: "point",
        longitude: -111.792824,
        latitude: 43.825386
     };
     const simpleMarkerSymbol = {
        type: "simple-marker",
        color: [226, 119, 40],  // Orange
        outline: {
            color: [255, 255, 255], // White
            width: 1
        }
     };

     const popupTemplate = {
        title: "{Name}",
        content: "{Description}"
     }
     const attributes = {
        Name: "Graphic",
        Description: "I am a dot"
     }

     const pointGraphic = new Graphic({
        geometry: point,
        symbol: simpleMarkerSymbol,

        attributes: attributes,
        popupTemplate: popupTemplate
     });
     graphicsLayer.add(pointGraphic);

    // Create a polygon geometry
    const polygon = {
        type: "polygon",
        rings: [
            [-111.786580, 43.821783], //Longitude, latitude
            [-111.781133, 43.821737], //Longitude, latitude
            [-111.781035, 43.819759], //Longitude, latitude
            [-111.778222, 43.819659], //Longitude, latitude
            [-111.778218, 43.811618],  //Longitude, latitude
            [-111.786509, 43.811625]  //Longitude, latitude

        ]
    };

    const simpleFillSymbol = {
        type: "simple-fill",
        color: [227, 139, 79, 0.7],  // Orange, opacity 70%
        outline: {
            color: [255, 255, 255],
            width: 1
        }
    };

    const byuiPopup = {
        title: "BYU-Idaho",
        content: "It's a university"
     }
     const attri = {
        Name: "BYU-Idaho",
        Description: "Brigham Young University-Idaho is locate in Rexburg, Idaho"
     }

    const polygonGraphic = new Graphic({
        geometry: polygon,
        symbol: simpleFillSymbol,

        attributes: attri,
        popupTemplate: byuiPopup

    });
    graphicsLayer.add(polygonGraphic);

    

  });