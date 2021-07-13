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

const { Gio, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;


var CommandsPreferences = class {
    constructor(settings) {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'commands.ui']));

        this.widget = this._builder.get_object('commands');
        this.name = 'commands';
        this.title = _('Commands');

        this._connectSettings(settings);
    }

    _connectSettings(settings) {
        const enabledSwitch = this._builder.get_object('enabled_switch');
        settings.commands.settings.bind(
            'enabled',
            enabledSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const entries = this._builder.get_object('entries');
        settings.commands.settings.bind(
            'enabled',
            entries,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const sunriseEntry = this._builder.get_object('sunrise_entry');
        settings.commands.settings.bind(
            'sunrise',
            sunriseEntry,
            'text',
            Gio.SettingsBindFlags.DEFAULT
        );

        const sunriseClearButton = this._builder.get_object('sunrise_clear_button');
        sunriseClearButton.connect('clicked', () => {
            settings.commands.sunrise = '';
        });
        const updateSunriseClearButtonSensitivity = () => {
            sunriseClearButton.sensitive = !!settings.commands.sunrise;
        };
        settings.commands.connect('sunrise-changed', () => updateSunriseClearButtonSensitivity());
        updateSunriseClearButtonSensitivity();

        const sunsetEntry = this._builder.get_object('sunset_entry');
        settings.commands.settings.bind(
            'sunset',
            sunsetEntry,
            'text',
            Gio.SettingsBindFlags.DEFAULT
        );

        const sunsetClearButton = this._builder.get_object('sunset_clear_button');
        sunsetClearButton.connect('clicked', () => {
            settings.commands.sunset = '';
        });
        const updateSunsetClearButtonSensitivity = () => {
            sunsetClearButton.sensitive = !!settings.commands.sunset;
        };
        settings.commands.connect('sunset-changed', () => updateSunsetClearButtonSensitivity());
        updateSunsetClearButtonSensitivity();
    }
};
