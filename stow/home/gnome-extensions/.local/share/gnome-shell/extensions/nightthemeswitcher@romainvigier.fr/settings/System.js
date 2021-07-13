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

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const { logDebug, getUserthemesExtension, getUserthemesSettings } = Me.imports.utils;


/**
 * The Settings Manager centralizes all the different settings the extension
 * needs. It handles getting and settings values as well as signaling any
 * changes.
 */
var SystemSettings = class {
    constructor() {
        logDebug('Initializing system settings...');
        this.colorSettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.color' });
        this.locationSettings = new Gio.Settings({ schema: 'org.gnome.system.location' });
        this.interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        this.backgroundSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
        this.userthemesSettings = getUserthemesSettings();
        logDebug('System settings initialized.');
    }

    enable() {
        logDebug('Connecting system settings signals...');
        this._nightlightStatusConnect = this.colorSettings.connect('changed::night-light-enabled', this._onNightlightStatusChanged.bind(this));
        this._locationStatusConnect = this.locationSettings.connect('changed::enabled', this._onLocationStatusChanged.bind(this));
        this._gtkThemeChangedConnect = this.interfaceSettings.connect('changed::gtk-theme', this._onGtkThemeChanged.bind(this));
        this._iconThemeChangedConnect = this.interfaceSettings.connect('changed::icon-theme', this._onIconThemeChanged.bind(this));
        this._cursorThemeChangedConnect = this.interfaceSettings.connect('changed::cursor-theme', this._onCursorThemeChanged.bind(this));
        this._backgroundChangedConnect = this.backgroundSettings.connect('changed::picture-uri', this._onBackgroundChanged.bind(this));
        if (this.userthemesSettings)
            this._shell_theme_changed_connect = this.userthemesSettings.connect('changed::name', this._onShellThemeChanged.bind(this));
        logDebug('System settings signals connected.');
    }

    disable() {
        logDebug('Disconnecting system settings signals...');
        this.colorSettings.disconnect(this._nightlightStatusConnect);
        this.locationSettings.disconnect(this._locationStatusConnect);
        this.interfaceSettings.disconnect(this._gtkThemeChangedConnect);
        this.interfaceSettings.disconnect(this._iconThemeChangedConnect);
        this.interfaceSettings.disconnect(this._cursorThemeChangedConnect);
        this.backgroundSettings.disconnect(this._backgroundChangedConnect);
        if (this.userthemesSettings)
            this.userthemesSettings.disconnect(this._shell_theme_changed_connect);
        logDebug('System settings signals disconnected.');
    }


    get nightlightEnabled() {
        return this.colorSettings.get_boolean('night-light-enabled');
    }

    get locationEnabled() {
        return this.locationSettings.get_boolean('enabled');
    }

    get gtkTheme() {
        return this.interfaceSettings.get_string('gtk-theme');
    }

    set gtkTheme(value) {
        if (value !== this.gtkTheme) {
            this.interfaceSettings.set_string('gtk-theme', value);
            logDebug(`GTK theme has been set to '${value}'.`);
        }
    }

    get shellTheme() {
        if (this.userthemesSettings)
            return this.userthemesSettings.get_string('name');
        else
            return '';
    }

    set shellTheme(value) {
        if (this.userthemesSettings && value !== this.shellTheme)
            this.userthemesSettings.set_string('name', value);
    }

    get useUserthemes() {
        const extension = getUserthemesExtension();
        return extension && extension.state === 1;
    }

    get iconTheme() {
        return this.interfaceSettings.get_string('icon-theme');
    }

    set iconTheme(value) {
        if (value !== this.iconTheme) {
            this.interfaceSettings.set_string('icon-theme', value);
            logDebug(`Icon theme has been set to '${value}'.`);
        }
    }

    get cursorTheme() {
        return this.interfaceSettings.get_string('cursor-theme');
    }

    set cursorTheme(value) {
        if (value !== this.cursorTheme) {
            this.interfaceSettings.set_string('cursor-theme', value);
            logDebug(`Cursor theme has been set to '${value}'.`);
        }
    }

    get background() {
        return this.backgroundSettings.get_string('picture-uri');
    }

    set background(value) {
        if (value !== this.background)
            this.backgroundSettings.set_string('picture-uri', value);
    }


    _onNightlightStatusChanged(_settings, _changedKey) {
        logDebug(`Night Light has been ${this.nightlightEnabled ? 'ena' : 'disa'}bled.`);
        this.emit('nightlight-status-changed', this.nightlightEnabled);
    }

    _onLocationStatusChanged(_settings, _changedKey) {
        logDebug(`Location has been ${this.locationEnabled ? 'ena' : 'disa'}bled.`);
        this.emit('location-status-changed', this.locationEnabled);
    }

    _onGtkThemeChanged(_settings, _changedKey) {
        logDebug(`GTK theme has changed to '${this.gtkTheme}'.`);
        this.emit('gtk-theme-changed', this.gtkTheme);
    }

    _onShellThemeChanged(_settings, _changedKey) {
        logDebug(`Shell theme has changed to '${this.shellTheme}'.`);
        this.emit('shell-theme-changed', this.shellTheme);
    }

    _onIconThemeChanged(_settings, _changedKey) {
        logDebug(`Cursor theme has changed to '${this.iconTheme}'.`);
        this.emit('icon-theme-changed', this.iconTheme);
    }

    _onCursorThemeChanged(_settings, _changedKey) {
        logDebug(`Cursor theme has changed to '${this.cursorTheme}'.`);
        this.emit('cursor-theme-changed', this.cursorTheme);
    }

    _onBackgroundChanged(_settings, _changedKey) {
        logDebug(`Background has changed to '${this.background}'.`);
        this.emit('background-changed', this.background);
    }
};
Signals.addSignalMethods(SystemSettings.prototype);
