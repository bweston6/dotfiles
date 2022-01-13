// SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();


var PreferenceRow = GObject.registerClass({
    GTypeName: 'PreferenceRow',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'PreferenceRow.ui'])}`,
    InternalChildren: ['subtitle_label', 'end_box'],
    Properties: {
        title: GObject.ParamSpec.string(
            'title',
            'Title',
            'Title of the preference',
            GObject.ParamFlags.READWRITE,
            null
        ),
        subtitle: GObject.ParamSpec.string(
            'subtitle',
            'Subtitle',
            'Description of the preference',
            GObject.ParamFlags.READWRITE,
            null
        ),
        activatable_widget: GObject.ParamSpec.object(
            'activatable-widget',
            'Activatable widget',
            'The widget to activate when the row is activated',
            GObject.ParamFlags.READWRITE,
            Gtk.Widget.$gtype
        ),
    },
}, class PreferenceRow extends Gtk.ListBoxRow {
    activate() {
        if (this.activatable_widget)
            return this.activatable_widget.activate();
        else
            return false;
    }

    onSubtitleChanged(list) {
        list._subtitle_label.visible = !!list.subtitle;
    }

    onActivatableWidgetChanged(list) {
        while (list._end_box.get_last_child())
            list._end_box.remove(list._end_box.get_last_child());
        list.activatable = false;
        if (list.activatable_widget) {
            list._end_box.append(list.activatable_widget);
            list.activatable = true;
        }
    }
});
