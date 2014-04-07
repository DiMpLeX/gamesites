app = require('../app');
var myModule = require('../myModule.js');

var fs = require('fs');
var url = require('url');
var path = require('path');
var crypto = require('crypto');

var db = require('mongojs').connect('gamesites', ['categories', 'servers']);
var ObjectId = require('mongojs').ObjectId;

app.locals({
    title: 'GAME SITES 200 - Top Gaming Game Sites',
    main_url: 'http://localhost:3000/'
});

app.get('/', function(req, res) {
    myModule.getCategories(function(categories) {
        res.render('front/index', { 
            title: app.locals.title, 
            main_url: app.locals.main_url,
            header: 'Game Sites', 
            partials: { header: 'header', footer: 'footer' },
            main: categories
        });
    });
});

app.get('/join', function(req, res, next) {
    myModule.getCategories(function(categories) {
        res.render('front/join', {
            title: app.locals.title,
            main_url: app.locals.main_url,
            header: 'Game Sites - Add Your Site', 
            partials: { header: 'header', footer: 'footer' },
            main: categories
        });
    });
});

app.get('/how', function(req, res) {
    res.render('front/how', {
        title: app.locals.title,
        main_url: app.locals.main_url,
        header: 'How Game Sites 200 Works', 
        partials: { 
            header: 'header',
            footer: 'footer' 
        }
    });
});

app.get('/login', function(req, res) {
    res.render('back/login', {
        title: app.locals.title,
        partials: { 
            header: 'header',
            footer: 'footer' 
        }
    });
});

app.post('/logging', function(req, res) {
    db.servers.findOne({username: req.body.username}, function(err, result) {
        res.send(result);
    });
});

app.get('/:url/details-:id', function(req, res) {
    myModule.getCategories(function(categories) {

        db.categories.find({ _id: ObjectId(req.query.parent) }, function(err, parent) {

            db.categories.find({ _id: ObjectId(parent[0]['parent']) }, function(err, main) {

                db.servers.findOne({ _id: ObjectId(req.params.id) }, function(err, child) {
                    res.render('front/details', {
                        title: app.locals.title,
                        main_url: app.locals.main_url,
                        partials: { 
                            header: 'header', 
                            sidebar: 'sidebar',
                            footer: 'footer' 
                        },
                        parent_name: parent[0]['name'],
                        parent_url: parent[0]['url'],
                        main_name: main[0]['name'],
                        result: child,
                        main: categories,
                    });
                });
            });
        });
    });
});


app.get('/:category', function(req, res, next) {
    if(req.params.category.length) {
        var parts = url.parse(req.url);

        myModule.getCategories(function(categories){
            db.categories.find({ url: parts.pathname }, function(err, parent) {
                var parent_id = parent[0]['_id'].toString();
                var parent_name = parent[0]['name'];

                db.servers.find({ parent: parent_id }).sort({ hits: -1 }, function(err, result) {
                    var idx = 1;
                    
                    res.render('front/list', { 
                        title: app.locals.title,
                        main_url: app.locals.main_url,
                        header: 'Top Chart', 
                        partials: { 
                            header: 'header', 
                            sidebar: 'sidebar', 
                            footer: 'footer' 
                        },
                        parent_name: parent_name,
                        parent_id: parent_id,
                        main: categories,
                        result: result,
                        idx: function() {
                            return idx++;
                        }
                    });
                });
            });
        });
    }
    else { next(); }
});

app.get('/:category/editmember', function(req, res, next) {
    var parts = url.parse(req.url, true);

    db.categories.findOne({ url: '/'+ req.params.category +'/' }, function(err, result) {
        switch(parts.query.action) {
            case 'new':
                res.render('front/toa', {
                    title: app.locals.title,
                    main_url: app.locals.main_url,
                    header: result.name + ' Top 200 Member Area', 
                    partials: { 
                        header: 'header',
                        footer: 'footer' 
                    }
                });
                break;
            case 'new2':
                res.render('front/signup', {
                    title: app.locals.title,
                    main_url: app.locals.main_url,
                    header: result.name + ' Top 200 Member Area',
                    partials: { 
                        header: 'header',
                        footer: 'footer' 
                    }
                });
                break;
            case 'confirm':
                db.servers.find({ main_id: parseInt(parts.query.id) }, function(err, servers) {
                    res.render('front/confirm', {
                        title: app.locals.title,
                        main_url: app.locals.main_url,
                        header: result.name + ' Top 200 Member Area',
                        partials: { 
                            header: 'header',
                            footer: 'footer' 
                        },
                        name: result.name,
                        url: req.params.category,
                        id: servers[0]['main_id']
                    });
                });
                break;
            default:
                res.send(404);
        }
    });
});

app.post('/:category/editmember/signup', function(req, res) {
    var user = req.body;

    db.categories.findOne({ url: '/' + req.params.category + '/' }, function(err, result) {

        // Count how many Users then add 1
        db.servers.count({}, function(err, count) {

            // Save into DB
            db.servers.insert({
                main_id: count + 1,
                active: 'Yes',
                advertiser: 'No',
                banner: user.banner,
                description: user.desc,
                email: user.email,
                hits: 0,
                name: user.name,
                password: myModule.encryptPass(user.password),
                this_month: 0,
                url: user.url,
                signed_up: myModule.getDate(),
                username: user.username,
                parent: result._id.toString()
            }, function(err, result) { 

                // Redirect to /confirm
                res.redirect(app.locals.main_url + req.params.category + '/editmember/?action=confirm&id=' + (count + 1) );
            });
        });
    });
});