import { keystoneMouse, keystoneKeys } from "./UI/KeyStoneUI";
import { MatrixTransform } from "./CV/MatrixTransform";
import "./Storage";

////////////////////////////////////////////////////////////////////////////////////////////////////////
//save/load local storage
////////////////////////////////////////////////////////////////////////////////////////////////////////

///JSON load function
export function onFileLoad(l) {
  // console.log("Trying to Load Setting JSON file...");
  var file = l.target.files[0];
  var reader = new FileReader();
  let res = reader.readAsText(file);
  reader.onload = function(e) {
    res = e.target.result;
    //store cityIOdataStruct in Storage
    var cityIOdataStruct = JSON.parse(res);
    Storage.cityIOdataStruct = cityIOdataStruct;

    console.log("found settings [JSON]...", cityIOdataStruct);

    // send the table settings once to Web worker for init
    CVworker.postMessage(["cityIOsetup", cityIOdataStruct]);

    // than, if exists, load pos. settings from localStorage
    if (loadSettings("CityScopeJS_keystone")) {
      console.log("found key stoning setup...Loading last key stone");
      MatrixTransform(loadSettings("CityScopeJS_keystone"));
      keystoneKeys();
    } else {
      console.log("no ket stone was found, starting new one..");
      //save these keystone points to local storage
      keystoneMouse();
    }
  };
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

export var saveSettings = function(key, data) {
  console.log("saving to localStorage in " + key + " key");
  //save to local storage
  localStorage.setItem(key, JSON.stringify(data));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////

//load settings if exist
export var loadSettings = function(key) {
  if (localStorage.getItem(key)) {
    var data = JSON.parse(localStorage.getItem(key));
    return data;
  }
};
