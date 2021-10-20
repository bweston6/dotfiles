// SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio, GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const utils = Me.imports.utils;


var Appearance = GObject.registerClass({
    GTypeName: 'Appearance',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'Appearance.ui'])}`,
}, class Appearance extends Gtk.ScrolledWindow {});
