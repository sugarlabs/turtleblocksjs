# Server
## Running a local server on Ubuntu Guide

[Clone the server](https://github.com/tchx84/turtleblocksjs-server)  and [change the api key](https://github.com/tchx84/turtleblocksjs-server/blob/master/settings.py#L26) to your TurtleJS key.

* install apache.
* turtleblocksjs and setup a link to /var/www/html

<pre><code>sudo apt-get install apache2
cd /var/www
sudo ln -s /home/path/to/app/ html
</code></pre>

Then, enable the 'proxy' modules in apache.
<pre><code>cd /etc/apache2/mods-enabled 
sudo ln -s ../mods-available/proxy* . 
sudo ln -s ../mods-available/xml2enc.load .
</code></pre>

Remove the alias module.
<pre><code>sudo unlink alias.conf
sudo unlink alias.load
</code>
</pre>

# Apache TurtleJS Config
Copy this in <code>/etc/apache2/sites-enabled/turtlejs.conf</code>

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
<pre><code>sudo service apache2 restart </code></pre>

Now, you need to run the TurtleJS server.

<pre><code>cd /home/path/to/server/ 
./server.py </code></pre>
If everything is ok in you browser you should able to access to <pre>localhost</pre> and see TurtleJS instance.

Plugins
===
How to get plugins
---
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

#How to make plugins

##Prerequisites

* First of all, you would need to be familiar with [JSON](http://en.wikipedia.org/wiki/JSON)

  About JSON: JSON (JavaScript Object Notation), is an open standard format that uses human-readable text to transmit data objects consisting of attributeâ€“value pairs. It is used primarily to transmit data between a server and web application, as an alternative to XML.
  To learn more about json, go to http://www.json.org/

* Secondly, you should of course have your turtleblocksjs up and running... To run it, you can simply fire the command:
<pre><code>python -m SimpleHTTPServer</code></pre>
From your directory of the cloned repository.

* To know what code to write inside the blocks, in the dictionaryâ€™s element, You will need to know javascript and how to write plugins in that, somewhat similar to [this](https://github.com/walterbender/turtleblocksjs/commit/000ab18a8a55f37a55a13c395826290e0afd4b18)

##A little Heads up on it

Now that you know JSON and have turtleblocksjs running, you can first of all go through some example plugins and how to install them. How to do that, is given in the [README.md file of the repository](https://github.com/walterbender/turtleblocksjs/blob/master/README.md)

Plugins are a dictionary of json-encoded components: a flow-block dictionary, an arg-block dictionary, a block dictionary, and a palette dictionary. 
* The flow-block dictionary is a set of commands that are evaluated when a flow block is run
* The arg-block dictionary is a set of commands that are evaluated when an arg block is run
* The block dictionary defines the new blocks in the plugin
* The palette dictionary defines icons (svg) associated with the palettes populated by the blocks found in the plugin.

##Layout and Format
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

##References
* For a list of valid blocks in turtleblocks3d go to https://github.com/walterbender/turtleblocksjs/blob/master/js/blocks.js#L92 and scroll through code blocks to search. Example: `BASICBLOCK`, `BASICBLOCKNOFLOW`, `BASICBLOCK1ARG`...
* Example plugins: [advancedblocks.json](https://github.com/walterbender/turtleblocksjs/blob/master/advancedblocks.json), [translate.json](https://github.com/walterbender/turtleblocksjs/blob/master/translate.json), [weather.json](https://github.com/walterbender/turtleblocksjs/blob/master/weather.json)