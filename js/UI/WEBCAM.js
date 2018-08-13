import "../Storage";

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
  // console.log("starting video");
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
      console.log(err.name + ": " + err.message);
    });

  //Image effect control for now
  var brightness = -30;
  var contrast = 50;
  contrast = contrast / 100 + 1; //convert to decimal & shift range: [0..2]
  var intercept = 128 * (1 - contrast);

  //loop
  function loop() {
    vidCanvas2dContext.drawImage(video, 0, 0, width, height);

    //Brightness + Contrast
    var pixelData = vidCanvas2dContext.getImageData(
      0,
      0,
      camCanvas.width,
      camCanvas.height
    );

    var pixelDataLen = pixelData.data.length;

    for (var i = 0; i < pixelDataLen; i += 4) {
      //Brightness
      pixelData.data[i] += brightness;
      pixelData.data[i + 1] += brightness;
      pixelData.data[i + 2] += brightness;

      //Contrast
      pixelData.data[i] = pixelData.data[i] * contrast + intercept;
      pixelData.data[i + 1] = pixelData.data[i + 1] * contrast + intercept;
      pixelData.data[i + 2] = pixelData.data[i + 2] * contrast + intercept;
    }

    // Draw the data back to the visible canvas
    vidCanvas2dContext.putImageData(pixelData, 0, 0);

    //loop the video to canvas method
    requestAnimationFrame(loop);
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function setupWebCamCanvas() {
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
