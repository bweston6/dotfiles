// Copyright (C) 2019, 2020 Romain Vigier
// Copyright (C) 2020 Matti Hyttinen
// SPDX-FileCopyrightText: 2019-2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-FileCopyrightText: 2020 Matti Hyttinen
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The magic of guessing theme variants happens here.
 *
 * If the theme doesn't fit a particular case, we'll do the following:
 *   - Remove any signs of a dark variant to the theme name to get the day
 *   variant
 *   - Remove any signs of a light variant to the day variant and add '-dark' to
 *   get the night variant
 *
 * For themes that don't work with the general rule, a particular case must be
 * written. Day and night variants should be guessed with the most generic light
 * and dark variants the theme offer, except if the user explicitly chose a
 * specific variant.
 *
 * Light variants, from the most to the least generic:
 *   - ''
 *   - '-light'
 *   - '-darker'
 *
 * Dark variants, from the most the least generic:
 *   - '-dark'
 *   - '-darkest'
 */
var ShellVariants = class {
    static guessFrom(name) {
        const variants = new Map();

        if (name === '') {
            variants.set('day', '');
            variants.set('night', '');
        } else if (name.includes('Adapta')) {
            variants.set('day', name.replace('-Nokto', ''));
            variants.set('night', variants.get('day').replace('Adapta', 'Adapta-Nokto'));
        } else if (name.includes('Arc')) {
            variants.set('day', name.replace('-Dark', ''));
            variants.set('night', variants.get('day').replace('Arc', 'Arc-Dark'));
        } else if (name.match(/^(Canta|ChromeOS|Materia|Orchis).*-compact/)) {
            variants.set('day', name.replace('-dark', ''));
            variants.set('night', variants.get('day').replace(/(-light)?-compact/, '-dark-compact'));
        } else if (name.includes('Flat-Remix')) {
            const color = name.split('-')[2] && !['Dark', 'Darkest', 'fullPanel'].includes(name.split('-')[2]) ? `-${name.split('-')[2]}` : '';
            const darkVariant = name.includes('Darkest') ? '-Darkest' : '-Dark';
            const size = name.includes('fullPanel') ? '-fullPanel' : '';
            variants.set('day', name.replace(/-Dark(est)?/, ''));
            variants.set('night', `Flat-Remix${color}${darkVariant}${size}`);
        } else if (name.match(/^(Layan|Matcha)/)) {
            const basename = name.split('-')[0];
            variants.set('day', name.replace('-dark', ''));
            variants.set('night', variants.get('day').replace(new RegExp(`${basename}(-light)?`), `${basename}-dark`));
        } else if (name.includes('mcOS11-Shell')) {
            variants.set('day', name.replace('-Dark', ''));
            variants.set('night', `${variants.get('day')}-Dark`);
        } else if (name.match(/^Mc-?OS-CTLina-Gnome/)) {
            const version = name.split('-').pop();
            variants.set('day', `McOS-CTLina-Gnome-${version}`);
            variants.set('night', `Mc-OS-CTLina-Gnome-Dark-${version}`);
        } else if (name.match(/^(Mojave|WhiteSur)/)) {
            variants.set('day', name.replace('-dark', '-light'));
            variants.set('night', variants.get('day').replace('-light', '-dark'));
        } else if (name.includes('Plata')) {
            variants.set('day', name.replace('-Noir', ''));
            variants.set('night', variants.get('day').replace(/Plata(-Lumine)?/, 'Plata-Noir'));
        } else if (name.includes('Simply_Circles')) {
            variants.set('day', name.replace('_Dark', '_Light'));
            variants.set('night', name.replace('_Light', '_Dark'));
        } else if (name.includes('Teja')) {
            const darkVariant = `_${name.replace('_Light').split('_')[1] || 'Dark'}`;
            variants.set('day', name.replace(/(_Dark(est)?|_Black)/, ''));
            variants.set('night', variants.get('day').replace('_Light', '') + darkVariant);
        } else if (name.includes('vimix')) {
            variants.set('day', name.replace('-dark', ''));
            variants.set('night', variants.get('day').replace(/vimix(-light)?/, 'vimix-dark'));
        } else {
            variants.set('day', name.replace(/-dark(?!er)(est)?/, ''));
            variants.set('night', variants.get('day').replace(/(-light|-darker)/, '') + (name.includes('-darkest') ? '-darkest' : '-dark'));
        }

        return variants;
    }
};
