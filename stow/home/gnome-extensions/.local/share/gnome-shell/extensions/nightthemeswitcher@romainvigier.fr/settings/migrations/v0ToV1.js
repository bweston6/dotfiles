// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { getSettingsSchema } = Me.imports.utils;

/**
 *  Migrate settings from v0 to v1.
 *
 * @param {Settings} settings The current settings.
 */
function migrate(settings) {
    const oldSettings = extensionUtils.getSettings(getSettingsSchema('v0'));

    settings.gtkVariants.enabled = oldSettings.get_boolean('gtk-variants-enabled');
    settings.gtkVariants.day = oldSettings.get_string('gtk-variant-day');
    settings.gtkVariants.night = oldSettings.get_string('gtk-variant-night');
    settings.gtkVariants.manual = oldSettings.get_boolean('manual-gtk-variants');

    settings.shellVariants.enabled = oldSettings.get_boolean('shell-variants-enabled');
    settings.shellVariants.day = oldSettings.get_string('shell-variant-day');
    settings.shellVariants.night = oldSettings.get_string('shell-variant-night');
    settings.shellVariants.manual = oldSettings.get_boolean('manual-shell-variants');

    settings.iconVariants.enabled = oldSettings.get_boolean('icon-variants-enabled');
    settings.iconVariants.day = oldSettings.get_string('icon-variant-day');
    settings.iconVariants.night = oldSettings.get_string('icon-variant-night');

    settings.cursorVariants.enabled = oldSettings.get_boolean('cursor-variants-enabled');
    settings.cursorVariants.day = oldSettings.get_string('cursor-variant-day');
    settings.cursorVariants.night = oldSettings.get_string('cursor-variant-night');

    settings.commands.enabled = oldSettings.get_boolean('commands-enabled');
    settings.commands.sunrise = oldSettings.get_string('command-sunrise');
    settings.commands.sunset = oldSettings.get_string('command-sunset');

    settings.backgrounds.enabled = oldSettings.get_boolean('backgrounds-enabled');
    settings.backgrounds.day = oldSettings.get_string('background-day');
    settings.backgrounds.night = oldSettings.get_string('background-night');

    settings.time.timeSource = oldSettings.get_string('time-source');
    settings.time.ondemandTime = oldSettings.get_string('ondemand-time');
    settings.time.ondemandKeybinding = oldSettings.get_strv('nightthemeswitcher-ondemand-keybinding')[0];
    settings.time.ondemandButtonPlacement = oldSettings.get_string('ondemand-button-placement');
    settings.time.manualTimeSource = oldSettings.get_boolean('manual-time-source');
    settings.time.scheduleSunrise = oldSettings.get_double('schedule-sunrise');
    settings.time.scheduleSunset = oldSettings.get_double('schedule-sunset');
}
