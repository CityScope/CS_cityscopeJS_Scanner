// https://www.sitepoint.com/javascript-design-patterns-singleton/
//https://gist.github.com/dmnsgn/4a6ad76de1b5928f13f68f406c70bb09

class Storage {
  constructor() {
    this._camCanvas = "null";
  }

  get camCanvas() {
    return this._camCanvas;
  }

  set camCanvas(value) {
    this._camCanvas = value;
  }
}

export default new Storage();
