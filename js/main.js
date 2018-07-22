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

//  visual grid array
var svgPntsArray = [];

// global var for colors returning from webworker
var pixelColArr = [];

//types and codes for cityIO objects
var typesArray = [];

///Cmpareable string to reduce sent rate
var oldTypesArrayStr;

// Global var for GUI controls
var brightness = 0;

// Global var for GUI controls
var contrast = 0;

//make vid canvas
var camCanvas = document.createElement("canvas");

//get main canvas context for scanning
var vidCanvas2dContext = camCanvas.getContext("2d");

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
  infoDiv("___________________________");
  //make the UI
  UI();
  //setup the scene
  setupCanvs();
  //call the media setup method at start
  setupMedia();
  webWorkerListen();
  infoDiv("Waiting for setting file [JSON]...");
}

///JSON load functinos
function onFileLoad(l) {
  infoDiv("Trying to Load Setting JSON file...");
  var file = l.target.files[0];
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
    // vizGrid();
    //at last, start sending to cityIO
    cityIOinit(sendRate);
  };
}

start();

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// WEBCAM & MEDIA SETUP
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function setupCanvs() {
  camCanvas.id = "webcamCanvas";
  camCanvas.className = "webcamCanvas";
  //MUST keep full numbers [WIP]
  camCanvas.width = Math.floor(window.innerHeight * 0.9);
  camCanvas.height = Math.floor(window.innerHeight * 0.9);
  camCanvas.style.zIndex = 0;
  camCanvas.style.position = "absolute";
  camCanvas.style.border = "1px solid";
  document.body.appendChild(camCanvas);

  //SVG setup for later viz.
  var svgDiv = document.createElement("div");
  document.body.appendChild(svgDiv);
  svgDiv.id = "svgDiv";
  svgDiv.width = camCanvas.width;
  svgDiv.height = camCanvas.height;
  svgDiv.className = "svgDiv";
  svgKeystone = document.createElementNS(svgCDN, "svg");
  svgKeystone.className = "svgDiv";
  svgKeystone.id = "svgKeystone";
  svgKeystone.setAttributeNS(null, "width", camCanvas.width);
  svgKeystone.setAttributeNS(null, "height", camCanvas.height);
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
    width = camCanvas.width;
    height = camCanvas.height;
    //apply mirror video
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
  //get user webcam
  navigator.mediaDevices
    .getUserMedia({ audio: false, video: true })
    .then(function(stream) {
      // Older browsers may not have srcObject
      if ("srcObject" in video) {
        video.srcObject = stream;
      } else {
        // Avoid using this in new browsers, as it is going away.
        video.src = window.URL.createObjectURL(stream);
      }
      video.onloadedmetadata = function(e) {
        video.play();
      };
    })
    .catch(function(err) {
      console.log(err.name + ": " + err.message);
    });

  //loop fn.
  function loop() {
    //loop the video to canvas method
    requestAnimationFrame(loop);
    //draw the image before applying filters
    //apply filter every frame !! COSTLY
    vidCanvas2dContext.drawImage(video, 0, 0, width, height);
    //draw the filter result to each frame
    brightnessCanvas(brightness, vidCanvas2dContext);
    contrastCanvas(contrast, vidCanvas2dContext);
  }
}

////////////////////
// Brightness fn. for canvas video. UI for input.
////////////////////
function brightnessCanvas(value, canvas) {
  // Get the pixel data
  var pixelData = canvas.getImageData(0, 0, camCanvas.width, camCanvas.height);
  var pixelDataLen = pixelData.data.length;
  for (var i = 0; i < pixelDataLen; i += 4) {
    pixelData.data[i] += value;
    pixelData.data[i + 1] += value;
    pixelData.data[i + 2] += value;
  }
  // Draw the data back to the visible canvas
  canvas.putImageData(pixelData, 0, 0);
}

////////////////////
// contrast fn.
////////////////////
function contrastCanvas(contrast, canvas) {
  var pixelData = canvas.getImageData(0, 0, camCanvas.width, camCanvas.height);
  //input range [-100..100]
  var pixelDataLen = pixelData.data.length;
  contrast = contrast / 100 + 1; //convert to decimal & shift range: [0..2]
  var intercept = 128 * (1 - contrast);
  for (var i = 0; i < pixelDataLen; i += 4) {
    //r,g,b,a
    pixelData.data[i] = pixelData.data[i] * contrast + intercept;
    pixelData.data[i + 1] = pixelData.data[i + 1] * contrast + intercept;
    pixelData.data[i + 2] = pixelData.data[i + 2] * contrast + intercept;
  }
  canvas.putImageData(pixelData, 0, 0);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////SCAN LOGIC ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// a function to make the initial generic array of
//evenly divided grid points before distorting
function scanArrayMaker(gridCols, gridRows) {
  var scanArrayPt = [];
  //get canvas ratio to divided by #-1 of points
  let ratX = camCanvas.width / (gridCols - 1);
  let ratY = camCanvas.height / (gridRows - 1);
  var gapInGrid = (0 * camCanvas.width) / 100;

  // let counter = 0;
  // let counter_inner = 0;

  for (let cols = 0; cols < camCanvas.height; cols += ratY * 4 + gapInGrid) {
    for (let rows = 0; rows < camCanvas.width; rows += ratX * 4 + gapInGrid) {
      //draw points if needed
      // svgKeystone.appendChild(
      //   svgCircle([rows, cols], "green", 3),
      //   svgText([rows, cols], counter, 15)
      // );

      for (let j = 0; j < ratY * 4; j += ratY) {
        for (let i = 0; i < ratX * 4; i += ratX) {
          //draw points if needed
          // svgKeystone.appendChild(
          //   svgText([rows + i, cols + j], counter_inner, 15),
          //   svgCircle([rows + i, cols + j], "green", 1)
          // );
          // counter_inner++;
          scanArrayPt.push([rows + i, cols + j]);
        }
      }
      // counter++;
    }
  }
  return scanArrayPt;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//create the scanning transposed matrix
function MatrixTransform(dstCorners) {
  // grid pixels size from settings
  var gridCols = cityIOdataStruct.header.spatial.ncols * 4;
  var gridRows = cityIOdataStruct.header.spatial.nrows * 4;

  //matrix Grid Location Array
  var matrixGridLocArray = [];
  // return a new visual Grid Locations Array
  let vizGridLocArray = scanArrayMaker(gridCols, gridRows);

  //set the reference points of the 4 edges of the canvas
  // to get 100% of the image/video in canvas
  //before distorting
  srcCorners = [
    getPos(camCanvas)[0],
    getPos(camCanvas)[1],
    camCanvas.width,
    getPos(camCanvas)[1],
    getPos(camCanvas)[0],
    camCanvas.height,
    camCanvas.width,
    camCanvas.height
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

  svgPntsArray = [];
  //distort each dot in the matrix to locations and make cubes
  for (let j = 0; j < vizGridLocArray.length; j++) {
    dstPt = perspT.transform(vizGridLocArray[j][0], vizGridLocArray[j][1]);
    //create visuals points on canvas for ref and add to array
    svgPntsArray.push(
      svgKeystone.appendChild(svgCircle(dstPt, "red", 1, 1, "#42adf4", 0.25))
    );
    //Optional: show text for each pixel
    // svgKeystone.appendChild(svgText(dstPt, j, 8));
    //push these locs to an array for scanning
    matrixGridLocArray.push([Math.floor(dstPt[0]), Math.floor(dstPt[1])]);
  }
  //send points to Color Scanner fn.
  ColorPicker(matrixGridLocArray);
  dstCorners = [];
  //info
  infoDiv(
    "table size: " +
      cityIOdataStruct.header.spatial.ncols +
      " x " +
      cityIOdataStruct.header.spatial.ncols
  );
  infoDiv("Matrix Transformed 4 corners are at: " + dstCorners);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
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

    //recursively call this method every frame
    requestAnimationFrame(function() {
      ColorPickerRecursive();
    });
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
function webWorkerListen() {
  // Get data back form WEBworker
  infoDiv("starting WebWorker listener...");
  CVworker.addEventListener(
    "message",
    function(e) {
      //get the WEBwroker msg and use
      //its 1st item for types
      typesArray = e.data[0];

      //get the WEBwroder msg and use
      //its 2nd item for viz the grid
      pixelColArr = e.data[1];
    },
    false
  );
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//controls the viz updating
function vizGridHandler() {
  requestAnimationFrame(vizGridHandler);
  renderVizGrid(pixelColArr, typesArray);
}

////
//color the visual grid base on the web-worker cv analysis
function renderVizGrid(pixelColArr, typesArray) {
  for (let i = 0; i < pixelColArr.length; i++) {
    let pixType = typesArray[Math.floor(i / 16)];
    if (pixType !== -1) {
      svgPntsArray[i].setAttribute("stroke", "#59d0ff");
      svgPntsArray[i].setAttribute("stroke-width", "1");
    } else {
      svgPntsArray[i].setAttribute("stroke", "");
      svgPntsArray[i].setAttribute("stroke-width", "0");
    }
    if (pixelColArr[i] === 2) {
      svgPntsArray[i].setAttribute("fill", "magenta");
      svgPntsArray[i].setAttribute("r", "2");
    } else if (pixelColArr[i] === 1) {
      svgPntsArray[i].setAttribute("fill", "black");
      svgPntsArray[i].setAttribute("r", "2");
    } else {
      svgPntsArray[i].setAttribute("fill", "white");
      svgPntsArray[i].setAttribute("r", "2");
    }
  }
}

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
  //test for new data, else don't send
  if (oldTypesArrayStr !== typesArray.toString()) {
    oldTypesArrayStr = typesArray.toString();
  } else {
    infoDiv("No changes to Grid data, pausing CityIO POST");
    return;
  }
  //make a copy of the cityIO struct for manipulation
  let cityIOpacket = JSON.parse(JSON.stringify(cityIOdataStruct));
  //get the grid property from the scanner
  cityIOpacket.grid = typesArray;
  //remove brick codes from sent packet
  delete cityIOpacket.objects.codes;

  //get table name from settings
  let cityIOtableName = cityIOpacket.header.name;
  let cityIOtableUrl =
    "https://cityio.media.mit.edu/api/table/update/" +
    cityIOtableName.toString();
  //send to cityIO
  fetch(cityIOtableUrl, {
    method: "POST",
    // mode: "no-cors", // fix cors issue
    body: JSON.stringify(cityIOpacket)
  })
    .then(
      response => handleErrors(response),
      infoDiv("cityIO table '" + cityIOtableName + "' uploaded at " + timeNow())
    )
    .catch(error => infoDiv(error));

  function handleErrors(response) {
    if (response.ok) {
      // infoDiv("cityIO response: " + response.ok);
    }
    return response;
  }

  //calc this current time
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
  //clear clicks array
  let clkArr = [];
  //turn on mag-glass efect
  magGlass();
  //collect 4 mouse clicks as corners of keystone
  document.addEventListener("click", mouseKeystone);

  // react to mouse events
  function mouseKeystone(e) {
    // only collect clicks that are in the canvas area
    if (e.x < camCanvas.width && e.y < camCanvas.height) {
      //pop. array of clicks
      clkArr.push(e.x, e.y);

      infoDiv("Mouse click " + clkArr.length / 2 + " at " + e.x + ", " + e.y);
      //viz points with svg
      svgKeystone.appendChild(
        svgCircle([e.x, e.y], "none", 10, 0, "magenta", "1")
      );

      // when 2x4 clicks were added
      if (clkArr.length == 8) {
        // svgKeystone.appendChild(
        //   svgLine([clkArr[0], clkArr[1]], [clkArr[2], clkArr[3]]),
        //   svgLine([clkArr[2], clkArr[3]], [clkArr[4], clkArr[5]]),
        //   svgLine([clkArr[4], clkArr[5]], [clkArr[6], clkArr[7]]),
        //   svgLine([clkArr[0], clkArr[1]], [clkArr[6], clkArr[7]])
        // );

        //save these keystone points to local storage
        saveSettings("CityScopeJS_keystone", clkArr);
        MatrixTransform(loadSettings("CityScopeJS_keystone"));

        //reset the clicks array
        clkArr = [];
        // and stop keystone mouse clicks
        document.removeEventListener("click", mouseKeystone);
      }
    }
  }
}

/////////////////////
/////////////////////
function magGlass() {
  //mouse
  $("html,body").css("cursor", "crosshair");
  //make gls div
  var glsDiv = document.createElement("div");
  glsDiv.id = "glsDiv";
  document.body.appendChild(glsDiv);
  //another canvas for magnifying glass
  var magGlassCanvas = document.createElement("canvas");
  // mag. glass
  glsDiv.appendChild(magGlassCanvas);
  magGlassCanvas.id = "magGlass";
  magGlassCanvas.className = "magGlassCanvas";
  let magWid = (magGlassCanvas.width = 200);
  magGlassCanvas.height = magWid;
  magGlassCanvas.style.zIndex = 1;
  let magGlassCtx = magGlassCanvas.getContext("2d");
  document.addEventListener("mousemove", function(e) {
    magGlassCtx.clearRect(0, 0, magWid, magWid);
    magGlassCtx.drawImage(
      camCanvas,
      e.pageX - magWid / 4,
      e.pageY - magWid / 4,
      camCanvas.width,
      camCanvas.width,
      0,
      0,
      camCanvas.width * 2,
      camCanvas.height * 2
    );
    magGlassCanvas.style.top = e.pageY - magWid / 2 + "px";
    magGlassCanvas.style.left = e.pageX - magWid / 2 + "px";
    magGlassCanvas.style.display = "block";
    magGlassCanvas.style.position = "absolute";
    magGlassCanvas.style.border = "2px black solid";
  });
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

function svgLine(srcPt, dstPt) {
  var line = document.createElementNS(svgCDN, "line");
  line.setAttributeNS(null, "x1", srcPt[0]);
  line.setAttributeNS(null, "y1", srcPt[1]);
  line.setAttributeNS(null, "x2", dstPt[0]);
  line.setAttributeNS(null, "y2", dstPt[1]);
  line.setAttributeNS(null, "stroke", "#f35790");
  line.setAttributeNS(null, "stroke-width", "1");
  return line;
}

function svgCircle(dstPt, fillCol, size, fillOp, strkCol, strkWidth) {
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
function svgText(dstPt, txt, size) {
  var newText = document.createElementNS(svgCDN, "text");
  newText.setAttributeNS(null, "x", dstPt[0]);
  newText.setAttributeNS(null, "y", dstPt[1]);
  newText.setAttributeNS(null, "font-size", size);

  newText.innerHTML = txt;
  return newText;
}

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
    if (d.scrollHeight > 2000) {
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
    contrast: 0,
    vis: false,
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
    },
    testTable: function() {
      window.open(
        "https://cityscope.media.mit.edu/CS_cityscopeJS/table/index.html?" +
          cityIOdataStruct.header.name,
        "_blank"
      );
    }
  };

  //upload settings
  gui.add(parm, "getJson").name("Start here: Load settings [JSON]");
  //or reset and restart
  gui.add(parm, "reset").name("Reset and clear Keystone");
  //toggle vis on camera
  gui
    .add(parm, "vis")
    .name("Toggle visual feedback")
    .onChange(function(e) {
      vizGridHandler(e);
    });
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

  //contrast control
  calibrateFolder
    .add(parm, "contrast", -100, 100)
    .name("contrast")
    .onChange(function(i) {
      contrast = i;
      contrastCanvas(i, vidCanvas2dContext);
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
  cityioFolder.add(parm, "settingsExample").name("View settings example");
  //link to raw settings
  cityioFolder.add(parm, "testTable").name("See resulting table");
  //cityIO link
  cityioFolder.add(parm, "rawCityIO").name("View raw API");
  //cityIO link
  cityioFolder.add(parm, "fe").name("View on cityIO Dashboard");
}

//stats
javascript: (function() {
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
})();
