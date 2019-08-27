import Utils from "./utils";
import cv from "./opencv";
import dat from "dat.gui";

let utils = new Utils("errorMessage");
let width = 0;
let height = 0;
let resolution = window.innerWidth < 960 ? "qvga" : "vga";
// whether streaming video from the camera.
let streaming = false;
let video = document.getElementById("videoInput");
let vc = null;
let src = null;
let dst = null;
let dsize = null;

function startVideoProcessing() {
  console.log("startVideoProcessing");

  src = new cv.Mat(height, width, cv.CV_8UC4);
  dst = new cv.Mat();
  dsize = new cv.Size(src.rows, src.cols);

  requestAnimationFrame(processVideo);
}

function passThrough(src) {
  /*
  (data32F[0], data32F[1]) is the first point
  (data32F[2], data32F[3]) is the sescond point
  (data32F[4], data32F[5]) is the third point
  (data32F[6], data32F[7]) is the fourth point
  */

  let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0,
    0,
    600,
    0,
    0,
    600,
    600,
    600
  ]);
  let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0,
    0,
    600,
    0,
    0,
    600,
    600,
    600
  ]);
  let M = cv.getPerspectiveTransform(srcTri, dstTri);
  // You can try more different parameters
  cv.warpPerspective(
    src,
    dst,
    M,
    dsize,
    cv.INTER_LINEAR,
    cv.BORDER_CONSTANT,
    new cv.Scalar()
  );

  return dst;
}

function processVideo() {
  if (!streaming) return;
  vc.read(src);
  let result;
  switch (controls.filter) {
    case "passThrough":
      result = passThrough(src);
      break;
    default:
      result = passThrough(src);
  }
  cv.imshow("canvasOutput", result);
  requestAnimationFrame(processVideo);
}

let filters = {
  passThrough: "Pass Through"
};

let filterName = document.getElementById("filterName");

let controls;

function initUI() {
  controls = {
    filter: "passThrough",
    setFilter: function(filter) {
      this.filter = filter;
      filterName.innerHTML = filters[filter];
    },
    passThrough: function() {
      this.setFilter("passThrough");
    }
  };

  let parm = {
    global_boolean: true,
    getJson: function() {
      let fileClick = document.getElementById("my_file");
      fileClick.click();
      //do somthing with the file
      fileClick.onchange = function(e) {
        onFileLoad(e);
      };
    },
    sendRate: 1000,
    //test on cityIO
    fe: function() {
      window.open("https://cityio.media.mit.edu/", "_blank");
    },
    rawCityIO: function() {
      var cityIOdataStruct = Storage.cityIOdataStruct;
      window.open(
        "https://cityio.media.mit.edu/api/table/" +
          cityIOdataStruct.header.name,
        "_blank"
      );
    },
    reset: function() {
      //clear local memory of last key stone
      localStorage.clear();
      updateInfoDIV("clearing and reseting");
      location.reload(true);
    }
  };

  let gui = new dat.GUI({ autoPlace: false });
  let guiContainer = document.getElementById("guiContainer");
  guiContainer.appendChild(gui.domElement);

  let lastFolder = null;
  function closeLastFolder(folder) {
    if (lastFolder != null && lastFolder != folder) {
      lastFolder.close();
    }
    lastFolder = folder;
  }

  gui
    .add(controls, "passThrough")
    .name(filters["passThrough"])
    .onChange(function() {
      closeLastFolder(null);
    });

  //upload settings
  gui.add(parm, "getJson").name("Start here: Load settings [JSON]");

  //or reset and restart
  gui.add(parm, "reset").name("Reset and clear Keystone");

  //add folder
  var cityioFolder = gui.addFolder("cityIO");

  //cityio send rate
  cityioFolder
    .add(parm, "sendRate", 250, 2000)
    .step(250)
    .name("cityIO send [ms]")
    .onChange(function(result) {
      cityIOstop();
      cityIOinit(result);
    });

  //cityIO link
  cityioFolder.add(parm, "rawCityIO").name("View raw API");

  //cityIO link
  cityioFolder.add(parm, "fe").name("View on cityIO Dashboard");
}

function startCamera() {
  if (!streaming) {
    utils.clearError();
    utils.startCamera(resolution, onVideoStarted, "videoInput");
  } else {
    utils.stopCamera();
    onVideoStopped();
  }
}

function onVideoStarted() {
  height = video.videoHeight;
  width = video.videoWidth;
  video.setAttribute("width", width);
  video.setAttribute("height", height);
  streaming = true;
  vc = new cv.VideoCapture(video);
  startVideoProcessing();
}

function stopVideoProcessing() {
  if (src != null && !src.isDeleted()) src.delete();
}

function onVideoStopped() {
  if (!streaming) return;
  stopVideoProcessing();
  document
    .getElementById("canvasOutput")
    .getContext("2d")
    .clearRect(0, 0, width, height);
  streaming = false;
}

//  load CV
cv["onRuntimeInitialized"] = () => {
  console.log(cv.getBuildInformation());
  initUI();
  startCamera();
};
