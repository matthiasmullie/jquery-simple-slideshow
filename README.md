# jquery-simple-slideshow

This is a simple jQuery-based slideshow. It will not require a pre-defined complex HTML structure.
All that is needed is for 1 original <img> to be added to the HTML. 2 Clones will be created at exactly the place of the original image, and will start iterating the images according to the desired config.

## Options

* **fadeTime** *(5000)*
The duration for which an image will be displayed, in milliseconds
* **fadeSpeed** *('normal')*
The animation time during which the image will fade out, in milliseconds
* **bindPrevious**
jQuery element(s) that, when clicked, should display the previous image
* **bindNext**
jQuery element(s) that, when clicked, should display the next image
* **bindSpecific**
jQuery element(s) that, when clicked, should display a specific image. First element will be bound to first image, second element to second image, ...
* **images**
Array of paths for image to be displayed. Paths can also be defined via the slideshow element's data-images attribute.
* **links**
Optional array of links to make images clickable, tied by index to the array of images. Paths can also be defined via the slideshow element's data-links attribute.
* **random** *(false)*
Randomize the images' display order

## Example 1

* 10 second display time
* 1 second fade time
* previous & next buttons
* 3 images, all clickable to 3 links
* random images

Looks like:

    <img id="slideshow" src="path/to/initial/file.jpg" />
    <a href="#" id="prev">Previous</a>
    <a href="#" id="next">Next</a>
    
    <script src="jquery.min.js" /> <!-- path to jQuery -->
    <script src="jquery.simple.slideshow.js" /> <!-- path to slideshow script -->
    <script>
    	$('#slideshow').simpleSlideshow({
    		fadeTime: 10000,
    		fadeSpeed: 1000,
    		bindPrevious: $('#prev'), // bind button to previous image
    		bindNext: $('#next'), // bind button to next image
    		images: [
    			'path/to/initial/file.jpg',
    			'path/to/second/file.jpg',
    			'path/to/another/file.jpg',
    		],
    		links: [
    			'http://www.mullie.eu',
    			'http://www.twitter.com/matthiasmullie',
    			'http://www.linkedin.com/in/matthiasmullie',
    		],
    		random: true
    	});
    </script>

## Example 2

* Image-specific controls
* Image paths tossed in as data-attribute

Looks like:

    <img id="slideshow" src="path/to/initial/file.jpg" data-images="path/to/initial/file.jpg,path/to/second/file.jpg,path/to/another/file.jpg" />
    <a href="#" class="controls">1</a>
    <a href="#" class="controls">2</a>
    <a href="#" class="controls">3</a>
    
    <script src="jquery.min.js" /> <!-- path to jQuery -->
    <script src="jquery.simple.slideshow.js" /> <!-- path to slideshow script -->
    <script>
    	$('#slideshow').simpleSlideshow({
    		bindSpecific: $('.controls'), // bind image-specific buttons
    	});
    </script>

## License
Minify is [MIT](http://opensource.org/licenses/MIT) licensed.
