// SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio, GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const utils = Me.imports.utils;

const { DropDownChoice } = Me.imports.preferences.DropDownChoice;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;


var ShellPreferences = GObject.registerClass({
    GTypeName: 'ShellPreferences',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'ShellPreferences.ui'])}`,
    InternalChildren: [
        'enabled_switch',
        'manual_switch',
        'day_dropdown',
        'night_dropdown',
    ],
    Properties: {
        settings: GObject.ParamSpec.object(
            'settings',
            'Settings',
            'Shell GSettings',
            GObject.ParamFlags.READWRITE,
            Gio.Settings.$gtype
        ),
    },
}, class ShellPreferences extends Gtk.Box {
    _init(props = {}) {
        super._init(props);
        this.settings = extensionUtils.getSettings(utils.getSettingsSchema('shell-variants'));

        this.settings.bind(
            'enabled',
            this._enabled_switch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        this.settings.bind(
            'manual',
            this._manual_switch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const themeChoices = Gio.ListStore.new(DropDownChoice);
        themeChoices.splice(0, 0, Array.from(utils.getInstalledShellThemes()).sort().map(theme => new DropDownChoice({ id: theme, title: theme || _('Default') })));

        this._day_dropdown.model = themeChoices;
        this._day_dropdown.expression = Gtk.PropertyExpression.new(DropDownChoice, null, 'title');
        this._day_dropdown.connect('notify::selected-item', () => this.settings.set_string('day', this._day_dropdown.selected_item.id));
        const updateDayDropDownSelected = () => {
            this._day_dropdown.selected = utils.findItemPositionInModel(this._day_dropdown.model, item => item.id === this.settings.get_string('day'));
        };
        this.settings.connect('changed::day', () => updateDayDropDownSelected());
        updateDayDropDownSelected();

        this._night_dropdown.model = themeChoices;
        this._night_dropdown.expression = Gtk.PropertyExpression.new(DropDownChoice, null, 'title');
        this._night_dropdown.connect('notify::selected-item', () => this.settings.set_string('night', this._night_dropdown.selected_item.id));
        const updateNightDropDownSelected = () => {
            this._night_dropdown.selected = utils.findItemPositionInModel(this._night_dropdown.model, item => item.id === this.settings.get_string('night'));
        };
        this.settings.connect('changed::night', () => updateNightDropDownSelected());
        updateNightDropDownSelected();
    }
});
