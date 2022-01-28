// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { GLib } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const utils = Me.imports.utils;

const { Time } = Me.imports.enums.Time;


/**
 * The Schedule Timer uses a manual schedule to get the current time.
 *
 * Every second, it will check if the time has changed and signal if that's the
 * case.
 *
 * The user can change the schedule in the extension's preferences.
 */
var TimerSchedule = class {
    constructor() {
        this._timeSettings = extensionUtils.getSettings(utils.getSettingsSchema('time'));
        this._previouslyDaytime = null;
        this._timeChangeTimer = null;
    }

    enable() {
        console.debug('Enabling Schedule Timer...');
        this._watchForTimeChange();
        this.emit('time-changed', this.time);
        console.debug('Schedule Timer enabled.');
    }

    disable() {
        console.debug('Disabling Schedule Timer...');
        this._stopWatchingForTimeChange();
        console.debug('Schedule Timer disabled.');
    }


    get time() {
        return this._isDaytime() ? Time.DAY : Time.NIGHT;
    }


    _isDaytime() {
        const time = GLib.DateTime.new_now_local();
        const hour = time.get_hour() + time.get_minute() / 60 + time.get_second() / 3600;
        return hour >= this._timeSettings.get_double('schedule-sunrise') && hour <= this._timeSettings.get_double('schedule-sunset');
    }

    _watchForTimeChange() {
        console.debug('Watching for time change...');
        this._timeChangeTimer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            if (!Me.imports.extension.enabled) {
                // The extension doesn't exist anymore, quit the loop
                return false;
            }
            if (this._previouslyDaytime !== this._isDaytime()) {
                this._previouslyDaytime = this._isDaytime();
                this.emit('time-changed', this.time);
            }
            return true; // Repeat the loop
        });
    }

    _stopWatchingForTimeChange() {
        GLib.Source.remove(this._timeChangeTimer);
        console.debug('Stopped watching for time change.');
    }
};
Signals.addSignalMethods(TimerSchedule.prototype);
