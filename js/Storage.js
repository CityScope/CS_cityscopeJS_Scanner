// https://www.sitepoint.com/javascript-design-patterns-singleton/
//https://gist.github.com/dmnsgn/4a6ad76de1b5928f13f68f406c70bb09

class Storage {
  constructor() {
    this._infoDiv = "non";
  }

  get infoDiv() {
    return this._holder;
  }

  set infoDiv(value) {
    this._holder = value;
  }
}

export default new Storage();
