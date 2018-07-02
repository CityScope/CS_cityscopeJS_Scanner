// to try https://dev.to/johnpaulada/synchronous-fetch-with-asyncawait

var tableName = window.location.search.substring(1);
let cityIOtableURL =
  "https://cityio.media.mit.edu/api/table/" + tableName.toString();

//start applet
window.onload = setup();

var globalColors = [
  "#CCD9CE",
  "#F4B99E",
  "#F4827D",
  "#FDCAA2",
  "#263C3A",
  "#A5BBB9",
  "#CCD9CE",
  "#263C3A",
  "#F6ECD4",
  "#CCD9CE",
  "#A5BBB9",
  "#A3BFA2",
  "#668a87",
  "#ED5066",
  "#F6ECD4",
  "#F4B99E",
  "#405654",
  "#263C3A",
  "#F4827D",
  "#263C3A",
  "#668a87",
  "#FDCAA2",
  "#F6ECD4",
  "#80ADA9",
  "#ED5066",
  "#263C3A",
  "#80ADA9",
  "#ED5066",
  "#F4827D",
  "#A5BBB9",
  "#668a87",
  "#405654",
  "#405654",
  "#FDCAA2",
  "#A3BFA2",
  "#263C3A",
  "#A3BFA2",
  "#80ADA9"
];

async function getCityIO(URL) {
  // GET method
  return $.ajax({
    url: URL,
    dataType: "JSON",
    callback: "jsonData",
    type: "GET",
    success: function(jsonData) {
      // console.log("got cityIO table at " + jsonData.meta.timestamp);
      return jsonData;
    },
    // or error
    error: function() {
      console.log("ERROR");
    }
  });
}

async function setup() {
  //call server once at start, just to setup the grid
  const cityIOjson = await getCityIO(cityIOtableURL);
  // get grid size
  var gridSizeCols = cityIOjson.header.spatial.ncols;
  var gridSizeRows = cityIOjson.header.spatial.nrows;
  var cellSizeHandler = null;
  //check for larger count of cols/rows to
  //determain which sets cell size
  if (gridSizeCols > gridSizeRows) {
    cellSizeHandler = gridSizeCols;
  } else {
    cellSizeHandler = gridSizeRows;
  }
  console.log("table size is", gridSizeCols, "x", gridSizeRows);
  // make the table div
  let tableDiv = document.createElement("div");
  tableDiv.id = "tableDiv";
  tableDiv.className = "tableDiv";
  document.body.appendChild(tableDiv);

  //make the grid parent
  let gridParentDiv = document.createElement("div");
  gridParentDiv.className = "gridParentDiv";
  tableDiv.appendChild(gridParentDiv);

  //cell sized in viz grid
  let cellSize =
    (gridParentDiv.clientWidth / cellSizeHandler).toString() + "px";
  //
  window.setInterval("update()", 1000);
  //
  Maptastic("tableDiv");
}

async function update() {
  const cityIOjson = await getCityIO(cityIOtableURL);
  renderUpdate(cityIOjson);
}

async function renderUpdate(jsonData) {
  console.log(jsonData);
}
