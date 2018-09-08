import "../Storage";
import { updateInfoDIV } from "../UI/DATGUI";

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

  call a looping method that scans the grid
  [this is a hack, so this function could be called
  using 'requestAnimationFrame' API]

*/

export function ColorPicker() {
  updateInfoDIV("starting pixel scanner");
  //gets the anim frame
  var timerID;

  var loop = function() {
    var matrixGridLocArray = Storage.matrixGridLocArray;

    // empty color array for web-worker
    let scannedColorsArray = [];
    // read all pixels from canvas
    let vidCanvas2dContext = Storage.camCanvas.getContext("2d");
    let pixelArray = vidCanvas2dContext.getImageData(
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );
    //get the pixels
    let pixelData = pixelArray.data;
    for (let i = 0; i < matrixGridLocArray.length; i++) {
      let pixLoc =
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

    timerID = requestAnimationFrame(loop);
  };

  //controllers
  return {
    start: function() {
      timerID = requestAnimationFrame(loop);
    },
    cancel: function() {
      cancelAnimationFrame(timerID);
    }
  };
}
