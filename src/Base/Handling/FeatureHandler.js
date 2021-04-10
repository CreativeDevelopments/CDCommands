const { join } = require("path");
const Feature = require("../Feature");
const { readdirSync, mkdirSync } = require("fs");

module.exports = class FeatureHandler {
  /**
   * @private
   * @type {import("../CDClient").CDClient}
   */
  _client;

  /**
   * @private
   * @type {string}
   */
  _dir;
  /**
   * @param {import("../CDClient").CDClient} client
   * @param {string=} dir
   */
  constructor(client, dir) {
    this._client = client;
    this._dir = dir;

    const { path } = require.main;
    if (dir && dir !== "") this._dir = join(path, dir);

    try {
      readdirSync(this._dir);
    } catch (err) {
      this._client.logWarn({
        data: `No "${dir}" directory found! Creating one...`,
      });
      mkdirSync(this._dir);
    }

    this._init();
  }

  /** @private */
  _init() {
    const files = readdirSync(this._dir);
    for (const file of files) {
      if (require.main.filename.endsWith(".js") && file.endsWith(".js")) {
        /** @type {Feature} */
        const feature = require(join(this._dir, file));
        if (!(feature instanceof Feature)) {
          this._client.logError({
            data: `Feature at path ${join(
              this._dir,
              file,
            )} is not a valid feature. Please make sure it is set up correctly.`,
          });
          continue;
        }

        if (!feature.run || typeof feature.run !== "function") {
          this._client.logError({
            data: `Feature at path ${join(
              this._dir,
              file,
            )} does not have a valid "run" function. Please make sure it is set up correctly.`,
          });
          continue;
        }

        feature.run(this._client);
      } else if (
        require.main.filename.endsWith(".ts") &&
        file.endsWith(".ts") &&
        !file.endsWith(".d.ts")
      ) {
        /** @type {Feature} */
        const feature = require(join(this._dir, file)).default;
        if (!(feature instanceof Feature)) {
          this._client.logError({
            data: `Feature at path ${join(
              this._dir,
              file,
            )} is not a valid feature. Please make sure it is set up correctly.`,
          });
          continue;
        }

        if (!feature.run || typeof feature.run !== "function") {
          this._client.logError({
            data: `Feature at path ${join(
              this._dir,
              file,
            )} does not have a valid "run" function. Please make sure it is set up correctly.`,
          });
          continue;
        }

        feature.run(this._client);
      }
    }
  }
};
