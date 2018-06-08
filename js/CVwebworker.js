/////////////////////////////////////////////////////////////////
//worker listen to web-worker calls 
self.addEventListener('message', function (msg) {
    CV(msg.data);
}, false)

/////////////////////////////////////////////////////////////////
//do CV on image data 
function CV(scannedPixels) {

    let threshold = 5;
    //reset array
    let pixelColArr = [];

    //sample 3 pixels [3x3 colors] each time 
    for (let i = 0; i < scannedPixels.length; i++) {
        avg_0 = 0.21 * scannedPixels[i][0] + 0.72 * scannedPixels[i][1] + 0.07 * scannedPixels[i][2];
        avg_1 = 0.21 * scannedPixels[i][3] + 0.72 * scannedPixels[i][4] + 0.07 * scannedPixels[i][5];
        avg_2 = 0.21 * scannedPixels[i][6] + 0.72 * scannedPixels[i][7] + 0.07 * scannedPixels[i][8];

        avg = (avg_0 + avg_1 + avg_2) / 3
        // decide if pixel color should be black or white 
        //based on avg function 
        if (avg > (256 / 2) + threshold) {
            pixelCol = 0;
        } else if (avg < (256 / 2) - threshold) {
            pixelCol = 1;
        } else {
            //3rd color 
            pixelCol = 2;
        }
        pixelColArr.push(pixelCol);
    }
    //return the cv results to main thread for visulaiztion & cityIO sending 
    self.postMessage(pixelColArr);
}
