const { join } = require("path");
const Event = require("../Base/Event");
const { CDClient } = require("../Base/CDClient");
const { lstatSync, existsSync, readdirSync, mkdirSync } = require("fs");

/**
 * @param {string} eventsDir
 * @param {CDClient} client
 * @param {boolean} customMessageEvent
 */
async function Events(eventsDir, client, customMessageEvent) {
  let totalEvents = 0;
  if (!existsSync(join(require.main.path, eventsDir))) {
    client.logWarn({
      data: `No "${eventsDir}" directory found! Creating one...`,
    });
    mkdirSync(join(require.main.path, eventsDir), { recursive: true });
  }
  const files = readdirSync(join(require.main.path, eventsDir));
  for (const file of files) {
    if (lstatSync(join(require.main.path, eventsDir, file)).isDirectory())
      totalEvents += await Events(
        `${join(eventsDir, file)}`,
        client,
        customMessageEvent,
      );
    else {
      if (require.main.filename.endsWith(".js") && file.endsWith(".js")) {
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
      } else if (
        require.main.filename.endsWith(".ts") &&
        file.endsWith(".ts") &&
        !file.endsWith(".d.ts")
      ) {
        /** @type {Event} */
        const event = require(join(require.main.path, eventsDir, file)).default;
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
  }
  return totalEvents;
}

module.exports = Events;
