jQuery: Image Input
===================

Turns an image into a widget to select and display an image (JPEG only) based on data URLs (useful for AJAX-based forms).
Use Drag & Drop or click on the image / press the space bar while it is focused.

Note: Uses the HTML 5 FileReader API provided by Firefox and Chrome (not Safari)

Usage
-----

HTML:
	<img class="input" data-default="unknown.png">

JavaScript:
	$('img.input').imageInput();
 