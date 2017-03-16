/*globals $, node_fs */
// Show keybindings
$("#key-info").on("click", function() {
    $("#key-info").html(`<a><b>DEPENDING ON YOUR KEYBOARD-LAYOUT SOME COMBINATIONS MAY NOT WORK!</b></a><p style="margin-bottom: 0;">Available keys:</p><ul><li>0 to 9, A to Z, F1 to F24, Punctuations like ~, !, @, #, $, etc.</li><li>Plus, Space, Tab, Backspace, Delete, Insert, Return (or Enter as alias)</li><li>Up, Down, Left and Right, Home and End, PageUp and PageDown</li><li>Escape (or Esc for short), VolumeUp, VolumeDown and VolumeMute</li><li>MediaNextTrack, MediaPreviousTrack, MediaStop and MediaPlayPause</li><li>PrintScreen</li></ul>`);
});

// Show version
(function() {
    var pack;
    if (node_fs.existsSync('./package.json')) {
        pack = JSON.parse(node_fs.readFileSync('./package.json', 'utf8'));
    } else if (node_fs.existsSync('./resources/app/package.json')) {
        pack = JSON.parse(node_fs.readFileSync('./resources/app/package.json', 'utf8'));
    } else if (node_fs.existsSync('./resources/app.asar')) {
        pack = JSON.parse(node_fs.readFileSync('./resources/app.asar/package.json', 'utf8'));
    } else {
        return;
    }
    $("#version").html("v" + pack.version );
})();

// Back button
$("#back").on("click", function() {
    window.location = "index.html";
});

// Show token
$("#show-jwt").prop('checked', true);
$("#show-jwt").on("change", function() {
    if ($("#show-jwt").prop('checked')) {
        $("#jwt").prop("disabled", false).removeClass("secret");
    } else {
        $("#jwt").prop("disabled", true).addClass("secret");
    }
});

// Load old settings
(function() {
    if (node_fs.existsSync("./config.json")) {
        var a;
        try {
            a = JSON.parse(node_fs.readFileSync("./config.json"));
        } catch (err) {
            return console.error("Could not parse JSON");
        }
        if (a.keys.skip_alert) {
            $("#skip_alert_M").val(a.keys.skip_alert.mod);
            $("#skip_alert_K").val(a.keys.skip_alert.key);
        }
        if (a.keys.skip_song) {
            $("#skip_song_M").val(a.keys.skip_song.mod);
            $("#skip_song_K").val(a.keys.skip_song.key);
        }
        if (a.keys.SnR_song) {
            $("#SnR_song_M").val(a.keys.SnR_song.mod);
            $("#SnR_song_K").val(a.keys.SnR_song.key);
        }
        if (a.token && a.token !== "") {
            setInterval(function() {
                $("#jwt").parent().removeClass("is-disabled");
            }, 10);
            $("#jwt").prop("disabled", true).addClass("secret").val(a.token);
            $("#show-jwt").prop('checked', false);
        }
    }
})();

// Update settings
function update_S() {
    $(".autoC").each(function() {
        if ($(this).val() && $(this).val() !== "" && $(this).val().length === 1) {
            if ($(this).val() === " ") {
                $(this).val("Space");
            } else if ($(this).val() === "+") {
                $(this).val("Plus");
            } else {
                $(this).val($(this).val().toLocaleUpperCase());
            }
        }
    });
    var tmp = {
        token: "",
        keys: {
            skip_alert: {
                key: "",
                mod: $("#skip_alert_M").val() || ""
            },
            skip_song: {
                key: "",
                mod: $("#skip_song_M").val() || ""
            },
            SnR_song: {
                key: "",
                mod: $("#SnR_song_M").val() || ""
            }
        }
    };
    // Token
    if(!$("#jwt").parent().hasClass("is-invalid")) {
        tmp.token = $("#jwt").val();
    }
    // Keys
    if(!$("#skip_alert_K").parent().hasClass("is-invalid")) {
        tmp.keys.skip_alert.key = $("#skip_alert_K").val();
    }
    if(!$("#skip_song_K").parent().hasClass("is-invalid")) {
        tmp.keys.skip_song.key = $("#skip_song_K").val();
    }
    if(!$("#SnR_song_K").parent().hasClass("is-invalid")) {
        tmp.keys.SnR_song.key = $("#SnR_song_K").val();
    }
    node_fs.writeFileSync("./config.json", JSON.stringify(tmp));
}

$("input").bind("property change keyup", update_S);
$("select").bind("property change keyup", update_S);