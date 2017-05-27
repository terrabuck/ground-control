/*global got, pack, remote, $, fs, path, configFile, chokidar, currentPage, os */

const { loadIframe } = require("./js/loadMain");

function showMain() {
    $("#updater").css("display", "none");
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
        return process.argv[0].startsWith("/Applications/");
    }
    return false;
})();

if (!isDev) {
    try {
        got.get(pack.build.squirrelWindows.remoteReleases + "RELEASES").then(res => {
            if (!upToDate(pack.version, res.body.match(/[0-9]*\.[0-9]*\.[0-9]*/g)[0])) {
                const autoUpdater = remote.autoUpdater;
                autoUpdater.on('update-availabe', () => {
                    console.log('update available');
                    $("#updater p").html("Updating");
                });
                autoUpdater.on('checking-for-update', () => {
                    console.log('checking-for-update');
                });
                autoUpdater.on('update-not-available', () => {
                    console.log('update-not-available');
                    showMain();
                });
                autoUpdater.on('update-downloaded', () => {
                    autoUpdater.quitAndInstall();
                });
                autoUpdater.setFeedURL(pack.build.squirrelWindows.remoteReleases);
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