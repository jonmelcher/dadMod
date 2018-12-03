function Bonzi(clippy) {
    this.clippy = clippy;
    this.instance = null;
}

Bonzi.responses = {
    enabled: [
        "enabled"
    ],

    disabled: [
        "disabled"
    ],

    down: [
        "down"
    ],
};

Bonzi.prototype.load = function() {
    this.clippy.load('Bonzi', function(agent) {
        Bonzi.instance = agent;
        Bonzi.instance.show();
    });
};

Bonzi.prototype.randomlySpeak = function(arr) {
    if (this.instance) {
        this.instance.speak(arr[ Math.floor(Math.random() * arr.length) ]);
    }    
};

Bonzi.prototype.randomPositiveResponse = function() {
    this.randomlySpeak(Bonzi.responses.enabled);
};

Bonzi.prototype.randomNegativeResponse = function() {
    this.randomlySpeak(Bonzi.responses.disabled);
};

Bonzi.prototype.randomDownResponse = function() {
    this.randomlySpeak(Bonzi.responses.down);
};
