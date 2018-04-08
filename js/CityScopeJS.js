/////////////////////////////////////////////////////////////////////////////////////////////////////////

/* CityScopeJS -- decoding 2d array of black and white lego bricks and sending to remote server.
"@context": "https://github.com/CityScope/", "@type": "Person", "address": { "@type": "75 Amherst St, Cambridge, MA 02139", "addressLocality": " Cambridge", "addressRegion": "MA",}, "jobTitle": "Research Scientist", "name": "Ariel Noyman", "alumniOf": "MIT", "url": "http://arielnoyman.com", "https://www.linkedin.com/", "http://twitter.com/relno", https://github.com/RELNO] */

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//create webworker
var CVworker = new Worker('js/CSjsCV.js');
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// size var
var size = 80
// make visual grid representation
let vizGridArray = []
// media toggle 
var mediaToggle = false;
//array of scanned pixels 
let scannedColorsArray = [];

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//webcam or media parent div for dragging
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
    //clear canvas at start
    vidCanvas2dContext.clearRect(0, 0, vidCanvas2dContext.width, vidCanvas2dContext.height);
    // make dummy image for testing
    var img = new Image();
    img.onload = function () {
        vidCanvas2dContext.drawImage(img, 0, 0, webcamCanvas.width, webcamCanvas.height);
    }
    //image location for the test image
    img.src = 'media/g0.jpg';


    ////////////////////
    // video setup
    ////////////////////
    var track;

    if (mediaToggle) {
        vidCanvas2dContext.clearRect(0, 0, vidCanvas2dContext.width, vidCanvas2dContext.height);

        //Video loop setup
        var loopFrame, centerX, centerY;
        // call video mesh creator
        var width = 0;
        var height = 0;
        var video = document.createElement('video');

        video.addEventListener('loadedmetadata', function () {
            width = webcamCanvas.width;
            height = webcamCanvas.height;
            console.log(width, height);

            centerX = width / 2;
            centerY = height / 2;
            startLoop();
        });

        video.setAttribute('autoplay', true);
        window.vid = video;
        //call webcam function
        navigator.getUserMedia({ video: true, audio: false }, function (stream) {
            video.srcObject = stream;
            track = stream.getTracks()[0];

        }, function (e) {
            console.error('Webcam issue!', e);
        });

        function loop() {
            loopFrame = requestAnimationFrame(loop);
            vidCanvas2dContext.save();
            vidCanvas2dContext.restore();
            vidCanvas2dContext.drawImage(video, 0, 0, width, height);
        }
        function startLoop() {
            loopFrame = loopFrame || requestAnimationFrame(loop);
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//make array of evenly divided grid of point to scan
function scanArrayMaker() {
    // TODO : replace this with visuals
    var vizGridLocArray = []
    //get point every in ration to width divided by # of points
    let ratioX = webcamCanvas.width / size;
    let ratioY = webcamCanvas.height / size;
    for (let i = 0; i < webcamCanvas.width; i += ratioX) {
        for (let j = 0; j < webcamCanvas.height; j += ratioY) {
            vizGridLocArray.push([i + (ratioX / 2), j + (ratioY / 2)]);
        }
    }
    return vizGridLocArray;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//create the scanning transposed matrix
function MatrixTransform() {
    // clear dst corners
    var dstCorners = [];
    //matrix Grid Location Array
    var matrixGridLocArray = []
    let vizGridLocArray = scanArrayMaker();
    var srcCorners = [];

    srcCorners = [
        getPos(webcamCanvas)[0], getPos(webcamCanvas)[1],
        webcamCanvas.width, getPos(webcamCanvas)[1],
        getPos(webcamCanvas)[0], webcamCanvas.height,
        webcamCanvas.width, webcamCanvas.height
    ]

    // to be replaced with dynmaic editing 
    dstCorners =
        [119, 48,
            856, 35,
            84, 696,
            883, 655]

    /*
     cityioObj.objects.matrixMapping
    make and get dest div locations
      
          [getPos(webcamCanvas)[0] + 20, getPos(webcamCanvas)[1] + 15,
         webcamCanvas.width - 60, getPos(webcamCanvas)[1] + 30,
         getPos(webcamCanvas)[0] + 100, webcamCanvas.height,
         webcamCanvas.width - 80, webcamCanvas.height]
     */



    //var for the distorted points
    let dstPt;
    // use lib to calculate transform matrix
    perspT = PerspT(srcCorners, dstCorners);
    //make parent div
    $('<DIV/>', {
        id: "transformedMatrixParent",
    }).appendTo(canvasParent);
    //distort the matrix to locations and make cubes
    for (let j = 0; j < vizGridLocArray.length; j++) {
        dstPt = perspT.transform(vizGridLocArray[j][0], vizGridLocArray[j][1]);
        $('<DIV/>', {
            id: "transformedMatrix" + j,
            class: "transformedMatrix",
        }).appendTo('#transformedMatrixParent');
        var d = document.getElementById('transformedMatrix' + j);
        d.style.position = "absolute";
        d.style.left = dstPt[0] + 'px';
        d.style.top = dstPt[1] + 'px';
        matrixGridLocArray.push([Math.floor(dstPt[0]), Math.floor(dstPt[1])]);
    }
    return (matrixGridLocArray)
}

//div position
function getPos(el) {
    // yay readability
    for (var lx = 0, ly = 0;
        el != null;
        lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return ([lx, ly]);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function vizGrid() {
    // make the grid div parent
    $('<DIV/>', {
        id: "vizCellDivParent",
        class: "vizCellDivParent"
    }).appendTo('body');

    // make the visual rep of the now distorted grid
    for (let i = 0; i < size; i++) {
        var vizRawsDiv = document.createElement('div');
        vizRawsDiv.className = "vizRawsDiv";
        vizCellDivParent.appendChild(vizRawsDiv);
        for (let j = 0; j < size; j++) {
            var vizCell = document.createElement('div');
            vizCell.className = "vizCell";
            vizRawsDiv.appendChild(vizCell);
            // get the divs to array
            vizGridArray.push(vizCell);
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function ColorPicker() {
    //empty color array for webworker
    scannedColorsArray = [];

    // read all pixels in  canvas
    var pixelArray = vidCanvas2dContext.getImageData(0, 0, window.innerWidth, window.innerHeight)

    //get the pixels
    var pixelData = pixelArray.data;

    for (let i = 0; i < matrixDiv.length; i++) {
        // get the pixel location at the center of the grid cell div and match it to the pixel location in the PixelBffer linear list
        pixLoc = ((matrixGridLocArray[i][1] * innerWidth) + matrixGridLocArray[i][0]) * 4

        //convert pixel data to RGBA string
        col = ("rgb(" + pixelData[pixLoc].toString() + ',' + pixelData[pixLoc + 1].toString() + ',' + pixelData[pixLoc + 2].toString() + ")");

        //use RGBA value to color grid cell divs
        // vizGridArray[i].style.background = col;

        // sample and push to array 3 pixels around to get better recognition
        scannedColorsArray.push(
            //pixel before
            [pixelData[pixLoc - 4], pixelData[pixLoc - 3], pixelData[pixLoc - 2],
            //this  pixel
            pixelData[pixLoc], pixelData[pixLoc + 1], pixelData[pixLoc + 2],
            //next pixel
            pixelData[pixLoc + 4], pixelData[pixLoc + 5], pixelData[pixLoc + 6]]
        )
    }
    //recoursivally call this
    requestAnimationFrame(function () {
        ColorPicker();
    });
    //send the scanned colors to webworker for CV operation
    CVworker.postMessage(scannedColorsArray);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//color the viz grid base on the webwroker cv analysis
CVworker.addEventListener('message', function (e) {
    // console.log('Worker said:', e.data);
    col = e.data;
    for (let i = 0; i < vizGridArray.length; i++) {
        col[i] == 0 ?
            vizGridArray[i].style.background = 'white' : vizGridArray[i].style.background = 'black';
    }
}, false);

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function interact() {
    //dragable
    $('#vizCellDivParent').draggable();
    // $(canvasParent).draggable();

    // dat.GUI
    var gui = new dat.GUI({ width: 300 });

    parm = {
        mouseLocX: 0,
        mouseLocY: 0,
        webcam: false
    }

    document.addEventListener('mousemove', function onMouseMove(e) {
        parm.mouseLocX = e.x;
        parm.mouseLocY = e.y;
    })

    gui.add(parm, 'mouseLocX').name("Mouse x:").listen();
    gui.add(parm, 'mouseLocY').name("Mouse y:").listen();

    // webcam toggle
    gui.add(parm, "webcam").name("Start webcam").onChange(function (mediaToggle) {
        setupMedia(mediaToggle);
    });

    // gui.close();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////LOGIC /////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//load settings file
var cityioObj = fetch("../data/cityIO.json")
    .then(res => res.json())
    .then(data => cityioObj = data)
    .then(cityioObj => { return cityioObj })


//call the media setup method at start
setupMedia(mediaToggle);
vizGrid();
let matrixDiv = document.getElementsByClassName('transformedMatrix');

let matrixGridLocArray = MatrixTransform(cityioObj);
ColorPicker();
interact();
