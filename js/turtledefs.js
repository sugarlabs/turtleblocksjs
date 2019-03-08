// Copyright (c) 2016-2018 Walter Bender
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the The GNU Affero General Public
// License as published by the Free Software Foundation; either
// version 3 of the License, or (at your option) any later version.
//
// You should have received a copy of the GNU Affero General Public
// License along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA
//

const LOGODEFAULT = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 55 55" style="fill:#ffffff;stroke:#000000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"> <path d="m 53.481267,28.305392 c -0.209367,-1.54431 -0.683684,-3.963142 -2.434581,-4.798755 -1.109828,-0.528975 -7.180267,0.535648 -11.31572,0.588453 0.144519,2.488312 -0.778093,5.155238 -3.939898,9.809475 -1.886409,3.241636 -10.411329,3.515578 -10.800417,3.494271 L 1.4324287,37.296302 c 1.1691172,1.648067 3.6860922,3.761922 6.4671469,4.112101 -0.7457525,0.657744 -3.0978837,3.276679 -3.2729735,6.681202 -0.00463,0.07596 0.00185,0.409469 0,0.409469 l 7.4343649,0 c 0.254761,-1.852802 0.9755,-5.273073 2.895929,-6.51445 1.432215,-0.0083 2.73844,-0.166752 3.757481,-0.1158 2.352131,0.116727 7.112904,-0.04725 10.314545,-0.276067 0.02409,0.01297 0.03891,0.273288 0.06392,0.28811 2.092739,1.107049 2.853314,4.766332 3.119191,6.619133 l 7.434366,0 c -9.27e-4,0 0.0056,-0.333504 9.26e-4,-0.409469 -0.173237,-3.361908 -3.144204,-6.569107 -4.146569,-7.513109 2.836638,-1.260832 7.123094,-5.459279 8.243113,-6.678423 0.294595,-0.318681 1.391453,-1.678638 2.22614,-2.303032 0.782809,-0.584558 3.337822,-0.893976 4.296647,-0.935664 0.960677,-0.04169 3.004317,0.407616 3.004317,0.407616 0,0 0.306638,-2.060315 0.210294,-2.762527 z" style="stroke-width:1.92499995;stroke-miterlimit:4;stroke-dasharray:none" /> <circle cx="59.484001" cy="37.223999" r="1.109" transform="matrix(0.92640065,0,0,0.92640065,-6.9147758,-8.3090122)" style="stroke-width:1.18739116;stroke-miterlimit:4;stroke-dasharray:none" /> <g transform="matrix(1.0320878,0,0,0.99904752,-0.184081,0.02418615)"> <path d="m 10.571891,36.919704 5.798216,-14.14899 -5.012466,-5.534784 c -1.4233734,1.718282 -2.480637,3.711241 -2.8150389,5.046387 -0.451356,1.79814 0,7.96332 0.5856365,10.1437 l -2.8182215,4.571955 4.0512949,-0.148486 z" style="fill:#186dee;fill-opacity:1;stroke-width:1.92499995;stroke-miterlimit:4;stroke-dasharray:none" /> <path d="m 15.827351,23.138991 12.64663,-0.323916 3.118775,-3.975828 c -0.869792,-1.299255 -2.013342,-2.558133 -3.475701,-3.315433 -4.355888,-2.256648 -8.269084,-3.109957 -13.966045,-0.280847 -1.311618,0.652319 -1.961058,1.152293 -2.772806,1.934717 z" style="fill:#ffb504;fill-opacity:1;stroke-width:1.92499995;stroke-miterlimit:4;stroke-dasharray:none" /> <path d="M 28.827609,22.944786 16.350738,23.050047 10.704106,37.127591 29.0947,37.332873 c 3.504125,-0.134986 4.499519,-1.032283 5.462399,-1.962597 z" style="fill:#009a57;fill-opacity:1;stroke-width:1.92499995;stroke-miterlimit:4;stroke-dasharray:none" /> <path d="m 34.981054,23.766238 c 0,0 -2.011809,-2.505097 -3.098182,-4.441418 l -2.902193,3.701262 5.37511,12.556508 c 0.907909,-0.615531 2.256487,-2.511987 2.898435,-3.491812 2.418679,-3.238079 2.693228,-7.998903 2.693228,-7.998903 z" style="fill:#d8432e;fill-opacity:1;stroke-width:1.92499995;stroke-miterlimit:4;stroke-dasharray:none" /> </g> </svg>'
const LOGOJA1 = LOGODEFAULT;
const LOGOJA = LOGODEFAULT;

//.TRANS: put the URL to the guide here, e.g., https://github.com/sugarlabs/turtleblocksjs/tree/master/guide/README.md
var GUIDEURL = _('guide url');

if (GUIDEURL === 'guide url' || GUIDEURL === '') {
    GUIDEURL = 'https://github.com/sugarlabs/turtleblocksjs/tree/master/guide/README.md';
}

const NUMBERBLOCKDEFAULT = 100;

const DEFAULTPALETTE = 'turtle';

const TITLESTRING = _('Turtle Blocks is a Logo-inspired turtle that draws colorful pictures with snap-together visual-programming blocks.');
const VERSION = '2.72';

// We don't include 'extras' since we want to be able to delete
// plugins from the extras palette.
const BUILTINPALETTES = ['search', 'flow', 'action', 'boxes', 'turtle', 'pen', 'number', 'boolean', 'media', 'sensors', 'heap', 'extras', 'myblocks'];

const BUILTINPALETTESFORL23N = [_('search'), _('flow'), _('action'), _('boxes'), _('turtle'), _('pen'), _('number'), _('boolean'), _('media'), _('sensors'), _('heap'), _('extras'), _('myblocks')];

// We put the palette buttons into groups.
const MULTIPALETTES = [['turtle', 'pen', 'media', 'sensors'], ['flow', 'action', 'boxes', 'number', 'boolean', 'heap', 'extras', 'myblocks']];

// Skip these palettes in beginner mode.
const SKIPPALETTES = ['heap', 'extras'];

// Icons used to select between multipalettes.
const MULTIPALETTEICONS = ['artwork', 'logic'];
const MULTIPALETTENAMES = [_('artwork'), _('logic')];


function getMainToolbarButtonNames(name) {
    return (['popdown-palette', 'run', 'step', 'step-music', 'stop-turtle', 'hard-stop-turtle', 'palette', 'help', 'sugarizer-stop', 'beginner', 'advanced', 'planet', 'planet-disabled', 'open', 'save', 'new'].indexOf(name) > -1);
};


function getAuxToolbarButtonNames(name) {
    return (['paste-disabled', 'Cartesian', 'compile', 'utility', 'restore-trash', 'hide-blocks', 'collapse-blocks', 'go-home'].indexOf(name) > -1);
};


function beginnerBlock(name) {
    // Only these blocks appear on the palette in beginner mode.
    return true;
};


function createDefaultStack() {
    DATAOBJS =
	[[0, 'start', screen.width / 3, 100, [null, 1, null]],

         [1, 'repeat', 0, 0, [0, 2, 4, 3]],
         [2, ['number', {'value': 4}], 0, 0, [1]],
         [3, 'hidden', 0, 0, [1, null]],

         [4, 'forward', 0, 0, [1, 5, 6]],
         [5, ['number', {'value': 100}], 0, 0, [4]],
         [6, 'right', 0, 0, [4, 7, null]],
         [7, ['number', {'value': 90}], 0, 0, [6]],
	];
};


function createHelpContent() {
    var language = localStorage.languagePreference;
    if (language == 'ja') {
        var LOGO = LOGOJA;
    } else {
        var LOGO = LOGODEFAULT;
    }

    HELPCONTENT = [
        [_('Welcome to Turtle Blocks'), TITLESTRING, 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(LOGO)))],
        [_('Play'), _('Click the run button to run the project in fast mode.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(RUNBUTTON)))],
        [_('Stop'), _('Stop the turtle.') + ' ' + _('You can also type Alt-S to stop.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(STOPTURTLEBUTTON)))],
        [_('New project'), _('Initialize a new project.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(NEWBUTTON)))],
        [_('Load project from file'), _('You can also load projects from the file system.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(LOADBUTTON)))],
        [_('Save project'), _('Save your project to a file.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(SAVEBUTTON)))],
        [_('Find and share projects'), _('This button opens a viewer for sharing projects and for finding example projects.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(PLANETBUTTON)))],

        [_('Palette buttons'), _('This toolbar contains the palette buttons including Flow Action Pen and more.') + ' ' + _('Click to show the palettes of blocks and drag blocks from the palettes onto the canvas to use them.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(RHYTHMPALETTEICON)))],

        [_('Cartesian/Polar'), _('Show or hide a coordinate grid.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(CARTESIANBUTTON)))],
        [_('Clean'), _('Clear the screen and return the mice to their initial positions.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(CLEARBUTTON)))],
        [_('Collapse'), _('Collapse the graphics window.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(COLLAPSEBUTTON)))],

        [_('Home'), _('Return all blocks to the center of the screen.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(GOHOMEBUTTON)))],
        [_('Show/hide blocks'), _('Hide or show the blocks and the palettes.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(HIDEBLOCKSBUTTON)))],
        [_('Expand/collapse collapsable blocks'), _('Expand or collapse start and action stacks.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(COLLAPSEBLOCKSBUTTON)))],
        [_('Decrease block size'), _('Decrease the size of the blocks.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(SMALLERBUTTON)))],
        [_('Increase block size'), _('Increase the size of the blocks.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(BIGGERBUTTON)))],

        [_('Expand/collapse option toolbar'), _('Click this button to expand or collapse the auxillary toolbar.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(MENUBUTTON)))],
        [_('Run slow'), _('Click to run the project in slow mode.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(SLOWBUTTON)))],
        [_('Run step by step'), _('Click to run the project step by step.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(STEPBUTTON)))],
        [_('Restore'), _('Restore blocks from the trash.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(RESTORETRASHBUTTON)))],
        [_('Select language'), _('Select your language preference.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(LANGUAGEBUTTON)))],

        [_('Keyboard shortcuts'), _('You can type d to create a do block and r to create a re block etc.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(SHORTCUTSBUTTON)))],
        [_('Guide'), _('A detailed guide to Turtle Blocks is available.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(LOGO))), GUIDEURL, _('Turtle Blocks Guide')],
        [_('Help'), _('Show these messages.'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(HELPBUTTON)))],
        [_('About'), _('Turtle Blocks is an open source collection of tools for exploring musical concepts.') + ' ' + _('A full list of contributors can be found in the Turtle Blocks GitHub repository.') + ' ' + _('Turtle Blocks is licensed under the AGPL.') + ' ' + _('The current version is') + ' ' + VERSION, 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(LOGO))), 'https://github.com/sugarlabs/turtleblocksjs', _('Turtle Blocks GitHub repository')],
        [_('Congratulations.'), _('You have finished the tour. Please enjoy Turtle Blocks!'), 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(LOGO)))]
    ];

    BLOCKHELP = {
        // Rhythm palette
        'newnote': [_('The Note block is a container for one or more Pitch blocks.') + ' ' + _('The Note block specifies the duration (note value) of its contents.'), 'documentation', 'note-value-block.svg'],
        'playdrum': [_('You can use multiple Drum blocks within a Note block.'), 'documentation', 'drum-block.svg'],
        'rest2': [_('A rest of the specified note value duration can be constructed using a Silence block.'), 'documentation', 'silence-block.svg'],
        'mynotevalue': [_('The Note value block is the value of the duration of the note currently being played.'), 'documentation', 'on-every-beat-do-block.svg'],
        // Meter palette
        'meter': [_('The beat of the music is determined by the Meter block (by default, 4 1/4 notes per measure).'), 'documentation', 'meter-block.svg'],
        'setmasterbpm2': [_('The Master beats per minute block sets the number of 1/4 notes per minute for every voice.'), 'documentation', 'master-beats-per-minute-block.svg'],
        'setbpm3': [_('The Beats per minute block sets the number of 1/4 notes per minute.'), 'documentation', 'beats-per-minute-block.svg'],
        'everybeatdo': [_('The On-every-beat block let you specify actions to take on every beat.'), 'documentation', 'on-every-beat-do-block.svg'],
        'beatvalue': [_('The Beat count block is the number of the current beat,') + ' ' + _('e.g., 1, 2, 3, or 4.') + ' ' + _('In the figure, it is used to take an action on the first beat of each measure.'), 'documentation', 'on-every-beat-do.svg'],
        'elapsednotes2': [_('The Notes played block is the number of notes that have been played.') + ' ' + _('(By default, it counts quarter notes.)'), 'documentation', 'on-every-beat-do.svg'],
        // Pitch palette
        'pitch': [_('The Pitch block specifies the pitch name and octave of a note that together determine the frequency of the note.'), 'documentation', 'note-value-block.svg'],
        'solfege': [_('Pitch can be specified in terms of do re mi fa sol la ti.'), 'documentation', 'note-value-block.svg'],
        'notename': [_('Pitch can be specified in terms of C D E F G A B.'), 'documentation', 'note-name-block.svg'],
        'steppitch': [_('The Scaler Step block (in combination with a Number block) will play the next pitch in a scale,') + ' ' + _('e.g., if the last note played was sol, Scalar Step 1 will play la.'), 'documentation', 'set-key-block.svg'],
        'hertz': [_('The Hertz block (in combination with a Number block) will play a sound at the specified frequency.'), 'documentation', 'hertz-block.svg'],
        'setscalartransposition': [_('The Scalar transposition block will shift the pitches contained inside Note blocks up (or down) the scale.') + ' ' + _('In the example shown above, sol is shifted up to la.'), 'documentation', 'scalar-transpose-block.svg'],
        'pitchinhertz': [_('The Pitch in Hertz block is the value in Hertz of the pitch of the note currently being played.'), 'documentation', 'status-block.svg'],
        'mypitch': [_('The Pitch number block is the value of the pitch of the note currently being played.'), 'documentation', 'on-every-beat-do-block.svg'],
        // Intervals palette
        'setkey2': [_('The Set key block is used to set the key and mode,') + ' ' + _('e.g., C Major'), 'documentation', 'set-key-block.svg'],
        'modelength': [_('The Mode length block is the number of notes in the current scale.') + ' ' + _('Most Western scales have 7 notes.'), 'documentation', 'set-key-block.svg'],
        'interval': [_('The Scalar interval block calculates a relative interval based on the current mode, skipping all notes outside of the mode.') + ' ' + _('In the figure, we add la to sol.'), 'documentation', 'scalar-interval-block.svg'],
        'settemperament': [_('The Set temperament block is used to choose the tuning system used by Music Blocks.'), 'documentation', 'set-temperament-block.svg'],
        // Tone palette
        'settimbre': [_('The Set timbre block selects a voice for the synthesizer,') + ' ' + _('e.g., guitar, piano, violin, or cello.'), 'documentation', 'start-block.svg'],
        'newstaccato': [_('The Staccato block shortens the length of the actual note while maintaining the specified rhythmic value of the notes.'), 'documentation', 'staccato-block.svg'],
        'newslur': [_('The Slur block lengthens the sustain of notes while maintaining the specified rhythmic value of the notes.'), 'documentation', 'slur-block.svg'],
        'vibrato': [_('The Vibrato block adds a rapid, slight variation in pitch.'), 'documentation', 'vibrato-block.svg'],
        'neighbor2': [_('The Neighbor block rapidly switches between neighboring pitches.'), 'documentation', 'neighbor-block.svg'],
        // Volume palette
        'crescendo': [_('The Crescendo block will increase the volume of the contained notes by a specified amount for every note played.') + ' ' + _('For example, if you have 7 notes in sequence contained in a Crescendo block with a value of 5, the final note will be at 35% more than the starting volume.'), 'documentation', 'crescendo-block.svg'],
        'decrescendo': [_('The Decrescendo block will decrease the volume of the contained notes by a specified amount for every note played.') + ' ' + _('For example, if you have 7 notes in sequence contained in a Decrescendo block with a value of 5, the final note will be at 35% less than the starting volume.'), 'documentation', 'decrescendo-block.svg'],
        'setsynthvolume': [_('The Set synth volume block will change the volume of a particular synth,') + ' ' + _('e.g., guitar, violin, snare drum, etc.') + ' ' + _('The default volume is 50; the range is 0 (silence) to 100 (full volume).'), 'documentation', 'start-block.svg'],
        'setnotevolume': [_('The Set master volume block sets the volume for all synthesizers.'), 'documentation', 'status.svg'],
        // Drum palette
        // 'playdrum' is described on the Rhythm palette.
        'setdrum': [_('The Set drum block will select a drum sound to replace the pitch of any contained notes.') + ' ' + _('In the example above, a kick drum sound will be played instead of sol.'), 'documentation', 'rhythm-ruler-block.svg'],
        // Widgets palette
        'status': [_('The Status block opens a tool for inspecting the status of Music Blocks as it is running.'), 'documentation', 'status-block.svg'],
        'matrix': [_('The Pitch-time Matrix block opens a tool to create musical phrases.'), 'documentation', 'pitch-time-matrix-block.svg'],
        'rhythmruler2': [_('The Rhythm Maker block opens a tool to create drum machines.'), 'documentation', 'rhythm-ruler-block.svg'],
        'pitchslider': [_('The Pitch-slider block opens a tool to generate arbitray pitches.'), 'documentation', 'pitch-slider-block.svg'],
        'rhythm2': [_('The Rhythm block is used to generate rhythm patterns.'), 'documentation', 'rhythm-ruler-block.svg'],
        'stuplet': [_('Tuplets are a collection of notes that get scaled to a specific duration.') + ' ' + _('Using tuplets makes it easy to create groups of notes that are not based on a power of 2.'), 'documentation', 'pitch-time-matrix-block.svg'],
        'musickeyboard': [_('The Music keyboard block opens a piano keyboard that can be used to create notes.'), 'documentation', 'music-keyboard-block.svg'],
        'tempo': [_('The Tempo block opens a metronome to visualize the beat.'), 'documentation', 'tempo-block.svg'],
        'modewidget': [_('The Custom mode block opens a tool to explore musical mode (the spacing of the notes in a scale).'), 'documentation', 'custom-mode-block.svg'],
        // Flow palette
        'repeat': [_('The Repeat block will repeat the contained blocks.') + ' ' + _('In this example the note will be played 4 times.'), 'documentation', 'repeat-block.svg'],
        'forever': [_('The Forever block will repeat the contained blocks forever.') + ' ' + _('In this example, a simple drum machine, a kick drum will play 1/4 notes forever.'), 'documentation', 'forever-block.svg'],
        'if':  [_('Conditionals lets your program take different actions depending on the condition.') + ' ' + _('In this example, if the mouse button is pressed, a snare drum will play.') + ' ' + _('Otherwise (else) a kick drum will play.'), 'documentation', 'conditional-block.svg'],
        'ifthenelse': [_('Conditionals lets your program take different actions depending on the condition.') + ' ' + _('In this example, if the mouse button is pressed, a snare drum will play.') + ' ' + _('Otherwise (else) a kick drum will play.'), 'documentation', 'conditional-block.svg'],
        'backward': [_('The Backward block runs code in reverse order (Musical retrograde).'), 'documentation', 'box-1-block.svg'],
        // Action palette
        'action': [_('The Action block is used to group together blocks so that they can be used more than once.') + ' ' + _('It is often used for storing a phrase of music that is repeated.'), 'documentation', 'action-block.svg'],
        'start': [_('Each Start block is a separate turtle.') + ' ' + _('All of the Start blocks run at the same time when the Play button is pressed.'), 'documentation', 'repeat-block.svg'],
        'listen': [_('The Listen block is used to listen for an event such as a mouse click.') + ' ' + _('When the event happens, an action is taken.'), 'documentation', 'broadcast-block.svg'],
        'dispatch': [_('The Dispatch block is used to trigger an event.'), 'documentation', 'broadcast.svg'],
        'do': [_('The Do block is used to initiate an action.') + ' ' + _('In the example, it is used with the One of block to choose a random phase.'), 'documentation', 'do-block.svg'],
        // Boxes palette
        'storebox1': [_('The Store in Box 1 block is used to store a value in Box 1.'), 'documentation', 'box-1-block.svg'],
        'box1': [_('The Box 1 block returns the value stored in Box 1.'), 'documentation', 'box-1-block.svg'],
        'storebox2': [_('The Store in Box 2 block is used to store a value in Box 2.'), 'documentation', 'box-2-block.svg'],
        'box2': [_('The Box 2 block returns the value stored in Box 2.'), 'documentation', 'box-2-block.svg'],
        'increment': [_('The Add-to block is used to add to the value stored in a box.') + ' ' + _('It can also be used with other blocks, such as Color, Pen-size.') + ' ' + _('etc.'), 'documentation', 'box-2-block.svg'],
        'incrementOne': [_('The Add-1-to block adds one to the value stored in a box.'), 'documentation', 'box-1-block.svg'],
        // Number palette
        'number': [_('The Number block holds a number.'), 'documentation', 'repeat-block.svg'],
        'random': [_('The Random block returns a random number.'), 'documentation', 'random-block.svg'],
        'oneOf': [_('The One-of block returns one of two choices.'), 'documentation', 'one-of-block.svg'],
        'plus': [_('The Plus block is used to add.'), 'documentation', 'scalar-transpose-block.svg'],
        'minus': [_('The Minus block is used to subtract.'), 'documentation', ''],
        'multiply': [_('The Multiply block is used to multiply.'), 'documentation', 'scalar-transpose-block.svg'],
        'divide': [_('The Divide block is used to divide.'), 'documentation', 'note-value-block.svg'],
        // Boolean palette
        'greater': [_('The Greater-than block returns True if the top number is greater than the bottom number.'), 'documentation', 'box-2-block.svg'],
        'less': [_('The Less-than block returns True if the top number is less than the bottom number.'), 'documentation', 'box-2-block.svg'],
        'equal': [_('The Equal block returns True if the two numbers are equal.'), 'documentation', 'box-1-block.svg'],
        // Mouse palette
        'forward': [_('The Forward block moves the mouse forward.'), 'documentation', 'forward-block.svg'],
        'back': [_('The Back block moves the mouse backward.'), 'documentation', 'forward-block.svg'],
        'left': [_('The Left block turns the mouse to the left.'), 'documentation', 'forward-block.svg'],
        'right': [_('The Right block turns the mouse to the right.'), 'documentation', 'forward-block.svg'],
        'arc': [_('The Arc block moves the mouse in a arc.'), 'documentation', 'arc-block.svg'],
        'setxy': [_('The Set XY block moves the mouse to a specific position on the screen.'), 'documentation', 'mouse-button-block.svg'],
        'scrollxy': [_('The Scroll XY block moves the canvas.'), 'documentation', 'on-every-beat-do-block.svg'],
        'x': [_('The X block returns the horizontal position of the mouse.'), 'documentation', 'x-block.svg'],
        'y': [_('The Y block returns the vertical position of the mouse.'), 'documentation', 'x-block.svg'],
        'heading': [_('The Heading block returns the orientation of the mouse.'), 'documentation', 'status.svg'],
        // Pen palette
        'setpensize': [_('The Set-pen-size block changes the size of the pen.'), 'documentation', 'set_color-block.svg'],
        'penup': [_('The Pen-up block raises the pen so that it does not draw.'), 'documentation', 'mouse-button-block.svg'],
        'pendown': [_('The Pen-down block lowers the pen so that it draws.'), 'documentation', 'mouse-button-block.svg'],
        'color': [_('The Color block returns the current pen color.'), 'documentation', 'set-color-block.svg'],
        'setcolor': [_('The Set-color block changes the pen color.'), 'documentation', 'set-color-block.svg'],
        // Media palette
        'print': [_('The Print block displays text at the top of the screen.'), 'documentation', 'print-block.svg'],
        'text': [_('The Text block holds a text string.'), 'documentation', 'show-block.svg'],
        'media': [_('The Media block is used to import an image.'), 'documentation', 'avatar-block.svg'],
        'show': [_('The Show block is used to display text or images on the canvas.'), 'documentation', 'show-block.svg'],
        'turtleshell': [_('The Shell block is used to change the appearance of the mouse.'), 'documentation', 'avatar-block.svg'],
        'speak': [_('The Speak block outputs to the text-to-speech synthesizer'), 'documentation', 'speak-block.svg'],
        'height': [_('The Height block returns the height of the canvas.'), 'documentation', 'width-block.svg'],
        'width': [_('The Width block returns the width of the canvas.'), 'documentation', 'width-block.svg'],
        'toppos': [_('The Top block returns the position of the top of the canvas.'), 'documentation', 'width-block.svg'],
        'bottompos': [_('The Bottom block returns the position of the bottom of the canvas.'), 'documentation', 'x-block.svg'],
        'leftpos': [_('The Left block returns the position of the left of the canvas.'), 'documentation', 'x-block.svg'],
        'rightpos': [_('The Right block returns the position of the right of the canvas.'), 'documentation', 'width-block.svg'],
        // Sensors palette
        'mousebutton': [_('The Mouse-button block returns True if the mouse button is pressed.'), 'documentation', 'mouse-button-block.svg'],
        'mousex': [_('The Cursor X block returns the horizontal position of the mouse.'), 'documentation', 'mouse-button-block.svg'],
        'mousey': [_('The Cursor Y block returns the vertical position of the mouse.'), 'documentation', 'mouse-button-block.svg'],
        'click': [_('The Click block returns True if a mouse has been clicked.'), 'documentation', 'click-block.svg'],
        // Mice palette
        'setturtlename2': [_('The Set-name block is used to name a mouse.'), 'documentation', 'click-block.svg'],
        'turtlename': [_('The Mouse-name block returns the name of a mouse.'), 'documentation', 'click-block.svg'],
        // Advanced blocks
        // Rhythm palette
        'rhythmic2dot': [_('The Dot block extends the duration of a note by 50%.') + ' ' + _('E.g., a dotted quarter note will play for 3/8 (1/4 + 1/8) of a beat.'), 'documentation', 'status.svg'],
        'tie': [_('The Tie block works on pairs of notes, combining them into one note.'), 'documentation', 'status.svg'],
        'multiplybeatfactor': [_('The Multiply note value block changes the duration of notes by changing their note values.'), 'documentation', 'status.svg'],
        'skipnotes': [_('The Skip notes block will cause notes to be skipped.'), 'documentation', 'status.svg'],
        'newswing2': [_('The Swing block works on pairs of notes (specified by note value), adding some duration (specified by swing value) to the first note and taking the same amount from the second note.'), 'documentation', 'status.svg'],
        'osctime': [_('The Milliseconds block is similar to a Note block except that it uses time (in MS) to specify the note duration.'), 'documentation', 'status.svg'],
        // Meter palette
        'pickup': [_('The Pickup block is used to accommodate any notes that come in before the beat.'), 'documentation', 'status.svg'],
        'bpm': [_('The Beats per minute block changes the beats per minute of any contained notes.'), 'documentation', 'status.svg'],
        'onbeatdo': [_('The On-strong-beat block let you specify actions to take on specified beats.'), 'documentation', 'onstrongbeatdo.svg'],
        'offbeatdo': [_('The On-weak-beat block let you specify actions to take on weak (off) beats.'), 'documentation', 'onweakbeatdo.svg'],
        'no-clock': [_('The No clock block decouples the notes from the master clock.'), 'documentation', 'no-clock.svg'],
        'elapsednotes': [_('The Whole notes played block returns the total number of whole notes played.'), 'documentation', 'status.svg'],
        'notecounter': [_('The Note counter block can be used to count the number of contained notes.'), 'documentation', 'status.svg'],
        'measurevalue': [_('The Measure count block returns the current measure.'), 'documentation', 'status.svg'],
	'bpmfactor': [_('The Beats per minute block returns the current beats per minute.'), 'documentation', 'status.svg'],
        // 'beatfactor': [_(''), 'documentation', 'status.svg'],
        // pitch palette
        'accidental': [_('The Accidental block is used to create sharps and flats'), 'documentation', 'accidental.svg'],
        'settransposition': [_('The Semi-tone transposition block will shift the pitches contained inside Note blocks up (or down) by half steps.') + ' ' + _('In the example shown above, sol is shifted up to sol#.'), 'documentation', 'settransposition.svg'],
        'register': [_('The Register block provides an easy way to modify the register (octave) of the notes that follow it.'), 'documentation', 'status.svg'],
        'invert1': [_('The Invert block rotates any contained notes around a target note.'), 'documentation', 'status.svg'],
        'deltapitch': [_('The Change in pitch block is the difference (in half steps) between the current pitch being played and the previous pitch played.'), 'documentation', 'deltapitch.svg'],
        '// customNote': ['', 'documentation', 'status.svg'],
	//.TRANS: 'ni', 'dha', 'pa', 'ma', 'ga', 're', 'sa' are East Indian note names.
        'eastindiansolfege': [_('Pitch can be specified in terms of ni dha pa ma ga re sa.'), 'documentation', 'status.svg'],
        'accidentalname': [_('The Accidental selector block is used to choose between double-sharp, sharp, natural, flat, and double-flat.'), 'documentation', 'accidental.svg'],
        'number2octave': [_('The Number to octave block will convert a pitch number to an octave.'), 'documentation', 'status.svg'],
        'setpitchnumberoffset': [_('The Set pitch number offset block is used to set the offset for mapping pitch numbers to pitch and octave.'), 'documentation', 'status.svg'],
        'consonantstepsizeup': [_('The Scalar step up block returns the number of semi-tones up to the next note in the current key and mode.'), 'documentation', 'status.svg'],
        'consonantstepsizedown': [_('The Scalar step down block returns the number of semi-tones down to the previous note in the current key and mode.'), 'documentation', 'status.svg'],
        // Intervals palette
        'movable': [_('When Moveable do is false, the solfege note names are always tied to specific pitches,') + ' ' + _('e.g. "do" is always "C-natural"); when Moveable do is true, the solfege note names are assigned to scale degrees ("do" is always the first degree of the major scale).'), 'documentation', 'movable.svg'],
        'definemode': [_('The Define mode block allows you define a custom mode by specifiying pitch numbers.'), 'documentation', 'status.svg'],
        'semitoneinterval': [_('The Semi-tone interval block calculates a relative interval based on half steps.') + ' ' + _('In the figure, we add sol# to sol.'), 'documentation', 'semitoneinterval.svg'],
        'measureintervalscalar': [_('The Scalar interval block measures the distance between two notes in the current key and mode.'), 'documentation', 'status.svg'],
        'measureintervalsemitones': [_('The Scalar interval block measures the distance between two notes in semi-tones.'), 'documentation', 'status.svg'],
        'doubly': [_('The Doubly block will double the size of an interval.'), 'documentation', 'status.svg'],
        // Tone palette
        'voicename': [_('The Set timbre block selects a voice for the synthesizer,') + ' ' + _('e.g., guitar, piano, violin, or cello.'), 'documentation', 'settimbre.svg'],
        'chorus': [_('The Chorus block adds a chorus effect.'), 'documentation', 'chorus.svg'],
        'phaser': [_('The Phaser block adds a sweeping sound.'), 'documentation', 'phaser.svg'],
        'dis': [_('The Distortion block adds distortion to the pitch.'), 'documentation', 'distortion.svg'],
        'tremolo': [_('The Tremolo block adds a wavering effect.'), 'documentation', 'tremolo.svg'],
        'harmonic2': [_('The Harmonic block will add harmonics to the contained notes.'), 'documentation', 'status.svg'],
        'harmonic': [_('The Weighted partials block is used to specify the partials associated with a timbre.'), 'documentation', 'status.svg'],
        'partial': [_('The Partial block is used to specify a weight for a specific partical harmonic.'), 'documentation', 'status.svg'],
        'fmsynth': [_('The FM synth block is a frequency modulator used to define a timbre.'), 'documentation', 'status.svg'],
        'amsynth': [_('The AM synth block is an amplitude modulator used to define a timbre.'), 'documentation', 'status.svg'],
        'duosynth': [_('The Duo synth block is a duo-frequency modulator used to define a timbre.'), 'documentation', 'status.svg'],
        // Volume palette
        'articulation': [_('The Set relative volume block changes the volume of the contained notes.'), 'documentation', 'status.svg'],
        'notevolumefactor': [_('The Note volume block returns the current volume of the current synthesizer.'), 'documentation', 'status.svg'],
        // Drum palette
        'playnoise': [_('The Play noise block will generate white, pink, or brown noise.'), 'documentation', 'status.svg'],
        'drumname': [_('The Drum name block is used to select a drum.'), 'documentation', 'status.svg'],
        'noisename': [_('The Noise name block is used to select a noise synthesizer.'), 'documentation', 'status.svg'],
        // Widgets palette
        'pitchstaircase': [_('The Pitch staircase tool to is used to generate pitches from a given ratio.'), 'documentation', 'status.svg'],
        'pitchdrummatrix': [_('The Pitch drum matrix is used to map pitches to drum sounds.'), 'documentation', 'status.svg'],
        'temperament': [_('The Temperament tool is used to define custom tuning.'), 'documentation', 'status.svg'],
        'temperamentname': [_('The Temperament name block is used to select a tuning method.'), 'documentation', 'status.svg'],
        'tuplet4': [_('The Tuplet block is used to generate a group of notes played in a condensed amount of time.'), 'documentation', 'status.svg'],
        // Flow palette
        'while': [_('The While block will repeat while the condition is true.'), 'documentation', 'status.svg'],
        'until': [_('The Until block will repeat until the condition is true.'), 'documentation', 'status.svg'],
        'waitfor': [_('The Waitfor block will wait until the condition is true.'), 'documentation', 'status.svg'],
        'break': [_('The Stop block will stop a loop') + ': ' + _('Forever, Repeat, While, or Until.'), 'documentation', 'status.svg'],
        'switch': [_('The Switch block will run the code in the matchin Case.'), 'documentation', 'status.svg'],
        'case': [_('The Case block is used inside of a Switch to define matches.'), 'documentation', 'status.svg'],
        'default': [_('The Default block is used inside of a Switch to define a default action.'), 'documentation', 'status.svg'],
        'duplicatenotes': [_('The Duplicate block will run each block multiple times.') + ' ' + _('The output of the example is: Sol, Sol, Sol, Sol, Re, Re, Re, Re, Sol, Sol, Sol, Sol.'), 'documentation', 'status.svg'],
        // Action palette
        'arg': [_('The Arg block contains the value of an argument passed to an action.'), 'documentation', 'status.svg'],
        'namedarg': [_('The Arg block contains the value of an argument passed to an action.'), 'documentation', 'status.svg'],
        'calcArg': [_('The Calculate block returns a value calculated by an action.'), 'documentation', 'status.svg'],
        'doArg': [_('The Do block is used to initiate an action.'), 'documentation', 'status.svg'],
        'namedCalcArg': [_('The Calculate block returns a value calculated by an action.'), 'documentation', 'status.svg'],
        'nameddoArg': [_('The Do block is used to initiate an action.'), 'documentation', 'status.svg'],
        'namedcalc': [_('The Calculate block returns a value calculated by an action.'), 'documentation', 'status.svg'],
        'calc': [_('The Calculate block returns a value calculated by an action.'), 'documentation', 'status.svg'],
        'returnToUrl': [_('The Return to URL block will return a value to a webpage.'), 'documentation', 'status.svg'],
        'return': [_('The Return block will return a value from an action.'), 'documentation', 'status.svg'],
        // Boxes palette
        'storein': [_('The Store in block will store a value in a box.'), 'documentation', 'status.svg'],
        'storein2': [_('The Store in block will store a value in a box.'), 'documentation', 'status.svg'],
        'namedbox': [_('The Box block returns the value stored in a box.'), 'documentation', 'status.svg'],
        // Number palette
        'abs': [_('The Abs block returns the absolute value.'), 'documentation', 'status.svg'],
        'sqrt': [_('The Sqrt block returns the square root.'), 'documentation', 'status.svg'],
        'power': [_('The Power block calculates a power function.'), 'documentation', 'status.svg'],
        'mod': [_('The Mod block returns the remainder from a division.'), 'documentation', 'status.svg'],
        'int': [_('The Int block returns an integer.'), 'documentation', 'status.svg'],
        // Boolean palette
        'not': [_('The Not block is the logical not operator.'), 'documentation', 'status.svg'],
        'and': [_('The And block is the logical and operator.'), 'documentation', 'status.svg'],
        'or': [_('The Or block is the logical or operator.'), 'documentation', 'status.svg'],
        'boolean': [_('The Boolean block is used to specify true or false.'), 'documentation', 'status.svg'],
        // Heap palette
        'push': [_('The Push block adds a value to the top of the heap.'), 'documentation', 'status.svg'],
        'pop': [_('The Pop block removes the value at the top of the heap.'), 'documentation', 'status.svg'],
        'setHeapEntry': [_('The Setheapentry block sets a value in he heap at the specified location.'), 'documentation', 'status.svg'],
        'indexHeap': [_('The Indexheap block returns a value in the heap at a specified location.'), 'documentation', 'status.svg'],
        'reverseHeap': [_('The Reverseheap block reverses the order of the heap.'), 'documentation', 'status.svg'],
        'loadHeap': [_('The Loadheap block loads the heap from a file.'), 'documentation', 'status.svg'],
        'saveHeap': [_('The Saveheap block saves the heap to a file.'), 'documentation', 'status.svg'],
        'emptyHeap': [_('The Emptyheap block empties the heap.'), 'documentation', 'status.svg'],
        'heapEmpty': [_('The Heap empty? block returns true if the heap is emptry.'), 'documentation', 'status.svg'],
        'heapLength': [_('The Heap length block returns the length of the heap.'), 'documentation', 'status.svg'],
        'showHeap': [_('The Show heap block displays the contents of the heap at the top of the screen.'), 'documentation', 'status.svg'],
        'saveHeapToApp': [_('The Save heap to app block saves the heap to a web page.'), 'documentation', 'status.svg'],
        'loadHeapFromApp': [_('The Load heap from app block loads the heap from a web page.'), 'documentation', 'status.svg'],
        // Extras palette
        'comment': [_('The Comment block prints a comment at the top of the screen when the program is running in slow mode.'), 'documentation', 'status.svg'],
        'wait': [_('The Wait block pauses the program for a specified number of seconds.'), 'documentation', 'status.svg'],
        'vspace': [_('The Space block is used to add space between blocks.'), 'documentation', 'status.svg'],
        'hspace': [_('The Space block is used to add space between blocks.'), 'documentation', 'status.svg'],
        'openproject': [_('The Open project block is used to open a project from a web page.'), 'documentation', 'status.svg'],
        'hideblocks': [_('The Hide blocks block hides the blocks.'), 'documentation', 'status.svg'],
        'showblocks': [_('The Show blocks block shows the blocks.'), 'documentation', 'status.svg'],
        'nobackground': [_('The No background block eliminates the background from the saved SVG output.'), 'documentation', 'status.svg'],
        'makeblock': [_('The Make block block creates a new block.'), 'documentation', 'status.svg'],
        'dockblock': [_('The Dock block block connections two blocks.'), 'documentation', 'status.svg'],
        'runblock': [_('The Run block block runs a block.'), 'documentation', 'status.svg'],
        'moveblock': [_('The Move block block moves a block.'), 'documentation', 'status.svg'],
        'deleteblock': [_('The Delete block block removes a block.'), 'documentation', 'status.svg'],
        'openpalette': [_('The Open palette block opens a palette.'), 'documentation', 'status.svg'],
        // Graphics palette
        'setheading': [_('The Set heading block sets the heading of the mouse.'), 'documentation', 'status.svg'],
        'bezier': [_('The Bezier block draws a Bezier curve.'), 'documentation', 'status.svg'],
        'controlpoint1': [_('The Control-point 1 block sets the first control point for the Bezier curve.'), 'documentation', 'status.svg'],
        'controlpoint1': [_('The Control-point 2 block sets the second control point for the Bezier curve.'), 'documentation', 'status.svg'],
        // Pen palette
        'sethue': [_('The Set hue block changes the color of the pen.'), 'documentation', 'status.svg'],
        'setgrey': [_('The Set grey block changes the vividness of the pen color.'), 'documentation', 'status.svg'],
        'settranslucency': [_('The Set translucency block changes the opacity of the pen.'), 'documentation', 'status.svg'],
        'fill': [_('The Fill block fills in a shape with a color.'), 'documentation', 'status.svg'],
        'hollowline': [_('The Hollow line block creates a line with a hollow center.'), 'documentation', 'status.svg'],
        'fillscreen': [_('The Background block sets the background color.'), 'documentation', 'status.svg'],
	'grey': [_('The Grey block returns the current pen grey value.'), 'documentation', 'status.svg'],
	'shade': [_('The Shade block returns the current pen shade value.'), 'documentation', 'status.svg'],
	'pensize': [_('The Pen size block returns the current pen size value.'), 'documentation', 'status.svg'],
        'setfont': [_('The Set font block sets the font used by the Show block.'), 'documentation', 'status.svg'],
        // Media
        'tofrequency': [_('The To frequency block converts a pitch name and octave to Hertz.'), 'documentation', 'status.svg'],
        'stopvideocam': [_('The Stop media block stops audio or video playback.'), 'documentation', 'status.svg'],
        'loadFile': [_('The Open file block opens a file for use with the Show block.'), 'documentation', 'status.svg'],
        'video': [_('The Video block selects video for use with the Show block.'), 'documentation', 'status.svg'],
        'camera': [_('The Camera block connects a webcam to the Show block.'), 'documentation', 'status.svg'],
        // 'playback': [_('The Playback block'), 'documentation', 'status.svg'],
        // 'stopplayback': [_('The Stopplayback block'), 'documentation', 'status.svg'],
        // Sensors palette
        'keyboard': [_('The Keyboard block returns computer keyboard input.'), 'documentation', 'status.svg'],
        'toascii': [_('The To ASCII block converts numbers to letters.'), 'documentation', 'status.svg'],
        'time': [_('The Time block returns the number of seconds that the program has been running.'), 'documentation', 'status.svg'],
        'getcolorpixel': [_('The Get pixel block returns the color of the pixel under the mouse.'), 'documentation', 'status.svg'],
        'getred': [_('The Get red block returns the red component of the pixel under the mouse.'), 'documentation', 'status.svg'],
	'getgreen': [_('The Get green block returns the green component of the pixel under the mouse.'), 'documentation', 'status.svg'],
	'getblue': [_('The Get blue block returns the blue component of the pixel under the mouse.'), 'documentation', 'status.svg'],
        'loudness': [_('The Loudness block returns the volume detected by the microphone.'), 'documentation', 'status.svg'],
        // Ensemble palette
        'newturtle': [_('The New mouse block will create a new mouse.'), 'documentation', 'status.svg'],
        'foundturtle': [_('The Found mouse block will return true if the specified mouse can be found.'), 'documentation', 'status.svg'],
        'turtlesync': [_('The Mouse sync block aligns the beat count between mice.'), 'documentation', 'status.svg'],
        'turtlenote2': [_('The Mouse note block returns the current note value being played by the specified mouse.'), 'documentation', 'status.svg'],
        'turtlepitch': [_('The Mouse pitch block returns the current pitch number being played by the specified mouse.'), 'documentation', 'status.svg'],
        'turtleelapsenotes': [_('The Mouse elapse notes block returns the number of notes played by the specified mouse.'), 'documentation', 'status.svg'],
        'xturtle': [_('The X mouse block returns the X position of the specified mouse.'), 'documentation', 'status.svg'],
        'yturtle': [_('The Y mouse block returns the Y position of the specified mouse.'), 'documentation', 'status.svg'],
        'setturtle': [_('The Set mouse block sends a stack of blocks to be run by the specified mouse.'), 'documentation', 'status.svg'],
        'turtleheading': [_('The Mouse heading block returns the heading of the specified mouse.'), 'documentation', 'status.svg'],
        'turtlecolor': [_('The Mouse color block returns the pen color of the specified mouse.'), 'documentation', 'status.svg'],
        'startturtle': [_('The Start mouse block starts the specified mouse.'), 'documentation', 'status.svg'],
        'stopturtle': [_('The Stop mouse block stops the specified mouse.'), 'documentation', 'status.svg'],
    }
};
