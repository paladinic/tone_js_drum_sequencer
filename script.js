// Setup variables
let beat = 0;
let started = false;
let playing = false;
const instruments = ["Snare", "Kick", "Hi-hat"];
const synths = makeInstruments();
const grid = makeGrid(instruments, 16); // Adjusted for 16 columns



function makeInstruments() {
    // Snare
    const snareBody = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: {
            type: "sine"
        },
        envelope: {
            attack: 0.001,
            decay: 0.2,
            sustain: 0.02,
            release: 0.5,
            attackCurve: "exponential"
        }
    }).toDestination();

    const snareNoise = new Tone.NoiseSynth({
        noise: {
            type: "white"
        },
        envelope: {
            attack: 0.001,
            decay: 0.2,
            sustain: 0.1,
            release: 0.5,
        }
    }).toDestination();

    // Kick
    const kick = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: {
            type: "sine"
        },
        envelope: {
            attack: 0.001,
            decay: 0.4,
            sustain: 0.01,
            release: 1.4,
            attackCurve: "exponential"
        }
    }).toDestination();

    // Hi-hat
    const hihat = new Tone.NoiseSynth({
        noise: {
            type: "white"
        },
        envelope: {
            attack: 0.001,
            decay: 0.1,
            sustain: 0.01,
            release: 0.1,
        }
    }).toDestination();

    return [snareBody, snareNoise, kick, hihat];
}



// This function configures the BPM slider
function configBPMSlider() {
    const slider = document.getElementById("bpm-slider");
    const bpmValueLabel = document.getElementById("bpm-value");
    slider.addEventListener("input", function () {
        Tone.Transport.bpm.value = slider.value;
        bpmValueLabel.textContent = slider.value;
    });
}


// Grid creation function
function makeGrid(instruments, columns) { // Added columns parameter
    const rows = [];
    for (const note of instruments) {
        const row = [];
        for (let i = 0; i < columns; i++) { // Use columns instead of a fixed number
            row.push({
                note: note,
                isActive: false
            });
        }
        rows.push(row);
    }
    return rows;
}

// Loop function for playing sequence
function configLoop() {
    const repeat = (time) => {
        grid.forEach((row, index) => {
            if (row[beat].isActive) {
                switch (index) {
                    case 0:  // Snare
                        synths[0].triggerAttackRelease("C4", "8n", time);
                        synths[1].triggerAttackRelease("8n", time);
                        break;
                    case 1:  // Kick
                        synths[2].triggerAttackRelease("C2", "8n", time);
                        break;
                    case 2:  // Hi-hat
                        synths[3].triggerAttackRelease("8n", time);
                        break;
                }
            }
        });
    

        // Change the color of the beat indicator
        const beatIndicators = document.querySelectorAll("#beat-indicator-row .beat-indicator");
        beatIndicators.forEach((indicator, index) => {
            indicator.className = index === beat ? "note beat-indicator beat-indicator-is-active" : "note beat-indicator";
        });

        beat = (beat + 1) % 16; // Adjusted for 16 columns
    };

    Tone.Transport.bpm.value = 120;
    Tone.Transport.scheduleRepeat(repeat, "8n");
}


// Create the visual sequencer in the DOM
function makeSequencer() {
    const sequencer = document.getElementById("sequencer");

    const beatRow = document.createElement("div");
    beatRow.id = "beat-indicator-row";
    beatRow.className = "sequencer-row";
    for (let i = 0; i < 16; i++) {
        const beatIndicator = document.createElement("button");
        beatIndicator.className = "note beat-indicator";
        beatRow.appendChild(beatIndicator);
    }

    grid.forEach((row, rowIndex) => {
        const seqRow = document.createElement("div");
        seqRow.className = "sequencer-row";

        // Create a label for the row
        const noteLabel = document.createElement("div");
        noteLabel.className = "note-label";
        noteLabel.textContent =  instruments[rowIndex][0]; // Using the note name as the label text
        seqRow.appendChild(noteLabel); // Append the label to the row

        row.forEach((note, noteIndex) => {
            const button = document.createElement("button");
            button.className = "note";
            button.addEventListener("click", function (e) {
                handleNoteClick(rowIndex, noteIndex, e);
            });
            seqRow.appendChild(button);
        });
        sequencer.appendChild(seqRow);
    });

    sequencer.appendChild(beatRow);
}


// Handle note click in the sequencer
function handleNoteClick(clickedRowIndex, clickedNoteIndex, e) {
    const note = grid[clickedRowIndex][clickedNoteIndex];
    note.isActive = !note.isActive;
    e.target.className = note.isActive ? "note note-is-active" : "note";
}

// Configure the play/stop button
function configPlayButton() {
    const button = document.getElementById("play-button");
    button.addEventListener("click", (e) => {
        if (!started) {
            Tone.start();
            Tone.getDestination().volume.rampTo(-10, 0.001);
            configLoop();
            started = true;
        }
        if (playing) {
            e.target.innerText = "Play";
            Tone.Transport.stop();
            playing = false;
        } else {
            e.target.innerText = "STOP";
            Tone.Transport.start();
            playing = true;
        }
    });
}



// Initialize the sequencer and the play button
makeSequencer();
configPlayButton();
configBPMSlider();

