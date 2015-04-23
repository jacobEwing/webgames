<html>
<head>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>
	<script type="text/javascript" src="spriteSet.js"></script>
	<script type="text/javascript">
	var foo, bar;
	$(document).ready(function(){
		foo = new spriteSet();
		foo.load('test.sprite', function(result){
			bar = new spriteClass(foo);
			bar.setFrame('size');
			bar.position(10, 10);
			bar.draw($('#test'));

			
		});
	});
	</script>
</head>
<body style="background-color:black; color:white">
	<div id="test"></div>
</body>
</html>
