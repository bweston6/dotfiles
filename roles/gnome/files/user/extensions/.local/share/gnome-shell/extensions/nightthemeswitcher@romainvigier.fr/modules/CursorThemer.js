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
 * The Cursor Themer is responsible for changing the cursor theme according to
 * the time.
 */
var CursorThemer = class {
    constructor() {
        this._cursorVariantsSettings = extensionUtils.getSettings(utils.getSettingsSchema('cursor-variants'));
        this._interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        this._settingsConnections = [];
        this._statusConnection = null;
        this._timerConnection = null;
    }

    enable() {
        console.debug('Enabling Cursor Themer...');
        this._watchStatus();
        if (this._cursorVariantsSettings.get_boolean('enabled')) {
            this._connectSettings();
            this._connectTimer();
            this._updateSystemCursorTheme();
        }
        console.debug('Cursor Themer enabled.');
    }

    disable() {
        console.debug('Disabling Cursor Themer...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        console.debug('Cursor Themer disabled.');
    }


    _watchStatus() {
        console.debug('Watching cursor variants status...');
        this._statusConnection = this._cursorVariantsSettings.connect('changed::enabled', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusConnection) {
            this._cursorVariantsSettings.disconnect(this._statusConnection);
            this._statusConnection = null;
        }
        console.debug('Stopped watching cursor variants status.');
    }

    _connectSettings() {
        console.debug('Connecting Cursor Themer to settings...');
        this._settingsConnections.push({
            settings: this._cursorVariantsSettings,
            id: this._cursorVariantsSettings.connect('changed::day', this._onDayVariantChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._cursorVariantsSettings,
            id: this._cursorVariantsSettings.connect('changed::night', this._onNightVariantChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._interfaceSettings,
            id: this._interfaceSettings.connect('changed::cursor-theme', this._onSystemCursorThemeChanged.bind(this)),
        });
    }

    _disconnectSettings() {
        this._settingsConnections.forEach(connection => connection.settings.disconnect(connection.id));
        this._settingsConnections = [];
        console.debug('Disconnected Cursor Themer from settings.');
    }

    _connectTimer() {
        console.debug('Connecting Cursor Themer to Timer...');
        this._timerConnection = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timerConnection) {
            e.timer.disconnect(this._timerConnection);
            this._timerConnection = null;
        }
        console.debug('Disconnected Cursor Themer from Timer.');
    }


    _onStatusChanged() {
        console.debug(`Cursor variants switching has been ${this._cursorVariantsSettings.get_boolean('enabled') ? 'enabled' : 'disabled'}.`);
        this.disable();
        this.enable();
    }

    _onDayVariantChanged() {
        console.debug(`Day cursor variant changed to '${this._cursorVariantsSettings.get_string('day')}'.`);
        this._updateSystemCursorTheme();
    }

    _onNightVariantChanged() {
        console.debug(`Night cursor variant changed to '${this._cursorVariantsSettings.get_string('night')}'.`);
        this._updateSystemCursorTheme();
    }

    _onSystemCursorThemeChanged() {
        console.debug(`System cursor theme changed to '${this._interfaceSettings.get_string('cursor-theme')}'.`);
        this._updateCurrentVariant();
    }

    _onTimeChanged() {
        this._updateSystemCursorTheme();
    }


    _updateCurrentVariant() {
        if (e.timer.time === Time.UNKNOWN)
            return;
        this._cursorVariantsSettings.set_string(e.timer.time, this._interfaceSettings.get_string('cursor-theme'));
    }

    _updateSystemCursorTheme() {
        if (e.timer.time === Time.UNKNOWN || !this._cursorVariantsSettings.get_string(e.timer.time))
            return;
        this._interfaceSettings.set_string('cursor-theme', this._cursorVariantsSettings.get_string(e.timer.time));
    }
};
