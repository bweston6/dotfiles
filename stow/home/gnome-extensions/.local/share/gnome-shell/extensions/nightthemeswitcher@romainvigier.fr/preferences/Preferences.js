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

const { Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { Settings } = Me.imports.settings.Settings;

const { BackgroundsPreferences } = Me.imports.preferences.Backgrounds;
const { CommandsPreferences } = Me.imports.preferences.Commands;
const { CursorThemePreferences } = Me.imports.preferences.CursorTheme;
const { GtkThemePreferences } = Me.imports.preferences.GtkTheme;
const { IconThemePreferences } = Me.imports.preferences.IconTheme;
const { SchedulePreferences } = Me.imports.preferences.Schedule;
const { ShellThemePreferences } = Me.imports.preferences.ShellTheme;

const { Headerbar } = Me.imports.preferences.Headerbar;


var Preferences = class {
    constructor() {
        this.settings = new Settings();
        this.settings.enable();

        this.widget = new Gtk.Stack({
            interpolate_size: true,
            vhomogeneous: false,
            transition_type: Gtk.StackTransitionType.SLIDE_LEFT_RIGHT,
            visible: true,
        });

        const schedulePreferences = new SchedulePreferences(this.settings);
        this.widget.add_titled(schedulePreferences.widget, schedulePreferences.name, schedulePreferences.title);

        const gtkThemePreferences = new GtkThemePreferences(this.settings);
        this.widget.add_titled(gtkThemePreferences.widget, gtkThemePreferences.name, gtkThemePreferences.title);

        const shellThemePreferences = new ShellThemePreferences(this.settings);
        this.widget.add_titled(shellThemePreferences.widget, shellThemePreferences.name, shellThemePreferences.title);

        const iconThemePreferences = new IconThemePreferences(this.settings);
        this.widget.add_titled(iconThemePreferences.widget, iconThemePreferences.name, iconThemePreferences.title);

        const cursorThemePreferences = new CursorThemePreferences(this.settings);
        this.widget.add_titled(cursorThemePreferences.widget, cursorThemePreferences.name, cursorThemePreferences.title);

        const backgroundsPreferences = new BackgroundsPreferences(this.settings);
        this.widget.add_titled(backgroundsPreferences.widget, backgroundsPreferences.name, backgroundsPreferences.title);

        const commandsPreferences = new CommandsPreferences(this.settings);
        this.widget.add_titled(commandsPreferences.widget, commandsPreferences.name, commandsPreferences.title);

        this.headerbar = new Headerbar(this.widget);
    }
};
