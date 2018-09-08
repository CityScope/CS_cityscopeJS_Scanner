import * as dat from "dat.gui";
import { cityIOinit, cityIOstop } from "../CITYIO/cityio";
import { onFileLoad } from "../Modules";
import { renderGrid } from "./RenderGrid";
import "../Storage";

export function datGUI() {
  // dat.GUI
  var gui = new dat.GUI({ width: 300 });
  let parm = {
    vis: false,
    getJson: function() {
      let fileClick = document.getElementById("my_file");
      fileClick.click();
      //do somthing with the file
      fileClick.onchange = function(e) {
        onFileLoad(e);
      };
    },
    sendRate: 1000,
    //test on cityIO
    fe: function() {
      window.open("https://cityio.media.mit.edu/", "_blank");
    },
    rawCityIO: function() {
      var cityIOdataStruct = Storage.cityIOdataStruct;

      window.open(
        "https://cityio.media.mit.edu/api/table/" +
          cityIOdataStruct.header.name,
        "_blank"
      );
    },
    reset: function() {
      //clear local memory of last key stone
      localStorage.clear();
      updateInfoDIV("clearing and reseting");
      location.reload(true);
    }
  };

  //upload settings
  gui.add(parm, "getJson").name("Start here: Load settings [JSON]");

  //or reset and restart
  gui.add(parm, "reset").name("Reset and clear Keystone");

  //toggle vis on camera
  gui
    .add(parm, "vis")
    .name("Toggle Grid Render")
    .onChange(function(state) {
      renderGrid(state);
    });

  //add folder
  var cityioFolder = gui.addFolder("cityIO");

  //cityio send rate
  cityioFolder
    .add(parm, "sendRate", 250, 2000)
    .step(250)
    .name("cityIO send [ms]")
    .onChange(function(result) {
      cityIOstop();
      cityIOinit(result);
    });

  //cityIO link
  cityioFolder.add(parm, "rawCityIO").name("View raw API");

  //cityIO link
  cityioFolder.add(parm, "fe").name("View on cityIO Dashboard");
}

export function makeInfoDIV() {
  let infoDIV = document.createElement("div");
  infoDIV.className = "infoDIV";
  infoDIV.id = "infoDIV";
  document.body.appendChild(infoDIV);
}

export function updateInfoDIV(value) {
  let infoDiv = document.getElementById("infoDIV");
  infoDiv.innerHTML = value;
}
