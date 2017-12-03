/*eslint-disable no-unused-vars*/
const fs = require("fs");
const got = require("got");
const path = require("path");
const os = require("os");
const chokidar = require("chokidar");
const configLocation = path.normalize(os.homedir() + "/.se-gc/");
const configFile = path.join(configLocation, "config.json");
const { shell, remote } = require("electron");
var pack;
if (fs.existsSync('./package.json')) {
  pack = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
} else if (fs.existsSync('./resources/app/package.json')) {
  pack = JSON.parse(fs.readFileSync('./resources/app/package.json', 'utf8'));
} else if (fs.existsSync('./resources/app.asar')) {
  pack = JSON.parse(fs.readFileSync('./resources/app.asar/package.json', 'utf8'));
} else if (fs.existsSync(__filename.replace(/src.*/, "") + "package.json")) {
  pack = JSON.parse(fs.readFileSync(__filename.replace(/src.*/, "") + "package.json", 'utf8'));
}
const url = "streamelements.com";
const api = "api.streamelements.com";
const cBotApi = "";

let currentLang = "en";
if (fs.existsSync(configFile)) {
  var a;
  try {
    a = JSON.parse(fs.readFileSync(configFile));
    if (a.lang) {
      currentLang = a.lang;
    }
  } catch (err) {
    console.error("Could not parse JSON");
  }
}
const myText = {
  "alert:skip": {
    en: "Skip alert",
    ru: "Пропустить оповещение"
  },
  "alert:stop": {
    en: "Stop/Resume alerts",
    ru: "Остановить/Продолжить оповещения"
  },
  "song:skip": {
    en: "Skip song",
    ru: "Пропустить песню"
  },
  "song:stop": {
    en: "Stop/Resume song",
    ru: "Остановить/Продолжить песню"
  },
  "keyboard:warning": {
    en: "DEPENDING ON YOUR KEYBOARD-LAYOUT SOME COMBINATIONS MAY NOT WORK!",
    ru: "В зависимости от вашей раскладки на клавиатуре некоторые комбинации могут не работать!"
  },
  "keyboard:available": {
    en: "Available keys:",
    ru: "Доступные клавиши:"
  },
  "keyboard:punctuations": {
    en: "Punctuations",
    ru: "Punctuations"
  },
  "keyboard:alias:enter": {
    en: "or Enter as alias",
    ru: "or Enter as alias"
  },
  "keyboard:alias:esc": {
    en: "or Esc for short",
    ru: "or Esc for short"
  },
  "settings": {
    en: "Settings",
    ru: "Настройки"
  },
  "authentication": {
    en: "Authentication",
    ru: "Авторизация"
  },
  "jwt": {
    en: "Your JWT Token...",
    ru: "Ваш JWT Token..."
  },
  "jwt:link": {
    en: "You can find it under ",
    ru: "Вы можете это найти там "
  },
  "account": {
    en: "My Account",
    ru: "Ваш аккаунт"
  },
  "keyboard:bindings": {
    en: "Keybindings",
    ru: "Сочетания клавиш"
  },
  "keyboard:bindings:info": {
    en: "Show info about keybindings",
    ru: "Показать информацию о сочетаниях клавиш"
  },
  "other": {
    en: "Other",
    ru: "Другие"
  },
  "use:sr": {
    en: "Use Songrequest: ",
    ru: "Использовать Songrequest: "
  },
  "use:compact": {
    en: "Use Compact Mode: ",
    ru: "Использовать компактный режим: "
  },
  "session:reset": {
    en: "Reset Session",
    ru: "Сбросить сессию"
  },
  "updating": {
    en: "&nbsp;&nbsp;Updating",
    ru: "&nbsp;Обновляем"
  },
  "jwt:invalid": {
    en: "You entered an invalid <a>JWT Token</a>.",
    ru: "Вы ввели неправильный <a>JWT Token</a>."
  },
  "jwt:500": {
    en: "Something is wrong on our site...",
    ru: "Что-то не так на нашем сервисе..."
  },
  "jwt:missing": {
    en: "To use the activity feed, please enter your <a>JWT Token</a> in the settings menu.",
    ru: "Для получения оповещений, пожалуйста введите ваш <a>JWT Token</a> в меню настроек."
  },
  "loading": {
    en: "&nbsp;&nbsp;&nbsp;Loading",
    ru: "Загружаемся"
  },
  "done": {
    en: "Done",
    ru: "сделанный"
  },
  "customBotName": {
    en: "Custom bot name",
    ru: "Кастомное название бота"
  },
  "Name": {
    en: "Name",
    ru: "Имя"
  }
}

/**
 * @param {string} str 
 */
function atob(str) {
  return new Buffer(str, 'base64').toString('binary');
}

/**
 * @param {string} token 
 */
function checkValidToken(token) {
  return got.get(`https://${api}/kappa/v2/channels/me`, {
    headers: {
      authorization: "Bearer " + token
    }
  }).then(res => {
    try {
      return {
        valid: true,
        username: JSON.parse(res.body).username
      };
    } catch (err) {
      return {
        valid: true,
        username: "#"
      };
    }
  }).catch(err => {
    throw err;
  });
}

try {
  module.exports = {
    atob, url, api, cBotApi, pack, configLocation, configFile, checkValidToken
  };
} catch (err) {
  // Not loaded with require()
}
