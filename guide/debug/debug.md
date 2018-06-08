# Debugging in Turtle Blocks

*Learning is hard fun.*&mdash;Marvin Minsky

*Make the complicated comprehensible*&mdash;Arthur Miller

*Debugging is the learning opportunity of the 21st Century.* &mdash;
Cynthia Solomon

*The important message that comes from ideas about debugging is that
we learn from our mistakes; that the intricate process of making
things work or learning new skills has to do with hypothesizing,
testing, revising, etc.*&mdash;Cynthia Solomon

*Sometimes bugs are serendipitously adopted as features worth
perpetuating, sometimes procedures must be constructed to deal with
the phenomena caused by their appearance, and sometimes the bugs and
their side effect need to be removed. But in this pursuit, children
become creative researchers studying behavior, making up theories,
trying out ideas, etc.*&mdash;Cynthia Solomon

*6 Stages of Debugging*&mdash;Anonymous
1. That can't happen.
2. That doesn't happen on my machine.
3. That shouldn't happen.
4. Why does that happen?
5. Oh, I see.
6. How did that ever work?

----

Programming is hard. Art and Design is Fun. Both programming
and drawing involve some trial and error and serendipity. Inevitably
you will make mistakes along the way. Turtle Blocks provides a number
of mechanism, reviewed below, to help you explore ideas and find
mistakes.

## 1. Clicking on an individual stack of blocks

The *Play* button (in top left corner) will run all of the *Start*
blocks simultenously. (Every Turtle Blocks project has at least one
*Start* block). But you can also run an individual stack of code by
clicking on a stack. This lets you test and debug small sections of
code, or, as in the example below, you can play a single voice by
clicking on one of the *Start* blocks or single phase by clicking on
one of the *Action* blocks.

![alt tag](https://github.com/vaibhavdaren/turtleblocksjs/blob/master/guide/debug/actionblock-card.gif "Start blocks")

## 2. Print and Comment blocks


Probably the most oft-used debugging aid in any language is the print
statement. In Turtle Blocks, it is also quite useful. You can use it
to examine the value of parameters and variables (boxes) and to
monitor progress through a program.

The *Print* block (found on the *Extras* palette) can be used to print
a message while running a program. It is useful to determine if a
section of code is being executed when expected or if a box or
parameter contains an expected value.

<img src='https://rawgithub.com/sugarlabs/turtleblocksjs/master/guide/debugging1.svg' />

In this example, we use the addition operator to concatinate strings
in a print statement. The mouse x + ", " + mouse y are printed in the
inner loop. [RUN
LIVE](https://turtle.sugarlabs.org/index.html?id=1523391206069261&run=True)

<img src='https://github.com/vaibhavdaren/turtleblocksjs/blob/master/guide/debug/print-blockd.gif' />


The *Comment* block (also found on the *Extras* palette) is similar to
the *Print* block, except it only prints a message when the program is
being run in *Playback Slow* mode (See below). Comments are also
written to the [browser console](https://github.com/vaibhavdaren/turtleblocksjs/blob/master/guide/debug/debug.md#6-browser-console).

In this example, we use the comment block to get the value returned by the random block. [RUN
LIVE](https://turtle.sugarlabs.org/index.html?id=1528365709862799&run=True)

![alt tag](https://github.com/vaibhavdaren/turtleblocksjs/blob/master/guide/debug/comment-block.gif "Comment block")




## 3. Status widget

<img src='https://rawgithub.com/sugarlabs/turtleblocksjs/master/guide/status1.svg' />

<img src='https://rawgithub.com/sugarlabs/turtleblocksjs/master/guide/status2.svg' />

The *Status widget* is a tool for inspecting the status of Turtle
Blocks as it is running. By default the turtle co-ordinates and header are
displayed. There is one row per turtle in the status table.


![alt tag](https://github.com/vaibhavdaren/turtleblocksjs/blob/master/guide/debug/status-block.gif "using the Status block")

Additional *Print* blocks can be added to the *Status* widget to
display additional turtle factors and graphics factors 
e.g.box values, x, y, heading, color, shade, grey, and pensize.

![alt tag](https://github.com/vaibhavdaren/turtleblocksjs/blob/master/guide/debug/status-parameter.gif "additional factors within the Status block")

In this example, we use the status block to get the value of x,y,heading and colour . [RUN
LIVE](https://turtle.sugarlabs.org/index.html?id=1528365709862799&run=True)

You can also do additional programming within the status block. 


## 4. Playback modes

A "long press" on the *Play* button will invoke *Playback Slow*
mode. The program will pause between the execution of each block and
the block being executed will be highlighted. This is useful for
following program flow, ensuring that the sequence of blocks being
executed is what you expect. In addition, the value stored in any box
or parameter is displayed on the block as the program runs, so you can
"inspect" program elements as the program runs.


 *Run Step by Step*  advance one block per button press.
 
 
Clicking on the *Play* button will play your program at full
speed. (It will also hide the blocks while the program runs, which
improves performance.) 

![alt tag](https://github.com/vaibhavdaren/turtleblocksjs/blob/master/guide/debug/playback-buttons.gif "PlayBack Modes")
The above example show all the playback modes in order mentioned above.
First we started with *Playback Slow* moved on to  *Run Step by Step*  and finaly ended execution of remaining code with *play*


## 5. Show and Hide blocks

The *Show* and *Hide* blocks (found on the *Extras* palette) are
useful for setting
"[breakpoints](https://en.wikipedia.org/wiki/Breakpoint)" in your
program to debug a specific section of code. By putting a *Show* block
at the start of a problematic section of code and a *Hide* block at
the end of the section, your program can be run full speed until it
gets to the *Show* block. Then the blocks are blocks are displayed and
run in *Playback Slow* mode. When the *Hide* block is encountered, the
blocks are hidden and the program resumes running at full speed.

## 6. Browser console

As Turtle Blocks runs, some debugging information is written to the
browser console, such as the notes being played and comments (See the
*Comment* block above). The console can be accessed by typing
`Ctrl-Shift-J` on most web browsers.

![alt tag]( https://github.com/vaibhavdaren/turtleblocksjs/blob/master/guide/debug/console-output.PNG "Console blocks")

Shown above is the console output from Example:[10 turtle Experiment](https://turtle.sugarlabs.org/index.html?id=1525269509421918&run=True)
