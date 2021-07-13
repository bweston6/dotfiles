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

const { GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

const utils = Me.imports.utils;


var Headerbar = class {
    constructor(stack) {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'headerbar.ui']));

        this.widget = this._builder.get_object('headerbar');

        this._connect(stack);

        return this.widget;
    }

    _connect(stack) {
        const scheduleRadio = this._builder.get_object('schedule_radio');
        scheduleRadio.connect('clicked', () => stack.set_visible_child_name('schedule'));

        const gtkThemeRadio = this._builder.get_object('gtk_theme_radio');
        gtkThemeRadio.connect('clicked', () => stack.set_visible_child_name('gtk-theme'));

        const shellThemeRadio = this._builder.get_object('shell_theme_radio');
        shellThemeRadio.connect('clicked', () => stack.set_visible_child_name('shell-theme'));

        const iconThemeRadio = this._builder.get_object('icon_theme_radio');
        iconThemeRadio.connect('clicked', () => stack.set_visible_child_name('icon-theme'));

        const cursorThemeRadio = this._builder.get_object('cursor_theme_radio');
        cursorThemeRadio.connect('clicked', () => stack.set_visible_child_name('cursor-theme'));

        const backgroundsRadio = this._builder.get_object('backgrounds_radio');
        backgroundsRadio.connect('clicked', () => stack.set_visible_child_name('backgrounds'));

        const commandsRadio = this._builder.get_object('commands_radio');
        commandsRadio.connect('clicked', () => stack.set_visible_child_name('commands'));
    }
};
