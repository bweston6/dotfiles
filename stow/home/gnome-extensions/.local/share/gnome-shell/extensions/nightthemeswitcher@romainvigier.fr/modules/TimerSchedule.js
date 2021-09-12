// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { GLib } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { logDebug } = Me.imports.utils;


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
        this._previouslyDaytime = null;
        this._timeChangeTimer = null;
    }

    enable() {
        logDebug('Enabling Schedule Timer...');
        this._watchForTimeChange();
        this.emit('time-changed', this.time);
        logDebug('Schedule Timer enabled.');
    }

    disable() {
        logDebug('Disabling Schedule Timer...');
        this._stopWatchingForTimeChange();
        logDebug('Schedule Timer disabled.');
    }


    get time() {
        return this._isDaytime() ? 'day' : 'night';
    }


    _isDaytime() {
        const time = GLib.DateTime.new_now_local();
        const hour = time.get_hour() + time.get_minute() / 60 + time.get_second() / 3600;
        return hour >= e.settings.time.scheduleSunrise && hour <= e.settings.time.scheduleSunset;
    }

    _watchForTimeChange() {
        logDebug('Watching for time change...');
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
        logDebug('Stopped watching for time change.');
    }
};
Signals.addSignalMethods(TimerSchedule.prototype);
