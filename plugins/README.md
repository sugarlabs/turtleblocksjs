Plugins
=======

How to get plugins
------------------

You can find plugins in the [official app repository](https://github.com/walterbender/turtleblocksjs/plugins).
The plugins are identified by the extension <code>**.json**</code>
You need to download the plugins for load it.
[(In this guide I will use this plugin)](https://github.com/walterbender/turtleblocksjs/blob/master/plugins/translate.json)

![Nutrition Plugin](https://github.com/walterbender/turtleblocksjs/raw/master/screenshots/foodplugin.png "The Nutrition plugin")

How to load plugins
-------------------

Under the Option Toolbar (click it if it is not expanded) you will see
this option:

<img src='http://people.sugarlabs.org/walter/plugin-button.svg'>

Click it and a file chooser will appear. 

In the file chooser select a plugin file (they have <code>**.json**</code> file suffixes) and click 'Open'.

The file will open and load new blocks into the palettes. Many plugins define their own palettes, so you will likely see a new palette button at the bottom of the column of buttons on the left side of the screen. (In the case of the translate plugin, new blocks will be added to a new palette, *mashape*) <img
src='http://people.sugarlabs.org/walter/mashape.svg'>

The plugin is saved in the browser local storage so you don't need to
reload it every time you run TurtleJS.

How to make a plugin
====================

Plugins allow developers add new palettes and blocks to support
additional functionality without having to make any changes to the
core code of Turtle Blocks. Anyone is free to create and distribute
extensions. If a plugin is present, it is loaded when the activity is
launched and any palettes or blocks defined by the plugin are made
available to the user.

Prerequisites
-------------

* You will need to familiarize yourself with [JSON](http://en.wikipedia.org/wiki/JSON)

  About JSON: JavaScript Object Notation, is an open standard format
  that uses human-readable text to transmit data objects consisting of
  attribute-value pairs. It is used primarily to transmit data between
  a server and web application, as an alternative to XML. To learn
  more about JSON, go to http://www.json.org/

* You may also want to familarize yourself with the Python plugin
  library [plugins in Turtle
  Art](http://wiki.sugarlabs.org/go/Activities/Turtle_Art/Plugins)

* It facilitates debugging if you must have turtleblocksjs up and
  running. Use the following command to run it from your cloned
  repository: <pre><code>python -m SimpleHTTPServer</code></pre>

* To define the Turtle `blocks` in your plugin, you will need to know
  how to program in Javascript. The blocks are defined in a dictionary
  element. To understand better, check the [code of
  basicblocks.js]
  (https://github.com/walterbender/turtleblocksjs/blob/master/js/basicblocks.js)

* We provide a tool to help you (see the section on Pluginify below).

The Plugin Dictionary
---------------------

Now that you know JSON and have turtleblocksjs running, you can go
through [some example
plugins](https://github.com/walterbender/turtleblocksjs/blob/master/README.md#Plugins)
and learn [how to install
them.](https://github.com/walterbender/turtleblocksjs/blob/master/README.md#how-to-load-plugins)

Plugins are a dictionary of JSON-encoded components that incorporates:
a flow-block dictionary, an arg-block dictionary, a block dictionary,
and a palette dictionary.

* `flow-block` dictionary is a set of commands that are evaluated when
  a flow block is run
* `arg-block` dictionary is a set of commands that are evaluated when
  an arg block is run
* `block` dictionary defines the new blocks in the plugin
* `palette` dictionary defines icons (svg) associated with the
  palettes populated by the blocks found in the plugin. It is
  expressed by the following dictionaries (these dictionaries at the
  same level with `flow-block`, `arg-block` and all):
  * `fill-colors` Set the hex color of the blocks in the plugin's palatte
  * `stroke-colors` Set the hex color for stroke of the blocks in the
    plugin's palatte
  * `highlight-colors` Set the hex color of the blocks when they are
    highlighted (in the plugin's palatte)
  * `plugins` Code of the svg icon used to show/hide the palatte

Layout and Format
-----------------
<pre>
  <code>
  {
    "FLOWPLUGINS":{},
    "ARGSPLUGINS":{},
    "BLOCKPLUGINS":{},
    "PALETTEFILLCOLORS":{},
    "PALETTESTROKECOLORS":{},
    "PALETTEHIGHLIGHTCOLORS":{},
    "PALETTEPLUGINS":{}
  } 
  </code>
</pre>

Format for `PALETTEFILLCOLORS`, `PALATTEHIGHLIGHTCOLORS` and
`PALATTESTROKECOLORS`:
<pre><code>{"[palatte name]":"[color hex code]"}</code></pre>
Example: ```"PALETTESTROKECOLORS":{"mashape":"#ef003e"}```

Format for `PALATTEPLUGINS`:
<pre><code>{"[palatte name]":"[svg file code]"}</code></pre>
Example: ```"PALETTEPLUGINS":{"mashape":"<?xml version........</svg>"}```

Format for blocks:

<pre><code>"{[name of the block]":"code of the block"}</code></pre>
Example: ```"BLOCKPLUGINS":{"translate":"var ....", "detectlang":"var ....", "setlang":"var ...."}, ```

Pluginify
---------

You can use
[pluginify.py](https://github.com/walterbender/turtleblocksjs/blob/master/pluginify.py)
to convert a `.rtp` (Readable Turtleblocks Plugin) to a `.json`
plugin.

Writing plugins directly in JSON is tedious. To make the job easier
for you, we have created the readable Turtle Blocks plugin (RTP)
format. The syntax is available in `python pluginify.py syntax`

[.rtp example](https://github.com/walterbender/turtleblocksjs/blob/master/plugins/finance.rtp)

Once you have made an RTP file it is time to convert it to JSON so
that it can be used in TurtleBlocksjs. To convert it to JSON, run
`python pluginify.py filename.rtp`

[.rtp syntax](https://github.com/walterbender/turtleblocksjs/blob/master/pluginify.py#L33)

References
----------
* List of valid blocks styles in turtleblocksjs:
  * `zeroArgBlock`: E.g., penup, pendown
  * `basicBlockNoFlow`: E.g., break
  * `oneArgBlock`: E.g., forward, right
  * `twoArgBlock`: E.g., setxy. These are expandable.
  * `oneArgMathBlock`: E.g., sqrt
  * `oneArgMathWithLabelBlock`: E.g., box
  * `twoArgMathBlock`: E.g., plus, minus, multiply, divide. These are also expandable.
  * `valueBlock`: E.g., number, string. Value blocks get DOM textareas associated with them so their values can be edited by the user.
  * `mediaBlock`: E.g., media. Media blocks invoke a chooser and a thumbnail image is overlayed to represent the data associated with the block.
  * `flowClampZeroArgBlock`: E.g., start. A "child" flow is docked in an expandable clamp. There are no additional arguments and no flow above or below.
  * `flowClampOneArgBlock`: E.g., repeat. Unlike action, there is a flow above and below.
  * `flowClampBooleanArgBlock`: E.g., if.  A "child" flow is docked in an expandable clamp. The additional argument is a boolean. There is flow above and below.
  * `doubleFlowClampBooleanArgBlock`: E.g., if then else.  Two "child" flows are docked in expandable clamps. The additional argument is a boolean. There is flow above and below.
  * `blockClampZeroArgBlock`: E.g., forever. Unlike start, there is flow above and below.
  * `blockClampOneArgBlock`: E.g., action. A "child" flow is docked in an expandable clamp. The additional argument is a name. Again, no flow above or below.
  * `booleanZeroArgBlock`: E.g., mouse button.
  * `booleanOneBooleanArgBlock`: E.g., not
  * `booleanTwoBooleanArgBlock`: E.g., and
  * `booleanOneArgBlock`: E.g.,
  * `booleanTwoArgBlock`: E.g., greater, less, equal.
  * `parameterBlock`: E.g., color, shade, pensize

  To use the block styles to create your blocks, let us go through [an example](https://github.com/walterbender/turtleblocksjs/blob/master/plugins/translate.json#L38)

  ```"translate":"var TranslateBlock = new ProtoBlock(\"translate\"); TranslateBlock.palette = palettes.dict[\"mashape\"]; blocks.protoBlockDict[\"translate\"] = TranslateBlock; TranslateBlock.oneArgMathBlock(); TranslateBlock.docks[0][2] = \"textout\"; TranslateBlock.docks[1][2] = \"textin\"; TranslateBlock.defaults.push(\"Hello\"); TranslateBlock.staticLabels.push(\"translate\");",```

  See the line ```TranslateBlock.oneArgMathBlock();``` That is how you define the block style `oneArgMathBlock` to `TranslateBlock`. To define your own block, use any of the style methods listed above.

Example plugins
---------------

[translate.json](https://github.com/walterbender/turtleblocksjs/blob/master/plugins/translate.json), [weather.json](https://github.com/walterbender/turtleblocksjs/blob/master/plugins/weather.json), [maths.rtp](https://github.com/walterbender/turtleblocksjs/blob/master/plugins/maths.rtp)
