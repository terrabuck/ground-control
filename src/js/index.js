/*globals $, node_fs, got, remote, pack, configFile, lastFrame */

// Navigation
$("#goto_settings").on("click", () => {
    $(".frames").css("display", "none");
    $("#buttons").css("display", "none");
    $("#frame_settings").css("display", "block");
});
$("button").on("click", () => {
    $("webview").css("height", 0);
    setTimeout(() => {
        $("webview").css("height", "100vh");
    }, 5);
});
$("#goto_back").on("click", () => {
    $("#frame_settings").css("display", "none");
    if ($("#jwt").val()) {
        $("#jwt").prop("disabled", true).addClass("secret");
        $("#show-jwt").prop('checked', false);
    }
    // Navigate to the correct frame
    $(".frames").css("display", "none");
    $("#" + lastFrame).css("display", "block");
    $("#buttons").css("display", "block");
});
$(".gotoButton").on("click", () => {
    if (lastFrame === "frame_sr") {
        lastFrame = "frame_main";
        $(".frames").css("display", "none");
        $("#frame_main").css("display", "block");
        $(".gotoMA").find(".material-icons").html("music_note");
        $(".gotoMA").addClass("gotoSR");
        $(".gotoMA").removeClass("gotoMA");
    } else {
        lastFrame = "frame_sr";
        $(".frames").css("display", "none");
        $("#frame_sr").css("display", "block");
        $(".gotoSR").find(".material-icons").html("view_list");
        $(".gotoSR").addClass("gotoMA");
        $(".gotoSR").removeClass("gotoSR");
    }
});

function checkWV() {
    if ($("#pop_frame").css("display") === "none") {
        lastFrame = "frame_main";
        $(".gotoButton").css("display", "none");
    } else {
        $(".gotoButton").css("display", "inline-block");
    }
    setTimeout(function() {
        checkWV();
    }, 10);
}
checkWV();

// Iframe
loadIframe();

function loadIframe() {
    if (node_fs.existsSync(configFile)) {
        var a;
        const pop = document.querySelector('#pop_frame');
        const sr = document.querySelector('#sr_frame');
        try {
            a = JSON.parse(node_fs.readFileSync(configFile));
            if (a.token && a.token !== "") {
                checkValidToken(a.token).then(res => {
                    if (res.valid) {
                        if ($("#pop_frame").attr('src') !== `https://streamelements.com/dashboard/${res.username}/activity/popout`) {
                            $("#pop_frame").attr('src', `https://streamelements.com/dashboard/${res.username}/activity/popout`).css("display", "flex");
                        }
                        if ($("#sr_frame").attr('src') !== "https://streamelements.com/dashboard/songrequest/general") {
                            $("#sr_frame").attr('src', "https://streamelements.com/dashboard/songrequest/general").css("display", "flex");
                        }
                        // Change stuff inside the pop_frame
                        pop.addEventListener("dom-ready", () => {
                            pop.insertCSS("a.md-primary.md-button.md-ink-ripple { display: none !important; }");
                            pop.insertCSS("md-card._md:nth-of-type(2) { margin-bottom: 0 !important; }");
                            pop.insertCSS(".flex.md-button.md-ink-ripple:nth-of-type(3) { max-width: 20em !important; }");
                            pop.executeJavaScript(`function oh_yea() { $("md-switch[ng-model='vm.adsEnabled']").removeClass("flex-60"); setTimeout(function() { oh_yea(); }, 20); }; oh_yea();`);
                        });

                        // Change stuff inside the sr_frame
                        sr.addEventListener("dom-ready", () => {
                            sr.insertCSS("md-toolbar { display: none !important; }");
                            sr.insertCSS(".container-fluid.wrapper.flex { padding-top: 0em !important; }");
                            sr.insertCSS(".flex.notes-div.layout-row.layout-align-start-center { flex: 0 1 auto !important; }");
                            sr.insertCSS(".layout-row.layout-align-space-between-start.flex-100 { justify-content: flex-start !important; }");
                            sr.insertCSS(".social-media { display: none !important; }");
                            sr.insertCSS(".copyright { display: none !important; }");
                            sr.insertCSS("md-sidenav { display: none !important; }");
                            sr.insertCSS("md-content.flex.layout-fill.layout-row.content-dash-wrapper._md { padding-left: 0 !important; }");
                        });

                        // Load the webviews
                        $("#frame_main").addClass("load");
                        $("#frame_sr").addClass("load");
                        setTimeout(function() {
                            $("#frame_main").removeClass("load");
                            $("#frame_sr").removeClass("load");
                        }, 12);
                        $("webview").css("display", "flex");
                        $("#noToken").css("display", "none");
                        $("#invToken").css("display", "none");
                    } else {
                        $("webview").attr('src', '').css("display", "none");
                        $("#sr_frame").attr('src', "http://%20");
                        $("#noToken").css("display", "none");
                        $("#invToken").css("display", "block");
                    }
                });
            } else {
                $("webview").attr('src', '').css("display", "none");
                $("#sr_frame").attr('src', "http://%20");
                $("#noToken").css("display", "block");
                $("#invToken").css("display", "none");
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        $("webview").attr('src', '').css("display", "none");
        $("#sr_frame").attr('src', "http://%20");
        $("#noToken").css("display", "block");
        $("#invToken").css("display", "none");
    }
}

function checkValidToken(token) {
    return got.get("https://caipirinha.streamelements.com/kappa/v1/users/me", {
        headers: {
            authorization: "Bearer " + token
        }
    }).then((res) => {
        try {
            return { valid: true, username: JSON.parse(res.body).username }
        } catch (err) {
            return { valid: true, username: "#" };
        }
    }).catch(() => {
        return { valid: false, username: "#" };
    });
}

function showMain() {
    $("body").css("overflow", "auto");
    $("#frame_updates").css("display", "none");
    $("#frame_main").css("display", "block");
    $("#buttons").css("display", "block");
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
                    showMain();
                });
                autoUpdater.on('update-downloaded', () => {
                    autoUpdater.quitAndInstall();
                });
                autoUpdater.setFeedURL(pack.build.squirrelWindows.remoteReleases);
                autoUpdater.checkForUpdates();
                window.autoUpdater = autoUpdater;
            } else {
                showMain();
            }
        });
    } catch (err) {
        console.log(err);
        showMain();
    }
} else {
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