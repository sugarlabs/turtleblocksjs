Using Turtle Art JS
===================

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

Toolbar Buttons
---------------

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/fast-button.png'</img>
Making the turtle move faster

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/slow-button.png'</img>
Making the turtle move slower

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/step-button.png'</img>
Making the turtle move step by step (Turtle moves one step once clicked).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/stop-turtle-button.png'</img>
Stopping the current project

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/clear-button.png'</img>
Clear the screen and return the turtles to their initial positions.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/palette-button.png'</img>
Hide or show the block palettes.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/hide-blocks-button.png'</img>
Hide or show the blocks and the palettes.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/collapse-blocks-button.png'</img>
Expand or collapse stacks of blocks, e.g, start and action stacks.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/help-button.png'</img>
Show these messages.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/menu-button.png'</img>
Expands or Collapses the auxillary toolbar.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/planet-button.png'</img>
Opens a viewer for loading example projects.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/copy-button.png'</img>
Copies blocks onto the clipboard.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/paste-button.png'</img>
Pastes blocks from the clipboard.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/Cartesian-button.png'</img>
Show or hide a Cartesian-coordinate grid.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/polar-button.png'</img>
Show or hide a polar-coordinate grid.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/plugin-button.png'</img>
Load new blocks/plugin from the file system.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/empty-trash-button.png'</img>
Remove all content on the canvas, including the blocks.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/restore-trash-button.png'</img>
Restore blocks from the trash.

Basic Blocks
------------

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/clear.svg'</img>
Clears the screen and reset the turtle.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/forward.svg'</img>
Moves turtle forward.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/right.svg'</img>
Turns turtle clockwise (angle in degrees).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/back.svg'</img>
Moves turtle backward.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/left.svg'</img>
Turns turtle counterclockwise (angle in degrees).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/arc.svg'</img>
Moves turtle along an arc.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/set_heading.svg'</img>
Sets the heading of the turtle (0 is towards the top of the screen)

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/heading.svg'</img>
Holds current heading value of the turtle (can be used in place of a number block).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/setxy.svg'</img>
Moves turtle to position xcor, ycor; (0, 0) is in the center of the screen.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/x.svg'</img>
Holds current x-coordinate value of the turtle (can be used in place of a number block).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/y.svg'</img>
Holds current y-coordinate value of the turtle (can be used in place of a number block).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/set_color.svg'</img>
Sets color of the line drawn by the turtle.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/color.svg'</img>
Holds current pen color (can be used in place of a number block).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/set_hue.svg'</img>
Sets hue of the line drawn by the turtle.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/set_shade.svg'</img>
Sets shade of the line drawn by the turtle.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/shade.svg'</img>
Holds current pen shade.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/set_grey.svg'</img>
Sets grey level of the line drawn by the turtle.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/grey.svg'</img>
Holds current grey level (can be used in place of a number block).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/set_pen_size.svg'</img>
Sets size of the line drawn by the turtle.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/pen_size.svg'</img>
Holds current pen size (can be used in place of a number block).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/pen_up.svg'</img>
Turtle will not draw when moved.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/pen_down.svg'</img>
Turtle will draw when moved.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/begin_fill.svg'</img>
Starts filled polygon (used with end fill block).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/end_fill.svg'</img>
Completes filled polygon (used with start fill block).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/set_font.svg'</img>
Sets the font of the text.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/background.svg'</img>
Sets the background color.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/number.svg'</img>
Used as numeric input in mathematic operators.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/random.svg'</img>
Returns random number between minimum (top) and maximum (bottom) values.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/plus.svg'</img>
Adds two alphanumeric inputs.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/subtract.svg'</img>
Subtracts bottom numeric input from top numeric input.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/multiply.svg'</img>
Multiplies two numeric inputs.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/divide.svg'</img>
Divides top numeric input (numerator) by bottom numeric input (denominator).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/sqrt.svg'</img>
Calculates square root.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/int.svg'</img>
Used as int input in mathematic operators.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/mod.svg'</img>
Modular (remainder) operator.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/eval.svg'</img>
A programmable block: used to add advanced single-variable math equations, e.g., sin(x).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/greater_than.svg'</img>
Logical greater-than operator.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/less_than.svg'</img>
Logical less-than operator.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/equal.svg'</img>
Logical equal-to operator.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/and.svg'</img>
Logical AND operator.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/or.svg'</img>
Logical OR operator.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/not.svg'</img>
Logical NOT operator.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/repeat.svg'</img>
Loops specified number of times.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/forever.svg'</img>
Loops forever.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/stop.svg'</img>
Stops current action.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/if.svg'</img>
If-then operator that uses boolean operators from Numbers palette.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/until.svg'</img>
Do-until-True operator that uses boolean operators from numbers palette.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/wait_for.svg'</img>
Wait.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/while.svg'</img>
Do-while-True operator that uses boolean operators from numbers palette.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/if_else.svg'</img>
If-then-else operator that uses boolean operators from Numbers palette.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/name_box_value.svg'</img>
Stores numeric value in named variable.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/box_value.svg'</img>
Named variable (numeric value).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/add_1_to.svg'</img>
Adds 1 to named variable.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/add_to.svg'</img>
Adds numeric value to named variable.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/box.svg'</img>
Named variable (numeric value).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/action_flow.svg'</img>
Top of nameable action stack.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/action.svg'</img>
Invokes named action stack.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/start.svg'</img>
Connects action to toolbar run buttons.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/do.svg'</img>
Invokes named action stack.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/event_on_do.svg'</img>
Connect an event with any signal/action.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/broadcast.svg'</img>
Broadcast named event.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/speak.svg'</img>
Speaks text.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/show.svg'</img>
Draws text or show media from the Journal.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/size_shell_image.svg'</img>
Put a custom shell on the turtle.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/text.svg'</img>
String value.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/open_file.svg'</img>
Returns the selected file.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/stop_media.svg'</img>
Stops the media being played.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/tone.svg'</img>
Plays a tone at frequency and duration(in seconds).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/note_to_frequency.svg'</img>
Changes the note of frequency.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/time.svg'</img>
Elapsed time(in seconds) since program started.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/mouse_x.svg'</img>
Returns mouse X co-ordinate.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/mouse_y.svg'</img>
Returns mouse Y co-ordinate.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/mouse_button.svg'</img>
Returs true if mouse button is pressed.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/keyboard.svg'</img>
Holds results of query-keyboard block as ASCII.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/pixel_color.svg'</img>
Returns pixel color.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/loudness.svg'</img>
Microphone input volume.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/click.svg'</img>
Connects to click action.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/vspace.svg'</img>
Jogs stack down.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/hspace.svg'</img>
Jogs stack right.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/wait.svg'</img>
Pauses program execution a specified number of seconds.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/print.svg'</img>
Prints value in status block at bottom of the screen.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/save_svg.svg'</img>
Saves turtle graphics as an SVG file in the Sugar Journal.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/show_blocks.svg'</img>
Restores hidden blocks.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/hide_blocks.svg'</img>
Declutters canvas by hiding blocks.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/play_back.svg'</img>
Play the media.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/stop_play.svg'</img>
Stops the playing media.
