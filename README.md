# gryptocram.js

An easy-to-use JavaScript library to add a working cryptogram puzzle to your webpage.

You can add a puzzle to any visible element on your page. To use the built-in styles in the gryptocram.css file just add the class "grypt-host" to the element where the puzzle will be stored.

The user's progress on a puzzle is immediately saved in the browser's local storage, so they can continue later.

## Usage

A puzzle is created by calling the Gryptocram constructor. The argument in this call is an object of key-value pairs, which must contain at least two properties. One property is "answer". The other property can be "encoding" or "encodedAnswer". See Options below.

Example:

```
var grypt = new Gryptocram({answer: "BYE, BYE", encodedAnswer: "MOD, MOD"});
```

### Options

answer {string} - A string representing the final answer. (If this is not in all caps, it will be converted to all caps.) Default is "".

encodedAnswer {string} - A string representing the letters that you want to show for the puzzle. Default is "".

encoding {Object} - An object where the key-value pairs represent that the letter in the key should be mapped to the letter in the value. Default is a basic map,

```
{
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
	}
```

but you should create your own (or use encodedAnswer) to give your puzzles variety.

Between encoding and encodedAnswer, encoding takes priority, so if you provide both then only encoding will be used.

> Note: the current version only supports adding one puzzle per page.

## License

gryptocram.js is available for use under the MIT License.
