/*global got, $, fs, configFile, goTo, b4settings, currentPage*/
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
                                    if (b4settings) {
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
                                });
                                sr.addEventListener("dom-ready", () => {
                                    if (b4settings) {
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