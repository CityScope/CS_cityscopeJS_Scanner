import * as cvwwPath from "./CVwebworker.js";

// web-worker
console.log(cvwwPath);
const CVworker = new Worker(cvwwPath);

// POST to cityIO rate in MS
var sendRate = 1000;

//  visual grid array
var svgPntsArray = [];

// global var for colors returning from webworker
var pixelColArr = [];

//types and codes for cityIO objects
var typesArray = [];

///Cmpareable string to reduce sent rate
var oldTypesArrayStr;

//cityIO timer
var cityIOtimer;

//animation frame frame holder
var thisFrame;

//SVG element for keystone matrix
var svgKeystone;
var cityIOdataStruct;

//get main canvas context for scanning
var vidCanvas2dContext = camCanvas.getContext("2d");
