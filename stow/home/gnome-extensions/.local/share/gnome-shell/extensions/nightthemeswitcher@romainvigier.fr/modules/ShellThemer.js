/*
Night Theme Switcher Gnome Shell extension

Copyright (C) 2020 Romain Vigier

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program. If not, see <http s ://www.gnu.org/licenses/>.
*/

const { extensionUtils } = imports.misc;
const Signals = imports.signals;
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { logDebug, notifyError, getInstalledShellThemes, getShellThemeStylesheet, applyShellStylesheet } = Me.imports.utils;
const { ShellVariants } = Me.imports.modules.ShellVariants;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

/**
 * The Shell Themer is responsible for changing the GTK theme according to the
 * time. It will use the User Themes extension to do so if it is enabled.
 *
 * When the user changes its shell theme (for example via GNOME Tweaks), it will
 * try to automatically guess the day and night variants for this theme. It
 * will warn the user if it is unable to guess.
 *
 * In manual mode, it will not attempt to update the variants. The user can
 * change the shell variants in the extension's preferences.
 */
var ShellThemer = class {
    constructor() {
        this._statusChangedConnect = null;
        this._variantChangedConnect = null;
        this._manualChangedConnect = null;
        this._systemShellThemeChangedConnect = null;
        this._timeChangedConnect = null;
    }

    enable() {
        logDebug('Enabling Shell Themer...');
        try {
            this._watchStatus();
            if (e.settings.shellVariants.enabled) {
                this._connectSettings();
                this._updateVariants();
                this._connectTimer();
                this._setSystemVariant(e.timer.time);
            }
        } catch (error) {
            notifyError(error);
        }
        logDebug('Shell Themer enabled.');
    }

    disable() {
        logDebug('Disabling Shell Themer...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        logDebug('Shell Themer disabled.');
    }


    _watchStatus() {
        logDebug('Watching shell variants status...');
        this._statusChangedConnect = e.settings.shellVariants.connect('status-changed', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusChangedConnect) {
            e.settings.shellVariants.disconnect(this._statusChangedConnect);
            this._statusChangedConnect = null;
        }
        logDebug('Stopped watching shell variants status.');
    }

    _connectSettings() {
        logDebug('Connecting Shell Themer to settings...');
        this._variantChangedConnect = e.settings.shellVariants.connect('variant-changed', this._onVariantChanged.bind(this));
        this._manualChangedConnect = e.settings.shellVariants.connect('manual-changed', this._onManualChanged.bind(this));
        this._systemShellThemeChangedConnect = e.settings.system.connect('shell-theme-changed', this._onSystemShellThemeChanged.bind(this));
    }

    _disconnectSettings() {
        if (this._variantChangedConnect) {
            e.settings.shellVariants.disconnect(this._variantChangedConnect);
            this._variantChangedConnect = null;
        }
        if (this._manualChangedConnect) {
            e.settings.shellVariants.disconnect(this._manualChangedConnect);
            this._manualChangedConnect = null;
        }
        if (this._systemShellThemeChangedConnect) {
            e.settings.system.disconnect(this._systemShellThemeChangedConnect);
            this._systemShellThemeChangedConnect = null;
        }
        logDebug('Disconnected Shell Themer from settings.');
    }

    _connectTimer() {
        logDebug('Connecting Shell Themer to Timer...');
        this._timeChangedConnect = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timeChangedConnect) {
            e.timer.disconnect(this._timeChangedConnect);
            this._timeChangedConnect = null;
        }
        logDebug('Disconnected Shell Themer from Timer.');
    }


    _onStatusChanged(_settings, _enabled) {
        this.disable();
        this.enable();
    }

    _onVariantChanged(_settings, changedVariantTime) {
        if (changedVariantTime === e.timer.time)
            this._setSystemVariant(e.timer.time);
    }

    _onSystemShellThemeChanged(_settings, _newTheme) {
        try {
            this._updateVariants();
            this._setSystemVariant(e.timer.time);
        } catch (error) {
            notifyError(error);
        }
    }

    _onManualChanged(_settings, _enabled) {
        this.disable();
        this.enable();
    }

    _onTimeChanged(_timer, newTime) {
        this._setSystemVariant(newTime);
    }


    _areVariantsUpToDate() {
        return e.settings.system.shellTheme === e.settings.shellVariants.day || e.settings.system.shellTheme === e.settings.shellVariants.night;
    }

    _setSystemVariant(time) {
        if (!time)
            return;
        logDebug(`Setting the shell ${time} variant...`);
        const shellTheme = time === 'day' ? e.settings.shellVariants.day : e.settings.shellVariants.night;
        if (e.settings.system.useUserthemes) {
            e.settings.system.shellTheme = shellTheme;
        } else {
            const stylesheet = getShellThemeStylesheet(shellTheme);
            applyShellStylesheet(stylesheet);
        }
    }

    _updateVariants() {
        if (!e.settings.system.useUserthemes || e.settings.shellVariants.manual || this._areVariantsUpToDate())
            return;

        logDebug('Updating Shell variants...');
        const originalTheme = e.settings.system.shellTheme;
        const variants = ShellVariants.guessFrom(originalTheme);
        const installedThemes = getInstalledShellThemes();

        if (!installedThemes.has(variants.get('day')) || !installedThemes.has(variants.get('night'))) {
            const message = _('Unable to automatically detect the day and night variants for the "%s" GNOME Shell theme. Please manually choose them in the extension\'s preferences.').format(originalTheme);
            throw new Error(message);
        }

        e.settings.shellVariants.day = variants.get('day');
        e.settings.shellVariants.night = variants.get('night');
        logDebug(`New Shell variants. { day: '${variants.get('day')}'; night: '${variants.get('night')}' }`);
    }
};
Signals.addSignalMethods(ShellThemer.prototype);
