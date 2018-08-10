import { magGlass, svgCircle } from "./UI_TOOLS";

export function keystoneUI() {
  console.log(
    "starting keystone: make sure to select the corners of the scanned area in this order: TOP-LEFT->TOP-RIGHT->BOTTOM-LEFT->BOTTOM-RIGHT"
  );
  //clear clicks array
  let clkArr = [];
  //turn on mag-glass effect
  magGlass();
  //collect 4 mouse clicks as corners of keystone
  document.addEventListener("click", mouseKeystone);

  // react to mouse events
  function mouseKeystone(e) {
    // only collect clicks that are in the canvas area
    if (e.x < camCanvas.width && e.y < camCanvas.height) {
      //pop. array of clicks
      clkArr.push(e.x, e.y);

      console.log(
        "Mouse click " + clkArr.length / 2 + " at " + e.x + ", " + e.y
      );
      //show points with svg
      svgKeystone.appendChild(
        svgCircle([e.x, e.y], "none", 10, 0, "magenta", "1")
      );

      // when 2x4 clicks were added
      if (clkArr.length == 8) {
        //save these keystone points to local storage
        saveSettings("CityScopeJS_keystone", clkArr);
        MatrixTransform(loadSettings("CityScopeJS_keystone"));

        //reset the clicks array
        clkArr = [];
        // and stop keystone mouse clicks
        document.removeEventListener("click", mouseKeystone);
      }
    }
  }
}
