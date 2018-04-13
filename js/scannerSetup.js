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

//get div position
function getPos(el) {
    // yay readability
    for (var lx = 0, ly = 0;
        el != null;
        lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return ([lx, ly]);
}

