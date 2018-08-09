/////////////////////////////////////////////////////////////////////////////////////////////////////////
function webWorkerListen() {
  // Get data back form WEBworker
  infoDiv("starting WebWorker listener...");
  CVworker.addEventListener(
    "message",
    function(e) {
      //get the WEBwroker msg and use
      //its 1st item for types
      typesArray = e.data[0];

      //get the WEBwroder msg and use
      //its 2nd item for viz the grid
      pixelColArr = e.data[1];
    },
    false
  );
}
