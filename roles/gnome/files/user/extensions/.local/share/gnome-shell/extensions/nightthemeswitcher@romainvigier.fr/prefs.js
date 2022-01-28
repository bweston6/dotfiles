// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict';

const { Gdk, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { Headerbar } = Me.imports.preferences.Headerbar;
const { Preferences } = Me.imports.preferences.Preferences;


/**
 * Initialize the preferences.
 */
function init() {
    extensionUtils.initTranslations();

    const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default());
    iconTheme.add_search_path(GLib.build_filenamev([Me.path, 'icons']));

    const styleProvider = new Gtk.CssProvider();
    styleProvider.load_from_path(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'style.css']));
    Gtk.StyleContext.add_provider_for_display(Gdk.Display.get_default(), styleProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
}

/**
 * Build the preferences widget.
 */
function buildPrefsWidget() {
    const preferences = new Preferences();
    preferences.connect('notify::root', () => {
        const window = preferences.get_root();
        window.add_css_class('nightthemeswitcher');
        const headerbar = new Headerbar({ preferences });
        window.set_titlebar(headerbar);
    });
    return preferences;
}
