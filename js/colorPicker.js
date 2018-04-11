/////////////////////////////////////////////////////////////////////////////////////////////////////////

function ColorPicker() {
    // empty color array for web-worker
    let scannedColorsArray = [];
    // read all pixels in  canvas
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
    //recursively call this method
    requestAnimationFrame(function () {
        ColorPicker();
    });
    //send the scanned colors to web-worker for CV operation
    CVworker.postMessage(scannedColorsArray);
}

