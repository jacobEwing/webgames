<?php
$db = new dbConClass();
$db->connect();

// a class used for creating a database connection
class dbConClass{
	private $username, $password, $database, $dbname;

	function connect(){
/*
		$this->username = 'jingleheimer';
		$this->password = 'F02w@l)qQq';
		$this->dbname = 'webgames';
		$this->database = mysql_connect('localhost', $this->username, $this->password);

		if($this->database == false)
			throw new Exception("Unable to connect to database server");

		if(!mysql_select_db($this->dbname, $this->database))
			throw new Exception("Unable to select database");
*/
	}
}

// a class used for representing games
class gameClass{
	public $keyCode, $hostCode, $gameName;

	function __construct($gameName, $keyCode = null){
		$this->keyCode = $keyCode;
		if($keyCode != null){
			if(!$this->load($gameName, $keyCode)){
				throw new Exception("Invalid game code");
			}
		}else{
			$this->gameName = $gameName;
			$this->getCodes();
		}
	}

	private function load($gameName, $keyCode){
		return true;
		$returnval = false;
		$query = "SELECT * FROM games WHERE keycode=\"" . mysql_real_escape_string($keyCode) . "\"";
		$record = mysql_fetch_array(mysql_query($query));
		if($record){
			if($record['game'] == $gameName){
				$this->hostCode = $record['hostcode'];
				$this->gameName = $gameName;
				$returnval = true;
			}
		}
		return $returnval;
	}

	public function getCodes(){
		return 'foo,bar';
		if($this->keyCode != null){
			return $this->keyCode . ',' . $this->hostCode;
		}

		// let's generate a new gamecode
		$validChars = "ABCDEFGHJLMNPRTUVWXYZ23456789";
		do{
			$keyCode = "";
			for($n = 0; $n < 6; $n++){
				$keyCode .= $validChars[rand() % strlen($validChars)];
			}
			$this->keyCode = $keyCode;
			$data = mysql_fetch_array(mysql_query("SELECT COUNT(*) as tally FROM games WHERE keycode = '$keyCode'"));
		}while($data['tally'] != 0);
		

		// now we can generate the hosting code.  No need to guarantee uniqueness
		$this->hostCode = "";
		for($n = 0; $n < 6; $n++){
			$this->hostCode .= $validChars[rand() % strlen($validChars)];
		}

		// we now have the new code, let's save it and pass it back to the client
		$query =
			"INSERT INTO games (game, keycode, password, hostcode) VALUES(" .
			'"' . $this->gameName . '", ' .
			'"' . $this->keyCode . '", ' .
			'"temp", ' . 
			'"' . $this->hostCode . '"' .
			')';

		if(!mysql_query($query)){
			throw new Exception('SQL error inserting new game record');
		}
		return $this->keyCode . ',' . $this->hostCode;

	}

	public function setType($gameType){
		//FIXME
		return true;
	}
}

// a simple function for logging
function _log($output){
	$fout = fopen("/var/log/webgames/" . date("Y-m-d") . ".log", "a");
	if($fout){
		fprintf($fout, $output . "\n");
		fclose($fout);
	}
}
