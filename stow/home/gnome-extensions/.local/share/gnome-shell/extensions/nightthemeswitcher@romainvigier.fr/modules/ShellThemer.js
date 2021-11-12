// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();
const _ = extensionUtils.gettext;

const e = Me.imports.extension;
const utils = Me.imports.utils;

const { Time } = Me.imports.enums.Time;
const { ShellVariants } = Me.imports.modules.ShellVariants;

/**
 * The Shell Themer is responsible for changing the GTK theme according to the
 * time. It will use the User Themes extension to do so if it is enabled.
 *
 * When the user changes its shell theme (for example via GNOME Tweaks), it will
 * try to automatically guess the day and night variants for this theme. It
 * will warn the user if it is unable to guess.
 *
 * In manual mode, it will not attempt to update the variants. The user can
 * change the shell variants in the extension's preferences.
 */
var ShellThemer = class {
    constructor() {
        this._shellVariantsSettings = extensionUtils.getSettings(utils.getSettingsSchema('shell-variants'));
        this._userthemesSettings = utils.getUserthemesSettings();
        this._settingsConnections = [];
        this._statusConnection = null;
        this._timerConnection = null;
    }

    enable() {
        console.debug('Enabling Shell Themer...');
        try {
            this._watchStatus();
            if (this._shellVariantsSettings.get_boolean('enabled')) {
                this._connectSettings();
                this._updateVariants();
                this._connectTimer();
                this._updateSystemShellTheme();
            }
        } catch (error) {
            main.notifyError(Me.metadata.name, error.message);
        }
        console.debug('Shell Themer enabled.');
    }

    disable() {
        console.debug('Disabling Shell Themer...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        console.debug('Shell Themer disabled.');
    }


    _watchStatus() {
        console.debug('Watching shell variants status...');
        this._statusConnection = this._shellVariantsSettings.connect('changed::enabled', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusConnection) {
            this._shellVariantsSettings.disconnect(this._statusConnection);
            this._statusConnection = null;
        }
        console.debug('Stopped watching shell variants status.');
    }

    _connectSettings() {
        console.debug('Connecting Shell Themer to settings...');
        this._settingsConnections.push({
            settings: this._shellVariantsSettings,
            id: this._shellVariantsSettings.connect('changed::day', this._onDayVariantChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._shellVariantsSettings,
            id: this._shellVariantsSettings.connect('changed::night', this._onNightVariantChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._shellVariantsSettings,
            id: this._shellVariantsSettings.connect('changed::manual', this._onManualChanged.bind(this)),
        });
        if (this._userthemesSettings) {
            this._settingsConnections.push({
                settings: this._userthemesSettings,
                id: this._userthemesSettings.connect('changed::name', this._onSystemShellThemeChanged.bind(this)),
            });
        }
    }

    _disconnectSettings() {
        this._settingsConnections.forEach(connection => connection.settings.disconnect(connection.id));
        this._settingsConnections = [];
        console.debug('Disconnected Shell Themer from settings.');
    }

    _connectTimer() {
        console.debug('Connecting Shell Themer to Timer...');
        this._timerConnection = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timerConnection) {
            e.timer.disconnect(this._timerConnection);
            this._timerConnection = null;
        }
        console.debug('Disconnected Shell Themer from Timer.');
    }


    _onStatusChanged() {
        console.debug(`Shell variants switching has been ${this._shellVariantsSettings.get_boolean('enabled') ? 'enabled' : 'disabled'}.`);
        this.disable();
        this.enable();
    }

    _onDayVariantChanged() {
        console.debug(`Day Shell variant changed to '${this._shellVariantsSettings.get_string('day')}'.`);
        this._updateSystemShellTheme();
    }

    _onNightVariantChanged() {
        console.debug(`Night Shell variant changed to '${this._shellVariantsSettings.get_string('night')}'.`);
        this._updateSystemShellTheme();
    }

    _onSystemShellThemeChanged(_settings, _newTheme) {
        if (!this._userthemesSettings)
            return;
        console.debug(`System Shell theme changed to '${this._userthemesSettings.get_string('name')}'.`);
        try {
            this._updateVariants();
            this._updateCurrentVariant();
            this._updateSystemShellTheme();
        } catch (error) {
            main.notifyError(Me.metadata.name, error.message);
        }
    }

    _onManualChanged() {
        console.debug(`Manual Shell variants choice has been ${this._shellVariantsSettings.get_boolean('manual') ? 'enabled' : 'disabled'}.`);
        this.disable();
        this.enable();
    }

    _onTimeChanged() {
        this._updateSystemShellTheme();
    }


    _areVariantsUpToDate() {
        if (!this._userthemesSettings)
            return true;
        return (
            this._userthemesSettings.get_string('name') === this._shellVariantsSettings.get_string('day') ||
            this._userthemesSettings.get_string('name') === this._shellVariantsSettings.get_string('night')
        );
    }

    _updateCurrentVariant() {
        if (e.timer.time === Time.UNKNOWN || !this._userthemesSettings || !this._shellVariantsSettings.get_boolean('manual'))
            return;
        this._shellVariantsSettings.set_string(e.timer.time, this._userthemesSettings.get_string('name'));
    }

    _updateSystemShellTheme() {
        if (e.timer.time === Time.UNKNOWN)
            return;
        console.debug(`Setting the ${e.timer.time} Shell variant...`);
        const shellTheme = this._shellVariantsSettings.get_string(e.timer.time);
        if (this._userthemesSettings) {
            this._userthemesSettings.set_string('name', shellTheme);
        } else {
            const stylesheet = utils.getShellThemeStylesheet(shellTheme);
            utils.applyShellStylesheet(stylesheet);
        }
    }

    _updateVariants() {
        if (!this._userthemesSettings || this._shellVariantsSettings.get_boolean('manual') || this._areVariantsUpToDate())
            return;

        console.debug('Updating Shell variants...');
        const originalTheme = this._userthemesSettings.get_string('name');
        const variants = ShellVariants.guessFrom(originalTheme);
        const installedThemes = utils.getInstalledShellThemes();

        if (!installedThemes.has(variants.get(Time.DAY)) || !installedThemes.has(variants.get(Time.NIGHT))) {
            const message = _('Unable to automatically detect the day and night variants for the "%s" GNOME Shell theme. Please manually choose them in the extension\'s preferences.').format(originalTheme);
            throw new Error(message);
        }

        this._shellVariantsSettings.set_string('day', variants.get(Time.DAY));
        this._shellVariantsSettings.set_string('night', variants.get(Time.NIGHT));
        console.debug(`New Shell variants. { day: '${variants.get(Time.DAY)}'; night: '${variants.get(Time.NIGHT)}' }`);
    }
};
