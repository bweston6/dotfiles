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

const { Clutter, Gio, GLib, GObject, Meta, Shell, St } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const { main } = imports.ui;

const { Button: PanelMenuButton } = imports.ui.panelMenu;
const { PopupBaseMenuItem } = imports.ui.popupMenu;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { logDebug, findShellAggregateMenuItemPosition } = Me.imports.utils;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

/**
 * The On-demand Timer allows the user to manually switch between the day and
 * night variants with a button in the top bar and a keybinding.
 *
 * The user can change the key combination in the extension's preferences.
 */
var TimerOndemand = class {
    constructor() {
        this._button = null;
        this._previousKeybinding = null;
        this._ondemandKeybindingConnect = null;
        this._ondemandButtonPlacementConnect = null;
        this._timeChangedConnect = null;
    }

    enable() {
        logDebug('Enabling On-demand Timer...');
        this._connectSettings();
        this._addKeybinding();
        this._addButton();
        this._connectTimer();
        this.emit('time-changed', this.time);
        logDebug('On-demand Timer enabled.');
    }

    disable() {
        logDebug('Disabling On-demand Timer...');
        this._disconnectTimer();
        this._removeKeybinding();
        this._removeButton();
        this._disconnectSettings();
        logDebug('On-demand Timer disabled.');
    }


    get time() {
        return e.settings.time.ondemandTime;
    }


    _connectSettings() {
        logDebug('Connecting On-demand Timer to settings...');
        this._ondemandKeybindingConnect = e.settings.time.connect('ondemand-keybinding-changed', this._onOndemandKeybindingChanged.bind(this));
        this._ondemandButtonPlacementConnect = e.settings.time.connect('ondemand-button-placement-changed', this._onOndemandButtonPlacementChanged.bind(this));
    }

    _disconnectSettings() {
        logDebug('Disconnecting On-demand Timer from settings...');
        if (this._ondemandKeybindingConnect) {
            e.settings.time.disconnect(this._ondemandKeybindingConnect);
            this._ondemandKeybindingConnect = null;
        }
        if (this._ondemandButtonPlacementConnect) {
            e.settings.time.disconnect(this._ondemandButtonPlacementConnect);
            this._ondemandButtonPlacementConnect = null;
        }
    }

    _connectTimer() {
        logDebug('Connecting On-demand Timer to Timer...');
        this._timeChangedConnect = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timeChangedConnect) {
            e.timer.disconnect(this._timeChangedConnect);
            this._timeChangedConnect = null;
        }
        logDebug('Disconnected On-demand Timer from Timer.');
    }


    _onOndemandKeybindingChanged(_settings, _keybinding) {
        this._removeKeybinding();
        this._addKeybinding();
    }

    _onOndemandButtonPlacementChanged(_settings, _placement) {
        this._removeButton();
        this._addButton();
    }

    _onTimeChanged(_timer, _newTime) {
        this._updateButton();
    }


    _addKeybinding() {
        this._previousKeybinding = e.settings.time.ondemandKeybinding;
        if (!e.settings.time.ondemandKeybinding)
            return;
        logDebug('Adding On-demand Timer keybinding...');
        main.wm.addKeybinding(
            'nightthemeswitcher-ondemand-keybinding',
            e.settings.time.settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            this._toggleTime.bind(this)
        );
        logDebug('Added On-demand Timer keybinding.');
    }

    _removeKeybinding() {
        if (this._previousKeybinding) {
            logDebug('Removing On-demand Timer keybinding...');
            main.wm.removeKeybinding('nightthemeswitcher-ondemand-keybinding');
            logDebug('Removed On-demand Timer keybinding.');
        }
    }

    _addButton() {
        switch (e.settings.time.ondemandButtonPlacement) {
        case 'panel':
            this._addButtonToPanel();
            break;
        case 'menu':
            this._addButtonToMenu();
            break;
        }
    }

    _removeButton() {
        if (this._button) {
            logDebug('Removing On-demand Timer button...');
            this._button.destroy();
            this._button = null;
            logDebug('Removed On-demand Timer button.');
        }
    }

    _updateButton() {
        if (this._button) {
            logDebug('Updating On-demand Timer button state...');
            this._button.update();
            logDebug('Updated On-demand Timer button state.');
        }
    }

    _addButtonToPanel() {
        logDebug('Adding On-demand Timer button to the panel...');
        this._button = new NtsPanelMenuButton();
        this._button.connect('button-press-event', () => this._toggleTime());
        this._button.connect('touch-event', () => this._toggleTime());
        main.panel.addToStatusArea('NightThemeSwitcherButton', this._button);
        logDebug('Added On-demand Timer button to the panel.');
    }

    _addButtonToMenu() {
        logDebug('Adding On-demand Timer button to the menu...');
        const aggregateMenu = main.panel.statusArea.aggregateMenu;
        const position = findShellAggregateMenuItemPosition(aggregateMenu._system.menu) - 1;
        this._button = new NtsPopupMenuItem();
        this._button.connect('activate', () => {
            this._toggleTime();
        });
        aggregateMenu.menu.addMenuItem(this._button, position);
        logDebug('Added On-demand Timer button to the menu.');
    }

    _toggleTime() {
        e.settings.time.ondemandTime = e.timer.time === 'day' ? 'night' : 'day';
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

const _getIconNameForTime = time => {
    return time === 'day' ? 'nightthemeswitcher-ondemand-off-symbolic' : 'nightthemeswitcher-ondemand-on-symbolic';
};

const _getGiconForTime = time => {
    return Gio.icon_new_for_string(GLib.build_filenamev([Me.path, 'icons', 'hicolor', 'scalable', 'status', `${this._getIconNameForTime(time)}.svg`]));
};

const _getLabelForTime = time => {
    return time === 'day' ? _('Switch to night theme') : _('Switch to day theme');
};
