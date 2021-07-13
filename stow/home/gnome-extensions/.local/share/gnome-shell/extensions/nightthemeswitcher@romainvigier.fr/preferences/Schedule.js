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

const { OndemandKeyboardShortcutDialog } = Me.imports.preferences.OndemandKeyboardShortcutDialog;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;


var SchedulePreferences = class {
    constructor(settings) {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'schedule.ui']));

        this.widget = this._builder.get_object('schedule');
        this.name = 'schedule';
        this.title = _('Schedule');

        this._connectSettings(settings);
    }

    _connectSettings(settings) {
        const autoSwitch = this._builder.get_object('auto_switch');
        settings.time.settings.bind(
            'manual-time-source',
            autoSwitch,
            'active',
            Gio.SettingsBindFlags.INVERT_BOOLEAN
        );

        const alwaysEnableOndemandSwitch = this._builder.get_object('always_enable_ondemand_switch');
        settings.time.settings.bind(
            'always-enable-ondemand',
            alwaysEnableOndemandSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const manual = this._builder.get_object('manual');
        settings.time.settings.bind(
            'manual-time-source',
            manual,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const manualNightlightRadio = this._builder.get_object('manual_nightlight_radio');
        const updateManualNightlightRadioActivity = () => {
            manualNightlightRadio.active = settings.time.timeSource === 'nightlight';
        };
        settings.time.connect('time-source-changed', () => updateManualNightlightRadioActivity());
        settings.system.colorSettings.bind(
            'night-light-enabled',
            manualNightlightRadio,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        manualNightlightRadio.connect('toggled', () => {
            if (manualNightlightRadio.active)
                settings.time.timeSource = 'nightlight';
        });
        updateManualNightlightRadioActivity();

        const manualLocationRadio = this._builder.get_object('manual_location_radio');
        const updateManualLocationRadioActivity = () => {
            manualLocationRadio.active = settings.time.timeSource === 'location';
        };
        settings.time.connect('time-source-changed', () => updateManualLocationRadioActivity());
        settings.system.locationSettings.bind(
            'enabled',
            manualLocationRadio,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        manualLocationRadio.connect('toggled', () => {
            if (manualLocationRadio.active)
                settings.time.timeSource = 'location';
        });
        updateManualLocationRadioActivity();

        const manualScheduleRadio = this._builder.get_object('manual_schedule_radio');
        const updateManualScheduleRadioActivity = () => {
            manualScheduleRadio.active = settings.time.timeSource === 'schedule';
        };
        settings.time.connect('time-source-changed', () => updateManualScheduleRadioActivity());
        manualScheduleRadio.connect('toggled', () => {
            if (manualScheduleRadio.active)
                settings.time.timeSource = 'schedule';
        });
        updateManualScheduleRadioActivity();

        const manualOndemandRadio = this._builder.get_object('manual_ondemand_radio');
        const updateManualOndemandRadioActivity = () => {
            manualOndemandRadio.active = settings.time.timeSource === 'ondemand';
        };
        settings.time.connect('time-source-changed', () => updateManualOndemandRadioActivity());
        manualOndemandRadio.connect('toggled', () => {
            if (manualOndemandRadio.active)
                settings.time.timeSource = 'ondemand';
        });
        updateManualOndemandRadioActivity();

        const manualPrefsStack = this._builder.get_object('manual_prefs_stack');
        const updateManualPrefsStackVisible = () => {
            switch (settings.time.timeSource) {
            case 'nightlight':
                manualPrefsStack.set_visible_child_name('nightlight');
                break;
            case 'schedule':
                manualPrefsStack.set_visible_child_name('schedule_times');
                break;
            default:
                manualPrefsStack.set_visible_child_name('none');
            }
        };
        settings.time.connect('time-source-changed', () => updateManualPrefsStackVisible());
        updateManualPrefsStackVisible();

        const nightlightFollowDisableSwitch = this._builder.get_object('nightlight_follow_disable_switch');
        settings.time.settings.bind(
            'nightlight-follow-disable',
            nightlightFollowDisableSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const scheduleTimesSunriseHoursSpin = this._builder.get_object('schedule_times_sunrise_hours_spin');
        scheduleTimesSunriseHoursSpin.value = Math.trunc(settings.time.scheduleSunrise);
        scheduleTimesSunriseHoursSpin.connect('output', () => {
            const text = scheduleTimesSunriseHoursSpin.adjustment.value.toString().padStart(2, '0');
            scheduleTimesSunriseHoursSpin.set_text(text);
            return true;
        });
        scheduleTimesSunriseHoursSpin.connect('value-changed', () => {
            const oldTime = settings.time.scheduleSunrise;
            const oldHour = Math.trunc(oldTime);
            const newMinutes = oldTime - oldHour;
            const newTime = scheduleTimesSunriseHoursSpin.value + newMinutes;
            settings.time.scheduleSunrise = newTime;
        });

        const scheduleTimesSunriseMinutesSpin = this._builder.get_object('schedule_times_sunrise_minutes_spin');
        scheduleTimesSunriseMinutesSpin.value = Math.round((settings.time.scheduleSunrise - Math.trunc(settings.time.scheduleSunrise)) * 60);
        scheduleTimesSunriseMinutesSpin.connect('output', () => {
            const text = scheduleTimesSunriseMinutesSpin.adjustment.value.toString().padStart(2, '0');
            scheduleTimesSunriseMinutesSpin.set_text(text);
            return true;
        });
        scheduleTimesSunriseMinutesSpin.connect('value-changed', () => {
            const hour = Math.trunc(settings.time.scheduleSunrise);
            const newMinutes = scheduleTimesSunriseMinutesSpin.value / 60;
            const newTime = hour + newMinutes;
            settings.time.scheduleSunrise = newTime;
        });

        const scheduleTimesSunsetHoursSpin = this._builder.get_object('schedule_times_sunset_hours_spin');
        scheduleTimesSunsetHoursSpin.value = Math.trunc(settings.time.scheduleSunset);
        scheduleTimesSunsetHoursSpin.connect('output', () => {
            const text = scheduleTimesSunsetHoursSpin.adjustment.value.toString().padStart(2, '0');
            scheduleTimesSunsetHoursSpin.set_text(text);
            return true;
        });
        scheduleTimesSunsetHoursSpin.connect('value-changed', () => {
            const oldTime = settings.time.scheduleSunset;
            const oldHour = Math.trunc(oldTime);
            const newMinutes = oldTime - oldHour;
            const newTime = scheduleTimesSunsetHoursSpin.value + newMinutes;
            settings.time.scheduleSunset = newTime;
        });

        const scheduleTimesSunsetMinutesSpin = this._builder.get_object('schedule_times_sunset_minutes_spin');
        scheduleTimesSunsetMinutesSpin.value = Math.round((settings.time.scheduleSunset - Math.trunc(settings.time.scheduleSunset)) * 60);
        scheduleTimesSunsetMinutesSpin.connect('output', () => {
            const text = scheduleTimesSunsetMinutesSpin.adjustment.value.toString().padStart(2, '0');
            scheduleTimesSunsetMinutesSpin.set_text(text);
            return true;
        });
        scheduleTimesSunsetMinutesSpin.connect('value-changed', () => {
            const hour = Math.trunc(settings.time.scheduleSunset);
            const newMinutes = scheduleTimesSunsetMinutesSpin.value / 60;
            const newTime = hour + newMinutes;
            settings.time.scheduleSunset = newTime;
        });

        const ondemand = this._builder.get_object('ondemand');
        const updateOndemandVisibility = () => {
            ondemand.visible = settings.time.alwaysEnableOndemand || settings.time.timeSource === 'ondemand';
        };
        settings.time.connect('always-enable-ondemand-changed', () => updateOndemandVisibility());
        settings.time.connect('time-source-changed', () => updateOndemandVisibility());
        updateOndemandVisibility();

        const ondemandShortcutButton = this._builder.get_object('ondemand_shortcut_button');
        const updateOndemandShortcutButtonLabel = () => {
            const label = settings.time.ondemandKeybinding;
            ondemandShortcutButton.label = label || _('Choose');
        };
        settings.time.connect('ondemand-keybinding-changed', () => updateOndemandShortcutButtonLabel());
        ondemandShortcutButton.connect('clicked', () => {
            const dialog = new OndemandKeyboardShortcutDialog(settings);
            dialog.set_transient_for(this.widget.get_root());
            dialog.present();
        });
        updateOndemandShortcutButtonLabel();

        const ondemandShortcutClearButton = this._builder.get_object('ondemand_shortcut_clear_button');
        ondemandShortcutClearButton.connect('clicked', () => {
            settings.time.ondemandKeybinding = '';
        });
        const updateOndemandShortcutClearButtonVisibility = () => {
            ondemandShortcutClearButton.visible = !!settings.time.ondemandKeybinding;
        };
        settings.time.connect('ondemand-keybinding-changed', () => updateOndemandShortcutClearButtonVisibility());
        updateOndemandShortcutClearButtonVisibility();

        const ondemandButtonPlacementCombo = this._builder.get_object('ondemand_button_placement_combo');
        settings.time.settings.bind(
            'ondemand-button-placement',
            ondemandButtonPlacementCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
    }
};
