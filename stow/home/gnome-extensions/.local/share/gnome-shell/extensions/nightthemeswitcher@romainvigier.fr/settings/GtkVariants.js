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


var GtkVariantsSettings = class {
    constructor() {
        logDebug('Initializing GTK variants settings...');
        this.settings = extensionUtils.getSettings(getSettingsSchema('gtk-variants'));
        logDebug('GTK variants settings initialized.');
    }

    enable() {
        logDebug('Connecting GTK variants settings signals...');
        this._enabledChangedConnect = this.settings.connect('changed::enabled', this._onEnabledChanged.bind(this));
        this._dayChangedConnect = this.settings.connect('changed::day', this._onDayChanged.bind(this));
        this._nightChangedConnect = this.settings.connect('changed::night', this._onNightChanged.bind(this));
        this._manualChangedConnect = this.settings.connect('changed::manual', this._onManualChanged.bind(this));
        logDebug('GTK variants settings signals connected.');
    }

    disable() {
        logDebug('Disconnecting GTK variants settings signals...');
        this.settings.disconnect(this._enabledChangedConnect);
        this.settings.disconnect(this._dayChangedConnect);
        this.settings.disconnect(this._nightChangedConnect);
        this.settings.disconnect(this._manualChangedConnect);
        logDebug('GTK variants settings signals disconnected.');
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
            logDebug(`The GTK day variant has been set to '${value}'.`);
        }
    }

    get night() {
        return this.settings.get_string('night');
    }

    set night(value) {
        if (value !== this.night) {
            this.settings.set_string('night', value);
            logDebug(`The GTK night variant has been set to '${value}'.`);
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
        logDebug(`GTK variants have been ${this.enabled ? 'ena' : 'disa'}bled.`);
        this.emit('status-changed', this.enabled);
    }

    _onDayChanged(_settings, _changedKey) {
        logDebug(`GTK day variant has changed to '${this.day}'.`);
        this.emit('variant-changed', 'day');
    }

    _onNightChanged(_settings, _changedKey) {
        logDebug(`GTK night variant has changed to '${this.night}'.`);
        this.emit('variant-changed', 'night');
    }

    _onManualChanged(_settings, _changedKey) {
        logDebug(`Manual GTK variants have been ${this.manual ? 'ena' : 'disa'}bled.`);
        this.emit('manual-changed', this.manual);
    }
};
Signals.addSignalMethods(GtkVariantsSettings.prototype);
