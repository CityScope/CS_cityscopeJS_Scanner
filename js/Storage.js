// https://www.sitepoint.com/javascript-design-patterns-singleton/
//https://gist.github.com/dmnsgn/4a6ad76de1b5928f13f68f406c70bb09

class Storage {
  constructor() {
    this._camCanvas = null;
    this._typesArray = [];
    this._pixelColArr = [];
  }
  //erb cam canvas
  get camCanvas() {
    return this._camCanvas;
  }

  set camCanvas(value) {
    this._camCanvas = value;
  }

  //typesArray
  get typesArray() {
    return this._typesArray;
  }

  set typesArray(value) {
    this._typesArray = value;
  }

  //pixelColArr
  get pixelColArr() {
    return this._pixelColArr;
  }

  set pixelColArr(value) {
    this.pixelColArr = value;
  }
}

export default new Storage();
