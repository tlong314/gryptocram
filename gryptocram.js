/**
 * @overview A small JavaScript library for easily creating responsive cryptogram puzzles.
 * @author Tim Scott Long (tim@timlongcreative.com)
 * @copyright Tim Scott Long 2017
 * @license Available for use under the MIT License
 */
;var Gryptocram = (function() {
	var encoding = {},
		decoding = {},
		answer = "",
		answerArr = [],
		inputIds = 0,
		heldText = "",
		hostingElement = document.body,
		solvedOnce = false,
		// Create a specific prefix for local storage variables (based on the webpage URL), to avoid conflicts with others on the site.
		prefix = window.location.pathname.substr(window.location.pathname.lastIndexOf("/")+1, window.location.pathname.lastIndexOf(".html")-1-window.location.pathname.lastIndexOf("/")) + "-",
		noKeys = "KeyboardEvent" in window ? false : true,
		defaults = {
			answer: "",
			encodedAnswer: "",
			encoding: {
				"A" : "C",
				"B" : "Y",
				"C" : "M",
				"D" : "H",
				"E" : "X",
				"F" : "U",
				"G" : "W",
				"H" : "V",
				"I" : "Z",
				"J" : "T",
				"K" : "S",
				"L" : "R",
				"M" : "O",
				"N" : "F",
				"O" : "P",
				"P" : "N",
				"Q" : "L",
				"R" : "J",
				"S" : "I",
				"T" : "Q",
				"U" : "K",
				"V" : "G",
				"W" : "D",
				"X" : "B",
				"Y" : "E",
				"Z" : "A"
			},
			host: hostingElement
		};

	/**
	 * @description The constructor function for the library to build on.
	 * @param {Object} opts - An object of parameters passed in when creating an instance, such as the puzzle answer and an encoded version.
	 * @param {string} opts.answer - The answer to the puzzle.
	 * @param {string} [opts.encodedAnswer] - A string version of the encoded answer.
	 * @param {Object} [opts.encoding] - An object with each property has a key as a letter and a value as the letter that the key letter should be mapped to.
	 * @param {Object} [opts.host] - An HTML element in the DOM that should be used to hold the puzzle. Defaults to document.body
	 * @returns {Object} The current Gryptocram instance.
	 */
	var Gryptocram = function(opts) {
 		// Keep only the explicitly defined options
		for (var x in defaults) {
			opts[x] = opts[x] || defaults[x];
		}

		hostingElement = opts.host;

		if(!hostingElement.classList.contains("grypt-host")) {
			hostingElement.classList.add("grypt-host");
		}

		answer = opts.answer.toUpperCase();
		answerArr = answer.replace(/[^A-Za-z]/g, "").split(""); // We are assuming only letters as part of the encoding.

		// Import or define the encoding map.
		if(opts.encoding)
			encoding = opts.encoding;
		else
			encoding = this.getEncodingFromString(opts.encodedAnswer.replace(/[^A-Za-z]/g, "").split(""));

		// Set the reverse map.
		for(var x in encoding) {
			decoding[encoding[x]] = x;
		}

		this.renderBoard();
		this.loadPuzzle();

		return this;
	};

	Gryptocram.prototype.constructor = Gryptocram;

	/**
	 * @description Uses the encoded answer provided to create an explicit mapping.
	 * @param {string} str - The encoded answer.
	 * @returns {Object} A map from each starting letter to the encoded version of that letter.
	 */
	Gryptocram.prototype.getEncodingFromString = function(str) {
		var encodedObj = new Object();
		for(var i = 0, len = answerArr.length; i < len; i++) {
			encodedObj[answerArr[i]] = str[i];
		}

		return encodedObj;
	}; 
	
	/**
	 * @description Create the DOM elements that will make up the game board, and attach to the host element.
	 * @returns {Object} Current Gryptocram instance
	 */
	Gryptocram.prototype.renderBoard = function() {
		var words = answer.split(/_|\s/g),
			lInputs = [];

		for(var i = 0, len = words.length; i < len; i++) {
			var letters = words[i].split(""),
			wDiv = document.createElement("DIV");
			wDiv.className = "word_div";
			
			for(var j = 0, jLen = letters.length; j < jLen; j++) {
				var lDiv = document.createElement("DIV"),
					spn = document.createElement("SPAN"),
					br = document.createElement("BR"),
					lInput = document.createElement("INPUT"),
					tN = null;

				lDiv.className = "letter_div";
				lInput.type = "text";
				lInput.size = "1";
				lInput.maxLength = "1";
				lInput.style.borderBottom = "1px solid black";
				lInput.className = "letterInputs " + "encoded" + letters[j];
				lInputs.push(lInput);

				if(letters[j].match(/[A-Za-z]{1}/) !== null) {
					lInput.id = "letterInput" + inputIds;
					inputIds++;
					tN = document.createTextNode(encoding[letters[j]]);
					spn.className = "overline";
					
					lDiv.appendChild(lInput);
					lDiv.appendChild(br);
				} else { // Grammatical symbols, like question mark, or comma
					tN = document.createTextNode(letters[j]);
				}
				
				spn.appendChild(tN);
				lDiv.appendChild(spn);
				wDiv.appendChild(lDiv);
			 }
			 
			 hostingElement.appendChild(wDiv);
		}

		hostingElement.appendChild(document.createElement("BR"));
		
		var buttonDiv = document.createElement("DIV");
		buttonDiv.style.width = "100%";
		buttonDiv.style.marginBottom = buttonDiv.style.marginTop = "15px";

		var clearBtn = document.createElement("BUTTON");
		clearBtn.type = "button";
		var clearBtnTxt = document.createTextNode("Start Over");
		clearBtn.appendChild(clearBtnTxt);
		clearBtn.id = "clearBtn";
		clearBtn.title = "Erase entries";
		buttonDiv.appendChild(clearBtn);
		
		var showBtn = document.createElement("BUTTON");
		showBtn.type = "button";
		var showBtnTxt = document.createTextNode("See Answer");
		showBtn.appendChild(showBtnTxt);
		showBtn.id = "showBtn";
		showBtn.title = "Giving up so easily?";
		buttonDiv.appendChild(showBtn);
		
		hostingElement.appendChild(buttonDiv);

		var i = lInputs.length;
		while(i--) {
			handleInput(lInputs[i].id, this);
		}

		handleClearBtn("clearBtn", this);
		handleShowBtn("showBtn", this);

		return this;
	}; 

	/**
	 * @description Adds the input/keyup handler to an input element, once the element has been added to the DOM.
	 * @param {string} id - The ID attribute of the HTML element receiving the handler.
	 * @param {Object} self - The current Gryptocram instance.
	 */
	var handleInput = function(id, self) {
		if(document.getElementById(id) != null)
		{
			if(noKeys) {
				document.getElementById(id).addEventListener("input", keyUpHandler, false);
			} else {
				document.getElementById(id).addEventListener("keydown", function(e) {heldText = this.value; if(e.keyCode >= 65 && e.keyCode <= 90) this.value = "";}, false);
				document.getElementById(id).addEventListener("keyup", keyUpHandler, false);
			}
		}
		else
			setTimeout(function() {handleInput(id, self);}, 200);
	}; 
	
	/**
	 * @description Adds the event handler to the Start Over button, once the button has been added to the DOM..
	 * @param {string} id - The ID attribute of the HTML element receiving the handler.
	 * @param {Object} self - The current Gryptocram instance.
	 */
	var handleClearBtn = function(id, self) {
		if(document.getElementById(id) != null) {
			document.getElementById(id).addEventListener("click", self.clearEntries.bind(self), false);
		}
		else {
			setTimeout(function() {handleClearBtn(id, self)}, 200);
		}
	};
	
	/**
	 * @description Adds the event handler to the See Answer button, once the button has been added to the DOM.
	 * @param {string} id - The ID attribute of the element receiving the handler.
	 * @param {Object} self - The current Gryptocram instance.
	 */
	var handleShowBtn = function(id, self) {
		if(document.getElementById(id) != null) {
			document.getElementById(id).addEventListener("click", self.solvePuzzle.bind(self), false);
		}
		else {
			setTimeout(function() {handleShowBtn(id, self)}, 200);
		}
	};

	/**
	 * @description Copies the entered letter into every other input with the same "code letter".
	 * @param {Object} e - The keyup event bound to an input element that triggered this handler.
	 */
	var keyUpHandler = function(e) {
		var v = this.value,
		equalLetters = document.querySelectorAll("." + this.className.split(" ")[1]);

		for(var i = 0, len = equalLetters.length; i < len; i++) {
			equalLetters[i].value = v.toUpperCase();
		}
	
		Gryptocram.prototype.savePuzzle();

		// DEL, BKSP, TAB, Arrows, etc. shouldn't advance the position, but letters should.
		if((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode == 32 || e.keyCode == 13 || e.keyCode == 39) {
			Gryptocram.prototype.advancePosition.call(this);
		} else if(e.keyCode == 37) {
			Gryptocram.prototype.reversePosition.call(this);
		}

		if(Gryptocram.prototype.isComplete()) {
			Gryptocram.prototype.endPuzzle();
			solvedOnce = true;
		} else if(solvedOnce) {
			Gryptocram.prototype.clearHighlights();
			solvedOnce = false;			
		}
	}; 
	
	/**
	 * @description Advances the cursor position to the next input in the puzzle.
	 * @returns {Object} The current Gryptocram instance.
	 */
	Gryptocram.prototype.advancePosition = function() {
		if((parseInt((this.id).substr(11),10)+1) == inputIds) {
			document.getElementById("letterInput0").focus();
			document.getElementById("letterInput0").select();
		} else {
			document.getElementById("letterInput" + (parseInt((this.id).substr(11),10)+1)).focus();
			document.getElementById("letterInput" + (parseInt((this.id).substr(11),10)+1)).select();
		}
		
		return this;
	}; 
	
	/**
	 * @description Moves the cursor position to the previous input in the puzzle.
	 * @returns {Object} The current Gryptocram instance.
	 */
	Gryptocram.prototype.reversePosition = function() {
		if((parseInt((this.id).substr(11),10)) == 0) {
			document.getElementById("letterInput" + (inputIds-1)).focus();
			document.getElementById("letterInput" + (inputIds-1)).select();
		} else {
			document.getElementById("letterInput" + (parseInt((this.id).substr(11),10)-1)).focus();
			document.getElementById("letterInput" + (parseInt((this.id).substr(11),10)-1)).select();
		}
		
		return this;
	}; 
	
	/**
	 * @description Populates all inputs with the correct decoded letters.
	 * @returns {Object} The current Gryptocram instance.
	 */
	Gryptocram.prototype.solvePuzzle = function() {
		var inputs = hostingElement.querySelectorAll("input[type='text']");
		
		for(var i = 0, len = inputs.length; i < len; i++) {
			inputs[i].value = answerArr[i];
		}
		
		this.endPuzzle();
		
		return this;
	}; 
	
	/**
	 * @description Checks if all of the inputs have been populated with the correct decoded letters.
	 * @returns {boolean}
	 */
	Gryptocram.prototype.isComplete = function() {
		var inputs = hostingElement.querySelectorAll("input[type='text']");
		
		for(var i = 0, len = inputs.length; i < len; i++) {
			 if(inputs[i].value != answerArr[i])
				 return false;
		}
		
		return true;
	}; 
	
	/**
	 * @description Creates visual effects indicating that the puzzles has been solved.
	 * @returns {Object} The current Gryptocram instance.
	 */
	Gryptocram.prototype.endPuzzle = function() {
		var inputs = hostingElement.querySelectorAll("input[type='text']");
		
		// Highlight the puzzle inputs.
		for(var i = 0, len = inputs.length; i < len; i++)
			 inputs[i].style.backgroundColor = "yellow";

		var spans = hostingElement.querySelectorAll(".overline");
		
		// Darken all of the encoded letters to draw attention away from them (adding even more emphasis to the answer).
		for(var i = 0, len = spans.length; i < len; i++)
			 spans[i].style.backgroundColor = "#DDD";

		var divs = hostingElement.querySelectorAll(".letter_div");
		
		// Make squares squeeze together, to make the answer more readable.
		for(var i = 0, len = divs.length; i < len; i++) {
			divs[i].classList.remove("letter_div");
			divs[i].classList.add("marginLess");
		}
		
		document.getElementById("showBtn").disabled = true;
		
		return this;
	}; 
	
	/**
	 * @description Remove visual effects created by the endPuzzle function.
	 * @returns {Object} The current Gryptocram instance.
	 */
	Gryptocram.prototype.clearHighlights = function() {
		var inputs = hostingElement.querySelectorAll("input[type='text']");
		
		for(var i = 0, len = inputs.length; i < len; i++)
			 inputs[i].style.backgroundColor = "initial";
		
		var spans = hostingElement.querySelectorAll(".overline");
		
		for(var i = 0, len = spans.length; i < len; i++)
			 spans[i].style.backgroundColor = "initial";
		 
		var divs = hostingElement.querySelectorAll(".marginLess");
		
		// Make squares expand back to their starting positions.
		for(var i = 0, len = divs.length; i < len; i++) {
			divs[i].classList.remove("marginLess");
			divs[i].classList.add("letter_div");
		}
		
		document.getElementById("showBtn").disabled = false;
		
		return this;
	}; 
	
	/**
	 * @description Erase current entries from all inputs in the puzzle, and reset the saved values.
	 * @returns {Object} The current Gryptocram instance.
	 */
	Gryptocram.prototype.clearEntries = function() {
		var letterInputs = hostingElement.querySelectorAll("input[type='text']");
		
		// Erase entries
		for(var i = 0, len = letterInputs.length; i < len; i++)
			letterInputs[i].value = "";
		
		// Erase saved values
		for(i = 0, len = answerArr.length; i < len; i++)
			localStorage.setItem(prefix + "enteredLetters[" + i + "]", "");
		
		this.clearHighlights();
		
		return this;
	}; 
	
	/**
	 * @description Populates puzzle inputs with the current saved version from the browser's local storage.
	 * @returns {Object} The current Gryptocram instance.
	 */
	Gryptocram.prototype.loadPuzzle = function() {
		var inputs = hostingElement.querySelectorAll("input[type='text']");
	
		if(window.localStorage) {
			for(i = 0, len = inputs.length; i < len; i++) {
				if(localStorage.getItem(prefix + "enteredLetters[" + i + "]")) {
					inputs[i].value = localStorage.getItem(prefix + "enteredLetters[" + i + "]");
				} else {
					inputs[i].value = "";
				}
			}
		}
		
		return this;
	}; 
	
	/**
	 * @description Save the input values in their current state to the browser's local storage.
	 * @returns {Object} The current Gryptocram instance.
	 */
	Gryptocram.prototype.savePuzzle = function() {
		var inputs = hostingElement.querySelectorAll("input[type='text']");
		
		if(window.localStorage) {
			for(i = 0, len = answerArr.length; i < len; i++)
				localStorage.setItem(prefix + "enteredLetters[" + i + "]", inputs[i].value);
	}

		return this;
	}; 
	
	// Expose the constructor
	return Gryptocram;
})();