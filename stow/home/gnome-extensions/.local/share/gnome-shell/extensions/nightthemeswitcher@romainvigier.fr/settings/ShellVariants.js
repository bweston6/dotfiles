// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const { logDebug, getSettingsSchema } = Me.imports.utils;


var ShellVariantsSettings = class {
    constructor() {
        logDebug('Initializing shell variants settings...');
        this.settings = extensionUtils.getSettings(getSettingsSchema('shell-variants'));
        logDebug('Shell variants settings initialized.');
    }

    enable() {
        logDebug('Connecting shell variants settings signals...');
        this._enabledChangedConnect = this.settings.connect('changed::enabled', this._onEnabledChanged.bind(this));
        this._dayChangedConnect = this.settings.connect('changed::day', this._onDayChanged.bind(this));
        this._nightChangedConnect = this.settings.connect('changed::night', this._onNightChanged.bind(this));
        this._manualChangedConnect = this.settings.connect('changed::manual', this._onManualChanged.bind(this));
        logDebug('Shell variants settings signals connected.');
    }

    disable() {
        logDebug('Disconnecting shell variants settings signals...');
        this.settings.disconnect(this._enabledChangedConnect);
        this.settings.disconnect(this._dayChangedConnect);
        this.settings.disconnect(this._nightChangedConnect);
        this.settings.disconnect(this._manualChangedConnect);
        logDebug('Shell variants settings signals disconnected.');
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
            logDebug(`The shell day variant has been set to '${value}'.`);
        }
    }

    get night() {
        return this.settings.get_string('night');
    }

    set night(value) {
        if (value !== this.night) {
            this.settings.set_string('night', value);
            logDebug(`The shell night variant has been set to '${value}'.`);
        }
    }

    get manual() {
        return this.settings.get_boolean('manual');
    }

    set manual(value) {
        if (value !== this.manual)
            this.settings.set_boolean('manual', value);
    }


    _onEnabledChanged(_settings, _changedKey) {
        logDebug(`Shell variants have been ${this.enabled ? 'ena' : 'disa'}bled.`);
        this.emit('status-changed', this.enabled);
    }

    _onDayChanged(_settings, _changedKey) {
        logDebug(`Shell day variant has changed to '${this.day}'.`);
        this.emit('variant-changed', 'day');
    }

    _onNightChanged(_settings, _changedKey) {
        logDebug(`Shell night variant has changed to '${this.night}'.`);
        this.emit('variant-changed', 'night');
    }

    _onManualChanged(_settings, _changedKey) {
        logDebug(`Manual Shell variants have been ${this.manual ? 'ena' : 'disa'}bled.`);
        this.emit('manual-changed', this.manual);
    }
};
Signals.addSignalMethods(ShellVariantsSettings.prototype);
