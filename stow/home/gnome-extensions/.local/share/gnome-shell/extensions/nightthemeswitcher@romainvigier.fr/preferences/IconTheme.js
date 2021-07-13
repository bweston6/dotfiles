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

const utils = Me.imports.utils;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;


var IconThemePreferences = class {
    constructor(settings) {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'icon_theme.ui']));

        this.widget = this._builder.get_object('icon_theme');
        this.name = 'icon-theme';
        this.title = _('Icon theme');

        this._connectSettings(settings);
    }

    _connectSettings(settings) {
        const enabledSwitch = this._builder.get_object('enabled_switch');
        settings.iconVariants.settings.bind(
            'enabled',
            enabledSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const variants = this._builder.get_object('variants');
        settings.iconVariants.settings.bind(
            'enabled',
            variants,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const installedIconThemes = Array.from(utils.getInstalledIconThemes()).sort();
        const dayCombo = this._builder.get_object('day_combo');
        const nightCombo = this._builder.get_object('night_combo');
        installedIconThemes.forEach(theme => {
            dayCombo.append(theme, theme);
            nightCombo.append(theme, theme);
        });
        settings.iconVariants.settings.bind(
            'day',
            dayCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        settings.iconVariants.settings.bind(
            'night',
            nightCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
    }
};
