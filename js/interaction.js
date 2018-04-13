// DAT GUI 
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function interact() {

    //drag-able
    $('#vizCellDivParent').draggable();
    // dat.GUI
    var gui = new dat.GUI({ width: 300 });

    parm = {
        mouseLocX: 0,
        mouseLocY: 0,
        webcam: false,
        brightness: 0,
        cityIO: false,
        keySt: false
    }
    //mouse location 
    document.addEventListener('mousemove', function onMouseMove(e) {
        parm.mouseLocX = e.x;
        parm.mouseLocY = e.y;
    })
    gui.add(parm, 'mouseLocX').name("Mouse x:").listen();
    gui.add(parm, 'mouseLocY').name("Mouse y:").listen();


    // keystone toggle
    gui.add(parm, "keySt").name("toggle Keystoning").onChange(function (bool) {
        if (bool) {
            document.addEventListener('click', mouseKeystone);
        } else {
            document.removeEventListener('click', mouseKeystone)
        }
        bool = !bool
    });

    let clickArray = [];
    function mouseKeystone(e) {
        clickArray.push(e.x, e.y)
        infoDiv("Mouse click " + clickArray.length / 2 + " at " + e.x + ", " + e.y);
        if (clickArray.length == 8) {
            MatrixTransform(clickArray)
            clickArray = [];
        }
    }


    // webcam toggle
    gui.add(parm, "webcam").name("Start webcam").onChange(function (mediaToggle) {
        setupMedia(mediaToggle);
    });
    //brightness
    gui.add(parm, 'brightness', -100, 100).
        name("brightness").onChange(function (i) {
            brightness = i;
            brightnessCanvas(i, vidCanvas2dContext)
        });

    // cityIO toggle
    // gui.add(parm, "cityIO").name("Toggle cityIO").onChange(function (bool) {
    //     if (!bool) {
    //         console.log(bool);
    //         cityio(bool);
    //     }
    // });

    // gui.close();

    infoDiv();
}