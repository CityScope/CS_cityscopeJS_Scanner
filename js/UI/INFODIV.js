/////////////////////////////////////////////////////////////////////////////////////////////////////////

export function makeInfoDiv() {
  //make info div
  let infoDiv = document.createElement("div");
  infoDiv.id = "infoDiv";
  infoDiv.className = "info";
  document.body.appendChild(infoDiv);
  return infoDiv;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//make info div [on screen console] or add text to it
export function UpdateInfoDiv(infoDiv, text) {
  // clear div if too much text
  if (infoDiv.scrollHeight > 2000) {
    infoDiv.innerHTML = null;
  } else {
    infoDiv.innerHTML += text.toString() + "<p></p>";
    infoDiv.scrollTop = infoDiv.scrollHeight;
  }
}
