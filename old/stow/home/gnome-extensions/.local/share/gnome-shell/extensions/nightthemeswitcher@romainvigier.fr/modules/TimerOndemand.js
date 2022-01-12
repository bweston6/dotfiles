// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Clutter, Gio, GLib, GObject, Meta, Shell, St } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const { main } = imports.ui;

const { Button: PanelMenuButton } = imports.ui.panelMenu;
const { PopupBaseMenuItem } = imports.ui.popupMenu;

const Me = extensionUtils.getCurrentExtension();
const _ = extensionUtils.gettext;

const e = Me.imports.extension;
const utils = Me.imports.utils;

const { Time } = Me.imports.enums.Time;

/**
 * The On-demand Timer allows the user to manually switch between the day and
 * night variants with a button in the top bar and a keybinding.
 *
 * The user can change the key combination in the extension's preferences.
 */
var TimerOndemand = class {
    constructor() {
        this._timeSettings = extensionUtils.getSettings(utils.getSettingsSchema('time'));
        this._settingsConnections = [];
        this._button = null;
        this._previousKeybinding = null;
        this._timerConnection = null;
    }

    enable() {
        console.debug('Enabling On-demand Timer...');
        this._connectSettings();
        this._addKeybinding();
        this._addButton();
        this._connectTimer();
        this.emit('time-changed', this.time);
        console.debug('On-demand Timer enabled.');
    }

    disable() {
        console.debug('Disabling On-demand Timer...');
        this._disconnectTimer();
        this._removeKeybinding();
        this._removeButton();
        this._disconnectSettings();
        console.debug('On-demand Timer disabled.');
    }


    get time() {
        return this._timeSettings.get_string('ondemand-time');
    }


    _connectSettings() {
        console.debug('Connecting On-demand Timer to settings...');
        this._settingsConnections.push({
            settings: this._timeSettings,
            id: this._timeSettings.connect('changed::ondemand-time', this._onOndemandTimeChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._timeSettings,
            id: this._timeSettings.connect('changed::nightthemeswitcher-ondemand-keybinding', this._onOndemandKeybindingChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._timeSettings,
            id: this._timeSettings.connect('changed::ondemand-button-placement', this._onOndemandButtonPlacementChanged.bind(this)),
        });
    }

    _disconnectSettings() {
        console.debug('Disconnecting On-demand Timer from settings...');
        this._settingsConnections.forEach(connection => connection.settings.disconnect(connection.id));
        this._settingsConnections = [];
    }

    _connectTimer() {
        console.debug('Connecting On-demand Timer to Timer...');
        this._timerConnection = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timerConnection) {
            e.timer.disconnect(this._timerConnection);
            this._timerConnection = null;
        }
        console.debug('Disconnected On-demand Timer from Timer.');
    }


    _onOndemandTimeChanged() {
        this.emit('time-changed', this.time);
    }

    _onOndemandKeybindingChanged() {
        this._removeKeybinding();
        this._addKeybinding();
    }

    _onOndemandButtonPlacementChanged() {
        this._removeButton();
        this._addButton();
    }

    _onTimeChanged(_timer, _newTime) {
        this._timeSettings.set_string('ondemand-time', e.timer.time);
        this._updateButton();
    }


    _addKeybinding() {
        this._previousKeybinding = this._timeSettings.get_strv('nightthemeswitcher-ondemand-keybinding')[0];
        if (!this._timeSettings.get_strv('nightthemeswitcher-ondemand-keybinding')[0])
            return;
        console.debug('Adding On-demand Timer keybinding...');
        main.wm.addKeybinding(
            'nightthemeswitcher-ondemand-keybinding',
            this._timeSettings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            this._toggleTime.bind(this)
        );
        console.debug('Added On-demand Timer keybinding.');
    }

    _removeKeybinding() {
        if (this._previousKeybinding) {
            console.debug('Removing On-demand Timer keybinding...');
            main.wm.removeKeybinding('nightthemeswitcher-ondemand-keybinding');
            console.debug('Removed On-demand Timer keybinding.');
        }
    }

    _addButton() {
        switch (this._timeSettings.get_string('ondemand-button-placement')) {
        case 'panel':
            this._addButtonToPanel();
            break;
        case 'menu':
            this._addButtonToMenu();
        }
    }

    _removeButton() {
        if (this._button) {
            console.debug('Removing On-demand Timer button...');
            this._button.destroy();
            this._button = null;
            console.debug('Removed On-demand Timer button.');
        }
    }

    _updateButton() {
        if (this._button) {
            console.debug('Updating On-demand Timer button state...');
            this._button.update();
            console.debug('Updated On-demand Timer button state.');
        }
    }

    _addButtonToPanel() {
        console.debug('Adding On-demand Timer button to the panel...');
        this._button = new NtsPanelMenuButton();
        this._button.connect('button-press-event', () => this._toggleTime());
        this._button.connect('touch-event', () => this._toggleTime());
        main.panel.addToStatusArea('NightThemeSwitcherButton', this._button);
        console.debug('Added On-demand Timer button to the panel.');
    }

    _addButtonToMenu() {
        console.debug('Adding On-demand Timer button to the menu...');
        const aggregateMenu = main.panel.statusArea.aggregateMenu;
        const position = utils.findShellAggregateMenuItemPosition(aggregateMenu._system.menu) - 1;
        this._button = new NtsPopupMenuItem();
        this._button.connect('activate', () => {
            this._toggleTime();
        });
        aggregateMenu.menu.addMenuItem(this._button, position);
        console.debug('Added On-demand Timer button to the menu.');
    }

    _toggleTime() {
        this._timeSettings.set_string('ondemand-time', e.timer.time === Time.DAY ? Time.NIGHT : Time.DAY);
        this.emit('time-changed', this.time);
    }
};
Signals.addSignalMethods(TimerOndemand.prototype);

var NtsPanelMenuButton = GObject.registerClass(
    class NtsPanelMenuButton extends PanelMenuButton {
        _init() {
            super._init(0.0);
            this.icon = new St.Icon({
                style_class: 'system-status-icon',
            });
            this.add_child(this.icon);
            this.update();
        }

        update() {
            this.icon.icon_name = _getIconNameForTime(e.timer.time);
            this.icon.fallback_gicon = _getGiconForTime(e.timer.time);
            this.accessible_name = _getLabelForTime(e.timer.time);
        }
    }
);

var NtsPopupMenuItem = GObject.registerClass(
    class NtsPopupMenuItem extends PopupBaseMenuItem {
        _init(params) {
            super._init(params);
            this.icon = new St.Icon({
                style_class: 'popup-menu-icon',
                x_align: Clutter.ActorAlign.END,
            });
            this.add_child(this.icon);
            this.label = new St.Label();
            this.add_child(this.label);
            this.update();
        }

        update() {
            this.icon.icon_name = _getIconNameForTime(e.timer.time);
            this.icon.fallback_gicon = _getGiconForTime(e.timer.time);
            this.label.text = _getLabelForTime(e.timer.time);
        }
    }
);

var _getIconNameForTime = time => {
    return time === Time.DAY ? 'nightthemeswitcher-ondemand-off-symbolic' : 'nightthemeswitcher-ondemand-on-symbolic';
};

var _getGiconForTime = time => {
    return Gio.icon_new_for_string(GLib.build_filenamev([Me.path, 'icons', 'hicolor', 'scalable', 'status', `${this._getIconNameForTime(time)}.svg`]));
};

var _getLabelForTime = time => {
    return time === Time.DAY ? _('Switch to night theme') : _('Switch to day theme');
};
