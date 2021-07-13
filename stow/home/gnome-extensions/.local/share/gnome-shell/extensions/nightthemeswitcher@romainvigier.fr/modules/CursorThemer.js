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
const { logDebug } = Me.imports.utils;


/**
 * The Cursor Themer is responsible for changing the cursor theme according to
 * the time.
 */
var CursorThemer = class {
    constructor() {
        this._statusChangedConnect = null;
        this._variantChangedConnect = null;
        this._systemCursorThemeChangedConnect = null;
        this._timeChangedConnect = null;
    }

    enable() {
        logDebug('Enabling Cursor Themer...');
        this._watchStatus();
        if (e.settings.cursorVariants.enabled) {
            this._connectSettings();
            this._connectTimer();
            this._setSystemVariant(e.timer.time);
        }
        logDebug('Cursor Themer enabled.');
    }

    disable() {
        logDebug('Disabling Cursor Themer...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        logDebug('Cursor Themer disabled.');
    }


    _watchStatus() {
        logDebug('Watching cursor variants status...');
        this._statusChangedConnect = e.settings.cursorVariants.connect('status-changed', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusChangedConnect) {
            e.settings.cursorVariants.disconnect(this._statusChangedConnect);
            this._statusChangedConnect = null;
        }
        logDebug('Stopped watching cursor variants status.');
    }

    _connectSettings() {
        logDebug('Connecting Cursor Themer to settings...');
        this._variantChangedConnect = e.settings.cursorVariants.connect('variant-changed', this._onVariantChanged.bind(this));
        this._systemCursorThemeChangedConnect = e.settings.system.connect('cursor-theme-changed', this._onSystemCursorThemeChanged.bind(this));
    }

    _disconnectSettings() {
        if (this._variantChangedConnect) {
            e.settings.cursorVariants.disconnect(this._variantChangedConnect);
            this._variantChangedConnect = null;
        }
        if (this._systemCursorThemeChangedConnect) {
            e.settings.system.disconnect(this._systemCursorThemeChangedConnect);
            this._systemCursorThemeChangedConnect = null;
        }
        logDebug('Disconnected Cursor Themer from settings.');
    }

    _connectTimer() {
        logDebug('Connecting Cursor Themer to Timer...');
        this._timeChangedConnect = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timeChangedConnect) {
            e.timer.disconnect(this._timeChangedConnect);
            this._timeChangedConnect = null;
        }
        logDebug('Disconnected Cursor Themer from Timer.');
    }


    _onStatusChanged(_settings, _enabled) {
        this.disable();
        this.enable();
    }

    _onVariantChanged(_settings, changedVariantTime) {
        if (changedVariantTime === e.timer.time)
            this._setSystemVariant(changedVariantTime);
    }

    _onSystemCursorThemeChanged(_settings, newTheme) {
        switch (e.timer.time) {
        case 'day':
            e.settings.cursorVariants.day = newTheme;
            break;
        case 'night':
            e.settings.cursorVariants.night = newTheme;
        }
        this._setSystemVariant(e.timer.time);
    }

    _onTimeChanged(_timer, newTime) {
        this._setSystemVariant(newTime);
    }


    _setSystemVariant(time) {
        logDebug(`Setting the cursor ${time} variant...`);
        switch (time) {
        case 'day':
            if (e.settings.cursorVariants.day)
                e.settings.system.cursorTheme = e.settings.cursorVariants.day;
            break;
        case 'night':
            if (e.settings.cursorVariants.night)
                e.settings.system.cursorTheme = e.settings.cursorVariants.night;
        }
    }
};
