import { scanArrayMaker } from "./ScannerMaker";
var PerspT = require("perspective-transform/dist/perspective-transform");
import { ColorPicker } from "./ColorPicker";
import "../Storage";
import { svgCircle, saveSettings, loadSettings } from "../Modules";

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//GLOBAL FOR NOW
let colorPicker = new ColorPicker();

//create the scanning transposed matrix
export function MatrixTransform(gridCorners) {
  //get canvas from Storage
  var camCanvas = Storage.camCanvas;
  var cityIOdataStruct = Storage.cityIOdataStruct;

  //amount of grid pixels from settings JSON
  var gridCols = cityIOdataStruct.header.spatial.ncols * 4;
  var gridRows = cityIOdataStruct.header.spatial.nrows * 4;

  //matrix Grid Location Array
  var matrixGridLocArray = [];

  // return a new visual Grid Locations Array
  let vizGridLocArray = scanArrayMaker(gridCols, gridRows);

  //set the reference points of the 4 edges of the canvas
  // to get 100% of the image/video in canvas
  //before distorting
  var srcCorners = [
    getPos(camCanvas)[0],
    getPos(camCanvas)[1],
    camCanvas.width,
    getPos(camCanvas)[1],
    getPos(camCanvas)[0],
    camCanvas.height,
    camCanvas.width,
    camCanvas.height
  ];

  //var for the distorted points
  let dstPt;
  // use perspT lib to calculate transform matrix
  //and store the results of the 4 points dist. in var perspT
  let perspTres;
  perspTres = PerspT(srcCorners, gridCorners);

  var svgPntsArray = [];
  var svgKeystone = document.querySelector("#svgKeystone");
  // clear SVG at start
  svgKeystone.innerHTML = "";

  //distort each dot in the matrix to locations and make cubes
  for (let j = 0; j < vizGridLocArray.length; j++) {
    dstPt = perspTres.transform(vizGridLocArray[j][0], vizGridLocArray[j][1]);
    //push these locs to an array for scanning
    matrixGridLocArray.push([Math.floor(dstPt[0]), Math.floor(dstPt[1])]);

    //SHOULD TAKE OUT FROM HERE
    //create visuals points on canvas for ref and add to array
    svgPntsArray.push(
      svgKeystone.appendChild(
        svgCircle(dstPt, "magenta", 1.5, 0.8, "#000000", 0.25)
      )
    );
    //Optional: show text for each pixel
    // svgKeystone.appendChild(svgText(dstPt, j, 8));
  }

  //save to Storage class
  Storage.svgPntsArray = svgPntsArray;
  console.log("Matrix Transformed 4 corners are at: " + gridCorners);

  //save points to Storage
  Storage.matrixGridLocArray = matrixGridLocArray;

  //start picking colors
  colorPicker.cancel();
  colorPicker.start();
  //
  gridCorners = [];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//method to get this div position
function getPos(divPos) {
  // yay readability
  for (
    var lx = 0, ly = 0;
    divPos != null;
    lx += divPos.offsetLeft,
      ly += divPos.offsetTop,
      divPos = divPos.offsetParent
  );
  return [lx, ly];
}
