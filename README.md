# Server
## Running a local server on Ubuntu Guide

[Clone the server](https://github.com/tchx84/turtleblocksjs-server) and [change the api key](https://github.com/tchx84/turtleblocksjs-server/blob/master/settings.py#L26) to your TurtleJS key.

* Install apache
* turtleblocksjs and setup a link to /var/www/html

```
sudo apt-get install apache2
cd /var/www
sudo ln -s /home/path/to/app/ html
```

Then, enable the 'proxy' modules in apache.
```
cd /etc/apache2/mods-enabled 
sudo ln -s ../mods-available/proxy* . 
sudo ln -s ../mods-available/xml2enc.load .
```

Remove the alias module.
```
sudo unlink alias.conf
sudo unlink alias.load
```

# Apache TurtleJS Config
Copy this in `/etc/apache2/sites-enabled/turtlejs.conf`

```
<VirtualHost *:80 *:443>
    DocumentRoot /var/www/html

    ProxyPreserveHost On
    ProxyPass /server http://127.0.0.1:3000
    ProxyPassReverse /server http://127.0.0.1:3000

    <Location /server>
        Order allow,deny
        Allow from all
    </Location>

</Virtualhost>
```
Then, restart apache.
```sudo service apache2 restart```

Now, you need to run the TurtleJS server.

```
cd /home/path/to/server/ 
./server.py
```
If everything is ok in you browser you should able to access to <pre>localhost</pre> and see TurtleJS instance.

#Plugins

##How to get plugins

You can find plugins in the [official app repository](https://github.com/walterbender/turtleblocksjs).
The plugins are identified by the extension <code>**.json**</code>
You need to download the plugins for load it.
[(In this guide I will use this plugin)](https://github.com/walterbender/turtleblocksjs/blob/master/translate.json)

How to load plugins
---
Under the Option Toolbar (click it if its not expanded) you will see that option:

<img src='http://people.sugarlabs.org/ignacio/plugin-button.svg'>

Click it and File Chooser will appear. 
In the file chooser select the <code>**.json**</code> plugin and click 'Open'
<img src='http://people.sugarlabs.org/ignacio/LoadPluginsFileChooser.png'>

After you click it, you will see the blocks in the palettes. 
(In this case the plugin create custom blocks palette: *mashape*)
<img src='http://people.sugarlabs.org/ignacio/LoadPluginMashape.png'>

Also, the plugin now is in the browser cache. 
You don't need to load it every time you run TurtleJS.

##How to make a plugin
The basic idea is to let developers add new palettes and blocks to support additional functionality without having to make any changes to the core. If a plugin is present, it is loaded when the activity is launched and any palettes or blocks defined by the plugin are made available to the user.

###Prerequisites

* You  will need to familiarize yourself with [JSON](http://en.wikipedia.org/wiki/JSON)

  About JSON: JavaScript Object Notation, is an open standard format that uses human-readable text to transmit data objects consisting of attributeâ€“value pairs. It is used primarily to transmit data between a server and web application, as an alternative to XML.
  To learn more about JSON, go to http://www.json.org/

* It would help you understand better, if you learn a bit about [plugins in Turtle Art](http://wiki.sugarlabs.org/go/Activities/Turtle_Art/Plugins)

* You must have turtleblocksjs up and running. Use the following command to run it from your cloned repository:
<pre><code>python -m SimpleHTTPServer</code></pre>

* To define the Turtle `blocks` in your plugin, you will need to know how to program in Javascript. The blocks are defined in a dictionary element. To understand better, check the [code of basicblocks.js](https://github.com/walterbender/turtleblocksjs/blob/master/js/basicblocks.js)

* You will need to learn about `.rtp` Readable Turtleblocks Plugin format. For more information, run `python pluginify.py syntax` from the cloned repository.

###The Plugin Dictionary

Now that you know JSON and have turtleblocksjs running, you can go through [some example plugins](https://github.com/walterbender/turtleblocksjs/blob/readmeupdate/README.md#references) and learn [how to install them.](https://github.com/walterbender/turtleblocksjs/blob/master/README.md#how-to-load-plugins)

Plugins are a dictionary of JSON-encoded components that incorporates: a flow-block dictionary, an arg-block dictionary, a block dictionary, and a palette dictionary. 
* `flow-block` dictionary is a set of commands that are evaluated when a flow block is run
* `arg-block` dictionary is a set of commands that are evaluated when an arg block is run
* `block` dictionary defines the new blocks in the plugin
* `palette` dictionary defines icons (svg) associated with the palettes populated by the blocks found in the plugin. It is expressed by the following dictionaries (these dictionaries at the same level with `flow-block`, `arg-block` and all):
  * `fill-colors` Set the hex color of the blocks in the plugin's palatte
  * `stroke-colors` Set the hex color for stroke of the blocks in the plugin's palatte
  * `highlight-colors` Set the hex color of the blocks when they are highlighted (in the plugin's palatte)
  * `plugins` Code of the svg icon used to show/hide the palatte

###Layout and Format
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

Format for `PALETTEFILLCOLORS`, `PALATTEHIGHLIGHTCOLORS` and `PALATTESTROKECOLORS`:
<pre><code>{"[palatte name]":"[color hex code]"}</code></pre>
Example: ```"PALETTESTROKECOLORS":{"mashape":"#ef003e"}```

Format for `PALATTEPLUGINS`:
<pre><code>{"[palatte name]":"[svg file code]"}</code></pre>
Example: ```"PALETTEPLUGINS":{"mashape":"<?xml version........</svg>"}```

Format for blocks:
<pre><code>"{[name of the block]":"code of the block"}</code></pre>
Example: ```"BLOCKPLUGINS":{"translate":"var ....", "detectlang":"var ....", "setlang":"var ...."}, ```

###Pluginify
You can use [pluginify.py](https://github.com/DakshShah/turtleblocksjs/blob/b798401b8ac155ed720da18d933afabc96d14ee1/pluginify.py) to convert a `.rtp` (Readable Turtleblocks Plugin) to a `.json` plugin. 

Writing plugins directly in JSON is difficult so to make the job easier for you, a new format has been made (rtp) It is much easier to write like this, to know the syntax you just need to run `python pluginify.py syntax`

[.rtp example](https://github.com/DakshShah/turtleblocksjs/blob/b798401b8ac155ed720da18d933afabc96d14ee1/finance.rtp)

Once you undertand, how to make a rtp file and have it ready. It is time to convert it to JSON so that it can be used in TurtleBlocksjs.
To convert it to JSON, you can just simply run `python pluginify.py filename.rtp`

[.rtp syntax](https://github.com/DakshShah/turtleblocksjs/blob/b798401b8ac155ed720da18d933afabc96d14ee1/pluginify.py#L31)

###References
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
  * `booleanTwoArgBlock`: E.g., greater, less, equal.
  * `parameterBlock`: E.g., color, shade, pensize

  To use the above block styles to create your blocks, let us go through [an example](https://github.com/walterbender/turtleblocksjs/blob/master/advancedblocks.json#L29)

  ```"loudness":"var loudnessBlock = new ProtoBlock(\"loudness\"); loudnessBlock.palette = palettes.dict[\"sensors\"]; blocks.protoBlockDict[\"loudness\"] = loudnessBlock; loudnessBlock.parameterBlock(); loudnessBlock.staticLabels.push(\"loudness\");",```

  See the line ```loudnessBlock.parameterBlock();``` That is how you define the block style `parameterBlock` to `loudnessBlock`, to define your own block, just use any of the above styles as per your need, like ```blockname.blockstyle();``` which will define a style of `blockstyle` name to your block named `blockname`.

* Example plugins: [advancedblocks.json](https://github.com/walterbender/turtleblocksjs/blob/master/advancedblocks.json), [translate.json](https://github.com/walterbender/turtleblocksjs/blob/master/translate.json), [weather.json](https://github.com/walterbender/turtleblocksjs/blob/master/weather.json)