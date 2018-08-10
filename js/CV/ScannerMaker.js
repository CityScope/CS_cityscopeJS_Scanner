/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////SCAN LOGIC ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// a function to make the initial generic array of
//evenly divided grid points before distorting
export function scanArrayMaker(gridCols, gridRows) {
  var scanArrayPt = [];
  //get canvas ratio to divided by #-1 of points
  let ratX = camCanvas.width / (gridCols - 1);
  let ratY = camCanvas.height / (gridRows - 1);
  var gapInGrid = (0 * camCanvas.width) / 100;

  // let counter = 0;
  // let counter_inner = 0;

  for (let cols = 0; cols < camCanvas.height; cols += ratY * 4 + gapInGrid) {
    for (let rows = 0; rows < camCanvas.width; rows += ratX * 4 + gapInGrid) {
      //draw points if needed
      // svgKeystone.appendChild(
      //   svgCircle([rows, cols], "green", 3),
      //   svgText([rows, cols], counter, 15)
      // );

      for (let j = 0; j < ratY * 4; j += ratY) {
        for (let i = 0; i < ratX * 4; i += ratX) {
          //draw points if needed
          // svgKeystone.appendChild(
          //   svgText([rows + i, cols + j], counter_inner, 15),
          //   svgCircle([rows + i, cols + j], "green", 1)
          // );
          // counter_inner++;
          scanArrayPt.push([rows + i, cols + j]);
        }
      }
      // counter++;
    }
  }
  return scanArrayPt;
}
