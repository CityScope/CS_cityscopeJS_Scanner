///////////////////////////////////////////////////////////////////////////////////////////////
//webworker 
/* https://www.sitepoint.com/using-web-workers-to-improve-image-manipulation-performance/webworker */

var cityioData = []
var types = [
    "type_0",
    "type_1",
    "type_2",
    "type_3",
    "type_4",
    "type_5",
    "type_6",
    "type_7",
    "type_8",
    "type_9",
    "type_10",
    "type_11",
    "type_12",
    "type_13",
    "type_14",
    "type_15",
    "type_16",
    "type_17",
    "type_18",
    "type_19",
    "type_20",
    "type_21",
    "type_22",
    "type_23",
    "type_24"
];

var codes = [
    '1100011000100000',
    '0001000100010000',
    '0000010001000100',
    '0000011001100000',
    '0001001001001000',
    '0001100000101000',
    '1000100000000001',
    '0000100000000000',
    '0000000001000000',
    '0000100000000001',
    '1000000000000001',
    '0100000000000010',
    '0001010101000000',
    '1001100110011001',
    '0000111100110110',
    '1111100010000000',
    '1110001000100110',
    '0011001000110000',
    '1100010001011111',
    '0100010001000110',
    '0011011011000110',
    '0100011000110000',
    '0000011001000110',
    '0100011011000000',
    '0111010011000000'];

//load table settings
var cityioObj = fetch("../data/cityIO.json")
    .then(res => res.json())
    .then(data => cityioObj = data)
    .then((cityioObj) => { return cityioObj })

//listen to webworker calls 
self.addEventListener('message', function (msg) {
    // make sure cityioObj loaded
    if (cityioObj) {
        CV(msg.data)
    }
}, false)

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
    //return this to DOM for visuals 
    self.postMessage(pixelColArr);

    cityioData = typesArray
    //run through the 1D lsit of colors to reshape this into 4x4 matrices 
    for (let j = 0; j < pixelColArr.length; j += Math.sqrt(pixelColArr.length) * 4) {
        // x zero y zero top left going down on y in jumps of 4
        for (let i = 0; i < Math.sqrt(pixelColArr.length); i = i + 4) {
            //reshape to lists of 16 bits -- should be rewirten 
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
                //forth rwo
                pixelColArr[i + j + 3],
                pixelColArr[i + j + 3 + Math.sqrt(pixelColArr.length)],
                pixelColArr[i + j + 3 + Math.sqrt(pixelColArr.length) * 2],
                pixelColArr[i + j + 3 + Math.sqrt(pixelColArr.length) * 3]
            ].toString()

            thisBrick = thisBrick.replace(/,/g, "");
            typesArray.push(types[codes.indexOf(thisBrick)])
        }
    }
}

if (cityioData && cityioObj) {
    cityio(cityioData)
}

function cityio() {
    setTimeout(cityio, 500);
    cityioObj.grid = cityioData;
    // console.log(cityioObj);

    fetch("https://cityio.media.mit.edu/api/table/update/cityscopeJS", {
        method: "POST",
        body: JSON.stringify(cityioObj)
    }).then((response) => {
        // console.log(response)
    });
}



/* For inline WS
function blobWebWorker(fn) {
    return new Worker(URL.createObjectURL(new Blob(["(" + fn + ")()"])));
}

const CVworker = blobWebWorker(function () {
    //worker code here
});
*/