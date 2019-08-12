function makeTooltip(ref, title){
	ref.hover(function(){
	    // Hover over code
	    $('<p class="tooltip"></p>')
	    .text(title)
	    .appendTo('body')
	    .fadeIn('slow');
	}, function() {
	    // Hover out code
	    $('.tooltip').remove();
	}).mousemove(function(e) {
	    var mousex = e.pageX + 20; //Get X coordinates
	    var mousey = e.pageY + 10; //Get Y coordinates
	    $('.tooltip')
	    .css({ top: mousey, left: mousex })
	});
}
