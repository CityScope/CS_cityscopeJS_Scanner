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
// checks if this brick string is actually a rotated brick

function checkRotatedBrick(thisBrick) {
  /*
For 1110111111111111, check:
 0  "1110 1111 1111 1111"
 4  "1111 1111 1111 1110"
 8  "1111 1111 1110 1111"
 12 "1111 1110 1111 1111"
*/

  console.log(thisBrick);
  let newIndex = -1;
  for (let i = 0; i < thisBrick.length; i = i + 4) {
    var shiftedString = thisBrick.slice(i) + thisBrick.slice(0, i);
    newIndex = cityIOdataStruct.objects.codes.indexOf(shiftedString);
    if (newIndex !== -1) {
      console.log(newIndex);
      return newIndex;
    }
  }
  // console.log(newIndex);
  return newIndex;
}
