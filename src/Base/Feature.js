module.exports = class Feature {
  /**
   * @private
   * @type {(client: import("./CDClient").CDClient) => unknown | Promise<unknown>}
   */
  _run;

  /**
   * @param {(client: import("./CDClient").CDClient) => unknown | Promise<unknown>} run
   */
  constructor(run) {
    this._run = run;
  }

  get run() {
    return this._run;
  }
};
