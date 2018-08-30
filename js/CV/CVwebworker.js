//global var for structure of table
var cityIOdataStruct;

//worker listen to web-worker calls
self.addEventListener(
  "message",
  function(msg) {
    if (msg.data[0] == "pixels") {
      CV(msg.data[1]);
    } else if (msg.data[0] === "cityIOsetup") {
      cityIOdataStruct = msg.data[1];
      console.log("webWorker got settings for " + cityIOdataStruct.header.name);
    }
  },
  false
);

/////////////////////////////////////////////////////////////////
//do CV on image data
function CV(scannedPixels) {
  //set threshold for unclear color
  // between black and white
  let threshold = 5;
  //reset array
  let pixColArr = [];
  //reset types array
  let typesArray = [];
  //retun this msg to main thread
  let webworkerMsg = [];

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

  ///////////////////////////////////////////////////////////////////////////

  function typesLookup(pixelColorArray) {
    // find this brick's type using the found color info
    // by matching the 16[4x4] pixels to known types
    // by running through the 1D list of colors
    for (let i = 0; i < pixColArr.length; i = i + 16) {
      let thisBrick = [];
      for (let j = 0; j < 16; j++) {
        thisBrick.push(pixelColorArray[i + j]);
      }
      //remove new lines and commas to get a clear list
      thisBrick = thisBrick.join("");

      //before sending back to main thread for cityIO POST,
      //look for this bricks pattern in 'Codes' property
      let indexCode = cityIOdataStruct.objects.codes.indexOf(thisBrick);
      //check if this type is not known
      //and not becouse it has '2' color
      if (indexCode === -1 && !thisBrick.includes("2")) {
        indexCode = checkRotatedBrick(thisBrick);
      }
      typesArray.push(indexCode);
    }
    return typesArray;
  }

  /////////////////////////////////////////////////////////////////
  //send back the location of this type in the types list
  //return 2 msgs  to main thread:
  // 1. the type found in cv
  // 2. colors for  visualization & cityIO sending
  webworkerMsg.push(typesLookup(pixColArr), pixColArr);
  self.postMessage(webworkerMsg);
}

/////////////////////////////////////////////////////////////////
/**
 * http://jsfiddle.net/FloydPink/0fg4rLf9/

 
 
////
1,2,3,4
5,6,7,8
9,10,11,12
13,14,15,16

1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16

-->
13,9,5,1
14,10,6,2
15,11,7,3
16,12,8,4

13,9,5,1,14,10,6,2,15,11,7,3,16,12,8,4

-->
16,15,14,13,
12,11,10,9,
8,7,6,5,
4,3,2,1

16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1

-->
4,8,12,16,
3,7,11,15,
2,6,10,14,
1,5,9,13

4,8,12,16,3,7,11,15,2,6,10,14,1,5,9,13


1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16
13,9,5,1,14,10,6,2,15,11,7,3,16,12,8,4
16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1
4,8,12,16,3,7,11,15,2,6,10,14,1,5,9,13

 */

//https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript

function checkRotatedBrick(thisBrick) {
  thisBrick = Array.from(thisBrick);
  let arrBrick = [
    thisBrick.slice(0, 4),
    thisBrick.slice(4, 8),
    thisBrick.slice(8, 12),
    thisBrick.slice(12, 16)
  ];
  console.log("Org: ", arrBrick);
  console.log("first: ", rotateMatrix(arrBrick));
  console.log("Second:", rotateMatrix(arrBrick));
}

// filp functions
const flipMatrix = matrix =>
  matrix[0].map((column, index) => matrix.map(row => row[index]));
const rotateMatrix = matrix => flipMatrix(matrix.reverse());
