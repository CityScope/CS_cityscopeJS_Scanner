export default class Utils {
  constructor(errorOutputId) {
    // eslint-disable-line no-unused-vars
    let self = this;
    this.errorOutput = document.getElementById(errorOutputId);
    //
    this.loadImageToCanvas = function(url, cavansId) {
      let canvas = document.getElementById(cavansId);
      let ctx = canvas.getContext("2d");
      let img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
      };
      img.src = url;
    };
    //
    this.executeCode = function(textAreaId) {
      try {
        this.clearError();
        let code = document.getElementById(textAreaId).value;
        eval(code);
      } catch (err) {
        this.printError(err);
      }
    };
    //
    this.clearError = function() {
      this.errorOutput.innerHTML = "";
    };
    //
    this.printError = function(err) {
      if (typeof err === "undefined") {
        err = "";
      } else if (typeof err === "number") {
        if (!isNaN(err)) {
          if (typeof cv !== "undefined") {
            err = "Exception: " + cv.exceptionFromPtr(err).msg;
          }
        }
      } else if (typeof err === "string") {
        let ptr = Number(err.split(" ")[0]);
        if (!isNaN(ptr)) {
          if (typeof cv !== "undefined") {
            err = "Exception: " + cv.exceptionFromPtr(ptr).msg;
          }
        }
      } else if (err instanceof Error) {
        err = err.stack.replace(/\n/g, "<br>");
      }
      this.errorOutput.innerHTML = err;
    };

    //
    function onVideoCanPlay() {
      if (self.onCameraStartedCallback) {
        self.onCameraStartedCallback(self.stream, self.video);
      }
    }
    //
    this.startCamera = function(resolution, callback, videoId) {
      const constraints = {
        qvga: { width: { exact: 240 }, height: { exact: 320 } },
        vga: { width: { exact: 640 }, height: { exact: 480 } }
      };
      let video = document.getElementById(videoId);
      if (!video) {
        video = document.createElement("video");
      }
      let videoConstraint = constraints[resolution];
      if (!videoConstraint) {
        videoConstraint = true;
      }

      videoConstraint = true;

      navigator.mediaDevices
        .getUserMedia({ video: videoConstraint, audio: false })
        .then(function(stream) {
          video.srcObject = stream;
          video.play();
          self.video = video;
          self.stream = stream;
          self.onCameraStartedCallback = callback;
          video.addEventListener("canplay", onVideoCanPlay, false);
        })
        .catch(function(err) {
          self.printError("Camera Error: " + err.name + " " + err.message);
        });
    };
    //
    this.stopCamera = function() {
      if (this.video) {
        this.video.pause();
        this.video.srcObject = null;
        this.video.removeEventListener("canplay", onVideoCanPlay);
      }
      if (this.stream) {
        this.stream.getVideoTracks()[0].stop();
      }
    };
  }
}
