import { magGlass, svgCircle } from "./UItools";
import { saveSettings, loadSettings } from "../FileIO";
import { MatrixTransform } from "../CV/MatrixTransform";
import "../Storage";

export function keystoneMouse() {
  var camCanvas = Storage.camCanvas;

  console.log(
    "Key-stone in this order: TOP-LEFT [⬉] TOP-RIGHT [⬈] BOTTOM-LEFT  [⬋]  BOTTOM-RIGHT [⬊]"
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
        keystoneKeys();
      }
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function keystoneKeys() {
  window.addEventListener("keydown", function(event) {
    const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
    var keystone = loadSettings("CityScopeJS_keystone");
    k(key, keystone);
  });

  function k(key, keystone) {
    switch (key) {
      case "ArrowLeft":
        keystone[0]--;
        saveSettings("CityScopeJS_keystone", keystone);
        MatrixTransform(keystone);
        break;

      case "ArrowRight":
        keystone[0]++;
        saveSettings("CityScopeJS_keystone", keystone);
        MatrixTransform(keystone);
        break;

      case "ArrowUp":
        keystone[1]--;
        saveSettings("CityScopeJS_keystone", keystone);
        MatrixTransform(keystone);
        // Up pressed
        break;

      case "ArrowDown":
        // Down pressed
        keystone[1]++;
        saveSettings("CityScopeJS_keystone", keystone);
        MatrixTransform(keystone);
        break;
    }
  }
}
