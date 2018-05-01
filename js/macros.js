// Copyright (c) 2017 Walter Bender
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the The GNU Affero General Public
// License as published by the Free Software Foundation; either
// version 3 of the License, or (at your option) any later version.
//
// You should have received a copy of the GNU Affero General Public
// License along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA

// Macro expansions

function blockIsMacro (blkname) {

    const BUILTINMACROS = ['black', 'white', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'setturtlename', 'fill', 'hollowline', 'status', 'switch', 'xturtle', 'yturtle'];
    return BUILTINMACROS.indexOf(blkname) > -1;
};


function getMacroExpansion (blkname, x, y) {
    // Some blocks are expanded on load.
    const BLACKOBJ = [[0, 'setshade', x, y, [null, 1, null]], [1, ['number', {'value': 0}], 0, 0, [0]]];
    const WHITEOBJ = [[0, 'setshade', x, y, [null, 1, null]], [1, ['number', {'value': 100}], 0, 0, [0]]];
    const REDOBJ = [[0, 'setcolor', x, y, [null, 1, null]], [1, ['number', {'value': 0}], 0, 0, [0]]];
    const ORANGEOBJ = [[0, 'setcolor', x, y, [null, 1, null]], [1, ['number', {'value': 10}], 0, 0, [0]]];
    const YELLOWOBJ = [[0, 'setcolor', x, y, [null, 1, null]], [1, ['number', {'value': 20}], 0, 0, [0]]];
    const GREENOBJ = [[0, 'setcolor', x, y, [null, 1, null]], [1, ['number', {'value': 40}], 0, 0, [0]]];
    const BLUEOBJ = [[0, 'setcolor', x, y, [null, 1, null]], [1, ['number', {'value': 70}], 0, 0, [0]]];
    const PURPLEOBJ = [[0, 'setcolor', x, y, [null, 1, null]], [1, ['number', {'value': 90}], 0, 0, [0]]];
    const FILLOBJ = [[0, 'fill', x, y, [null, null, 1]], [1, 'hidden', 0, 0, [0, null]]];
    const HOLLOWOBJ = [[0, 'hollowline', x, y, [null, null, 1]], [1, 'hidden', 0, 0, [0, null]]];
    // deprecated
    const SETTURTLENAMEOBJ = [[0, 'setturtlename', x, y, [null, 1, 2, null]], [1, 'turtlename', 0, 0, [0]], [2, ['text', {'value': 'Yertle'}], 0, 0, [0]]];
    const STATUSOBJ = [[0, 'status', x, y, [null, 1, 7]], [1, 'print', 0, 0, [0, 2, 3]], [2, 'x', 0, 0, [1]], [3, 'print', 0, 0, [1, 4, 5]], [4, 'y', 0, 0, [3]], [5, 'print', 0, 0, [3, 6, null]], [6, 'heading', 0, 0, [5]], [7, 'hiddennoflow', 0, 0, [0,null]]];
    const SWITCHOBJ = [[0, 'switch', x, y, [null, 1, 2, 5]], [1, ['number', {'value': 1}], 0, 0, [0]], [2, 'case', 0, 0, [0, 3, null, 4]], [3, ['number', {'value': 1}], 0, 0, [2]], [4, 'defaultcase', 0, 0, [2, null, null]], [5, 'hidden', 0, 0, [0, null]]];
    const XTURTLEOBJ = [[0, 'xturtle', x, y, [null, 1, null]], [1, 'turtlename', 0, 0, [0]]];
    const YTURTLEOBJ = [[0, 'yturtle', x, y, [null, 1, null]], [1, 'turtlename', 0, 0, [0]]];

    const BUILTINMACROS = {
        'black': BLACKOBJ,
        'white': WHITEOBJ,
        'red': REDOBJ,
        'orange': ORANGEOBJ,
        'yellow': YELLOWOBJ,
        'green': GREENOBJ,
        'blue': BLUEOBJ,
        'purple': PURPLEOBJ,
        'fill': FILLOBJ,
        'hollowline': HOLLOWOBJ,
        'setturtlename': SETTURTLENAMEOBJ,
        'status': STATUSOBJ,
        'switch': SWITCHOBJ,
        'xturtle': XTURTLEOBJ,
        'yturtle': YTURTLEOBJ,
    };

    if (['namedbox', 'nameddo', 'namedcalc', 'namedarg', 'nameddoArg'].indexOf(blkname) === -1 && blkname in BUILTINMACROS) {
        return BUILTINMACROS[blkname];
    } else {
        return null;
    }
};
