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

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { logDebug } = Me.imports.utils;

/**
 * The Backgrounder is responsible for changing the desktop background
 * according to the time.
 *
 * When the user changes its desktop background (for example via the system
 * settings), it will use it as the current time background.
 */
var Backgrounder = class {
    constructor() {
        this._statusChangedConnect = null;
        this._backgroundChangedConnect = null;
        this._systemBackgroundChangedConnect = null;
        this._backgroundChangedConnect = null;
    }

    enable() {
        logDebug('Enabling Backgrounder...');
        this._watchStatus();
        if (e.settings.backgrounds.enabled) {
            this._connectSettings();
            this._connectTimer();
            this._changeSystemBackground(e.timer.time);
        }
        logDebug('Backgrounder enabled.');
    }

    disable() {
        logDebug('Disabling Backgrounder...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        logDebug('Backgrounder disabled.');
    }


    _watchStatus() {
        logDebug('Watching backgrounds status...');
        this._statusChangedConnect = e.settings.backgrounds.connect('status-changed', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusChangedConnect) {
            e.settings.backgrounds.disconnect(this._statusChangedConnect);
            this._statusChangedConnect = null;
        }
        logDebug('Stopped watching backgrounds status.');
    }

    _connectSettings() {
        logDebug('Connecting Backgrounder to settings...');
        this._backgroundChangedConnect = e.settings.backgrounds.connect('background-changed', this._onBackgroundChanged.bind(this));
        this._systemBackgroundChangedConnect = e.settings.system.connect('background-changed', this._onSystemBackgroundChanged.bind(this));
    }

    _disconnectSettings() {
        if (this._backgroundChangedConnect) {
            e.settings.backgrounds.disconnect(this._backgroundChangedConnect);
            this._backgroundChangedConnect = null;
        }
        if (this._systemBackgroundChangedConnect) {
            e.settings.system.disconnect(this._systemBackgroundChangedConnect);
            this._systemBackgroundChangedConnect = null;
        }
        logDebug('Disconnected Backgrounder from settings.');
    }

    _connectTimer() {
        logDebug('Connecting Backgrounder to Timer...');
        this._backgroundChangedConnect = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._backgroundChangedConnect) {
            e.timer.disconnect(this._backgroundChangedConnect);
            this._backgroundChangedConnect = null;
        }
        logDebug('Disconnected Backgrounder from Timer.');
    }


    _onStatusChanged(_settings, _enabled) {
        this.disable();
        this.enable();
    }

    _onBackgroundChanged(_settings, changedBackgroundTime) {
        if (changedBackgroundTime === e.timer.time)
            this._changeSystemBackground(changedBackgroundTime);
    }

    _onSystemBackgroundChanged(_settings, newBackground) {
        switch (e.timer.time) {
        case 'day':
            e.settings.backgrounds.day = newBackground;
            break;
        case 'night':
            e.settings.backgrounds.night = newBackground;
        }
    }

    _onTimeChanged(_timer, newTime) {
        this._changeSystemBackground(newTime);
    }


    _changeSystemBackground(time) {
        switch (time) {
        case 'day':
            if (e.settings.backgrounds.day)
                e.settings.system.background = e.settings.backgrounds.day;
            break;
        case 'night':
            if (e.settings.backgrounds.night)
                e.settings.system.background = e.settings.backgrounds.night;
        }
    }
};
