var express = require('express'),
    http = require('http'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    RedisStore = require('connect-redis')(express),
    redis = require('redis').createClient(),
    app = module.exports = express();


// var routes = require('./routes');
// var users = require('./routes/user');

// var session = require('express-session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', cons.mustache);
app.set('view engine', 'html');
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.session({
    secret: 'gamesites200secret',
    store: new RedisStore({
        host: 'localhost',
        port: 6379,
        client: redis
    })
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// app.get('/', routes.index);
// app.get('/users', users.list);

require('./routes');


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

var debug = require('debug')('my-application');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

//Socket IO
// var io = require('socket.io').listen(server);
// io.sockets.on('connection', function (socket) {
//     socket.emit('test', { msg: 'test' });
// });
