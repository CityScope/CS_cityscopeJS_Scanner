/////////////////////////////////////////////////////////////////////////////////////////////////////////
//save/load local storage
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var saveSettings = function(key, data) {
  infoDiv("saving to localStorage in " + key + "key");
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////

///JSON load functinos
function onFileLoad(l) {
  infoDiv("Trying to Load Setting JSON file...");
  var file = l.target.files[0];
  var reader = new FileReader();
  let res = reader.readAsText(file);
  reader.onload = function(e) {
    res = e.target.result;
    cityIOdataStruct = JSON.parse(res);
    infoDiv("found settings [JSON]...");
    infoDiv("loaded cityIO settings: " + cityIOdataStruct.toString());
    //send the table settings once to Webworker for init
    CVworker.postMessage(["cityIOsetup", cityIOdataStruct]);
    // than, if exists, load pos. settings from localStorage
    if (loadSettings("CityScopeJS_keystone")) {
      infoDiv("found keystoning setup...Loading prev. keystoning");
      MatrixTransform(loadSettings("CityScopeJS_keystone"));
    } else {
      infoDiv(">> Start by setting up keystone");
      keystoneUI();
    }
    //test slider
    if (cityIOdataStruct.objects.sliders) {
      SliderPicker([100, 100, 200, 200], cityIOdataStruct.objects.sliders);
    }
    //at last, start sending to cityIO
    cityIOinit(sendRate);
  };
}
