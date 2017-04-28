/*global got, $, fs, configFile, goTo, currentPage*/
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
function loadIframe() {
    setTimeout(function() {
        if (fs.existsSync(configFile)) {
            var a;
            try {
                a = JSON.parse(fs.readFileSync(configFile));
                if (a.token && a.token !== "") {
                    checkValidToken(a.token).then(res => {
                        if (res.valid) {
                            if ($("#error").length) {
                                $("#main").html(`<webview id="frame_pop" src="https://streamelements.com/dashboard/${res.username || "%20"}/activity/popout" class="frame"></webview>` + 
                                                `<webview id="frame_sr" src="https://streamelements.com/dashboard/songrequest/general" class="frame"></webview>`);
                                if (currentPage !== "#settings") {
                                    $(".goto_sr").css("display", "inline-block");
                                }
                                const pop = document.querySelector('#frame_pop');
                                const sr = document.querySelector('#frame_sr');
                                pop.addEventListener("dom-ready", () => {
                                    if (currentPage === "#settings") {
                                        goTo("#settings");
                                    }
                                    pop.insertCSS("a.md-primary.md-button.md-ink-ripple { display: none !important; }");
                                    pop.insertCSS("md-card._md:nth-of-type(2) { margin-bottom: 0 !important; }");
                                    pop.insertCSS("img, a { pointer-events: none !important; }");
                                    pop.executeJavaScript(`function oh_yea() { 
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
                                                        setInterval(function() {
                                                            $("a").attr("href", "");
                                                            $("a").attr("ng-href", "");
                                                            $("a").css("cursor", "default");
                                                        }, 10);
                                                        setTimeout(function() {
                                                            oh_yea();
                                                        }, 1000 * 2);`);
                                    /* Start Dark mode */
                                    setTimeout(function() {
                                        if ($("html").hasClass("darkMode")) {
                                            pop.executeJavaScript(`$("html").addClass("darkMode");`);
                                        } else {
                                            pop.executeJavaScript(`$("html").removeClass("darkMode");`);
                                        }
                                    }, 1000);
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
                                                    }`);
                                    /* End Dark mode */
                                });
                                sr.addEventListener("dom-ready", () => {
                                    if (currentPage === "#settings") {
                                        goTo("#settings");
                                    }
                                    sr.insertCSS("md-toolbar { display: none !important; }");
                                    sr.insertCSS(".container-fluid.wrapper.flex { padding-top: 0em !important; }");
                                    sr.insertCSS(".flex.notes-div.layout-row.layout-align-start-center { flex: 0 1 auto !important; }");
                                    sr.insertCSS(".layout-row.layout-align-space-between-start.flex-100 { justify-content: flex-start !important; }");
                                    sr.insertCSS(".social-media { display: none !important; }");
                                    sr.insertCSS(".copyright { display: none !important; }");
                                    sr.insertCSS("md-sidenav { display: none !important; }");
                                    sr.insertCSS("md-content.flex.layout-fill.layout-row.content-dash-wrapper._md { padding-left: 0 !important; }");
                                    sr.insertCSS("a.md-primary.md-button.md-ink-ripple { display: none !important; }");
                                    sr.insertCSS("#livechat-compact-container { display: none !important; }")
                                    /* Start Dark mode */
                                    setTimeout(function() {
                                        if ($("html").hasClass("darkMode")) {
                                            sr.executeJavaScript(`$("html").addClass("darkMode");`);
                                        } else {
                                            sr.executeJavaScript(`$("html").removeClass("darkMode");`);
                                        }
                                    }, 1000);
                                    sr.insertCSS(`  html.darkMode .layout-fill,
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
                                                    }`);
                                    /* End Dark mode */
                                });
                            }
                        } else {
                            $("#main").css("display", "none");
                            $(".goto_sr").css("display", "none");
                            $("#main").html(`<p id="error">You entered a invalid <a>JWT Token</a>.</p>`);
                            $("#main").css("display", "block");
                        }
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
module.exports = { checkValidToken, loadIframe };