export function setupSVG() {
  // load the SVGcdn to var
  var svgCDN = "http://www.w3.org/2000/svg";
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
