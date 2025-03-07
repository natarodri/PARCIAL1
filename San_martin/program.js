var map = L.map('map').setView([4.551923606760363, -74.10008874583308], 16);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

async function loadPolygon() {
    let myData = await fetch ("San_martin.geojson");
    let myPolygon = await myData.json();
    L.geoJSON (myPolygon,
    {
        style: {
            color: 'blue'
        }
    }
    ).addTo (map);
}

loadPolygon();

var myImage= ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
.filterDate("2024-01-01","2025-01-01")
.filterBounds (Map)
.sort("CLOUD_COVER")
.first();

var params = {
  bands:["SR_B4","SR_B3","SR_B2"],
  gamma:1.4, 
  min:0,
  max:30000
}
Map.addLayer(myImage,params,"Mi imagen")
Map.centerObject(map,12)

let btnNDVI= document.getElementById("btnNDVI");

btnNDVI.addEventListener('click',
    async ()=>{
        var ndvi = myImage.expression(
            "(NIR - Red) / (NIR + Red)", {
              "NIR": myImage.select("SR_B5"), // Banda infrarroja cercana
              "Red": myImage.select("SR_B4")  // Banda roja
          }).rename("NDVI");
          
          // Parámetros de visualización para NDVI
          var ndviViz = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
          
          // Agregar NDVI al mapa
          Map.addLayer(ndvi, ndviViz, "NDVI Landsat 9");
          
          // Visualizar la imagen en color natural
          var params = {
            bands: ["SR_B4", "SR_B3", "SR_B2"],
            min: 0,
            max: 5000, // Ajustar valores según la imagen
            gamma: 1.4
          };
          Map.addLayer(myImage, params, "Imagen Landsat 9");
          
          // Centrar el mapa
          Map.centerObject(map, 12);
    }
)
let btnSAVI = document.getElementById('btnSAVI');
btnSAVI.addEventListener('click',
    async ()=>{
        var L = 0.5;
        var savi = myImage.expression(
          "((NIR - Red) / (NIR + Red + L)) * (1 + L)", {
            "NIR": myImage.select("SR_B5"), // Banda infrarroja cercana
            "Red": myImage.select("SR_B4"), // Banda roja
            "L": L
        }).rename("SAVI");
        
        // Parámetros de visualización para SAVI
        var saviViz = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
        
        // Agregar SAVI al mapa
        Map.addLayer(savi, saviViz, "SAVI Landsat 9");
        
        // Visualizar la imagen en color natural
        var params = {
          bands: ["SR_B4", "SR_B3", "SR_B2"],
          min: 0,
          max: 5000, // Ajustar valores según la imagen
          gamma: 1.4
        };
        Map.addLayer(myImage, params, "Imagen Landsat 9");
        
        // Centrar el mapa
        Map.centerObject(map, 12);
    }
)
        
let btnsiniestros= document.getElementById("btnsiniestros");

btnsiniestros.addEventListener('click',
    async ()=>{
        let response= await fetch("siniestros_san_martin.geojson");
        let datos= await response.json();

        L.geoJSON(
            datos,
            {
                pointToLayer: (feature, latlong)=>{                    
                    return L.circleMarker(latlong,{
                        radius:5,
                        fillColor:'red',
                        weight:1,
                        opacity:1,
                        fillOpacity: 0.5,
                    })
                }
            }
        ).addTo(map);
    }
)