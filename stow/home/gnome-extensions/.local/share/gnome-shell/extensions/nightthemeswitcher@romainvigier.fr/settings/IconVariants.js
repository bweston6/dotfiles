// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const { logDebug, getSettingsSchema } = Me.imports.utils;


var IconVariantsSettings = class {
    constructor() {
        logDebug('Initializing icon variants settings...');
        this.settings = extensionUtils.getSettings(getSettingsSchema('icon-variants'));
        logDebug('Icon variants settings initialized.');
    }

    enable() {
        logDebug('Connecting icon variants settings signals...');
        this._enabledChangedConnect = this.settings.connect('changed::enabled', this._onEnabledChanged.bind(this));
        this._dayChangedConnect = this.settings.connect('changed::day', this._onDayChanged.bind(this));
        this._nightChangedConnect = this.settings.connect('changed::night', this._onNightChanged.bind(this));
        logDebug('Icon variants settings signals connected.');
    }

    disable() {
        logDebug('Disconnecting icon variants settings signals...');
        this.settings.disconnect(this._enabledChangedConnect);
        this.settings.disconnect(this._dayChangedConnect);
        this.settings.disconnect(this._nightChangedConnect);
        logDebug('Icon variants settings signals disconnected.');
    }


    get enabled() {
        return this.settings.get_boolean('enabled');
    }

    set enabled(value) {
        if (value !== this.enabled)
            this.settings.set_boolean('enabled', value);
    }

    get day() {
        return this.settings.get_string('day');
    }

    set day(value) {
        if (value !== this.day) {
            this.settings.set_string('day', value);
            logDebug(`The icon day variant has been set to '${value}'.`);
        }
    }

    get night() {
        return this.settings.get_string('night');
    }

    set night(value) {
        if (value !== this.night) {
            this.settings.set_string('night', value);
            logDebug(`The icon night variant has been set to '${value}'.`);
        }
    }


    _onEnabledChanged(_settings, _changedKey) {
        logDebug(`Icon variants have been ${this.enabled ? 'ena' : 'disa'}bled.`);
        this.emit('status-changed', this.enabled);
    }

    _onDayChanged(_settings, _changedKey) {
        logDebug(`Icon day variant has changed to '${this.day}'.`);
        this.emit('variant-changed', 'day');
    }

    _onNightChanged(_settings, _changedKey) {
        logDebug(`Icon night variant has changed to '${this.night}'.`);
        this.emit('variant-changed', 'night');
    }
};
Signals.addSignalMethods(IconVariantsSettings.prototype);
