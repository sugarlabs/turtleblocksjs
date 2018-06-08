TurtleBlocks (the JavaScript version)
=====================================
<img src='https://github.com/sugarlabs/turtleblocksjs/blob/master/activity/logo.png' />

Turtle Blocks is an activity with a Logo-inspired graphical "turtle"
that draws colorful art based on snap-together visual programming
elements. Its "low floor" provides an easy entry point for
beginners. It also has "high ceiling" programming, graphics,
mathematics, and Computer Science features which will challenge the
more adventurous student.

> Note: The JavaScript version of Turtle Blocks closely parallels the
> Python version of Turtle Blocks, which is included in the Sugar
> distribution. Sugar users probably want to use the Python version
> rather than the JavaScript version. (The JavaScript version is
> included in Sugarizer.)

![Turtle Blocks](https://github.com/sugarlabs/turtleblocksjs/blob/master/screenshots/updatedscreenshot.png "Turtle Blocks")

Using Turtle Blocks
------------------- 

The Javascript version of Turtle Blocks is designed to run in a
browser. Most of the development has been done in Chrome, but it
should also work in Firefox, Opera, and Safari. You can run it
directly from index.html, from a [server maintained by Sugar
Labs](https://turtle.sugarlabs.org), from the [github
repo](https://rawgit.com/sugarlabs/turtleblocksjs/master/index.html),
or by setting up a [local
server](https://github.com/sugarlabs/turtleblocksjs/blob/master/server.md).

Sugar users can run Turtle Blocks as an app embedded in the Browse
activity (See [Turtle Blocks
Embedded](https://github.com/sugarlabs/turtle-blocks-embedded-activity))
or simply open Turtle Blocks in the Browse activity itself.

Once you've launched Turtle Blocks in your browser, start by clicking
on (or dragging) blocks from the Turtle palette. Use multiple blocks
to create drawings; as the turtle moves under your control, colorful
lines are drawn.

You add blocks to your program by clicking on or dragging them from
the palette to the main area. You can delete a block by dragging it
back onto the palette. Click anywhere on a “stack” of blocks to start
executing that stack or by clicking in the Big Play Button 
(fast running) or press it for a long while for the Turtle
to run (slowly) on the Main Toolbar.

Getting Started Documentation
-----------------------------

The basic buttons and basic blocks are explained in detail in [Documentation](https://github.com/sugarlabs/turtleblocksjs/blob/master/documentation/README.md).

A guide to programming with Turtle Blocks is available in [Turtle Blocks Guide](https://github.com/sugarlabs/turtleblocksjs/blob/master/guide/README.md).

A quick start:

<img src='https://github.com/sugarlabs/turtleblocksjs/blob/master/documentation/fast-button.png' />
Click to run the project in fast mode. Long press to run the project in slow mode.

<img src='https://github.com/sugarlabs/turtleblocksjs/blob/master/documentation/step-button.png' />
Click to run the project step by step.

<img src='https://github.com/sugarlabs/turtleblocksjs/blob/master/documentation/stop-turtle-button.png' />
Stop the current project running.

<img src='https://github.com/sugarlabs/turtleblocksjs/blob/master/documentation/clear-button.png' />
Clear the screen and return the turtles to their initial positions.

<img src='https://github.com/sugarlabs/turtleblocksjs/blob/master/documentation/hide-blocks-button.png' />
Hide or show the blocks and the palettes

<img src='https://github.com/sugarlabs/turtleblocksjs/blob/master/documentation/collapse-blocks-button.png' />
Expand or collapse start and action stacks.

<img src='https://github.com/sugarlabs/turtleblocksjs/blob/master/documentation/home-button.png' />
Return all blocks to the center of the screen.

<img src='https://github.com/sugarlabs/turtleblocksjs/blob/master/documentation/forward.png' />
Moves turtle forward.

<img src='https://rawgithub.com/sugarlabs/turtleblocksjs/master/documentation/right.svg' />
Turns turtle clockwise (angle in degrees).

<img src='https://rawgithub.com/sugarlabs/turtleblocksjs/master/documentation/set_color.svg' />
Sets color of the line drawn by the turtle.

<img src='https://rawgithub.com/sugarlabs/turtleblocksjs/master/documentation/set_pen_size.svg' />
Sets size of the line drawn by the turtle.

<img src='https://rawgithub.com/sugarlabs/turtleblocksjs/master/documentation/repeat.svg' />
Loops specified number of times.

<img src='https://rawgithub.com/sugarlabs/turtleblocksjs/master/documentation/action_flow.svg' />
Top of nameable action stack.

<img src='https://rawgithub.com/sugarlabs/turtleblocksjs/master/documentation/action.svg' />
Invokes named action stack.

Google Code-in participant Jasmine Park has created some guides to
using Turtle Blocks: [Turtle Blocks: An Introductory
Manual](http://people.sugarlabs.org/walter/TurtleBlocksIntroductoryManual.pdf)
and [Turtle Blocks: A Manual for Advanced
Blocks](http://people.sugarlabs.org/walter/TurtleBlocksAdvancedBlocksManual.pdf)

Turtle Confusion
----------------

Turtle Confusion presents 40 shape challenges to the learner that must
be completed using basic Logo-blocks. The challenges are based on
Barry Newell’s 1988 book, *Turtle Confusion: Logo Puzzles and
Riddles*. You can access these puzzles from the [Turtle Confusion
page](https://github.com/sugarlabs/turtleblocksjs/blob/master/guide/Confusion.md).

Music Blocks
------------

[Music Blocks](https://github.com/sugarlabs/musicblocks) is fork of
Turtle Blocks with additional blocks for programming music.

Reporting Bugs
--------------

Bugs can be reported in the
[issues section](https://github.com/sugarlabs/turtleblocksjs/issues) of
this repository.

Contributing
------------

Please consider contributing to the project, with your ideas, your
artwork, your lesson plans, and your code.

Programmers, please follow these general
[guidelines for contributions](https://github.com/sugarlabs/sugar-docs/blob/master/src/contributing.md).

Advanced Features
-----------------

Turtle Blocks has a plugin mechanism that is used to add new
blocks. You can learn more about how to use plugins (and how to write
them) from the [Plugins
Guide](https://github.com/sugarlabs/turtleblocksjs/blob/master/plugins/README.md).

List of Plugins
---------------

* [Mindstorms](https://github.com/SAMdroid-apps/turtlestorm): blocks to interact with the LEGO Mindstorms robotics kit
* [RoDi](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/rodi.json): blocks to interact with RoDi wireless robot
* [Carbon Calculator](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/carbon_calculator.json): blocks for exploring your carbon footprint
* [Maths](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/maths.json): addition blocks for some more advanced mathematics
* [Translate](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/translate.json): blocks for translating strings between languages, e.g., English to Spanish
* [Dictionary](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/dictionary.json): a block to look up dictionary definitions
* [Weather](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/weather.json): blocks to retrieve global weather forecasts
* [Logic](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/logic.json): blocks for bitwise Boolean operations
* [Finance](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/finance.json): a block for looking up market prices
* [Bitcoin](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/bitcoin.json): a block for looking up bitcoin exchange rates
* [Nutrition](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/nutrition.json): blocks for exploring the nutritional content of food
* [Facebook](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/facebook.json): a block for publishing a project to Facebook
* [Heap](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/heap.json): blocks to support a heap and for loading and saving data
* [Accelerometer](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/accelerometer.json): blocks for accessing an accelerometer
* [Turtle](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/turtle.json): blocks to support advanced features when using multiple turtles
* [Gmap](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/gmap.json): blocks to support generation of Google maps.
* [Random quote](https://raw.githubusercontent.com/sugarlabs/turtleblocksjs/master/plugins/random_quote.json): returns random quote of the day
