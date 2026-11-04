// SPDX-License-Identifier: GPL-2.0-or-later
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Clutter from 'gi://Clutter';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

// direction the banner comes FROM, as [x, y] unit vectors
const DIRS = {
    right: [1, 0],
    left: [-1, 0],
    top: [0, -1],
    bottom: [0, 1],
};

export default class SlideNotify extends Extension {
    enable() {
        const settings = this.getSettings();
        const bin = Main.messageTray._bannerBin;
        const orig = bin.ease;

        bin.ease = function (props) {
            // only handle the show/hide animation (the one that moves y)
            if (props.y === undefined)
                return orig.call(this, props);

            const p = {...props};
            const [dx, dy] = DIRS[settings.get_string('direction')] ?? DIRS.right;
            const dist = settings.get_int('distance');
            const dur = (p.duration ?? 250) * settings.get_double('speed');
            const bounce = settings.get_boolean('bounce');
            const amount = settings.get_int('bounce-amount');

            p.duration = dur;

            if (p.y === 0) {
                // SHOWING: cancel the stock vertical move, use our own slide
                this.y = 0;
                this.translation_x = dx * dist;
                this.translation_y = dy * dist;

                if (bounce && amount > 0) {
                    // overshoot past the resting spot, then settle back
                    orig.call(this, {
                        translation_x: -dx * amount,
                        translation_y: -dy * amount,
                        duration: dur * 0.7,
                        mode: Clutter.AnimationMode.EASE_OUT_CUBIC,
                        onComplete: () => {
                            orig.call(this, {
                                translation_x: 0,
                                translation_y: 0,
                                duration: dur * 0.3,
                                mode: Clutter.AnimationMode.EASE_OUT_QUAD,
                            });
                        },
                    });
                } else {
                    orig.call(this, {
                        translation_x: 0,
                        translation_y: 0,
                        duration: dur,
                        mode: Clutter.AnimationMode.EASE_OUT_CUBIC,
                    });
                }
            } else {
                // HIDING: slide back out the way it came in
                p.y = this.y;
                orig.call(this, {
                    translation_x: dx * dist,
                    translation_y: dy * dist,
                    duration: dur,
                    mode: Clutter.AnimationMode.EASE_IN_CUBIC,
                });
            }
            return orig.call(this, p);
        };

        this._bin = bin;
    }

    disable() {
        if (this._bin) {
            delete this._bin.ease;
            this._bin.translation_x = 0;
            this._bin.translation_y = 0;
            this._bin = null;
        }
    }
}
