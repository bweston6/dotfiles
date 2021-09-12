// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict';

const { GLib } = imports.gi;
const { extensionUtils } = imports.misc;
const { extensionManager } = imports.ui.main;

const Me = extensionUtils.getCurrentExtension();

const { logDebug } = Me.imports.utils;
const { Settings } = Me.imports.settings.Settings;
const { Timer } = Me.imports.modules.Timer;
const { GtkThemer } = Me.imports.modules.GtkThemer;
const { ShellThemer } = Me.imports.modules.ShellThemer;
const { IconThemer } = Me.imports.modules.IconThemer;
const { CursorThemer } = Me.imports.modules.CursorThemer;
const { Backgrounder } = Me.imports.modules.Backgrounder;
const { Commander } = Me.imports.modules.Commander;


var enabled = false;
var settings = null;
var timer = null;
var gtkThemer = null;
var shellThemer = null;
var iconThemer = null;
var cursorThemer = null;
var backgrounder = null;
var commander = null;


/**
 * Extension initialization.
 */
function init() {
    logDebug('Initializing extension...');
    extensionUtils.initTranslations(Me.metadata['gettext-domain']);
    logDebug('Extension initialized.');
}

/**
 * When the extension is enabled, we wait for the Extension Manager to be
 * initialized before starting.
 */
function enable() {
    _waitForExtensionManager().then(() => start());
}

/**
 * When the extension is started, we create and enable all the modules.
 */
function start() {
    logDebug('Enabling extension...');
    settings = new Settings();
    timer = new Timer();
    gtkThemer = new GtkThemer();
    shellThemer = new ShellThemer();
    iconThemer = new IconThemer();
    cursorThemer = new CursorThemer();
    backgrounder = new Backgrounder();
    commander = new Commander();

    settings.enable();
    timer.enable();
    gtkThemer.enable();
    shellThemer.enable();
    iconThemer.enable();
    cursorThemer.enable();
    backgrounder.enable();
    commander.enable();

    enabled = true;
    logDebug('Extension enabled.');
}

/**
 * When the extension is disabled, we disable and remove all the modules.
 */
function disable() {
    logDebug('Disabling extension...');
    enabled = false;

    gtkThemer.disable();
    shellThemer.disable();
    iconThemer.disable();
    cursorThemer.disable();
    backgrounder.disable();
    commander.disable();
    timer.disable();
    settings.disable();

    settings = null;
    timer = null;
    gtkThemer = null;
    shellThemer = null;
    iconThemer = null;
    cursorThemer = null;
    backgrounder = null;
    commander = null;
    logDebug('Extension disabled.');
}

/**
 * Wait for the Extension Manager to be initialized. Returns a Promise.
 */
function _waitForExtensionManager() {
    return new Promise(resolve => {
        logDebug('Waiting for Extension Manager initialization...');
        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            while (!extensionManager._initialized)
                continue;
            return false;
        });
        logDebug('Extension Manager initialized.');
        resolve();
    });
}
