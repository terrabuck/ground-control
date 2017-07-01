/*global got, $, fs, configFile, goTo, currentPage, shell, b4settings*/
function checkValidToken(token) {
    return got.get("https://api.streamelements.com/kappa/v1/users/me", {
        headers: {
            authorization: "Bearer " + token
        }
    }).then((res) => {
        try {
            return {
                valid: true,
                username: JSON.parse(res.body).username
            }
        } catch (err) {
            return {
                valid: true,
                username: "#"
            };
        }
    }).catch((err) => {
        throw err;
    });
}

function loadIframe() {
    setTimeout(function () {
        if (fs.existsSync(configFile)) {
            var a;
            try {
                a = JSON.parse(fs.readFileSync(configFile));
                if (a.token && a.token !== "") {
                    checkValidToken(a.token).then(res => {
                        if (res.valid) {
                            if ($("#error").length) {
                                if (a.other && a.other.useSR === false) {
                                    $(".goto_sr").remove();
                                    $(".goto_pop").remove();
                                    $("#main").html(`<webview id="frame_pop" src="https://streamelements.com/dashboard/${res.username || "%20"}/activity/popout" class="frame"></webview>`);
                                } else {
                                    $("#main").html(`<webview id="frame_pop" src="https://streamelements.com/dashboard/${res.username || "%20"}/activity/popout" class="frame"></webview>` +
                                        `<webview id="frame_sr" src="https://streamelements.com/dashboard/songrequest/general" class="frame"></webview>`);
                                }
                                if (currentPage !== "#settings") {
                                    $(".goto_sr").css("display", "inline-block");
                                }
                                const pop = document.querySelector("#frame_pop");
                                const sr = document.querySelector("#frame_sr");
                                const settings = document.querySelector("#settings");
                                settings.addEventListener("ipc-message", (event) => {
                                    if (event.channel.startsWith("reload")) {
                                        var mod = event.channel.split(":")[1] || false;
                                        if (mod) {
                                            location.hash = mod;
                                        }
                                        location.reload();
                                    } else if (event.channel.startsWith("sr")) {
                                        var mod = event.channel.split(":")[1] || false;
                                        if (mod) {
                                            if (mod === "close") {
                                                $(".goto_sr").remove();
                                                $(".goto_pop").remove();
                                                $("#frame_sr").remove();
                                                b4settings = "#main";
                                            } else if (mod === "open") {
                                                $("#nav").prepend(`<button onclick="goSr();" class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect goto_sr"><i class="material-icons">music_note</i>` +
                                                `</button><button onclick="goPop();" class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect goto_pop"><i class="material-icons">menu</i></button>`);
                                                $("#main").append(`<webview id="frame_sr" src="https://streamelements.com/dashboard/songrequest/general" class="frame"></webview>`);
                                                loadSr(document.querySelector("#frame_sr"));
                                            }
                                        }
                                    }
                                });
                                pop.addEventListener("dom-ready", () => {
                                    if (currentPage === "#settings") {
                                        goTo("#settings");
                                    }
                                    pop.insertCSS(` a.md-primary.md-button.md-ink-ripple {
                                                        display: none !important;
                                                    }
                                                    md-card._md:nth-of-type(2) {
                                                        margin-bottom: 0 !important;
                                                    }
                                                    img {
                                                        pointer-events: none !important;
                                                    }
                                                    .mod-approval .md-primary.md-subheader._md .md-subheader-content {
                                                        cursor: pointer !important;
                                                    }
                                                    .flex.md-button.md-ink-ripple md-icon {
                                                        cursor: pointer !important;
                                                    }
                                                    .material-icons {
                                                        cursor: pointer;
                                                    }
                                                    .gc-banner-activity {
                                                        display: none;
                                                    }
                                                    iframe#launcher {
                                                        display: none !important;
                                                    }`);
                                    pop.addEventListener("new-window", (e) => {
                                        const protocol = require("url").parse(e.url).protocol
                                        if (protocol === "http:" || protocol === "https:") {
                                            shell.openExternal(e.url)
                                        }
                                    });
                                    pop.executeJavaScript(`
                                                        window.onbeforeunload = function() {
                                                            return false;
                                                        }
                                                        function oh_yea() {
                                                            if($("md-switch[ng-model='vm.adsEnabled']").length) {
                                                                $("md-switch[ng-model='vm.adsEnabled']").removeClass("flex-60");
                                                                $("md-switch[ng-model='vm.adsEnabled']").next().css("max-width", "calc(100% - 18.7em)");
                                                            } else if ($(".flex.md-button.md-ink-ripple[ng-click='vm.skipAlert()']").length) {
                                                                $(".flex.md-button.md-ink-ripple[ng-click='vm.skipAlert()']").removeClass("flex");
                                                            } else {
                                                                setTimeout(function() {
                                                                    oh_yea();
                                                                }, 10);
                                                            }
                                                        }
                                                        setTimeout(function() {
                                                            oh_yea();
                                                        }, 1000 * 2);`);
                                    /* Start Dark mode */
                                    if ($("html").hasClass("darkMode")) {
                                        pop.executeJavaScript(`$("html").addClass("darkMode");`);
                                    }
                                    pop.insertCSS(` html.darkMode body,
                                                    html.darkMode md-content {
                                                        background-color: rgb(48, 48, 48);
                                                    }
                                                    html.darkMode md-card,
                                                    html.darkMode md-list-item,
                                                    html.darkMode div.md-primary.md-subheader._md {
                                                        background-color: rgb(66,66,66) !important;
                                                    }
                                                    html.darkMode .filter._md *,
                                                    html.darkMode div.md-list-item-text.event-section.layout-column a *,
                                                    html.darkMode div.md-list-item-text.event-section.layout-column h4 *,
                                                    html.darkMode div.md-list-item-text.event-section.layout-column .next-to-replay,
                                                    html.darkMode div.md-list-item-text.event-section.layout-column .event-message {
                                                        color: white;
                                                    }
                                                    html.darkMode a.md-primary *,
                                                    html.darkMode .md-subheader-inner *,
                                                    html.darkMode button.md-primary,
                                                    html.darkMode button.md-primary * {
                                                        color: orange !important;
                                                    }
                                                    html.darkMode .md-checked .md-icon {
                                                        background-color: #3EE09C !important;
                                                    }
                                                    html.darkMode .md-checked .md-icon::after {
                                                        border-color: black !important;
                                                    }
                                                    html.darkMode .md-checked .md-thumb-container .md-thumb {
                                                        background-color: rgb(62, 224, 156);
                                                    }
                                                    html.darkMode .md-checked .md-container .md-bar {
                                                        background-color: rgba(62, 224, 156, 0.498039);
                                                    }
                                                    html.darkMode .ads-control {
                                                        color: white !important;
                                                    }
                                                    html.darkMode .event-username {
                                                        color: white !important;
                                                    }
                                                    html.darkMode p.event-message a {
                                                        color: #a4fffc !important;
                                                    }`);
                                    /* End Dark mode */
                                });
                                function loadSr(srA = sr) {
                                    srA.addEventListener("dom-ready", () => {
                                        if (currentPage === "#settings") {
                                            goTo("#settings");
                                        }
                                        srA.executeJavaScript(`window.onbeforeunload = function() { return false; }`);
                                        srA.insertCSS(` md-toolbar {
                                                            display: none !important;
                                                        }
                                                        .container-fluid.wrapper.flex {
                                                            padding-top: 0em !important;
                                                        }
                                                        .flex.notes-div.layout-row.layout-align-start-center {
                                                            flex: 0 1 auto !important;
                                                        }
                                                        .layout-row.layout-align-space-between-start.flex-100 {
                                                            justify-content: flex-start !important;
                                                        }
                                                        .social-media {
                                                            display: none !important;
                                                        }
                                                        .copyright {
                                                            display: none !important;
                                                        }
                                                        md-sidenav {
                                                            display: none !important;
                                                        }
                                                        md-content.flex.layout-fill.layout-row.content-dash-wrapper._md {
                                                            padding-left: 0 !important;
                                                        }
                                                        a.md-primary.md-button.md-ink-ripple {
                                                            display: none !important;
                                                        }
                                                        #livechat-compact-container {
                                                            display: none !important;
                                                        }
                                                        .songrequest-current-song {
                                                            order: 0 !important;
                                                        }
                                                        .songrequest-sidebar {
                                                            max-height: none !important;
                                                        }
                                                        .md-scroll-mask,
                                                        .md-dialog-container.ng-scope,
                                                        md-backdrop {
                                                            display: none !important;
                                                        }
                                                        iframe#launcher {
                                                            display: none !important;
                                                        }`);
                                        /* Start Dark mode */
                                        if ($("html").hasClass("darkMode")) {
                                            srA.executeJavaScript(`$("html").addClass("darkMode");`);
                                        }
                                        srA.insertCSS(` html.darkMode .layout-fill,
                                                        html.darkMode .container-fluid,
                                                        html.darkMode md-dialog .layout-row.layout-align-space-between-center {
                                                            background-color: rgb(48, 48, 48) !important;
                                                        }
                                                        html.darkMode a,
                                                        html.darkMode a * {
                                                            color: orange !important;
                                                        }
                                                        html.darkMode .md-label {
                                                            color: white;
                                                        }
                                                        html.darkMode .md-checked .md-container .md-bar {
                                                            background-color: rgba(62, 224,156, 0.5) !important;
                                                        }
                                                        html.darkMode .md-checked .md-thumb-container .md-thumb {
                                                            background-color: rgb(62, 224,156) !important;
                                                        }
                                                        html.darkMode .md-subheader-content {
                                                            color: orange;
                                                        }
                                                        html.darkMode md-card .layout-row,
                                                        html.darkMode md-card .layout-row .md-no-sticky,
                                                        html.darkMode md-divider,
                                                        html.darkMode md-list,
                                                        html.darkMode md-content,
                                                        html.darkMode .no-songs {
                                                            background-color: rgb(66,66,66) !important;
                                                        }
                                                        html.darkMode md-divider {
                                                            margin-bottom: 0 !important;
                                                            padding-bottom: 8px;
                                                            border-color: #7b7b7b;
                                                        }
                                                        html.darkMode .md-button.md-icon-button .material-icons, .md-button.md-icon-button md-icon {
                                                            color: lightgray !important;
                                                        }
                                                        html.darkMode p {
                                                            color: white;
                                                        }
                                                        html.darkMode md-list md-icon {
                                                            color: lightgray;
                                                        }
                                                        html.darkMode md-list .md-list-item-text * {
                                                            color: #fbfbfb !important
                                                        }
                                                        html.darkMode md-content div * {
                                                            color: white !important;
                                                        }
                                                        html.darkMode .md-track-fill,
                                                        html.darkMode .song-votes span {
                                                            background-color: rgb(62, 224,156) !important;
                                                        }
                                                        html.darkMode .md-thumb::after {
                                                            border-color: rgb(62, 224,156) !important;
                                                            background-color: rgb(62, 224,156) !important;
                                                        }
                                                        html.darkMode button.md-raised.md-primary.md-button.md-ink-ripple {
                                                            background-color: orange !important;
                                                        }
                                                        html.darkMode button.md-raised.md-primary.md-button.md-ink-ripple span {
                                                            color: black !important;
                                                        }
                                                        html.darkMode md-dialog-actions .md-button.md-primary span {
                                                            color: white !important;
                                                        }
                                                        html.darkMode md-dialog {
                                                            background-color: rgb(48, 48, 48) !important;
                                                        }
                                                        html.darkMode md-dialog h1,
                                                        html.darkMode md-dialog label {
                                                            color: white;
                                                        }
                                                        html.darkMode md-input-container * {
                                                            color: white !important;
                                                        }
                                                        html.darkMode md-input-container input {
                                                            border-color: white !important;
                                                        }
                                                        html.darkMode md-autocomplete * {
                                                            color: white;
                                                        }
                                                        html.darkMode .md-focus-ring {
                                                            background-color: rgba(255,64,129,0.2) !important;
                                                        }`);
                                        /* End Dark mode */
                                    });
                                }
                                if (!(a.other && a.other.useSR === false)) {
                                    loadSr();
                                }
                            }
                        } else {
                            $("#main").css("display", "none");
                            $(".goto_sr").css("display", "none");
                            $("#main").html(`<p id="error">You entered an invalid <a>JWT Token</a>.</p>`);
                            $("#main").css("display", "block");
                        }
                    }).catch(err => {
                        console.warn(err);
                        $("#main").css("display", "none");
                        $(".goto_sr").css("display", "none");
                        $("#main").html(`<p id="error">Something is wrong on our site...</p>`);
                        $("#main").css("display", "block");
                    });
                } else {
                    $("#main").css("display", "none");
                    $(".goto_sr").css("display", "none");
                    $("#main").html(`<p id="error">To use the activity feed, please enter the <a>JWT Token</a> in the settings menu.</p>`);
                    $("#main").css("display", "block");
                }
            } catch (err) {
                $("#main").css("display", "none");
                $(".goto_sr").css("display", "none");
                $("#main").html(`<p id="error">To use the activity feed, please enter the <a>JWT Token</a> in the settings menu.</p>`);
                $("#main").css("display", "block");
            }
        } else {
            $("#main").css("display", "none");
            $(".goto_sr").css("display", "none");
            $("#main").html(`<p id="error">To use the activity feed, please enter the <a>JWT Token</a> in the settings menu.</p>`);
            $("#main").css("display", "block");
        }
    }, 10);
}
module.exports = {
    checkValidToken,
    loadIframe
};