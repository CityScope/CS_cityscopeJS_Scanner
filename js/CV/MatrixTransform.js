import { scanArrayMaker } from "./ScannerMaker";
var PerspT = require("perspective-transform");
import { svgCircle } from "../UI/UItools";
import { ColorPicker } from "./ColorPicker";
import "../Storage";

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//create the scanning transposed matrix
export function MatrixTransform(dstCorners) {
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
  perspTres = PerspT(srcCorners, dstCorners);

  var svgPntsArray = [];
  var svgKeystone = document.querySelector("#svgKeystone");

  //distort each dot in the matrix to locations and make cubes
  for (let j = 0; j < vizGridLocArray.length; j++) {
    dstPt = perspTres.transform(vizGridLocArray[j][0], vizGridLocArray[j][1]);
    //push these locs to an array for scanning
    matrixGridLocArray.push([Math.floor(dstPt[0]), Math.floor(dstPt[1])]);

    //create visuals points on canvas for ref and add to array
    svgPntsArray.push(
      svgKeystone.appendChild(
        svgCircle(dstPt, "#ffffff", 1, 1, "#000000", 0.25)
      )
    );
    //save to Storage class
    Storage.svgPntsArray = svgPntsArray;
    //Optional: show text for each pixel
    // svgKeystone.appendChild(svgText(dstPt, j, 8));
  }
  //send points to Color Scanner fn.
  ColorPicker(matrixGridLocArray);
  dstCorners = [];
  console.log("Matrix Transformed 4 corners are at: " + dstCorners);
}

//method to get div position
function getPos(el) {
  // yay readability
  for (
    var lx = 0, ly = 0;
    el != null;
    lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent
  );
  return [lx, ly];
}
