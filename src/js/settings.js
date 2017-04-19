/*globals $, node_fs, loadIframe, pack, configFile */
// Show keybindings
function keyInfo() {
    $("#key-info").on("click", function() {
        $("#key-info").prop('onclick', null).off('click');
        $("#key-info").html(`<a><b>DEPENDING ON YOUR KEYBOARD-LAYOUT SOME COMBINATIONS MAY NOT WORK!</b></a><p style="margin-bottom: 0;">Available keys:</p><ul><li>0 to 9, A to Z, F1 to F24, Punctuations like ~, !, @, #, $, etc.</li><li>Plus, Space, Tab, Backspace, Delete, Insert, Return (or Enter as alias)</li><li>Up, Down, Left and Right, Home and End, PageUp and PageDown</li><li>Escape (or Esc for short), VolumeUp, VolumeDown and VolumeMute</li><li>MediaNextTrack, MediaPreviousTrack, MediaStop and MediaPlayPause</li><li>PrintScreen</li></ul>`);
        $("#key-info").on("click", function() {
            $("#key-info").prop('onclick', null).off('click');
            $("#key-info").html(`<a style="cursor: pointer;">Show info about keybindings</a>`);
            keyInfo();
        });
    });
}
keyInfo();

// Show version
$("#version").html("v" + pack.version );

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
    if (node_fs.existsSync(configFile)) {
        var a;
        try {
            a = JSON.parse(node_fs.readFileSync(configFile));
        } catch (err) {
            return console.error("Could not parse JSON");
        }
        if (a.keys) {
            for (let key in a.keys) {
                $("#" + key).val(a.keys[key]);
            }
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
    var tmp = {
        token: "",
        keys: {}
    };
    $(".autoC").each(function() {
        tmp.keys[$(this).attr("id")] = $(this).val() || "";
    });
    // Token
    if(!$("#jwt").parent().hasClass("is-invalid")) {
        tmp.token = $("#jwt").val();
    }
    node_fs.writeFileSync(configFile, JSON.stringify(tmp));
    loadIframe();
}

$("input").on("property change keyup", update_S);
$("select").on("property change keyup", update_S);
