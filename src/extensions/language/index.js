const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const Clone = require('../../util/clone');
const Color = require('../../util/color');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const RenderedTarget = require('../../sprites/rendered-target');
const log = require('../../util/log');

const luis = require('../../../../../../scratch-language-learning/luis.js');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNjEyLjAwMSA2MTIuMDAxIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA2MTIuMDAxIDYxMi4wMDE7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGQ9Ik01NDIuMzQ2LDIzNS41MjNjLTYuNjQ3LTc2LjgwMS01Mi4xMDgtMTQ3LjYyNi0xMTUuNzkzLTE5MC4wNTJjLTM0LjktMjMuMjQ5LTc1LjMzNi0zNy41MTktMTE2Ljg0LTQyLjkxNw0KCQlDMTk1LjMxOS0xMi4zMjUsNzQuODQxLDM3LjkyLDMxLjY4NSwxNTAuMjg0Yy0zNy4wOTksOTYuNTk3LTAuNTIsMTkyLjQ5NSw2NS45MTMsMjY1LjYzMg0KCQljMjMuOTc0LDI2LjM5MywyNy4yOTgsNzYuMDE3LDI3LjI5OCwxMDkuNDQ2djY3Ljc5MmMwLDEwLjQwOCw4LjQzOCwxOC44NDYsMTguODQ2LDE4Ljg0NmgyNDUuMzAxDQoJCWM5LjkyOSwwLDE4LjEzNS03LjcwNCwxOC44MDYtMTcuNjFjMC45MDMtMTMuMzM1LDIuMzg2LTI1LjA2MiwyLjM4Ni0yNS4wNjJjNS4xMjktMjEuOTk2LDIzLjg4NC0zOS42MzQsNjMuNzY4LTMzLjIzMQ0KCQljNDEuODQ0LDYuNzEzLDY4LjIzNy01Ljc1Niw3MC41ODQtMzMuNjE3YzAuNzc0LTkuMTkxLDEuMjczLTg3LjY5NSwxLjI3My04Ny42OTVjMS45OTktMS4xNDIsMTUuMTE3LTMuNzUsMzQuMjM2LTguMDk3DQoJCWMxNC44NjctMy4zOCwyMC4xMDMtMjEuODM4LDkuMjYzLTMyLjU2MWMtNDMuNDY5LTQzLjAwMS00OS4yOTktNjMuMDQ3LTUwLjM3OC02Ny4zNjINCgkJQzUzMy41OTgsMjg1LjMyNyw1NDQuMjk2LDI1OC4wNDksNTQyLjM0NiwyMzUuNTIzeiBNNDYxLjMyNywyMDkuODU4Yy02LjAzOSw3LjY1MS0xMi45MTgsOS4xNDYtMTYuNTU2LDkuMzQ2DQoJCWMtMS4xOTgsMC4wNjYtMi4wMzMsMS4yMDYtMS43MDYsMi4zNmMxLjg2OCw2LjU4MiwzLjc2OCwyNC43MTEtMjguNjg3LDMxLjc3Yy0zMC40MzgsNi42MTUtNDguODQ0LDMwLjI5LTYwLjg2Myw0Mi4zMTMNCgkJYy05LjIzMyw5LjIyNS0yMS43MjMsMTMuNDk1LTM0LjE4MywxNi4yOTljLTEyLjcyOSwyLjg2NC0yNS4zNDEsNS4zNy0zNS4zODQsMTQuNDE1Yy0xMC41NzcsOS41MjctMjUuNDk1LDYxLjk4NS0yOC4wMjcsNzEuMTA0DQoJCWMtMC4yMjIsMC44MDEtMC45NTEsMS4zNTItMS43ODMsMS4zNTJoLTE1LjYyMWMtMC44NzcsMC0xLjYzNi0wLjYxNC0xLjgxNy0xLjQ3M2wtNy41NjktMzUuODAzDQoJCWMtMC4zMTgtMS41MDQtNzMuNjk4LDQuNTM0LTc5LjM0Ny0yOC4yMmMtMC4xOTgtMS4xNDktMS4zNTktMS44NjItMi40NTYtMS40NjZjLTcuMDU2LDIuNTQ2LTI5LjY5Miw4LjgxLTQxLjkxLTEwLjEyMg0KCQljLTguNjYzLTEzLjQyMy02LjM2Mi0yNS45NTUtNS4xNTUtMzAuMjgyYzAuMjUtMC44OTYtMC4yLTEuODI4LTEuMDU1LTIuMTk2Yy02LjIyNS0yLjY3Ny0yOC43MTktMTUuMjg5LTI1LjY2OS01Ni43ODQNCgkJYzIuNDYxLTMzLjQ0OCwyNS4wODUtNDguMjczLDIxLjkyMi01My40MTdjLTkuMTI0LTE0LjgzNy0xLjE5My0zOS40MzEsMTcuNS00NC45MjFjMC43NTMtMC4yMjEsMS4yODgtMC44ODgsMS4zNTktMS42Nw0KCQlsMC43ODktOC43MTljMi41OTYtMzAuNzQzLDQyLjk5MS01MC4yMjYsNzAuNDU1LTM3LjQ0NWMxLjA1OSwwLjQ5MywyLjMxOC0wLjAzMiwyLjY3LTEuMTQ1DQoJCWMzLjQzOC0xMC44OTgsMTAuMzc3LTEzLjg5OCwxMi4yMjYtMTQuOTM4YzguNTE1LTQuNzkxLDE5LjU3Mi00LjE5OSwyOC4zNzQtMC41ODZjMC43MTIsMC4yOTIsMS41MjMsMC4xMTQsMi4wNDgtMC40NDgNCgkJYzIuNTAxLTIuNjc5LDEyLjc1Ni0xMS4xODIsMjkuNzM5LTExLjE4MmMxNy40MiwwLDI2LjI3NSw4LjQ2NSwyOS4zNzEsMTAuODM1YzAuNTY5LDAuNDM1LDEuMzM0LDAuNTEzLDEuOTcyLDAuMTg4DQoJCWMzLjkxOS0yLjAwNCwxOC4yMjgtOC40MTEsMzIuNTU0LTMuNDc2YzEwLjgxOCwzLjczMiwxNi45NTksMTMuNTc4LDE4Ljg5MywxNy4xNjFjMC40MTMsMC43NjYsMS4yODEsMS4xNTcsMi4xMjgsMC45NTcNCgkJYzUuMTM3LTEuMjE3LDIyLjkwMi00LjYyOSwzNy44MjcsMi4xMTFjMTUuNzcyLDcuMTMsMjAuNjkzLDE3LjQzMywyMS45NDgsMjAuODg3YzAuMjU1LDAuNzAzLDAuOTE0LDEuMTc0LDEuNjYyLDEuMjA0DQoJCWMzLjQyLDAuMTM2LDEyLjg1OCwwLjk2NCwxOC42OTEsNS44NjZjMTAuMyw4LjY2LDkuMjk0LDE1LjQ4OCw4LjEwOCwxOC40MWMtMC4zNjEsMC44OSwwLjAzOCwxLjkxLDAuOTAxLDIuMzMzDQoJCWM0LjcwNCwyLjMwNywxNy44OTIsOS45MjcsMjYuMDczLDI2LjExMkM0NzIuMDExLDE4Mi44ODQsNDY3LjUwNSwyMDIuMDMxLDQ2MS4zMjcsMjA5Ljg1OHoiLz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K';

/**
 * Host for the Pen-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class LanguageBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        this.pending = false;
        this.lastRecognition = null;
        this.MODEL_URL = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/dd176c9e-a275-42e1-967c-47323280031b?subscription-key=8da5e785e75644c28dab3cf565fcaa73&verbose=true&timezoneOffset=0&q="

        // create LUIS client
        var luis_app_id = this.MODEL_URL.match(/apps\/([^/?&]+)/)[1];
        var luis_app_key = this.MODEL_URL.match(/subscription-key=([^/?&]+)/)[1];

        this.luisClient = new luis.APIClient({
            authoring_api_key: luis_app_key,
            endpoint_api_key: luis_app_key
        });

        // this.model = this.luisClient.getModel(luis_app_id, '0.1');
        this.model = null;

        this.awaitingModelLoadPending = [];
    }

    /**
     * The language model stored on the stage target and saved to sb3
     */
    get globalLanguageModel () {
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            return stage.languageModel;
        }
        return null;
    }
    set globalLanguageModel (model) {
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            stage.languageModel = model;
        }
        return model;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return this._awaitStageTargetExists()
        .then( () => this._pickModel() )
        .then( () => {
            var entityReporters = [];

            this.model.data.entities.forEach((entity) => {
                var op = 'entity_'+entity.name;

                this[op] = this._getEntity.bind(this, entity.name);

                entityReporters.push({
                    opcode: op,
                    blockType: BlockType.REPORTER,
                    text: entity.name
                });
            });
            
            return {
                id: 'language',
                name: 'Language',
                blockIconURI: blockIconURI,
                blocks: [
                    {
                        opcode: 'understand',
                        blockType: BlockType.COMMAND,
                        text: formatMessage({
                            id: 'language.understand',
                            default: 'understand [SENTENCE]',
                            description: 'try to understand a sentence'
                        }),
                        arguments: {
                            SENTENCE: {
                                type: ArgumentType.STRING,
                                defaultValue: 'Open the door with the crowbar'
                            }
                        }
                    },
                    {
                        opcode: 'lastintent',
                        blockType: BlockType.REPORTER,
                        text: formatMessage({
                            id: 'language.lastintent',
                            default: 'meaning',
                            description: 'last intent from language recognition'
                        })
                    },
                    {
                        opcode: 'whenrecognized',
                        blockType: BlockType.HAT,
                        text: formatMessage({
                            id: 'language.whenrecognized',
                            default: 'when sentence means [INTENT]',
                            description: 'this hat will run when a sentence meaning is recognized'
                        }),
                        arguments: {
                            INTENT: {
                                type: ArgumentType.STRING,
                                menu: 'intent',
                                defaultValue: 'Use tool'
                            }
                        }
                    },
                    {
                        opcode: 'openlearnwindow',
                        blockType: BlockType.COMMAND,
                        text: formatMessage({
                            id: 'language.openlearnwindow',
                            default: 'open learn window',
                            description: 'label for this hacky block that opens the learn window from the VM'
                        })
                    }
                ].concat(entityReporters),

                menus: {
                    intent: this._intentMenu() // must be static menu for now...
                }
            }
        });
    }

    /**
     * Initialize intent menu with localized strings
     * @returns {array} of the localized text and values for each menu element
     * @private
     */
    _intentMenu () {
        return this.model.data.intents.map((intent) => ({
            text: intent.name,
            value: intent.name
        }));
    }

    /**
     * The language "understand" block...
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    understand (args, util) {
        if (this.pending) {
            util.yield();
        } else {
            this.pending = true;
            this.lastRecognition = null;

            this.model.understand(args.SENTENCE)
            .then((response) => {
                this.pending = false;
                this.lastRecognition = response;
                /*
                extensions only get edge triggered hats for now,
                they'll trigger but then cancel execution :(
                 
                util.startHats('language.whenrecognized', {
                    intent: response.topScoringIntent.intent
                }); */
            })
            .catch((error) => {
                this.pending = false;
            });
        }
    }

    /**
     * The  "meaning" block, which reports the last recognized intent
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    lastintent (args, util) {
        return this.lastRecognition ? this.lastRecognition.topScoringIntent.intent : '';
    }

    /**
     * The "when recognized" block...
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    whenrecognized (args, util) {
        //sadly, extensions currently only get edge-triggered hats...
        return (this.lastRecognition && 
            this.lastRecognition.topScoringIntent.intent == args.INTENT);
    }

    openlearnwindow (args, util) {
        console.log('Open learn window!');
        this.runtime.emit('EXT_LANGUAGE_OPEN_LEARN_WINDOW', {
            model: this.model,
            lastRecognition: this.lastRecognition
        });
    }

    /**
     * The "object" entity block...
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    object (args, util) {
        return this._getEntity('object');
    }

    /**
     * The "tool" entity block...
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    tool (args, util) {
        return this._getEntity('tool');
    }

    _getEntity(entity) {
        if (!this.lastRecognition) return;
        for (let i=0; i<this.lastRecognition.entities.length; i++) {
            if (this.lastRecognition.entities[i].type == entity) {
                return this.lastRecognition.entities[i].entity;
            }
        }
        return "";
    }

    _awaitModelLoadPending() {
        return new Promise((resolve) => {
            this.awaitingModelLoadPending.push(resolve);
        });
    }
    _resolveModelLoadPending() {
        this.awaitingModelLoadPending.forEach(resolve => resolve());
        this.awaitingModelLoadPending = [];
        this.modelLoadPending = false;
    }

    _awaitStageTargetExists() {
        if (this.runtime.getTargetForStage()) {
            return Promise.resolve();
        } else {
            return new Promise((resolve, reject) => {
                const onTargetWasCreated = (newTarget, sourceTarget) => {
                    if (this.runtime.getTargetForStage()) {
                        this.runtime.off('targetWasCreated', onTargetWasCreated);
                        resolve();
                    }
                }
                this.runtime.on('targetWasCreated', onTargetWasCreated); 
            });
        }
    }

    _pickModel() {
        if (this.modelLoadPending) {
            return this._awaitModelLoadPending();
        } else if (this.model) {
            if (this.model.data) {
                return Promise.resolve();
            } else {
                return Promise.reject(); // TODO: I don't think this is the right place to do this.
            }
        } else if (this.globalLanguageModel !== null) {
            // this project has a language model stored on its state, load.
            this.modelLoadPending = true;
            return this._loadModel(this.globalLanguageModel)
            .then( () => this._resolveModelLoadPending());
        } else {
            // open the UI for picking a model.
            // TODO: ideally, just provision a model per project.
            this.modelLoadPending = true;
            return (
                this.luisClient.getModelList()
                .then(models => new Promise((resolve) => {
                    this.runtime.once('EXT_LANGUAGE_MODEL_SELECTED', (selection) => resolve(selection));
                    this.runtime.emit('EXT_LANGUAGE_SELECT_MODEL', {models: models});
                }))
                .then( (selection) => ( (selection == 'CREATE_NEW_MODEL') ? 
                    this._createNewModel() :
                    this._loadModel(selection)
                ))
                .then( () => this._resolveModelLoadPending())
            );
        }
    }

    _loadModel(model_app_id) {
        this.model = this.luisClient.getModel(model_app_id, '0.1');
        this.globalLanguageModel = this.model.appid;
        return this.model.loadData();
    }

    _createNewModel() {
        return this.luisClient.createModel().then(model => 
            model.loadData()
            .then( () => model.startTraining() )
            .then( () => model.waitForTrainingToComplete() )
            .then( () => model.publish() )
            .then( () => {
                this.model = model;
                this.globalLanguageModel = model.appid;
            })
        );
    }
}

module.exports = LanguageBlocks;
