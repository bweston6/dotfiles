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

const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { logDebug, notifyError, getSettingsSchema } = Me.imports.utils;
const { BackgroundsSettings } = Me.imports.settings.Backgrounds;
const { CommandsSettings } = Me.imports.settings.Commands;
const { CursorVariantsSettings } = Me.imports.settings.CursorVariants;
const { GtkVariantsSettings } = Me.imports.settings.GtkVariants;
const { IconVariantsSettings } = Me.imports.settings.IconVariants;
const { ShellVariantsSettings } = Me.imports.settings.ShellVariants;
const { SystemSettings } = Me.imports.settings.System;
const { TimeSettings } = Me.imports.settings.Time;


var Settings = class {
    constructor() {
        logDebug('Initializing settings...');
        this.extension = extensionUtils.getSettings();
        this.backgrounds = new BackgroundsSettings();
        this.commands = new CommandsSettings();
        this.cursorVariants = new CursorVariantsSettings();
        this.gtkVariants = new GtkVariantsSettings();
        this.iconVariants = new IconVariantsSettings();
        this.shellVariants = new ShellVariantsSettings();
        this.system = new SystemSettings();
        this.time = new TimeSettings();
        logDebug('Settings initialized.');

        this._migrate();
    }

    enable() {
        logDebug('Connecting settings signals...');
        this.backgrounds.enable();
        this.commands.enable();
        this.cursorVariants.enable();
        this.gtkVariants.enable();
        this.iconVariants.enable();
        this.shellVariants.enable();
        this.system.enable();
        this.time.enable();
        logDebug('Settings signals connected.');
    }

    disable() {
        logDebug('Disconnecting settings signals...');
        this.backgrounds.disable();
        this.commands.disable();
        this.cursorVariants.disable();
        this.gtkVariants.disable();
        this.iconVariants.disable();
        this.shellVariants.disable();
        this.system.disable();
        this.time.disable();
        logDebug('Settings signals disconnected.');
    }

    _migrate() {
        const settingsVersion = this.extension.get_int('settings-version');

        if (settingsVersion === 0) {
            try {
                logDebug('Migrating settings from v0 to v1...');
                Me.imports.settings.migrations.v0ToV1.migrate(this);
                this.extension.set_int('settings-version', 1);
                logDebug('Migrated settings from v0 to v1.');
            } catch (e) {
                notifyError(e);
            }
        }
    }
};
