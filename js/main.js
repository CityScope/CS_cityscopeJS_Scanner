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
var gridSize = 80;
// POST to cityIO rate in MS
var sendRate = 1000;
// make visual grid representation
var vizGridArray = [];
// cityIO structure for POST
var cityIOstruct =
    {
        "grid": [],
        "id": "",
        "objects": {
            "matrixMapping": [
                119,
                48,
                856,
                35,
                84,
                696,
                883,
                655
            ],
            "types": [
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
            ],
            "codes": [
                "1100011000100000",
                "0001000100010000",
                "0000010001000100",
                "0000011001100000",
                "0001001001001000",
                "0001100000101000",
                "1000100000000001",
                "0000100000000000",
                "0000000001000000",
                "0000100000000001",
                "1000000000000001",
                "0100000000000010",
                "0001010101000000",
                "1001100110011001",
                "0000111100110110",
                "1111100010000000",
                "1110001000100110",
                "0011001000110000",
                "1100010001011111",
                "0100010001000110",
                "0011011011000110",
                "0100011000110000",
                "0000011001000110",
                "0100011011000000",
                "0111010011000000"
            ]
        },
        "header": {
            "name": "CityScopeJS",
            "longName": "TactileScopeMatrixCity©®",
            "block": [
                "type"
            ],
            "spatial": {
                "ncols": 20,
                "physical_longitude": -71.0894527,
                "physical_latitude": 42.360357,
                "nrows": 20,
                "rotation": 0,
                "latitude": 42.360357,
                "cellsize": 10,
                "longitude": -71.087264
            },
            "owner": {
                "name": "Ariel Noyman",
                "institute": "City Science MIT Media Lab"
            }
        }
    }


/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////SCAN LOGIC ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//make an initial array of evenly
// divided grid of points to scan
function scanArrayMaker() {
    // TODO : replace this with visuals
    var vizGridLocArray = []
    //get point in certain ratio
    //to width divided by # of points
    let ratioX = webcamCanvas.width / gridSize;
    let ratioY = webcamCanvas.height / gridSize;
    for (let i = 0; i < webcamCanvas.width; i += ratioX) {
        for (let j = 0; j < webcamCanvas.height; j += ratioY) {
            vizGridLocArray.push([i + (ratioX / 2), j + (ratioY / 2)]);
        }
    }
    return vizGridLocArray;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//create the scanning transposed matrix
function MatrixTransform(dstCorners) {
    console.log('4 corners are at: ', dstCorners);

    //clear div before creating new one
    if (document.getElementById('transformedMatrixParent') != null) {
        console.log('removing transformedMatrixParent');

        $("#transformedMatrixParent").remove()
    }

    //make parent div
    $('<DIV/>', {
        id: "transformedMatrixParent",
    }).appendTo('body');

    //matrix Grid Location Array
    var matrixGridLocArray = []
    // return a new visual Grid Locations Array
    let vizGridLocArray = scanArrayMaker();

    //set the reference points of the 4 edges of the canvas 
    // to get 100% of the image/video in canvas 
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
    let perspT;
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
    for (let i = 0; i < gridSize; i++) {
        var vizRawsDiv = document.createElement('div');
        vizRawsDiv.className = "vizRawsDiv";
        vizCellDivParent.appendChild(vizRawsDiv);
        for (let j = 0; j < gridSize; j++) {
            var vizCell = document.createElement('div');
            vizCell.className = "vizCell";
            vizRawsDiv.appendChild(vizCell);
            //cell sized in viz grid 
            let cellDims = (document.documentElement.clientWidth / gridSize / 4).toString() + "px";
            vizCell.style.width = cellDims;
            vizCell.style.height = cellDims;

            // get the divs to array
            vizGridArray.push(vizCell);
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// global for colors back from webworker
var pixelColArr = [];
//types and codes for cityIO objects 
var types, codes;
let typesArray = [];

//color the visual grid base on the web-worker cv analysis
console.log('setting up webworker listener');
CVworker.addEventListener('message', function (e) {
    pixelColArr = e.data;
    for (let i = 0; i < vizGridArray.length; i++) {
        if (pixelColArr[i] == 0) {
            vizGridArray[i].style.background = 'white'
        } else if (pixelColArr[i] == 1) {
            vizGridArray[i].style.background = 'black';
        } else {
            vizGridArray[i].style.background = 'red';
        }
    }
}, false);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// method to get the scanned data, look for matching brick 'types' 
// and send the results back to cityIO server for other apps to use 


var timer;
function cityIOrun(sendRate) {
    timer =
        window.setInterval("cityioPOST()", sendRate);
}

function cityIOstop() {
    clearInterval(timer);
}


function cityioPOST() {

    //reset typesArray var 
    typesArray = [];
    // if new data is back from webworker with colors
    if (pixelColArr.length > 1) {

        // find this brick's type using the cv color info 
        // and by matching the 4x4 pixels to known types
        // run through the 1D list of colors to reshape 
        //this into 4x4 matrices

        for (let j = 0; j < pixelColArr.length; j += Math.sqrt(pixelColArr.length) * 4) {
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
                ].toString()
                //avoid new lines and commas for clear list 
                thisBrick = thisBrick.replace(/,/g, "");

                //find the type for this bricks pattern in 'Codes'
                typesArray.push(cityIOstruct.objects.types[cityIOstruct.objects.codes
                    .indexOf(thisBrick)]);
            }
        }
        console.log(typesArray);

        //sending to cityIO 
        cityIOstruct.grid = typesArray;

        fetch("https://cityio.media.mit.edu/api/table/update/cityscopeJS", {
            method: "POST",
            mode: 'no-cors', // fix cors issue 
            body: JSON.stringify(cityIOstruct)
        }).then(
            (response) => {
                // console.log(response);
            });
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ColorPicker(matrixGridLocArray) {
    //get the scanners divs for thier locations 
    let matrixDiv = document.getElementsByClassName('transformedMatrix');
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
        let pixelArray = vidCanvas2dContext.getImageData(0, 0, window.innerWidth, window.innerHeight)
        //get the pixels
        let pixelData = pixelArray.data;
        for (let i = 0; i < matrixDiv.length; i++) {
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

            pixLoc = ((matrixGridLocArray[i][1] * innerWidth) + matrixGridLocArray[i][0]) * 4
            // sample and push to array 3 pixels around to get better recognition
            scannedColorsArray.push(
                //pixel before
                [pixelData[pixLoc - 4], pixelData[pixLoc - 3], pixelData[pixLoc - 2],
                //this  pixel
                pixelData[pixLoc], pixelData[pixLoc + 1], pixelData[pixLoc + 2],
                //next pixel
                pixelData[pixLoc + 4], pixelData[pixLoc + 5], pixelData[pixLoc + 6]])
        }
        //in every frame, send the scanned colors to web-worker for CV operation
        CVworker.postMessage(scannedColorsArray);

        //recursively call this method
        requestAnimationFrame(function () {
            ColorPickerRecursive();
        });
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// GUI 
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
        keySt: false,
        sendRate: 1000
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

    //collect 4 mouse clicks as corners of keystone 
    let clickArray = [];
    function mouseKeystone(e) {
        clickArray.push(e.x, e.y)
        infoDiv("Mouse click " + clickArray.length / 2 + " at " + e.x + ", " + e.y);
        // when 2x4 locations were added 
        if (clickArray.length == 8) {
            MatrixTransform(clickArray)
            //reset the clicks array 
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

    //cityio send rate 
    gui.add(parm, 'sendRate', 250, 2000).step(250).
        name("cityIO send [ms]").onChange(function (d) {
            sendRate = d;
            cityIOstop();
            cityIOrun(sendRate);
        });

    // gui.close();
}
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
////////////////////////////// APP LOGIC ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//call the media setup method at start
setupMedia(mediaToggle);
vizGrid();
interact();
cityIOrun(sendRate);
infoDiv();

