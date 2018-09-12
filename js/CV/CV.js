import "../Storage";
import { updateInfoDIV } from "../UI/DATGUI";

///////////////////////////////////////////////////////////////////////////
/*    
get the pixel location at the center of the grid cell div
and match it to the pixel location in the PixelBuffer linear list
call a looping method that scans the grid
[this is a hack, so this function could be called
using 'requestAnimationFrame' API]
*/

export function ColorPicker() {
  updateInfoDIV("starting pixel scanner");
  //gets the animation frame
  var timerID;

  var scannerLoop = function() {
    var matrixGridLocArray = Storage.matrixGridLocArray;

    // empty color array for web-worker
    let scannedColorsArray = [];
    // read all pixels from canvas
    let vidCanvas2dContext = Storage.camCanvas.getContext("2d");
    let canvasPixels = vidCanvas2dContext.getImageData(
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );
    //get the pixels
    let canvasData = canvasPixels.data;
    for (let i = 0; i < matrixGridLocArray.length; i++) {
      let pixLoc =
        (matrixGridLocArray[i][1] * innerWidth + matrixGridLocArray[i][0]) * 4;
      // sample and push to array 3 pixels around to get better recognition
      scannedColorsArray.push(
        //pixel before
        [
          canvasData[pixLoc - 4],
          canvasData[pixLoc - 3],
          canvasData[pixLoc - 2],
          //this  pixel
          canvasData[pixLoc],
          canvasData[pixLoc + 1],
          canvasData[pixLoc + 2],
          //next pixel
          canvasData[pixLoc + 4],
          canvasData[pixLoc + 5],
          canvasData[pixLoc + 6]
        ]
      );
    }

    // call the CV method for color analysis
    CV(scannedColorsArray);

    //recursively call this method every frame
    timerID = requestAnimationFrame(scannerLoop);
  };

  //controllers
  return {
    start: function() {
      timerID = requestAnimationFrame(scannerLoop);
    },
    cancel: function() {
      cancelAnimationFrame(timerID);
    }
  };
}

///////////////////////////////////////////////////////////////////////////
//do CV on image data
export function CV(scannedPixels) {
  //set threshold for unclear color
  // between black and white
  let threshold = 5;
  let avg, avg_0, avg_1, avg_2, pixelCol;
  //reset array
  let pixColArr = [];

  //sample 3 pixels [3x3 colors] each time
  for (let i = 0; i < scannedPixels.length; i++) {
    avg_0 =
      0.21 * scannedPixels[i][0] +
      0.72 * scannedPixels[i][1] +
      0.07 * scannedPixels[i][2];
    avg_1 =
      0.21 * scannedPixels[i][3] +
      0.72 * scannedPixels[i][4] +
      0.07 * scannedPixels[i][5];
    avg_2 =
      0.21 * scannedPixels[i][6] +
      0.72 * scannedPixels[i][7] +
      0.07 * scannedPixels[i][8];

    avg = (avg_0 + avg_1 + avg_2) / 3;
    // decide if pixel color should be black or white
    //based on avg function
    if (avg > 256 / 2 + threshold) {
      //black
      pixelCol = 0;
    } else if (avg < 256 / 2 - threshold) {
      //white
      pixelCol = 1;
    } else {
      //3rd color
      pixelCol = 2;
    }
    pixColArr.push(pixelCol);
  }
  Storage.pixelColArr = pixColArr;
  typesLookup(pixColArr);
}

///////////////////////////////////////////////////////////////////////////
//send back the location of this type in the types list
// 1. the type found in cv
// 2. colors for  visualization & cityIO sending
// find this brick's type using the found color info
// by matching the 16[4x4] pixels to known types
// by running through the 1D list of colors

export function typesLookup(pixelColorArray) {
  let typesArray = [];

  for (let i = 0; i < pixelColorArray.length; i = i + 16) {
    let thisBrick = [];
    for (let j = 0; j < 16; j++) {
      thisBrick.push(pixelColorArray[i + j]);
    }
    //remove new lines and commas to get a clear list
    thisBrick = thisBrick.join("");

    //before sending back to main thread for cityIO POST,
    //look for this bricks pattern in 'Codes' property
    let indexCode = Storage.cityIOdataStruct.objects.codes.indexOf(thisBrick);

    /*
    // WIP ROTATION
    //check if this type is not known
    //and not because it has '2' color
    if (indexCode === -1 && !thisBrick.includes("2")) {
      indexCode = checkRotatedBrick(thisBrick, cityIOdataStruct.objects.codes);
    }
    */

    typesArray.push(indexCode);
  }
  Storage.typesArray = typesArray;
  return typesArray;
}

/////////////////////////////////////////////////////////////////
export function checkRotatedBrick(thisBrick, codes) {
  //convert this brick  string to array
  thisBrick = Array.from(thisBrick);

  // console.log("-----------NEW BRICK-----------");

  //convert the array to 2 matrix of 4 arrays
  let arrBrick = [
    thisBrick.slice(0, 4),
    thisBrick.slice(4, 8),
    thisBrick.slice(8, 12),
    thisBrick.slice(12, 16)
  ];
  //rotate this matrix 90 deg CCW [left]
  // and convert back to string
  let brickCCW270 = rotMtrxCCW(arrBrick)
    .toString()
    .replace(/,/g, "");
  // console.log("270 ", brickCCW270);
  //check the brick aginst the codes array
  let indexCode = codes.indexOf(brickCCW270);
  //if brick is a type in codes
  if (indexCode !== -1) {
    //return it
    // console.log(indexCode);

    return indexCode;
    //if brick is not a type in codes
  } else {
    //rotate it again
    let brickCCW180 = rotMtrxCCW(rotMtrxCCW(arrBrick))
      .toString()
      .replace(/,/g, "");
    // console.log("180", brickCCW180);
    //check the brick aginst the codes array
    let indexCode = codes.indexOf(brickCCW180);
    if (indexCode !== -1) {
      //return it
      // console.log(indexCode);

      return indexCode;
      //if brick is not a type in codes
    } else {
      //rotate it again
      let brickCCW90 = rotMtrxCCW(rotMtrxCCW(rotMtrxCCW(arrBrick)))
        .toString()
        .replace(/,/g, "");
      // console.log("90", brickCCW90);
      //check the brick aginst the codes array
      let indexCode = codes.indexOf(brickCCW90);
      //
      if (indexCode !== -1) {
        //return it
        // console.log(indexCode);

        return indexCode;
        //conclude that this is not a type
      } else return -1;
    }
  }
}

// flip function
const flipMatrix = matrix =>
  matrix[0].map((column, index) => matrix.map(row => row[index]));
const rotMtrxCCW = matrix => flipMatrix(matrix).reverse();
