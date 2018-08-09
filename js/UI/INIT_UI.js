import { datGUI } from "./DATGUI";
import { setupWebcam } from "./WEBCAM";
import { UpdateInfoDiv } from "./INFODIV";
import { infoDiv } from "../index";

export function init_ui() {
  //make the UI
  datGUI();
  //call the media setup method at start
  setupWebcam();
  //   UpdateInfoDiv(infoDiv, "starting cam");
}
