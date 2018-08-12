import "../Storage";
export function webWorkerListener() {
  //init the two WW vars
  var typesArray = 0;
  var pixelColArr = [];
  // Get data back form WEB worker
  console.log("starting WebWorker listener...");
  //add the event listener
  CVworker.addEventListener(
    "message",
    function(msg) {
      //get the WEB worker  msg and use
      //its 1st item for types
      typesArray = msg.data[0];
      Storage.typesArray = typesArray;
      //get the WEB worker msg and use
      //its 2nd item for vis. the grid
      pixelColArr = msg.data[1];
      Storage.pixelColArr = pixelColArr;
    },
    false
  );
}
