Guide to Using Turtle Art JS
============================

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

TO SQUARE
---------

The traditional introduction to Logo has been to draw a square. Often times when running a workshop, I have the learners form a circle around one volunteer, the "turtle", and invite them to instruct the turtle to draw a square. (I coach the volunteer beforehand to take every command literally, as does our graphical turtle.) Eventually the group converges on "go forward some number of steps", "turn right (or left) 90 degrees", "go forward some number of steps", "turn right (or left) 90 degrees", "go forward some number of steps", "turn right (or left) 90 degrees", "go forward some number of steps". It is only on rare occasions that the group includes a final "turn right (or left) 90 degrees" in order to return the turtle to its original orientation. At this point I introduce the concept of "repeat" and then we start in with programming with Turtle Blocks.

1.
--

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide/drawing1.svg'</img>
A single line of length 100

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide/drawing2.svg'</img>
Changing the line length to 200

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide/drawing3.svg'</img>
Adding a right turn of 90 degrees. Running this stack four times produces a square.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide/drawing4.svg'</img>
Forward, right, forward, right, ...

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide/drawing5.svg'</img>
Using the Repeat block from the flow palette

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide/drawing8.svg'</img>
Using the Arc block to make rounded corners

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide/drawing9.svg'</img>
Using the Begin and End Fill blocks to make a solid square

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide/drawing10.svg'</img>
Changing the color to 70 (blue)

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide/drawing11.svg'</img>
Using the Random block to select a random color (0 to 100)

2. Boxes
--------


3. Actions
----------
<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide/drawing6.svg'</img>
Defining an action to create a new block, "square"

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide/drawing7.svg'</img>
Using the "square" block
