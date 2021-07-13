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

const { GLib } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { logDebug } = Me.imports.utils;


/**
 * The Commander is responsible for spawning commands according to the time.
 */
var Commander = class {
    constructor() {
        this._statusChangedConnect = null;
        this._timeChangedConnect = null;
    }

    enable() {
        logDebug('Enabling Commander...');
        this._watchStatus();
        if (e.settings.commands.enabled) {
            this._connectTimer();
            this._spawnCommand(e.timer.time);
        }
        logDebug('Commander enabled.');
    }

    disable() {
        logDebug('Disabling Commander...');
        this._disconnectTimer();
        this._unwatchStatus();
        logDebug('Commander disabled.');
    }


    _watchStatus() {
        logDebug('Watching commands status...');
        this._statusChangedConnect = e.settings.commands.connect('status-changed', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusChangedConnect) {
            e.settings.commands.disconnect(this._statusChangedConnect);
            this._statusChangedConnect = null;
        }
        logDebug('Stopped watching commands status.');
    }

    _connectTimer() {
        logDebug('Connecting Commander to Timer...');
        this._timeChangedConnect = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timeChangedConnect) {
            e.timer.disconnect(this._timeChangedConnect);
            this._timeChangedConnect = null;
        }
        logDebug('Disconnecting Commander from Timer.');
    }


    _onStatusChanged(_settings, _enabled) {
        this.disable();
        this.enable();
    }

    _onTimeChanged(_timer, newTime) {
        this._spawnCommand(newTime);
    }


    _spawnCommand(time) {
        const command = time === 'day' ? e.settings.commands.sunrise : e.settings.commands.sunset;
        GLib.spawn_async(null, ['sh', '-c', command], null, GLib.SpawnFlags.SEARCH_PATH, null);
        logDebug(`Spawned ${time} command.`);
    }
};
