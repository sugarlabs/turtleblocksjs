	// Define palette objects
	function Palette (name) {
	    this.name = name;
	    this.color = "green";
	    this.blockList = [];
	}

        Palette.prototype.getInfo = function() {
            return this.color + ' ' + this.name + ' palette: ' + this.blockList;
        };

	// Instantiate the palettes
        var paletteList = []

	var turtlePalette = new Palette('Turtle');
	paletteList.push(turtlePalette)
	turtlePalette.color = "green"

	var numberPalette = new Palette('Number');
	paletteList.push(numberPalette)
	numberPalette.color = "purple"

	for (i = 0; i < paletteList.length; i++) {
	    // alert(paletteList[i].getInfo());
	}

	// Define block proto objects
	function ProtoBlock (name) {
	    this.name = name;
	    this.palette = null
	    this.color = null
	    this.style = null
	    this.docks = []
	}

        ProtoBlock.prototype.getInfo = function() {
            return this.color + ' ' + this.name + ' block';
        };

        ProtoBlock.prototype.getSvgPath = function() {
            // return 'images/' + this.style + '_' + this.color + '.svg';
	    console.log('images/' + this.name + '.svg');
	    return 'images/' + this.name + '.svg';
        };

	// Instantiate the proto blocks
	// TODO: make style/connections into objects
        var protoBlockList = []

	var forwardBlock = new ProtoBlock('forward');
	protoBlockList.push(forwardBlock)
	forwardBlock.palette = turtlePalette
	forwardBlock.color = forwardBlock.palette.color
	forwardBlock.style = 'basic1arg'
	forwardBlock.docks = [[20, 0, 'out'], [100, 20, 'numberin'],
			      [20, 40, 'in']]

	var rightBlock = new ProtoBlock('right');
	protoBlockList.push(rightBlock)
	rightBlock.palette = turtlePalette
	rightBlock.color = rightBlock.palette.color
	rightBlock.style = 'basic1arg'
	rightBlock.docks = [[20, 0, 'out'], [100, 20, 'numberin'],
			    [20, 40, 'in']]

	var numberBlock = new ProtoBlock('number');
	protoBlockList.push(numberBlock)
	numberBlock.palette = numberPalette
	numberBlock.color = numberBlock.palette.color
	numberBlock.style = 'box'
	numberBlock.docks = [[-16, 22, 'numberout']]

	for (i = 0; i < protoBlockList.length; i++) {
	    // alert(protoBlockList[i].getInfo());
	}

	// Define block instance objects
	function Block (protoblock) {
	    this.protoblock = protoblock;
	    this.name = protoblock.name;
	    this.label = null
	    this.value = null
	    this.image = null
	    this.bitmap = null
	    this.x = 0
	    this.y = 0
	    this.connections = []
	}

        Block.prototype.getInfo = function() {
            return this.name + ' block';
        };

	// A place to keep the blocks we create...
        var blockList = [];
	// label elements for each of our blocks...
        var arrLabels = [];
	// and a place in the DOM to put them.
        var labelElem = document.getElementById("labelDiv");
        var inputElem = document.getElementById("inputDiv");
        // inputElem.innerHTML = '<input type="text" id="myNumber" name="myNumber" class="myNumber">';
        inputElem.innerHTML = '<textarea id="myNumber" name="myNumber" class="myNumber" cols="6" rows="1" maxlength="6"></textarea>';
        var foo = document.getElementById("myNumber");
        foo.defaultValue = "666";
        console.log(foo);
        console.log(foo.value);
        foo.onchange=textareaChanged

        function textareaChanged() {
            var foo = document.getElementById("myNumber");
            console.log('textarea changed: ' + foo.value);
        }
