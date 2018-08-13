import { scanArrayMaker } from "./ScannerMaker";
var PerspT = require("perspective-transform/dist/perspective-transform");
import { ColorPicker } from "./ColorPicker";
import "../Storage";
import { svgCircle } from "../Modules";

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

  // returns a new baseline grid of locations as Array
  let initGridArr = scanArrayMaker(gridCols, gridRows);

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
  for (let j = 0; j < initGridArr.length; j++) {
    dstPt = perspTres.transform(initGridArr[j][0], initGridArr[j][1]);
    // Draw the grid and put it in an array
    svgPntsArray.push(drawPnt(dstPt));
    //push these locs to an array for scanning
    matrixGridLocArray.push([Math.floor(dstPt[0]), Math.floor(dstPt[1])]);
  }

  //save to Storage class
  Storage.svgPntsArray = svgPntsArray;
  //save points to Storage
  Storage.matrixGridLocArray = matrixGridLocArray;
  Storage.console = "Matrix Transformed 4 corners are at: " + gridCorners;

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function drawPnt(dstPt) {
  //create visuals points on canvas for ref and add to array
  var thisPnt = svgKeystone.appendChild(
    svgCircle(dstPt, "magenta", 1.5, 0.8, "#000000", 0.25)
  );
  return thisPnt;
  /*  
  // show text for each grid pnt
  svgKeystone.appendChild(svgText(dstPt, j, 8));
  //Save for basline grid draw
  let counter = 0;
  let counter_inner = 0;
  // draw points if needed
  let t = svgText([rows, cols], counter, 5);
  let c = svgCircle([rows, cols], "green", 10, 1, "green", 10);
  let c2 = svgCircle([rows + i, cols + j], "green", 10, 1, "green", 2);
  let t2 = svgText([rows + i, cols + j], counter_inner, 2);
  svgKeystone.appendChild(c2, t2);
  //
  counter_inner++;
  counter++;
  */
}
