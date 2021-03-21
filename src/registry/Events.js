const { CDClient } = require("../Base/CDClient");
const Event = require("../Base/Event");
const { lstatSync, existsSync, readdirSync, mkdirSync } = require("fs");
const { join } = require("path");

/**
 * @param {string} eventsDir
 * @param {CDClient} client
 * @param {boolean} customMessageEvent
 */
function Events(eventsDir, client, customMessageEvent) {
  let totalEvents = 0;
  if (!existsSync(join(require.main.path, eventsDir)))
    mkdirSync(join(require.main.path, eventsDir), { recursive: true });
  const files = readdirSync(join(require.main.path, eventsDir));
  for (const file of files) {
    if (lstatSync(join(require.main.path, eventsDir, file)).isDirectory())
      totalEvents += Events(
        `${join(eventsDir, file)}`,
        client,
        customMessageEvent,
      );
    else {
      /** @type {Event} */
      const event = require(join(require.main.path, eventsDir, file));
      if (event.name === "message" && !customMessageEvent) continue;
      if (event.name === "ready") continue;
      if (!(event instanceof Event)) {
        client.logError({
          data: `Event file ${require.main.path}\\${eventsDir}\\${file} is an invalid event. Please make sure all files are setup correctly`,
        });
        continue;
      }
      totalEvents += 1;
      client.on(event.name, event.run.bind(null, client));
    }
  }
  return totalEvents;
}

module.exports = Events;
