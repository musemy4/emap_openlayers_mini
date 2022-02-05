import 'ol/ol.css';
import './index_ol.css';

import {Feature, Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZSource from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';

import {defaults, MousePosition} from 'ol/control';
import { createStringXY } from 'ol/coordinate';

//geojson 지도 위에 그리기
import GeoJSON from 'ol/format/GeoJson';
import Draw from 'ol/interaction/Draw';

//geojson 클릭해서 emap 뜨게
import Select from 'ol/interaction/Select';


//emap그리기(정적이미지)
import ImageLayer from 'ol/layer/Image';
import Projection from 'ol/proj/Projection';
import Static from 'ol/source/ImageStatic';
import {getCenter} from 'ol/extent';
import { pointerMove } from 'ol/events/condition';

import {Icon, Stroke, Style} from 'ol/style';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';

function printMapLayers(when){
  console.log("=== "+when+" ===");
  console.log(map.getLayers().array_);
  if(map.getLayers().array_[1]!=undefined)console.log(map.getLayers().array_[1].getSource().getFeatures());
}


/////////////////////////////////////
///////    JUST GET COORDS   ////////
/////////////////////////////////////


let mousePositionCtrl = new MousePosition({
    coordinateFormat: createStringXY(4),
    projection: 'EPSG:4326',
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
    undefinedHTML: '&nbsp;'
});




////////////////////////////////////////////////////////////////////
/////////////////////  D U M M Y   D A T A  ////////////////////////
////////////////////////////////////////////////////////////////////

// 예시 DATA,  ./example.json 과 같은 내용
let statesData = {"type":"FeatureCollection","features":[
  
  {
    "type":"Feature",
    "properties":{
      "name":"innodep", 
      "id": "126.891435", 
      "floor": {
        "1f":[
          {
            "id":"126d891435e1f1",
            "name":"1f north parking",
            "rotatProp":1,
            "coordinate":[50,160]
          },
          {
            "id":"126d891435e1f2",
            "name":"1f safefy stairway",
            "rotatProp":4,
            "coordinate":[190,210]
          },
          {
            "id":"126d891435e1f3",
            "name":"1f main entrance1",
            "rotatProp":2,
            "coordinate":[250,330]
          }
            ],
        "2f":[
          {
            "id":"126d891435e2f1",
            "name":"",
            "rotatProp":15,
            "coordinate":[130,360]
          },
          {
            "id":"126d8914352f2",
            "name":"",
            "rotatProp":2,
            "coordinate":[730,580]
          }
            ],
        "3f":[
          {
            "id":"126d891435e3f1",
            "name":"",
            "rotatProp":5,
            "coordinate":[220,580]
          },
          {
            "id":"126d891435e3f2",
            "name":"",
            "rotatProp":9,
            "coordinate":[160,290]
          },
          {
            "id":"126d891435e3f3",
            "name":"",
            "rotatProp":12,
            "coordinate":[500,60]
          }
            ],
        "4f":[
          {
            "id":"126d891435e3f1",
            "name":"",
            "rotatProp":15,
            "coordinate":[150,10]
          },
          {
            "id":"126d891435e3f2",
            "name":"",
            "rotatProp":18,
            "coordinate":[370,280]
          },
          {
            "id":"126d891435e3f3",
            "name":"",
            "rotatProp":18,
            "coordinate":[350,105]
          },
          {
            "id":"126d891435e3f3",
            "name":"",
            "rotatProp":2,
            "coordinate":[500,105]
          }
            ]
      }
    },
    "geometry":{
      "type":"Polygon",
      "coordinates":[
        [
          [126.891435,37.48619],[126.891189,37.485871],[126.891671,37.485641],[126.891924,37.485943],[126.891435,37.48619]
        ]
      ]
    }
  },
 
 
  {"type":"Feature","properties":{"name":"Ace techno tower1","id": "126.893265", "floor": {"1f": []}},"geometry":{"type":"Polygon","coordinates":[[[126.893265,37.486373],[126.892916,37.485931],[126.893393,37.485662],[126.893517,37.485786],[126.893426,37.485841],[126.893581,37.486011],[126.89371,37.485965],[126.89379,37.486118],[126.893265,37.486373]]]}},
  {"type":"Feature","properties":{"name":"Ace techno tower3","id": "126.893254", "floor": {"1f":[]}},"geometry":{"type":"Polygon","coordinates":[[[126.893254,37.484785],[126.893055,37.484522],[126.89297,37.484581],[126.892905,37.484458],[126.892927,37.484364],[126.893302,37.48419],[126.893544,37.484011],[126.893699,37.484228],[126.893528,37.484304],[126.893688,37.484577],[126.893254,37.484785]]]}},
  {"type":"Feature","properties":{"name":"E&C Venture Dreamtower2","id": "126.892776", "floor": {"1f":[]}},"geometry":{"type":"Polygon","coordinates":[[[126.892776,37.487105],[126.892562,37.486786],[126.893291,37.48642],[126.893544,37.486744],[126.893281,37.486858],[126.89335,37.486935],[126.893098,37.48702],[126.893039,37.486973],[126.892776,37.487105]]]}},
  
]};


////////////////////////////////////////////////////////////////////
///////////////////// D E F A U L T   S E T ////////////////////////
////////////////////////////////////////////////////////////////////


let createBtn = document.getElementById('createBtn');

window.addEventListener('DOMContentLoaded', function(){ //실행될 코드
  document.getElementById('emapPop').style.display = 'none';
  //emap draw 리스너 달아주기
  // createBtn.addEventListener("click", function(e){
  //   e.stopPropagation();
  //   createDraw();
  // });
  createBtn.addEventListener("click", createDraw);
  
  printMapLayers("키자마자");
});

//ESC로 emap을 닫을수 있다
window.onkeyup = function(e) {
  let key = e.keyCode ? e.keyCode : e.which;
  
	if(key == 27) {
    closeEmapPop();
	}
}



const base = new TileLayer({
  source: new XYZSource({
    url: 'http://xdworld.vworld.kr:8080/2d/Base/202002/{z}/{x}/{y}.png'
  })
})


let emapJson = new VectorSource({
  features: new GeoJSON().readFeatures(statesData)
});


let emapjsonLayer  = new VectorLayer({
  source: emapJson
});

let map = new Map({
  controls: defaults().extend([mousePositionCtrl]),
  target: 'mapid',
  layers: [ base, emapjsonLayer],
  view: new View({
    center: [126.892509, 37.485506],
    zoom: 18,
    projection: 'EPSG:4326' //4326 좌표계의 경위도로 그리겠다 (통플은 5179를 씀)
  })
});



////////////////////////////////////////////////////////////////////
///////////////////// D E F A U L T   S E T ////////////////////////
////////////////////////////////////////////////////////////////////

let draw;

function cancelDraw(){
  createBtn.removeEventListener("click", cancelDraw);
  createBtn.addEventListener("click", createDraw);

  map.removeInteraction(draw);
  console.log("draw End ==");
  createBtn.innerHTML="Emap을 만들자";
  createBtn.style.backgroundColor='brown';
}

//'EMAP을 만들자'버튼을 누르면
function createDraw(){
    createBtn.innerHTML="만들기 취소";
    createBtn.style.backgroundColor='darkturquoise';

    createBtn.removeEventListener("click", createDraw);
    createBtn.addEventListener("click", cancelDraw);

    addInteraction();
}

let source = new VectorSource({ wrapX: false });

//draw.on('drawend') 보다 확실하다
source.on('addfeature', function(evt){
  if(saveNewEmap(evt)){//true이면
    console.log("new map added!");
    printMapLayers();
    draw_ing = false;
  }
})



let vector;
let draw_ing = false;

function addInteraction() {
  //source에 그려진 값을 담는다
  draw = new Draw({
      source: source,
      type: 'Polygon'
  });

  map.addInteraction(draw);
  
  
  draw.on('drawstart', function(evt){
    console.log("== draw Start");
    draw_ing = true;
  })
  
  draw.on('drawend', cancelDraw);
  
}
  
function saveNewEmap(evt){
  let feature = evt.feature;
  let uniqueId = feature.getGeometry().flatCoordinates[0]+"";//임으로 하긴했음
  let emapName = prompt("이름을 무엇으로 저장하시겠습니까?", "e-map의 새이름");

  //////////// emapName이 통과되어야 true //////////////
  if(emapName != null && emapName.length > 0 ){ 
    feature.setProperties({'name':emapName, 'id': uniqueId});//'assets'는 자산관리를 눌렀을때 setProperties하기
    // *** 기본 layer를 지우고 1)
    map.removeLayer(map.getLayers().array_[1]);
  
    let features = [];
    features.push(feature); //새로 만들어진 feature을 담고 1)
   
    // + 원래 있던것과 합쳐준다 2)
    new GeoJSON().readFeatures(statesData).forEach((ele)=>features.push(ele));
    
    // = 결과값
    statesData =JSON.parse(new GeoJSON().writeFeatures(features));
    
    vector = new VectorLayer({
      title : 'vector', 
      source: new VectorSource({
        features: new GeoJSON().readFeatures(statesData)
      })
    });
    
    // *** map에 추가한다 2)
    map.addLayer(vector);

    alert("emap에 저장됩니다:: "+emapName);
    return true;
  } else {
    alert("유효하지 않은 이름입니다!");
    source.removeFeature(feature);
    return false;
  }
}




/////////////////////////////////////////////////////////////
///////    select Features : 선택과 hover가 가능하게  ////////
////////////////////////////////////////////////////////////


// hover 효과내기
let pointerselect = new Select({
  condition: pointerMove
});

let changeInteraction = function () {
  if (pointerselect !== null) {
    map.removeInteraction(pointerselect);
  }
  map.addInteraction(pointerselect);
};

/**
 * onchange callback on the select element.
 */
changeInteraction();

//클릭했을때 팝업으로 연동
let selected;
let selectedEmap;

map.on('singleclick', function(e){
  e.stopPropagation();
  if(selected != null){ //있으면 null처리해주고 
    selected = null;
  }

  map.forEachFeatureAtPixel(e.pixel, function(f){
    selected = f;
    return true;
  })

  
  if(selected!=null && !draw_ing){ //drawing이 끝났으면 interaction 겹치는거 막아줌**
    selectedEmap = selected.values_;
    popEmap(selectedEmap);
  }

})

////////////////////////////////////////////////////////////////////
/////////////////////    E M A P   S E T    ////////////////////////
////////////////////////////////////////////////////////////////////

let extent = [0, 0, 1000, 600];
let projection = new Projection({
  code: 'xkcd-image',
  units: 'pixels',
  extent: extent,
  worldExtent: extent
});

let emap = new Map({
  layers: [
    // new ImageLayer({
    //   source: new Static({
    //     attributions: '© <a href="http://xkcd.com/license.html">xkcd</a>',
    //     url: 'https://imgs.xkcd.com/comics/online_communities.png',
    //     projection: projection,
    //     imageExtent: extent,
    //     wrapX: false,
    //   }),
    // })
  ],
  target: 'emapid',
  view: new View({
    // projection: projection,
    projection: projection,
    center: getCenter(extent),
    zoom: 3,
    maxZoom: 4,
    minzoom:3
  }),
});

let emapLayer;  // 1.emap의 jpg, png 혹은 svg 파일
let lineLayer;  // 2.모눈종이 효과.. 100단위로 
let assetLayer; // 3.자산표현


function getEmap(coordinateX, floor){
  
  if(emapLayer!=null){
    emap.removeLayer(emapLayer);
  }
  if(lineLayer!=null){
    emap.removeLayer(lineLayer);
  }
  if(assetLayer!=null){
    emap.removeLayer(assetLayer);
  }

  if(floor==undefined){
    document.querySelector('.exp').style.display = "block";
    return;
  }
 //////////////// 1.emap의 jpg, png 혹은 svg 파일  //////////////////
  
 let emapUrl='';
  //여기서 오류가 나지만 api화 되면 오류나지 않을것~~
  //이건 임의에요
  if(coordinateX==126.891435) emapUrl = "./emap/" + coordinateX +"_"+floor+".svg";
  else emapUrl = "./emap/" + coordinateX +"_"+floor+".jpg";
  
  emapLayer = new ImageLayer({
    source: new Static({
      url: emapUrl,
      projection: projection,
      imageExtent: extent
    })
  });
  
  emap.addLayer(emapLayer);



  //////////////// 2.모눈종이 효과.. 100단위로  //////////////////


  let lineStyle = [
    new Style({
      stroke: new Stroke({
        color: '#d12710',
        width: 1,
        lineDash: [4,8]
      })
    })
  ];

  // var extent = [0, 0, 1000, 800];
  let lines = []; //features
  let wid = extent[2];
  let hei = extent[3]
  let interval = 100;

  for(let i=0;i<=parseInt(hei/interval);i++){//가로줄
    let f = new Feature({geometry: new LineString([[interval*-2, i*interval], [(wid+2*interval), i*interval]])})
    lines.push(f);
  }
  
  for(let j=0;j<=parseInt(wid/interval);j++){//세로줄
    let f = new Feature({geometry: new LineString([[(j*interval), interval*-2], [(j*interval), (hei+2*interval)]])})
    lines.push(f);
  }

  lineLayer = new VectorLayer({
    source: new VectorSource({
      features: lines
    })
  });

  lineLayer.setStyle(lineStyle); //레이어 전체에 적용
  emap.addLayer(lineLayer);



  


  //////////////// 3.자산표현  //////////////////
  getFloorAsset(floor);

}

function getFloorAsset(floorNow){
  // console.log(floorNow);

  // var extent = [0, 0, 1000, 800];
  let floors = selectedEmap.floor;
  // console.log(floors);  
  // console.log(floor+"f에는");
  // console.log(floors[floor+"f"].length);
  // console.log(floors[floor+"f"].length+"개의 자산이있습니다");
  let assets = [];

  for(let i=0;i<floors[floorNow+"f"].length;i++){//자산 갯수만큼돌리쟈
    let f = new Feature({geometry: new Point(floors[floorNow+"f"][i].coordinate)});

    //각각 다른 스타일을 가진다. 예를들면 rotation
    // console.log(floors[floor+"f"][i].rotatProp);
    f.setStyle(createAssetStyle(floors[floorNow+"f"][i].rotatProp));
    assets.push(f);
  }
  
  assetLayer = new VectorLayer({
    source: new VectorSource({
      features: assets,
    })
  });

  emap.addLayer(assetLayer);
}

function createAssetStyle(rotatProp){
  return new Style({
    image: new Icon({
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: 'marker/asset.svg',
      rotation: Math.PI/rotatProp,
      size: [500, 500],
      scale: 0.1
    }),
  });

}


///////////////////////EMAP DRAGGABLE//////////////////////////

function dragElement(elmnt) { 
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0; // 해당 기능 전체에서 사용할 변수를 초기화 합니다. 
  elmnt.onmousedown = dragMouseDown; // 요소를 마우스로 눌렀을 경우 dragMouseDown()을 실행 시키게 됩니다 

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  } 

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
    elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';

  } 

  function closeDragElement() {
    document.onmouseup = null; //onmouseup을 초기화시킴
    document.onmousemove = null; //onmouseup을 초기화시킴
    // console.log("현재 요소의 위치 y는 "+pos3+", x는 "+pos4+"::");
  } 

}

//////////////////////////////////////////////////////////

let emapDelete_flag= false;
// let selectedId;
// let selectedBuildin;

function emapClose(){
  let emapPop = document.querySelector('#emapPop');
  emapPop.style.display="none";
}

function popEmap(selectedEmap){ // 1)
  //드래그 가능하게 처리
  document.querySelectorAll('.popup').forEach((ele)=>{
    dragElement(ele);
  })

  console.log(selectedEmap); //{geometry: Polygon, name: "innodep", id: "126.891435", floor: {…}}
  let selectedEmapId = selectedEmap.id;
  console.log("선택된 emap IDD:"+selectedEmapId);
  let selectedEmapName =  selectedEmap.name;
  let selectedEmapfloor =  selectedEmap.floor;
  let title = document.querySelector('#emapPopTitle');



  if(!emapDelete_flag){
    document.getElementById('emapDeleteBtn').addEventListener("click", function(e){
        // e.stopPropagation();
        // e.preventDefault();
        e.stopImmediatePropagation();
        emapDelete();
    });
  }
 
  let emapPop = document.querySelector('#emapPop');
  emapPop.style.display="block";
  let emapCloseBtn = document.querySelector('#emapCloseBtn');
  emapCloseBtn.onclick=emapClose;
  
  // 기존에 있던 층버튼들을 다 없앤다
  let floorBtn = document.getElementById('floorBtn');
  while(floorBtn.hasChildNodes()){
    floorBtn.removeChild(floorBtn.firstChild);
  }

  document.querySelectorAll('.editFloorFile').forEach((ele)=>{
    ele.addEventListener("click", function(e){
      e.stopImmediatePropagation();
      popEmapSettingPop();
    }) 
  });

  if(selectedEmapfloor==undefined){
    getEmap(selectedEmapId, undefined); 
    title.innerHTML = `[층정보없음]  ${selectedEmapName} / <span id="selectedId">${selectedEmapId}</span>`;
  
  
  } else {
    //emap 층에 해당하는 그림으로 갈아치기
    getEmap(selectedEmapId, 1); 

    document.querySelector('.exp').style.display = "none";
    
    let floorLength = Object.keys(selectedEmapfloor).length;
    console.log(floorLength+"개 층입니다.");

    for(let i=0; i<floorLength;i++){
      let btn = document.createElement('button');
      btn.innerHTML= (i+1)+'F';
      btn.className = 'floors';
      if(i==0)btn.className+= ' floor_in';
      floorBtn.appendChild(btn);
    }

    //리스너 달아주기
    document.querySelectorAll('#floorBtn button').forEach((ele, idx)=>{
      ele.addEventListener('click', function(e){
        e.stopPropagation();
        console.log((idx+1));
        changeFloorOnEmap((idx+1));
      });
    })
    title.innerHTML = `[<span id='floor'>1F</span>] ${selectedEmapName} / <span id="selectedId">${selectedEmapId}</span>`;
    // title.innerHTML = '['+selectedId+'] '+getName+"/"+floor+"층 자산"+assets+"개";
  }
}

///////////////////////////////////////
//////////// EMAP SETTIN POP //////////
///////////////////////////////////////

let emapSettingPop = document.querySelector('#emapSettingPop');

function popEmapSettingPop(){
  emapSettingPop.style.display = "block";
  document.querySelector("#emapSettinPopCloseBtn").addEventListener('click', closeEmapSettingPop);
}

function closeEmapSettingPop(){
  emapSettingPop.style.display = "none";

}

function changeFloorOnEmap(floor){
  
  document.querySelectorAll('#floorBtn button').forEach((ele,idx)=>{
    ele.className = 'floors'; //초기화하고
    if(idx == (floor-1))ele.className+= ' floor_in';
  })

  document.getElementById('floor').innerHTML = floor+"F";
  //emap url 바꿔주기
  getEmap(selectedEmap.id, floor);

}




//////////////////////////////////
///////    EMAP Delete    ////////
//////////////////////////////////

function emapDelete(){//geometry == 해당 id
  let selectedEmapId = selectedEmap.id;
  console.log(selectedEmapId);
  printMapLayers("지우기전");
  let deleteConfirm = prompt('좌표에 등록된 emap을 삭제하시려면 관리자 비밀번호를 입력하세요','');

  if(deleteConfirm =='1234'){ //확인 누르면 true 반환
    alert('emap이 삭제되었습니다');
    //map 정보를 바꾼다
    // *** 기본 layer를 지우고 1)
    map.removeLayer(map.getLayers().array_[1]);
    
  
    let features = [];
 
    // + 원래 있던것과 합쳐준다
    new GeoJSON().readFeatures(statesData).forEach((ele, idx)=>{
      if(selectedEmapId!=ele.values_.id){
        console.log(idx+")"+ele.values_.id);  
        features.push(ele);
      }
    });
 
  
    statesData =JSON.parse(new GeoJSON().writeFeatures(features));
    
    vector = new VectorLayer({
      title : 'vector', 
      source: new VectorSource({
        features: new GeoJSON().readFeatures(statesData)
      })
    });
    
    // *** map에 추가한다 2)
    map.addLayer(vector);
    console.log("---------------------");
  }
  printMapLayers("지웠당");

  emapclose();//창 자동으로 닫기

}











