<?php
/*
TODO:
 @@@ DONE @@@  build editor by using inverse transformations
 @@@ DONE @@@  display the level title and other info (your best, house best, etc.) on starting the level
 @@@ DONE @@@  either use the titles or lose them.
 @@@ DONE @@@  load the next level in advance while playing the current one
 @@@ DONE @@@  split the PHP and Javascript into separate files
 @@@ DONE @@@  remove X button from popup window
 @@@ DONE @@@  add a simple intor screen
 @@@ DONE @@@  cache images before game play
 @@@ DONE @@@  add abillity to disable popup info
 - store that preference as a cookie
 - fix the congratulatory screen - make it not a pop-up window
 - auto-generate levels?
 - add system for selecting a level
 - add an info box for each level, showing best scoring player, title, etc.
 - add a "main" screen with links to credits and high scores
 - remove the "dump" link and the pull the corresponding code out of the public version
 - clean up the rotateNeighbours function to use matricies

System for ranking the difficulty of a level:
Record how many steps are taken by any player to solve it, and use those
stats to work out the difficulty.  Perhaps in each level, subtract the
minumum steps taken from all tallies, and find the average steps taken
that are greater than the minimum.  The resulting number could be the
difficulty.  Resetting needs to be accounted for too.


*/
ini_set('display_errors', 1); 
error_reporting(E_ALL);

$level = array(
	array(
		'title' => 'One Stop Shop',
		'best' => 1,
		'cells' => array(
			'flipNeighbours' => array(2,1,0, 3,1,0, 1,2,0, 3,2,0, 1,3,0, 2,3,0,
			2,0,1, 3,0,1, 4,0,1, 1,1,1, 4,1,1, 0,2,1, 2,2,1, 4,2,1, 0,3,1, 3,3,1, 0,4,1, 1,4,1, 2,4,1, ),
		),
		'offset' => array(-156, 122),
		'hint' => "<h2 style=\"text-align:center\">Objective</h2>
		<img src=\"images/button1/button1_07.png\" style=\"float:right;margin:5px\"/>
		<p>Each tile in the game has a <i>coloured active side</i> and a <i>dark inactive side</i>.  The goal is to flip all tiles to show their active side.</p><br/>
		<img src=\"images/button1/button1_00.png\" style=\"float:left;margin:5px\"/>
		<h3>Blue Switchers</h3>
		<p>Clicking the blue switcher tile will cause all neighbouring tiles to be flipped (but not itself).</p>
		"

	),
	array(
		'title' => 'Tiny Snowflake',
		'best' => 3,
		'cells' => array(
			'flipNeighbours' => array(2,0,0, 4,2,0, 0,4,0, 4,0,0, 2,1,0, 3,1,0, 0,2,0, 1,2,0, 3,2,0, 1,3,0, 2,3,0, 2,4,0,
			3,0,1, 1,1,1, 4,1,1, 2,2,1, 0,3,1, 3,3,1, 1,4,1, ),
		),
		'offset' => array(-156, 122),
	),
	array(
		'title' => 'Three of a kind',
		'best' => 3,
		'cells' => array(
			'flipNeighbours' => array(2,0,0, 3,0,0, 1,1,0, 4,1,0, 2,2,0, 4,2,0, 0,3,0, 3,3,0, 0,4,0, 1,4,0,
			4,0,1, 2,1,1, 3,1,1, 0,2,1, 1,2,1, 3,2,1, 1,3,1, 2,3,1, 2,4,1, ),
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Six Corners',
		'best' => 4,
		'cells' => array(
			'flipNeighbours' => array(2,0,0,  3,0,1,  4,0,0,  1,1,1,  2,1,1,  3,1,1,  4,1,1,  0,2,0,  1,2,1,  2,2,1,  3,2,1,  4,2,0,  0,3,1,  1,3,1,  2,3,1,  3,3,1,  0,4,0,  1,4,1,  2,4,0),
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Corner Clicks',
		'best' => 4,
		'cells' => array(
			'flipNeighbours' => array(2,0,1,  3,0,0,  4,0,0,  1,1,0,  4,1,1,  3,2,0,  2,1,0,  1,3,0,  0,2,0,  1,2,0,  4,2,0,  0,3,1,  3,1,0,  2,3,0,  3,3,0,  0,4,0,  1,4,0,  2,4,1,  2,2,1,  ),
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Parallels',
		'best' => 3,
		'cells' => array(
			'flipNeighbours' => array(2,0,1,  3,0,0,  4,0,1,  1,1,1,  4,1,0,  3,2,0,  2,1,0,  1,3,1,  0,2,1,  1,2,0,  4,2,1,  0,3,0,  3,1,1,  2,3,0,  3,3,1,  0,4,1,  1,4,0,  2,4,1,  2,2,1,  ),
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Quick\'n\'Easy',
		'best' => 3,
		'cells' => array(
			'flipNeighbours' => array(2,0,1,  3,0,1,  4,0,0,  1,1,1,  4,1,1,  3,2,1,  2,1,0,  1,3,1,  0,2,0,  1,2,1,  4,2,0,  0,3,1,  3,1,1,  2,3,0,  3,3,1,  0,4,0,  1,4,1,  2,4,1,  2,2,1,  ),
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Chevron',
		'best' => 5,
		'cells' => array(
			'flipNeighbours' => array(2,0,0, 3,0,0, 4,0,0, 0,2,0, 0,3,0, 0,4,0,
			1,1,1, 2,1,1, 3,1,1, 4,1,1, 1,2,1, 2,2,1, 3,2,1, 4,2,1, 1,3,1, 2,3,1, 3,3,1, 1,4,1, 2,4,1, ),
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Point to Point',
		'best' => 5,
		'cells' => array(
			'flipNeighbours' => array(2,0,0,  3,0,1,  4,0,1,  1,1,1,  4,1,1,  3,2,1,  2,1,1,  1,3,1,  0,2,1,  1,2,1,  4,2,1,  0,3,1,  3,1,1,  2,3,1,  3,3,1,  0,4,1,  1,4,1,  2,4,0,  2,2,1,  ),
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Button Up',
		'best' => 8,
		'cells' => array(
			'flipNeighbours' => array(1,2,0, 3,2,0, 2,1,1, 3,1,1, 1,3,1, 2,3,1, 2,0,1, 3,0,1, 4,0,1, 1,1,1, 4,1,1, 0,2,1, 2,2,1, 4,2,1, 0,3,1, 3,3,1, 0,4,1, 1,4,1, 2,4,1, )
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'ZigZag',
		'best' => 7,
		'cells' => array(
			'flipNeighbours' => array(2,0,0,  3,0,0,  4,0,1,  1,1,0,  2,1,1,  3,1,0,  4,1,1,  0,2,0,  1,2,0,  2,2,1,  3,2,0,  4,2,0,  0,3,1,  1,3,0,  2,3,1,  3,3,0,  0,4,1,  1,4,0,  2,4,0,  ),
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Bull\'s Eye',
		'best' => 6,
		'cells' => array(
			'flipNeighbours' =>  array(5,2,0, 6,2,0, 7,2,0, 8,2,0, 4,3,0, 8,3,0, 3,4,0, 5,4,0, 6,4,0, 8,4,0, 2,5,0, 4,5,0, 6,5,0, 8,5,0, 2,6,0, 4,6,0, 5,6,0, 7,6,0, 2,7,0, 6,7,0, 2,8,0, 3,8,0, 4,8,0, 5,8,0, 
			5,1,1, 6,1,1, 7,1,1, 8,1,1, 9,1,1, 4,2,1, 9,2,1, 3,3,1, 5,3,1, 6,3,1, 7,3,1, 9,3,1, 2,4,1, 4,4,1, 7,4,1, 9,4,1, 1,5,1, 3,5,1, 5,5,1, 7,5,1, 9,5,1, 1,6,1, 3,6,1, 6,6,1, 8,6,1, 1,7,1, 3,7,1, 4,7,1, 5,7,1, 7,7,1, 1,8,1, 6,8,1, 1,9,1, 2,9,1, 3,9,1, 4,9,1, 5,9,1, ),
		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Pond Ripples',
		'best' => 8,
		'cells' => array(
			'flipNeighbours' => array(6,2,0, 8,2,0, 4,3,0, 8,3,0, 6,4,0, 8,4,0, 2,5,0, 4,5,0, 6,5,0, 8,5,0, 5,6,0, 7,6,0, 2,7,0, 6,7,0, 3,8,0, 5,8,0, 6,1,0, 8,1,0, 4,2,0, 6,3,0, 2,4,0, 4,4,0, 1,6,0, 3,6,0, 4,7,0, 1,8,0, 2,9,0, 4,9,0, 5,2,1, 7,2,1, 3,4,1, 5,4,1, 2,6,1, 4,6,1, 2,8,1, 4,8,1, 5,1,1, 7,1,1, 9,1,1, 9,2,1, 3,3,1, 5,3,1, 7,3,1, 9,3,1, 7,4,1, 9,4,1, 1,5,1, 3,5,1, 5,5,1, 7,5,1, 9,5,1, 6,6,1, 8,6,1, 1,7,1, 3,7,1, 5,7,1, 7,7,1, 6,8,1, 1,9,1, 3,9,1, 5,9,1 )
		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Hopalang',
		'best' => 8,
		'cells' => array(
			'flipNeighbours' => array(8,0,1,  0,3,0),
			'rotateNeighbours' => array(0,4,1,  2,3,1,  4,2,1,  6,1,1)
		),
		'offset' => array(-60, 66),
		'hint' => "<h2 style=\"text-align:center\">Spinners</h2><img src=\"images/button2/button2_00.png\" style=\"float:left;margin:2em\"/><p>This is the spinner, which you might say adds a &quot;twist&quot; to the game.  Rather than switching the state of its neighbours, it instead rotates them clockwise around itself.</p>"
	),
	array(
		'title' => 'Like a Record Baby',
		'best' => 6,
		'cells' => array(
			'flipNeighbours' => array(2,0,1,  3,0,1,  1,1,1,  2,1,0,  3,1,0,  4,1,1,  1,2,0,  3,2,0,  4,2,1,  0,3,1,  1,3,0,  2,3,0,  3,3,1,  0,4,1,  1,4,1),
			'rotateNeighbours' => array(2,2,1)
		),
		'offset' => array(-156, 122),
	),
	array(
		'title' => 'Flip\'n\'Switch',
		'best' => 5,
		'cells' => array(
			'flipNeighbours' => array(2,0,1,  3,0,1,  4,0,1,  1,1,1,  2,1,0,  3,1,1,  4,1,1,  0,2,1,  1,2,1,  3,2,1,  4,2,1,  0,3,1,  1,3,1,  2,3,0,  3,3,1,  0,4,1,  1,4,1,  2,4,1),
			'rotateNeighbours' => array(2,2,1)
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Double the fun',
		'best' => 5,
		'cells' => array(
			'flipNeighbours' => array(2,1,0, 1,2,0, 3,2,0, 2,3,0, 2,0,1, 3,0,1, 4,0,1, 1,1,1, 3,1,1, 4,1,1, 0,2,1, 4,2,1, 0,3,1, 1,3,1, 3,3,1, 0,4,1, 1,4,1, 2,4,1),
			'rotateNeighbours' => array(2,2,1)
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'A Pocket Full of Posies',
		'best' => 6,
		'cells' => array(
			'flipNeighbours' => array(2,1,0, 3,1,0, 1,2,0, 3,2,0, 1,3,0, 2,3,0, 2,0,1, 3,0,1, 4,0,1, 1,1,1, 4,1,1, 0,2,1, 4,2,1, 0,3,1, 3,3,1, 0,4,1, 1,4,1, 2,4,1),
			'rotateNeighbours' => array(2,2,1)
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Fan Blades',
		'best' => 6,
		'cells' => array(
			'flipNeighbours' => array(4,1,1,  4,2,0,  4,0,1,  3,1,0,  2,3,0,  0,2,1,  3,0,0,  2,2,1,  1,4,1,  2,0,0,  3,3,0,  1,2,0,  0,4,0,  1,1,1,  0,3,0,  2,4,1,  ),
			'rotateNeighbours' => array(3,2,1,  2,1,1,  1,3,1,  ),
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Flip\'n\'Switch II',
		'best' => 5,
		'cells' => array(
			'flipNeighbours' => array(2,2,0,  0,3,1,  4,0,1,  4,1,1,  4,2,1,  0,2,1,  1,2,1,  0,4,1,  3,3,1,  3,1,1,  2,3,1,  1,1,1,  2,0,0,  3,0,1,  1,4,1,  2,4,1,  ),
			'rotateNeighbours' => array(3,2,1,  2,1,1,  1,3,1,  ),
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Six Corners II',
		'best' => 9,
		'cells' => array(
			'flipNeighbours' => array(0,4,0,  3,0,1,  4,0,0,  1,1,1,  4,1,1,  4,2,0,  0,2,0,  1,2,1,  2,0,0,  2,3,1,  3,3,1,  3,1,1,  1,4,1,  2,4,0,  0,3,1,  ),
			'rotateNeighbours' => array(2,1,1,  1,3,1,  3,2,1,  ),
		),
		'offset' => array(-156, 122),
	),
	array(
		'title' => 'Cat\'s Eye',
		'best' => 6,
		'cells' => array(
			'flipNeighbours' => array(2,0,1,  3,0,1,  4,0,0,  1,1,0,  4,1,1,  0,2,1,  1,4,1,  0,4,0,  4,2,1,  2,3,0,  3,1,0,  0,3,1,  3,3,0,  2,2,1,  1,2,0,  2,4,1,  ),
			'rotateNeighbours' => array(3,2,0,  2,1,0,  1,3,0,  ),
		),
		'offset' => array(-156, 122)
	),
	array(
		'title' => 'Honeycomb',
		'best' => 7,
		'cells' => array(
			'flipNeighbours' => array(3,0,1,  4,0,0,  5,0,0,  6,0,1,  2,1,0,  3,1,0,  4,1,1,  5,1,0,  6,1,0,  1,2,0,  2,2,1,  3,2,0,  4,2,0,  5,2,1,  6,2,0,  0,3,1,  1,3,0,  2,3,0,  3,3,1,  4,3,0,  5,3,0,  6,3,1,  0,4,0,  1,4,1,  2,4,0,  3,4,0,  4,4,1,  5,4,0,  0,5,0,  1,5,0,  2,5,1,  3,5,0,  4,5,0,  0,6,1,  1,6,0,  2,6,0,  3,6,1,  ),
		),
		'offset' => array(-107, 38) 
	),
	array(
		'title' => 'Cubic',
		'best' => 9,
		'cells' => array(
			'flipNeighbours' => array(3,0,1,  4,0,0,  5,0,1,  6,0,0,  2,1,0,  3,1,1,  4,1,0,  5,1,1,  6,1,1,  1,2,1,  2,2,0,  3,2,1,  4,2,0,  5,2,0,  6,2,0,  0,3,0,  1,3,1,  2,3,0,  3,3,1,  4,3,1,  5,3,1,  6,3,1,  0,4,1,  1,4,0,  2,4,1,  3,4,0,  4,4,0,  5,4,0,  0,5,0,  1,5,1,  2,5,0,  3,5,1,  4,5,1,  0,6,1,  1,6,0,  2,6,1,  3,6,0,  ),
		),
		'offset' => array(-107, 38) 
	),
	array(
		'title' => 'Asterisk',
		'best' => 18,
		'cells' => array(
			'flipNeighbours' => array(5,2,0, 8,2,0, 5,3,0, 7,3,0, 5,4,0, 6,4,0, 2,5,0, 3,5,0, 4,5,0, 6,5,0, 7,5,0, 8,5,0, 4,6,0, 5,6,0, 3,7,0, 5,7,0, 2,8,0, 5,8,0, 
			5,1,1, 6,1,1, 7,1,1, 8,1,1, 9,1,1, 4,2,1, 6,2,1, 7,2,1, 9,2,1, 3,3,1, 4,3,1, 6,3,1, 8,3,1, 9,3,1, 2,4,1, 3,4,1, 4,4,1, 7,4,1, 8,4,1, 9,4,1, 1,5,1, 5,5,1, 9,5,1, 1,6,1, 2,6,1, 3,6,1, 6,6,1, 7,6,1, 8,6,1, 1,7,1, 2,7,1, 4,7,1, 6,7,1, 7,7,1, 1,8,1, 3,8,1, 4,8,1, 6,8,1, 1,9,1, 2,9,1, 3,9,1, 4,9,1, 5,9,1, ),

		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Illusions',
		'best' => 7,
		'cells' => array(
			'flipNeighbours' => array(3,0,1,  4,0,0,  5,0,0,  6,0,1,  2,1,1,  3,1,0,  4,1,1,  5,1,0,  6,1,1,  1,2,1,  2,2,1,  4,3,1,  5,2,1,  6,2,1,  0,3,1,  1,3,0,  3,2,1,  5,3,0,  6,3,1,  0,4,0,  1,4,1,  2,4,1,  4,4,1,  5,4,0,  0,5,0,  1,5,0,  2,5,1,  3,5,0,  4,5,0,  0,6,1,  1,6,1,  2,6,1,  3,6,1,  4,2,1,  2,3,1,  3,4,1,  ),
			'rotateNeighbours' => array(3,3,1,  ),
		),
		'offset' => array(-107, 38) 
	),
	array(
		'title' => 'Ceiling Fan',
		'best' => 16,
		'cells' => array(
			'flipNeighbours' => array(9,1,0, 8,2,0, 7,3,0, 5,4,0, 1,5,0, 2,5,0, 3,5,0, 5,5,0, 6,5,0, 4,6,0, 5,7,0, 5,8,0, 5,9,0,
			9,0,1, 10,0,1, 8,1,1, 10,1,1, 7,2,1, 9,2,1, 6,3,1, 8,3,1, 1,4,1, 2,4,1, 3,4,1, 4,4,1, 6,4,1, 7,4,1, 0,5,1, 4,5,1, 0,6,1, 1,6,1, 2,6,1, 3,6,1, 5,6,1, 6,6,1, 4,7,1, 6,7,1, 4,8,1, 6,8,1, 4,9,1, 6,9,1, 4,10,1, 5,10,1, ),
		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Yin-Yang-San',
		'best' => 19,
		'cells' => array(
			'flipNeighbours' => array(6,1,0, 1,2,0, 2,6,0, 4,2,0, 2,3,0, 3,4,0,
			3,2,1, 5,0,1, 0,4,1, 4,3,1, 2,4,1, 4,5,1, 2,1,1, 1,6,1, 6,2,1, 5,2,1, 6,3,1, 4,0,1, 1,4,1, 0,3,1, 6,0,1, 5,4,1, 3,0,1, 3,6,1, 4,4,1, 2,5,1, 4,1,1, 2,2,1, 0,5,1, 0,6,1, ),
			'rotateNeighbours' => array(3,1,0, 5,1,0, 1,3,0, 5,3,0, 1,5,0, 3,5,0,
			3,3,0, ),
		),
		'offset' => array(-107, 38) 
	),
	array(
		'title' => 'Spiral',
		'best' => 18,
		'cells' => array(
			'flipNeighbours' => array(3,2,0, 4,2,0, 2,3,0, 5,0,0, 0,4,0, 4,5,0, 4,3,0, 2,4,0, 3,4,0, 2,1,0, 1,6,0, 6,2,0,
			6,0,1, 6,1,1, 6,3,1, 4,0,1, 2,2,1, 1,4,1, 4,1,1, 5,4,1, 3,0,1, 4,4,1, 1,2,1, 2,5,1, 3,6,1, 5,2,1, 2,6,1, 0,3,1, 0,5,1, 0,6,1, ),
			'rotateNeighbours' => array(3,1,0, 5,1,0, 1,3,0, 5,3,0, 1,5,0, 3,5,0,
			3,3,1, ),
		),
		'offset' => array(-107, 38)
	),
	array(
		'title' => 'Big Snowflake',
		'best' => 19,
		'cells' => array(
			'flipNeighbours' => array(5,0,1, 6,0,0, 7,0,1, 8,0,1, 9,0,0, 10,0,1, 4,1,0, 5,1,1, 6,1,0, 7,1,1, 8,1,0, 9,1,1, 10,1,0, 3,2,1, 4,2,0, 5,2,1, 6,2,0, 7,2,0, 8,2,1, 9,2,0, 10,2,1, 2,3,1, 3,3,1, 4,3,0, 5,3,1, 6,3,1, 7,3,1, 8,3,0, 9,3,1, 10,3,1, 1,4,0, 2,4,0, 3,4,0, 4,4,1, 5,4,0, 6,4,0, 7,4,1, 8,4,0, 9,4,0, 10,4,0, 0,5,1, 1,5,1, 2,5,1, 3,5,1, 4,5,0, 5,5,1, 6,5,0, 7,5,1, 8,5,1, 9,5,1, 10,5,1, 0,6,0, 1,6,0, 2,6,0, 3,6,1, 4,6,0, 5,6,0, 6,6,1, 7,6,0, 8,6,0, 9,6,0, 0,7,1, 1,7,1, 2,7,0, 3,7,1, 4,7,1, 5,7,1, 6,7,0, 7,7,1, 8,7,1, 0,8,1, 1,8,0, 2,8,1, 3,8,0, 4,8,0, 5,8,1, 6,8,0, 7,8,1, 0,9,0, 1,9,1, 2,9,0, 3,9,1, 4,9,0, 5,9,1, 6,9,0, 0,10,1, 1,10,0, 2,10,1, 3,10,1, 4,10,0, 5,10,1, ),
		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Biohazard',
		'best' => 19,
		'cells' => array(
			'flipNeighbours' => array(5,0,1, 6,0,1, 7,0,1, 8,0,1, 9,0,1, 10,0,1, 4,1,1, 5,1,1, 6,1,0, 7,1,0, 8,1,1, 9,1,1, 10,1,1, 3,2,1, 4,2,0, 5,2,1, 6,2,1, 7,2,0, 8,2,1, 9,2,1, 10,2,1, 2,3,1, 3,3,0, 4,3,1, 5,3,1, 6,3,1, 7,3,0, 8,3,0, 9,3,0, 10,3,1, 1,4,1, 2,4,1, 3,4,0, 4,4,1, 5,4,0, 6,4,0, 7,4,1, 8,4,1, 9,4,0, 10,4,1, 0,5,1, 1,5,1, 2,5,1, 3,5,0, 4,5,0, 5,5,1, 6,5,0, 7,5,1, 8,5,1, 9,5,1, 10,5,1, 0,6,1, 1,6,1, 2,6,0, 3,6,1, 4,6,0, 5,6,0, 6,6,1, 7,6,1, 8,6,0, 9,6,1, 0,7,1, 1,7,0, 2,7,1, 3,7,1, 4,7,1, 5,7,0, 6,7,0, 7,7,0, 8,7,1, 0,8,1, 1,8,0, 2,8,1, 3,8,1, 4,8,0, 5,8,1, 6,8,1, 7,8,1, 0,9,1, 1,9,1, 2,9,0, 3,9,0, 4,9,1, 5,9,1, 6,9,1, 0,10,1, 1,10,1, 2,10,1, 3,10,1, 4,10,1, 5,10,1, ),
		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Button Holes',
		'best' => 26,
		'cells' => array(
			'flipNeighbours' => array(5,2,0, 2,5,0, 8,5,0, 5,8,0, 5,0,1, 6,0,1, 7,0,1, 8,0,1, 9,0,1, 10,0,1, 4,1,1, 5,1,1, 6,1,1, 7,1,1, 8,1,1, 9,1,1, 10,1,1, 3,2,1, 4,2,1, 6,2,1, 7,2,1, 8,2,1, 9,2,1, 10,2,1, 2,3,1, 3,3,1, 4,3,1, 5,3,1, 6,3,1, 7,3,1, 8,3,1, 9,3,1, 10,3,1, 1,4,1, 2,4,1, 3,4,1, 4,4,1, 5,4,1, 6,4,1, 7,4,1, 8,4,1, 9,4,1, 10,4,1, 0,5,1, 1,5,1, 3,5,1, 4,5,1, 5,5,1, 6,5,1, 7,5,1, 9,5,1, 10,5,1, 0,6,1, 1,6,1, 2,6,1, 3,6,1, 4,6,1, 5,6,1, 6,6,1, 7,6,1, 8,6,1, 9,6,1, 0,7,1, 1,7,1, 2,7,1, 3,7,1, 4,7,1, 5,7,1, 6,7,1, 7,7,1, 8,7,1, 0,8,1, 1,8,1, 2,8,1, 3,8,1, 4,8,1, 6,8,1, 7,8,1, 0,9,1, 1,9,1, 2,9,1, 3,9,1, 4,9,1, 5,9,1, 6,9,1, 0,10,1, 1,10,1, 2,10,1, 3,10,1, 4,10,1, 5,10,1)
		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Sprockets',
		'best' => 24,
		'cells' => array(
			'flipNeighbours' => array(4,2,0, 7,1,0, 5,1,0, 8,1,0, 3,3,0, 6,1,0, 6,3,0, 9,2,0, 9,1,0, 9,3,0, 1,6,0, 1,5,0, 4,4,0, 7,4,0, 2,4,0, 8,6,0, 3,6,0, 6,6,0, 9,5,0, 9,4,0, 1,7,0, 1,9,0, 1,8,0, 4,7,0, 4,9,0, 7,7,0, 2,9,0, 5,9,0, 3,9,0, 6,8,0,
			4,3,1, 7,3,1, 7,2,1, 5,3,1, 8,3,1, 6,2,1, 7,6,1, 7,5,1, 2,6,1, 8,4,1, 3,5,1, 3,4,1, 4,8,1, 2,7,1, 5,7,1, 3,8,1, 3,7,1, 6,7,1, ),
			'rotateNeighbours' => array(
			5,2,1, 8,2,1, 2,5,1, 8,5,1, 2,8,1, 5,8,1, ),
		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Propeller',
		'best' => 6,
		'cells' => array(
			'flipNeighbours' => array(7,4,0, 4,5,0, 6,4,0, 4,4,0, 5,6,0, 4,7,0, 8,0,1, 9,0,1, 10,0,1, 7,1,1, 10,1,1, 10,2,1, 6,2,1, 8,3,1, 9,3,1, 3,3,1, 3,6,1, 4,3,1, 8,2,1, 9,1,1, 6,3,1, 2,3,1, 1,5,1, 5,4,1, 8,4,1, 0,5,1, 1,4,1, 4,6,1, 0,6,1, 3,4,1, 2,5,1, 6,5,1, 5,8,1, 7,6,1, 0,7,1, 1,7,1, 2,7,1, 4,8,1, 7,7,1, 3,8,1, 5,9,1, 7,8,1, 6,6,1, 4,10,1, 6,9,1, 3,9,1, 3,10,1, 5,10,1, ),
			'rotateNeighbours' => array(5,5,0, 8,1,1, 9,2,1, 7,3,1, 2,4,1, 3,5,1, 1,6,1, 5,7,1, 6,8,1, 4,9,1, ),
		),
		'offset' => array(-12, -127),
	),
	array(
		'title' => 'Tripod',
		'best' => 28,
		'cells' => array(
			'flipNeighbours' => array(5,0,0, 6,0,0, 4,1,0, 5,2,0, 6,2,0, 4,3,0, 5,4,0, 6,4,0, 8,4,0, 10,4,0, 4,5,0, 6,5,0, 8,5,0, 10,5,0, 4,6,0, 5,6,0, 7,6,0, 9,6,0, 2,7,0, 2,8,0, 3,8,0, 0,9,0, 0,10,0, 1,10,0,
			7,0,1, 8,0,1, 9,0,1, 10,0,1, 5,1,1, 6,1,1, 7,1,1, 8,1,1, 9,1,1, 10,1,1, 3,2,1, 4,2,1, 7,2,1, 8,2,1, 9,2,1, 10,2,1, 2,3,1, 3,3,1, 5,3,1, 6,3,1, 7,3,1, 8,3,1, 9,3,1, 10,3,1, 1,4,1, 2,4,1, 3,4,1, 4,4,1, 7,4,1, 9,4,1, 0,5,1, 1,5,1, 2,5,1, 3,5,1, 5,5,1, 7,5,1, 9,5,1, 0,6,1, 1,6,1, 2,6,1, 3,6,1, 6,6,1, 8,6,1, 0,7,1, 1,7,1, 3,7,1, 4,7,1, 5,7,1, 6,7,1, 7,7,1, 8,7,1, 0,8,1, 1,8,1, 4,8,1, 5,8,1, 6,8,1, 7,8,1, 1,9,1, 2,9,1, 3,9,1, 4,9,1, 5,9,1, 6,9,1, 2,10,1, 3,10,1, 4,10,1, 5,10,1, ),
		),
		'offset' => array(-12, -127)

	),
	array(
		'title' => 'Hex O\'Clock',
		'best' => 33,
		'cells' => array(
			'flipNeighbours' => array(6,1,0, 8,1,0, 4,2,0, 9,2,0, 2,4,0, 9,4,0, 5,5,0, 1,6,0, 8,6,0, 1,8,0, 6,8,0, 2,9,0, 4,9,0,
			5,0,1, 6,0,1, 4,1,1, 5,2,1, 6,2,1, 4,3,1, 5,4,1, 6,4,1, 8,4,1, 10,4,1, 4,5,1, 6,5,1, 8,5,1, 10,5,1, 4,6,1, 5,6,1, 7,6,1, 9,6,1, 2,7,1, 2,8,1, 3,8,1, 0,9,1, 0,10,1, 1,10,1, 7,0,1, 8,0,1, 9,0,1, 10,0,1, 5,1,1, 7,1,1, 9,1,1, 10,1,1, 3,2,1, 7,2,1, 8,2,1, 10,2,1, 2,3,1, 3,3,1, 5,3,1, 6,3,1, 7,3,1, 8,3,1, 9,3,1, 10,3,1, 1,4,1, 3,4,1, 4,4,1, 7,4,1, 0,5,1, 1,5,1, 2,5,1, 3,5,1, 7,5,1, 9,5,1, 0,6,1, 2,6,1, 3,6,1, 6,6,1, 0,7,1, 1,7,1, 3,7,1, 4,7,1, 5,7,1, 6,7,1, 7,7,1, 8,7,1, 0,8,1, 4,8,1, 5,8,1, 7,8,1, 1,9,1, 3,9,1, 5,9,1, 6,9,1, 2,10,1, 3,10,1, 4,10,1, 5,10,1, ),
		),
		'offset' => array(-12, -127)
		
	),
	array(
		'title' => 'Eye of Sauron',
		'best' => 21,
		'cells' => array(
			'flipNeighbours' => array(2,2,0, 6,1,0, 4,1,0, 6,0,0, 0,4,0, 0,3,0, 6,3,0, 6,2,0, 0,6,0, 2,5,0, 0,5,0, 4,4,0,
			3,2,1, 2,6,1, 4,2,1, 5,0,1, 2,1,1, 4,3,1, 4,5,1, 1,2,1, 5,2,1, 2,3,1, 4,0,1, 3,6,1, 2,4,1, 1,4,1, 3,4,1, 3,0,1, 1,6,1, 5,4,1, ),
			'rotateNeighbours' => array(3,1,0, 5,1,0, 1,3,0, 5,3,0, 1,5,0, 3,5,0,
			3,3,1, ),
		),
		'offset' => array(-107, 38) 
	),
	array(
		'title' => 'Mister Christie',
		'best' => 33,
		'cells' => array(
			'flipNeighbours' => array(6,1,0, 8,1,0, 4,2,0, 9,2,0, 2,4,0, 9,4,0, 5,5,0, 1,6,0, 8,6,0, 1,8,0, 6,8,0, 2,9,0, 4,9,0, 5,3,0, 7,3,0, 3,5,0, 7,5,0, 3,7,0, 5,7,0,
			5,0,1, 6,0,1, 4,1,1, 5,2,1, 6,2,1, 4,3,1, 5,4,1, 6,4,1, 8,4,1, 10,4,1, 4,5,1, 6,5,1, 8,5,1, 10,5,1, 4,6,1, 5,6,1, 7,6,1, 9,6,1, 2,7,1, 2,8,1, 3,8,1, 0,9,1, 0,10,1, 1,10,1, 7,0,1, 8,0,1, 9,0,1, 10,0,1, 5,1,1, 7,1,1, 9,1,1, 10,1,1, 3,2,1, 7,2,1, 8,2,1, 10,2,1, 2,3,1, 3,3,1, 6,3,1, 8,3,1, 9,3,1, 10,3,1, 1,4,1, 3,4,1, 4,4,1, 7,4,1, 0,5,1, 1,5,1, 2,5,1, 9,5,1, 0,6,1, 2,6,1, 3,6,1, 6,6,1, 0,7,1, 1,7,1, 4,7,1, 6,7,1, 7,7,1, 8,7,1, 0,8,1, 4,8,1, 5,8,1, 7,8,1, 1,9,1, 3,9,1, 5,9,1, 6,9,1, 2,10,1, 3,10,1, 4,10,1, 5,10,1, ),
		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Black Hole',
		'best' => 31,
		'cells' => array(
			'flipNeighbours' => array(6,1,0, 8,1,0, 4,2,0, 9,2,0, 2,4,0, 9,4,0, 1,6,0, 8,6,0, 1,8,0, 6,8,0, 2,9,0, 4,9,0, 5,3,0, 7,3,0, 3,5,0, 7,5,0, 3,7,0, 5,7,0, 5,0,0, 6,0,0, 4,1,0, 5,2,0, 6,2,0, 4,3,0, 5,4,0, 6,4,0, 8,4,0, 10,4,0, 4,5,0, 6,5,0, 8,5,0, 10,5,0, 4,6,0, 5,6,0, 7,6,0, 9,6,0, 2,7,0, 2,8,0, 3,8,0, 0,9,0, 0,10,0, 1,10,0, 7,0,0, 8,0,0, 9,0,0, 10,0,0, 7,1,0, 10,1,0, 3,2,0, 7,2,0, 8,2,0, 10,2,0, 2,3,0, 3,3,0, 6,3,0, 8,3,0, 9,3,0, 10,3,0, 1,4,0, 3,4,0, 4,4,0, 7,4,0, 0,5,0, 2,5,0, 0,6,0, 2,6,0, 3,6,0, 6,6,0, 0,7,0, 1,7,0, 4,7,0, 6,7,0, 7,7,0, 8,7,0, 0,8,0, 4,8,0, 5,8,0, 7,8,0, 3,9,0, 6,9,0, 2,10,0, 3,10,0, 4,10,0, 5,10,0,
			5,5,1, 5,1,1, 9,1,1, 1,5,1, 9,5,1, 1,9,1, 5,9,1, ),
		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Diamonds in the Rough',
		'best' => 15,
		'cells' => array(
			'flipNeighbours' => array(6,1,0, 4,2,0, 7,2,0, 4,3,0, 8,3,0, 3,4,0, 6,2,0, 7,6,0, 9,4,0, 2,6,0, 3,8,0, 8,4,0, 8,6,0, 2,7,0, 6,7,0, 1,8,0, 4,8,0, 2,9,0,
			5,0,1, 6,0,1, 7,0,1, 8,0,1, 9,0,1, 10,0,1, 4,1,1, 8,1,1, 10,1,1, 3,2,1, 5,4,1, 4,4,1, 8,2,1, 9,2,1, 10,2,1, 2,3,1, 6,3,1, 10,3,1, 1,4,1, 2,4,1, 5,2,1, 6,4,1, 6,6,1, 10,4,1, 0,5,1, 2,5,1, 4,5,1, 8,5,1, 6,5,1, 10,5,1, 0,6,1, 1,6,1, 2,8,1, 5,6,1, 7,4,1, 9,6,1, 0,7,1, 4,7,1, 8,7,1, 0,8,1, 4,6,1, 3,6,1, 5,8,1, 6,8,1, 7,8,1, 0,9,1, 4,9,1, 6,9,1, 0,10,1, 1,10,1, 2,10,1, 3,10,1, 4,10,1, 5,10,1, ),
			'rotateNeighbours' => array(7,1,0, 3,3,0, 9,3,0, 1,7,0, 7,7,0, 3,9,0,
			5,1,1, 9,1,1, 5,3,1, 7,3,1, 1,5,1, 3,5,1, 5,5,1, 7,5,1, 9,5,1, 3,7,1, 5,7,1, 1,9,1, 5,9,1, ),
		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Click Here',
		'best' => 21,
		'cells' => array(
			'flipNeighbours' => array(5,4,0, 6,5,0, 4,6,0,
			5,1,1, 6,1,1, 7,1,1, 8,3,1, 7,3,1, 4,2,1, 6,2,1, 9,2,1, 7,2,1, 3,3,1, 4,3,1, 5,3,1, 9,1,1, 8,1,1, 9,3,1, 2,6,1, 1,6,1, 6,4,1, 8,4,1, 9,4,1, 3,5,1, 1,5,1, 4,5,1, 7,5,1, 9,5,1, 3,4,1, 2,4,1, 5,6,1, 7,6,1, 8,6,1, 1,7,1, 2,7,1, 3,7,1, 5,9,1, 4,9,1, 7,7,1, 1,8,1, 3,8,1, 6,8,1, 4,8,1, 1,9,1, 2,9,1, 3,9,1, 6,7,1, 5,7,1, ),
			'rotateNeighbours' => array(6,3,0, 4,4,0, 7,4,0, 3,6,0, 6,6,0, 4,7,0,
			5,2,1, 8,2,1, 2,5,1, 5,5,1, 8,5,1, 2,8,1, 5,8,1, ),
		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Snakes',
		'best' => 12,
		'cells' => array(
			'flipNeighbours' => array(6,1,0, 5,2,0, 7,4,0, 8,3,0, 8,5,0, 4,4,0, 3,4,0, 4,8,0, 8,6,0, 4,7,0, 1,8,0, 2,8,0, 
			5,0,1, 6,0,1, 7,0,1, 8,0,1, 9,0,1, 10,0,1, 4,1,1, 8,1,1, 10,1,1, 3,2,1, 4,2,1, 6,2,1, 6,4,1, 9,2,1, 10,2,1, 2,3,1, 4,3,1, 6,3,1, 10,3,1, 1,4,1, 2,4,1, 3,6,1, 2,6,1, 5,4,1, 8,2,1, 7,2,1, 8,4,1, 9,4,1, 10,4,1, 0,5,1, 4,5,1, 2,5,1, 6,5,1, 10,5,1, 0,6,1, 1,6,1, 4,6,1, 5,8,1, 7,6,1, 9,6,1, 0,7,1, 2,7,1, 6,7,1, 8,7,1, 0,8,1, 3,8,1, 6,6,1, 5,6,1, 6,8,1, 7,8,1, 0,9,1, 2,9,1, 4,9,1, 6,9,1, 0,10,1, 1,10,1, 2,10,1, 3,10,1, 4,10,1, 5,10,1, ),
			'rotateNeighbours' => array(7,1,0, 5,3,0, 7,5,0, 1,7,0, 3,7,0, 7,7,0, 
			5,1,1, 9,1,1, 3,3,1, 7,3,1, 9,3,1, 1,5,1, 3,5,1, 5,5,1, 9,5,1, 5,7,1, 1,9,1, 3,9,1, 5,9,1, ),
			),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'Take the Helm',
		'best' => 48,
		'cells' => array(
			'flipNeighbours' => array(6,1,0, 10,0,0, 5,0,0, 5,4,0, 9,2,0, 4,2,0, 8,1,0, 6,4,0, 2,4,0, 4,5,0, 10,5,0, 1,6,0, 9,4,0, 0,5,0, 6,5,0, 8,6,0, 4,6,0, 2,9,0, 6,8,0, 1,8,0, 5,6,0, 5,10,0, 0,10,0, 4,9,0,
			6,0,1, 7,0,1, 8,0,1, 10,1,1, 9,0,1, 3,2,1, 4,1,1, 2,5,1, 4,3,1, 10,2,1, 2,3,1, 2,6,1, 8,3,1, 5,2,1, 10,3,1, 3,6,1, 6,2,1, 7,4,1, 6,6,1, 7,6,1, 7,2,1, 10,4,1, 1,4,1, 6,3,1, 4,7,1, 9,6,1, 0,6,1, 2,8,1, 3,8,1, 3,4,1, 4,4,1, 4,8,1, 8,2,1, 0,7,1, 5,8,1, 2,7,1, 8,4,1, 8,7,1, 0,8,1, 6,7,1, 8,5,1, 6,9,1, 7,8,1, 1,10,1, 0,9,1, 2,10,1, 3,10,1, 4,10,1, ),
			'rotateNeighbours' => array(5,1,0, 7,1,0, 9,1,0, 3,3,0, 9,3,0, 1,5,0, 9,5,0, 1,7,0, 7,7,0, 1,9,0, 3,9,0, 5,9,0,
			5,3,1, 7,3,1, 3,5,1, 5,5,1, 7,5,1, 3,7,1, 5,7,1, ),
		),
		'offset' => array(-12, -127)
	),
	array(
		'title' => 'www dot',
		'best' => 24,
		'cells' => array(
			'flipNeighbours' => array(6,2,0, 4,3,0, 6,3,0, 4,4,0, 7,4,0, 8,4,0, 3,6,0, 6,6,0, 7,6,0, 2,7,0, 4,7,0, 3,8,0,
			5,2,1, 4,2,1, 7,0,1, 8,0,1, 9,0,1, 10,0,1, 6,1,1, 4,1,1, 8,1,1, 10,1,1, 3,2,1, 6,0,1, 5,0,1, 7,2,1, 8,2,1, 9,2,1, 10,2,1, 2,3,1, 8,3,1, 10,3,1, 1,4,1, 2,4,1, 3,4,1, 5,4,1, 6,4,1, 9,6,1, 8,6,1, 0,5,1, 2,5,1, 4,5,1, 6,5,1, 10,5,1, 8,5,1, 0,6,1, 1,6,1, 2,6,1, 4,6,1, 5,6,1, 10,4,1, 9,4,1, 0,7,1, 6,7,1, 8,7,1, 0,8,1, 1,10,1, 0,10,1, 4,8,1, 5,8,1, 6,8,1, 7,8,1, 2,9,1, 0,9,1, 4,9,1, 6,9,1, 2,8,1, 1,8,1, 2,10,1, 3,10,1, 4,10,1, 5,10,1, ),
			'rotateNeighbours' => array(7,1,0, 3,3,0, 7,3,0, 9,3,0, 3,5,0, 5,5,0, 1,7,0, 5,7,0, 7,7,0, 3,9,0,
			5,1,1, 9,1,1, 5,3,1, 1,5,1, 7,5,1, 9,5,1, 3,7,1, 1,9,1, 5,9,1, ),
		),
		'offset' => array(-12, -127)
	)

);
//return {'x':48 * x - drawOffset.x, 'y': 27.5 * x + 55 * y + drawOffset.y};

function gameOverMessage(){
	global $level;
	return array(
		'message' => 'Congratulations!  You have completed all ' . count($level) . ' levels!'
	);
}

function loadLevel($levelNum){
	global $level;
	switch($levelNum){
		case 'ring':
			$returnval = array(
				'title' => 'testlevel',
				'best' => 0,
				'cells' => array(
					'rotateNeighbours' => array(5,2,1, 8,2,1, 2,5,1, 8,5,1, 2,8,1, 5,8,1, ),
					'flipNeighbours' => array(5,1,1, 6,1,1, 7,1,1, 8,1,1, 9,1,1, 4,2,1, 6,2,1, 7,2,1, 9,2,1, 3,3,1, 4,3,1, 5,3,1, 6,3,1, 7,3,1, 8,3,1, 9,3,1, 2,4,1, 3,4,1, 4,4,1, 7,4,1, 8,4,1, 9,4,1, 1,5,1, 3,5,1, 7,5,1, 9,5,1, 1,6,1, 2,6,1, 3,6,1, 6,6,1, 7,6,1, 8,6,1, 1,7,1, 2,7,1, 3,7,1, 4,7,1, 5,7,1, 6,7,1, 7,7,1, 1,8,1, 3,8,1, 4,8,1, 6,8,1, 1,9,1, 2,9,1, 3,9,1, 4,9,1, 5,9,1, ),
				),
				'testlevel' => 1,
				'offset' => array(-12, -127)
			);
			break;

		case 'cookie':
			$returnval = array(
				'title' => 'testlevel',
				'best' => 0,
				'cells' => array(
					'rotateNeighbours' => array(5,1,1, 7,1,1, 9,1,1, 3,3,1, 5,3,1, 7,3,1, 9,3,1, 1,5,1, 3,5,1, 5,5,1, 7,5,1, 9,5,1, 1,7,1, 3,7,1, 5,7,1, 7,7,1, 1,9,1, 3,9,1, 5,9,1),
					'flipNeighbours' => array(5,0,1, 6,0,1, 7,0,1, 8,0,1, 9,0,1, 10,0,1, 4,1,1, 6,1,1, 8,1,1, 10,1,1, 3,2,1, 4,2,1, 5,2,1, 6,2,1, 7,2,1, 8,2,1, 9,2,1, 10,2,1, 2,3,1, 4,3,1, 6,3,1, 8,3,1, 10,3,1, 1,4,1, 2,4,1, 3,4,1, 4,4,1, 5,4,1, 6,4,1, 7,4,1, 8,4,1, 9,4,1, 10,4,1, 0,5,1, 2,5,1, 4,5,1, 6,5,1, 8,5,1, 10,5,1, 0,6,1, 1,6,1, 2,6,1, 3,6,1, 4,6,1, 5,6,1, 6,6,1, 7,6,1, 8,6,1, 9,6,1, 0,7,1, 2,7,1, 4,7,1, 6,7,1, 8,7,1, 0,8,1, 1,8,1, 2,8,1, 3,8,1, 4,8,1, 5,8,1, 6,8,1, 7,8,1, 0,9,1, 2,9,1, 4,9,1, 6,9,1, 0,10,1, 1,10,1, 2,10,1, 3,10,1, 4,10,1, 5,10,1, ),
				),
				'testlevel' => 1,
				'offset' => array(-12, -127)
			);
			break;
		case 'test_large':
			$returnval = array(
				'title' => 'testlevel',
				'best' => 0,
				'cells' => array(
					'flipNeighbours' => array(
						5,0,1,  6,0,1,  7,0,1,  8,0,1,  9,0,1,  10,0,1,
						4,1,1,  5,1,1,  6,1,1,  7,1,1,  8,1,1,  9,1,1,  10,1,1,
						3,2,1,  4,2,1,  5,2,1,  6,2,1,  7,2,1,  8,2,1,  9,2,1,  10,2,1,
						2,3,1,  3,3,1,  4,3,1,  5,3,1,  6,3,1,  7,3,1,  8,3,1,  9,3,1,  10,3,1,
						1,4,1,  2,4,1,  3,4,1,  4,4,1,  5,4,1,  6,4,1,  7,4,1,  8,4,1,  9,4,1,  10,4,1,
						0,5,1,  1,5,1,  2,5,1,  3,5,1,  4,5,1,  5,5,1,  6,5,1,  7,5,1,  8,5,1,  9,5,1,  10,5,1,
						0,6,1,  1,6,1,  2,6,1,  3,6,1,  4,6,1,  5,6,1,  6,6,1,  7,6,1,  8,6,1,  9,6,1,
						0,7,1,  1,7,1,  2,7,1,  3,7,1,  4,7,1,  5,7,1,  6,7,1,  7,7,1,  8,7,1,
						0,8,1,  1,8,1,  2,8,1,  3,8,1,  4,8,1,  5,8,1,  6,8,1,  7,8,1,
						0,9,1,  1,9,1,  2,9,1,  3,9,1,  4,9,1,  5,9,1,  6,9,1,
						0,10,1, 1,10,1, 2,10,1, 3,10,1, 4,10,1, 5,10,1,
					),
					'rotateNeighbours' => array(
					)
				),
				'testlevel' => 1,
				'offset' => array(-12, -127)
			);
			for($n = 2; $n < count($returnval['cells']['flipNeighbours']); $n += 3){
				$returnval['cells']['flipNeighbours'][$n] = 0;
			}
			break;
		case 'test_medium_large':
			$returnval = array(
				'title' => 'testlevel',
				'best' => 0,
				'cells' => array(
'flipNeighbours' => array(5,1,0, 6,1,0, 7,1,0, 8,1,0, 9,1,0, 4,2,0, 6,2,0, 7,2,0, 9,2,0, 3,3,0, 4,3,0, 5,3,0, 7,3,0, 8,3,0, 9,3,0, 2,4,0, 3,4,0, 5,4,0, 6,4,0, 8,4,0, 9,4,0, 1,5,0, 3,5,0, 4,5,0, 6,5,0, 7,5,0, 9,5,0, 1,6,0, 2,6,0, 4,6,0, 5,6,0, 7,6,0, 8,6,0, 1,7,0, 2,7,0, 3,7,0, 5,7,0, 6,7,0, 7,7,0, 1,8,0, 3,8,0, 4,8,0, 6,8,0, 1,9,0, 2,9,0, 3,9,0, 4,9,0, 5,9,0),
'rotateNeighbours' => array(5,2,1, 8,2,1, 6,3,1, 4,4,1, 7,4,1, 2,5,1, 5,5,1, 8,5,1, 3,6,1, 6,6,1, 4,7,1, 2,8,1, 5,8,1, ),
				),
				'testlevel' => 1,
				'offset' => array(-12, -127)
			);
			for($n = 2; $n < count($returnval['cells']['flipNeighbours']); $n += 3){
				$returnval['cells']['flipNeighbours'][$n] = 1;
			}
			break;
		case 'test_medium':
			$returnval = array(
				'title' => 'testlevel',
				'best' => 0,
				'cells' => array(
					'flipNeighbours' => array(
						3,0,1,  4,0,1,  5,0,1,  6,0,1,
						2,1,1,  4,1,1,  6,1,1,
						1,2,1,  2,2,1,  4,2,1,  5,2,1,  6,2,1,
						0,3,1,  2,3,1,  6,3,1,
						0,4,1,  1,4,1,  3,4,1,  4,4,1,  5,4,1, 
						0,5,1,  2,5,1,  4,5,1,
						0,6,1,  1,6,1,  2,6,1,  3,6,1,

						3,2,1,   2,4,1,  4,3,1,

					),
					'rotateNeighbours' => array(
						3,3,1,
						3,1,1, 5,1,1, 1,3,1, 5,3,1, 1,5,1, 3,5,1
					)
				),
				'testlevel' => 1,
				'offset' => array(-107, 38) 

			);
			break;
		case 'test_small': 
			$returnval = array(
				'title' => 'small',
				'best' => 4,
				'cells' => array(
					'flipNeighbours' => array(2,0,1,  3,0,1,  4,0,1,  1,1,1,  2,1,1,  3,1,1,  4,1,1,  0,2,1,  1,2,1,  2,2,1,  3,2,1,  4,2,1,  0,3,1,  1,3,1,  2,3,1,  3,3,1,  0,4,1,  1,4,1,  2,4,1),
				),
				'testlevel' => 1,
				'offset' => array(-156, 122)

			);
			for($n = 2; $n < count($returnval['cells']['flipNeighbours']); $n += 3){
				$returnval['cells']['flipNeighbours'][$n] = 0;
			}
			break;
		case 'test_tiny': 
			$returnval = array(
				'title' => 'tiny',
				'best' => 4,
				'cells' => array(
					'flipNeighbours' => array(2,1,1, 3,1,1, 1,2,1, 3,2,1, 1,3,1, 2,3,1),
					'flipNeighbours' => array(2,2,1)
				),
				'testlevel' => 1,
				'offset' => array(-156, 122)

			);
			for($n = 2; $n < count($returnval['cells']['flipNeighbours']); $n += 3){
				$returnval['cells']['flipNeighbours'][$n] = 0;
			}
			break;
		default:
			if(array_key_exists($levelNum, $level)){
				$returnval = $level[$levelNum];
			}else{
				$returnval = gameOverMessage();
			}
	}
	return $returnval;
}

if(array_key_exists('action', $_GET)){
	switch($_GET['action']){
		case 'getLevel':
			$dat = loadLevel($_GET['id']);

			echo json_encode($dat);
			break;
	}
	exit();
}
//if(!function_exists('json_encode')){
	function json_encode($a = false){
		// Some basic debugging to ensure we have something returned
		if (is_null($a)) return 'null';
		if ($a === false) return 'false';
		if ($a === true) return 'true';
		if (is_scalar($a))
		{
			if (is_float($a))
			{
				// Always use "." for floats.
				return floatval(str_replace(",", ".", strval($a)));
			}

			if (is_string($a))
			{
				static $jsonReplaces = array(array("\\", "/", "\n", "\t", "\r", "\b", "\f", '"'), array('\\\\', '\\/', '\\n', '\\t', '\\r', '\\b', '\\f', '\"'));
				return '"' . str_replace($jsonReplaces[0], $jsonReplaces[1], $a) . '"';
			}
			else
				return $a;
		}
		$isList = true;
		for ($i = 0; reset($a); $i++){
			if (key($a) !== $i)
			{
				$isList = false;
				break;
			}
		}
		$result = array();
		if ($isList){
			foreach ($a as $v) $result[] = json_encode($v);
			return '[' . join(',', $result) . ']';
		}
		else
		{
			foreach ($a as $k => $v){
				$result[] = json_encode($k).':'.json_encode($v);
			}
			return '{' . join(',', $result) . '}';
		}
	}
//}

?>
<html>
<head>
<link href='http://fonts.googleapis.com/css?family=Coming+Soon' rel='stylesheet' type='text/css'>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>
<script type="text/javascript" src="gfxLib.js"></script>
<script type="text/javascript" src="buttonClass.js"></script>
<script type="text/javascript" src="swix.js"></script>
<!--script src="http://www.google-analytics.com/urchin.js" type="text/javascript"></script-->
<script type="text/javascript">
/*
	_uacct = "UA-3072147-1";
	urchinTracker();
*/
<?php
	if(isset($exitFunc)) echo $exitFunc;
	else echo "function exit(){history.go(-1);}";
?>

	function dumpMap(){
		for(m in buttonTypes){
			echo("'" + buttonTypes[m] + "'" + ' => array(');
			for(n in button){
				if(button[n].objType == buttonTypes[m] && button[n].state == 0){
					echo(button[n].position.x + ',' + button[n].position.y + ',' + button[n].state + ',  ');
				}
			}
			echo("<br/>");
			for(n in button){
				if(button[n].objType == buttonTypes[m] && button[n].state == 1){
					echo(button[n].position.x + ',' + button[n].position.y + ',' + button[n].state + ',  ');
				}
			}
			echo("),<br/>");
		}
	}

	function echo(text){
		$('#debug').append(text);
	}

	$(document).ready(function(){
		<?php 
		if(array_key_exists('level', $_GET)){
			echo "currentLevel = '{$_GET['level']}';";
		}else{
			echo "currentLevel = 0;";
		}
		?>
		startGame();
	});
</script>
<link rel="stylesheet" type="text/css" href="swix.css" />
</head>
<body>
	<div id="gameWrapper">
		<div id="centering">
			<div id="loadingPrompt"></div>
			<div id="contentWrapper" style="display:none">
				<div id="swix"><img src="images/swix.png"/></div>
				<img id="copyright" src="images/copyright.png"/>
				<img id="stepstitle" src="images/moves.png"/>
				<div id="stepstaken"></div>
				<img id="beststepstitle" src="images/best.png"/>
				<div id="beststeps"></div>
				<div id="content"></div>
				<img id="resetButton" class="anchor" src="images/reset.png" onclick="restartLevel()"/>
				<img id="exitButton" class="anchor" src="images/exit.png" onclick="exit()"/>
				<img id="skipButton" class="anchor" src="images/skip.png" onclick="skipLevel()"/>
				<div id="titleDivWrapper">
					<div id="titleDiv"></div>
				</div>
			</div>
		</div>
	</div>
<?php
	if($_SERVER['REMOTE_ADDR'] ==  '69.20.234.37'){
?>
		<div id="tools">
			<span onclick = "dumpMap()">dump</span>
		</div>
<?php
	}
?>
	<div id="debug"></div>
</body>
</html>
