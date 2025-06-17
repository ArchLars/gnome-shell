import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as BoxPointer from './boxpointer.js';
import * as Main from './main.js';
import {EmojiSelection} from './keyboard.js';

export const EmojiPicker = GObject.registerClass({
    Signals: { 'emoji-selected': { param_types: [GObject.TYPE_STRING] } },
}, class EmojiPicker extends St.Widget {
    _init() {
        super._init({ visible: false });

        this._dummyCursor = new Clutter.Actor({ opacity: 0 });
        Main.layoutManager.uiGroup.add_child(this._dummyCursor);

        this._boxPointer = new BoxPointer.BoxPointer(St.Side.TOP);
        this._boxPointer.hide();
        Main.layoutManager.addTopChrome(this._boxPointer);

        this._selection = new EmojiSelection();
        this._selection.connect('emoji-selected', (_s, emoji) => {
            this.emit('emoji-selected', emoji);
            this.close();
        });
        this._selection.connect('close-request', () => this.close());
        this._boxPointer.bin.set_child(this._selection);

        const uiModes = Shell.ActionMode.ALL & ~Shell.ActionMode.LOGIN_SCREEN;
        Main.wm.addKeybinding(
            'emoji-picker',
            new Gio.Settings({ schema_id: 'org.gnome.shell.keybindings' }),
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            uiModes,
            () => this.openAtPointer()
        );
    }

    openAtPointer() {
        const [x, y] = global.get_pointer();
        this._dummyCursor.set_position(Math.round(x), Math.round(y));
        this._dummyCursor.set_size(1, 1);
        this._boxPointer.setPosition(this._dummyCursor, 0);
        this._boxPointer.open(BoxPointer.PopupAnimation.FULL);
    }

    openForEntry(entry) {
        this._boxPointer.setPosition(entry, 0.5);
        this._boxPointer.open(BoxPointer.PopupAnimation.FULL);
    }

    close() {
        this._boxPointer.close(BoxPointer.PopupAnimation.FULL);
    }
});
