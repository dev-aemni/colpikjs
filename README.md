# colpikjs
Best Importable Color Picker of the World for Your websites! Just try one time!

Colpik.js

A lightweight, modern, glass-style JavaScript color picker.

Built fully from scratch using pure:

HTML

CSS

JavaScript


No frameworks. No dependencies. No heavy bundles. No canvas libraries.

Designed for:

modern websites

custom tools

UI editors

dashboards

browser projects

quick color selection systems

glassmorphism interfaces

lightweight popup pickers



---

Features

Core Features

Popup style color picker

Lightweight

Pure JavaScript

Responsive

Mobile friendly

Fast rendering

Small memory usage

No dependencies

Custom popup sizing

Theme system

Blur + transparency customization

Multiple color formats

Real-time preview

Random color generator

Copy button

Apply callback

Modern UI



---

Current Themes

Glass Theme (Default)

The default Colpik.js theme.

Includes:

transparent background

blur effect

glass UI

soft borders

smooth shadows

floating popup effect


Example:

new Colpik({
  el: '#openPicker',
  theme: 'glass'
});


---

Included Files

index.html
colpik.css
colpik.js


---

Installation

Basic Setup

Add the CSS:

<link rel="stylesheet" href="colpik.css">

Add the JS:

<script src="colpik.js"></script>


---

Quick Example

<button id="openPicker">
Open Picker
</button>

<script>

const picker = new Colpik({

  el:'#openPicker',

  onPick(color){

    console.log(color.hex);

  }

});

</script>


---

Full Example

<!DOCTYPE html>
<html>
<head>

<link rel="stylesheet" href="colpik.css">

</head>
<body>

<button id="pickerBtn">
Open Colpik
</button>

<script src="colpik.js"></script>

<script>

const picker = new Colpik({

  el:'#pickerBtn',

  theme:'glass',

  transparency:86,

  blur:18,

  width:236,

  onPick(color){

    document.body.style.background =
    color.hex;

  }

});

</script>

</body>
</html>


---

Constructor

new Colpik(options)


---

Options

Option	Type	Default	Description

el	string	required	target element selector
theme	string	glass	theme name
transparency	number	86	glass opacity
blur	number	18	blur amount
width	number	240	popup width
minWidth	number	180	minimum popup width
maxWidth	number	340	maximum popup width
format	string	hex	default output format
onPick	function	empty function	callback after apply



---

Supported Formats

HEX

#00aaff

RGB

rgb(0, 170, 255)

RGBA

rgba(0, 170, 255, 0.50)

HSL

hsl(200, 100%, 50%)


---

onPick Callback

Triggered when the user presses:

Apply

Example:

onPick(color){

  console.log(color.hex);
  console.log(color.rgb);
  console.log(color.rgba);
  console.log(color.hsl);

}


---

Returned Color Object

{

  hex:'#00aaff',

  rgb:'rgb(0, 170, 255)',

  rgba:'rgba(0, 170, 255, 1)',

  hsl:'hsl(200, 100%, 50%)'

}


---

Theme Customization

Glass Theme

new Colpik({

  el:'#btn',

  theme:'glass',

  transparency:90,

  blur:25

});


---

Runtime Theme Change

Change Theme

picker.setTheme('glass', {

  transparency:75,

  blur:24

});


---

Runtime Glass Update

picker.setGlass(80, 30);


---

Width Customization

Fixed Width

new Colpik({

  el:'#btn',

  width:260

});


---

Width Limits

new Colpik({

  el:'#btn',

  width:240,

  minWidth:180,

  maxWidth:340

});


---

Open and Close Behavior

Colpik.js automatically:

opens near target element

closes outside click

animates popup

handles mobile resizing



---

Current Buttons

Copy

Copies current color.


---

Random

Generates random color.


---

Apply

Triggers callback.


---

Internal Methods

setTheme

picker.setTheme('glass', {
  transparency:90,
  blur:20
});


---

setGlass

picker.setGlass(80, 25);


---

destroy

Removes the picker completely.

picker.destroy();


---

Mobile Support

Colpik.js is optimized for:

Android browsers

mobile Chrome

mobile Firefox

responsive layouts

touch controls

pointer events



---

Performance

Designed to stay:

lightweight

fast

low memory

dependency free

smooth on mobile



---

Styling

Main styles are inside:

colpik.css

Main logic is inside:

colpik.js

Demo usage:

index.html


---

Example Ideas

You can use Colpik.js for:

paint apps

website builders

theme editors

CSS generators

profile customizers

dashboard tools

game editors

visual scripting tools

UI generators

graphic utilities



---

Planned Features

Future possible features:

eyedropper API

gradients

swatches save system

localStorage themes

alpha grid

keyboard controls

custom presets

dark/light auto mode

npm package build

ESM support

animations API

plugin system

palette export

PNG palette export



---

Example NPM Style Usage

Future style:

import Colpik from 'colpikjs';

const picker = new Colpik({
  el:'#btn'
});


---

GitHub

Repository:

https://github.com/dev-aemni/colpikjs


---

License

MIT


---

Credits

Created by:

Aemni

Built with pure frontend technologies.