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
//Global VARS 
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// web-worker
const CVworker = new Worker('js/CVwebworker.js');
// grid pixels size var
var gridSize = 40;
// POST to cityIO rate in MS
var sendRate = 1000;
// make visual grid representation
var vizGridArray = [];
// global var for colors returning from webworker
var pixelColArr = [];
//types and codes for cityIO objects 
var typesArray = [];
//default table name for cityIO
cityIOtableName = "CityScopeJS";
// media toggle 
var mediaToggle = true;
// Global var for GUI controls 
var brightness = 0
//make vid canvas
var webcamCanvas = document.createElement('canvas');
//another canvas for magnifying glass 
var magGlassCanvas = document.createElement('canvas');
//get main canvas context for scanning
var vidCanvas2dContext = webcamCanvas.getContext('2d');
//cityIO timer
var cityIOtimer;
//SVG element for keystone matrix 
var svgKeystone;
// load the SVGcdn to var 
var svgCDN = 'http://www.w3.org/2000/svg'

// cityIO structure for POST [should be extrenal] 
var cityIOstruct =
{
    "grid": [],
    "id": "",
    "objects": {
        "matrixMapping": [],
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
            //new 2x2 types 
            "2x2_0",
            "2x2_1",
            "2x2_2",
            "2x2_3",
            "2x2_4",
            "2x2_5"
        ],
        "codes": [
            "1000000000000000",
            "0100000000000000",
            "0010000000000000",
            "0001000000000000",
            //
            "0000100000000000",
            "0000010000000000",
            "0000001000000000",
            "0000000100000000",
            //
            "0000000010000000",
            "0000000001000000",
            "0000000000100000",
            "0000000000010000",
            //
            "0000000000001000",
            "0000000000000100",
            "0000000000000010",
            "0000000000000001",

            //new 2x2 types 
            "1100110000000000",
            "1111111100000000",
            "1100110000110011",
            "1111111111001100",
            "1111111111111111",
            "0000000000000000"
        ]
    },
    "header": {
        "name": cityIOtableName,
        "longName": "®©//Tactile|Scope|Matrix|City\\\©®",
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
// WEBCAM & MEDIA SETUP
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function setupCanvs() {
    webcamCanvas.id = "webcamCanvas";
    webcamCanvas.className = "webcamCanvas";
    //org. 960x720
    webcamCanvas.width = 800;
    webcamCanvas.height = 800;
    webcamCanvas.style.zIndex = 0;
    webcamCanvas.style.position = "absolute";
    webcamCanvas.style.border = "1px solid";
    document.body.appendChild(webcamCanvas);


    //SVG setup 
    var svgDiv = document.createElement("div");
    document.body.appendChild(svgDiv);
    svgDiv.id = 'svgDiv';
    svgDiv.width = webcamCanvas.width;
    svgDiv.height = webcamCanvas.height;
    svgDiv.className = "svgDiv";
    svgKeystone = document.createElementNS(svgCDN, 'svg');
    svgKeystone.className = "svgDiv";
    svgKeystone.setAttributeNS(null, 'width', webcamCanvas.width);
    svgKeystone.setAttributeNS(null, 'height', webcamCanvas.height);
    svgDiv.appendChild(svgKeystone);
}

////////////////////////////////////////////////////////////////////////////////////////////////

function setupMedia(mediaToggle, mirrorVid) {
    // make dummy image for testing
    var img = new Image();
    img.onload = function () {
        vidCanvas2dContext.drawImage(img, 0, 0, webcamCanvas.width, webcamCanvas.height);
    }
    //image location for the test image
    img.src = 'media/TESTS/16x16_lowres.png';
    ////////////////////
    // video setup
    ////////////////////
    if (mediaToggle) {
        infoDiv('starting video');
        //Video loop setup

        // call video mesh creator
        var width = 0;
        var height = 0;
        var video = document.createElement('video');
        video.addEventListener('loadedmetadata', function () {
            width = webcamCanvas.width;
            height = webcamCanvas.height;

            if (mirrorVid) {
                vidCanvas2dContext.translate(width, 0);
                vidCanvas2dContext.scale(-1, 1);
            }
            //call the video to canvas loop 
            loop();
        });
        video.setAttribute('autoplay', true);
        window.vid = video;

        //get the webcam stream

        navigator.getUserMedia({ video: true, audio: false }, function (stream) {
            video.srcObject = stream;
            track = stream.getTracks()[0];
        }, function (e) {
            infoDiv('Webcam issue!' + e);

        });
        function loop() {
            //loop the video to canvas method 
            requestAnimationFrame(loop);
            //draw the image before applying filters 
            // vidCanvas2dContext.drawImage(video, 0, 0, width, height);
            //apply filter every frame !! COSTLY
            vidCanvas2dContext.drawImage(video, 0, 0, width, height);

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
//////////////////////////////SCAN LOGIC ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//make an initial array of evenly
// divided grid points to scan
function scanArrayMaker() {
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
    infoDiv('Matrix Transformed 4 corners are at: ' + dstCorners);


    //matrix Grid Location Array
    var matrixGridLocArray = []
    // return a new visual Grid Locations Array
    let vizGridLocArray = scanArrayMaker();

    //set the reference points of the 4 edges of the canvas 
    // to get 100% of the image/video in canvas 
    //before distorting 
    srcCorners = [
        getPos(webcamCanvas)[0], getPos(webcamCanvas)[1],
        webcamCanvas.width, getPos(webcamCanvas)[1],
        getPos(webcamCanvas)[0], webcamCanvas.height,
        webcamCanvas.width, webcamCanvas.height
    ]

    //method to get div position
    function getPos(el) {
        // yay readability
        for (var lx = 0, ly = 0;
            el != null;
            lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
        return ([lx, ly]);
    }

    //var for the distorted points
    let dstPt;
    // use perspT lib to calculate transform matrix
    //and store the results of the 4 points dist. in var perspT
    let perspT;
    perspT = PerspT(srcCorners, dstCorners);

    //distort each dot in the matrix to locations and make cubes
    for (let j = 0; j < vizGridLocArray.length; j++) {
        dstPt = perspT.transform(vizGridLocArray[j][0], vizGridLocArray[j][1]);
        //display with SVG
        var scanPt = document.createElementNS(svgCDN, 'circle');
        scanPt.setAttributeNS(null, 'cx', dstPt[0]);
        scanPt.setAttributeNS(null, 'cy', dstPt[1]);
        scanPt.setAttributeNS(null, 'r', 1);
        scanPt.setAttributeNS(null, 'fill', '#f07');
        svgKeystone.appendChild(scanPt);
        //push these locs to an array for scanning 
        matrixGridLocArray.push([Math.floor(dstPt[0]), Math.floor(dstPt[1])]);
    }
    ColorPicker(matrixGridLocArray);
    dstCorners = [];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////
function vizGrid() {
    // make the grid div parent
    $('<DIV/>', {
        id: "vizCellDivParent",
        class: "vizCellDivParent"
    }).appendTo('body');
    //drag-able
    $('#vizCellDivParent').draggable();

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

//color the visual grid base on the web-worker cv analysis
CVworker.addEventListener('message', function (e) {
    pixelColArr = e.data;
    for (let i = 0; i < vizGridArray.length; i++) {
        if (pixelColArr[i] == 0) {
            vizGridArray[i].style.background = 'white'
        } else if (pixelColArr[i] == 1) {
            vizGridArray[i].style.background = 'black';
        } else {
            //if color scanning is in the threshold area 
            vizGridArray[i].style.background = 'magenta';
        }
    }
}, false);
infoDiv('setting up webworker listener');


/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ColorPicker(matrixGridLocArray) {
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
        for (let i = 0; i < matrixGridLocArray.length; i++) {
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
//cityIO
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// method to get the scanned data, look for matching brick 'types' 
// and send the results back to cityIO server for other apps to use 

function cityIOrun(sendRate) {
    cityIOtimer = window.setInterval("cityioPOST()", sendRate);
}

function cityIOstop() {
    clearInterval(cityIOtimer);
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
        // infoDiv(typesArray);

        //sending to cityIO 
        cityIOstruct.grid = typesArray;

        fetch("https://cityio.media.mit.edu/api/table/update/" +
            //get dynamic name change for table 
            cityIOtableName.toString(), {
                method: "POST",
                mode: 'no-cors', // fix cors issue 
                body: JSON.stringify(cityIOstruct)
            })
            .then(response => handleErrors(response),
                infoDiv("OK! sent to cityIO for table '" + cityIOtableName + "' at " + timeNow()))
            .catch(error => infoDiv(error));

        function handleErrors(response) {
            if (response.ok) {
                infoDiv("cityIO response: " + response.ok);
            }
            return response;
        }
    }
    //calc this time 
    function timeNow() {
        var d = Date.now();
        return new Date(d);
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////UI + INTERACTION /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// GUI 
function UI() {

    // dat.GUI
    var gui = new dat.GUI({ width: 300 });

    parm = {
        mirror: false,
        brightness: 0,
        cityIO: false,
        keySt: false,
        tableName: cityIOtableName,
        sendRate: 1000
    }

    //cityIO table name 
    gui.add(parm, 'tableName').name("table name").
        onFinishChange(function (e) {
            //delete old table name before making a new one
            //to keep Yasushi happy 
            fetch("https://cityio.media.mit.edu/api/table/clear/" +
                cityIOtableName.toString()
                , {
                    method: "GET",
                    mode: 'no-cors' // fix cors issue 
                });
            infoDiv("cityIO table name is now: " + e);
            //get the new table name 
            cityIOtableName = e;
        });

    //cityio send rate 
    gui.add(parm, 'sendRate', 250, 2000).step(250).
        name("cityIO send [ms]").onChange(function (d) {
            sendRate = d;
            cityIOstop();
            cityIOrun(sendRate);
        });

    // webcam toggle
    gui.add(parm, "mirror").name("mirror webcam").onChange(function () {
        let bool;
        bool = !bool;
        setupMedia(true, bool);
    });

    //brightness control 
    gui.add(parm, 'brightness', -100, 100).
        name("brightness").onChange(function (i) {
            brightness = i;
            brightnessCanvas(i, vidCanvas2dContext)
        });

    // keystone toggle
    gui.add(parm, "keySt")
        .name("toggle Keystoning")
        .listen()
        .onChange(function (bool) {
            keystoneUI(bool, gui);
        });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function keystoneUI(bool, gui) {

    if (bool) {
        document.addEventListener('click', mouseKeystone);
        infoDiv("starting keystone" + '<\p>' + "NOTE: make sure to select the croners of the scanned area!");
        //clear prev. svg contanier 
        $(svgKeystone).empty();

        // mag. glass [WIP - should remove when off] 
        document.body.appendChild(magGlassCanvas);
        magGlassCanvas.id = "magGlass";
        magGlassCanvas.className = "magGlassCanvas";
        magWid = magGlassCanvas.width = 100;
        magGlassCanvas.height = magWid;
        magGlassCanvas.style.zIndex = 100;
        var magGlassCtx = magGlassCanvas.getContext("2d");
        //
        document.addEventListener("mousemove", function (e) {
            $('html,body').css('cursor', 'crosshair');
            // console.log(e.pageX, e.pageY);
            magGlassCtx.clearRect(0, 0, magWid, magWid);
            magGlassCtx.drawImage(webcamCanvas,
                e.pageX - (magWid / 16), e.pageY - (magWid / 16), 100, 100,
                0, 0, webcamCanvas.width, webcamCanvas.height);
            magGlassCanvas.style.top = e.pageY - (magWid / 2) + "px";
            magGlassCanvas.style.left = e.pageX - (magWid / 2) + "px";
            magGlassCanvas.style.display = "block";
            magGlassCanvas.style.position = "absolute";
            magGlassCanvas.style.border = '2px black solid';

        });

        document.addEventListener("mouseout", function () {
            magGlassCanvas.style.display = "none";
        });


        //make room by hiding gui 
        gui.close();

    } else {
        document.removeEventListener('click', mouseKeystone);
        magGlassCanvas.style.display = "none";
    }
    //flip bool
    bool = !bool
    //collect 4 mouse clicks as corners of keystone 
    let clickArray = [];

    // react to mouse events 
    function mouseKeystone(e) {
        // only collect clicks that are in the canvas area 
        if (e.x < webcamCanvas.width && e.y < webcamCanvas.height) {
            //pop. array of clicks 
            clickArray.push(e.x, e.y);
            infoDiv("Mouse click " + clickArray.length / 2 + " at " + e.x + ", " + e.y);
            //viz points with svg 
            var keystonePt = document.createElementNS(svgCDN, 'circle');
            keystonePt.setAttributeNS(null, 'cx', e.x);
            keystonePt.setAttributeNS(null, 'cy', e.y);
            keystonePt.setAttributeNS(null, 'r', 8);
            keystonePt.setAttributeNS(null, 'stroke', '#00b7f9');
            keystonePt.setAttributeNS(null, 'stroke-width', '2');
            keystonePt.setAttributeNS(null, 'fill-opacity', '0');
            svgKeystone.appendChild(keystonePt);
            // when 2x4 locations were added 
            if (clickArray.length == 8) {
                MatrixTransform(clickArray);
                //save these keystone points 
                saveSettings(clickArray);
                //reset the clicks array 
                clickArray = [];
                //turn off keystone toggle in gui 
                parm['keySt'] = false;
                // and stop keystone mouse clicks 
                document.removeEventListener('click', mouseKeystone);
                //open gui when done 
                gui.open();
            }
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//save keystone
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var saveSettings = function (clickArray) {
    infoDiv('saving keystone to localStorage in \'CityScopeJS_keystone\' key');

    localStorage.setItem('CityScopeJS_keystone', JSON.stringify(clickArray));
};

var loadSettings = function () {
    if (localStorage.getItem('CityScopeJS_keystone')) {
        var data = JSON.parse(localStorage.getItem('CityScopeJS_keystone'));
        return data;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//make info div [on screen console] or add text to it 
function infoDiv(text) {
    let d = document.getElementById('infoDiv')
    if (d === null) {
        //make info div
        $('<DIV/>', {
            id: "infoDiv",
            class: "info"
        }).appendTo('body');
        $('#infoDiv').draggable();

    } else {
        // clear div if too much text 
        if (d.scrollHeight > 5000) {
            d.innerHTML = null;
        } else {
            d.innerHTML += text.toString() + '<p></p>';
            d.scrollTop = d.scrollHeight;
        }
    }
    return;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// APP LOGIC ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//call the media setup method at start
infoDiv('starting CityScopeJS applet');
setupCanvs();
setupMedia(mediaToggle);
vizGrid();
UI();
cityIOrun(sendRate);

//On load, load settings 
//from localStorage if exists 
if (loadSettings()) {
    infoDiv("found keystoning setup >>");
    infoDiv("...Loading prev. keystoning");
    MatrixTransform(loadSettings());
}
