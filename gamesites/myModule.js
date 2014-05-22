var db = require('mongojs').connect('gamesites', ['categories', 'servers']);
var crypto = require('crypto');

function test(message) { 
	console.log(message);
}
module.exports.test = test;

// Get All Categories Collection
function getCategories(callback) {
	db.categories.find({ parent: null }).sort({name: 1}, function(err, main) {
		var ctr = main.length;
		var childs = [];
		for (var idx in main) {
			(function(idx) {
				db.categories.find({ parent: main[idx]['_id'].toString() }, function(err, childs) {
					main[idx]['childs'] = childs;

					if (--ctr === 0) {
						callback(main);
					}
				});
			})(idx);
		}
	});
};
module.exports.getCategories = getCategories;

// Get the Current Date
function getDate() {
    var d = new Date();
    var months = new Array(
        "January", "February", "March", "April", "May", "June", "July", 
        "August", "September", "October", "November", "December"
    );
    var current_date = months[d.getMonth()] + ' ' + d.getDate() + "," + d.getFullYear();

    return current_date;
}
module.exports.getDate = getDate;

// Encrypt the given Password
function encryptPass(password) {
    var pass = crypto.createHash('sha1')
       .update(password)
       .digest('hex');

    return pass;
}
module.exports.encryptPass = encryptPass;

// var public = {};

// public.getCategories = function(callback) {
// 	db.categories.find({ parent: null }).sort({name: 1}, function(err, main) {
// 		var ctr = main.length;
// 		var childs = [];
// 		for (var idx in main) {
// 			(function(idx) {
// 				db.categories.find({ parent: main[idx]['_id'].toString() }, function(err, childs) {
// 					main[idx]['childs'] = childs;

// 					if (--ctr === 0) {
// 						callback(main);
// 					}
// 				});
// 			})(idx);
// 		}
// 	});
// };

// module.exports = public;


// var mongojs = require('mongojs');
// var db = mongojs('gamesites', ['gameCategory']);

// function gameCategory(id, callback) {
// 	db.gameCategory.find({}, function(err, result) {
// 		callback(err, result);
// 	});
// }
// module.exports.gameCategory = gameCategory;

// db.servers.find({}).sort({ hits: -1 }, function(err, result) {
// 	if(err || !result || result == 0 ) {
// 		console.log('No DB Found!');
// 		res.send(404);
// 	} else { 
// 		console.log(result);
// 		res.render('join', {
// 			partials: { 
// 				header: 'header', 
// 				sidebar: 'sidebar', 
// 				footer: 'footer'
// 			},
// 			main: categories
// 		});
// 	}
// });

// db.servers.find().forEach(function(err, result) {
// 	if (!result) {
//         // we visited all docs in the collection
//         return;
//     } else {
// 		console.log(result.name);
// 	}
// });

// db.servers.find({}, function(err, result){			
// 	console.log(result[0]['name']);
// });