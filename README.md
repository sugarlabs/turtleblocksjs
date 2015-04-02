TurtleBlocks JS
===============

Turtle Blocks Javascript is an activity with a
Logo-inspired graphical "turtle" that draws colorful art based on
snap-together visual programming elements. Its "low floor" provides an
easy entry point for beginners. It also has "high ceiling"
programming, graphics, mathematics, and Computer Science features
which will challenge the more adventurous student.

> Note: Turtle Blocks JS closely parallels the Python version of Turtle
> Blocks, the version included in the Sugar distribution. Sugar users
> probably want to use Turtle Blocks rather than Turtle Blocks JS.

![Turtle Blocks](https://github.com/walterbender/turtleblocksjs/raw/master/screenshots/screenshot.png "Turtle Blocks")

Using Turtle Art JS
-------------------

Turtle Blocks Javascript is designed to run in a browser. Most of the
development has been done in Chrome, but it should also work in
Firefox. You can run it directly from index.html, from a [server
maintained by Sugar Labs](http://turtle.sugarlabs.org), from the
[github
repo](http://rawgit.com/walterbender/turtleblocksjs/master/index.html),
or by setting up a [local
server](https://github.com/walterbender/turtleblocksjs/blob/master/server.md).

Once you've launched it in your browser, start by clicking on (or
dragging) blocks from the Turtle palette. Use multiple blocks to
create drawings; as the turtle moves under your control, colorful
lines are drawn.

You add blocks to your program by clicking on or dragging them from
the palette to the main area. You can delete a block by dragging it
back onto the palette. Click anywhere on a "stack" of blocks to start
executing that stack or by clicking in the Rabbit (fast) or Turtle
(slow) on the Main Toolbar.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/fast-button.svg'</img>
Making the turtle move faster

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/slow-button.svg'</img>
Making the turtle move slower

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/step-button.svg'</img>
Making the turtle move step by step (Turtle moves one step once clicked).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/stop-turtle-button.svg'</img>
Stopping the current project

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/clear-button.svg'</img>
Clear the screen and return the turtles to their initial positions.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/palette-button.svg'</img>
Hide or show the block palettes.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/hide-blocks-button.svg'</img>
Hide or show the blocks and the palettes.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/collapse-blocks-button.svg'</img>
Expand or collapse stacks of blocks, e.g, start and action stacks.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/help-button.svg'</img>
Show these messages.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/menu-button.svg'</img>
Expands or Collapses the auxillary toolbar.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/planet-button.svg'</img>
Opens a viewer for loading example projects.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/paste-button.svg'</img>
Copies the blocks onto the clipboard.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/Cartesian-button.svg'</img>
Show or hide a Cartesian-coordinate grid.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/polar-button.svg'</img>
Show or hide a polar-coordinate grid.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/plugin-button.svg'</img>
Load new blocks/plugin from the file system.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/empty-trash-button.svg'</img>
Remove all content on the canvas, including the blocks.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/restore-trash-button.svg'</img>
Restore blocks from the trash.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/clear.svg'</img>
Clears the screen and reset the turtle.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/forward.svg'</img>
Moves turtle forward.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/right.svg'</img>
Turns turtle clockwise (angle in degrees).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/back.svg'</img>
Moves turtle backward.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/left.svg'</img>
Turns turtle counterclockwise (angle in degrees).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/arc.svg'</img>
Moves turtle along an arc.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/set_heading.svg'</img>
Sets the heading of the turtle (0 is towards the top of the screen)

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/set_heading.svg'</img>
Holds current heading value of the turtle (can be used in place of a number block).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/setxy.svg'</img>
Moves turtle to position xcor, ycor; (0, 0) is in the center of the screen.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/x.svg'</img>
Holds current x-coordinate value of the turtle (can be used in place of a number block).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/y.svg'</img>
Holds current y-coordinate value of the turtle (can be used in place of a number block).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/set_color.svg'</img>
Sets color of the line drawn by the turtle.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/color.svg'</img>
Holds current pen color (can be used in place of a number block).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/set_hue.svg'</img>
Sets hue of the line drawn by the turtle.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/set_shade.svg'</img>
Sets shade of the line drawn by the turtle.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/shade.svg'</img>
Holds current pen shade.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/set_grey.svg'</img>
Sets grey level of the line drawn by the turtle.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/grey.svg'</img>
Holds current grey level (can be used in place of a number block).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/set_pen_size.svg'</img>
Sets size of the line drawn by the turtle.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/pen_size.svg'</img>
Holds current pen size (can be used in place of a number block).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/pen_up.svg'</img>
Turtle will not draw when moved.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/pen_down.svg'</img>
Turtle will draw when moved.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/begin_fill.svg'</img>
Starts filled polygon (used with end fill block).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/end_fill.svg'</img>
Completes filled polygon (used with start fill block).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/set_font.svg'</img>
Sets the font of the text.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/background.svg'</img>
Sets the background color.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/number.svg'</img>
Used as numeric input in mathematic operators.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/random.svg'</img>
Returns random number between minimum (top) and maximum (bottom) values.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/plus.svg'</img>
Adds two alphanumeric inputs.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/subtract.svg'</img>
Subtracts bottom numeric input from top numeric input.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/multiply.svg'</img>
Multiplies two numeric inputs.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/divide.svg'</img>
Divides top numeric input (numerator) by bottom numeric input (denominator).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/sqrt.svg'</img>
Calculates square root.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/int.svg'</img>
Used as int input in mathematic operators.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/mod.svg'</img>
Modular (remainder) operator.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/eval.svg'</img>
A programmable block: used to add advanced single-variable math equations, e.g., sin(x).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/greater_than.svg'</img>
Logical greater-than operator.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/less_than.svg'</img>
Logical less-than operator.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/equal.svg'</img>
Logical equal-to operator.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/and.svg'</img>
Logical AND operator.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/or.svg'</img>
Logical OR operator.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/not.svg'</img>
Logical NOT operator.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/repeat.svg'</img>
Loops specified number of times.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/forever.svg'</img>
Loops forever.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/stop.svg'</img>
Stops current action.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/if.svg'</img>
If-then operator that uses boolean operators from Numbers palette.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/until.svg'</img>
Do-until-True operator that uses boolean operators from numbers palette.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/wait_for.svg'</img>
Wait.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/while.svg'</img>
Do-while-True operator that uses boolean operators from numbers palette.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/if_else.svg'</img>
If-then-else operator that uses boolean operators from Numbers palette.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/name_box_value.svg'</img>
Stores numeric value in named variable.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/box_value.svg'</img>
Named variable (numeric value).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/add_1_to.svg'</img>
Adds 1 to named variable.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/add_to.svg'</img>
Adds numeric value to named variable.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/box.svg'</img>
Named variable (numeric value).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/action_flow.svg'</img>
Top of nameable action stack.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/action.svg'</img>
Invokes named action stack.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/start.svg'</img>
Connects action to toolbar run buttons.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/do.svg'</img>
Invokes named action stack.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/event_on_do.svg'</img>
Connect an event with any signal/action.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/broadcast.svg'</img>
Broadcast named event.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/speak.svg'</img>
Speaks text.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/show.svg'</img>
Draws text or show media from the Journal.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/size_shell_image.svg'</img>
Put a custom shell on the turtle.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/text.svg'</img>
String value.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/open_file.svg'</img>
Returns the selected file.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/stop_media.svg'</img>
Stops the media being played.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/tone.svg'</img>
Plays a tone at frequency and duration(in seconds).

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/note_to_frequency.svg'</img>
Changes the note of frequency.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/time.svg'</img>
Elapsed time(in seconds) since program started.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/mouse_x.svg'</img>
Returns mouse X co-ordinate.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/mouse_y.svg'</img>
Returns mouse Y co-ordinate.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/mouse_button.svg'</img>
Returs true if mouse button is pressed.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/keyboard.svg'</img>
Holds results of query-keyboard block as ASCII.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/pixel_color.svg'</img>
Returns pixel color.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/loudness.svg'</img>
Microphone input volume.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/click.svg'</img>
Connects to click action.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/vspace.svg'</img>
Jogs stack down.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/hspace.svg'</img>
Jogs stack right.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/wait.svg'</img>
Pauses program execution a specified number of seconds.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/print.svg'</img>
Prints value in status block at bottom of the screen.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/save_svg.svg'</img>
Saves turtle graphics as an SVG file in the Sugar Journal.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/show_blocks.svg'</img>
Restores hidden blocks.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/hide_blocks.svg'</img>
Declutters canvas by hiding blocks.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/play_back.svg'</img>
Play the media.

<img src='https://github.com/walterbender/turtleblocksjs/raw/master/icons/stop_play.svg'</img>
Stops the playing media.

Getting Started Documentation
-----------------------------

Google Code-in participant Jasmine Park has created some guides to
using Turtle Blocks: [Turtle Blocks: An Introductory
Manual](http://people.sugarlabs.org/walter/TurtleBlocksIntroductoryManual.pdf)
and [Turtle Blocks: A Manual for Advanced
Blocks](http://people.sugarlabs.org/walter/TurtleBlocksAdvancedBlocksManual.pdf)


Reporting Bugs
--------------

Bugs can be reported in the [Sugar Labs bug
tracker](https://bugs.sugarlabs.org/newticket?component=Turtleart) or
in the [issues
section](https://github.com/walterbender/turtleblocksjs/issues) of
this repository.


Advanced Features
-----------------

Turtle Blocks has a plugin mechanism that is used to add new
blocks. You can learn more about how to use plugins (and how to write
them) from the [Plugins
Guide](https://github.com/walterbender/turtleblocksjs/blob/master/plugins/README.md).


List of Plugins
---------------

* [Mindstorms](https://github.com/SAMdroid-apps/turtlestorm): blocks to interact with the LEGO Mindstorms robotics kit
* [RoDi](https://github.com/walterbender/turtleblocksjs/blob/master/plugins/rodi.json): blocks to interact with RoDi wireless robot
* [Maths](https://github.com/walterbender/turtleblocksjs/blob/master/maths.json): addition blocks for some more advanced mathematics
* [Translate](https://github.com/walterbender/turtleblocksjs/blob/master/translate.json): blocks for translating strings between languages, e.g., English to Spanish
* [Dictionary](https://github.com/walterbender/turtleblocksjs/blob/master/dictionary.json): a block to look up dictionary definitions
* [Weather](https://github.com/walterbender/turtleblocksjs/blob/master/weather.json): blocks to retrieve global weather forecasts
* [Logic](https://github.com/walterbender/turtleblocksjs/blob/master/logic.json): blocks for bitwise Boolean operations
* [Finance](https://github.com/walterbender/turtleblocksjs/blob/master/finance.json): a block for looking up market prices
* [Bitcoin](https://github.com/walterbender/turtleblocksjs/blob/master/bitcoin.json): a block for looking up bitcoin exchange rates
* [Nutrition](https://github.com/walterbender/turtleblocksjs/blob/master/nutrition.json): blocks for exploring the nutritional content of food
* [Facebook](https://github.com/walterbender/turtleblocksjs/blob/master/facebook.json): a block for publishing a project to Facebook
* [Heap](https://github.com/walterbender/turtleblocksjs/blob/master/heap.json): blocks to support a heap and for loading and saving data
* [Accelerometer](https://github.com/walterbender/turtleblocksjs/blob/master/accelerometer.json): blocks for accessing an accelerometer
* [Turtle](https://github.com/walterbender/turtleblocksjs/blob/master/turtle.json): blocks to support advanced features when using multiple turtles
* [Gmap](https://github.com/walterbender/turtleblocksjs/blob/master/gmap.json): blocks to support generation of Google maps.
