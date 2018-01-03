const cp = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

let firstRunToday = true;

const got = require('got');

const {
  atob, cBotApi, checkValidToken, configLocation, canUseBot
} = require('../js/dep');

async function useCustomBot(jwt, botName, oAuth) {
  const channelId = JSON.parse(atob(jwt.split('.')[1])).channel;
  let username;
  try {
    const tmp = await checkValidToken(jwt);
    username = tmp.username; // eslint-disable-line prefer-destructuring
  } catch (err) {
    // throw new Error("Invalid channel token");
    return null;
  }
  let file = path.join(configLocation, 'bot');
  if (os.platform() === 'win32') {
    file += '.exe';
  }
  const allowed = await canUseBot(jwt);
  if (firstRunToday) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    if (!allowed) return null;
    let downloadUrl = 'https://cdn.streamelements.com/ground-control/tether/tether';
    switch (os.platform()) {
      case 'win32':
        downloadUrl += '.exe';
        break;
      case 'linux':
        downloadUrl += '_linux';
        break;
      case 'darwin':
        downloadUrl += '_darwin';
        break;
      default:
        throw new Error('Platform not supported');
    }
    const download = await got.get(downloadUrl, {
      encoding: null
    });

    fs.writeFileSync(file, download.body, {
      mode: 0o755
    });
    firstRunToday = false;
  }
  if (!allowed) return null;
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
  bot.stdout.on('data', data => {
    fs.appendFile(path.join(configLocation, 'bot.log'), data.toString(), err => {
      if (err) console.log(err);
    });
  });
  bot.stderr.on('data', data => {
    if (!data) return;
    fs.appendFile(path.join(configLocation, 'bot.log'), data.toString(), err => {
      if (err) console.error(err);
    });
  });

  return bot;
}
module.exports = { useCustomBot };
