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


var TimeSettings = class {
    constructor() {
        logDebug('Initializing time settings...');
        this.settings = extensionUtils.getSettings(getSettingsSchema('time'));
        logDebug('Time settings initialized.');
    }

    enable() {
        logDebug('Connecting time settings signals...');
        this._timeSourceChangedConnect = this.settings.connect('changed::time-source', this._onTimeSourceChanged.bind(this));
        this._manualTimeSourceChangedConnect = this.settings.connect('changed::manual-time-source', this._onManualTimeSourceChanged.bind(this));
        this._nightlightFollowDisableConnect = this.settings.connect('changed::nightlight-follow-disable', this._onNightlightFollowDisableChanged.bind(this));
        this._alwaysEnableOndemandConnect = this.settings.connect('changed::always-enable-ondemand', this._onAlwaysEnableOndemandChanged.bind(this));
        this._ondemandKeybindingChangedConnect = this.settings.connect('changed::nightthemeswitcher-ondemand-keybinding', this._onOndemandKeybindingChanged.bind(this));
        this._ondemandButtonPlacementChangedConnect = this.settings.connect('changed::ondemand-button-placement', this._onOndemandButtonPlacementChanged.bind(this));
        logDebug('System time signals connected.');
    }

    disable() {
        logDebug('Disconnecting time settings signals...');
        this.settings.disconnect(this._timeSourceChangedConnect);
        this.settings.disconnect(this._manualTimeSourceChangedConnect);
        this.settings.disconnect(this._nightlightFollowDisableConnect);
        this.settings.disconnect(this._alwaysEnableOndemandConnect);
        this.settings.disconnect(this._ondemandKeybindingChangedConnect);
        this.settings.disconnect(this._ondemandButtonPlacementChangedConnect);
        logDebug('Time settings signals disconnected.');
    }


    get timeSource() {
        return this.settings.get_string('time-source');
    }

    set timeSource(value) {
        if (value !== this.timeSource) {
            this.settings.set_string('time-source', value);
            logDebug(`The time source has been set to ${value}.`);
        }
    }

    get manualTimeSource() {
        return this.settings.get_boolean('manual-time-source');
    }

    set manualTimeSource(value) {
        if (value !== this.manualTimeSource)
            this.settings.set_boolean('manual-time-source', value);
    }

    get nightlightFollowDisable() {
        return this.settings.get_boolean('nightlight-follow-disable');
    }

    set nightlightFollowDisable(value) {
        if (value !== this.nightlightFollowDisable)
            this.settings.set_boolean('nightlight-follow-disable', value);
    }

    get alwaysEnableOndemand() {
        return this.settings.get_boolean('always-enable-ondemand');
    }

    set alwaysEnableOndemand(value) {
        if (value !== this.alwaysEnableOndemand)
            this.settings.set_boolean('always-enable-ondemand', value);
    }

    get ondemandTime() {
        return this.settings.get_string('ondemand-time');
    }

    set ondemandTime(value) {
        if (value !== this.ondemandTime) {
            this.settings.set_string('ondemand-time', value);
            logDebug(`The on-demand time has been set to ${value}.`);
        }
    }

    get ondemandKeybinding() {
        return this.settings.get_strv('nightthemeswitcher-ondemand-keybinding')[0];
    }

    set ondemandKeybinding(keybinding) {
        this.settings.set_strv('nightthemeswitcher-ondemand-keybinding', [keybinding]);
    }

    get ondemandButtonPlacement() {
        return this.settings.get_string('ondemand-button-placement');
    }

    set ondemandButtonPlacement(value) {
        if (value !== this.ondemandButtonPlacement)
            this.settings.set_boolean('ondemand-button-placement', value);
    }

    get scheduleSunrise() {
        return this.settings.get_double('schedule-sunrise');
    }

    set scheduleSunrise(value) {
        if (value !== this.scheduleSunrise)
            this.settings.set_double('schedule-sunrise', value);
    }

    get scheduleSunset() {
        return this.settings.get_double('schedule-sunset');
    }

    set scheduleSunset(value) {
        if (value !== this.scheduleSunset)
            this.settings.set_double('schedule-sunset', value);
    }


    _onTimeSourceChanged(_settings, _changedKey) {
        logDebug(`Time source has changed to ${this.timeSource}.`);
        this.emit('time-source-changed', this.timeSource);
    }

    _onManualTimeSourceChanged(_settings, _changedKey) {
        logDebug(`Manual time source has been ${this.manualTimeSource ? 'ena' : 'disa'}bled.`);
        this.emit('manual-time-source-changed', this.manualTimeSource);
    }

    _onNightlightFollowDisableChanged(_settings, _changedKey) {
        logDebug(`Follow Night Light "Disable until tomorrow" has been ${this.nightlightFollowDisable ? 'ena' : 'disa'}bled.`);
        this.emit('nightlight-follow-disable-changed', this.nightlightFollowDisable);
    }

    _onAlwaysEnableOndemandChanged(_settings, _changedKey) {
        logDebug(`Always enable on-demand timer has been ${this.alwaysEnableOndemand ? 'ena' : 'disa'}bled.`);
        this.emit('always-enable-ondemand-changed', this.alwaysEnableOndemand);
    }

    _onOndemandKeybindingChanged(_settings, _changedKey) {
        if (this.ondemandKeybinding)
            logDebug(`On-demand keybinding has changed to ${this.ondemandKeybinding}.`);
        else
            logDebug('On-demand keybinding has been cleared.');
        this.emit('ondemand-keybinding-changed', this.ondemandKeybinding);
    }

    _onOndemandButtonPlacementChanged(_settings, _changedKey) {
        logDebug(`On-demand button placement has changed to ${this.ondemandButtonPlacement}`);
        this.emit('ondemand-button-placement-changed', this.ondemandButtonPlacement);
    }
};
Signals.addSignalMethods(TimeSettings.prototype);
