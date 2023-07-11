//tile layers

//default map
var defaultMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//grayscale
var grayscale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

//terrain
var terrain = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 16,
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});

//watercolor
var watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
});





//Make basemap object
let basemaps = {
    Grayscale: grayscale,
    Terrain: terrain,
    Watercolor: watercolor,
    Default: defaultMap
};

//map object
var myMap = L.map("map", {
    center: [36.7783, -119.4179],
    zoom: 3,
    layers: [defaultMap, grayscale, terrain, watercolor]
});

//add default map
defaultMap.addTo(myMap);



//tectonic plates
let tectonicplates = new L.layerGroup();
//call plates api
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
    .then(function(plateData){
        L.geoJson(plateData,{
            color: "red",
            weight: 1
        }).addTo(tectonicplates);
    });

//add plates layer
tectonicplates.addTo(myMap);


//create earthquake layer
let earthquakes = new L.layerGroup();
//call earthquake api
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
    .then(
        //color of circles
        function(earthquakeData){
            function dataColor(depth){
                if (depth > 90)
                    return "#eb4334";
                else if(depth > 70)
                    return "#eb8c34";
                else if(depth > 50)
                    return "#ebcd34";
                else if(depth > 30)
                    return "#e5eb34";
                else if(depth > 10)
                    return "#77eb34";
                else
                    return "#34ebeb";
            }

            //size of circles
            function radiusSize(mag){
                if (mag == 0)
                    return 1; //shows 0 mag
                else
                    return mag * 5; //makes circle bigger
            }

            //style for circles
            function dataStyle(feature)
            {
                return {
                    opacity: 1,
                    fillOpacity: 1,
                    fillColor: dataColor(feature.geometry.coordinates[2]),
                    color: "black",
                    radius: radiusSize(feature.properties.mag),
                    weight: 0.5,
                    stroke: true
                }
            }

            //add data to earthquake layer
            L.geoJson(earthquakeData, {
                pointToLayer: function(feature, latLng) {
                    return L.circleMarker(latLng);
                },
                
                style: dataStyle,

                //pop ups
                onEachFeature: function(feature, layer){
                    layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                                    Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                                    Location: <b>${feature.properties.place}</b>`);
                }

                

            }).addTo(earthquakes);
    });

    earthquakes.addTo(myMap);


//create overlays
let overlays = {
    "Tectonic Plates": tectonicplates,
    "Earth Quakes": earthquakes
};

L.control
    .layers(basemaps, overlays)
    .addTo(myMap);

// styl legend
let legend = L.control({
    position: "bottomright"
});

//add legend
legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let intervals = [-10,10,30,50,70,90];
    let colors = [
        "#34ebeb",
        "#77eb34",
        "#e5eb34",
        "#ebcd34",
        "#eb4334"
    ];


    for(var i = 0; i < intervals.length; i++){
        div.innerHTML += "<i style='background: "
            + colors[i]
            + "'></i> "
            + invervals[i]
            + (invervals[i + 1] ? "km &ndash km;" + intervals[i + 1] + "km<br>" : "+");
    }

    return div;

};

legend.addTo(myMap);