/*global got, pack, remote, $, fs, path, configFile, chokidar, currentPage, os, myText, currentLang*/

const { loadIframe } = require("./js/loadMain");

$("#updater p").html(myText["loading"][currentLang]);

function showMain() {
  $(".goto_settings").css("display", "inline-block");
  $("#nav").css("display", "block");
  currentPage = "#main";
  loadIframe();
  var watcher = chokidar.watch(configFile.replace(/config\.json$/, ""), {
    persistent: true
  });
  watcher.on("change", file => {
    var filename = path.basename(file);
    if (fs.existsSync(configFile) && filename === "config.json") {
      loadIframe();
    }
  });
}

// Update the app
var isDev = (function() {
  if (os.platform() === "win32") {
    if (__filename.includes("app.asar") || (process.argv[1] && process.argv[1].includes("squirrel")) && fs.existsSync(path.resolve(path.dirname(process.execPath), '..', 'update.exe'))) {
      return false;
    }
    return true;
  } else if (os.platform() === "darwin") {
    return !process.argv[0].startsWith("/Applications/");
  }
  return false;
})();

if ((!isDev) && ["win32", "darwin"].includes(os.platform())) {
  try {
    checkLatestVersion().then(version => {
      if (!upToDate(pack.version, version)) {
        const autoUpdater = remote.autoUpdater;
        $("#updater p").html(myText["updating"][currentLang]);
        autoUpdater.on('checking-for-update', () => {
          loadingBar(version);
        });
        autoUpdater.on('update-not-available', () => {
          console.log('update-not-available');
          showMain();
        });
        autoUpdater.on('update-downloaded', () => {
          autoUpdater.quitAndInstall();
        });
        try {
          if (os.platform() === "win32") {
            autoUpdater.setFeedURL(pack.updateUrl);
          } else if (os.platform() === "darwin") {
            autoUpdater.setFeedURL(pack.updateUrl + "latest-mac.json");
          }
        } catch(err) {
          console.log(err);
          showMain();
        }
        autoUpdater.checkForUpdates();
        window.autoUpdater = autoUpdater;
      } else {
        console.log("Up to date!");
        showMain();
      }
    });
  } catch (err) {
    console.log(err);
    showMain();
  }
} else {
  console.log("This is dev!");
  showMain();
}

/**
 * Returns true if up to date.
 * @param {string} local 
 * @param {string} remote 
 */
function upToDate(local, remote) {
  if (!local || !remote || local.length === 0 || remote.length === 0)
    return false;
  if (local == remote)
    return true;
  if (/^\d+(\.\d+){0,2}$/.test(local) && /^\d+(\.\d+){0,2}$/.test(remote)) {
    var lparts = local.split('.');
    while (lparts.length < 3)
      lparts.push("0");
    var rparts = remote.split('.');
    while (rparts.length < 3)
      rparts.push("0");
    for (var i = 0; i < 3; i++) {
      var l = parseInt(lparts[i], 10);
      var r = parseInt(rparts[i], 10);
      if (l === r)
        continue;
      return l > r;
    }
    return true;
  } else {
    return local >= remote;
  }
}

function checkLatestVersion() {
  switch (os.platform()) {
    case "win32":
      return got.get(pack.updateUrl + "RELEASES").then(res => {
        return res.body.match(/[0-9]*\.[0-9]*\.[0-9]*/g)[0];
      }).catch(err => {
        console.error(err);
        return "0.0.0";
      });
    case "darwin":
      return got.get(pack.updateUrl + "latest-mac.json").then(res => {
        try {
          return JSON.parse(res.body).version;
        } catch (err) {
          return "0.0.0";
        }
      }).catch(err => {
        console.error(err);
        return "0.0.0";
      });
  }
}

function getDownloadSpeedInMbs() {
  var start = new Date();
  return new Promise((resolve, reject) => {
    got.get("https://cdn.streamelements.com/static/pagebg.jpg").then(res => {
      var done = new Date();
      var data = new Buffer(res.body);
      resolve((data.byteLength / 1000000) / ((done.getTime() - start.getTime()) / 1000));
    }).catch(err => {
      reject(err);
    });
  });
}

function loadingBar(version) {
  $("#updateProgress").removeClass("hidden");
  got.head(`https://cdn.streamelements.com/ground-control/updates/ground_control-${version}-full.nupkg`).then(res => {
    var sizeInMb = res.headers["content-length"] / 1000000;
    (function moreTime() {
      var timeWaste = new Date();
      getDownloadSpeedInMbs().then(speed => {
        var pSpeed = (sizeInMb/100) * (speed * 2);
        setTimeout(function() {
          var currentP = Number($("#updateProgress .progressbar").attr("style").replace(/[^0-9\.]/g, ""));
          $("#updateProgress")[0].MaterialProgress.setProgress(currentP + (pSpeed * ((new Date().getTime() - timeWaste.getTime()) / 1000)));
          moreTime();
        }, 1000 * 5);
      });
    })();
  });
}
