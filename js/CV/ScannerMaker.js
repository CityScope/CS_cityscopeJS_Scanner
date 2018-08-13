import "../Storage";

import { svgCircle, svgText } from "../Modules";

// a function to make the initial generic array of
//evenly divided grid points before distorting
export function scanArrayMaker(gridCols, gridRows) {
  var camCanvas = Storage.camCanvas;
  var svgKeystone = window.svgKeystone;

  var scanArrayPt = [];
  //get canvas ratio to divided by #-1 of points
  let ratX = camCanvas.width / (gridCols - 1);
  let ratY = camCanvas.height / (gridRows - 1);
  var gapInGrid = (0 * camCanvas.width) / 100;

  for (let cols = 0; cols < camCanvas.height; cols += ratY * 4) {
    for (let rows = 0; rows < camCanvas.width; rows += ratX * 4) {
      for (let j = 0; j < ratY * 4; j += ratY) {
        for (let i = 0; i < ratX * 4; i += ratX) {
          scanArrayPt.push([rows + i, cols + j]);
        }
      }
    }
  }
  return scanArrayPt;
}
