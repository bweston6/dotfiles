// SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio, GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();


var PreferencesList = GObject.registerClass({
    GTypeName: 'PreferencesList',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'PreferencesList.ui'])}`,
}, class PreferencesList extends Gtk.ListBox {
    onRowActivated(_list, row) {
        row.activate();
    }
});
