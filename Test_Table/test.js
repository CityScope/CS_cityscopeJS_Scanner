// to try https://dev.to/johnpaulada/synchronous-fetch-with-asyncawait 
// 0-9 housing
// 10-19 Work
// 20-21 green

let cityIOapi = 'https://cityio.media.mit.edu/api/table/CityScopeJS';
let cityIOlist = 'https://cityio.media.mit.edu/api/tables/list';

async function getCityIO(URL) {
    // GET method 
    return $.ajax({
        url: URL,
        dataType: 'JSONP',
        callback: 'jsonData',
        type: 'GET',
        success: function (jsonData) {
            console.log("got cityIO table at " + jsonData.timestamp);
            return jsonData;
        },
        // or error 
        error: function () {
            console.log('ERROR');
        }
    });
}

async function setup() {
    // const tables = await getCityIO(cityIOlist);
    // console.log(tables);

    //call server once at start, just to setup the grid 
    const cityIOjson = await getCityIO(cityIOapi);
    // get grid size
    let gridSize = Math.sqrt(cityIOjson.grid.length);
    console.log('table size is', gridSize, 'x', gridSize);
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
}

async function update() {
    const cityIOjsonNew = await getCityIO(cityIOapi);
    // if (JSON.stringify(cityIOjsonNew.grid) !== JSON.stringify(cityIOjsonOld.grid)) {
    viz(cityIOjsonNew);
    // cityIOjsonNew = cityIOjsonOld;
    // }
    // else {
    //     return;
    // }
}



async function viz(jsonData) {
    let cells = document.getElementsByClassName('vizCell');

    for (let i = 0; i < cells.length; i++) {
        //get the key for this type 
        let typeKey = getKeyByValue(jsonData.objects.types, jsonData.grid[i]);

        if (jsonData.grid[i] === null) {
            cells[i].style.backgroundColor = 'rgba(0,0,0,0.25)';
            cells[i].innerHTML = 'no type';
            cells[i].id = 'p'
            p(cells[i]);


        } else if (typeKey >= 0 && typeKey < 10) {
            cells[i].style.backgroundColor = 'rgba(242, 216, 46,0.5)';
            cells[i].innerHTML = 'live ' + typeKey;

        } else if (typeKey > 11 && typeKey < 20) {
            cells[i].style.backgroundColor = 'rgba(114, 10, 76,0.5)';
            cells[i].innerHTML = 'work ' + typeKey;

        } else if (typeKey > 20 && typeKey <= 21) {
            cells[i].style.backgroundColor = 'rgba(100, 160, 77,0.5)';
            cells[i].innerHTML = 'park';
        }
    }
}
//get key of brick's type in cityIO info
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}


//
function p(div) {
    particlesJS(div.id, {
        "particles": {
            "number": {
                "value": 200,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ffffff"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 1,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                },
                "image": {
                    "src": "img/github.svg",
                    "width": 100,
                    "height": 100
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 6,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": false,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });
}


//start applet 
window.onload = setup();
window.setInterval("update()", 500);