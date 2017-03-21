/*globals $, node_fs, got, remote */

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
    if(node_fs.existsSync("../config.json")) {
        var a;
        try {
            a = JSON.parse(node_fs.readFileSync("../config.json"));
            if (a.token && a.token !== "") {
                checkValidToken(a.token).then(res => {
                    if (res) {
                        if ($("#popFrame").attr('src') !== "https://streamelements.com/dashboard/%F0%9F%A4%94/activity/popout") {
                            $("#popFrame").attr('src', 'https://streamelements.com/dashboard/%F0%9F%A4%94/activity/popout').css("display", "block");
                            $("#noToken").css("display", "none");
                            $("#invToken").css("display", "none");
                        }
                    } else {
                        $("#popFrame").attr('src', '').css("display", "none");
                        $("#noToken").css("display", "none");
                        $("#invToken").css("display", "block");
                    }
                });
            } else {
                $("#popFrame").attr('src', '').css("display", "none");
                $("#noToken").css("display", "block");
                $("#invToken").css("display", "none");
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        $("#popFrame").attr('src', '').css("display", "none");
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
try {
    if (node_fs.existsSync('./resources/app/package.json') || node_fs.existsSync('./resources/app.asar')) {
        const autoUpdater = remote.autoUpdater;
        autoUpdater.on('update-availabe', () => {
            console.log('update available');
            $("#update_status").html("Update available!");
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
        autoUpdater.setFeedURL(''); // <UPDATE URL>
        autoUpdater.checkForUpdates();
        window.autoUpdater = autoUpdater;
    } else {
        $("body").css("overflow", "auto");
        $("#frame_updates").css("display", "none");
        $("#frame_main").css("display", "block");
    }
} catch(err) {
    console.log(err);
    $("body").css("overflow", "auto");
    $("#frame_updates").css("display", "none");
    $("#frame_main").css("display", "block");
}
