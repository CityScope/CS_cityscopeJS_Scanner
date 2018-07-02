/*/////////////////////////////////////////////////////////////////////////////////////////////////////////

{{ CityScopeJS }}
Copyright (C) {{ 2018 }}  {{ Ariel Noyman }}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

/////////////////////////////////////////////////////////////////////////////////////////////////////////

CityScopeJS -- decoding 2d array of black and white LEGO bricks, parsing and sending to remote server.
"@context": "https://github.com/CityScope/", "@type": "Person", "address": {
"@type": "75 Amherst St, Cambridge, MA 02139", "addressLocality":
"Cambridge", "addressRegion": "MA",}, 
"jobTitle": "Research Scientist", "name": "Ariel Noyman",
"alumniOf": "MIT", "url": "http://arielnoyman.com", 
"https://www.linkedin.com/", "http://twitter.com/relno",
https://github.com/RELNO]

*/ ////////////////////////////////////////////////////////////////////////////////////////////////////////

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
      pixelCol = 0;
    } else if (avg < 256 / 2 - threshold) {
      pixelCol = 1;
    } else {
      //3rd color
      pixelCol = 2;
    }
    pixColArr.push(pixelCol);
  }

  ///////////////////////////////////////////////////////////////////////////

  function typesLookup(pixelColorArray) {
    let numColumns = cityIOdataStruct.header.spatial.ncols;
    // find this brick's type using the found color info
    // and by matching the 4x4 pixels to known types
    // run through the 1D list of colors to reshape
    //this into 4x4 matrices

    for (
      let thisCol = 0;
      thisCol < pixelColorArray.length;
      thisCol += numColumns * 4
    ) {
      // x zero y zero top left going down on y in jumps of 4
      for (let r = 0; r < 1; r = r + 4) {
        //reshape pixels to lists of 16 bits, or one brick [should be rewritten cleaner]
        let thisBrick = [
          //first row
          pixelColorArray[r + thisCol],
          pixelColorArray[r + thisCol + numColumns],
          pixelColorArray[r + thisCol + numColumns * 2],
          pixelColorArray[r + thisCol + numColumns * 3],
          //second row
          pixelColorArray[r + thisCol + 1],
          pixelColorArray[r + thisCol + 1 + numColumns],
          pixelColorArray[r + thisCol + 1 + numColumns * 2],
          pixelColorArray[r + thisCol + 1 + numColumns * 3],
          //third row
          pixelColorArray[r + thisCol + 2],
          pixelColorArray[r + thisCol + 2 + numColumns],
          pixelColorArray[r + thisCol + 2 + numColumns * 2],
          pixelColorArray[r + thisCol + 2 + numColumns * 3],
          //forth row
          pixelColorArray[r + thisCol + 3],
          pixelColorArray[r + thisCol + 3 + numColumns],
          pixelColorArray[r + thisCol + 3 + numColumns * 2],
          pixelColorArray[r + thisCol + 3 + numColumns * 3]
        ].toString();

        //avoid new lines and commas for clear list
        thisBrick = thisBrick.replace(/,/g, "");

        //before sending to cityIO, look for
        //the right type for this bricks pattern in 'Codes'
        typesArray.push(
          //send back the location of this type in the types list
          cityIOdataStruct.objects.codes.indexOf(thisBrick)
        );
      }
    }
    return typesArray;
  }

  /////////////////////////////////////////////////////////////////
  //return 2 msgs  to main thread:
  // 1. the type found in cv
  // 2. colors for  visulaiztion & cityIO sending
  webworkerMsg.push(typesLookup(pixColArr), pixColArr);
  self.postMessage(webworkerMsg);
}
