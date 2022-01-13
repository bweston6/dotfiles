// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict';

const { GLib } = imports.gi;
const { extensionUtils } = imports.misc;
const { extensionManager } = imports.ui.main;

const Me = extensionUtils.getCurrentExtension();

const { Timer } = Me.imports.modules.Timer;
const { GtkThemer } = Me.imports.modules.GtkThemer;
const { ShellThemer } = Me.imports.modules.ShellThemer;
const { IconThemer } = Me.imports.modules.IconThemer;
const { CursorThemer } = Me.imports.modules.CursorThemer;
const { Backgrounder } = Me.imports.modules.Backgrounder;
const { Commander } = Me.imports.modules.Commander;


var enabled = false;
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
    console.debug('Initializing extension...');
    extensionUtils.initTranslations();
    console.debug('Extension initialized.');
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
    console.debug('Enabling extension...');
    timer = new Timer();
    gtkThemer = new GtkThemer();
    shellThemer = new ShellThemer();
    iconThemer = new IconThemer();
    cursorThemer = new CursorThemer();
    backgrounder = new Backgrounder();
    commander = new Commander();

    timer.enable();
    gtkThemer.enable();
    shellThemer.enable();
    iconThemer.enable();
    cursorThemer.enable();
    backgrounder.enable();
    commander.enable();

    enabled = true;
    console.debug('Extension enabled.');
}

/**
 * When the extension is disabled, we disable and remove all the modules.
 */
function disable() {
    console.debug('Disabling extension...');
    enabled = false;

    gtkThemer.disable();
    shellThemer.disable();
    iconThemer.disable();
    cursorThemer.disable();
    backgrounder.disable();
    commander.disable();
    timer.disable();

    timer = null;
    gtkThemer = null;
    shellThemer = null;
    iconThemer = null;
    cursorThemer = null;
    backgrounder = null;
    commander = null;
    console.debug('Extension disabled.');
}

/**
 * Wait for the Extension Manager to be initialized. Returns a Promise.
 */
function _waitForExtensionManager() {
    return new Promise(resolve => {
        console.debug('Waiting for Extension Manager initialization...');
        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            while (!extensionManager._initialized)
                continue;
            return false;
        });
        console.debug('Extension Manager initialized.');
        resolve();
    });
}
