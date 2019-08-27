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
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;

let dst = null;
let dsize = null;

function startVideoProcessing() {
  console.log("startVideoProcessing");

  src = new cv.Mat(height, width, cv.CV_8UC4);
  dstC1 = new cv.Mat(height, width, cv.CV_8UC1);
  dstC3 = new cv.Mat(height, width, cv.CV_8UC3);
  dstC4 = new cv.Mat(height, width, cv.CV_8UC4);
  // !
  dst = new cv.Mat();
  dsize = new cv.Size(src.rows, src.cols);

  requestAnimationFrame(processVideo);
}

function passThrough(src) {
  // (data32F[0], data32F[1]) is the first point
  // (data32F[2], data32F[3]) is the sescond point
  // (data32F[4], data32F[5]) is the third point
  // (data32F[6], data32F[7]) is the fourth point
  let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0,
    0,
    240,
    0,
    0,
    320,
    240,
    320
  ]);
  let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0,
    0,
    100,
    0,
    0,
    200,
    200,
    200
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

let stats = null;

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
  if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
  if (dstC3 != null && !dstC3.isDeleted()) dstC3.delete();
  if (dstC4 != null && !dstC4.isDeleted()) dstC4.delete();
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
