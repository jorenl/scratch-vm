const ArgumentType = require('../../extension-support/argument-type');
const Cast = require('../../util/cast');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const log = require('../../util/log');
const DiffMatchPatch = require('diff-match-patch');

const io = require('socket.io-client');


/**
 * Url of icon to be displayed at the left edge of each extension block.
 * @type {string}
 */
// eslint-disable-next-line max-len
const iconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgaGVpZ2h0PSI2NSIKICAgaWQ9InN2ZzIiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDY0Ljk5OTk5OCA2NSIKICAgd2lkdGg9IjY1IgogICBzb2RpcG9kaTpkb2NuYW1lPSJwaG9uZV9pY29uX29ubHkuc3ZnIgogICBpbmtzY2FwZTpleHBvcnQtZmlsZW5hbWU9IkM6XFVzZXJzXHQtam9sYXV3XHBob25lYmcucG5nIgogICBpbmtzY2FwZTpleHBvcnQteGRwaT0iOTAiCiAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSI5MCIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4zICgyNDA1NTQ2LCAyMDE4LTAzLTExKSI+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpZD0iYmFzZSIKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgc2hvd2dyaWQ9InRydWUiCiAgICAgdW5pdHM9InB4IgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9ImxheWVyMTMiCiAgICAgaW5rc2NhcGU6Y3g9IjQwLjE2MjUyNyIKICAgICBpbmtzY2FwZTpjeT0iMjUuMzI1OTQxIgogICAgIGlua3NjYXBlOmRvY3VtZW50LXVuaXRzPSJweCIKICAgICBpbmtzY2FwZTpwYWdlY2hlY2tlcmJvYXJkPSJ0cnVlIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSIxOTc1IgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIzMzYwIgogICAgIGlua3NjYXBlOndpbmRvdy14PSI1OTg3IgogICAgIGlua3NjYXBlOndpbmRvdy15PSItMTMiCiAgICAgaW5rc2NhcGU6em9vbT0iMTUuOTk5OTk5IiAvPgogIDxkZWZzCiAgICAgaWQ9ImRlZnM0Ij4KICAgIDxpbmtzY2FwZTpwYXRoLWVmZmVjdAogICAgICAgZWZmZWN0PSJzcGlybyIKICAgICAgIGlkPSJwYXRoLWVmZmVjdDQ1MDUiCiAgICAgICBpc192aXNpYmxlPSJ0cnVlIiAvPgogIDwvZGVmcz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE3Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIGlua3NjYXBlOmdyb3VwbW9kZT0ibGF5ZXIiCiAgICAgaWQ9ImxheWVyMSIKICAgICBpbmtzY2FwZTpsYWJlbD0id2hpdGViZyIKICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmUiPgogICAgPHJlY3QKICAgICAgIGhlaWdodD0iNjIuODQ0MTE2IgogICAgICAgaWQ9InJlY3QxMDY0LTktMiIKICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtvcGFjaXR5OjAuOTg5OTk5OTk7ZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDozLjA2OTg3ODM0O3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICB3aWR0aD0iMzMuNzY0MzQ3IgogICAgICAgeD0iMTUuOTA5OTA1IgogICAgICAgeT0iMS40OTI5NzA5IiAvPgogIDwvZz4KICA8ZwogICAgIGlkPSJsYXllcjEzIgogICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlua3NjYXBlOmxhYmVsPSJwYW5fdXAiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwtMzUpIj4KICAgIDxwYXRoCiAgICAgICBkPSJtIDMyLjc2NjA0OSwzNS4wMTQzMzUgYyAtNS42NTc3LC0wLjAxIC0xMS4zNDcwMzksMC4xMDM0IC0xNy4wNzAyMjksMC4zMjk2IC0wLjkzOTAxLDAuMDM3IC0xLjY5NTgyLDAuNzU2OSAtMS42OTU4MiwxLjY5NjYgdiA2MC44MTUgYyAwLDAuOTM5NiAwLjc1NzM5LDEuNjQ3MSAxLjY5NTgyLDEuNjk2NSAxMS4xNjIyNDksMC41ODg1MDUgMjIuNDc0OTU5LDAuNjA2MDA1IDMzLjk1MTU1OSwwIDAuOTM4MzgsLTAuMDQ5IDEuNjk2NSwtMC43NTY5IDEuNjk2NSwtMS42OTY1IHYgLTYwLjgxNSBjIDAsLTAuOTM5NyAtMC43NTc0OSwtMS42NjA2IC0xLjY5NjUsLTEuNjk2NiAtNS41OTc1LC0wLjIxMzcgLTExLjIyMzY2LC0wLjMyNjUgLTE2Ljg4MTMzLC0wLjMyOTYgeiBtIC0wLjAxMzEsMi45OTQ4IGMgNC44NjU1OSwwLjAxIDkuNzA0MzMsMC4xMDAyIDE0LjUxODE0LDAuMjg0NCAwLjgwNzU5LDAuMDMyIDEuNDU4NzcsMC42NTI0IDEuNDU4NzcsMS40NjI0IHYgNTIuNDIwOCBjIDAsMC44MSAtMC42NTE3MiwxLjQxOTYgLTEuNDU4NzcsMS40NjIzIC05Ljg2OTg1LDAuNTIyNCAtMTkuNTk4NzEsMC41MDc0IC0yOS4xOTgyMzksMCAtMC44MDcwNSwtMC4wNDIgLTEuNDU4NzMsLTAuNjUyNCAtMS40NTg3MywtMS40NjIzIHYgLTUyLjQyMDggYyAwLC0wLjgxIDAuNjUxMjIsLTEuNDMwMyAxLjQ1ODczLC0xLjQ2MjQgNC45MjE5NjksLTAuMTk0OSA5LjgxNDQ4OSwtMC4yODcyIDE0LjY4MDA5OSwtMC4yODQ0IHogbSAtMC4wODEsNTguMDE0MiBhIDEuMjAwMzM4MSwxLjIwMDMzODEgMCAwIDEgMS4xOTk4MiwxLjE5OTggMS4yMDAzMzgxLDEuMjAwMzM4MSAwIDAgMSAtMS4xOTk4MiwxLjIwMDcgMS4yMDAzMzgxLDEuMjAwMzM4MSAwIDAgMSAtMS4yMDA1NSwtMS4yMDA3IDEuMjAwMzM4MSwxLjIwMDMzODEgMCAwIDEgMS4yMDA1NSwtMS4xOTk4IHoiCiAgICAgICBpZD0icmVjdDQxMzYtMi01LTg4LTYiCiAgICAgICBzdHlsZT0iZmlsbDojMzgzODM4O2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lIgogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz4KICAgIDxwYXRoCiAgICAgICBzdHlsZT0iZmlsbDojNWY4ZGQzO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowLjMzMDI1NDM4O3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICBkPSJtIDMyLjY3MTk0OSw1MC4wMzExODcgLTYuNzM3OTY4LDUuNzU0MDQ3IGggMy40NTI1ODEgdiA2LjgxOTc5NCBoIC02LjUwMTEwNyB2IC0zLjU5NjAzNSBsIC01LjQ0MjIwNCw3LjEyNzIzOSA1LjQ0MjIwNCw3LjEyNTI3NSB2IC0zLjY1MTA0MSBoIDYuNTAxMTA3IHYgNi44NzM4MTcgaCAtMy40NTI1ODEgbCA2LjczNzk2OCw1Ljc1NTAyOSA2LjczODg5NiwtNS43NTUwMjkgaCAtMy4zOTk2MzcgdiAtNi44NzM4MTcgaCA2LjQ0NzIzNCB2IDMuNjUxMDQxIGwgNS40NDIyMDQsLTcuMTI1Mjc1IC01LjQ0MjIwNCwtNy4xMjcyMzkgdiAzLjU5NjAzNSBoIC02LjQ0NzIzNCB2IC02LjgxOTc5NCBoIDMuMzk5NjM3IHoiCiAgICAgICBpZD0icmVjdDQ1MDctMi0zIgogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz4KICA8L2c+Cjwvc3ZnPgo=';

const GESTURE_REMOTE_SERVICE_URL = 'http://localhost:3000'

const GESTURE_TIMEOUT = 200;

const gestures = [
    'flick_right_lh',
    'flick_left_lh',
    'flick_right_rh',
    'flick_left_rh',
    'flip_close_lh',
    'flip_open_lh',
    'flip_close_rh',
    'flip_open_rh',
    'pan_left',
    'pan_right',
    'pan_up',
    'pan_down',
    'pull',
    'push'
];

const gesture_friendly_names = [
    'Flick right with left hand',
    'Flick left with left hand',
    'Flick right with right hand',
    'Flick left with right hand',
    'Flip close with left hand',
    'Flip open with left hand',
    'Flip close with right hand',
    'Flip open with right hand',
    'Pan left',
    'Pan right',
    'Pan up',
    'Pan down',
    'Pull',
    'Push'
];
/**
 * Url of icon to be displayed in the toolbox menu for the extension category.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = iconURI;
/**
 * Host for the Pen-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class GestureRemoteBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        this.pending = false;
        this.lastRecognition = null;
        this.MODEL_URL = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/dd176c9e-a275-42e1-967c-47323280031b?subscription-key=8da5e785e75644c28dab3cf565fcaa73&verbose=true&timezoneOffset=0&q="

        this.triggered = {}
        gestures.forEach(gesture => {
            this.triggered[gesture] = false;
        });

        this.socket = io(GESTURE_REMOTE_SERVICE_URL, {'query':{'sessid': 'scratch'}});

        /* events */

        this.socket.on('gesture', (data) => {
            console.log('gesture', data.gestureClass);
            this.triggered[gestures[data.gestureClass]] = true;
            setTimeout( () => {
                this.triggered[gestures[data.gestureClass]] = false;
            }, GESTURE_TIMEOUT);
        });

        //runtime.on('...', ...
    }

    /** event handlers go here **/

    /**
     * Initialize intent menu with localized strings
     * @returns {array} of the localized text and values for each menu element
     * @private
     */
    gestureMenu () {
        return gestures.map((gesture, i) => ({
            text: formatMessage({
                id: 'language.gestureMenu.'+gesture,
                default: gesture_friendly_names[i],
                description: 'intent label for gesture '+gesture
            }),
            value: gesture
        }));
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'gestureRemote',
            name: 'Gesture Remote',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'whengesture',
                    blockType: BlockType.HAT,
                    text: formatMessage({
                        id: 'language.whengesture',
                        default: 'when you make gesture [GESTURE]',
                        description: 'this hat will run when a gesture is made using the phone'
                    }),
                    arguments: {
                        GESTURE: {
                            type: ArgumentType.STRING,
                            menu: 'gesture',
                            defaultValue: gesture_friendly_names[0]
                        }
                    }
                }
            ],
            menus: {
                gesture: this.gestureMenu() // must be static menu for now...
            }
        };
    }

    /*
    getHats () {
        return {
            whenrecognized: {
                restartExistingThreads: true
            }
        };
    }
    */

    /**
     * The "when gesture" block...
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    whengesture (args, util) {
        return this.triggered[args.GESTURE];
    }
}

module.exports = GestureRemoteBlocks;
