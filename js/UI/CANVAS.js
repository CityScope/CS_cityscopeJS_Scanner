/////////////////////////////////////////////////////////////////////////////////////////////////////////

export function setupCanvs() {
  // load the SVGcdn to var
  var svgCDN = "http://www.w3.org/2000/svg";
  //make vid canvas
  var camCanvas = document.createElement("canvas");

  camCanvas.id = "webcamCanvas";
  camCanvas.className = "webcamCanvas";
  //MUST keep full numbers [WIP]
  camCanvas.width = Math.floor(window.innerHeight * 0.9);
  camCanvas.height = Math.floor(window.innerHeight * 0.9);
  camCanvas.style.zIndex = 0;
  camCanvas.style.position = "absolute";
  camCanvas.style.border = "1px solid";
  document.body.appendChild(camCanvas);

  //SVG setup for later viz.
  var svgDiv = document.createElement("div");
  document.body.appendChild(svgDiv);
  svgDiv.id = "svgDiv";
  svgDiv.width = camCanvas.width;
  svgDiv.height = camCanvas.height;
  svgDiv.className = "svgDiv";
  var svgKeystone = document.createElementNS(svgCDN, "svg");
  // svgKeystone.className = "svgDiv";
  svgKeystone.id = "svgKeystone";
  svgKeystone.setAttributeNS(null, "width", camCanvas.width);
  svgKeystone.setAttributeNS(null, "height", camCanvas.height);
  svgDiv.appendChild(svgKeystone);
}
