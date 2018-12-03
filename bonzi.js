function Bonzi(clippy) {
    this.clippy = clippy;
    this.instance = null;
}

Bonzi.responses = {
    enabled: [
        "Kid tested.  Dad approved.",
        "Praise the lord, and pass the ammunition!",
        "That's what Bira would say.",
        "Look at Mr. Clean over here!",
    ],

    disabled: [
        "Are you sure you want to show Dad that?",
        "Dad says: \"Noooo way.\"",
        "Is your name Vince?",
        "Real knowledge is to know the extent of one’s ignorance.",
        "Would you say that in front of your Mother?",
    ],

    down: [
        "Dad left for cigarettes 20 years ago.",
    ],
};

Bonzi.prototype.load = function() {
    this.clippy.load('Genius', (agent) => {
        this.instance = agent;
        this.instance.show();
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
