/*global $, fs, configFile, pack, ipcRenderer, got, api, url, shell, myText, currentLang*/

// Load text
document.body.innerHTML = document.body.innerHTML.replace(/{{((?:[^}]+.)*)}}/g,(m,p) => {
  if ("((?:[^}]+.)*)" !== p) {
    let x;
    try {
      x = eval(`${p}`) || "";
    } catch(a) {
      x="";
    }
    return x;
  }
});

$("#getToken").on("click", function() {
  shell.openExternal(`https://${url}/dashboard/account/information`);
});
function genKeybinding(title, id) {
  $("#keybindings").append(`<!-- ${title} -->
    <div id="${id}_top">
      <h6>${title}:</h6>
      <div class="inputF">
        <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect clearThis">
          <i class="material-icons">clear</i>
        </button>
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 20em;margin-right: 1em;">
          <input class="mdl-textfield__input autoC" type="text" id="${id}" ondragstart="return false;" ondrop="return false;">
          <label class="mdl-textfield__label" for="$${id}">Key...</label>
        </div>
      </div>
    </div>
    <div class="clear"></div>`);
}
genKeybinding(myText["alert:skip"][currentLang], "skip_alert");
genKeybinding(myText["alert:stop"][currentLang], "SnR_alert");
genKeybinding(myText["song:skip"][currentLang], "skip_song");
genKeybinding(myText["song:stop"][currentLang], "SnR_song");

// Show keybindings
function keyInfo() {
  $("#key-info").on("click", function() {
    $("#key-info").prop("onclick", null).off("click");
    $("#key-info").html(`<a><b>${myText["keyboard:warning"][currentLang]}</b></a><p style="margin-bottom: 0;">${myText["keyboard:available"][currentLang]}</p><ul><li>0 to 9, A to Z, F1 to F24, Punctuations like ~, !, @, #, $, etc.</li><li>Plus, Space, Tab, Backspace, Delete, Insert, Return (or Enter as alias)</li><li>Up, Down, Left and Right, Home and End, PageUp and PageDown</li><li>Escape (or Esc for short), VolumeUp, VolumeDown and VolumeMute</li><li>MediaNextTrack, MediaPreviousTrack, MediaStop and MediaPlayPause</li><li>PrintScreen</li></ul>`);
    $("#key-info").on("click", function() {
      $("#key-info").prop("onclick", null).off("click");
      $("#key-info").html(`<a style="cursor: pointer;">${myText["keyboard:bindings:info"][currentLang]}</a>`);
      keyInfo();
    });
  });
}
keyInfo();

// Show version
$("#version").html("v" + pack.version );

// Show token
$("#show-jwt").prop("checked", true);
$("#show-jwt").on("change", function() {
  if ($("#show-jwt").prop("checked")) {
    $("#jwt").prop("disabled", false).removeClass("secret");
  } else {
    $("#jwt").prop("disabled", true).addClass("secret");
  }
});
if ($("#jwt").val()) {
  $("#jwt").prop("disabled", true).addClass("secret");
  $("#show-jwt").prop("checked", false);
}

// Load old settings
(function() {
  if (fs.existsSync(configFile)) {
    var a;
    try {
      a = JSON.parse(fs.readFileSync(configFile));
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
      $("#show-jwt").prop("checked", false);
    }
    if (a.darkMode) {
      $("html").addClass("darkMode");
      $("#darkMode_sub").prop("checked", true);
    }
    if (a.other) {
      if (a.other.useSR === false) {
        ipcRenderer.sendToHost("sr:close");
        $("div").filter(function() {
          return this.id.match(/.*_song_top$/);
        }).css("display", "none");
      } else {
        $("#use_sr").prop("checked", true);
      }
      if (a.other.useCompact === true) {
        $("#use_compact").prop("checked", true);
      } else {

      }
    } else {
      $("#use_sr").prop("checked", true);
    }
    if (a.lang) {
      $("#languageSelection select").val(a.lang);
    }
  }
})();

// Change mode
function changeMode() {
  setTimeout(() => {
    let dark = $("#darkMode_sub").is(":checked") ? "dark" : "light";
    let mod = $("#use_compact").is(":checked") ? "-compact" : "";
    let lang = $("#languageSelection select").val();
    mod = dark + mod + ":" + lang;
    ipcRenderer.sendToHost("reload:" + mod);
  }, 10);
}
$("#use_compact").on("property change mouseup", function() {
  changeMode();
});
$("#darkMode_sub").on("property change mouseup", function() {
  changeMode();
});

// Change SR
$("#use_sr").on("property change mouseup", function() {
  setTimeout(() => {
    var mod;
    if ($("#use_sr").is(":checked")) {
      $("div").filter(function() {
        return this.id.match(/.*_song_top$/);
      }).css("display", "block");
      mod = "open";
    } else {
      $("div").filter(function() {
        return this.id.match(/.*_song_top$/);
      }).css("display", "none");
      mod = "close";
    }
    ipcRenderer.sendToHost("sr:" + mod);
  }, 10);
});

// Update settings
function update_S() {
  var tmp = {
    token: "",
    keys: {},
    darkMode: $("#darkMode_sub").is(":checked"),
    lang: $("#languageSelection select").val(),
    other: {
      useSR: $("#use_sr").is(":checked"),
      useCompact: $("#use_compact").is(":checked")
    }
  };
  $(".autoC").each(function() {
    tmp.keys[$(this).attr("id")] = $(this).val() || "";
  });
  // Token
  if(!$("#jwt").parent().hasClass("is-invalid")) {
    tmp.token = $("#jwt").val();
  }
  fs.writeFileSync(configFile, JSON.stringify(tmp));
  if (currentLang !== tmp.lang) {
    changeMode();
  }
}

$("input").on("property change keyup", update_S);
$("select").on("property change keyup", update_S);
$("darkMode_sub").on("property change mouseup", update_S);

// Reset Session
$("#resetSession").on("click", function() {
  let sessionUrl = '';
  try {
    sessionUrl = `https://${api}/kappa/v2/sessions/${JSON.parse(atob($("#jwt").val().split(".")[1])).channel}/reset`;
  } catch (err) {
    return;
  }
  got.put(sessionUrl, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + $("#jwt").val()
    },
    body: "{}"
  }).then(res => {
    if (res.body !== "Ok") {
      console.log(res);
    }
    $("#resetSession a").html(myText["done"][currentLang]);
    setTimeout(function() {
      $("#resetSession a").html(myText["session:reset"][currentLang]);
    }, 1000);
  }).catch(err => {
    console.error(err);
  });
});

// Prevent Redirection
window.onbeforeunload = function() {
  return false;
}
