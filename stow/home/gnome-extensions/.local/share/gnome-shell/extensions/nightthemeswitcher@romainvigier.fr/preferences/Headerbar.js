// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();


var Headerbar = GObject.registerClass({
    GTypeName: 'Headerbar',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'Headerbar.ui'])}`,
    Properties: {
        preferences: GObject.ParamSpec.object(
            'preferences',
            'Preferences',
            'A Preferences stack',
            GObject.ParamFlags.READWRITE,
            Gtk.Stack.$gtype
        ),
    },
}, class Headerbar extends Gtk.HeaderBar {
    onPreferencesChanged(headerbar) {
        headerbar.title_widget = null;
        if (!headerbar.preferences)
            return;
        const pages = headerbar.preferences.pages;
        const box = new Gtk.Box({ orientation: 'horizontal', css_classes: ['linked'] });
        for (let i = 0; i < pages.get_n_items(); i++) {
            const page = pages.get_item(i);
            const button = new Gtk.ToggleButton({ active: pages.is_selected(i) });
            const buttonBox = new Gtk.Box({ orientation: 'horizontal', margin_start: 12, margin_end: 12, spacing: 6 });
            buttonBox.append(new Gtk.Image({ icon_name: page.icon_name }));
            buttonBox.append(new Gtk.Label({ label: page.title }));
            button.set_child(buttonBox);
            button.connect('clicked', () => {
                pages.select_item(i, true);
                button.active = true;
            });
            pages.connect('selection-changed', () => {
                button.active = pages.is_selected(i);
            });
            box.append(button);
        }
        headerbar.title_widget = box;
    }
});
