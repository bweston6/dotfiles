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

const Me = extensionUtils.getCurrentExtension();

const { logDebug, getSettingsSchema } = Me.imports.utils;


var CommandsSettings = class {
    constructor() {
        logDebug('Initializing commands settings...');
        this.settings = extensionUtils.getSettings(getSettingsSchema('commands'));
        logDebug('Commands settings initialized.');
    }

    enable() {
        logDebug('Connecting commands settings signals...');
        this._enabledChangedConnect = this.settings.connect('changed::enabled', this._onEnabledChanged.bind(this));
        this._sunriseChangedConnect = this.settings.connect('changed::sunrise', this._onSunriseChanged.bind(this));
        this._sunsetChangedConnect = this.settings.connect('changed::sunset', this._onSunsetChanged.bind(this));
        logDebug('Commands settings signals connected.');
    }

    disable() {
        logDebug('Disconnecting commands settings signals...');
        this.settings.disconnect(this._enabledChangedConnect);
        this.settings.disconnect(this._sunriseChangedConnect);
        this.settings.disconnect(this._sunsetChangedConnect);
        logDebug('Commands settings signals disconnected.');
    }


    get enabled() {
        return this.settings.get_boolean('enabled');
    }

    set enabled(value) {
        if (value !== this.enabled)
            this.settings.set_boolean('enabled', value);
    }

    get sunrise() {
        return this.settings.get_string('sunrise');
    }

    set sunrise(value) {
        if (value !== this.sunrise)
            this.settings.set_string('sunrise', value);
    }

    get sunset() {
        return this.settings.get_string('sunset');
    }

    set sunset(value) {
        if (value !== this.sunset)
            this.settings.set_string('sunset', value);
    }


    _onEnabledChanged(_settings, _changedKey) {
        logDebug(`Commands have been ${this.enabled ? 'ena' : 'disa'}bled.`);
        this.emit('status-changed', this.enabled);
    }

    _onSunriseChanged(_settings, _changedKey) {
        logDebug(`Sunrise command changed to '${this.sunrise}'.`);
        this.emit('command-changed', 'sunrise');
        this.emit('sunrise-changed');
    }

    _onSunsetChanged(_settings, _changedKey) {
        logDebug(`Sunset command has changed to '${this.sunset}'.`);
        this.emit('command-changed', 'sunset');
        this.emit('sunset-changed');
    }
};
Signals.addSignalMethods(CommandsSettings.prototype);
