const cp = require('child_process');
const path = require('path');
const fs = require('fs');

const { atob, cBotApi, checkValidToken, configLocation } = require('../js/dep');

async function useCustomBot(jwt, botName, oAuth, debug = false) {
  const channelId = JSON.parse(atob(jwt.split(".")[1])).channel;
  let username;
  try {
    const tmp = await checkValidToken(jwt);
    username = tmp.username;
  } catch(err) {
    throw new Error("Invalid channel token");
  }
  let file = path.join(configLocation, "bot");
  if (!fs.existsSync(file)) {
    if (fs.existsSync(file + ".exe")) {
      file += ".exe";
    } else {
      throw new Error("Bot proxy not found");
    }
  }
  const bot = cp.spawn(file, [], {
    env: {
      CHANNEL: username,
      CHANNEL_ID: channelId,
      OAUTH: oAuth,
      BOT_USERNAME: botName,
      JWT: jwt,
      SOCKET_SERVER: cBotApi
    }
  });
  if (debug) {
    bot.on("message", message => {
      console.log(message);
    });
    bot.on("error", err => {
      console.error(err);
    });
  }

  return bot;
}
module.exports = useCustomBot;
