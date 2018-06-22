/*/////////////////////////////////////////////////////////////////////////////////////////////////////////

{{ CityScopeJS }}
Copyright (C) {{ 2018 }}  {{ Ariel Noyman }}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

/////////////////////////////////////////////////////////////////////////////////////////////////////////

CityScopeJS -- decoding 2d array of black and white LEGO bricks, parsing and sending to remote server.
"@context": "https://github.com/CityScope/", "@type": "Person", "address": {
"@type": "75 Amherst St, Cambridge, MA 02139", "addressLocality":
"Cambridge", "addressRegion": "MA",}, 
"jobTitle": "Research Scientist", "name": "Ariel Noyman",
"alumniOf": "MIT", "url": "http://arielnoyman.com", 
"https://www.linkedin.com/", "http://twitter.com/relno",
https://github.com/RELNO]

*/ ///////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//Global VARS
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// web-worker
const CVworker = new Worker("js/CVwebworker.js");

// POST to cityIO rate in MS
var sendRate = 1000;

// make visual grid representation
var vizGridArray = [];

// global var for colors returning from webworker
var pixelColArr = [];

//types and codes for cityIO objects
var typesArray = [];

// Global var for GUI controls
var brightness = 0;

//make vid canvas
var webcamCanvas = document.createElement("canvas");

//get main canvas context for scanning
var vidCanvas2dContext = webcamCanvas.getContext("2d");

//cityIO timer
var cityIOtimer;

//SVG element for keystone matrix
var svgKeystone;

// load the SVGcdn to var
var svgCDN = "http://www.w3.org/2000/svg";

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var cityIOdataStruct;

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// APP LOGIC ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

async function start() {
  //init info div
  infoDiv();
  infoDiv("starting CityScopeJS applet");
  //make the UI
  UI();
  //setup the scene
  setupCanvs();
  //call the media setup method at start
  setupMedia();
}

///JSON load functinos
function onFileLoad(l) {
  infoDiv("Setting JSON file...Loading...");
  var file = event.target.files[0];
  var reader = new FileReader();
  let res = reader.readAsText(file);
  reader.onload = function(e) {
    res = e.target.result;
    cityIOdataStruct = JSON.parse(res);
    infoDiv("found settings [JSON]...");

    infoDiv("loaded cityIO struct: " + cityIOdataStruct.toString());
    //send the table settings once to WW for init
    CVworker.postMessage(["cityIOsetup", cityIOdataStruct]);
    // than, if exists, load settings from localStorage
    if (loadSettings("CityScopeJS_keystone")) {
      infoDiv("found keystoning setup...Loading prev. keystoning");
      MatrixTransform(loadSettings("CityScopeJS_keystone"));
      //and make div for viz feedback
    } else {
      infoDiv(">> Start by setting up keystone");
      keystoneUI();
    }
    //make viz grid
    vizGrid();
    //at last, start sending to cityIO
    cityIOinit(sendRate);
  };
}

start();

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// WEBCAM & MEDIA SETUP
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function setupCanvs() {
  webcamCanvas.id = "webcamCanvas";
  webcamCanvas.className = "webcamCanvas";
  //org. 960x720
  webcamCanvas.width = Math.floor(window.innerHeight * 0.95);
  webcamCanvas.height = Math.floor(window.innerHeight * 0.95);
  webcamCanvas.style.zIndex = 0;
  webcamCanvas.style.position = "absolute";
  webcamCanvas.style.border = "1px solid";
  document.body.appendChild(webcamCanvas);

  //SVG setup for later viz.
  var svgDiv = document.createElement("div");
  document.body.appendChild(svgDiv);
  svgDiv.id = "svgDiv";
  svgDiv.width = webcamCanvas.width;
  svgDiv.height = webcamCanvas.height;
  svgDiv.className = "svgDiv";
  svgKeystone = document.createElementNS(svgCDN, "svg");
  svgKeystone.className = "svgDiv";
  svgKeystone.setAttributeNS(null, "width", webcamCanvas.width);
  svgKeystone.setAttributeNS(null, "height", webcamCanvas.height);
  svgDiv.appendChild(svgKeystone);
}

////////////////////////////////////////////////////////////////////////////////////////////////
//setup the camera device
function setupMedia(mirrorVid) {
  ////////////////////
  // video setup
  ////////////////////

  infoDiv("starting video");
  //Video loop setup
  // call video mesh creator
  var width = 0;
  var height = 0;
  var video = document.createElement("video");
  video.addEventListener("loadedmetadata", function() {
    width = webcamCanvas.width;
    height = webcamCanvas.height;

    if (mirrorVid) {
      vidCanvas2dContext.translate(width, 0);
      vidCanvas2dContext.scale(-1, 1);
    }
    //call the video to canvas loop
    loop();
  });
  //set auto paly video
  video.setAttribute("autoplay", true);
  window.vid = video;

  //get the webcam stream
  navigator.getUserMedia(
    { video: true, audio: false },
    function(stream) {
      video.srcObject = stream;
      track = stream.getTracks()[0];
    },
    function(e) {
      infoDiv("Webcam issue!" + e);
    }
  );
  function loop() {
    //loop the video to canvas method
    requestAnimationFrame(loop);
    //draw the image before applying filters
    //apply filter every frame !! COSTLY
    vidCanvas2dContext.drawImage(video, 0, 0, width, height);
    //draw the filter result to each frame
    brightnessCanvas(brightness, vidCanvas2dContext);
  }
}

// Brightness fn. for canvas video. UI for input.
function brightnessCanvas(value, canvas) {
  // Get the pixel data
  var pixelData = canvas.getImageData(
    0,
    0,
    webcamCanvas.width,
    webcamCanvas.height
  );
  var pixelDataLen = pixelData.data.length;
  for (var i = 0; i < pixelDataLen; i += 4) {
    pixelData.data[i] += value;
    pixelData.data[i + 1] += value;
    pixelData.data[i + 2] += value;
  }
  // Draw the data back to the visible canvas
  canvas.putImageData(pixelData, 0, 0);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////SCAN LOGIC ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//create the scanning transposed matrix
function MatrixTransform(dstCorners) {
  // grid pixels size from settings
  var gridSize = cityIOdataStruct.header.spatial.ncols * 4;
  infoDiv(
    "table size: " +
      cityIOdataStruct.header.spatial.ncols +
      " x " +
      cityIOdataStruct.header.spatial.ncols
  );

  // a function to make an initial array of
  //evenly divided grid points to scan
  function scanArrayMaker() {
    var vizGridLocArray = [];
    //get point in certain ratio
    //to width divided by # of points
    let ratioX = webcamCanvas.width / gridSize;
    let ratioY = webcamCanvas.height / gridSize;
    for (let i = 0; i < webcamCanvas.width; i += ratioX) {
      for (let j = 0; j < webcamCanvas.height; j += ratioY) {
        vizGridLocArray.push([i + ratioX / 2, j + ratioY / 2]);
      }
    }
    return vizGridLocArray;
  }

  infoDiv("Matrix Transformed 4 corners are at: " + dstCorners);
  //matrix Grid Location Array
  var matrixGridLocArray = [];
  // return a new visual Grid Locations Array
  let vizGridLocArray = scanArrayMaker();

  //set the reference points of the 4 edges of the canvas
  // to get 100% of the image/video in canvas
  //before distorting
  srcCorners = [
    getPos(webcamCanvas)[0],
    getPos(webcamCanvas)[1],
    webcamCanvas.width,
    getPos(webcamCanvas)[1],
    getPos(webcamCanvas)[0],
    webcamCanvas.height,
    webcamCanvas.width,
    webcamCanvas.height
  ];

  //method to get div position
  function getPos(el) {
    // yay readability
    for (
      var lx = 0, ly = 0;
      el != null;
      lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent
    );
    return [lx, ly];
  }

  //var for the distorted points
  let dstPt;
  // use perspT lib to calculate transform matrix
  //and store the results of the 4 points dist. in var perspT
  let perspT;
  perspT = PerspT(srcCorners, dstCorners);

  //distort each dot in the matrix to locations and make cubes
  for (let j = 0; j < vizGridLocArray.length; j++) {
    dstPt = perspT.transform(vizGridLocArray[j][0], vizGridLocArray[j][1]);
    //display with SVG
    var scanPt = document.createElementNS(svgCDN, "circle");
    scanPt.setAttributeNS(null, "cx", dstPt[0]);
    scanPt.setAttributeNS(null, "cy", dstPt[1]);
    scanPt.setAttributeNS(null, "r", 1);
    scanPt.setAttributeNS(null, "fill", "#f07");
    svgKeystone.appendChild(scanPt);
    //push these locs to an array for scanning
    matrixGridLocArray.push([Math.floor(dstPt[0]), Math.floor(dstPt[1])]);
  }
  ColorPicker(matrixGridLocArray);
  dstCorners = [];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ColorPicker(matrixGridLocArray) {
  infoDiv("starting pixel scanner");

  // call a looping method that scans the grid
  // [this is a hack, so this function could be called
  // using  'requestAnimationFrame' API]
  ColorPickerRecursive();
  // inside recursive function
  function ColorPickerRecursive() {
    window.cancelAnimationFrame;
    // empty color array for web-worker
    let scannedColorsArray = [];
    // read all pixels from canvas
    let pixelArray = vidCanvas2dContext.getImageData(
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );
    //get the pixels
    let pixelData = pixelArray.data;
    for (let i = 0; i < matrixGridLocArray.length; i++) {
      // get the pixel location at the center of the grid cell div
      // and match it to the pixel location in the PixelBuffer linear list
      /*            
            +----------------------+
            |0     ||3     ||6     |
            |      ||prev. ||      |
            |      ||pixel ||      |
            +----------------------+
            +----------------------+
            |1     ||4     ||7     |
            |      ||this  ||      |
            |      ||pixel ||      |
            +----------------------+
            +----------------------+
            |2     ||5     ||8     |
            |      ||next  ||      |
            |      ||pixel ||      |
            +----------------------+
            */

      pixLoc =
        (matrixGridLocArray[i][1] * innerWidth + matrixGridLocArray[i][0]) * 4;
      // sample and push to array 3 pixels around to get better recognition
      scannedColorsArray.push(
        //pixel before
        [
          pixelData[pixLoc - 4],
          pixelData[pixLoc - 3],
          pixelData[pixLoc - 2],
          //this  pixel
          pixelData[pixLoc],
          pixelData[pixLoc + 1],
          pixelData[pixLoc + 2],
          //next pixel
          pixelData[pixLoc + 4],
          pixelData[pixLoc + 5],
          pixelData[pixLoc + 6]
        ]
      );
    }
    //in every frame, send the scanned colors to web-worker for CV operation
    CVworker.postMessage(["pixels", scannedColorsArray]);

    //recursively call this method
    requestAnimationFrame(function() {
      ColorPickerRecursive();
    });
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//create viz. grid to show scanning results
function vizGrid() {
  //get grid size for viz from settings
  var gridSize = cityIOdataStruct.header.spatial.ncols * 4;

  // make the grid div parent
  $("<DIV/>", {
    id: "vizCellDivParent",
    class: "vizCellDivParent"
  }).appendTo("body");
  //drag-able
  $("#vizCellDivParent").draggable();

  // make the visual rep of the now distorted grid
  for (let i = 0; i < gridSize; i++) {
    var vizRawsDiv = document.createElement("div");
    vizRawsDiv.className = "vizRawsDiv";
    vizCellDivParent.appendChild(vizRawsDiv);
    for (let j = 0; j < gridSize; j++) {
      var vizCell = document.createElement("div");
      vizCell.className = "vizCell";
      vizRawsDiv.appendChild(vizCell);
      //cell sized in viz grid
      let cellDims =
        (document.documentElement.clientWidth / gridSize / 4).toString() + "px";
      vizCell.style.width = cellDims;
      vizCell.style.height = cellDims;

      // get the divs to array
      vizGridArray.push(vizCell);
    }
  }
}

//color the visual grid base on the web-worker cv analysis
function updateVizGrid() {
  for (let i = 0; i < vizGridArray.length; i++) {
    if (pixelColArr[i] == 0) {
      vizGridArray[i].style.background = "white";
    } else if (pixelColArr[i] == 1) {
      vizGridArray[i].style.background = "black";
    } else {
      //if color scanning is in the threshold area
      vizGridArray[i].style.background = "magenta";
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Get data back form WEBworker
infoDiv("setting up webworker listener");
CVworker.addEventListener(
  "message",
  function(e) {
    //get the WEBwroder msg and use its 1st item for types
    typesArray = e.data[0];

    //get the WEBwroder msg and use its 2nd item for viz the grid
    pixelColArr = e.data[1];
    updateVizGrid(pixelColArr);
  },
  false
);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//cityIO
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// method to get the scanned data, look for matching brick 'types'
// and send the results back to cityIO server for other apps to use

function cityIOinit(sendRate) {
  cityIOtimer = window.setInterval("cityIOpost()", sendRate);
}

function cityIOstop() {
  clearInterval(cityIOtimer);
}

function cityIOpost() {
  //send to cityIO
  cityIOdataStruct.grid = typesArray;

  //get table name from settings
  let cityIOtableName = cityIOdataStruct.header.name;
  let cityIOtableUrl =
    "https://cityio.media.mit.edu/api/table/update/" +
    cityIOtableName.toString();

  fetch(cityIOtableUrl, {
    method: "POST",
    mode: "no-cors", // fix cors issue
    body: JSON.stringify(cityIOdataStruct)
  })
    .then(
      response => handleErrors(response),
      infoDiv("cityIO table '" + cityIOtableName + "' uploaded at " + timeNow())
    )

    .catch(error => infoDiv(error));

  function handleErrors(response) {
    if (response.ok) {
      infoDiv("cityIO response: " + response.ok);
    }
    return response;
  }

  //calc this time
  function timeNow() {
    var d = Date.now();
    return new Date(d);
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////UI + INTERACTION /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function keystoneUI() {
  infoDiv(
    "starting keystone" +
      "<p>" +
      "NOTE: make sure to select the croners of the scanned area in this order: TOP-LEFT->TOP-RIGHT->BOTTOM-LEFT->BOTTOM-RIGHT"
  );
  magGlass("on");
  let clickArray = [];

  //clear prev. svg contanier
  $(svgKeystone).empty();

  //collect 4 mouse clicks as corners of keystone
  document.addEventListener("click", mouseKeystone);

  // react to mouse events
  function mouseKeystone(e) {
    // only collect clicks that are in the canvas area
    if (e.x < webcamCanvas.width && e.y < webcamCanvas.height) {
      //pop. array of clicks
      clickArray.push(e.x, e.y);
      infoDiv(
        "Mouse click " + clickArray.length / 2 + " at " + e.x + ", " + e.y
      );
      //viz points with svg
      var keystonePt = document.createElementNS(svgCDN, "circle");
      keystonePt.setAttributeNS(null, "cx", e.x);
      keystonePt.setAttributeNS(null, "cy", e.y);
      keystonePt.setAttributeNS(null, "r", 8);
      keystonePt.setAttributeNS(null, "stroke", "#00b7f9");
      keystonePt.setAttributeNS(null, "stroke-width", "2");
      keystonePt.setAttributeNS(null, "fill-opacity", "0");
      svgKeystone.appendChild(keystonePt);
      // when 2x4 locations were added
      if (clickArray.length >= 8) {
        magGlass("off");
        //save these keystone points to local storage
        saveSettings("CityScopeJS_keystone", clickArray);
        MatrixTransform(loadSettings("CityScopeJS_keystone"));

        //reset the clicks array
        clickArray = [];
        // and stop keystone mouse clicks
        document.removeEventListener("click", mouseKeystone);
      }
    }
  }
}

function magGlass(bool) {
  //another canvas for magnifying glass
  var magGlassCanvas = document.createElement("canvas");
  // mag. glass [WIP - should remove when off]
  document.body.appendChild(magGlassCanvas);
  if (bool == "off") {
    console.log("off");
    ctx = magGlassCanvas.getContext("2d");
    ctx.clearRect(0, 0, magGlassCanvas.width, magGlassCanvas.height);
    //remove whrn off
  } else {
    magGlassCanvas.id = "magGlass";
    magGlassCanvas.className = "magGlassCanvas";
    let magWid = (magGlassCanvas.width = 100);
    magGlassCanvas.height = magWid;
    magGlassCanvas.style.zIndex = 100;
    let magGlassCtx = magGlassCanvas.getContext("2d");
    //
    document.addEventListener("mousemove", function(e) {
      $("html,body").css("cursor", "crosshair");
      magGlassCtx.clearRect(0, 0, magWid, magWid);
      magGlassCtx.drawImage(
        webcamCanvas,
        e.pageX - magWid / 16,
        e.pageY - magWid / 16,
        100,
        100,
        0,
        0,
        webcamCanvas.width,
        webcamCanvas.height
      );
      magGlassCanvas.style.top = e.pageY - magWid / 2 + "px";
      magGlassCanvas.style.left = e.pageX - magWid / 2 + "px";
      magGlassCanvas.style.display = "block";
      magGlassCanvas.style.position = "absolute";
      magGlassCanvas.style.border = "2px black solid";
    });

    document.addEventListener("mouseout", function() {
      magGlassCanvas.style.display = "none";
    });
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//save/load local storage
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var saveSettings = function(key, data) {
  infoDiv("saving to localStorage in " + key + "key");
  //save to local storage
  localStorage.setItem(key, JSON.stringify(data));
};
//load settings if exist
var loadSettings = function(key) {
  if (localStorage.getItem(key)) {
    var data = JSON.parse(localStorage.getItem(key));
    return data;
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//make info div [on screen console] or add text to it
function infoDiv(text) {
  let d = document.getElementById("infoDiv");
  if (d === null) {
    //make info div
    $("<DIV/>", {
      id: "infoDiv",
      class: "info"
    }).appendTo("body");
    $("#infoDiv").draggable();
  } else {
    // clear div if too much text
    if (d.scrollHeight > 5000) {
      d.innerHTML = null;
    } else {
      d.innerHTML += text.toString() + "<p></p>";
      d.scrollTop = d.scrollHeight;
    }
  }
  return;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// GUI
function UI() {
  // dat.GUI
  var gui = new dat.GUI({ width: 400 });

  parm = {
    mirror: false,
    brightness: 0,
    getJson: function() {
      document.getElementById("my_file").click();
      $("#my_file").change(function(e) {
        onFileLoad(e);
      });
    },
    sendRate: 1000,
    //test on cityIO
    fe: function() {
      window.open("https://cityio.media.mit.edu/", "_blank");
    },

    rawCityIO: function() {
      window.open(
        "https://cityio.media.mit.edu/api/table/" +
          cityIOdataStruct.header.name,
        "_blank"
      );
    },
    reset: function() {
      localStorage.clear();
      infoDiv("clearing and reseting");
      location.reload(true);
    },
    settingsExample: function() {
      window.open(
        "https://github.com/CityScope/CS_cityscopeJS/blob/master/data/settings.json",
        "_blank"
      );
    }
  };

  //upload settings
  gui.add(parm, "getJson").name("Load settings file [JSON]");
  //new calibrate folder
  var calibrateFolder = gui.addFolder("webcam");
  // webcam mirror
  calibrateFolder
    .add(parm, "mirror")
    .name("mirror webcam")
    .onChange(function() {
      let bool;
      bool = !bool;
      setupMedia(bool);
    });

  //brightness control
  calibrateFolder
    .add(parm, "brightness", -100, 100)
    .name("brightness")
    .onChange(function(i) {
      brightness = i;
      brightnessCanvas(i, vidCanvas2dContext);
    });

  var cityioFolder = gui.addFolder("cityIO");

  //cityio send rate
  cityioFolder
    .add(parm, "sendRate", 250, 2000)
    .step(250)
    .name("cityIO send [ms]")
    .onChange(function(d) {
      sendRate = d;
      cityIOstop();
      cityIOinit(sendRate);
    });

  //link to raw settings
  cityioFolder.add(parm, "settingsExample").name("Get settings example");
  //cityIO link
  cityioFolder.add(parm, "rawCityIO").name("View raw API");
  //cityIO link
  cityioFolder.add(parm, "fe").name("View in cityIO dataviz");

  gui.add(parm, "reset").name("Reset and clear Keystone");
}
