/////////////////////////////////////////////////////////////////////////////////////////////////////////
/* 
CityScopeJS -- decoding 2d array of black and white lego bricks and sending to remote server.
"@context": "https://github.com/CityScope/", "@type": "Person", "address": {
"@type": "75 Amherst St, Cambridge, MA 02139", "addressLocality":
"Cambridge", "addressRegion": "MA",}, 
"jobTitle": "Research Scientist", "name": "Ariel Noyman",
"alumniOf": "MIT", "url": "http://arielnoyman.com", 
"https://www.linkedin.com/", "http://twitter.com/relno",
https://github.com/RELNO]

/////////////////////////////////////////////////////////////////////////////////////////////////////////

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

*/

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

//another canvas for magnifying glass
var magGlassCanvas = document.createElement("canvas");

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

var cityIOtableSettings;

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// APP LOGIC ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

async function start() {
  cityIOtableSettings = await getSettings("./data/settings.json");
  console.log(cityIOtableSettings);

  infoDiv("starting CityScopeJS applet");
  //setup the scene
  setupCanvs();
  //call the media setup method at start
  setupMedia();
  //make the feedback grid viz
  // vizGrid();
  //make the UI
  UI();
  //send to cityIO
  cityIOinit(sendRate);

  //if exists on load than load settings from localStorage
  if (loadSettings()) {
    infoDiv("found keystoning setup >>");
    infoDiv("...Loading prev. keystoning");
    MatrixTransform(loadSettings());
  }
}

start();

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//get table settings from file
async function getSettings(url) {
  // GET method
  return $.ajax({
    url: url,
    type: "GET",
    success: function(d) {
      return d;
    },
    // or error
    error: function(e) {
      console.log("GET error: " + e.status.toString());
      infoDiv("GET error: " + e.status.toString());
    }
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// WEBCAM & MEDIA SETUP
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function setupCanvs() {
  webcamCanvas.id = "webcamCanvas";
  webcamCanvas.className = "webcamCanvas";
  //org. 960x720
  webcamCanvas.width = 800;
  webcamCanvas.height = 800;
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
  var gridSize = cityIOtableSettings.header.spatial.ncols * 4;
  infoDiv(
    "table size: " +
      cityIOtableSettings.header.spatial.ncols +
      " x " +
      cityIOtableSettings.header.spatial.ncols
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
function vizGrid() {
  var gridSize = cityIOtableSettings.header.spatial.ncols * 4;

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//color the visual grid base on the web-worker cv analysis
CVworker.addEventListener(
  "message",
  function(e) {
    pixelColArr = e.data;
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
  },
  false
);
infoDiv("setting up webworker listener");

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
    CVworker.postMessage(scannedColorsArray);

    //recursively call this method
    requestAnimationFrame(function() {
      ColorPickerRecursive();
    });
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
  //reset typesArray var
  typesArray = [];

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  // THIS SHOULD GO TO WEBWORKER
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  // if new data is back from webworker with colors
  if (pixelColArr.length > 1) {
    // find this brick's type using the cv color info
    // and by matching the 4x4 pixels to known types
    // run through the 1D list of colors to reshape
    //this into 4x4 matrices
    for (
      let j = 0;
      j < pixelColArr.length;
      j += Math.sqrt(pixelColArr.length) * 4
    ) {
      // x zero y zero top left going down on y in jumps of 4
      for (let i = 0; i < Math.sqrt(pixelColArr.length); i = i + 4) {
        //reshape to lists of 16 bits, or one brick [should be rewritten cleaner ]
        thisBrick = [
          //first row
          pixelColArr[i + j],
          pixelColArr[i + j + Math.sqrt(pixelColArr.length)],
          pixelColArr[i + j + Math.sqrt(pixelColArr.length) * 2],
          pixelColArr[i + j + Math.sqrt(pixelColArr.length) * 3],
          //second row
          pixelColArr[i + j + 1],
          pixelColArr[i + j + 1 + Math.sqrt(pixelColArr.length)],
          pixelColArr[i + j + 1 + Math.sqrt(pixelColArr.length) * 2],
          pixelColArr[i + j + 1 + Math.sqrt(pixelColArr.length) * 3],
          //third row
          pixelColArr[i + j + 2],
          pixelColArr[i + j + 2 + Math.sqrt(pixelColArr.length)],
          pixelColArr[i + j + 2 + Math.sqrt(pixelColArr.length) * 2],
          pixelColArr[i + j + 2 + Math.sqrt(pixelColArr.length) * 3],
          //forth row
          pixelColArr[i + j + 3],
          pixelColArr[i + j + 3 + Math.sqrt(pixelColArr.length)],
          pixelColArr[i + j + 3 + Math.sqrt(pixelColArr.length) * 2],
          pixelColArr[i + j + 3 + Math.sqrt(pixelColArr.length) * 3]
        ].toString();
        //avoid new lines and commas for clear list
        thisBrick = thisBrick.replace(/,/g, "");

        //find the type for this bricks pattern in 'Codes'
        typesArray.push(
          cityIOtableSettings.objects.types[
            cityIOtableSettings.objects.codes.indexOf(thisBrick)
          ]
        );
      }
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    //send to cityIO
    cityIOtableSettings.grid = typesArray;

    //get table name from settings
    let cityIOtableName = cityIOtableSettings.header.name;
    let cityIOtableUrl =
      "https://cityio.media.mit.edu/api/table/update/" +
      cityIOtableName.toString();

    fetch(cityIOtableUrl, {
      method: "POST",
      mode: "no-cors", // fix cors issue
      body: JSON.stringify(cityIOtableSettings)
    })
      .then(
        response => handleErrors(response),
        infoDiv(
          "OK! sent to cityIO for table '" +
            cityIOtableName +
            "' at " +
            timeNow()
        ),
        console.log(cityIOtableSettings)
      )
      .catch(error => infoDiv(error));

    function handleErrors(response) {
      if (response.ok) {
        infoDiv("cityIO response: " + response.ok);
      }
      return response;
    }
  }

  /* AJAX method 
  async function postCityIO(cityIOtableUrl) {
    $.ajax({
      url: cityIOtableUrl,
      type: "POST",
      data: JSON.stringify(cityIOstruct),
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      processData: false,
      contentType: "application/json; charset=UTF-8",
      complete: infoDiv(
        "OK! sent to cityIO for table '" + cityIOtableName + "' at " + timeNow()
      )
    });
  }
  */

  //calc this time
  function timeNow() {
    var d = Date.now();
    return new Date(d);
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////UI + INTERACTION /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function keystoneUI(bool, gui) {
  if (bool) {
    document.addEventListener("click", mouseKeystone);
    infoDiv(
      "starting keystone" +
        "<p>" +
        "NOTE: make sure to select the croners of the scanned area!"
    );
    //clear prev. svg contanier
    $(svgKeystone).empty();

    // mag. glass [WIP - should remove when off]
    document.body.appendChild(magGlassCanvas);
    magGlassCanvas.id = "magGlass";
    magGlassCanvas.className = "magGlassCanvas";
    magWid = magGlassCanvas.width = 100;
    magGlassCanvas.height = magWid;
    magGlassCanvas.style.zIndex = 100;
    var magGlassCtx = magGlassCanvas.getContext("2d");
    //
    document.addEventListener("mousemove", function(e) {
      $("html,body").css("cursor", "crosshair");
      // console.log(e.pageX, e.pageY);
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

    //make room by hiding gui
    gui.close();
  } else {
    document.removeEventListener("click", mouseKeystone);
    magGlassCanvas.style.display = "none";
  }
  //flip bool
  bool = !bool;
  //collect 4 mouse clicks as corners of keystone
  let clickArray = [];

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
      if (clickArray.length == 8) {
        MatrixTransform(clickArray);
        //save these keystone points
        saveSettings(clickArray);
        //reset the clicks array
        clickArray = [];
        //turn off keystone toggle in gui
        parm["keySt"] = false;
        // and stop keystone mouse clicks
        document.removeEventListener("click", mouseKeystone);
        //open gui when done
        gui.open();
      }
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//save keystone
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var saveSettings = function(clickArray) {
  infoDiv("saving keystone to localStorage in 'CityScopeJS_keystone' key");
  //save to local storage
  localStorage.setItem("CityScopeJS_keystone", JSON.stringify(clickArray));
};
//load settings if exist
var loadSettings = function() {
  if (localStorage.getItem("CityScopeJS_keystone")) {
    var data = JSON.parse(localStorage.getItem("CityScopeJS_keystone"));
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
  var gui = new dat.GUI({ width: 300 });

  parm = {
    mirror: false,
    brightness: 0,
    keySt: false,
    sendRate: 1000,
    fe: function() {
      window.open("https://cityio.media.mit.edu/", "_blank");
    }
  };

  //cityio send rate
  gui
    .add(parm, "sendRate", 250, 2000)
    .step(250)
    .name("cityIO send [ms]")
    .onChange(function(d) {
      sendRate = d;
      cityIOstop();
      cityIOinit(sendRate);
    });

  // webcam toggle
  gui
    .add(parm, "mirror")
    .name("mirror webcam")
    .onChange(function() {
      let bool;
      bool = !bool;
      setupMedia(bool);
    });

  //brightness control
  gui
    .add(parm, "brightness", -100, 100)
    .name("brightness")
    .onChange(function(i) {
      brightness = i;
      brightnessCanvas(i, vidCanvas2dContext);
    });

  // keystone toggle
  gui
    .add(parm, "keySt")
    .name("toggle Keystoning")
    .listen()
    .onChange(function(bool) {
      keystoneUI(bool, gui);
    });

  gui.add(parm, "fe").name("Test in cityIO >>");
}
