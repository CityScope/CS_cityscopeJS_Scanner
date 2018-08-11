import "../Storage";

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// WEBCAM & MEDIA SETUP
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//setup the camera device
export function setupWebcam() {
  // Global var for GUI controls
  var brightness = 0;
  // Global var for GUI controls
  var contrast = 0;
  var camCanvas = setupWebCamCanvas();
  //store webcam canvas into class
  Storage.camCanvas = camCanvas;

  //get main canvas context for scanning
  var vidCanvas2dContext = camCanvas.getContext("2d");
  // console.log("starting video");
  //Video loop setup call video mesh creator
  var width = 0;
  var height = 0;
  var video = document.createElement("video");
  video.addEventListener("loadedmetadata", function() {
    width = camCanvas.width;
    height = camCanvas.height;
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
    vidCanvas2dContext.drawImage(video, 0, 0, width, height);

    //draw the image before applying filters
    //apply filter every frame !! COSTLY
    //WIP -- draw the filter result to each frame
    // brightnessCanvas(brightness, vidCanvas2dContext);
    // contrastCanvas(contrast, vidCanvas2dContext);
  }
}

////////////////////
// Brightness fn. for canvas video. UI for input.
////////////////////
function brightnessCanvas(brightness, canvas) {
  // Get the pixel data
  var pixelData = canvas.getImageData(0, 0, canvas.width, canvas.height);
  var pixelDataLen = pixelData.data.length;
  for (var i = 0; i < pixelDataLen; i += 4) {
    pixelData.data[i] += brightness;
    pixelData.data[i + 1] += brightness;
    pixelData.data[i + 2] += brightness;
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

function setupWebCamCanvas() {
  //make vid canvas
  var camCanvas = document.createElement("canvas");

  camCanvas.id = "webcamCanvas";
  camCanvas.className = "webcamCanvas";

  //MUST keep full numbers [WIP]
  camCanvas.width = Math.floor(window.innerHeight);
  camCanvas.height = Math.floor(window.innerHeight);
  camCanvas.style.zIndex = 0;
  camCanvas.style.position = "absolute";
  // camCanvas.style.border = "1px solid";
  document.body.appendChild(camCanvas);
  return camCanvas;
}
