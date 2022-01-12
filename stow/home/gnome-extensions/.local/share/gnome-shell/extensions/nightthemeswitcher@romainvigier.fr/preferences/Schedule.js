// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio, GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();
const _ = extensionUtils.gettext;

const utils = Me.imports.utils;

const { DropDownChoice } = Me.imports.preferences.DropDownChoice;


var Schedule = GObject.registerClass({
    GTypeName: 'Schedule',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'Schedule.ui'])}`,
    InternalChildren: [
        'manual_time_source_switch',
        'time_source_dropdown',
        'always_show_ondemand_switch',
        'nightlight_preferences_revealer',
        'nightlight_follow_disable_switch',
        'schedule_preferences_revealer',
        'schedule_sunrise_time_chooser',
        'schedule_sunset_time_chooser',
        'ondemand_preferences_revealer',
        'ondemand_shortcut_button',
        'ondemand_button_location_combo',
    ],
    Properties: {
        settings: GObject.ParamSpec.object(
            'settings',
            'Settings',
            'Time GSettings',
            GObject.ParamFlags.READWRITE,
            Gio.Settings.$gtype
        ),
    },
}, class Schedule extends Gtk.ScrolledWindow {
    _init(props = {}) {
        super._init(props);
        this.settings = extensionUtils.getSettings(utils.getSettingsSchema('time'));

        this.settings.bind(
            'manual-time-source',
            this._manual_time_source_switch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const choiceFilter = new Gtk.BoolFilter({ expression: Gtk.PropertyExpression.new(DropDownChoice, null, 'enabled') });

        const colorSettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.color' });
        const nightlightChoice = new DropDownChoice({ id: 'nightlight', title: _('Night Light') });
        nightlightChoice.connect('notify::enabled', () => choiceFilter.changed(Gtk.FilterChange.DIFFERENT));
        colorSettings.bind(
            'night-light-enabled',
            nightlightChoice,
            'enabled',
            Gio.SettingsBindFlags.GET
        );

        const locationSettings = new Gio.Settings({ schema: 'org.gnome.system.location' });
        const locationChoice = new DropDownChoice({ id: 'location', title: _('Location Services') });
        locationChoice.connect('notify::enabled', () => choiceFilter.changed(Gtk.FilterChange.DIFFERENT));
        locationSettings.bind(
            'enabled',
            locationChoice,
            'enabled',
            Gio.SettingsBindFlags.GET
        );

        const timeSources = Gio.ListStore.new(DropDownChoice);
        timeSources.splice(0, 0, [
            nightlightChoice,
            locationChoice,
            new DropDownChoice({ id: 'schedule', title: _('Manual schedule') }),
            new DropDownChoice({ id: 'ondemand', title: _('On-demand') }),
        ]);

        this._time_source_dropdown.model = new Gtk.FilterListModel({
            model: timeSources,
            filter: choiceFilter,
        });
        this._time_source_dropdown.expression = Gtk.PropertyExpression.new(DropDownChoice, null, 'title');
        this._time_source_dropdown.connect('notify::selected-item', () => this.settings.set_string('time-source', this._time_source_dropdown.selected_item.id));
        const updateTimeSourceDropDownSelected = () => {
            this._time_source_dropdown.selected = utils.findItemPositionInModel(this._time_source_dropdown.model, item => item.id === this.settings.get_string('time-source'));
        };
        this.settings.connect('changed::time-source', () => updateTimeSourceDropDownSelected());
        updateTimeSourceDropDownSelected();

        this.settings.bind(
            'always-enable-ondemand',
            this._always_show_ondemand_switch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        this.settings.bind(
            'nightlight-follow-disable',
            this._nightlight_follow_disable_switch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        this.settings.bind(
            'schedule-sunrise',
            this._schedule_sunrise_time_chooser,
            'time',
            Gio.SettingsBindFlags.DEFAULT
        );

        this.settings.bind(
            'schedule-sunset',
            this._schedule_sunset_time_chooser,
            'time',
            Gio.SettingsBindFlags.DEFAULT
        );

        this.settings.connect('changed::nightthemeswitcher-ondemand-keybinding', () => {
            this._ondemand_shortcut_button.keybinding = this.settings.get_strv('nightthemeswitcher-ondemand-keybinding')[0];
        });
        this._ondemand_shortcut_button.connect('notify::keybinding', () => {
            this.settings.set_strv('nightthemeswitcher-ondemand-keybinding', [this._ondemand_shortcut_button.keybinding]);
        });
        this._ondemand_shortcut_button.keybinding = this.settings.get_strv('nightthemeswitcher-ondemand-keybinding')[0];

        this.settings.bind(
            'ondemand-button-placement',
            this._ondemand_button_location_combo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );

        const updatePreferencesVisibility = () => {
            const timeSource = this.settings.get_string('time-source');
            this._nightlight_preferences_revealer.reveal_child = timeSource === 'nightlight';
            this._schedule_preferences_revealer.reveal_child = timeSource === 'schedule';
            this._ondemand_preferences_revealer.reveal_child = timeSource === 'ondemand' || this.settings.get_boolean('always-enable-ondemand');
        };
        this.settings.connect('changed::time-source', () => updatePreferencesVisibility());
        this.settings.connect('changed::always-enable-ondemand', () => updatePreferencesVisibility());
        updatePreferencesVisibility();
    }
});
