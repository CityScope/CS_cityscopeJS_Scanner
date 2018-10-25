import { keystoneMouse, keystoneKeys } from "./UI/KeyStoneUI";
import { MatrixTransform, scanArrayMaker } from "./CV/MatrixTransform";
import "./Storage";

////////////////////////////////////////////////////////////////////////////////////////////////////////
//save/load local storage
////////////////////////////////////////////////////////////////////////////////////////////////////////

///JSON load function
export function onFileLoad(loadEvent) {
  // updateInfoDIV( ("Trying to Load Setting JSON file...");
  var file = loadEvent.target.files[0];
  var reader = new FileReader();
  let res = reader.readAsText(file);
  reader.onload = function(e) {
    res = e.target.result;

    //store cityIOdataStruct in Storage
    var cityIOdataStruct = JSON.parse(res);
    //save settings file data into a local Storage location
    saveSettings("CityScopeJS_cityIOdataStruct", cityIOdataStruct);
    Storage.cityIOdataStruct = cityIOdataStruct;
    updateInfoDIV("loaded settings [JSON]...", cityIOdataStruct);

    initSequence();
  };
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

// start the actual keystone sequence
export function initSequence() {
  // than, if exists, load pos. settings from localStorage
  if (loadSettings("CityScopeJS_keystone")) {
    updateInfoDIV("found key stoning setup...Loading last key stone");

    //make the initial grid
    scanArrayMaker();
    // start the matrix transform with the keystone
    MatrixTransform(loadSettings("CityScopeJS_keystone"));
    //call the keystoning keyboard function
    keystoneKeys();
  } else {
    updateInfoDIV("no keystone was found, starting new one..");

    //make the initial grid
    scanArrayMaker();
    //save these keystone points to local storage
    keystoneMouse();
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

export var saveSettings = function(key, data) {
  updateInfoDIV("saving to localStorage in " + key + " key");
  //save to local storage
  localStorage.setItem(key, JSON.stringify(data));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////

//load settings if exist
export var loadSettings = function(key) {
  if (localStorage.getItem(key)) {
    var data = JSON.parse(localStorage.getItem(key));
    return data;
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////

export function setupSVG() {
  var camCanvas = Storage.camCanvas;

  // load the SVGcdn to var
  var svgCDN = "http://www.w3.org/2000/svg";
  //SVG setup for later viz.
  var svgDiv = document.createElement("div");
  document.body.appendChild(svgDiv);
  svgDiv.id = "svgDiv";
  svgDiv.width = camCanvas.width;
  svgDiv.height = camCanvas.height;
  svgDiv.className = "svgDiv";
  var svgKeystone = document.createElementNS(svgCDN, "svg");
  svgKeystone.id = "svgKeystone";
  svgKeystone.setAttributeNS(null, "width", camCanvas.width);
  svgKeystone.setAttributeNS(null, "height", camCanvas.height);
  svgDiv.appendChild(svgKeystone);

  return svgKeystone;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

export function svgLine(srcPt, dstPt) {
  var svgCDN = "http://www.w3.org/2000/svg";

  var line = document.createElementNS(svgCDN, "line");
  line.setAttributeNS(null, "x1", srcPt[0]);
  line.setAttributeNS(null, "y1", srcPt[1]);
  line.setAttributeNS(null, "x2", dstPt[0]);
  line.setAttributeNS(null, "y2", dstPt[1]);
  line.setAttributeNS(null, "stroke", "#f35790");
  line.setAttributeNS(null, "stroke-width", "1");
  return line;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function svgCircle(dstPt, fillCol, size, fillOp, strkCol, strkWidth) {
  var svgCDN = "http://www.w3.org/2000/svg";

  //display with SVG
  var scanPt = document.createElementNS(svgCDN, "circle");
  scanPt.setAttributeNS(null, "cx", dstPt[0]);
  scanPt.setAttributeNS(null, "cy", dstPt[1]);
  scanPt.setAttributeNS(null, "fill", fillCol);
  scanPt.setAttributeNS(null, "r", size);
  scanPt.setAttributeNS(null, "fill-opacity", fillOp);
  scanPt.setAttributeNS(null, "stroke", strkCol);
  scanPt.setAttributeNS(null, "stroke-width", strkWidth);

  return scanPt;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function svgText(dstPt, txt, size) {
  var svgCDN = "http://www.w3.org/2000/svg";

  var newText = document.createElementNS(svgCDN, "text");
  newText.setAttributeNS(null, "x", dstPt[0]);
  newText.setAttributeNS(null, "y", dstPt[1]);
  newText.setAttributeNS(null, "font-size", size);

  newText.innerHTML = txt;
  return newText;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//stats
export function stats() {
  var script = document.createElement("script");
  script.onload = function() {
    var stats = new Stats();
    document.body.appendChild(stats.dom);
    requestAnimationFrame(function loop() {
      stats.update();
      requestAnimationFrame(loop);
    });
  };
  script.src = "//rawgit.com/mrdoob/stats.js/master/build/stats.min.js";
  document.head.appendChild(script);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

export function makeInfoDiv() {
  //make info div
  let infoDiv = document.createElement("div");
  infoDiv.id = "infoDiv";
  infoDiv.className = "info";
  document.body.appendChild(infoDiv);
  return infoDiv;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//make info div [on screen console] or add text to it
export function UpdateinfoDiv(text) {
  var infoDiv = Storage.infoDiv;
  // clear div if too much text
  if (infoDiv.scrollHeight > 2000) {
    infoDiv.innerHTML = null;
  } else {
    infoDiv.innerHTML += text.toString() + "<p></p>";
    infoDiv.scrollTop = infoDiv.scrollHeight;
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function loadImg(src, width, height, classname) {
  var img = document.createElement("img");
  img.src = src;
  img.width = width;
  img.height = height;
  img.className = classname;
  // This next line will just add it to the <body> tag
  document.body.appendChild(img);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

export function setupWebCamCanvas() {
  //make vid canvas
  var camCanvas = document.createElement("canvas");

  camCanvas.id = "webcamCanvas";
  camCanvas.className = "webcamCanvas";

  //MUST keep full numbers [WIP]
  camCanvas.width = Math.floor(window.innerWidth);
  camCanvas.height = Math.floor(window.innerHeight);
  //
  camCanvas.style.zIndex = 0;
  camCanvas.style.position = "absolute";
  document.body.appendChild(camCanvas);
  return camCanvas;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// WEBCAM & MEDIA SETUP
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//setup the camera device
export function setupWebcam() {
  var camCanvas = setupWebCamCanvas();
  //store webcam canvas into class
  Storage.camCanvas = camCanvas;

  //get main canvas context for scanning
  var vidCanvas2dContext = camCanvas.getContext("2d");

  //Video loop setup call video mesh creator
  var width = 0;
  var height = 0;
  var video = document.createElement("video");
  //set auto play for video
  video.setAttribute("autoplay", true);
  video.addEventListener("loadedmetadata", function() {
    width = camCanvas.width;
    height = camCanvas.height;
    //call the video to canvas loop
    loop();
  });
  //get user webcam
  navigator.mediaDevices
    .getUserMedia({ audio: false, video: true })
    .then(function(stream) {
      if ("srcObject" in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream);
      }
      video.onloadedmetadata = video.play();
    })
    .catch(function(err) {
      updateInfoDIV(err.name + ": " + err.message);
    });

  //loop
  function loop() {
    vidCanvas2dContext.drawImage(video, 0, 0, width, height);

    //loop the video to canvas method
    requestAnimationFrame(loop);
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * makes infoDIV
 * @param {void}
 * @return {void}
 */
export function makeInfoDIV() {
  let infoDIV = document.createElement("div");
  infoDIV.className = "infoDIV";
  infoDIV.id = "infoDIV";
  document.body.appendChild(infoDIV);
  let bool = false;
  //listen to clicks
  infoDIV.addEventListener("click", function() {
    if (bool) {
      infoDIV.style.height = "8vw";
      infoDIV.style.width = "80vw";
      infoDIV.innerHTML = "";
    } else {
      infoDIV.style.height = "2vw";
      infoDIV.style.width = "2vw";
      infoDIV.innerHTML = "";
    }
    bool = !bool;
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Display on screen info in infoDIV
 * @param {string} value
 * @return {void}
 */
export function updateInfoDIV(value) {
  let infoDIV = document.querySelector("#infoDIV");
  if (infoDIV) {
    infoDIV.innerHTML += value;
    infoDIV.scrollTop = infoDIV.scrollHeight;
    if (infoDIV.childNodes[0].length > 1000) infoDIV.innerHTML = "";
  }
}
