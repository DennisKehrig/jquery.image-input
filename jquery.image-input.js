/*!
 * Image Input 0.1 (jQuery plugin)
 * Turns an image into a widget to select and display an image (JPEG only) based on data URLs (useful for AJAX-based forms)
 * Use Drag & Drop or click on the image / press the space bar while it is focused
 *
 * Usage:
 * <img class="input" data-default="unknown.png">
 * $('img.input').imageInput();
 *
 * Note: Uses the HTML 5 FileReader API provided by Firefox and Chrome (not Safari)
 *
 * Copyright 2012, Dennis Kehrig
 * http://github.com/DennisKehrig/jquery.image-input
 */
/*jslint browser: true */
/*global jQuery, FileReader */
(function ($) {
	'use strict';
	
	$.fn.imageInput = (function () {
		var readImageAsDataURL, setImageSrcFromFile, findJpegInEvent;
		
		readImageAsDataURL = function (file, callback) {
			var reader = new FileReader();
			reader.onload = function (event) {
				callback(event.target.result);
			};
			reader.readAsDataURL(file);
		};
		
		setImageSrcFromFile = function (img, file) {
			readImageAsDataURL(file, function (url) {
				$(img).attr('src', url);
			});
		};
		
		findJpegInEvent = function (event, img) {
			var file, files, fileCount, i, $img, done;

			event = event.originalEvent;
			event.preventDefault();
			event.stopPropagation();
			
			$img = $(img);
			
			// Add a dragover class (note: also happens when the image was just clicked)
			$img.addClass('dragover');
			done = function () {
				$(this).removeClass('dragover');
			};
			
			// Get the files from a hidden file input or via drag & drop
			files = event.target.files || event.dataTransfer.files;

			// Look for a JPEG among the provided files
			for (i = 0, fileCount = files.length; i < fileCount; i += 1) {
				file = files[i];
				
				// Warn if a non-JPEG file was provided
				if (!file.type.match(/^image\/jpe?g$/)) {
					window.alert('Terribly sorry, only JPEGs are supported for now!');
				} else {
					// Once the image is loaded, we're done
					$img.one('load', done);
					// Load the image
					setImageSrcFromFile(img, file);
					return false;
				}
			}
			
			// Only reached when no JPEG was provided
			done();
		};

		return function () {
			return this.each(function () {
				var $img, $linkToRemoveImage;
				
				// The image
				$img = $(this);
				
				// Make the image focusable
				$img.attr('tabindex', 0);
				
				// Show a file selector when the image is clicked
				$img.click(function () {
					var $input, img;
					
					img = this;
					
					// Insert a hidden <input type="file"> after the image
					$input = $('<input>')
						.attr({ type: 'file', accept: 'image/jpeg' })
						.css({ position: 'absolute', left: '-9999px', top: 0 })
						.change(function (event) {
							findJpegInEvent(event, img);
							// Remove the file input and focus the image
							$(this).remove();
							return $(img).focus();
						})
						.insertAfter(img);

					// Ignore the ESC key, it might have been triggered by cancelling the file selector
					$input.add(img).keyup(function (event) {
						return event.which !== 27;
					});

					// Click the hidden input and fix the focus
					$input.focus().click().attr('tabindex', -1);
					$(img).focus();
				});
				
				// Trigger click when the space bar is pressed
				$img.keydown(function (event) {
					// Ignore everything but the space bar
					if (event.which !== 32) { return; }
					
					event.preventDefault();
					event.stopPropagation();
					$(this).click();
					
					return false;
				});

				// React to Drag & Drop events
				$img
					// Indicate that the image will be copied (instead of moved or linked)
					.on('dragover', function (event) {
						event.originalEvent.dataTransfer.dropEffect = 'copy';
						return false;
					})
					// Make it easy to style the image regardless of browser support
					.on('dragenter', function (event) {
						$img.addClass('dragover');
						return false;
					})
					.on('dragleave', function (event) {
						$img.removeClass('dragover');
						return false;
					})
					// Files have been dropped: look for a JPEG among them
					.on('drop', function (event) {
						return findJpegInEvent(event, this);
					});

				// Provide a link to remove the image
				$linkToRemoveImage = $('<a>')
					.text('Remove image')
					.attr({ 'href': '#' })
					.addClass('img-input-reset')
					.click(function () {
						$img.attr('src', $img.attr('data-default') || '').focus();
						return false;
					})
					.insertAfter($img);
				
				// Make the link invisible if the image is empty
				$img.load(function () {
					var empty, visibility;
					empty = $img.attr('src') === $img.attr('data-default') || '';
					$linkToRemoveImage.css('visibility', empty ? 'hidden' : 'visible');
				});
			});
		};
	}());
}(jQuery));
