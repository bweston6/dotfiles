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

const { Gdk, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

const utils = Me.imports.utils;


var OndemandKeyboardShortcutDialog = class {
    constructor(settings) {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'ondemand_keyboard_shortcut_dialog.ui']));

        this.widget = this._builder.get_object('dialog');

        this._connectSettings(settings);

        return this.widget;
    }

    _connectSettings(settings) {
        const eventController = this._builder.get_object('event-controller');
        eventController.connect('key-pressed', (_widget, keyval, keycode, state) => {
            let mask = state & Gtk.accelerator_get_default_mod_mask();
            mask &= ~Gdk.ModifierType.LOCK_MASK;

            if (mask === 0 && keyval === Gdk.KEY_Escape) {
                this.widget.visible = false;
                return Gdk.EVENT_STOP;
            }

            if (
                !utils.isBindingValid({ mask, keycode, keyval }) ||
                !utils.isAccelValid({ mask, keyval })
            )
                return Gdk.EVENT_STOP;

            const binding = Gtk.accelerator_name_with_keycode(
                null,
                keyval,
                keycode,
                mask
            );
            settings.time.ondemandKeybinding = binding;
            this.widget.close();
            return Gdk.EVENT_STOP;
        });
    }
};
