/*globals $, node_fs, got, remote, pack, configFile */

// Navigation
$("#goto_settings").on("click", () => {
    $("#frame_main").css("display", "none");
    $("#frame_settings").css("display", "block");
});
$("#goto_main").on("click", function() {
    $("#frame_settings").css("display", "none");
    $("#frame_main").css("display", "block");
    if ($("#jwt").val()) {
        $("#jwt").prop("disabled", true).addClass("secret");
        $("#show-jwt").prop('checked', false);
    }
});

// Iframe
loadIframe();
function loadIframe() {
    if(node_fs.existsSync(configFile)) {
        var a;
        try {
            a = JSON.parse(node_fs.readFileSync(configFile));
            if (a.token && a.token !== "") {
                checkValidToken(a.token).then(res => {
                    if (res) {
                        if ($("#pop_frame").attr('src') !== "https://streamelements.com/dashboard/%F0%9F%A4%94/activity/popout") {
                            $("#pop_frame").attr('src', 'https://streamelements.com/dashboard/%F0%9F%A4%94/activity/popout').css("display", "block");
                            $("#noToken").css("display", "none");
                            $("#invToken").css("display", "none");
                        }
                    } else {
                        $("#pop_frame").attr('src', '').css("display", "none");
                        $("#noToken").css("display", "none");
                        $("#invToken").css("display", "block");
                    }
                });
            } else {
                $("#pop_frame").attr('src', '').css("display", "none");
                $("#noToken").css("display", "block");
                $("#invToken").css("display", "none");
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        $("#pop_frame").attr('src', '').css("display", "none");
        $("#noToken").css("display", "block");
        $("#invToken").css("display", "none");
    }
}

function checkValidToken(token) {
    return got.get("https://caipirinha.streamelements.com/kappa/v1/users/me", {
        headers: {
            authorization: "Bearer " + token
        }
    }).then(() => {
        return true;
    }).catch(() => {
        return false;
    });
}

// Update the app
if (__filename.includes("app.asar") && !(process.argv[1] && process.argv[1].includes("squirrel"))) {
    try {
        got.get(pack.build.squirrelWindows.remoteReleases + "RELEASES").then(res => {
            if (!upToDate(pack.version, res.body.match(/[0-9]*\.[0-9]*\.[0-9]*/g)[0])) {
                const autoUpdater = remote.autoUpdater;
                autoUpdater.on('update-availabe', () => {
                    console.log('update available');
                });
                autoUpdater.on('checking-for-update', () => {
                    console.log('checking-for-update');
                });
                autoUpdater.on('update-not-available', () => {
                    console.log('update-not-available');
                    $("body").css("overflow", "auto");
                    $("#frame_updates").css("display", "none");
                    $("#frame_main").css("display", "block");
                });
                autoUpdater.on('update-downloaded', () => {
                    autoUpdater.quitAndInstall();
                });
                autoUpdater.setFeedURL(pack.build.squirrelWindows.remoteReleases);
                autoUpdater.checkForUpdates();
                window.autoUpdater = autoUpdater;
            } else {
                $("body").css("overflow", "auto");
                $("#frame_updates").css("display", "none");
                $("#frame_main").css("display", "block");
            }
        });
    } catch(err) {
        console.log(err);
        $("body").css("overflow", "auto");
        $("#frame_updates").css("display", "none");
        $("#frame_main").css("display", "block");
    }
} else {
    $("body").css("overflow", "auto");
    $("#frame_updates").css("display", "none");
    $("#frame_main").css("display", "block");
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
        while(lparts.length < 3)
            lparts.push("0");
        var rparts = remote.split('.');
        while (rparts.length < 3)
            rparts.push("0");
        for (var i=0; i<3; i++) {
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