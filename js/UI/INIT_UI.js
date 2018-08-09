import { makeInfoDiv, infoDiv } from "./INFODIV";
import { datGUI } from "./DATGUI";
import { setupCanvs } from "./CANVAS";
import { setupWebcam } from "./WEBCAM";

export function init_ui() {
  //init info div
  let d = makeInfoDiv();
  infoDiv(d, ">>> Starting CityScopeJS applet");
  //make the UI
  datGUI();
  //make the canvas
  setupCanvs();
  //call the media setup method at start
  setupWebcam();

  //
}
