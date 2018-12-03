const OUTER_MARKUP = "ol";
const OUTER_CLASS = "record-list";
const INNER_MARKUP = "li";
const INNER_CLASS = "record-list-item";


function RecordList(mithril) {
    this.mithril = mithril;
    this.records = [];
}

RecordList.prototype.view = function() {
    return this.mithril(
        OUTER_MARKUP,
        { class: OUTER_CLASS },
        this
            .records
            .map((record) => this.mithril(
                INNER_MARKUP,
                { class: INNER_CLASS + ' ' + record.class },
                record.text
            ))
    ); 
};

RecordList.prototype.mount = function(el) {
    this.mithril.mount(el, this);
};
