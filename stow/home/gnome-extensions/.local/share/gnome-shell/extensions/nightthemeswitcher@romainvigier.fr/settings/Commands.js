// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

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
