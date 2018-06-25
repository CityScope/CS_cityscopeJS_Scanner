// to try https://dev.to/johnpaulada/synchronous-fetch-with-asyncawait
// 0-9 housing
// 10-19 Work
// 20-21 green

var tableName = window.location.search.substring(1);
let cityIOtableURL =
  "https://cityio.media.mit.edu/api/table/" + tableName.toString();

//start applet
window.onload = setup();
window.setInterval("update()", 500);

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
  let gridSize = cityIOjson.header.spatial.ncols;
  console.log("table size is", gridSize, "x", gridSize);

  // make the table div
  let tableDiv = document.createElement("div");
  tableDiv.id = "tableDiv";
  tableDiv.className = "tableDiv";
  document.body.appendChild(tableDiv);

  // make the table text info div
  let tableInfoDiv = document.createElement("div");
  tableInfoDiv.id = "tableInfoDiv";
  tableInfoDiv.className = "tableInfoDiv";
  tableDiv.appendChild(tableInfoDiv);
  tableInfoDiv.innerHTML =
    "<span style='font-size:2vw'>CityScopeJS</span>" +
    "</p>" +
    "Table id# '" +
    tableName +
    "'" +
    "</p>" +
    "CityScopeJS is a WIP platform aimed at making CityScope accessible though the ubiquity of web-enabled devices. CityScopeJS runs entirely in the browser, including CV, projection and spatial analysis.";

  //make the grid parent
  let gridParentDiv = document.createElement("div");
  gridParentDiv.className = "gridParentDiv";
  tableDiv.appendChild(gridParentDiv);

  //cell sized in viz grid
  let cellSize = (gridParentDiv.clientWidth / gridSize).toString() + "px";
  // make the visual rep of the now distorted grid
  for (let i = 0; i < gridSize; i++) {
    var rawDiv = document.createElement("div");
    gridParentDiv.appendChild(rawDiv);
    rawDiv.className = "vizRaws";
    rawDiv.style.width = cellSize;
    rawDiv.style.height = cellSize * i;
    for (let j = 0; j < gridSize; j++) {
      var vizCell = document.createElement("div");
      vizCell.className = "vizCell shadow";
      rawDiv.appendChild(vizCell);
      vizCell.style.width = cellSize;
      vizCell.style.height = cellSize;
    }
  }
  Maptastic("tableDiv");
}

async function update() {
  const cityIOjsonNew = await getCityIO(cityIOtableURL);
  viz(cityIOjsonNew);
}

async function viz(jsonData) {
  let cells = document.getElementsByClassName("vizCell");

  for (let i = 0; i < cells.length; i++) {
    //get the key for this type
    let typeIndex = jsonData.grid[i];
    if (typeIndex == -1) {
      cells[i].style.backgroundColor = "rgb(10,10,10)";
    } else {
      cells[i].innerHTML = jsonData.header.mapping.type[typeIndex];
      cells[i].style.backgroundColor = globalColors[typeIndex];
    }
  }
}
