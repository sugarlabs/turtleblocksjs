# Copyright (C) 2015 Sam Parkinson
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

import re
import sys
import json

HELP = '''Usage:

    python pluginify.py (file)

or

    python pluginify.py (file) > plugin.json

Converts a rtp (readable TurtleBlocks plugin) file into a json file to load
into Turtle Blocks JS.  For more information, run `python pluginify.py syntax`
'''
SYNTAX = '''
In rst, a block is not defined with braces
rather it starts where you add //* *// and it's scope is until the next block starts, 
or the end of file in case it is the last block.

To comment, just type //* comment *// followed by your multi line comment, 
comments are ignored and not added in the JSON plugin. 
They get rejected as soon as you run the pluginify, although they would remain in your rtp file.
Example: //* comment *// Your single or multi line comment here...

Define all the global variable under the block, 
//* globals *// these will get added to all the code blocks in the created JSON.
Example: You can define the API Key, like var mashapeKey = '(keycode)'; in globals

But the global variables don't end there, you can also declare specific global variables
Specific global vars, are the ones that get applied to a set of similar blocks,
for example the variables under //* arg-globals *// would be added to all the arg blocks

All the valid block types are defined in the NAME dictionary 
(flow, arg, block, palatte-icon, palatte-fill, palette-stroke, palette-highlight)
To define a block you need to type //* (blocktype):(blockname) *//
Example: //* arg-globals *// var block = blocks.blockList[blk];

JS_TYPES v/s NAMES Block types defined under the JS_TYPES are similar to the one's defined under NAMES with just one difference,
That the ones in JS_TYPES will have the access to the global variables,
while the ones in NAMES and not in JS_TYPES are the ones that are not accessing the global variables.
Example: flow is in both JS_TYPES and NAMES, so it would have access to global variables 
while palette-icon is in NAMES but not in JS_TYPES so it would not have access to global variables
'''

NAMES = {'flow': 'FLOWPLUGINS', 'arg': 'ARGPLUGINS', 'block': 'BLOCKPLUGINS',
         'palette-icon': 'PALETTEPLUGINS', 'palette-fill': 'PALETTEFILLCOLORS',
         'palette-stroke': 'PALETTESTROKECOLORS',
         'palette-highlight': 'PALETTEHIGHLIGHTCOLORS'}
JS_TYPES = ('flow', 'arg', 'block')


def pluginify(data):
    sections_list = data.split('//*')
    sections_pairs = []
    specific_globals = {'arg': '', 'flow': '', 'block': ''}
    globals_ = None
    for section in sections_list:
        match = re.match('(.*)\*\/\/([^\0]*)', section.strip())
        if match:
            if match.group(1).strip() == 'globals':
                globals_ = match.group(2).strip()
            elif match.group(1).strip().endswith('-globals'):
                type_, _ = match.group(1).strip().split('-')
                specific_globals[type_] = specific_globals[type_] + \
                    match.group(2).strip()
            elif match.group(1).strip() == 'comment':
                continue
            else:
                sections_pairs.append((match.group(1).strip(),
                                       match.group(2).strip()))

    outp = {}
    if globals_ is not None:
        outp['GLOBALS'] = globals_.replace('\n', '').replace('var ', '')

    for key, value in sections_pairs:
        if len(key.split(':')) != 2:
            raise ValueError('Section names should have 1 colon (type:name)')
        type_, name = key.split(':')

        if type_ in JS_TYPES:
            value = specific_globals[type_] + value
        value = value.replace('\n', '')

        type_ = NAMES[type_]
        if type_ not in outp:
            outp[type_] = {}
        outp[type_][name] = value

    return json.dumps(outp)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print HELP
    elif sys.argv[1] in ('help', '-h', '--help'):
        print HELP
    elif sys.argv[1] == 'syntax':
        print SYNTAX
    else:
        with open(sys.argv[1]) as f:
            data = f.read()
        print pluginify(data)
