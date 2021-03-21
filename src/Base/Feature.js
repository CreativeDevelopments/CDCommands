module.exports = class Feature {
  /**
   * @private
   * @type {(client: import("./CDClient").CDClient) => void | Promise<void>}
   */
  _run;

  /**
   * @param {(client: import("./CDClient").CDClient) => void | Promise<void>} run
   */
  constructor(run) {
    this._run = run;
  }

  get run() {
    return this._run;
  }
};
