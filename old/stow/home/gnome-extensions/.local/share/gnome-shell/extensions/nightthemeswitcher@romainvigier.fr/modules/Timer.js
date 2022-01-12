// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const utils = Me.imports.utils;

const { Time } = Me.imports.enums.Time;
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
        this._timeSettings = extensionUtils.getSettings(utils.getSettingsSchema('time'));
        this._colorSettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.color' });
        this._locationSettings = new Gio.Settings({ schema: 'org.gnome.system.location' });
        this._sources = [];
        this._previousTime = Time.UNKNOWN;
        this._settingsConnections = [];
        this._timeConnections = [];
    }

    enable() {
        console.debug('Enabling Timer...');
        this._connectSettings();
        this._createSources();
        this._connectSources();
        this._enableSources();
        console.debug('Timer enabled.');
    }

    disable() {
        console.debug('Disabling Timer...');
        this._disconnectSources();
        this._disableSources();
        this._disconnectSettings();
        console.debug('Timer disabled.');
    }


    get time() {
        return this._previousTime;
    }


    _connectSettings() {
        console.debug('Connecting Timer to settings...');
        this._settingsConnections.push({
            settings: this._colorSettings,
            id: this._colorSettings.connect('changed::night-light-enabled', this._onSourceChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._locationSettings,
            id: this._locationSettings.connect('changed::enabled', this._onSourceChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._timeSettings,
            id: this._timeSettings.connect('changed::manual-time-source', this._onSourceChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._timeSettings,
            id: this._timeSettings.connect('changed::always-enable-ondemand', this._onSourceChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._timeSettings,
            id: this._timeSettings.connect('changed::time-source', this._onTimeSourceChanged.bind(this)),
        });
    }

    _disconnectSettings() {
        this._settingsConnections.forEach(connection => connection.settings.disconnect(connection.id));
        this._settingsConnections = [];
        console.debug('Disconnected Timer from settings.');
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

        if (this._timeSettings.get_boolean('always-enable-ondemand') && ['nightlight', 'location', 'schedule'].includes(source))
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
        console.debug('Connecting to time sources...');
        this._sources.forEach(source => this._timeConnections.push({
            source,
            id: source.connect('time-changed', this._onTimeChanged.bind(this)),
        }));
    }

    _disconnectSources() {
        this._timeConnections.forEach(connection => connection.source.disconnect(connection.id));
        this._timeConnections = [];
        console.debug('Disconnected from time sources.');
    }


    _onSourceChanged() {
        this.disable();
        this.enable();
    }

    _onTimeSourceChanged() {
        if (this._timeSettings.get_boolean('manual-time-source'))
            this._onSourceChanged();
    }

    _onTimeChanged(_source, newTime) {
        if (newTime !== this._previousTime) {
            console.debug(`Time has changed to ${newTime}.`);
            this._previousTime = newTime;
            this.emit('time-changed', newTime);
        }
    }


    _getSource() {
        console.debug('Getting time source...');

        let source;
        if (this._timeSettings.get_boolean('manual-time-source')) {
            source = this._timeSettings.get_string('time-source');
            console.debug(`Time source is forced to ${source}.`);
            if (
                (source === 'nightlight' && !this._colorSettings.get_boolean('night-light-enabled')) ||
                (source === 'location' && !this._locationSettings.get_boolean('enabled'))
            ) {
                console.debug(`Unable to choose ${source} time source, falling back to manual schedule.`);
                source = 'schedule';
                this._timeSettings.set_string('time-source', source);
            }
        } else {
            if (this._colorSettings.get_boolean('night-light-enabled'))
                source = 'nightlight';
            else if (this._locationSettings.get_boolean('enabled'))
                source = 'location';
            else
                source = 'schedule';
            console.debug(`Time source is ${source}.`);
            this._timeSettings.set_string('time-source', source);
        }
        return source;
    }
};
Signals.addSignalMethods(Timer.prototype);
