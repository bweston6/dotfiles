// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { Appearance } = Me.imports.preferences.Appearance;
const { BackgroundButton } = Me.imports.preferences.BackgroundButton;
const { BackgroundsPreferences } = Me.imports.preferences.BackgroundsPreferences;
const { ClearableEntry } = Me.imports.preferences.ClearableEntry;
const { Commands } = Me.imports.preferences.Commands;
const { CursorPreferences } = Me.imports.preferences.CursorPreferences;
const { GtkPreferences } = Me.imports.preferences.GtkPreferences;
const { IconPreferences } = Me.imports.preferences.IconPreferences;
const { PreferenceRow } = Me.imports.preferences.PreferenceRow;
const { PreferencesList } = Me.imports.preferences.PreferencesList;
const { Schedule } = Me.imports.preferences.Schedule;
const { ShellPreferences } = Me.imports.preferences.ShellPreferences;
const { ShortcutButton } = Me.imports.preferences.ShortcutButton;
const { TimeChooser } = Me.imports.preferences.TimeChooser;


var Preferences = GObject.registerClass({
    GTypeName: 'Preferences',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'Preferences.ui'])}`,
}, class Preferences extends Gtk.Stack {});
