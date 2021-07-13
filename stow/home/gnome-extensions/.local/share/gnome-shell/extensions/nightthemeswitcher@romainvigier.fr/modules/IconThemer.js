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
 * The Icon Themer is responsible for changing the icon theme according to the
 * time.
 */
var IconThemer = class {
    constructor() {
        this._statusChangedConnect = null;
        this._variantChangedConnect = null;
        this._systemIconThemeChangedConnect = null;
        this._timeChangedConnect = null;
    }

    enable() {
        logDebug('Enabling Icon Themer...');
        this._watchStatus();
        if (e.settings.iconVariants.enabled) {
            this._connectSettings();
            this._connectTimer();
            this._setSystemVariant(e.timer.time);
        }
        logDebug('Icon Themer enabled.');
    }

    disable() {
        logDebug('Disabling Icon Themer...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        logDebug('Icon Themer disabled.');
    }


    _watchStatus() {
        logDebug('Watching icon variants status...');
        this._statusChangedConnect = e.settings.iconVariants.connect('status-changed', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusChangedConnect) {
            e.settings.iconVariants.disconnect(this._statusChangedConnect);
            this._statusChangedConnect = null;
        }
        logDebug('Stopped watching icon variants status.');
    }

    _connectSettings() {
        logDebug('Connecting Icon Themer to settings...');
        this._variantChangedConnect = e.settings.iconVariants.connect('variant-changed', this._onVariantChanged.bind(this));
        this._systemIconThemeChangedConnect = e.settings.system.connect('icon-theme-changed', this._onSystemIconThemeChanged.bind(this));
    }

    _disconnectSettings() {
        if (this._variantChangedConnect) {
            e.settings.iconVariants.disconnect(this._variantChangedConnect);
            this._variantChangedConnect = null;
        }
        if (this._systemIconThemeChangedConnect) {
            e.settings.system.disconnect(this._systemIconThemeChangedConnect);
            this._systemIconThemeChangedConnect = null;
        }
        logDebug('Disconnected Icon Themer from settings.');
    }

    _connectTimer() {
        logDebug('Connecting Icon Themer to Timer...');
        this._timeChangedConnect = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timeChangedConnect) {
            e.timer.disconnect(this._timeChangedConnect);
            this._timeChangedConnect = null;
        }
        logDebug('Disconnected Icon Themer from Timer.');
    }


    _onStatusChanged(_settings, _enabled) {
        this.disable();
        this.enable();
    }

    _onVariantChanged(_settings, changedVariantTime) {
        if (changedVariantTime === e.timer.time)
            this._setSystemVariant(changedVariantTime);
    }

    _onSystemIconThemeChanged(_settings, newTheme) {
        switch (e.timer.time) {
        case 'day':
            e.settings.iconVariants.day = newTheme;
            break;
        case 'night':
            e.settings.iconVariants.night = newTheme;
        }
        this._setSystemVariant(e.timer.time);
    }

    _onTimeChanged(_timer, newTime) {
        this._setSystemVariant(newTime);
    }


    _setSystemVariant(time) {
        logDebug(`Setting the icon ${time} variant...`);
        switch (time) {
        case 'day':
            if (e.settings.iconVariants.day)
                e.settings.system.iconTheme = e.settings.iconVariants.day;
            break;
        case 'night':
            if (e.settings.iconVariants.night)
                e.settings.system.iconTheme = e.settings.iconVariants.night;
        }
    }
};
