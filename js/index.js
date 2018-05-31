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
*/

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// web-worker
const CVworker = new Worker('js/CVwebworker.js');
// grid pixels size var
var size = 80
// make visual grid representation
let vizGridArray = [];

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// APP LOGIC ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//call the media setup method at start
setupMedia(mediaToggle);
vizGrid();
interact();

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//make info div 
function infoDiv(text) {
    let d = document.getElementById('infoDiv')
    if (d === null) {
        //make parent div
        $('<DIV/>', {
            id: "infoDiv",
            class: "info"
        }).appendTo('body');
    } else {
        d.innerHTML = text;
    }
    return;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// DAT GUI 
function interact() {

    //drag-able
    $('#vizCellDivParent').draggable();
    // dat.GUI
    var gui = new dat.GUI({ width: 300 });

    parm = {
        mouseLocX: 0,
        mouseLocY: 0,
        webcam: false,
        brightness: 0,
        cityIO: false,
        keySt: false
    }
    //mouse location 
    document.addEventListener('mousemove', function onMouseMove(e) {
        parm.mouseLocX = e.x;
        parm.mouseLocY = e.y;
    })
    gui.add(parm, 'mouseLocX').name("Mouse x:").listen();
    gui.add(parm, 'mouseLocY').name("Mouse y:").listen();


    // keystone toggle
    gui.add(parm, "keySt").name("toggle Keystoning").onChange(function (bool) {
        if (bool) {
            document.addEventListener('click', mouseKeystone);
        } else {
            document.removeEventListener('click', mouseKeystone)
        }
        bool = !bool
    });

    let clickArray = [];
    function mouseKeystone(e) {
        clickArray.push(e.x, e.y)
        infoDiv("Mouse click " + clickArray.length / 2 + " at " + e.x + ", " + e.y);
        if (clickArray.length == 8) {
            MatrixTransform(clickArray)
            clickArray = [];
        }
    }


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

    // cityIO toggle
    // gui.add(parm, "cityIO").name("Toggle cityIO").onChange(function (bool) {
    //     if (!bool) {
    //         console.log(bool);
    //         cityio(bool);
    //     }
    // });

    // gui.close();

    infoDiv();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
//make an initial array of evenly
// divided grid of points to scan
function scanArrayMaker() {
    // TODO : replace this with visuals
    var vizGridLocArray = []
    //get point in certain ratio
    //to width divided by # of points
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
// to be replaced with dynamic editing 
//create the scanning transposed matrix
function MatrixTransform(dstCorners) {
    console.log(dstCorners);

    //clear div before creating new one
    if (document.getElementById('transformedMatrixParent') != null) {
        $("#transformedMatrixParent").remove()
    }

    //make parent div
    $('<DIV/>', {
        id: "transformedMatrixParent",
    }).appendTo('body');

    //matrix Grid Location Array
    var matrixGridLocArray = []
    // return a new 
    let vizGridLocArray = scanArrayMaker();

    //set the reference points of the 4 edges of the canvas 
    srcCorners = [
        getPos(webcamCanvas)[0], getPos(webcamCanvas)[1],
        webcamCanvas.width, getPos(webcamCanvas)[1],
        getPos(webcamCanvas)[0], webcamCanvas.height,
        webcamCanvas.width, webcamCanvas.height
    ]
    // dstCorners =
    //     [119, 48,
    //         856, 35,
    //         84, 696,
    //         883, 655]


    //var for the distorted points
    let dstPt;
    // use lib to calculate transform matrix
    perspT = PerspT(srcCorners, dstCorners);
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
    ColorPicker(matrixGridLocArray);
    dstCorners = [];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//get div position
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
    //call viz function from WS 
    vizFromWebworker(vizGridArray)
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
function vizFromWebworker(vizGridArray) {
    //color the visual grid base on the web-worker cv analysis
    CVworker.addEventListener('message', function (e) {
        col = e.data;
        for (let i = 0; i < vizGridArray.length; i++) {
            col[i] == 0 ?
                vizGridArray[i].style.background = 'white' :
                vizGridArray[i].style.background = 'black';
        }
    }, false);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ColorPicker(matrixGridLocArray) {
    let matrixDiv = document.getElementsByClassName('transformedMatrix');
    infoDiv("starting pixel scanner");

    ColorPickerRecursive();
    // inside recursive function 
    function ColorPickerRecursive() {

        // empty color array for web-worker
        let scannedColorsArray = [];
        // read all pixels from canvas
        var pixelArray = vidCanvas2dContext.getImageData(0, 0, window.innerWidth, window.innerHeight)
        //get the pixels
        var pixelData = pixelArray.data;
        for (let i = 0; i < matrixDiv.length; i++) {
            // get the pixel location at the center of the grid cell div 
            // and match it to the pixel location in the PixelBuffer linear list
            pixLoc = ((matrixGridLocArray[i][1] * innerWidth) + matrixGridLocArray[i][0]) * 4
            // sample and push to array 3 pixels around to get better recognition
            scannedColorsArray.push(
                //pixel before
                [pixelData[pixLoc - 4], pixelData[pixLoc - 3], pixelData[pixLoc - 2],
                //this  pixel
                pixelData[pixLoc], pixelData[pixLoc + 1], pixelData[pixLoc + 2],
                //next pixel
                pixelData[pixLoc + 4], pixelData[pixLoc + 5], pixelData[pixLoc + 6]])

            //convert pixel data to RGBA string and
            //use RGBA value to color grid cell divs
            // col = ("rgb(" +
            //     pixelData[pixLoc].toString() +
            //     ',' + pixelData[pixLoc + 1].toString() +
            //     ',' + pixelData[pixLoc + 2].toString() + ")");
        }
        //every frame, send the scanned colors to web-worker for CV operation

        CVworker.postMessage(scannedColorsArray);

        //recursively call this method
        requestAnimationFrame(function () {
            ColorPickerRecursive();
        });
    }
}

