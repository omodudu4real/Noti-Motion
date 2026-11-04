// SPDX-License-Identifier: GPL-2.0-or-later
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class SlideNotifyPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const page = new Adw.PreferencesPage({
            title: 'Slide Notify',
            icon_name: 'preferences-system-notifications-symbolic',
        });
        const group = new Adw.PreferencesGroup({title: 'Animation'});
        page.add(group);
        window.add(page);

        // Direction
        const dirs = ['right', 'left', 'top', 'bottom'];
        const dirRow = new Adw.ComboRow({
            title: 'Slide in from',
            model: Gtk.StringList.new(['Right', 'Left', 'Top', 'Bottom']),
        });
        dirRow.selected = Math.max(0, dirs.indexOf(settings.get_string('direction')));
        dirRow.connect('notify::selected', () =>
            settings.set_string('direction', dirs[dirRow.selected]));
        group.add(dirRow);

        // Speed (duration multiplier)
        const speedRow = new Adw.SpinRow({
            title: 'Duration multiplier',
            subtitle: 'Higher = slower animation',
            adjustment: new Gtk.Adjustment({
                lower: 0.5, upper: 8, step_increment: 0.5, page_increment: 1,
            }),
            digits: 1,
        });
        settings.bind('speed', speedRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        group.add(speedRow);

        // Distance
        const distRow = new Adw.SpinRow({
            title: 'Slide distance (px)',
            adjustment: new Gtk.Adjustment({
                lower: 50, upper: 1000, step_increment: 50, page_increment: 100,
            }),
        });
        settings.bind('distance', distRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        group.add(distRow);

        // Bounce
        const bounceRow = new Adw.SwitchRow({title: 'Bounce'});
        settings.bind('bounce', bounceRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        group.add(bounceRow);

        const amountRow = new Adw.SpinRow({
            title: 'Bounce amount (px)',
            subtitle: 'How far it overshoots before settling',
            adjustment: new Gtk.Adjustment({
                lower: 0, upper: 150, step_increment: 5, page_increment: 20,
            }),
        });
        settings.bind('bounce-amount', amountRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('bounce', amountRow, 'sensitive', Gio.SettingsBindFlags.GET);
        group.add(amountRow);

        // Test button
        const testRow = new Adw.ActionRow({title: 'Send a test notification'});
        const btn = new Gtk.Button({label: 'Test', valign: Gtk.Align.CENTER});
        btn.connect('clicked', () => {
            Gio.Subprocess.new(
                ['notify-send', 'Slide Notify', 'Testing the animation'],
                Gio.SubprocessFlags.NONE);
        });
        testRow.add_suffix(btn);
        group.add(testRow);
    }
}
