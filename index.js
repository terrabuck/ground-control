const { app, BrowserWindow, globalShortcut, session } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const got = require('got');
const chokidar = require('chokidar');
const connectSocket = require('./src/modules/socket');

const configFile = path.normalize(__dirname.replace(/[\\|\/]?resources.*/, "").replace(/app.*/, "") + "/config.json");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let socket;
let contents;

if (require('electron-squirrel-startup')) {
    app.quit();
}

if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, `{"token":""}`);
}

function reg() {
    let settings;
    try {
        settings = JSON.parse(fs.readFileSync(configFile).toString());
    } catch (error) {
        setTimeout(function() {
            reg();
        }, 100);
        return;
    }

    /* Socket */
    socket = null;
    if (settings.token) {
        socket = connectSocket(settings.token);
    }
    session.defaultSession.cookies.set({ url: "https://streamelements.com", name: "token", value: settings.token || "#" }, (err) => {
        if (err) {
            console.error(err);
        }
    });

    if (settings.keys && settings.token && settings.token !== "") {
        /* Skip Alert */
        if (settings.keys.skip_alert) {
            let key = settings.keys.skip_alert;
            try {
                globalShortcut.register(key, () => {
                    if (socket) {
                        console.log("Send: 'Skip Alert'");
                        socket.emit('event:skip');
                    }
                });
            } catch (error) {
                console.log(`Keybind for 'Skip Alert' failed, '${key}'`);
            }
        }
        /* Skip Song */
        if (settings.keys.skip_song) {
            let key = settings.keys.skip_song;
            try {
                globalShortcut.register(key, () => {
                    got.delete("https://caipirinha.streamelements.com/kappa/v1/songrequest/queue/skip", {
                        headers: {
                            Authorization: "Bearer " + settings.token
                        }
                    }).then(() => {
                        console.log("Send: 'Skip Song'");
                    }).catch(err => {
                        console.error("Could not skip the current song:", err.message);
                    });
                });
            } catch (error) {
                console.log(`Keybind for 'Skip Song' failed, '${key}'`);
            }
        }
        /* Stop/Resume Alerts */
        // if (settings.keys.SnR_alert) {
        //   let key = settings.keys.SnR_alert;
        //   try {
        //     globalShortcut.register(key, () => {
        //       if (socket) {
        //         console.log("Send: 'Stop/Resume Alerts'");
        //         socket.emit('overlay:togglequeue');
        //       }
        //     });
        //   } catch (error) {
        //     console.log(`Keybind for 'Stop/Resume Alerts' failed, '${key}'`);
        //   }
        // }
        /* Stop/Resume Song */
        if (settings.keys.SnR_song) {
            let key = settings.keys.SnR_song;
            try {
                globalShortcut.register(key, () => {
                    if (contents) {
                        contents.executeJavaScript(`document.querySelector("#frame_sr").executeJavaScript(\`$("button[ng-click='vm.togglePlayer()']").click()\`);`, true).then(() => {
                            console.log("Send: 'Stop/Resume Song'");
                        });
                    }
                });
            } catch (error) {
                console.log(`Keybind for 'Stop/Resume Song' failed, '${key}'`);
            }
        }
    }
    return settings;
}

function createWindow() {
    // globalShortcut
    var settings = {};
    if (fs.existsSync(configFile)) {
        settings = reg();
    }

    var watcher = chokidar.watch(configFile.replace(/config\.json$/, ""), {
        persistent: true
    });
    watcher.on("change", file => {
        var filename = path.basename(file);
        if (fs.existsSync(configFile) && filename === "config.json") {
            socket = null;
            globalShortcut.unregisterAll();
            reg();
        }
    });


    // Create the browser window.
    win = new BrowserWindow({ width: 650, height: 790, resizable: true, icon: path.join(__dirname, 'src/se.ico') });

    // Hide top bar
    win.setMenu(null);

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'src/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // set contents
    contents = win.webContents;

    /* Dark mode */
    if (settings.darkMode) {
        contents.executeJavaScript(`$("html").addClass("darkMode")`);
    }

    // When target="_blank"
    win.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        if (url) {
            // const winNew = new BrowserWindow({
            //   webPreferences: {
            //     nodeIntegration: false
            //   },
            //   parent: win
            // });
            // winNew.setMenu(null);
            // winNew.loadURL(url);
        }
    });

    // Open the DevTools.
    if ((fs.existsSync('./package.json') && /.*[\\/]npm[\\/]node_modules[\\/]electron[\\/]dist[\\/]electron[\.a-z]*/i.test(path.normalize(process.argv[0]))) || (process.argv[2] && process.argv[2] === "secret dev")) {
        win.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

app.on('will-quit', () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
});