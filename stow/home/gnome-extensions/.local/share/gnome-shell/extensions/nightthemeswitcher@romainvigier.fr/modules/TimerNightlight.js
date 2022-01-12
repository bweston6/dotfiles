// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const utils = Me.imports.utils;

const { Time } = Me.imports.enums.Time;


const COLOR_INTERFACE = `
<node>
    <interface name="org.gnome.SettingsDaemon.Color">
        <property name="DisabledUntilTomorrow" type="b" access="readwrite"/>
        <property name="NightLightActive" type="b" access="read"/>
    </interface>
</node>`;


/**
 * The Night Light Timer uses Night Light as a time source.
 *
 * It connects to the Color SettingsDaemon DBus proxy to listen to the
 * 'NightLightActive' property and will signal any change.
 */
var TimerNightlight = class {
    constructor() {
        this._timeSettings = extensionUtils.getSettings(utils.getSettingsSchema('time'));
        this._colorDbusProxy = null;
        this._settingsConnections = [];
        this._nightlightStateConnection = null;
        this._previousNightlightActive = null;
    }

    enable() {
        console.debug('Enabling Night Light Timer...');
        this._connectToColorDbusProxy();
        this._connectSettings();
        this._listenToNightlightState();
        this.emit('time-changed', this.time);
        console.debug('Night Light Timer enabled.');
    }

    disable() {
        console.debug('Disabling Night Light Timer...');
        this._stopListeningToNightlightState();
        this._disconnectSettings();
        this._disconnectFromColorDbusProxy();
        console.debug('Night Light Timer disabled.');
    }


    get time() {
        return this._isNightlightActive() ? Time.NIGHT : Time.DAY;
    }


    _connectToColorDbusProxy() {
        console.debug('Connecting to Color DBus proxy...');
        const ColorProxy = Gio.DBusProxy.makeProxyWrapper(COLOR_INTERFACE);
        this._colorDbusProxy = new ColorProxy(
            Gio.DBus.session,
            'org.gnome.SettingsDaemon.Color',
            '/org/gnome/SettingsDaemon/Color'
        );
        console.debug('Connected to Color DBus proxy.');
    }

    _disconnectFromColorDbusProxy() {
        console.debug('Disconnecting from Color DBus proxy...');
        this._colorDbusProxy = null;
        console.debug('Disconnected from Color DBus proxy.');
    }

    _connectSettings() {
        console.debug('Connecting Night Light Timer to settings...');
        this._settingsConnections.push({
            settings: this._timeSettings,
            id: this._timeSettings.connect('changed::nightlight-follow-disable', this._onNightlightFollowDisableChanged.bind(this)),
        });
    }

    _disconnectSettings() {
        console.debug('Disconnecting Night Light Timer from settings...');
        this._settingsConnections.forEach(connection => connection.settings.disconnect(connection.id));
        this._settingsConnections = [];
    }

    _listenToNightlightState() {
        console.debug('Listening to Night Light state...');
        this._nightlightStateConnection = this._colorDbusProxy.connect(
            'g-properties-changed',
            this._onNightlightStateChanged.bind(this)
        );
    }

    _stopListeningToNightlightState() {
        this._colorDbusProxy.disconnect(this._nightlightStateConnection);
        console.debug('Stopped listening to Night Light state.');
    }


    _onNightlightFollowDisableChanged() {
        this._onNightlightStateChanged();
    }

    _onNightlightStateChanged(_sender, _dbusProperties) {
        if (this._isNightlightActive() !== this._previousNightlightActive) {
            console.debug(`Night Light has become ${this._isNightlightActive() ? '' : 'in'}active.`);
            this._previousNightlightActive = this._isNightlightActive();
            this.emit('time-changed', this.time);
        }
    }


    _isNightlightActive() {
        return this._timeSettings.get_boolean('nightlight-follow-disable')
            ? !this._colorDbusProxy.DisabledUntilTomorrow && this._colorDbusProxy.NightLightActive
            : this._colorDbusProxy.NightLightActive;
    }
};
Signals.addSignalMethods(TimerNightlight.prototype);
