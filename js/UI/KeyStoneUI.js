import { magGlass, svgCircle } from "./UItools";
import { saveSettings, loadSettings } from "../FileIO";
import { MatrixTransform } from "../CV/MatrixTransform";

export function keystoneUI() {
  console.log(
    "starting keystone: make sure to select the corners of the scanned area in this order: TOP-LEFT->TOP-RIGHT->BOTTOM-LEFT->BOTTOM-RIGHT"
  );
  //
  var svgKeystone = window.svgKeystone;
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
        //save these settings for next load
        saveSettings("CityScopeJS_keystone", clkArr);
        //call the matrix transform function
        MatrixTransform(loadSettings("CityScopeJS_keystone"));
        // and stop keystone mouse clicks
        document.removeEventListener("click", mouseKeystone);
      }
    }
  }
}
