// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const utils = Me.imports.utils;

const { Time } = Me.imports.enums.Time;


/**
 * The Icon Themer is responsible for changing the icon theme according to the
 * time.
 */
var IconThemer = class {
    constructor() {
        this._iconVariantsSettings = extensionUtils.getSettings(utils.getSettingsSchema('icon-variants'));
        this._interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        this._settingsConnections = [];
        this._statusConnection = null;
        this._timerConnection = null;
    }

    enable() {
        console.debug('Enabling Icon Themer...');
        this._watchStatus();
        if (this._iconVariantsSettings.get_boolean('enabled')) {
            this._connectSettings();
            this._connectTimer();
            this._updateSystemIconTheme();
        }
        console.debug('Icon Themer enabled.');
    }

    disable() {
        console.debug('Disabling Icon Themer...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        console.debug('Icon Themer disabled.');
    }


    _watchStatus() {
        console.debug('Watching icon variants status...');
        this._statusConnection = this._iconVariantsSettings.connect('changed::enabled', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusConnection) {
            this._iconVariantsSettings.disconnect(this._statusConnection);
            this._statusConnection = null;
        }
        console.debug('Stopped watching icon variants status.');
    }

    _connectSettings() {
        console.debug('Connecting Icon Themer to settings...');
        this._settingsConnections.push({
            settings: this._iconVariantsSettings,
            id: this._iconVariantsSettings.connect('changed::day', this._onDayVariantChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._iconVariantsSettings,
            id: this._iconVariantsSettings.connect('changed::night', this._onNightVariantChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._interfaceSettings,
            id: this._interfaceSettings.connect('changed::icon-theme', this._onSystemIconThemeChanged.bind(this)),
        });
    }

    _disconnectSettings() {
        this._settingsConnections.forEach(connection => connection.settings.disconnect(connection.id));
        this._settingsConnections = [];
        console.debug('Disconnected Icon Themer from settings.');
    }

    _connectTimer() {
        console.debug('Connecting Icon Themer to Timer...');
        this._timerConnection = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timerConnection) {
            e.timer.disconnect(this._timerConnection);
            this._timerConnection = null;
        }
        console.debug('Disconnected Icon Themer from Timer.');
    }


    _onStatusChanged() {
        console.debug(`Icon variants switching has been ${this._iconVariantsSettings.get_boolean('enabled') ? 'enabled' : 'disabled'}.`);
        this.disable();
        this.enable();
    }

    _onDayVariantChanged() {
        console.debug(`Day icon variant changed to '${this._iconVariantsSettings.get_string('day')}'.`);
        this._updateSystemIconTheme();
    }

    _onNightVariantChanged() {
        console.debug(`Night icon variant changed to '${this._iconVariantsSettings.get_string('night')}'.`);
        this._updateSystemIconTheme();
    }

    _onSystemIconThemeChanged() {
        console.debug(`System icon theme changed to '${this._iconVariantsSettings.get_string('icon-theme')}'.`);
        this._updateCurrentVariant();
    }

    _onTimeChanged() {
        this._updateSystemIconTheme();
    }


    _updateCurrentVariant() {
        if (e.timer.time === Time.UNKNOWN)
            return;
        this._iconVariantsSettings.set_string(e.timer.time, this._interfaceSettings.get_string('icon-theme'));
    }

    _updateSystemIconTheme() {
        if (e.timer.time === Time.UNKNOWN || !this._iconVariantsSettings.get_string(e.timer.time))
            return;
        this._interfaceSettings.set_string('icon-theme', this._iconVariantsSettings.get_string(e.timer.time));
    }
};
