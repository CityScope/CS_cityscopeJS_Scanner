function getCityIO() {
    var cityIOurl = "https://cityio.media.mit.edu/api/table/CityScopeJS";

    // GET method 
    let json;
    $.ajax({
        url: cityIOurl,
        dataType: 'JSONP',
        callback: 'jsonData',
        type: 'GET',
        success: function (jsonData) {
            viz(jsonData);
        },
        // or error 
        error: function () {
            console.log('ERROR');
        }
    });
    return json;
}
function setup() {
    let gridSize = 10;
    // make the grid div parent
    $('<DIV/>', {
        id: "Grid_Parent",
        class: "Grid_Parent"
    }).appendTo('body');
    //drag-able

    // make the visual rep of the now distorted grid
    for (let i = 0; i < gridSize; i++) {
        var vizRawsDiv = document.createElement('div');
        Grid_Parent.appendChild(vizRawsDiv);
        vizRawsDiv.className = "vizRawsDiv";
        for (let j = 0; j < gridSize; j++) {
            var vizCell = document.createElement('div');
            vizCell.className = "vizCell";
            vizRawsDiv.appendChild(vizCell);
            //cell sized in viz grid 
            let cellDims = (document.documentElement.clientWidth / gridSize).toString() + "px";
            vizCell.style.width = cellDims;
            vizCell.style.height = cellDims;
        }
    }

    window.setInterval("getCityIO()", 100);
}

function viz(jsonData) {
    let cells = document.getElementsByClassName('vizCell');
    // console.log(cells);
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerHTML =
            "brick type:" + '\n' + jsonData.grid[i];
        if (jsonData.grid[i] === null) {
            cells[i].style.backgroundColor = 'rgba(240,0,255,0.5)';
        } else {
            cells[i].style.backgroundColor = null;
        }
    }
}

///
window.onload = setup();
