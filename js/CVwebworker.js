///////////////////////////////////////////////////////////////////
/*
//inline method for WS
const CVworker = blobWebWorker(function () {
    //put webworker funtion here 
});

// For inline WS
function blobWebWorker(fn) {
    return new Worker(URL.createObjectURL(new Blob(["(" + fn + ")()"])));
}
*/
///////////////////////////////////////////////////////////////////

//worker code here

///////////////////////////////////////////////////////////////////
//types and codes for cityIO objects 
var types, codes;
var cityioData = []

//load table settings
var cityioObj = fetch('../data/cityIO.json')
    .then(res => res.json())
    .then(data => cityioObj = data)
    .then((cityioObj) => {
        types = cityioObj.objects.types;
        codes = cityioObj.objects.codes;
        console.log(cityioObj);

        return cityioObj
    })
    .catch(function (err) {
        console.log("error:" + err);
    })

if (cityioData != null && cityioObj) {
    cityio()
}

/////////////////////////////////////////////////////////////////
// cityIO POST
/////////////////////////////////////////////////////////////////
//send to cityIO
function cityio(typesArray) {
    setTimeout(cityio, 1000);
    cityioObj.grid = cityioData;

    fetch("https://cityio.media.mit.edu/api/table/update/cityscopeJS", {
        method: "POST",
        mode: 'no-cors', // fix cors issue 
        body: JSON.stringify(cityioObj)
    }).then(
        (response) => {
            // console.log(response);
        });
}



/////////////////////////////////////////////////////////////////

//listen to web-worker calls 
self.addEventListener('message', function (msg) {
    // make sure cityioObj loaded and paresed
    if (types != null) {
        CV(msg.data);
    }
}, false)

/////////////////////////////////////////////////////////////////
//do CV on image data 
function CV(data) {
    //reset array
    let pixelColArr = [];
    let typesArray = [];

    //sample 3 pixels [3x3 colors] each time 
    for (let i = 0; i < data.length; i++) {
        avg_0 = 0.21 * data[i][0] + 0.72 * data[i][1] + 0.07 * data[i][2];
        avg_1 = 0.21 * data[i][3] + 0.72 * data[i][4] + 0.07 * data[i][5];
        avg_2 = 0.21 * data[i][6] + 0.72 * data[i][7] + 0.07 * data[i][8];
        avg = (avg_0 + avg_1 + avg_2) / 3

        avg > 256 / 2 ? pixelCol = 0 : pixelCol = 1;
        pixelColArr.push(pixelCol);
    }

    //run through the 1D list of colors to reshape this into 4x4 matrices 
    for (let j = 0; j < pixelColArr.length; j += Math.sqrt(pixelColArr.length) * 4) {
        // x zero y zero top left going down on y in jumps of 4
        for (let i = 0; i < Math.sqrt(pixelColArr.length); i = i + 4) {
            //reshape to lists of 16 bits -- should be rewritten cleaner  
            thisBrick = [
                //first row
                pixelColArr[i + j],
                pixelColArr[i + j + Math.sqrt(pixelColArr.length)],
                pixelColArr[i + j + Math.sqrt(pixelColArr.length) * 2],
                pixelColArr[i + j + Math.sqrt(pixelColArr.length) * 3],
                //second row 
                pixelColArr[i + j + 1],
                pixelColArr[i + j + 1 + Math.sqrt(pixelColArr.length)],
                pixelColArr[i + j + 1 + Math.sqrt(pixelColArr.length) * 2],
                pixelColArr[i + j + 1 + Math.sqrt(pixelColArr.length) * 3],
                //third row
                pixelColArr[i + j + 2],
                pixelColArr[i + j + 2 + Math.sqrt(pixelColArr.length)],
                pixelColArr[i + j + 2 + Math.sqrt(pixelColArr.length) * 2],
                pixelColArr[i + j + 2 + Math.sqrt(pixelColArr.length) * 3],
                //forth row
                pixelColArr[i + j + 3],
                pixelColArr[i + j + 3 + Math.sqrt(pixelColArr.length)],
                pixelColArr[i + j + 3 + Math.sqrt(pixelColArr.length) * 2],
                pixelColArr[i + j + 3 + Math.sqrt(pixelColArr.length) * 3]
            ].toString()

            thisBrick = thisBrick.replace(/,/g, "");
            //find the type for this bricks pattern in 'Codes'
            typesArray.push(types[codes.indexOf(thisBrick)])
        }
    }
    cityioData = typesArray;
    //return this to DOM for visuals 
    self.postMessage(pixelColArr);
}
