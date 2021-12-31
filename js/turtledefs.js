// Copyright (c) 2016-2021 Walter Bender
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

/*
   global

   _, ADVANCEDBUTTON, BIGGERBUTTON, CARTESIANBUTTON, CLEARBUTTON,
   COLLAPSEBLOCKSBUTTON, COLLAPSEBUTTON, GOHOMEBUTTON, HELPBUTTON,
   HIDEBLOCKSBUTTON, LANGUAGEBUTTON, LOADBUTTON, MENUBUTTON,
   NEWBUTTON, PLANETBUTTON, PLUGINSDELETEBUTTON, RESTORETRASHBUTTON,
   RHYTHMPALETTEICON, RUNBUTTON, SAVEBUTTON, SCROLLUNLOCKBUTTON,
   SHORTCUTSBUTTON, SLOWBUTTON, SMALLERBUTTON, STATSBUTTON,
   STEPBUTTON, STOPTURTLEBUTTON, WRAPTURTLEBUTTON
*/

/* exported

   createDefaultStack, createHelpContent, LOGOJA1, NUMBERBLOCKDEFAULT,
   DEFAULTPALETTE, BUILTINPALETTES, MULTIPALETTES, SKIPPALETTES,
   MULTIPALETTEICONS, MULTIPALETTENAMES, HELPCONTENT, DATAOBJS,
   BUILTINPALETTESFORL23N, getMainToolbarButtonNames,
   getAuxToolbarButtonNames
 */

const LOGODEFAULT = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 55 55" style="fill:#ffffff;stroke:#000000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"> <path d="m 53.481267,28.305392 c -0.209367,-1.54431 -0.683684,-3.963142 -2.434581,-4.798755 -1.109828,-0.528975 -7.180267,0.535648 -11.31572,0.588453 0.144519,2.488312 -0.778093,5.155238 -3.939898,9.809475 -1.886409,3.241636 -10.411329,3.515578 -10.800417,3.494271 L 1.4324287,37.296302 c 1.1691172,1.648067 3.6860922,3.761922 6.4671469,4.112101 -0.7457525,0.657744 -3.0978837,3.276679 -3.2729735,6.681202 -0.00463,0.07596 0.00185,0.409469 0,0.409469 l 7.4343649,0 c 0.254761,-1.852802 0.9755,-5.273073 2.895929,-6.51445 1.432215,-0.0083 2.73844,-0.166752 3.757481,-0.1158 2.352131,0.116727 7.112904,-0.04725 10.314545,-0.276067 0.02409,0.01297 0.03891,0.273288 0.06392,0.28811 2.092739,1.107049 2.853314,4.766332 3.119191,6.619133 l 7.434366,0 c -9.27e-4,0 0.0056,-0.333504 9.26e-4,-0.409469 -0.173237,-3.361908 -3.144204,-6.569107 -4.146569,-7.513109 2.836638,-1.260832 7.123094,-5.459279 8.243113,-6.678423 0.294595,-0.318681 1.391453,-1.678638 2.22614,-2.303032 0.782809,-0.584558 3.337822,-0.893976 4.296647,-0.935664 0.960677,-0.04169 3.004317,0.407616 3.004317,0.407616 0,0 0.306638,-2.060315 0.210294,-2.762527 z" style="stroke-width:1.92499995;stroke-miterlimit:4;stroke-dasharray:none" /> <circle cx="59.484001" cy="37.223999" r="1.109" transform="matrix(0.92640065,0,0,0.92640065,-6.9147758,-8.3090122)" style="stroke-width:1.18739116;stroke-miterlimit:4;stroke-dasharray:none" /> <g transform="matrix(1.0320878,0,0,0.99904752,-0.184081,0.02418615)"> <path d="m 10.571891,36.919704 5.798216,-14.14899 -5.012466,-5.534784 c -1.4233734,1.718282 -2.480637,3.711241 -2.8150389,5.046387 -0.451356,1.79814 0,7.96332 0.5856365,10.1437 l -2.8182215,4.571955 4.0512949,-0.148486 z" style="fill:#186dee;fill-opacity:1;stroke-width:1.92499995;stroke-miterlimit:4;stroke-dasharray:none" /> <path d="m 15.827351,23.138991 12.64663,-0.323916 3.118775,-3.975828 c -0.869792,-1.299255 -2.013342,-2.558133 -3.475701,-3.315433 -4.355888,-2.256648 -8.269084,-3.109957 -13.966045,-0.280847 -1.311618,0.652319 -1.961058,1.152293 -2.772806,1.934717 z" style="fill:#ffb504;fill-opacity:1;stroke-width:1.92499995;stroke-miterlimit:4;stroke-dasharray:none" /> <path d="M 28.827609,22.944786 16.350738,23.050047 10.704106,37.127591 29.0947,37.332873 c 3.504125,-0.134986 4.499519,-1.032283 5.462399,-1.962597 z" style="fill:#009a57;fill-opacity:1;stroke-width:1.92499995;stroke-miterlimit:4;stroke-dasharray:none" /> <path d="m 34.981054,23.766238 c 0,0 -2.011809,-2.505097 -3.098182,-4.441418 l -2.902193,3.701262 5.37511,12.556508 c 0.907909,-0.615531 2.256487,-2.511987 2.898435,-3.491812 2.418679,-3.238079 2.693228,-7.998903 2.693228,-7.998903 z" style="fill:#d8432e;fill-opacity:1;stroke-width:1.92499995;stroke-miterlimit:4;stroke-dasharray:none" /> </g> </svg>'
const LOGOJA1 = LOGODEFAULT;
const LOGOJA = LOGODEFAULT;

//.TRANS: put the URL to the guide here, e.g., https://github.com/sugarlabs/turtleblocksjs/tree/master/guide/README.md
var GUIDEURL = _('guide url');

if (GUIDEURL === 'guide url' || GUIDEURL === '') {
    GUIDEURL = 'https://github.com/sugarlabs/turtleblocksjs/tree/master/guide/README.md';
}

const NUMBERBLOCKDEFAULT = 100;
const DEFAULTPALETTE = "turtle";

let HELPCONTENT;
let DATAOBJS;
const TITLESTRING = _('Turtle Blocks is a Logo-inspired turtle that draws colorful pictures with snap-together visual-programming blocks.');
const VERSION = "3.5.2.2";

// We don't include 'extras' since we want to be able to delete
// plugins from the extras palette.
const BUILTINPALETTES = [
    "search",
    "rhythm",
    "meter",
    "pitch",
    "intervals",
    "tone",
    "ornament",
    "volume",
    "drum",
    "flow",
    "action",
    "boxes",
    "widgets",
    "graphics",
    "pen",
    "number",
    "boolean",
    "media",
    "sensors",
    "heap",
    "dictionary",
    "ensemble",
    "extras",
    "program",
    "myblocks"
];

const BUILTINPALETTESFORL23N = [
    _("search"),
    _("rhythm"),
    _("meter"),
    _("pitch"),
    _("intervals"),
    _("tone"),
    _("ornament"),
    _("volume"),
    _("drum"),
    _("flow"),
    _("action"),
    _("boxes"),
    _("widgets"),
    _("graphics"),
    _("pen"),
    _("number"),
    _("boolean"),
    _("media"),
    _("sensors"),
    _("heap"),
    _("dictionary"),
    _("ensemble"),
    _("extras"),
    //.TRANS: program as in computer program
    _("program"),
    _("my blocks")
];

// We put the palette buttons into groups.
const MULTIPALETTES = [
    [
	"graphics",
	"pen",
	"media",
	"sensors",
	"ensemble"
    ],
    [
        "flow",
        "action",
        "boxes",
        "number",
        "boolean",
        "heap",
        "dictionary",
        "extras",
        "program",
        "myblocks"
    ],
    [
        "rhythm",
        "meter",
        "pitch",
        "intervals",
        "tone",
        "ornament",
        "volume",
        "drum",
        "widgets"
    ]
];

// Skip these palettes in beginner mode.
const SKIPPALETTES = ["heap", "dictionary", "extras", "program", "meter", "pitch", "intervals", "tone", "ornament", "volume", "drum", "widgets"];

// Icons used to select between multipalettes.
const MULTIPALETTEICONS = ["artwork", "logic", "music"];
const MULTIPALETTENAMES = [_("artwork"), _("logic"), _("music")];

function getMainToolbarButtonNames(name) {
    return (
        [
            "popdown-palette",
            "run",
            "step",
            "step-music",
            "stop-turtle",
            "hard-stop-turtle",
            "palette",
            "help",
            "sugarizer-stop",
            "beginner",
            "advanced",
            "planet",
            "planet-disabled",
            "open",
            "save",
            "new"
        ].indexOf(name) > -1
    );
}

function getAuxToolbarButtonNames(name) {
    return (
        [
            "paste-disabled",
            "Cartesian",
            "compile",
            "utility",
            "restore-trash",
            "hide-blocks",
            "collapse-blocks",
            "go-home"
        ].indexOf(name) > -1
    );
}

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
}

function createHelpContent(activity) {
    let language = localStorage.languagePreference;
    if (language === undefined) {
        language = navigator.language;
    }

    let LOGO = LOGODEFAULT;
    if (language === "ja") {
        LOGO = LOGOJA;
    }

    if (activity.beginnerMode) {
        HELPCONTENT = [
            [
		_('Welcome to Turtle Blocks'),
		TITLESTRING,
		'data:image/svg+xml;base64,' +
		    window.btoa(unescape(encodeURIComponent(LOGO)))
	    ],
            [
                _("Play"),
                _("Click the run button to run the project in fast mode."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(RUNBUTTON)))
            ],
            [
                _("Stop"),
                _("Stop the music (and the mice).") +
                    " " +
                    _("You can also type Alt-S to stop."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(STOPTURTLEBUTTON)))
            ],
            [
                _("New project"),
                _("Initialize a new project."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(NEWBUTTON)))
            ],
            [
                _("Load project from file"),
                _("You can also load projects from the file system."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(LOADBUTTON)))
            ],
            [
                _("Save project"),
                _("Save your project to a file."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(SAVEBUTTON)))
            ],
            [
                _("Find and share projects"),
                _(
                    "This button opens a viewer for sharing projects and for finding example projects."
                ),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(PLANETBUTTON)))
            ],
	    [
                _("Palette buttons"),
                _(
                    "This toolbar contains the palette buttons including Rhythm Pitch Tone Action and more."
                ) +
                    " " +
                    _(
                        "Click to show the palettes of blocks and drag blocks from the palettes onto the canvas to use them."
                    ),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(RHYTHMPALETTEICON)))
            ],
            [
                _("Cartesian/Polar"),
                _("Show or hide a coordinate grid."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(CARTESIANBUTTON)))
            ],
            [
                _("Clean"),
                _(
                    "Clear the screen and return the mice to their initial positions."
                ),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(CLEARBUTTON)))
            ],
            [
                _("Collapse"),
                _("Collapse the graphics window."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(COLLAPSEBUTTON)))
            ],
            [
                _("Home"),
                _("Return all blocks to the center of the screen."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(GOHOMEBUTTON)))
            ],
            [
                _("Show/hide blocks"),
                _("Hide or show the blocks and the palettes."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(HIDEBLOCKSBUTTON)))
            ],
            [
                _("Expand/collapse collapsable blocks"),
                _("Expand or collapse start and action stacks."),
                "data:image/svg+xml;base64," +
                    window.btoa(
                        unescape(encodeURIComponent(COLLAPSEBLOCKSBUTTON))
                    )
            ],
            [
                _("Decrease block size"),
                _("Decrease the size of the blocks."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(SMALLERBUTTON)))
            ],
            [
                _("Increase block size"),
                _("Increase the size of the blocks."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(BIGGERBUTTON)))
            ],
            [
                _("Expand/collapse option toolbar"),
                _(
                    "Click this button to expand or collapse the auxillary toolbar."
                ),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(MENUBUTTON)))
            ],
            [
                _("Run slow"),
                _("Click to run the project in slow mode."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(SLOWBUTTON)))
            ],
            [
                _("Run step by step"),
                _("Click to run the project step by step."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(STEPBUTTON)))
            ],
            [
                _("Restore"),
                _("Restore blocks from the trash."),
                "data:image/svg+xml;base64," +
                    window.btoa(
                        unescape(encodeURIComponent(RESTORETRASHBUTTON))
                    )
            ],
            [
                _("Switch mode"),
                _("Switch between beginner and advance modes."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(ADVANCEDBUTTON)))
            ],
            [
                _("Select language"),
                _("Select your language preference."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(LANGUAGEBUTTON)))
            ],
            [
                _("Keyboard shortcuts"),
                _(
                    "You can type d to create a do block and r to create a re block etc."
                ),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(SHORTCUTSBUTTON)))
            ],
            [
                _("Guide"),
                _("A detailed guide to Music Blocks is available."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(LOGO))),
                GUIDEURL,
                _("Music Blocks Guide")
            ],
            [
                _("Help"),
                _("Show these messages."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(HELPBUTTON)))
            ],
	    [
		_('About'),
		_('Turtle Blocks is an open source collection of tools for exploring musical concepts.') +
		    ' ' +
		    _('A full list of contributors can be found in the Turtle Blocks GitHub repository.') +
		    ' ' +
		    _('Turtle Blocks is licensed under the AGPL.') +
		    ' '
		    + _('The current version is') +
		    ' ' +
		    VERSION,
		'data:image/svg+xml;base64,' +
		    window.btoa(unescape(encodeURIComponent(LOGO))),
		'https://github.com/sugarlabs/turtleblocksjs',
		_('Turtle Blocks GitHub repository')
	    ],
            [
                _("Congratulations."),
                _("You have finished the tour. Please enjoy Turtle Blocks!"),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(LOGO)))
            ]
        ];
    } else {
        HELPCONTENT = [
            [
		_('Welcome to Turtle Blocks'),
		TITLESTRING,
		'data:image/svg+xml;base64,'
		    + window.btoa(unescape(encodeURIComponent(LOGO)))
	    ],
            [
                _("Run fast"),
                _("Click the run button to run the project in fast mode."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(RUNBUTTON)))
            ],
            [
                _("Stop"),
                _("Stop the music (and the mice).") +
                    " " +
                    _("You can also type Alt-S to stop."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(STOPTURTLEBUTTON)))
            ],
            [
                _("New project"),
                _("Initialize a new project."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(NEWBUTTON)))
            ],
            [
                _("Load project from file"),
                _("You can also load projects from the file system."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(LOADBUTTON)))
            ],
            [
                _("save"),
                _("Save project") +
                    ": " +
                    _("Save your project to a file.") +
                    "<br/><br/>" +
                    _("Save mouse artwork as SVG") +
                    ": " +
                    _("Save graphics from your project to as SVG.") +
                    "<br/><br/>" +
                    _("Save mouse artwork as PNG") +
                    ": " +
                    _("Save graphics from your project as PNG.") +
                    "<br/><br/>" +
                    _("Save block artwork as SVG") +
                    ": " +
                    _("Save block artwork as an SVG file."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(SAVEBUTTON)))
            ],
            [
                _("Load samples from server"),
                _("This button opens a viewer for loading example projects."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(PLANETBUTTON)))
            ],

            //.TRANS: Please add commas to list: Rhythm, Pitch, Tone, Action, and more.
            //.TRANS: the buttons used to open various palettes of blocks
            [
                _("Palette buttons"),
                _(
                    "This toolbar contains the palette buttons including Rhythm Pitch Tone Action and more."
                ) +
                    " " +
                    _(
                        "Click to show the palettes of blocks and drag blocks from the palettes onto the canvas to use them."
                    ),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(RHYTHMPALETTEICON)))
            ],
            [
                _("Cartesian/Polar"),
                _("Show or hide a coordinate grid."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(CARTESIANBUTTON)))
            ],
            [
                _("Clean"),
                _(
                    "Clear the screen and return the mice to their initial positions."
                ),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(CLEARBUTTON)))
            ],
            [
                _("Collapse"),
                _("Collapse the graphics window."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(COLLAPSEBUTTON)))
            ],
            [
                _("Home"),
                _("Return all blocks to the center of the screen."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(GOHOMEBUTTON)))
            ],
            [
                _("Show/hide blocks"),
                _("Hide or show the blocks and the palettes."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(HIDEBLOCKSBUTTON)))
            ],
            [
                _("Expand/collapse collapsible blocks"),
                _("Expand or collapse start and action stacks."),
                "data:image/svg+xml;base64," +
                    window.btoa(
                        unescape(encodeURIComponent(COLLAPSEBLOCKSBUTTON))
                    )
            ],
            [
                _("Decrease block size"),
                _("Decrease the size of the blocks."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(SMALLERBUTTON)))
            ],
            [
                _("Increase block size"),
                _("Increase the size of the blocks."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(BIGGERBUTTON)))
            ],
            [
                _("Expand/collapse option toolbar"),
                _(
                    "Click this button to expand or collapse the auxiliary toolbar."
                ),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(MENUBUTTON)))
            ],
            [
                _("Run slow"),
                _("Click to run the project in slow mode."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(SLOWBUTTON)))
            ],
            [
                _("Run step by step"),
                _("Click to run the project step by step."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(STEPBUTTON)))
            ],
            [
                _("Switch mode"),
                _("Switch between beginner and advance modes."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(ADVANCEDBUTTON)))
            ],
            [
                _("Enable scrolling"),
                _("You can scroll the blocks on the canvas."),
                "data:image/svg+xml;base64," +
                    window.btoa(
                        unescape(encodeURIComponent(SCROLLUNLOCKBUTTON))
                    )
            ],
            [
                _("Display statistics"),
                _("Display statistics about your Music project."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(STATSBUTTON)))
            ],
            [
                _("Delete plugin"),
                _("Delete a selected plugin."),
                "data:image/svg+xml;base64," +
                    window.btoa(
                        unescape(encodeURIComponent(PLUGINSDELETEBUTTON))
                    )
            ],
            [
                _("Select language"),
                _("Select your language preference."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(LANGUAGEBUTTON)))
            ],
            [
                _("Wrap Turtle"),
                _("Turn Turtle wrapping On or Off."),
                "data:image/svg+xml;base64," +
                    window.btoa(
                        unescape(encodeURIComponent(WRAPTURTLEBUTTON))
                    )
            ],
            [
                _("Restore"),
                _("Restore blocks from the trash."),
                "data:image/svg+xml;base64," +
                    window.btoa(
                        unescape(encodeURIComponent(RESTORETRASHBUTTON))
                    )
            ],
            [
                _("Keyboard shortcuts"),
                _(
                    "You can type d to create a do block and r to create a re block etc."
                ),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(SHORTCUTSBUTTON)))
            ],
            [
                _("Guide"),
                _("A detailed guide to Music Blocks is available."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(LOGO))),
                GUIDEURL,
                _("Music Blocks Guide")
            ],
            [
                _("Help"),
                _("Show these messages."),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(HELPBUTTON)))
            ],
            [
                _("About"),
                _(
                    "Music Blocks is an open source collection of tools for exploring musical concepts."
                ) +
                    " " +
                    _(
                        "A full list of contributors can be found in the Music Blocks GitHub repository."
                    ) +
                    " " +
                    _("Music Blocks is licensed under the AGPL.") +
                    " " +
                    _("The current version is") +
                    " " +
                    VERSION,
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(LOGO))),
                "https://github.com/sugarlabs/musicblocks",
                _("Music Blocks GitHub repository")
            ],
            [
                _("Congratulations."),
                _("You have finished the tour. Please enjoy Turtle Blocks!"),
                "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(LOGO)))
            ]
        ];
    }
}
