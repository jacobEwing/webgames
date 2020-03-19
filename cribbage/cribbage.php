<?php
// a helper class for representing players on the board
class boardPlayerClass{
	public $pegImage, $holes;
	public $starterHoles;
}

class boardClass{
	public $numPlayers, $player;
	public $boardImage;
	public $width, $height;
	public $maxPoints, $handSize;

	function __construct($boardType = null){
		$this->player = array();

		if($boardType != null){
			$this->build($boardType);
		}
	}

	public function build($boardType){
		switch($boardType){
			case '2PlayerNormal':
				$this->build2PlayerNormal();
				break;
			default:
				echo "Invalid board type";
		}
	}

	public function writeData(){
		echo '<script type="text/javascript">';
		echo "var _g=[";
		echo "2,"; // numplayers
		echo $this->maxPoints . ',';
		echo $this->handSize . ',';
		echo '"' . $this->boardImage . '",';
		echo $this->width . ",";
		echo $this->height;
		echo "];";

		echo 'var _h = {';
		for($p = 0; $p < $this->numPlayers; $p++){
			if($p > 0) echo ',';
			echo $p . ':{';

			// mark the starter holes
			echo "'s':{";
			foreach($this->player[$p]->starterHoles as $h => $hole){
				if($h > 0) echo ',';
				echo $h . ':[' . implode(',', $hole) . ']';
			}
			echo "},";

			// mark the play holes
			echo "'p':{";
			foreach($this->player[$p]->holes as $h => $hole){
				if($h > 0) echo ',';
				echo $h . ':[' . implode(',', $hole) . ']';
			}
			echo "}";

			echo "}\n";
		}
		// mark the finishing hole
		echo ',f:[' . implode(',', $this->winningHole) . ']';

		echo "};\n";
		echo 'var _p=["' . $this->pegWidth . '","'
				 . $this->pegHeight . '","'
				 . $this->pegXOffset . '","'
				 . $this->pegYOffset . '","'
				 . $this->player[0]->pegImage . '", "'
				 . $this->player[1]->pegImage . "\"];\n";
		echo '</script>';
	}

	public function build2PlayerNormal(){
		$this->maxPoints = 121;
		$this->numPlayers = 2;
		$this->handSize = 6;
		$this->boardImage = "images/cribbage/board1.jpg";
		list($this->width, $this->height, $type, $attr) = getimagesize($this->boardImage);
		$this->player[0] = new boardPlayerClass();
		$this->player[1] = new boardPlayerClass();

		$this->player[0]->pegImage = "images/cribbage/peg_red.png";
		$this->player[1]->pegImage = "images/cribbage/peg_blue.png";
		list($this->pegWidth, $this->pegHeight, $type, $attr) = getimagesize($this->player[0]->pegImage);
		$this->pegXOffset = -4;
		$this->pegYOffset = -7;

		$this->player[0]->starterHoles = array(
			array(14, 554), array(14, 542)
		);

		$this->player[0]->holes = array(
			array(14, 526), array(14, 514), array(14, 502), array(14, 490), array(14, 479),
			array(14, 461), array(14, 450), array(14, 438), array(14, 426), array(14, 414),
			array(14, 397), array(14, 385), array(14, 374), array(14, 362), array(14, 350),
			array(14, 333), array(14, 322), array(14, 310), array(14, 298), array(14, 286),
			array(14, 268), array(14, 257), array(14, 245), array(14, 234), array(14, 222),
			array(14, 205), array(14, 193), array(14, 182), array(14, 170), array(14, 158),
			array(14, 140), array(14, 128), array(14, 117), array(14, 105), array(14, 94),
			array(14, 76), array(16, 58), array(26, 42), array(40, 32), array(58, 26),
			array(74, 25), array(92, 32), array(106, 42), array(116, 58), array(118, 76),
			array(118, 94), array(118, 106), array(118, 117), array(118, 129), array(118, 140),
			array(118, 158), array(118, 169), array(118, 181), array(118, 193), array(118, 204),
			array(118, 222), array(118, 234), array(118, 246), array(118, 257), array(118, 269),
			array(118, 286), array(118, 298), array(118, 310), array(118, 321), array(118, 333),
			array(118, 350), array(118, 362), array(118, 374), array(118, 386), array(118, 397),
			array(118, 414), array(118, 426), array(118, 438), array(118, 450), array(118, 461),
			array(118, 479), array(118, 490), array(118, 502), array(118, 514), array(118, 526),
			array(118, 543), array(111, 569), array(86, 581), array(62, 569), array(54, 543),
			array(54, 526), array(54, 514), array(54, 502), array(54, 490), array(54, 479),
			array(54, 461), array(54, 449), array(54, 438), array(54, 426), array(54, 414),
			array(54, 397), array(54, 385), array(54, 374), array(54, 362), array(54, 350),
			array(54, 333), array(54, 321), array(54, 310), array(54, 298), array(54, 286),
			array(54, 268), array(54, 257), array(54, 246), array(54, 234), array(54, 222),
			array(54, 204), array(54, 193), array(54, 181), array(54, 170), array(54, 158),
			array(54, 140), array(54, 128), array(54, 117), array(54, 106), array(54, 94)
		);

		$this->player[1]->starterHoles = array(
			array(37, 554), array(37, 542)
		);

		$this->player[1]->holes = array(
			array(37, 526), array(37, 514), array(37, 502), array(37, 490), array(37, 479),
			array(37, 461), array(37, 450), array(37, 438), array(37, 426), array(37, 414),
			array(37, 397), array(37, 385), array(37, 374), array(37, 362), array(37, 350),
			array(37, 333), array(37, 322), array(37, 310), array(37, 298), array(37, 286),
			array(37, 268), array(37, 257), array(37, 245), array(37, 234), array(37, 222),
			array(37, 205), array(37, 193), array(37, 182), array(37, 170), array(37, 158),
			array(37, 140), array(37, 128), array(37, 117), array(37, 105), array(37, 94),
			array(37, 76), array(38, 67), array(43, 59), array(49, 53), array(58, 48),
			array(74, 48), array(83, 53), array(89, 59), array(94, 67), array(95, 76),
			array(95, 94), array(95, 106), array(95, 117), array(95, 129), array(95, 140),
			array(95, 158), array(95, 169), array(95, 181), array(95, 193), array(95, 204),
			array(95, 222), array(95, 234), array(95, 246), array(95, 257), array(95, 269),
			array(95, 286), array(95, 298), array(95, 310), array(95, 321), array(95, 333),
			array(95, 350), array(95, 362), array(95, 374), array(95, 386), array(95, 397),
			array(95, 414), array(95, 426), array(95, 438), array(95, 450), array(95, 461),
			array(95, 479), array(95, 490), array(95, 502), array(95, 514), array(95, 526),
			array(95, 543), array(94, 552), array(87, 557), array(78, 552), array(78, 543),
			array(78, 526), array(78, 514), array(78, 502), array(78, 490), array(78, 479),
			array(78, 461), array(78, 449), array(78, 438), array(78, 426), array(78, 414),
			array(78, 397), array(78, 385), array(78, 374), array(78, 362), array(78, 350),
			array(78, 333), array(78, 321), array(78, 310), array(78, 298), array(78, 286),
			array(78, 268), array(78, 257), array(78, 246), array(78, 234), array(78, 222),
			array(78, 204), array(78, 193), array(78, 181), array(78, 170), array(78, 158),
			array(78, 140), array(78, 128), array(78, 117), array(78, 106), array(78, 94)
		);

		$this->winningHole = array(66, 70);
	}
}

$board = new boardClass('2PlayerNormal');
//print_r($board->player[0]->holes);

$board->writeData();

?>
