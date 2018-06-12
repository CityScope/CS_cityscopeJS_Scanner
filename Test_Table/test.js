function setup() {
    let gridSize = 10;
    // make the grid div parent
    $('<DIV/>', {
        id: "Grid_Parent",
        class: "Grid_Parent"
    }).appendTo('body');
    // make the visual rep of the now distorted grid
    for (let i = 0; i < gridSize; i++) {
        var vizRaws = document.createElement('div');
        Grid_Parent.appendChild(vizRaws);
        vizRaws.className = "vizRaws";
        for (let j = 0; j < gridSize; j++) {
            var vizCell = document.createElement('div');
            vizCell.className = "vizCell";
            vizRaws.appendChild(vizCell);
            //cell sized in viz grid 
            let cellDims = (document.documentElement.clientWidth / gridSize / 2).toString() + "px";
            vizCell.style.width = cellDims;
            vizCell.style.height = cellDims;
        }
    }

    window.setInterval("getCityIO()", 250);
}

function getCityIO() {
    var cityIOurl = "https://cityio.media.mit.edu/api/table/CityScopeJS";
    // GET method 
    return $.ajax({
        url: cityIOurl,
        dataType: 'JSONP',
        callback: 'jsonData',
        type: 'GET',
        success: function (jsonData) {
            viz(jsonData)
        },
        // or error 
        error: function () {
            console.log('ERROR');
        }
    });
}

function viz(jsonData) {
    let cells = document.getElementsByClassName('vizCell');
    // console.log(cells);
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerHTML =
            jsonData.grid[i];
        if (jsonData.grid[i] === null) {
            cells[i].style.backgroundColor = 'rgba(0,0,0,0.5)';
        } else {
            cells[i].style.backgroundColor = null;
        }
    }
}

///
window.onload = setup();
