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
const cBotApi = "wss://omegalul.streamelements.com";

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
    ru: "Пропустить оповещение",
    fr: "Passer l'alerte"
  },
  "alert:stop": {
    en: "Stop/Resume alerts",
    ru: "Остановить/Продолжить оповещения",
    fr: "Arrêter/Reprendre alertes"
  },
  "song:skip": {
    en: "Skip song",
    ru: "Пропустить песню",
    fr: "Passer la chanson"
  },
  "song:stop": {
    en: "Stop/Resume song",
    ru: "Остановить/Продолжить песню",
    fr: "Arrêter reprendre la chanson"
  },
  "song:show": {
    en: "Show/Hide video",
    ru: "Показать/Скрыть видео"
  },
  "keyboard:warning": {
    en: "DEPENDING ON YOUR KEYBOARD-LAYOUT SOME COMBINATIONS MAY NOT WORK!",
    ru: "В зависимости от вашей раскладки на клавиатуре некоторые комбинации могут не работать!",
    fr: "CERTAINES COMBINAISONS PEUVENT NE PAS FONCTIONNER EN FONCTION DE VOTRE CLAVIER !"
  },
  "keyboard:available": {
    en: "Available keys:",
    ru: "Доступные клавиши:",
    fr: "Touches disponibles"
  },
  "keyboard:punctuations": {
    en: "Punctuations",
    ru: "Punctuations",
    fr: "Ponctuations"
  },
  "keyboard:alias:enter": {
    en: "or Enter as alias",
    ru: "or Enter as alias",
    fr: "ou Entrée"
  },
  "keyboard:alias:esc": {
    en: "or Esc for short",
    ru: "or Esc for short",
    fr: "ou Esc"
  },
  "settings": {
    en: "Settings",
    ru: "Настройки",
    fr: "Réglages"
  },
  "authentication": {
    en: "Authentication",
    ru: "Авторизация",
    fr: "Connexion"
  },
  "jwt": {
    en: "Your JWT Token...",
    ru: "Ваш JWT Token...",
    fr: "Votre Token JWT..."
  },
  "jwt:link": {
    en: "You can find it under ",
    ru: "Вы можете это найти там ",
    fr: "Disponible dans "
  },
  "account": {
    en: "My Account",
    ru: "Ваш аккаунт",
    fr: "Mon Compte"
  },
  "keyboard:bindings": {
    en: "Keybindings",
    ru: "Сочетания клавиш",
    fr: "Raccourcis clavier"
  },
  "keyboard:bindings:info": {
    en: "Show info about keybindings",
    ru: "Показать информацию о сочетаниях клавиш",
    fr: "Plus d'infos sur les raccourcis clavier"
  },
  "other": {
    en: "Other",
    ru: "Другие",
    fr: "Divers"
  },
  "use:sr": {
    en: "Use Songrequest: ",
    ru: "Использовать Songrequest: ",
    fr: "Activer le songrequest : "
  },
  "use:compact": {
    en: "Use Compact Mode: ",
    ru: "Использовать компактный режим: ",
    fr: "Activer le mode réduit : "
  },
  "session:reset": {
    en: "Reset Session",
    ru: "Сбросить сессию",
    fr: "Réinitialiser la session"
  },
  "updating": {
    en: "&nbsp;&nbsp;Updating",
    ru: "&nbsp;Обновляем",
    fr: "&nbsp;Chargement"
  },
  "jwt:invalid": {
    en: "You entered an invalid <a>JWT Token</a>.",
    ru: "Вы ввели неправильный <a>JWT Token</a>.",
    fr: "Votre <a>Token JWT</a> est invalide."
  },
  "jwt:500": {
    en: "Something is wrong on our site...",
    ru: "Что-то не так на нашем сервисе...",
    fr: "Oops! Notre site est inaccessible..."
  },
  "jwt:missing": {
    en: "To use the activity feed, please enter your <a>JWT Token</a> in the settings menu.",
    ru: "Для получения оповещений, пожалуйста введите ваш <a>JWT Token</a> в меню настроек.",
    fr: "Pour utiliser le fil d'actualité, veuillez saisir votre <a>Token JWT</a> dans les réglages."
  },
  "loading": {
    en: "&nbsp;&nbsp;&nbsp;Loading",
    ru: "Загружаемся",
    fr: "&nbsp;&nbsp;Chargement"
  },
  "done": {
    en: "Done",
    ru: "сделанный",
    fr: "Terminé"
  },
  "customBotName": {
    en: "Custom bot name",
    ru: "Кастомное название бота",
    fr: "Nom du bot personnalisé"
  },
  "Name": {
    en: "Name",
    ru: "Имя",
    fr: "Nom"
  },
  "bot:test": {
    en: "Test Bot",
    ru: "Тест бот",
    fr: "Bot de test"
  },
  "bot:generate": {
    en: "You can generate your OAuth Token ",
    ru: "Вы можете создать токен авторизации ",
    fr: "Vous pouvez générer votre Token OAuth "
  },
  "here": {
    en: "here",
    ru: "тут",
    fr: "ici"
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
  return new Promise((resolve, reject) => {
    got.get(`https://${api}/kappa/v2/channels/me`, {
      headers: {
        authorization: "Bearer " + token
      }
    }).then(res => {
      try {
        resolve({
          valid: true,
          username: JSON.parse(res.body).username
        });
      } catch (err) {
        resolve({
          valid: true,
          username: "#"
        });
      }
    }).catch(err => {
      reject(err);
    });
  });
}

/**
 * @param {string} jwt
 */
function canUseBot(jwt) {
  const channelId = JSON.parse(atob(jwt.split(".")[1])).channel;
  return new Promise(resolve => {
    got.get(`https://${api}/kappa/v2/bot/${channelId}`, {
      json: true,
      headers: {
        authorization: "Bearer " + jwt
      }
    }).then(res => {
      try {
        if (res.body.bot.allowCustomName) {
          resolve(true);
        } else {
          resolve(false);
        }
      } catch(err) {
        resolve(false);
      }
    }).catch(err => {
      console.error(err);
      resolve(false);
    });
  });
}


/**
 * @param {() => any} func
 * @param {number} wait in ms
 * @param {bool} immediate
 */
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

try {
  module.exports = {
    atob, url, api, cBotApi, pack, configLocation, configFile, checkValidToken, debounce, canUseBot
  };
} catch (err) {
  // Not loaded with require()
}
