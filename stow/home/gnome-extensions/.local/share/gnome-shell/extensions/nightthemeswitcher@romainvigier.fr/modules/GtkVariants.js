/*
Night Theme Switcher Gnome Shell extension

Copyright (C) 2019, 2020 Romain Vigier
Copyright (C) 2020 Matti Hyttinen

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program. If not, see <http s ://www.gnu.org/licenses/>.
*/

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
var GtkVariants = class {
    static guessFrom(name) {
        const variants = new Map();

        if (name.includes('Adapta')) {
            variants.set('day', name.replace('-Nokto', ''));
            variants.set('night', variants.get('day').replace('Adapta', 'Adapta-Nokto'));
        } else if (name.includes('Arc')) {
            variants.set('day', name.replace(/-Dark(?!er)/, ''));
            variants.set('night', variants.get('day').replace(/Arc(-Darker)?/, 'Arc-Dark'));
        } else if (name.match('Cabinet')) {
            variants.set('day', name.replace(/-Dark(?!er)/, '-Light'));
            variants.set('night', variants.get('day').replace(/(-Light|-Darker)/, '-Dark'));
        } else if (name.match(/^(Canta|ChromeOS|Materia|Orchis).*-compact/)) {
            variants.set('day', name.replace('-dark', ''));
            variants.set('night', variants.get('day').replace(/(-light)?-compact/, '-dark-compact'));
        } else if (name.includes('Flat-Remix-GTK')) {
            const isSolid = name.includes('-Solid');
            const withoutBorder = name.includes('-NoBorder');
            const basename = name.split('-').slice(0, 4).join('-');
            variants.set('day', basename + (name.includes('-Darker') ? '-Darker' : '') + (isSolid ? '-Solid' : ''));
            variants.set('night', basename + (name.includes('-Darkest') ? '-Darkest' : '-Dark') + (isSolid ? '-Solid' : '') + (withoutBorder ? '-NoBorder' : ''));
        } else if (name.includes('HighContrast')) {
            variants.set('day', 'HighContrast');
            variants.set('night', 'HighContrastInverse');
        } else if (name.match(/^(Layan|Macwaita|Matcha|Nextwaita)/)) {
            const basename = name.split('-')[0];
            variants.set('day', name.replace('-dark', ''));
            variants.set('night', variants.get('day').replace(new RegExp(`${basename}(-light)?`), `${basename}-dark`));
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
        } else if (name.match(/^Prof-Gnome-(.+)-3(.*)/)) {
            variants.set('day', name.replace(/-Dark(?!er)/, '-Light'));
            variants.set('night', variants.get('day').replace(/(-Light(-DS)?|-Darker)/, '-Dark'));
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
