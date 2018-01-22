const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const Clone = require('../../util/clone');
const Color = require('../../util/color');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const RenderedTarget = require('../../sprites/rendered-target');
const log = require('../../util/log');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDc3IDQ3NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDc3IDQ3NzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxwYXRoIGQ9Ik0zOTEuMywyMDMuNGMwLTAuOCwwLTEuNiwwLTIuNGMtMC4xLTcuNS02LjMtMTMuNC0xMy43LTEzLjNjLTcuNSwwLjEtMTMuNCw2LjMtMTMuMywxMy43YzAsMC43LDAsMS4zLDAsMg0KCQkJYzAsNjkuMy01Ni40LDEyNS44LTEyNS44LDEyNS44cy0xMjUuOC01Ni40LTEyNS44LTEyNS44YzAtMSwwLTEuOSwwLTIuOWMwLjItNy41LTUuNy0xMy42LTEzLjItMTMuOGMtNy40LTAuMS0xMy42LDUuNy0xMy44LDEzLjINCgkJCWMwLDEuMiwwLDIuMywwLDMuNWMwLDc5LjcsNjEuMywxNDUuMywxMzkuMywxNTIuMlY0NTBoLTU1LjVjLTcuNSwwLTEzLjUsNi0xMy41LDEzLjVzNiwxMy41LDEzLjUsMTMuNWgxMzgNCgkJCWM3LjUsMCwxMy41LTYsMTMuNS0xMy41cy02LTEzLjUtMTMuNS0xMy41SDI1MnYtOTQuNUMzMjkuOSwzNDguNywzOTEuMywyODMuMSwzOTEuMywyMDMuNHoiLz4NCgkJPHBhdGggZD0iTTIzNywyOTVjNDkuOSwwLDkwLjUtNDAuNiw5MC41LTkwLjV2LTExNEMzMjcuNSw0MC42LDI4Ni45LDAsMjM3LDBzLTkwLjUsNDAuNi05MC41LDkwLjV2MTE0DQoJCQlDMTQ2LjUsMjU0LjQsMTg3LjEsMjk1LDIzNywyOTV6IE0xNzMuNSw5MC41YzAtMzUsMjguNS02My41LDYzLjUtNjMuNXM2My41LDI4LjUsNjMuNSw2My41djExNGMwLDM1LTI4LjUsNjMuNS02My41LDYzLjUNCgkJCXMtNjMuNS0yOC41LTYzLjUtNjMuNVY5MC41eiIvPg0KCTwvZz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K';

/**
 * Host for the Pen-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class SpeechBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * Try to correctly prefix the speech recognition object across browsers.
         */
        this.SpeechRecognition = window.SpeechRecognition ||
            window.webkitSpeechRecognition ||
            window.mozSpeechRecognition ||
            window.msSpeechRecognition ||
            window.oSpeechRecognition;

        /**
        * A flag to indicate that speech recognition is paused during a speech synthesis utterance
        * to avoid feedback. This is used to avoid stopping and re-starting the speech recognition
        * engine.
        * @type {Boolean}
        */
        this.speechRecognitionPaused = false;

        /**
        * The most recent result from the speech recognizer, used for a reporter block.
        * @type {String}
        */
        this.latest_speech = '';

        /**
        * The name of the selected voice for speech synthesis.
        * @type {String}
        */
        this.current_voice_name = 'default';

        /**
        * The current speech synthesis utterance object.
        * Storing the utterance prevents a bug in which garbage collection causes the onend event to fail.
        * @type {String}
        */
        this.current_utterance = null;

        this.startSpeechRecogntion();
    }

    _getVoices () {
        if (typeof speechSynthesis === 'undefined') {
            return;
        }
    
        const voices = speechSynthesis.getVoices();
    
        const scratchVoiceNames = ['Alex', 'Samantha', 'Whisper', 'Zarvox', 'Bad News',
            'Daniel', 'Pipe Organ', 'Boing', 'Karen', 'Ralph', 'Trinoids'];
    
        const availableVoices = [];
    
        for (let i = 0; i < voices.length; i++) {
            if (true || scratchVoiceNames.includes(voices[i].name)) { //scratchVoiceNames might be mac specific?
                availableVoices.push(voices[i]);
            }
        }
    
        return availableVoices;
    };

    /*
    _initVoiceMenu () {
        let voices = this._getVoices();
        let menu = voices.map((voice) => ({
            text: formatMessage({
                id: 'speech.voices.'+voice.name,
                default: voice.name,
                description: 'name for voice '+voice.name
            }),
            value: voice.name
        }));
        return menu;
    }
    */

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'speech',
            name: 'Speech',
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'whenihear',
                    blockType: BlockType.HAT,
                    text: formatMessage({
                        id: 'speech.whenihear',
                        default: 'When I hear [STRING]',
                        description: 'hat that triggers when some words are heard'
                    }),
                    arguments: {
                        STRING: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hi, Scratch!'
                        }
                    }
                },
                {
                    opcode: 'speak',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'speech.speak',
                        default: 'speak [STRING]',
                        description: 'run speech synthesis for these words'
                    }),
                    arguments: {
                        STRING: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello, how are you?'
                        }
                    }
                },
                /*
                {
                    opcode: 'setvoice',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'speech.setvoice',
                        default: 'set voice to [VOICE]',
                        description: 'switch voice used for speech'
                    }),
                    arguments: {
                        VOICE: {
                            type: ArgumentType.STRING,
                            menu: 'voice',
                            defaultValue: 'default'
                        }
                    }
                },
                */
                {
                    opcode: 'getlatestspeech',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'speech.getlatestspeech',
                        default: 'get latest speech',
                        description: 'get latest spoken words from speech recognition'
                    })
                }
            ],
            menus: {
                /*
                voice: this._initVoiceMenu()
                */
            }
        };
    }

    startSpeechRecogntion () {
        if (!this.recognition) {
            this.recognition = new this.SpeechRecognition();
            this.recognition.interimResults = true;
            this.recognized_speech = [];
    
            this.recognition.onresult = function (event) {
                if (this.speechRecognitionPaused) {
                    return;
                }
    
                const SpeechRecognitionResult = event.results[event.resultIndex];
                const results = [];
                for (let k = 0; k < SpeechRecognitionResult.length; k++) {
                    results[k] = SpeechRecognitionResult[k].transcript.toLowerCase();
                }
                this.recognized_speech = results;
    
                this.latest_speech = this.recognized_speech[0];
            }.bind(this);
    
            this.recognition.onend = function () {
                if (this.speechRecognitionPaused) {
                    return;
                }
                this.recognition.start();
            }.bind(this);
    
            this.recognition.start();
        }
    };

    /**
     * The "set voice" block
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */

    setvoice (args) {
        if (args.VOICE === 'Random') {
            const voices = this._getVoices();
            const index = Math.floor(Math.random() * voices.length);
            this.current_voice_name = voices[index].name;
        } else {
            this.current_voice_name = args.VOICE;
        }
    };

    /**
     * The pen "when I hear" hat
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    whenihear (args) {
        if (!this.recognition) {
            return;
        }
    
        let input = Cast.toString(args.STRING).toLowerCase();
        // facilitate matches by removing some punctuation: . ? !
        input = input.replace(/[.?!]/g, '');
        // trim off any white space
        input = input.trim();
    
        if (input === '') return false;
    
        for (let i = 0; i < this.recognized_speech.length; i++) {
            if (this.recognized_speech[i].includes(input)) {
                this.recognized_speech = [];
                return true;
            }
        }
        return false;
    };
    
    /**
     * The pen "get latest speech" block
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    

    getlatestspeech () {
        return this.latest_speech;
    };

    /**
     * The pen "speak" block
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    
    speak (args) {
        const input = Cast.toString(args.STRING).toLowerCase();
    
        // Stop any currently playing utterances
        speechSynthesis.cancel();
    
        this.current_utterance = new SpeechSynthesisUtterance(input);
    
        const voices = this._getVoices();
        for (let i = 0; i < voices.length; i++) {
            if (this.current_voice_name === voices[i].name) {
                this.current_utterance.voice = voices[i];
            }
        }
    
        // Pause speech recognition during speech synthesis
        this.speechRecognitionPaused = true;
        if (this.recognition) {
            this.recognition.stop();
        }
    
        speechSynthesis.speak(this.current_utterance);
    
        return new Promise(resolve => {
            this.current_utterance.onend = () => {
                if (this.speechRecognitionPaused) {
                    this.speechRecognitionPaused = false;
                    if (this.recognition) {
                        try {
                            this.recognition.start();
                        } catch (e) {
                            log.warn(e);
                        }
                    }
                }
                resolve();
            };
        });
    };
}

module.exports = SpeechBlocks;
