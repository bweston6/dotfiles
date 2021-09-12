// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio, GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const utils = Me.imports.utils;


var Commands = GObject.registerClass({
    GTypeName: 'Commands',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'Commands.ui'])}`,
    InternalChildren: ['enabled_switch', 'sunrise_entry', 'sunset_entry'],
    Properties: {
        settings: GObject.ParamSpec.object(
            'settings',
            'Settings',
            'Command GSettings',
            GObject.ParamFlags.READWRITE,
            Gio.Settings.$gtype
        ),
    },
}, class Commands extends Gtk.ScrolledWindow {
    _init(props = {}) {
        super._init(props);
        this.settings = extensionUtils.getSettings(utils.getSettingsSchema('commands'));

        this.settings.bind(
            'enabled',
            this._enabled_switch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        this.settings.bind(
            'sunrise',
            this._sunrise_entry,
            'text',
            Gio.SettingsBindFlags.DEFAULT
        );

        this.settings.bind(
            'sunset',
            this._sunset_entry,
            'text',
            Gio.SettingsBindFlags.DEFAULT
        );
    }
});
