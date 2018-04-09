/////////////////////////////////////////////////////////////////////////////////////////////////////////

/* CityScopeJS -- decoding 2d array of black and white lego bricks and sending to remote server.
"@context": "https://github.com/CityScope/", "@type": "Person", "address": { "@type": "75 Amherst St, Cambridge, MA 02139", "addressLocality": " Cambridge", "addressRegion": "MA",}, "jobTitle": "Research Scientist", "name": "Ariel Noyman", "alumniOf": "MIT", "url": "http://arielnoyman.com", "https://www.linkedin.com/", "http://twitter.com/relno", https://github.com/RELNO] */

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//create web-worker
// var CVworker = new Worker('js/CSjsCV.js');

/* https://www.sitepoint.com/using-web-workers-to-improve-image-manipulation-performance/webworker */

const CVworker = blobWebWorker(function () {
    //worker code here

    var cityioData = []
    var types = [
        "type_0",
        "type_1",
        "type_2",
        "type_3",
        "type_4",
        "type_5",
        "type_6",
        "type_7",
        "type_8",
        "type_9",
        "type_10",
        "type_11",
        "type_12",
        "type_13",
        "type_14",
        "type_15",
        "type_16",
        "type_17",
        "type_18",
        "type_19",
        "type_20",
        "type_21",
        "type_22",
        "type_23",
        "type_24"
    ];

    var codes = [
        '1100011000100000',
        '0001000100010000',
        '0000010001000100',
        '0000011001100000',
        '0001001001001000',
        '0001100000101000',
        '1000100000000001',
        '0000100000000000',
        '0000000001000000',
        '0000100000000001',
        '1000000000000001',
        '0100000000000010',
        '0001010101000000',
        '1001100110011001',
        '0000111100110110',
        '1111100010000000',
        '1110001000100110',
        '0011001000110000',
        '1100010001011111',
        '0100010001000110',
        '0011011011000110',
        '0100011000110000',
        '0000011001000110',
        '0100011011000000',
        '0111010011000000'];

    //load table settings
    var cityioObj = fetch("../data/cityIO.json")
        .then(res => res.json())
        .then(data => cityioObj = data)
        .then((cityioObj) => { return cityioObj })


    //listen to web-worker calls 
    self.addEventListener('message', function (msg) {
        // make sure cityioObj loaded
        if (cityioObj) {
            CV(msg.data)
        }
    }, false)

    //do CV on image data 
    function CV(data) {
        //reset array
        let pixelColArr = [];
        let typesArray = [];

        //sample 3 pixels [3x3 colors] each time 
        for (let i = 0; i < data.length; i++) {
            avg_0 = 0.21 * data[i][0] + 0.72 * data[i][1] + 0.07 * data[i][2];
            avg_1 = 0.21 * data[i][3] + 0.72 * data[i][4] + 0.07 * data[i][5];
            avg_2 = 0.21 * data[i][6] + 0.72 * data[i][7] + 0.07 * data[i][8];
            avg = (avg_0 + avg_1 + avg_2) / 3

            avg > 256 / 2 ? pixelCol = 0 : pixelCol = 1;
            pixelColArr.push(pixelCol);
        }
        //return this to DOM for visuals 
        self.postMessage(pixelColArr);

        cityioData = typesArray
        //run through the 1D list of colors to reshape this into 4x4 matrices 
        for (let j = 0; j < pixelColArr.length; j += Math.sqrt(pixelColArr.length) * 4) {
            // x zero y zero top left going down on y in jumps of 4
            for (let i = 0; i < Math.sqrt(pixelColArr.length); i = i + 4) {
                //reshape to lists of 16 bits -- should be rewritten cleaner  
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
                ].toString()

                thisBrick = thisBrick.replace(/,/g, "");
                typesArray.push(types[codes.indexOf(thisBrick)])
            }
        }
    }
    if (cityioData && cityioObj) {
        cityio(cityioData)
    }
    //send to cityIO
    function cityio() {
        setTimeout(cityio, 500);
        cityioObj.grid = cityioData;
        // console.log(cityioObj);

        fetch("https://cityio.media.mit.edu/api/table/update/cityscopeJS", {
            method: "POST",
            body: JSON.stringify(cityioObj)
        }).then((response) => {
            // console.log(response)
        });
    }
});

// For inline WS
function blobWebWorker(fn) {
    return new Worker(URL.createObjectURL(new Blob(["(" + fn + ")()"])));
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

// size var
var size = 80
// make visual grid representation
let vizGridArray = []
// media toggle 
var mediaToggle = false;
//array of scanned pixels 
let scannedColorsArray = [];
//
let brightness = 0

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
    // clear destination corners
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

    // to be replaced with dynamic editing 
    dstCorners =
        [119, 48,
            856, 35,
            84, 696,
            883, 655]

    /*
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
    //empty color array for web-worker
    scannedColorsArray = [];

    // read all pixels in  canvas
    var pixelArray = vidCanvas2dContext.getImageData(0, 0, window.innerWidth, window.innerHeight)

    //get the pixels
    var pixelData = pixelArray.data;

    for (let i = 0; i < matrixDiv.length; i++) {
        // get the pixel location at the center of the grid cell div and match it to the pixel location in the PixelBuffer linear list
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
    //recursively call this
    requestAnimationFrame(function () {
        ColorPicker();
    });
    //send the scanned colors to web-worker for CV operation
    CVworker.postMessage(scannedColorsArray);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//color the visual grid base on the web-worker cv analysis
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
    //drag-able
    $('#vizCellDivParent').draggable();
    // dat.GUI
    var gui = new dat.GUI({ width: 300 });

    parm = {
        mouseLocX: 0,
        mouseLocY: 0,
        webcam: false,
        brightness: 0
    }
    //mouse location 
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
    //brightness
    gui.add(parm, 'brightness', -100, 100).
        name("brightness").onChange(function (i) {
            brightness = i;
            brightnessCanvas(i, vidCanvas2dContext)
        });
    // gui.close();
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////LOGIC /////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////


//call the media setup method at start
setupMedia(mediaToggle);
vizGrid();
let matrixDiv = document.getElementsByClassName('transformedMatrix');
let matrixGridLocArray = MatrixTransform();
ColorPicker();
interact();
