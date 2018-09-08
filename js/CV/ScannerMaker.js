import "../Storage";
import { _ } from "core-js";

// a function to make the initial generic array of
//evenly divided grid points before distorting
export function scanArrayMaker(gridCols, gridRows) {
  let gap = Storage.cellGap;
  var camCanvas = Storage.camCanvas;

  var initialScannerGridArr = [];
  //get canvas ratio to divided by #-1 of points
  let ratX = camCanvas.width / (gridCols - 1);
  let ratY = camCanvas.height / (gridRows - 1);

  for (let cols = 0; cols < camCanvas.height + gap; cols += gap + ratY * 4) {
    for (let rows = 0; rows < camCanvas.width + gap; rows += gap + ratX * 4) {
      for (let j = 0; j < ratY * 4 - gap; j += ratY - gap / 4) {
        for (let i = 0; i < ratX * 4 - gap; i += ratX - gap / 4) {
          initialScannerGridArr.push([rows + i, cols + j]);
        }
      }
    }
  }
  return initialScannerGridArr;
}
