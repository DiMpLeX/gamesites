var db = require('mongojs').connect('gamesites', ['user']);

// db.user.save({name: 'James', occupation: 'Sex Slave'}, function(err, saved) {
// 	if(err || !saved) console.log("User not saved :(");
// 	else console.log("User saved!");
// });

// db.user.find({occupation: 'Sex Slave'}, function(err, user) { 
// 	if(err || !user) console.log("User not found :(");
// 	else user.forEach(function(rUser) {
// 		console.log(rUser);
// 	});
// });

// db.user.remove({name: 'James'}, function(err, result) { 
// 	if(err || !result) console.log("User not deleted :(");
// 	else console.log('User deleted: ', result);
// });