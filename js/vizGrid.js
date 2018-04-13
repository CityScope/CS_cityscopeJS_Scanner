// make visual grid representation
let vizGridArray = [];

function vizGrid() {
    // make the grid div parent
    $('<DIV/>', {
        id: "vizCellDivParent",
        class: "vizCellDivParent"
    }).appendTo('body');

    // make the visual rep of the now distorted grid
    for (let i = 0; i < size; i++) {
        var vizRawsDiv = document.createElement('div');
        vizRawsDiv.className = "vizRawsDiv";
        vizCellDivParent.appendChild(vizRawsDiv);
        for (let j = 0; j < size; j++) {
            var vizCell = document.createElement('div');
            vizCell.className = "vizCell";
            vizRawsDiv.appendChild(vizCell);
            // get the divs to array
            vizGridArray.push(vizCell);
        }
    }
    //call viz function from WS 
    vizFromWebworker(vizGridArray)
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
function vizFromWebworker(vizGridArray) {
    //color the visual grid base on the web-worker cv analysis
    CVworker.addEventListener('message', function (e) {
        col = e.data;
        for (let i = 0; i < vizGridArray.length; i++) {
            col[i] == 0 ?
                vizGridArray[i].style.background = 'white' :
                vizGridArray[i].style.background = 'black';
        }
    }, false);
}
