// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const utils = Me.imports.utils;

const { Time } = Me.imports.enums.Time;

/**
 * The Backgrounder is responsible for changing the desktop background
 * according to the time.
 *
 * When the user changes its desktop background (for example via the system
 * settings), it will use it as the current time background.
 */
var Backgrounder = class {
    constructor() {
        this._backgroundsSettings = extensionUtils.getSettings(utils.getSettingsSchema('backgrounds'));
        this._systemBackgroundSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
        this._settingsConnections = [];
        this._statusConnection = null;
        this._timerConnection = null;
    }

    enable() {
        console.debug('Enabling Backgrounder...');
        this._watchStatus();
        if (this._backgroundsSettings.get_boolean('enabled')) {
            this._connectSettings();
            this._connectTimer();
            this._updateSystemBackground(e.timer.time);
        }
        console.debug('Backgrounder enabled.');
    }

    disable() {
        console.debug('Disabling Backgrounder...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        console.debug('Backgrounder disabled.');
    }


    _watchStatus() {
        console.debug('Watching backgrounds status...');
        this._statusConnection = this._backgroundsSettings.connect('changed::enabled', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusConnection) {
            this._backgroundsSettings.disconnect(this._statusConnection);
            this._statusConnection = null;
        }
        console.debug('Stopped watching backgrounds status.');
    }

    _connectSettings() {
        console.debug('Connecting Backgrounder to settings...');
        this._settingsConnections.push({
            settings: this._backgroundsSettings,
            id: this._backgroundsSettings.connect('changed::day', this._onDayBackgroundChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._backgroundsSettings,
            id: this._backgroundsSettings.connect('changed::night', this._onNightBackgroundChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._systemBackgroundSettings,
            id: this._systemBackgroundSettings.connect('changed::picture-uri', this._onSystemBackgroundChanged.bind(this)),
        });
    }

    _disconnectSettings() {
        this._settingsConnections.forEach(connection => connection.settings.disconnect(connection.id));
        this._settingsConnections = [];
        console.debug('Disconnected Backgrounder from settings.');
    }

    _connectTimer() {
        console.debug('Connecting Backgrounder to Timer...');
        this._timerConnection = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timerConnection) {
            e.timer.disconnect(this._timerConnection);
            this._timerConnection = null;
        }
        console.debug('Disconnected Backgrounder from Timer.');
    }


    _onStatusChanged() {
        console.debug(`Backgrounds switching has been ${this._backgroundsSettings.get_boolean('enabled') ? 'enabled' : 'disabled'}.`);
        this.disable();
        this.enable();
    }

    _onDayBackgroundChanged() {
        console.debug(`Day background changed to '${this._backgroundsSettings.get_string('day')}'.`);
        this._updateSystemBackground();
    }

    _onNightBackgroundChanged() {
        console.debug(`Night background changed to '${this._backgroundsSettings.get_string('night')}'.`);
        this._updateSystemBackground();
    }

    _onSystemBackgroundChanged() {
        console.debug(`System background changed to '${this._systemBackgroundSettings.get_string('picture-uri')}'.`);
        this._updateCurrentBackground();
    }

    _onTimeChanged() {
        this._updateSystemBackground();
    }


    _updateCurrentBackground() {
        if (e.timer.time === Time.UNKNOWN)
            return;
        this._backgroundsSettings.set_string(e.timer.time, this._systemBackgroundSettings.get_string('picture-uri'));
    }

    _updateSystemBackground() {
        if (e.timer.time === Time.UNKNOWN || !this._backgroundsSettings.get_string(e.timer.time))
            return;
        this._systemBackgroundSettings.set_string('picture-uri', this._backgroundsSettings.get_string(e.timer.time));
    }
};
