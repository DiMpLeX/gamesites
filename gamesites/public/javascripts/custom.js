function show_box(id) {
	$('.widget-box.visible').removeClass('visible');
	$('#'+id).addClass('visible');
}

// // connect to the socket server
// var socket = io.connect(); 

// // if we get an "info" emit from the socket server then console.log the data we recive
// socket.on('test', function (data) {
//     console.log(data);
// });
