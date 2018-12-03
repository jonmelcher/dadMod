const PREDICTIVE_MODEL_OPTIONS = [
    { model: 'h1', alias: 'Everything (english)' },
    { model: 'h2', alias: 'Advance before VF' },
    { model: 'h3', alias: 'Al.com after august 2018' },
    { model: 'h4', alias: 'Radio-Canada' },
    { model: 'h5', alias: 'Sportsnet' },
];

const PREDICTION_REQUEST_URL = 'http://192.168.68.86:5000/predict';
const TYPING_TIMEOUT_MS = 500;
const ENABLED = 'enabled';
const DISABLED = 'disabled';
const ENTER = 13;


function RecordInput(mithril, bonzi, recordList) {
    this.mithril = mithril;
    this.bonzi = bonzi;
    this.recordList = recordList;
    this.models = PREDICTIVE_MODEL_OPTIONS.map((datum) => datum.model);
    this.aliases = PREDICTIVE_MODEL_OPTIONS.map((datum) => datum.alias);
    this.currentInput = '';
    this.currentModel = this.models[2];
    this.typingTid = 0;
}

RecordInput.prototype.makePredictionRequest = function() {
    return this.mithril.request({
        method: 'POST',
        url: PREDICTION_REQUEST_URL,
        data: { content: this.currentInput, model_id: this.currentModel },
        withCredentials: false,
    });
};

RecordInput.prototype.typingTask = function() {
    clearTimeout(this.typingTid);
    if (this.currentInput) {
        this.typingTid = setTimeout(() => {
            clearTimeout(this.typingTid);
            return this
                .makePredictionRequest()
                .then((data) => {
                    if (data.status === ENABLED) {
                        this.bonzi.randomPositiveResponse();
                    } else {
                        this.bonzi.randomNegativeResponse();
                    }
                })
                .catch(() => {
                    this.bonzi.randomDownResponse();
                });                            
        }, TYPING_TIMEOUT_MS);
    }
};

RecordInput.prototype.view = function() {
    
    const span = this.mithril('span', 'Choose a model...');

    const select = this.mithril(
        'select',
        {
            class: 'record-select',
            title: 'Choose a dadMODel...',
            onchange: (evt) => {
                this.currentModel = evt.target.value.trim();
                this.typingTask();
            }
        },

        this.models.map((model, index) => this.mithril(
            'option',
            {
                value: model,
                selected: index === this.models.indexOf(this.currentModel)
            }, this.aliases[index])
        )
    );

    const textArea = this.mithril('textarea', {

        class: 'record-input',

        title: 'Type in something to be dadMODded and press enter...',

        onkeyup: (evt) => {
            this.currentInput = evt.target.value.trim();
            if (evt.which === ENTER) {
                // we are submitting already, avoid double calling the api
                clearInterval(this.typingTid);
                return this.onEnter(evt);
            }
            this.typingTask();
        }
    });

    return [ [ span, select ], textArea ];
}

RecordInput.prototype.onEnter = function(evt) {
    const textArea = evt.target;

    // prevent further input while submitting
    textArea.disabled = true;

    this.currentInput = textArea.value.trim();

    this
        .makePredictionRequest()
        .then((data) => {
            const alias = this.aliases[this.models.indexOf(this.currentModel)];
            const text = `Input '${this.currentInput}' was ${data.status} with ${data.probability} precision for ${alias} (${this.currentModel})`;
            const clazz = data.status;
            this.recordList.records.push({ text, class: clazz });
        })
        .catch(() => {
            const text = `Input ${this.currentInput} failed to be dadMODded (we're so sorry!)`;
            this.recordList.records.push({ text, class: DISABLED });
        })
        .then(() => {
            // reset textarea and allow more input
            textArea.value = "";
            textArea.disabled = false;
        });
};

RecordInput.prototype.mount = function(el) {
    this.mithril.mount(el, this);
};
