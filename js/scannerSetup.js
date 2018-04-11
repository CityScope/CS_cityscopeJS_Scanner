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
