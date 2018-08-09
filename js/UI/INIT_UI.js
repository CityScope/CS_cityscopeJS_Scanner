import { datGUI } from "./DATGUI";
import { setupWebcam } from "./WEBCAM";

export function init_ui() {
  //make the UI
  datGUI();
  //start webcam
  setupWebcam();
}
