const TRAINING_DATA = [
    { model: 'h1', alias: 'Everything (english)' },
    { model: 'h2', alias: 'Advance before VF' },
    { model: 'h3', alias: 'Al.com after august 2018' },
    { model: 'h4', alias: 'Radio-Canada' },
    { model: 'h5', alias: 'Sportsnet' },
];

const PREDICTION_REQUEST_URL = 'http://192.168.68.86:5000/predict';


function RecordInput(mithril, bonzi, recordList) {
    this.mithril = mithril;
    this.bonzi = bonzi;
    this.recordList = recordList;
    this.models = TRAINING_DATA.map((datum) => datum.model);
    this.aliases = TRAINING_DATA.map((datum) => datum.alias);
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

RecordInput.prototype.view = function() {
    const span = this.mithril('span', 'Choose a model...');

    const select = this.mithril(
        'select',
        {
            class: 'record-select',
            title: 'Choose a dadMODel...',
            onchange: (evt) => {
                clearTimeout(this.typingTid);
                const model = evt.target.value.trim();
                this.currentModel = model;
                if (this.currentInput) {
                    this.typingTid = setTimeout(() => {
                        clearTimeout(this.typingTid);
                        return this
                            .makePredictionRequest()
                            .then((data) => {
                                if (data.status === 'enabled') {
                                    this.bonzi.randomPositiveResponse();
                                } else {
                                    this.bonzi.randomNegativeResponse();
                                }
                            })
                            .catch(() => {
                                this.bonzi.randomDownResponse();
                            });                            
                    }, 500);
                }
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

            clearTimeout(this.typingTid);

            const textArea = evt.target;
            const content = textArea.value.trim();
            this.currentInput = content;

            if (evt.which === 13) {
                return this.onEnter(evt);
            }

            this.typingTid = setTimeout(() => {
                clearTimeout(this.typingTid);
                if (this.currentInput) {
                    return this
                        .makePredictionRequest()
                        .then((data) => {
                            if (data.status === 'enabled') {
                                this.bonzi.randomPositiveResponse();
                            } else {
                                this.bonzi.randomNegativeResponse();
                            }
                        })
                        .catch(() => {
                            this.bonzi.randomDownResponse();
                        });
                }
            }, 1000);
        }
    });

    return [ [ span, select ], textArea ];
}

RecordInput.prototype.onEnter = function(evt) {
    const textArea = evt.target;
    const content = textArea.value.trim();
    this.currentInput = content;
    const model_id = this.currentModel;
    
    textArea.disabled = true;
    this
        .makePredictionRequest()
        .then((data) => {
            const alias = this.aliases[this.models.indexOf(model_id)];
            const text = `Input '${content}' was ${data.status} with ${data.probability} precision for ${alias} (${model_id})`;
            const clazz = data.status;
            this.recordList.records.push({ text, class: clazz });
        })
        .catch(() => {
            const text = `Input ${content} failed to be dadMODded (we're so sorry!)`;
            this.recordList.records.push({ text, class: 'disabled' });
        })
        .then(() => {
            textArea.value = "";
            textArea.disabled = false;
        });
};

RecordInput.prototype.mount = function(el) {
    this.mithril.mount(el, this);
};
