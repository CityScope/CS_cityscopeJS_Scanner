// to try https://dev.to/johnpaulada/synchronous-fetch-with-asyncawait
// 0-9 housing
// 10-19 Work
// 20-21 green

let cityIOapi = "https://cityio.media.mit.edu/api/table/CityScopeJS";
let cityIOlist = "https://cityio.media.mit.edu/api/tables/list";

var globalColors = [
  "#A3BFA2",
  "#ED5066",
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
  // const tables = await getCityIO(cityIOlist);
  // console.log(tables);

  //call server once at start, just to setup the grid
  const cityIOjson = await getCityIO(cityIOapi);
  // get grid size
  let gridSize = Math.sqrt(cityIOjson.grid.length);
  console.log("table size is", gridSize, "x", gridSize);
  // make the grid div parent
  $("<DIV/>", {
    id: "Grid_Parent",
    class: "Grid_Parent"
  }).appendTo("body");
  // make the visual rep of the now distorted grid
  for (let i = 0; i < gridSize; i++) {
    var vizRaws = document.createElement("div");
    Grid_Parent.appendChild(vizRaws);
    vizRaws.className = "vizRaws";
    for (let j = 0; j < gridSize; j++) {
      var vizCell = document.createElement("div");
      vizCell.className = "vizCell";
      vizRaws.appendChild(vizCell);
      //cell sized in viz grid
      let cellDims =
        (document.documentElement.clientWidth / gridSize).toString() + "px";

      vizCell.style.width = cellDims;
      vizCell.style.height = cellDims;
    }
  }
  //create SVG for d3

  let svgParent = $(Grid_Parent);
  d3.select("body")
    .append("svg")
    .attr("width", svgParent.width())
    .attr("height", svgParent.height());

  //get the same pos. as the grid for SVG
  $("svg").css({
    top: svgParent.position().top,
    left: svgParent.position().left,
    position: "absolute"
  });
}

async function update() {
  const cityIOjsonNew = await getCityIO(cityIOapi);
  // if (JSON.stringify(cityIOjsonNew.grid) !== JSON.stringify(cityIOjsonOld.grid)) {
  viz(cityIOjsonNew);
  // cityIOjsonNew = cityIOjsonOld;
  // }
  // else {
  //     return;
  // }
}

async function viz(jsonData) {
  let cells = document.getElementsByClassName("vizCell");

  for (let i = 0; i < cells.length; i++) {
    //get the key for this type
    let typeKey = getKeyByValue(jsonData.objects.types, jsonData.grid[i]);
    //
    if (jsonData.grid[i] === null) {
      cells[i].style.backgroundColor = "#fff1";
      cells[i].innerHTML = " ";
      //
    } else if (typeKey >= 0 && typeKey < 10) {
      cells[i].style.backgroundColor = "#ED5066";
      cells[i].innerHTML = "L" + typeKey;
      //
    } else if (typeKey > 11 && typeKey < 20) {
      cells[i].style.backgroundColor = "#FDCAA2";
      cells[i].innerHTML = "W" + typeKey;
      //
    } else if (typeKey > 20 && typeKey <= 21) {
      cells[i].style.backgroundColor = "#A3BFA2";
      cells[i].innerHTML = "P";
    } else {
      cells[i].innerHTML = " ";
    }
  }
}
//get key of brick's type in cityIO info
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function anim(color) {
  d3.select("svg")
    .append("circle")
    .attr("cx", 10)
    .attr("cy", 10)
    .attr("r", 2)
    .attr("stroke", color);

  var circleTransition = d3.select("circle").transition();
  circleTransition.attr("transform", "translate(150)").duration(10000);
}

//start applet
window.onload = setup();
window.setInterval("update()", 500);
