import * as dat from "dat.gui";
import { onFileLoad } from "../TOOLS";

export function datGUI() {
  // dat.GUI
  var gui = new dat.GUI({ width: 400 });
  let parm = {
    mirror: false,
    brightness: 0,
    contrast: 0,
    vis: false,
    getJson: function() {
      let fileClick = document.getElementById("my_file");
      console.log(fileClick);
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
      window.open(
        "https://cityio.media.mit.edu/api/table/" +
          cityIOdataStruct.header.name,
        "_blank"
      );
    },
    reset: function() {
      localStorage.clear();
      infoDiv("clearing and reseting");
      location.reload(true);
    },
    settingsExample: function() {
      window.open(
        "https://github.com/CityScope/CS_cityscopeJS/blob/master/data/settings.json",
        "_blank"
      );
    }
  };

  //upload settings
  gui.add(parm, "getJson").name("Start here: Load settings [JSON]");
  //or reset and restart
  gui.add(parm, "reset").name("Reset and clear Keystone");
  //toggle vis on camera
  gui
    .add(parm, "vis")
    .name("Toggle visual feedback")
    .onChange(function(e) {
      vizGridHandler(e);
    });
  //new calibrate folder
  var calibrateFolder = gui.addFolder("webcam");

  //brightness control
  calibrateFolder
    .add(parm, "brightness", -100, 100)
    .name("brightness")
    .onChange(function(i) {
      brightness = i;
      brightnessCanvas(i, vidCanvas2dContext);
    });

  //contrast control
  calibrateFolder
    .add(parm, "contrast", -100, 100)
    .name("contrast")
    .onChange(function(i) {
      contrast = i;
      contrastCanvas(i, vidCanvas2dContext);
    });

  var cityioFolder = gui.addFolder("cityIO");

  //cityio send rate
  cityioFolder
    .add(parm, "sendRate", 250, 2000)
    .step(250)
    .name("cityIO send [ms]")
    .onChange(function(d) {
      sendRate = d;
      cityIOstop();
      cityIOinit(sendRate);
    });

  //link to raw settings
  cityioFolder.add(parm, "settingsExample").name("View settings example");
  //cityIO link
  cityioFolder.add(parm, "rawCityIO").name("View raw API");
  //cityIO link
  cityioFolder.add(parm, "fe").name("View on cityIO Dashboard");
}
