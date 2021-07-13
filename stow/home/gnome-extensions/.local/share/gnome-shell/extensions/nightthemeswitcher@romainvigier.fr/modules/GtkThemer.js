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
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { logDebug, notifyError, getInstalledGtkThemes } = Me.imports.utils;
const { GtkVariants } = Me.imports.modules.GtkVariants;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;


/**
 * The GTK Themer is responsible for changing the GTK theme according to the
 * time.
 *
 * When the user changes its GTK theme (for example via GNOME Tweaks), it will
 * try to automatically guess the day and night variants for this theme. It
 * will warn the user if it is unable to guess.
 *
 * In manual mode, it will not attempt to update the variants. The user can
 * change the GTK variants in the extension's preferences.
 */
var GtkThemer = class {
    constructor() {
        this._statusChangedConnect = null;
        this._variantChangedConnect = null;
        this._manualChangedConnect = null;
        this._systemGtkThemeChangedConnect = null;
        this._timeChangedConnect = null;
    }

    enable() {
        logDebug('Enabling GTK Themer...');
        try {
            this._watchStatus();
            if (e.settings.gtkVariants.enabled) {
                this._connectSettings();
                this._updateVariants();
                this._connectTimer();
                this._setSystemVariant(e.timer.time);
            }
        } catch (error) {
            notifyError(error);
        }
        logDebug('GTK Themer enabled.');
    }

    disable() {
        logDebug('Disabling GTK Themer...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        logDebug('GTK Themer disabled.');
    }


    _watchStatus() {
        logDebug('Watching GTK variants status...');
        this._statusChangedConnect = e.settings.gtkVariants.connect('status-changed', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusChangedConnect) {
            e.settings.gtkVariants.disconnect(this._statusChangedConnect);
            this._statusChangedConnect = null;
        }
        logDebug('Stopped watching GTK variants status.');
    }

    _connectSettings() {
        logDebug('Connecting GTK Themer to settings...');
        this._variantChangedConnect = e.settings.gtkVariants.connect('variant-changed', this._onVariantChanged.bind(this));
        this._manualChangedConnect = e.settings.gtkVariants.connect('manual-changed', this._onManualChanged.bind(this));
        this._systemGtkThemeChangedConnect = e.settings.system.connect('gtk-theme-changed', this._onSystemGtkThemeChanged.bind(this));
    }

    _disconnectSettings() {
        if (this._variantChangedConnect) {
            e.settings.gtkVariants.disconnect(this._variantChangedConnect);
            this._variantChangedConnect = null;
        }
        if (this._manualChangedConnect) {
            e.settings.gtkVariants.disconnect(this._manualChangedConnect);
            this._manualChangedConnect = null;
        }
        if (this._systemGtkThemeChangedConnect) {
            e.settings.system.disconnect(this._systemGtkThemeChangedConnect);
            this._systemGtkThemeChangedConnect = null;
        }
        logDebug('Disconnected GTK Themer from settings.');
    }

    _connectTimer() {
        logDebug('Connecting GTK Themer to Timer...');
        this._timeChangedConnect = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timeChangedConnect) {
            e.timer.disconnect(this._timeChangedConnect);
            this._timeChangedConnect = null;
        }
        logDebug('Disconnected GTK Themer from Timer.');
    }


    _onStatusChanged(_settings, _enabled) {
        this.disable();
        this.enable();
    }

    _onVariantChanged(_settings, changedVariantTime) {
        if (changedVariantTime === e.timer.time)
            this._setSystemVariant(changedVariantTime);
    }

    _onSystemGtkThemeChanged(_settings, _newTheme) {
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
        return e.settings.system.gtkTheme === e.settings.gtkVariants.day || e.settings.system.gtkTheme === e.settings.gtkVariants.night;
    }

    _setSystemVariant(time) {
        if (!time)
            return;
        logDebug(`Setting the GTK ${time} variant...`);
        e.settings.system.gtkTheme = time === 'day' ? e.settings.gtkVariants.day : e.settings.gtkVariants.night;
    }

    _updateVariants() {
        if (e.settings.gtkVariants.manual || this._areVariantsUpToDate())
            return;

        logDebug('Updating GTK variants...');
        const originalTheme = e.settings.system.gtkTheme;
        const variants = GtkVariants.guessFrom(originalTheme);
        const installedThemes = getInstalledGtkThemes();

        if (!installedThemes.has(variants.get('day')) || !installedThemes.has(variants.get('night'))) {
            const message = _('Unable to automatically detect the day and night variants for the "%s" GTK theme. Please manually choose them in the extension\'s preferences.').format(originalTheme);
            throw new Error(message);
        }

        e.settings.gtkVariants.day = variants.get('day');
        e.settings.gtkVariants.night = variants.get('night');
        logDebug(`New GTK variants. { day: '${variants.get('day')}'; night: '${variants.get('night')}' }`);
    }
};
