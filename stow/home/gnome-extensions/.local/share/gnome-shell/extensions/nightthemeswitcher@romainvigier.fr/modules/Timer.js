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

const e = Me.imports.extension;
const { logDebug } = Me.imports.utils;
const { TimerNightlight } = Me.imports.modules.TimerNightlight;
const { TimerLocation } = Me.imports.modules.TimerLocation;
const { TimerSchedule } = Me.imports.modules.TimerSchedule;
const { TimerOndemand } = Me.imports.modules.TimerOndemand;


/**
 * The Timer is responsible for signaling any time change to the other modules.
 *
 * They can connect to its 'time-changed' signal and ask its 'time' property
 * for the current time.
 *
 * It will try to use one of these three different time sources, in this order
 * of preference:
 *   - Night Light
 *   - Location Services
 *   - Manual schedule
 *
 * The user can manually force a specific time source and set the manual
 * schedule in the extensions's preferences.
 */
var Timer = class {
    constructor() {
        this._sources = [];
        this._previousTime = null;
        this._nightlightStatusChangedConnect = null;
        this._locationStatusChangedConnect = null;
        this._manualTimeSourceChangedConnect = null;
        this._timeSourceChangedConnect = null;
        this._timeChangedConnects = [];
    }

    enable() {
        logDebug('Enabling Timer...');
        this._connectSettings();
        this._createSources();
        this._connectSources();
        this._enableSources();
        logDebug('Timer enabled.');
    }

    disable() {
        logDebug('Disabling Timer...');
        this._disconnectSources();
        this._disableSources();
        this._disconnectSettings();
        logDebug('Timer disabled.');
    }


    get time() {
        return this._previousTime;
    }


    _connectSettings() {
        logDebug('Connecting Timer to settings...');
        this._nightlightStatusChangedConnect = e.settings.system.connect('nightlight-status-changed', this._onSourceChanged.bind(this));
        this._locationStatusChangedConnect = e.settings.system.connect('location-status-changed', this._onSourceChanged.bind(this));
        this._manualTimeSourceChangedConnect = e.settings.time.connect('manual-time-source-changed', this._onSourceChanged.bind(this));
        this._alwaysEnableOndemandChangedConnect = e.settings.time.connect('always-enable-ondemand-changed', this._onSourceChanged.bind(this));
        this._timeSourceChangedConnect = e.settings.time.connect('time-source-changed', this._onTimeSourceChanged.bind(this));
    }

    _disconnectSettings() {
        if (this._nightlightStatusChangedConnect) {
            e.settings.system.disconnect(this._nightlightStatusChangedConnect);
            this._nightlightStatusChangedConnect = null;
        }
        if (this._locationStatusChangedConnect) {
            e.settings.system.disconnect(this._locationStatusChangedConnect);
            this._locationStatusChangedConnect = null;
        }
        if (this._manualTimeSourceChangedConnect) {
            e.settings.time.disconnect(this._manualTimeSourceChangedConnect);
            this._manualTimeSourceChangedConnect = null;
        }
        if (this._timeSourceChangedConnect) {
            e.settings.time.disconnect(this._timeSourceChangedConnect);
            this._timeSourceChangedConnect = null;
        }
        logDebug('Disconnected Timer from settings.');
    }

    _createSources() {
        const source = this._getSource();
        switch (source) {
        case 'nightlight':
            this._sources.push(new TimerNightlight());
            break;
        case 'location':
            this._sources.push(new TimerLocation());
            break;
        case 'schedule':
            this._sources.push(new TimerSchedule());
            break;
        case 'ondemand':
            this._sources.push(new TimerOndemand());
            break;
        }

        if (e.settings.time.alwaysEnableOndemand && ['nightlight', 'location', 'schedule'].includes(source))
            this._sources.unshift(new TimerOndemand());
    }

    _enableSources() {
        this._sources.forEach(source => source.enable());
    }

    _disableSources() {
        this._sources.forEach(source => source.disable());
        this._sources = [];
    }

    _connectSources() {
        logDebug('Connecting to time sources...');
        this._sources.forEach(source => this._timeChangedConnects.push({
            source,
            connect: source.connect('time-changed', this._onTimeChanged.bind(this)),
        }));
    }

    _disconnectSources() {
        this._timeChangedConnects.forEach(timeChangedConnect => timeChangedConnect.source.disconnect(timeChangedConnect.connect));
        this._timeChangedConnects = [];
        logDebug('Disconnected from time sources.');
    }


    _onSourceChanged() {
        this.disable();
        this.enable();
    }

    _onTimeSourceChanged(_settings, _newSource) {
        if (e.settings.time.manualTimeSource)
            this._onSourceChanged();
    }

    _onTimeChanged(_source, newTime) {
        if (newTime !== this._previousTime) {
            logDebug(`Time has changed to ${newTime}.`);
            this._previousTime = newTime;
            this.emit('time-changed', newTime);
        }
    }


    _getSource() {
        logDebug('Getting time source...');

        let source;
        if (e.settings.time.manualTimeSource) {
            source = e.settings.time.timeSource;
            logDebug(`Time source is forced to ${source}.`);
            if (
                (source === 'nightlight' && !e.settings.system.nightlightEnabled) ||
                (source === 'location' && !e.settings.system.locationEnabled)
            ) {
                logDebug(`Unable to choose ${source} time source, falling back to manual schedule.`);
                source = 'schedule';
                e.settings.time.timeSource = source;
            }
        } else {
            if (e.settings.system.nightlightEnabled)
                source = 'nightlight';
            else if (e.settings.system.locationEnabled)
                source = 'location';
            else
                source = 'schedule';
            logDebug(`Time source is ${source}.`);
            e.settings.time.timeSource = source;
        }
        return source;
    }
};
Signals.addSignalMethods(Timer.prototype);
