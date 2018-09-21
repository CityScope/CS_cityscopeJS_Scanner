/////////////////////////////////////////////////////////////////////////////////////////////////////////
//cityIO
/////////////////////////////////////////////////////////////////////////////////////////////////////////
import "../Storage";
import { updateInfoDIV } from "../Modules";

var cityIOtimer;
///cmpare this to new cityIO string to avoid useless POST
var oldTypesArrayStr;

export function cityIOinit(sendRate) {
  cityIOtimer = window.setInterval(cityIOpost, sendRate);
}

//stop cityio
export function cityIOstop() {
  clearInterval(cityIOtimer);
  updateInfoDIV("Stopped cityIO POST");
}

//calc this current time
function timeNow() {
  var d = Date.now();
  return new Date(d);
}

//reverse the grid to fit comply with APIv2
function mirrorGrid(typesArray) {
  let cols = Storage.cityIOdataStruct.header.spatial.ncols;
  let mirroredArray = [];

  for (let i = 0; i < typesArray.length; i = i + cols) {
    mirroredArray = mirroredArray.concat(
      typesArray.slice(i, i + cols).reverse()
    );
  }
  return mirroredArray;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// method to get the scanned data, look for matching brick 'types'
// and send the results back to cityIO server for other apps to use

function cityIOpost() {
  if (Storage.typesArray) {
    var tempArr = Storage.typesArray;
    //reverse the grid to fit comply with APIv2
    var typesArray = mirrorGrid(tempArr);

    //test oldTypesArrayStr for new data, else don't send
    if (oldTypesArrayStr !== typesArray.toString()) {
      oldTypesArrayStr = typesArray.toString();
    } else {
      updateInfoDIV("PAUSING CityIO POST");
      return;
    }

    //make a copy of the cityIO struct for manipulation
    let cityIOpacket = JSON.parse(JSON.stringify(Storage.cityIOdataStruct));
    //get the grid property from the scanner
    cityIOpacket.grid = typesArray;

    //remove brick codes from sent packet
    delete cityIOpacket.objects.codes;

    //get table name from settings
    let cityIOtableName = cityIOpacket.header.name;
    let cityIOtableUrl =
      "https://cityio.media.mit.edu/api/table/update/" +
      cityIOtableName.toString();
    //send to cityIO
    fetch(cityIOtableUrl, {
      method: "POST",
      // mode: "no-cors", // fix cors issue
      body: JSON.stringify(cityIOpacket)
    })
      .then(
        response => handleErrors(response),
        updateInfoDIV(
          "cityIO table '" + cityIOtableName + "' uploaded at " + timeNow()
        )
      )
      .catch(error => updateInfoDIV(error));

    function handleErrors(response) {
      return response;
    }
  } else {
    updateInfoDIV("  CityScopeJS waits for a settings file [.JSON]...  ");
  }
}
