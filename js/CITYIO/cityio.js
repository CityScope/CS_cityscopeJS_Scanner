/////////////////////////////////////////////////////////////////////////////////////////////////////////
//cityIO
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// method to get the scanned data, look for matching brick 'types'
// and send the results back to cityIO server for other apps to use

function cityIOinit(sendRate) {
  cityIOtimer = window.setInterval("cityIOpost()", sendRate);
}

function cityIOstop() {
  clearInterval(cityIOtimer);
}

function cityIOpost() {
  //test for new data, else don't send
  if (oldTypesArrayStr !== typesArray.toString()) {
    oldTypesArrayStr = typesArray.toString();
  } else {
    infoDiv("No changes to Grid data, pausing CityIO POST");
    return;
  }

  //make a copy of the cityIO struct for manipulation
  let cityIOpacket = JSON.parse(JSON.stringify(cityIOdataStruct));
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
      infoDiv("cityIO table '" + cityIOtableName + "' uploaded at " + timeNow())
    )
    .catch(error => infoDiv(error));

  function handleErrors(response) {
    if (response.ok) {
      // infoDiv("cityIO response: " + response.ok);
    }
    return response;
  }

  //calc this current time
  function timeNow() {
    var d = Date.now();
    return new Date(d);
  }
}
