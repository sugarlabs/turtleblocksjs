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