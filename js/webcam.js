/////////////////////////////////////////////////////////////////////////////////////////////////////////
// WEBCAM / MEDIA SETUP
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// media toggle 
var mediaToggle = false;
// Global var for GUI controls 
let brightness = 0

//webcam or media parent div
$('<DIV/>', {
    id: "webcamCanvasParent",
    class: "webcamCanvasParent"
}).appendTo('body');

//get it as div
var canvasParent = document.getElementById('webcamCanvasParent');

//make vid canvas
var webcamCanvas = document.createElement('canvas');
webcamCanvas.id = "webcamCanvas";
webcamCanvas.className = "webcamCanvas";
webcamCanvas.width = 960;
webcamCanvas.height = 720;
webcamCanvas.style.zIndex = 0;
webcamCanvas.style.position = "absolute";
webcamCanvas.style.border = "1px solid";
canvasParent.appendChild(webcamCanvas);
//get its context for scanning
var vidCanvas2dContext = webcamCanvas.getContext('2d');
console.log('canvas size:', webcamCanvas.width, webcamCanvas.height);

////////////////////////////////////////////////////////////////////////////////////////////////

function setupMedia(mediaToggle) {
    // make dummy image for testing
    var img = new Image();
    img.onload = function () {
        vidCanvas2dContext.drawImage(img, 0, 0, webcamCanvas.width, webcamCanvas.height);
    }
    //image location for the test image
    img.src = 'media/demotable.jpg';
    ////////////////////
    // video setup
    ////////////////////
    if (mediaToggle) {
        console.log('starting video');
        //Video loop setup
        var track;
        // call video mesh creator
        var width = 0;
        var height = 0;
        var video = document.createElement('video');
        video.addEventListener('loadedmetadata', function () {
            width = webcamCanvas.width;
            height = webcamCanvas.height;
            requestAnimationFrame(loop);
        });
        video.setAttribute('autoplay', true);
        window.vid = video;
        //get the webcam stream
        navigator.getUserMedia({ video: true, audio: false }, function (stream) {
            video.srcObject = stream;
            track = stream.getTracks()[0];
        }, function (e) {
            console.error('Webcam issue!', e);
        });
        function loop() {
            requestAnimationFrame(loop);
            //draw the image before applying filters 
            vidCanvas2dContext.drawImage(video, 0, 0, width, height);
            //apply filter every frame !! COSTLY
            brightnessCanvas(brightness, vidCanvas2dContext)
        }
    }
}

// Brightens the canvas image
function brightnessCanvas(value, canvas) {
    // Get the pixel data
    var pixelData = canvas.getImageData(0, 0, webcamCanvas.width, webcamCanvas.height);
    var pixelDataLen = pixelData.data.length;
    for (var i = 0; i < pixelDataLen; i += 4) {
        pixelData.data[i] += value;
        pixelData.data[i + 1] += value;
        pixelData.data[i + 2] += value;
    }
    // Draw the data back to the visible canvas
    canvas.putImageData(pixelData, 0, 0);
}