import "babel-polyfill";
import {
  setupSVG,
  loadImg,
  loadSettings,
  initSequence,
  cityIOinit,
  cityIOstop
} from "./Modules";
import * as logo from "../media/logo.png";

//Import Storage class
import "./Storage";
async function init() {
  //load CS logo
  loadImg(logo.default, 60, 60, "logo");
  //make the UI
  setupSVG();
  // [WIP] POST to cityIO rate in MS
  var sendRate = 1000;
  //make sure to clear CityIO sending before
  cityIOstop();
  //start sending to cityIO
  cityIOinit(sendRate);
  //after that, check if cityIOdataStruct is already loaded before
  //so we can skip the JSON file selection UI
  if (loadSettings("CityScopeJS_cityIOdataStruct")) {
    Storage.cityIOdataStruct = loadSettings("CityScopeJS_cityIOdataStruct");
    // start app sequence
    initSequence();
  }
  Storage.old_pixel_Col_Array = [];
}

//start app after HTML load
window.onload = function() {
  init();
};
