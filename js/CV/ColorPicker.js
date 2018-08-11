import { cityIOinit } from "../CITYIO/cityio";
import { webWorkerListener } from "./WebWorkerListener";
import "../Storage";
/*    
get the pixel location at the center of the grid cell div
and match it to the pixel location in the PixelBuffer linear list
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

export function ColorPicker(matrixGridLocArray) {
  var camCanvas = Storage.camCanvas;
  console.log("starting pixel scanner");

  //start the WW listener before initial send
  webWorkerListener();

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
    var vidCanvas2dContext = camCanvas.getContext("2d");
    let pixelArray = vidCanvas2dContext.getImageData(
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );
    //get the pixels
    let pixelData = pixelArray.data;
    for (let i = 0; i < matrixGridLocArray.length; i++) {
      var pixLoc =
        (matrixGridLocArray[i][1] * innerWidth + matrixGridLocArray[i][0]) * 4;
      // sample and push to array 3 pixels around to get better recognition
      scannedColorsArray.push(
        //pixel before
        [
          pixelData[pixLoc - 4],
          pixelData[pixLoc - 3],
          pixelData[pixLoc - 2],
          //this  pixel
          pixelData[pixLoc],
          pixelData[pixLoc + 1],
          pixelData[pixLoc + 2],
          //next pixel
          pixelData[pixLoc + 4],
          pixelData[pixLoc + 5],
          pixelData[pixLoc + 6]
        ]
      );
    }
    //in every frame, send the scanned colors to web-worker for CV operation
    CVworker.postMessage(["pixels", scannedColorsArray]);

    //recursively call this method every frame
    requestAnimationFrame(function() {
      ColorPickerRecursive();
    });
  }

  // POST to cityIO rate in MS
  var sendRate = 1000;

  //at last, start sending to cityIO
  cityIOinit(sendRate);
}
