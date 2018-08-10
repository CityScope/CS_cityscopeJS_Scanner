import { keystoneUI } from "./UI/KeyStoneUI";
import { cityIOinit } from "./CITYIO/cityio";
////////////////////////////////////////////////////////////////////////////////////////////////////////
//save/load local storage
////////////////////////////////////////////////////////////////////////////////////////////////////////
var saveSettings = function(key, data) {
  console.log("saving to localStorage in " + key + "key");
  //save to local storage
  localStorage.setItem(key, JSON.stringify(data));
};

//load settings if exist
var loadSettings = function(key) {
  if (localStorage.getItem(key)) {
    var data = JSON.parse(localStorage.getItem(key));
    return data;
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////

///JSON load function
export function onFileLoad(l) {
  // POST to cityIO rate in MS
  var sendRate = 1000;
  // console.log("Trying to Load Setting JSON file...");
  var file = l.target.files[0];
  var reader = new FileReader();
  let res = reader.readAsText(file);
  reader.onload = function(e) {
    res = e.target.result;
    var cityIOdataStruct = JSON.parse(res);
    console.log("found settings [JSON]..." + cityIOdataStruct.toString());

    // send the table settings once to Web worker for init
    CVworker.postMessage(["cityIOsetup", cityIOdataStruct]);
    // than, if exists, load pos. settings from localStorage
    if (loadSettings("CityScopeJS_keystone")) {
      console.log("found key stoning setup...Loading last key stoning");
      MatrixTransform(loadSettings("CityScopeJS_keystone"));
    } else {
      keystoneUI();
    }

    //at last, start sending to cityIO
    cityIOinit(sendRate);
  };
}
