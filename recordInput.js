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
    this.currentInput = '';
    this.models = TRAINING_DATA.map((datum) => datum.model);
    this.aliases = TRAINING_DATA.map((datum) => datum.alias);
    this.currentModel = this.models[2];
    this.lastPresubmit = Date.now();
}

RecordInput.prototype.makePredictionRequest = function(content, model_id) {
    return this.mithril.request({
        method: 'POST',
        url: PREDICTION_REQUEST_URL,
        data: { content, model_id },
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
                const model = evt.target.value.trim();
                RecordInput.model = model;
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
            if (evt.which === 13) {
                return this.onEnter(evt);
            }

            const prev = this.lastPresubmit;
            const now = Date.now();
            this.lastPresubmit = now;

            if (now - prev > 2500) {
                const textArea = evt.target;
                const content = textArea.value.trim();
                const model_id = this.currentModel;
                return this
                    .makePredictionRequest(content, model_id)
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
        }
    });

    return [ [ span, select ], textArea ];
}

RecordInput.prototype.onEnter = function(evt) {
    const textArea = evt.target;
    const content = textArea.value.trim();
    const model_id = this.currentModel;
    textArea.disabled = true;
    this
        .makePredictionRequest(content, model_id)
        .then((data) => {
            const alias = this.aliases[this.models.indexOf(model_id)];
            const record = `Input '${content}' was ${data.status} with ${data.probability} precision for ${alias} (${model_id})`;
            this.recordList.records.push(record);
        })
        .catch(() => {
            const record = `Input ${content} failed to be dadMODded (we're so sorry!)`;
            this.recordList.records.push(record);
        })
        .then(() => {
            textArea.value = "";
            textArea.disabled = false;
        });
};

RecordInput.prototype.mount = function(el) {
    this.mithril.mount(el, this);
};
