var exec = require('child_process').exec;

module.exports = {
    config: {
        enabled: {
            type: 'boolean',
            default: true
        }
    },

    /**
     * Activates the package.
     */
    activate: function() {
        atom.commands.add('atom-workspace', 'gtk-dark-theme:enable', this.enable);
        atom.commands.add('atom-workspace', 'gtk-dark-theme:disable', this.disable);

        // Automatically enable dark theme if it was enabled last time we ran.
        if (atom.config.get('gtk-dark-theme.enabled')) {
            this.enable();
        }
    },

    /**
     * Enables the GTK dark theme.
     */
    enable: function() {
        console.log('Setting GTK theme variant to "dark".');
        setAtomGtkTheme('dark').then(function () {
            atom.config.set('gtk-dark-theme.enabled', true);
        });
    },

    /**
     * Disables the GTK dark theme.
     */
    disable: function() {
        console.log('Setting GTK theme variant to "light".');
        setAtomGtkTheme('light').then(function () {
            atom.config.set('gtk-dark-theme.enabled', false);
        });
    }
};


/**
 * Gets the handle IDs of all currently open Atom windows.
 *
 * @return Promise
 */
function getAtomWindowHandles() {
    return new Promise(function(resolve, reject) {
        //var windows = [atom.getCurrentWindow()];
        var windows = require('electron').remote.BrowserWindow.getAllWindows();

        var ids = windows.map(w => w.getNativeWindowHandle().readUInt32LE());

        resolve(ids);
    });
}

/**
 * Sets the GTK theme variant of all Atom windows.
 *
 * @param [String] variant The GTK theme variant to set.
 *
 * @return Promise
 */
function setAtomGtkTheme(theme) {
    return getAtomWindowHandles().then(function(handles) {
        var promises = [];

        for (var i = 0; i < handles.length; i++) {
            var cmd = 'xprop -id '
                + handles[i]
                + ' -f _GTK_THEME_VARIANT 8u -set _GTK_THEME_VARIANT '
                + theme;

            promises.push(new Promise(function(resolve, reject) {
                exec(cmd, function(error, stdout, stderr) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            }));
        }

        return Promise.all(promises);
    });
}
