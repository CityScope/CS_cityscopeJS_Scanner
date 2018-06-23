// to try https://dev.to/johnpaulada/synchronous-fetch-with-asyncawait
// 0-9 housing
// 10-19 Work
// 20-21 green

var tableName = window.location.search.substring(1);
let cityIOtableURL =
  "https://cityio.media.mit.edu/api/table/" + tableName.toString();
let cityIOlist = "https://cityio.media.mit.edu/api/tables/list";

if (cityIOlist.includes(cityIOtableURL)) {
  //start applet
  window.onload = setup();
  window.setInterval("update()", 500);
} else {
  console.log("URL not found");
}

var globalColors = [
  "#ED5066",
  "#A3BFA2",
  "#F4827D",
  "#F4B99E",
  "#FDCAA2",
  "#F6ECD4",
  "#CCD9CE",
  "#A5BBB9",
  "#A3BFA2",
  "#80ADA9",
  "#668a87",
  "#405654",
  "#263C3A",
  "#263C3A",
  "#14181a"
];

async function getCityIO(URL) {
  // GET method
  return $.ajax({
    url: URL,
    dataType: "JSONP",
    callback: "jsonData",
    type: "GET",
    success: function(jsonData) {
      console.log("got cityIO table at " + jsonData.timestamp);

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
  // make the grid div parent
  let tableDiv = document.createElement("div");
  tableDiv.id = "table";
  tableDiv.className = "table";
  document.body.appendChild(tableDiv);
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
  Maptastic("table");
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
      cells[i].style.backgroundColor = "rgba(50, 50, 50, 1)";
      globalColors[typeIndex];
    } else {
      cells[i].innerHTML = jsonData.objects.types[typeIndex];
      cells[i].style.backgroundColor = globalColors[typeIndex];
    }
  }
}
