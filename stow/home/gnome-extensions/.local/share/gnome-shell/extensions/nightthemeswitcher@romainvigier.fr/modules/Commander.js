// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

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
