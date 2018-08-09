/////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////UI + INTERACTION /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function keystoneUI() {
  infoDiv(
    "starting keystone" +
      "<p>" +
      "NOTE: make sure to select the croners of the scanned area in this order: TOP-LEFT->TOP-RIGHT->BOTTOM-LEFT->BOTTOM-RIGHT"
  );
  //clear clicks array
  let clkArr = [];
  //turn on mag-glass efect
  magGlass();
  //collect 4 mouse clicks as corners of keystone
  document.addEventListener("click", mouseKeystone);

  // react to mouse events
  function mouseKeystone(e) {
    // only collect clicks that are in the canvas area
    if (e.x < camCanvas.width && e.y < camCanvas.height) {
      //pop. array of clicks
      clkArr.push(e.x, e.y);

      infoDiv("Mouse click " + clkArr.length / 2 + " at " + e.x + ", " + e.y);
      //viz points with svg
      svgKeystone.appendChild(
        svgCircle([e.x, e.y], "none", 10, 0, "magenta", "1")
      );

      // when 2x4 clicks were added
      if (clkArr.length == 8) {
        // svgKeystone.appendChild(
        //   svgLine([clkArr[0], clkArr[1]], [clkArr[2], clkArr[3]]),
        //   svgLine([clkArr[2], clkArr[3]], [clkArr[4], clkArr[5]]),
        //   svgLine([clkArr[4], clkArr[5]], [clkArr[6], clkArr[7]]),
        //   svgLine([clkArr[0], clkArr[1]], [clkArr[6], clkArr[7]])
        // );

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//stats
(function() {
  var script = document.createElement("script");
  script.onload = function() {
    var stats = new Stats();
    document.body.appendChild(stats.dom);
    requestAnimationFrame(function loop() {
      stats.update();
      requestAnimationFrame(loop);
    });
  };
  script.src = "//rawgit.com/mrdoob/stats.js/master/build/stats.min.js";
  document.head.appendChild(script);
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function magGlass() {
  //make gls div
  var glsDiv = document.createElement("div");
  glsDiv.id = "glsDiv";
  document.body.appendChild(glsDiv);
  //another canvas for magnifying glass
  var magGlassCanvas = document.createElement("canvas");
  // mag. glass
  glsDiv.appendChild(magGlassCanvas);
  magGlassCanvas.id = "magGlass";
  magGlassCanvas.className = "magGlassCanvas";
  let magWid = (magGlassCanvas.width = 200);
  magGlassCanvas.height = magWid;
  magGlassCanvas.style.zIndex = 1;
  let magGlassCtx = magGlassCanvas.getContext("2d");
  document.addEventListener("mousemove", function(e) {
    magGlassCtx.clearRect(0, 0, magWid, magWid);
    magGlassCtx.drawImage(
      camCanvas,
      e.pageX - magWid / 4,
      e.pageY - magWid / 4,
      camCanvas.width,
      camCanvas.width,
      0,
      0,
      camCanvas.width * 2,
      camCanvas.height * 2
    );
    magGlassCanvas.style.top = e.pageY - magWid / 2 + "px";
    magGlassCanvas.style.left = e.pageX - magWid / 2 + "px";
    magGlassCanvas.style.display = "block";
    magGlassCanvas.style.position = "absolute";
    magGlassCanvas.style.border = "2px black solid";
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function svgLine(srcPt, dstPt) {
  var line = document.createElementNS(svgCDN, "line");
  line.setAttributeNS(null, "x1", srcPt[0]);
  line.setAttributeNS(null, "y1", srcPt[1]);
  line.setAttributeNS(null, "x2", dstPt[0]);
  line.setAttributeNS(null, "y2", dstPt[1]);
  line.setAttributeNS(null, "stroke", "#f35790");
  line.setAttributeNS(null, "stroke-width", "1");
  return line;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function svgCircle(dstPt, fillCol, size, fillOp, strkCol, strkWidth) {
  //display with SVG
  var scanPt = document.createElementNS(svgCDN, "circle");
  scanPt.setAttributeNS(null, "cx", dstPt[0]);
  scanPt.setAttributeNS(null, "cy", dstPt[1]);
  scanPt.setAttributeNS(null, "fill", fillCol);
  scanPt.setAttributeNS(null, "r", size);
  scanPt.setAttributeNS(null, "fill-opacity", fillOp);
  scanPt.setAttributeNS(null, "stroke", strkCol);
  scanPt.setAttributeNS(null, "stroke-width", strkWidth);

  return scanPt;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function svgText(dstPt, txt, size) {
  var newText = document.createElementNS(svgCDN, "text");
  newText.setAttributeNS(null, "x", dstPt[0]);
  newText.setAttributeNS(null, "y", dstPt[1]);
  newText.setAttributeNS(null, "font-size", size);

  newText.innerHTML = txt;
  return newText;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//color the visual grid base on the web-worker cv analysis
function renderVizGrid(pixelColArr, typesArray, state) {
  if (state) {
    for (let i = 0; i < pixelColArr.length; i++) {
      let pixType = typesArray[Math.floor(i / 16)];
      if (pixType !== -1) {
        svgPntsArray[i].setAttribute("stroke", "#59d0ff");
        svgPntsArray[i].setAttribute("stroke-width", "1");
      } else {
        svgPntsArray[i].setAttribute("stroke", "");
        svgPntsArray[i].setAttribute("stroke-width", "0");
      }
      if (pixelColArr[i] === 2) {
        svgPntsArray[i].setAttribute("fill", "magenta");
        svgPntsArray[i].setAttribute("r", "2");
      } else if (pixelColArr[i] === 1) {
        svgPntsArray[i].setAttribute("fill", "black");
        svgPntsArray[i].setAttribute("r", "2");
      } else {
        svgPntsArray[i].setAttribute("fill", "white");
        svgPntsArray[i].setAttribute("r", "2");
      }
    }
  } else {
    for (let i = 0; i < pixelColArr.length; i++) {
      svgPntsArray[i].setAttribute("stroke", "");
      svgPntsArray[i].setAttribute("stroke-width", "0");
      svgPntsArray[i].setAttribute("fill", "");
      svgPntsArray[i].setAttribute("r", "0");
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//controls the viz updating
function vizGridHandler(e) {
  if (e === true) {
    on();
  } else if (e === false) {
    cancelAnimationFrame(thisFrame);
    renderVizGrid(pixelColArr, typesArray, false);
  }

  function on() {
    thisFrame = requestAnimationFrame(on);
    renderVizGrid(pixelColArr, typesArray, true);
    return thisFrame;
  }
}
