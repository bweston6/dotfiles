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


var GtkThemePreferences = class {
    constructor(settings) {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'gtk_theme.ui']));

        this.widget = this._builder.get_object('gtk_theme');
        this.name = 'gtk-theme';
        this.title = _('GTK theme');

        this._connectSettings(settings);
    }

    _connectSettings(settings) {
        const enabledSwitch = this._builder.get_object('enabled_switch');
        settings.gtkVariants.settings.bind(
            'enabled',
            enabledSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const manual = this._builder.get_object('manual');
        settings.gtkVariants.settings.bind(
            'enabled',
            manual,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const manualSwitch = this._builder.get_object('manual_switch');
        settings.gtkVariants.settings.bind(
            'manual',
            manualSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const variants = this._builder.get_object('variants');
        const updateVariantsSensitivity = () => {
            variants.sensitive = !!(settings.gtkVariants.enabled && settings.gtkVariants.manual);
        };
        settings.gtkVariants.connect('status-changed', () => updateVariantsSensitivity());
        settings.gtkVariants.connect('manual-changed', () => updateVariantsSensitivity());
        updateVariantsSensitivity();

        const dayCombo = this._builder.get_object('day_combo');
        const nightCombo = this._builder.get_object('night_combo');
        const installedGtkThemes = Array.from(utils.getInstalledGtkThemes()).sort();
        installedGtkThemes.forEach(theme => {
            dayCombo.append(theme, theme);
            nightCombo.append(theme, theme);
        });
        settings.gtkVariants.settings.bind(
            'day',
            dayCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        settings.gtkVariants.settings.bind(
            'night',
            nightCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
    }
};
