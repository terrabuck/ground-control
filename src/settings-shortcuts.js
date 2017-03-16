// 
registerShortcutInput($("#skip_alert_K"))
registerShortcutInput($("#skip_song_K"))

var keyReplacements = {
    "+": "Plus",
    " ": "Space",
    "MediaTrackPrevious": "MediaPreviousTrack",
    "MediaTrackNext": "MediaNextTrack",
    "ArrowLeft": "Left",
    "ArrowDown": "Down",
    "ArrowRight": "Right",
    "ArrowUp": "Up",
}

// binds the keydown event of the jqueryNode to updateing it's value with the shortcut
function registerShortcutInput(jqueryNode) {
    jqueryNode.keydown(function(event) {
        console.log(event.key);

        // prevent normal typing
        event.preventDefault();

        // return if a the key is a modifier
        if (event.key == "Control" || event.key == "Alt" || event.key == "Shift" || event.key == "Meta" ) {
            return;
        }

        // return if no modifier key is pressed
        if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
            return;
        }

        var keyCode = "";

        // add the modifier keys
        if (event.ctrlKey) {
            keyCode += process.platform == 'darwin' ? "Cmd+" : "Ctrl+";
        }

        if (event.altKey) {
            keyCode += "Alt+";
        }

        if (event.shiftKey) {
            keyCode += "Shift+";
        }
        
        if (event.metaKey) {
            keyCode += "Super+";
        }

        // add the key
        if (keyReplacements[event.key]) {
            keyCode += keyReplacements[event.key];
        } else if (event.key.length == 1) {
            keyCode += event.key.toUpperCase();
        } else {
            keyCode += event.key;
        }

        // update value
        jqueryNode.prop("value", keyCode);
    });
}