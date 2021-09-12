// SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio, GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const utils = Me.imports.utils;


var BackgroundsPreferences = GObject.registerClass({
    GTypeName: 'BackgroundsPreferences',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'BackgroundsPreferences.ui'])}`,
    InternalChildren: [
        'enabled_switch',
        'day_button',
        'night_button',
    ],
    Properties: {
        settings: GObject.ParamSpec.object(
            'settings',
            'Settings',
            'Backgrounds GSettings',
            GObject.ParamFlags.READWRITE,
            Gio.Settings.$gtype
        ),
    },
}, class BackgroundsPreferences extends Gtk.Box {
    _init(props = {}) {
        super._init(props);
        this.settings = extensionUtils.getSettings(utils.getSettingsSchema('backgrounds'));

        this.settings.bind(
            'enabled',
            this._enabled_switch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        this.settings.bind(
            'day',
            this._day_button,
            'path',
            Gio.SettingsBindFlags.DEFAULT
        );

        this.settings.bind(
            'night',
            this._night_button,
            'path',
            Gio.SettingsBindFlags.DEFAULT
        );
    }
});
