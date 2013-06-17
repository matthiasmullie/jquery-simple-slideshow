(function($) {
'use strict';

/**
 * Animate an object, fading images in & out.
 *
 * @author Matthias Mullie <slideshow@mullie.eu>
 *
 * @option int fadeTime The time in milliseconds in between 2 pics
 * @option int fadeSpeed The time in milliseconds for the fade animation (any value accepted by $.hide)
 * @option object bindPrevious jQuery object to hook to 'previous'
 * @option object bindNext jQuery object to hook to 'next'
 * @option object bindSpecific jQuery object to hook to specific images
 * @option array images Array of paths to images for slideshow
 * @option array links Array of urls for the visible image to link to in case of click
 * @option bool random Show images in random order
 * @param object settings Customize your slideshow
 * @return object
 */
$.fn.slideshow = function(options) {
	return this.each(function() {
		var slideshow =
		{
			defaults: {
				fadeTime: 5000,
				fadeSpeed: 'normal',
				bindPrevious: $(),
				bindNext: $(),
				bindSpecific: $(),
				images: [],
				links: [],
				random: false
			},

			options: {},
			images: [],
			links: [],
			imageIndex: -1,
			$element: null,
			$curr: null,
			$next: null,
			timer: 0,

			/**
			 * Initialise slideshow.
			 *
			 * @param object options
			 */
			init: function(options) {
				slideshow.options = $.extend({}, slideshow.defaults, options);
				slideshow.$element = $(this);

				slideshow.loadImages();
				slideshow.initDom();
				slideshow.bindButtons();

				// let the show begin; it'll immediately advance to next image,
				// but we want that next to be the default image first
				slideshow.next(slideshow.imageIndex--);
			},

			/**
			 * Show next image.
			 *
			 * @param int index Requested image index
			 * @return false Prevents default event action
			 */
			next: function(index) {
				clearTimeout(slideshow.timer);

				slideshow.imageIndex = slideshow.nextIndex(index);

				// preload image, only continue once it's fully loaded
				// not using jQuery load event since it's reported to be inaccurate
				var image = new Image();
				image.src = slideshow.options.images[slideshow.imageIndex];
				image.onload = slideshow.fade();

				// slideshow.$next had 'load' bound to slideshow.fade

				return false;
			},

			/**
			 * Fade images in/out.
			 */
			fade: function() {
				// set next image in the background
				slideshow.$next.attr('src', slideshow.options.images[slideshow.imageIndex]);
				slideshow.fixPosition(slideshow.$next);

				// fade out current img, move new image to the front & make that img visible again
				slideshow.$curr.fadeOut(slideshow.options.fadeSpeed, function() {
					slideshow.$curr.attr('src', slideshow.$next.attr('src'));
					slideshow.fixPosition(slideshow.$curr);

					// catch up on src change before making this foreground again
					setTimeout($.proxy(slideshow.$curr, 'show'), slideshow.options.fadeSpeed / 2);

					slideshow.setLink(slideshow.imageIndex);
					slideshow.setSelected(slideshow.imageIndex);
				});

				// let's have next image in <fadeTime>
				slideshow.timer = setTimeout($.proxy(slideshow, 'next', slideshow.imageIndex + 1), slideshow.options.fadeTime);
			},

			/**
			 * Set the index for the next image to load.
			 *
			 * @param int[optional] index Requested image index, default +1
			 * @param bool[optional] allowRandom Allow random index (if random enabled), default true
			 * @return int
			 */
			nextIndex: function(index, allowRandom) {
				var min = 0,
					max = slideshow.options.images.length - 1;

				if (slideshow.options.random && allowRandom !== false) {
					index = slideshow.randomIndex();

				// default index
				} else if (index === null) {
					index = slideshow.imageIndex + 1;
				}

				// across boundaries = leap over
				index = (slideshow.options.images.length + index) % slideshow.options.images.length;
				index = Math.max(Math.min(index, max), min);

				return index;
			},

			/**
			 * Pick a random index, different from the current image.
			 * 
			 * @return int
			 */
			randomIndex: function() {
				var random;

				// do not pick the same image as the one currently shown
				do {
					random = Math.floor(Math.random() * slideshow.options.images.length);
				} while (random === slideshow.imageIndex);

				return random;
			},

			/**
			 * Bind a link to an image.
			 *
			 * @param int index Index number of the displayed image
			 */
			setLink: function(index) {
				// don't stack binds, unbind any previously bound click events
				slideshow.$curr.off('click');

				// check if we have a link for this image
				if (slideshow.options.links[index]) {
					slideshow.$curr.css('cursor', 'pointer');
					slideshow.$curr.on('click', function() {
						window.location = slideshow.options.links[index];
						return false;
					});
				} else {
					slideshow.$curr.css('cursor', 'default');
				}
			},

			/**
			 * Set selected state for image-specific controls.
			 *
			 * @param int index Index number of the displayed image
			 */
			setSelected: function(index) {
				slideshow.options.bindSpecific.removeClass('selected');
				slideshow.options.bindSpecific.eq(index).addClass('selected');
			},

			/**
			 * Binds click events to buttons to manually browse images, to
			 * the elements defined via:
			 * * bindPrevious: element to browse to previous image,
			 * * bindNext: element to browse to next image,
			 * * bindSpecific: elements, in order to browse to specific image #
			 */
			bindButtons: function() {
				// bind previous & next links
				slideshow.options.bindPrevious.on('click tap', function() {
					return slideshow.next(slideshow.imageIndex - 1);
				});
				slideshow.options.bindNext.on('click tap', function() {
					return slideshow.next(slideshow.imageIndex + 1);
				});

				// bind link to specific images; disallow random image
				slideshow.options.bindSpecific.each(function(i) {
					$(this).on('click tap', $.proxy(slideshow, 'next', i, false));
				});
			},

			/**
			 * Fill the array of images we'll be displaying in the slideshow.
			 */
			loadImages: function() {
				var original = slideshow.$element.attr('src');

				// load images from data-images attr (and data-links for links)
				slideshow.loadFromData();

				if (original) {
					// check if element's src is in images array already (cause we will want that one too)
					if ($.inArray(original, slideshow.options.images) < 0) {
						slideshow.options.images.push(original);
					}

					// make slideshow start at the position of the original img's src
					slideshow.imageIndex = $.inArray(original, slideshow.options.images);
				}
			},

			/**
			 * Loads images tossed in via the element's data-images attribute,
			 * as a comma-separated list of file uri's.
			 * Per-image desired links can be added the same way, in the same
			 * order, via data-links.
			 */
			loadFromData: function() {
				var images = slideshow.$element.data('images'),
					links = slideshow.$element.data('links');

				if (images) {
					images = images.replace(/\s+/, '').split(',');
					slideshow.options.images = $.extend([], slideshow.options.images, images);
				}

				if (links) {
					links = links.replace(/\s+/, '').split(',' );
					slideshow.options.links = $.extend([], slideshow.options.images, links);
				}
			},

			/**
			 * The slideshow will work by cloning the image twice, absolutely
			 * positioned over the original image. One of these images will
			 * show the image, while the next is being prepared with the new
			 * image. Once ready, the current image will fade out to reveal the
			 * next, next will become current, and we can start prepping a new
			 * next.
			 * To original image will be hidden via visibility:none, to preserve
			 * it's space, which will be taken up by the 2 cloned elements.
			 */
			initDom: function() {
				// create 2 more images to make smooth transitions :)
				slideshow.$next = slideshow.$element.clone().insertAfter(slideshow.$element);
				slideshow.$curr = slideshow.$element.clone().insertAfter(slideshow.$element).css('z-index', slideshow.$element.zIndex() + 1);

				// correctly position the 2 newly created images
				slideshow.initPosition();

				// when dom is loaded & window resized, reset positions
				$('body').ready(slideshow.initPosition);
				$(window).resize(slideshow.initPosition);

				// now make the original img invisible (not display none: we still need that space for the absolutely positioned clones)
				slideshow.$element.css('visibility', 'hidden');
			},

			/**
			 * Absolutely position the newly created images at exactly the
			 * position the source image is.
			 */
			initPosition: function() {
				var position = slideshow.$element.position();

				slideshow.$element.parent().css('position', 'relative');
				slideshow.$next.css('position', 'absolute').css('left', position.left).css('top', position.top);
				slideshow.$curr.css('position', 'absolute').css('left', position.left).css('top', position.top);
			},

			/**
			 * Using images with different sizes may lead to unexpected results.
			 * In order to correctly display such images, the image will be
			 * applied to the original element and then it's positions will be
			 * applied to the 2 absolutely positioned clones that take care of
			 * the fading in and out.
			 *
			 * @param object $element
			 */
			fixPosition: function($element) {
				var position;

				slideshow.$element.attr('src', $element.attr('src'));
				position = slideshow.$element.position();

				$element.css('position', 'absolute').css('left', position.left).css('top', position.top);
			}
		};

		// init slideshow
		slideshow.init.call(this, options);
	});
};
}(jQuery));
