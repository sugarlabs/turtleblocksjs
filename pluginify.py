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
SYNTAX = 'TODO'

NAMES = {'flow': 'FLOWPLUGINS', 'arg': 'ARGPLUGINS', 'block': 'BLOCKPLUGINS',
         'palette-icon': 'PALETTEPLUGINS', 'palette-fill': 'PALETTEFILLCOLORS',
         'palette-stroke': 'PALETTESTROKECOLORS',
         'palette-highlight': 'PALETTEHIGHLIGHTCOLORS'}
JS_TYPES = ('flow', 'arg', 'block')


def pluginify(data):
    sections_list = data.split('//*')
    sections_pairs = []
    globals_ = ''
    specific_globals = {'arg': '', 'flow': '', 'block': ''}
    for section in sections_list:
        match = re.match('(.*)\*\/\/([^\0]*)', section.strip())
        if match:
            if match.group(1).strip() == 'globals':
                globals_ = globals_ + match.group(2).strip()
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
    for key, value in sections_pairs:
        if len(key.split(':')) != 2:
            raise ValueError('Section names should have 1 colon (type:name)')
        type_, name = key.split(':')

        if type_ in JS_TYPES:
            value = globals_ + specific_globals[type_] + value
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
