// SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gdk, GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const utils = Me.imports.utils;


var BackgroundButton = GObject.registerClass({
    GTypeName: 'BackgroundButton',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'BackgroundButton.ui'])}`,
    InternalChildren: ['choose_button', 'change_button', 'clear_button', 'filechooser'],
    Properties: {
        path: GObject.ParamSpec.string(
            'path',
            'Path',
            'Path to the background file',
            GObject.ParamFlags.READWRITE,
            null
        ),
    },
}, class BackgroundButton extends Gtk.Stack {
    activate() {
        if (this.path)
            return this._change_button.activate();
        else
            return this._choose_button.activate();
    }

    openFileChooser() {
        this._filechooser.transient_for = this.get_root();
        this._filechooser.show();
    }

    onFileChooserResponse(fileChooser, responseId) {
        if (responseId !== Gtk.ResponseType.ACCEPT)
            return;
        this.path = fileChooser.get_file().get_uri();
    }

    onPathChanged(button) {
        button.visible_child_name = button.path ? 'edit' : 'choose';
    }

    onChooseButtonClicked(_button) {
        this.openFileChooser();
    }

    onChangeButtonClicked(_button) {
        this.openFileChooser();
    }

    onClearButtonClicked(_button) {
        this.path = '';
    }
});
