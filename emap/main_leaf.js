import * as L from 'leaflet';
import 'leaflet-draw';
import './index_leaf.css';

// 예시 DATA
let statesData = {"type":"FeatureCollection","features":[
    {"type":"Feature","properties":{"name":"innodep","id": 0},"geometry":{"type":"Polygon","coordinates":[[[126.891435,37.48619],[126.891189,37.485871],[126.891671,37.485641],[126.891924,37.485943],[126.891435,37.48619]]]}},
    {"type":"Feature","properties":{"name":"Ace techno tower1","id": 1},"geometry":{"type":"Polygon","coordinates":[[[126.893265,37.486373],[126.892916,37.485931],[126.893393,37.485662],[126.893517,37.485786],[126.893426,37.485841],[126.893581,37.486011],[126.89371,37.485965],[126.89379,37.486118],[126.893265,37.486373]]]}},
    {"type":"Feature","properties":{"name":"Ace techno tower3","id": 2},"geometry":{"type":"Polygon","coordinates":[[[126.893254,37.484785],[126.893055,37.484522],[126.89297,37.484581],[126.892905,37.484458],[126.892927,37.484364],[126.893302,37.48419],[126.893544,37.484011],[126.893699,37.484228],[126.893528,37.484304],[126.893688,37.484577],[126.893254,37.484785]]]}},
    {"type":"Feature","properties":{"name":"E&C Venture Dreamtower2","id": 3},"geometry":{"type":"Polygon","coordinates":[[[126.892776,37.487105],[126.892562,37.486786],[126.893291,37.48642],[126.893544,37.486744],[126.893281,37.486858],[126.89335,37.486935],[126.893098,37.48702],[126.893039,37.486973],[126.892776,37.487105]]]}},
]};



///////////////////////////////////////
////////////  Main M A P  /////////////
///////////////////////////////////////


let mymap = L.map('mapid').setView([37.485816, 126.891628], 18);
    mymap.attributionControl.setPrefix('');
    L.tileLayer('http://xdworld.vworld.kr:8080/2d/Base/202002/{z}/{x}/{y}.png', {
        // id: 'mapbox/light-v9', //배경으로 깔리는 이미지
        attribution: '@Vworld',
        minZoom: 1,
        maxZoom: 19
    }).addTo(mymap);

let drawnItems = new L.FeatureGroup();
console.log(drawnItems);
mymap.addLayer(drawnItems);

///////////////////drawtools///

let drawControl = new L.Control.Draw({
    draw: {
        polygon: true,
        // circlemarker: false,
        // polyline: false,
        // circle: false,
        // marker: false,
        // rectangle: false
    },
    edit: {
        featureGroup: drawnItems
    }
});

mymap.addControl(drawControl);

///drawtools/////////////////////


mymap.on('draw:created', function (e) {
    let type = e.layerType,
    layer = e.layer;

    //방금쌔로 그려진것
    let newGeojson = layer.toGeoJSON();
    newGeojson.properties.id = "temp";
  
    if(saveNewEmap(newGeojson)){
        statesData.features.push(newGeojson);
    }

    function saveNewEmap(newGeojson){

        let emapName = prompt("이름을 무엇으로 저장하시겠습니까?", "e-map의 새이름");

        if(emapName != null && emapName.length > 0){
            //properties추가하기
            newGeojson.properties.name = emapName;
            newGeojson.properties.id = 'tmpID';

            alert("emap에 저장됩니다:: "+emapName);
            // map의 레이어에 add 해주자 >> statesData가 달라져서 자동적으로 추가
            // drawnItems.addLayer(layer);
 
            return true;
        } else {
            alert("유효하지 않은 이름입니다!");
            return false;
        }
    }


    //다시부팅해줍시다-2
    geojson = L.geoJson(statesData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(mymap);
    
});

const popup = L.popup();

////////////////////////////////////
////////////  E M A P  /////////////
////////////////////////////////////


let emap = L.map('emapid', {
    crs: L.CRS.Simple,
    minZoom: -5
});

let bounds = [[0,0], [600,800]];
let image = L.imageOverlay("./uqm_map_full.png", bounds).addTo(emap);
let assets = L.layerGroup();

function getEmap(coordinateX){
    //url 바꿔주기
    if(image){
        emap.removeLayer(image);
    }
  
    let emapUrl = "/emap/" + coordinateX +".jpg";
    image = L.imageOverlay(emapUrl, bounds);
    emap.addLayer(image);

    let asset1 = L.marker([175.5, 188]);
    let asset2 = L.marker([280, 286]);

    let asset3 = L.marker([306,98.5]);
    let asset4 = L.marker([151, 43]);
    let asset5 = L.marker([395, 205.5]);

    //자산바꿔주기
    if(assets){
        emap.removeLayer(assets);
    }
    
    if(coordinateX == 126.891435){
        assets = L.layerGroup([asset1, asset2]);
        emap.addLayer(assets);
    } else if (coordinateX == 126.893254){
        assets = L.layerGroup([asset3, asset4, asset5]);
        emap.addLayer(assets);
    }
}

//EMAP도 좌표를 갖는다 보시라!
function onMapClick(e) {
  console.log(e.latlng);
}
emap.on('click', onMapClick);

// 좌표 표시 가능
emap.setView( [400, 100], 1); //귀퉁이에서 보여줌


function popEmap(geometry){ // 1)
// function popEmap(e){
    getEmap(geometry.coordinates[0][0][0]);
    let emapPop = document.querySelector('#emapPop');
    emapPop.style.display="block";
    let emapPopClose = document.querySelector('#emapPopClose');
    emapPopClose.onclick=emapPopclose;

    // let geometry = e.target.feature.geometry;

    let title = document.querySelector('#emapPop_title');
    // title.innerHTML = name;
}


function emapPopclose(){
    let emapPop = document.querySelector('#emapPop');
    emapPop.style.display="none";
}

function clickedPopup(e) {

    let geometry = e.target.feature.geometry;
    let properties = e.target.feature.properties;

    popup
    .setLatLng(e.latlng)
    .setContent("<a class='pops'>"+properties.id+") "+properties.name+"의 EMAP 가기</a>")
    .openOn(mymap);

    let pops = document.querySelector('.pops');
    
    //이벤트 버블링 막음
    pops.addEventListener("click", function(e){
        e.stopPropagation();
        popEmap(geometry);
    });

}


/////////////////////////////////////////
////////////  E M A P - end /////////////
/////////////////////////////////////////

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: clickedPopup
    });
}

//data에 있는 내용들에 active되는 건물들

let geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(mymap);

function style(feature) { 
    return {
        fillColor: '#366536',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function highlightFeature(e) {
    let layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

    
