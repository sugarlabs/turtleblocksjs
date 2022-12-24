Using Turtle Art JS
===================

Turtle Blocks Javascript is designed to run in a browser. Most of the
development has been done in Chrome, but it should also work in
Firefox. You can run it directly from index.html, from a [server
maintained by Sugar Labs](http://turtle.sugarlabs.org), from the
[github
repo](https://rawgit.com/sugarlabs/turtleblocksjs/master/index.html),
or by setting up a [local
server](https://github.com/sugarlabs/turtleblocksjs/blob/master/server.md).

Once you've launched it in your browser, start by clicking on (or
dragging) blocks from the Turtle palette. Use multiple blocks to
create drawings; as the turtle moves under your control, colorful
lines are drawn.

To write your own programs, drag blocks from their respective palettes
on the left side of the screen. Use multiple blocks in stack(s) to
create drawings; as the turtle moves under your control, colorful
lines are drawn.

Note that blocks either snap together vertically or
horizontally. Vertical connections indicate program (and temporal)
flow. Code is executed from the top to bottom of a stack of
blocks. Horizontal connections are used for parameters and arguments,
e.g., the distance to go forward, the degrees to rotate right, the
numerator and denominator of a division. From the shape of the block,
it should be apparent whether they connect vertically or horizontally.

Some blocks, referred to as "clamp" blocks have an
interior&mdash;child&mdash;flow. This might be code that is run *if* a
condition is true, or, more common, the code that is run over the
duration of a note.

For the most part, any combination of blocks will run (although there
is no guarantee that they will produce music). Illegal combinations
of blocks will be flag by a warning on the screen as the program runs.

You can delete a block by dragging it back into the trash area that
appear at the bottom of the screen.

To maximize screen real estate, Music Blocks overlays the program
elements (stacks of blocks) on top of the canvas. These blocks can be
hidden at any time while running the program.

Toolbars
--------

There are three toolbars: (1) the main toolbar across the top of the
screen; (2) the secondary toolbar on the right side of the screen; and
(3) the palette toolbar on the left side of the screen. An additional
menu appears when a "long press" (or "right click") is applied to a stack of
blocks. There is also a utility panel with additional controls.

Main toolbar
------------

The Main toolbar is used to run programs, erase the screen, and hide
the palettes and blocks.

<img src='../header-icons/play.png' /> Click on the *Run* button to run the blocks.

<img src='../header-icons/stop.png' /> Stop running the current project.

Under the secondary menu <img src='../header-icons/hamburger.png' />
are additonal buttons to run the blocks slowly. When running slowly,
the values of parameter boxes are shown as an additional debugging
aid.

<img src='../header-icons/play-slow.png' /> Click on the *Run* button to run the blocks.

Or to play step-by-step (one block will run with each button press): <img src='../header-icons/step.png' />

<img src='./header-icons/new-project.png' /> To start a new project.

<img src='./header-icons/save-project.png' /> To save a saved project.

<img src='./header-icons/open-project.png' /> To open a saved project.

<img src='./documentation/planet-button.png' /> To open a viewer for loading example projects.

<img src='./header-icons/hamburger.png' /> Expand (or collapse) the auxillary toolbar.

<img src='./help-button.png' /> Show the help messages.

There are some additional buttons at the top of the canvas:

<img src='../header-icons/erase.png' />

* The Show (or hide) grid button will display a pie menu with a variety of grid options.

* The Erase button will clear the screen and return the turtles to the center of the screen.

* The Screen button will shrink (or expand) the graphics area.

And there are some buttons on the bottom of the canvas:

<img src='../header-icons/home-hide-collapse.png' />

* The Home buttom returns the blocks the center of the screen.

* The Hide button hides (or reveals) the blocks.

* The Collapse button collapses (or expands) stacks of blocks.

* The Shrink and Grow (magnifying glass) buttons change the size of the blocks.


Auxillary toolbar
-----------------

<img src='./documentation/paste-button.png' />

Paste blocks from the clipboard. (This button is highlighted only when
there are blocks available on the clipboard to paste.) Copy is enabled
by a long press on a block.

<img src='./documentation/trash-button.png' />

Remove all blocks.

<img src='./documentation/restore-trash-button.png' />

Restore blocks from the trash.

Increase the size of the blocks.

<img src='./documentation/stats-button.svg' />

Show project statistics.

<img src='./documentation/plugins-button.svg' />

Load new blocks from plugins (previously downloaded to the file system).

<img src='./documentation/scrolllock-button.svg' />

Enable/disable scrolling.

Keyboard shortcuts
------------------

There are several keyboard shortcuts:

*PgUp* and *PgDn* will scroll the screen vertically. This is useful for
creating long stacks of blocks.

You can use the arrow keys to move blocks and the *Delete* key to
remove an individual block from a stack.

*Enter* is the equivalent of clicking the *Run* button.

*Alt-C* is copy and *Alt-V* is paste. Be sure that the cursor is
highlighting the block(s) you want to copy.

Block Palettes
--------------

The block palettes are displayed on the left side of the screen. The
palette button on the Main toolbar show and hide the block
palettes. These palettes contain the blocks used to create
programs. See the
[Programming Guide](http://github.com/sugarlabs/turtleblocksjs/tree/master/guide/README.md)
for more details on how to use the blocks.

Turtle Palette
--------------

<img src='./documentation/clear.svg' />

Clear the screen and reset the turtle.

<img src='./documentation/forward.svg' />

Move turtle forward.

<img src='./documentation/right.svg' />

Turn turtle clockwise (angle in degrees).

<img src='./documentation/back.svg' />

Move turtle backward.

<img src='./documentation/left.svg' />

Turn turtle counterclockwise (angle in degrees).

<img src='./documentation/arc.svg' />

Move turtle along an arc.

<img src='./documentation/set_heading.svg' />

Set the heading of the turtle (0 is towards the top of the screen).

<img src='./documentation/heading.svg' />

The current heading of the turtle (can be used in place of a number block)

<img src='./documentation/setxy.svg' />

Move turtle to position xcor, ycor; (0, 0) is in the center of the screen.

<img src='./documentation/x.svg' />

Current x-coordinate value of the turtle (can be used in place of a number block)

<img src='./documentation/y.svg' />

Current y-coordinate value of the turtle (can be used in place of a number block)

Pen Palette
-----------

<img src='./documentation/set_color.svg' />

Set color of the line drawn by the turtle (hue, shade, and grey).

<img src='./documentation/color.svg' />

Current pen color (can be used in place of a number block)

<img src='./documentation/set_hue.svg' />

Set hue of the line drawn by the turtle (hue is the spectral color, e.g., red, orange, yellow, green, blue, purple, etc.).

<img src='./documentation/set_shade.svg' />

Set shade of the line drawn by the turtle (shade is lightness, e.g., black, grey, white).

<img src='./documentation/shade.svg' />

Current pen shade (can be used in place of a number block)

<img src='./documentation/set_grey.svg' />

Set grey level of the line drawn by the turtle (grey is vividness or saturation).

<img src='./documentation/grey.svg' />

Current grey level (can be used in place of a number block)

<img src='./documentation/set_pen_size.svg' />

Set size of the line drawn by the turtle.

<img src='./documentation/pen_size.svg' />

Current pen size (can be used in place of a number block)

<img src='./documentation/pen_up.svg' />

Turtle will not draw when moved.

<img src='./documentation/pen_down.svg' />

Turtle will draw when moved.

<img src='./documentation/fill.svg' />

Draw filled polygon.

<img src='./documentation/hollow.svg' />

Set pen attribute to hollow line mode (useful for working with 3D printers).

<img src='./documentation/set_font.svg' />

Set the font of the text drawn with Show Block.

<img src='./documentation/background.svg' />

Set the background color.

Number Palette
--------------

<img src='./documentation/number.svg' />

Use as numeric input in mathematic operators (click to change the value).

<img src='./documentation/random.svg' />

Returns random number between minimum (top) and maximum (bottom) values

<img src='./documentation/one-of.svg' />

Returns one of two inputs as determined by a coin toss (random selection)

<img src='./documentation/plus.svg' />

Adds two numeric inputs (also can be used to concatenate two strings)

<img src='./documentation/subtract.svg' />

Subtracts bottom numeric input from top numeric input

<img src='./documentation/multiply.svg' />

Multiplies two numeric inputs

<img src='./documentation/divide.svg' />

Divides top numeric input (numerator) by bottom numeric input (denominator)

<img src='./documentation/sqrt.svg' />

Calculates square root

<img src='./documentation/int.svg' />

Converts real numbers to integers

<img src='./documentation/mod.svg' />

Returns top input modular (remainder) bottom input.

<img src='./documentation/eval.svg' />

A programmable block used to add advanced single-variable math equations, e.g., sin(x).

Boolean Palette
---------------

<img src='./documentation/greater_than.svg' />

Logical greater-than operator

<img src='./documentation/less_than.svg' />

Logical less-than operator

<img src='./documentation/equal.svg' />

Logical equal-to operator

<img src='./documentation/and.svg' />

Logical AND operator

<img src='./documentation/or.svg' />

Logical OR operator

<img src='./documentation/not.svg' />

Logical NOT operator

Flow Palette
------------

<img src='./documentation/repeat.svg' />

Loops specified number of times through enclosed blocks

<img src='./documentation/forever.svg' />

Loops forever through enclosed blocks

<img src='./documentation/stop.svg' />

Stops current loop or action

<img src='./documentation/if.svg' />

If-then operator that uses boolean operators to determine whether or not to run encloded "flow"

<img src='./documentation/until.svg' />

Do-until-True operator that uses boolean operators to determine how long to run enclosed "flow"

<img src='./documentation/wait_for.svg' />

Waits for condition

<img src='./documentation/while.svg' />

Do-while-True operator that uses boolean operators to determine how long to run enclosed "flow"

<img src='./documentation/if_else.svg' />

If-then-else operator that uses boolean operators to determine which encloded "flow" to run

Boxes Palette
-------------

<img src='./documentation/storein.svg' />

Stores value in named variable.

<img src='./documentation/box_value.svg' />

Named variable

<img src='./documentation/add_1_to.svg' />

Adds 1 to named variable

<img src='./documentation/add_to.svg' />

Adds numeric value to named variable

<img src='./documentation/box.svg' />

Named variable (name is passed as input)

Action Palette
--------------

<img src='./documentation/action_flow.svg' />

Top of nameable action stack

<img src='./documentation/action.svg' />

Invokes named action stack

<img src='./documentation/do_arg.svg' />

Invokes an action stack with arguments (To add more arguments, drag them into the clamp.)

<img src='./documentation/calc.svg' />

Invokes an action stack that returns a value

<img src='./documentation/calc_arg.svg' />

Invokes an action stack with arguments that returns a value

<img src='./documentation/return.svg' />

Returns a value from an action stack

<img src='./documentation/arg.svg' />

An argument passed to an action stack

<img src='./documentation/arg1.svg' />

The first argument passed to an action stack

<img src='./documentation/start.svg' />

Connects action to toolbar run buttons (each Start Block invokes its own turtle)

<img src='./documentation/do.svg' />

Invokes named action stack (name is passed as input)

<img src='./documentation/event_on_do.svg' />

Connects an action with an event

<img src='./documentation/broadcast.svg' />

Broadcasts an event (event name is given as input)

Media Palette
-------------

<img src='./documentation/speak.svg' />

Speaks text

<img src='./documentation/show.svg' />

Draws text or shows media (from the camera, the Web, or the file system).

<img src='./documentation/size_shell_image.svg' />

Puts a custom "shell" on the turtle (used to turn a turtle into a "sprite")

<img src='./documentation/text.svg' />

Text (string) value

<img src='./documentation/load-media.svg' />

Opens a file-open dialog to load an image (used with Show Block)

<img src='./documentation/camera.svg' />

Accesses webcam (used with Show Block)

<img src='./documentation/video.svg' />

Opens a file-open dialog to load a video (used with Show Block)

<img src='./documentation/open_file.svg' />

Returns the selected file (used with Show Block)

<img src='./documentation/stop_media.svg' />

Stops the media being played

<img src='./documentation/tone.svg' />

Plays a tone at frequency (Hz) and duration (in seconds)

<img src='./documentation/note_to_frequency.svg' />

Converts notes to frequency, e.g., A4 --> 440 Hz.

Sensor Palette
--------------

<img src='./documentation/time.svg' />

Elapsed time (in seconds) since program started

<img src='./documentation/mouse_x.svg' />

Returns mouse X coordinate

<img src='./documentation/mouse_y.svg' />

Returns mouse Y coordinate

<img src='./documentation/mouse_button.svg' />

Returns True if mouse button is pressed

<img src='./documentation/keyboard.svg' />

Holds results of query-keyboard block as ASCII

<img src='./documentation/pixel_color.svg' />

Returns pixel color under turtle

<img src='./documentation/loudness.svg' />

Microphone input volume

<img src='./documentation/click.svg' />

The "click" event associated with a turtle (used with Do Block)

Heap Palette
------------

<img src='./documentation/push.svg' />

Push a value onto the heap.

<img src='./documentation/pop.svg' />

Pop a value off of the heap.

<img src='./documentation/index_heap.svg' />

Reference an entry in the heap.

<img src='./documentation/set_heap_entry.svg' />

Change an entry in the heap.

<img src='./documentation/show_heap.svg' />

Display the contents of the heap.

<img src='./documentation/heap_length.svg' />

The length of the heap.

<img src='./documentation/empty_heap.svg' />

Empty the heap.

<img src='./documentation/heap_empty.svg' />

True is the heap is empty.

<img src='./documentation/save_heap.svg' />

Save the heap to a file (JSON-encoded).

<img src='./documentation/load_heap.svg' />

Load the heap from a file (JSON-encoded).

Extras Palette
--------------

<img src='./documentation/vspace.svg' />

Used to layout blocks vertically

<img src='./documentation/hspace.svg' />

Used to layout blocks horizontally

<img src='./documentation/wait.svg' />

Pauses turtle a specified number of seconds

<img src='./documentation/print.svg' />

Prints value

<img src='./documentation/save_svg.svg' />

Saves turtle graphics as an SVG file

<img src='./documentation/show_blocks.svg' />

Shows blocks and runs slowly (used to isolate code during debugging)

<img src='./documentation/hide_blocks.svg' />

Hides blocks and runs at full speed (used to isolate code during debugging)

<img src='./documentation/play_back.svg' />

Plays media

<img src='./documentation/stop_play.svg' />

Stops playing media
