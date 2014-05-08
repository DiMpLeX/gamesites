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
    main_url: 'http://localhost:3000'
});

app.get('/dashboard', function(req, res) {
    var sess = req.session;

    // If no Session is Set
    if( req.path != '/dashboard' || sess.username && sess.user_id) {
        // Query the DB using the Username and ID
        db.servers.findOne({ username: sess.username, _id: ObjectId(sess.user_id) }, function(err, result) {
            // Render the Page
            res.render('back/dashboard', {
                title: app.locals.title,
                main_url: app.locals.main_url,
                meta_content: 'Gamesites200 Dashboard',
                user: result, // Put the Result in the Variable
                partials: { 
                    header: 'header',
                    footer: 'footer'
                }
            });
        });
    // Redirect
    } else { res.redirect('/login'); }
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

app.get('/join/toa', function(req, res) {
    res.render('front/toa', {
        title: app.locals.title,
        main_url: app.locals.main_url,
        header: 'Game Sites - Add Your Site', 
        partials: { header: 'header', footer: 'footer' }
    });
});

app.get('/join', function(req, res) {
    db.categories.find({ parent: { $ne: null } }, function(err, result) {
        res.render('front/signup', {
            title: app.locals.title,
            main_url: app.locals.main_url,
            gameslist: result,
            exist_error: app.get('exist'),
            partials: { 
                header: 'header',
                footer: 'footer' 
            }
        });
        app.set('exist', false);
    });
});

app.post('/join/signup', function(req, res) {
    var user = req.body;

    // Save into DB
    db.servers.findOne({ $or: [{ username: user.username }, { email: user.email }] }, function(err, result) {
        if(result) {
            // Set the Variable 'exist' to true if if exists
            app.set('exist', true);

            // Redirect back to join page
            res.redirect('/join');
        } else {
            db.servers.insert({
                // Save to Database
                email: user.email,
                password: myModule.encryptPass(user.password),
                signed_up: myModule.getDate(),
                username: user.username
            }, function(err, result) {
                // Redirect to /confirm
                res.redirect(app.locals.main_url + '/login/');
            });
        }
    });
});

// app.get('/join/confirm/:url/:id', function(req, res) {
//     db.categories.findOne({ url: '/' + req.params.url + '/'}, function(err, parent) {
        
//         db.servers.find({ main_id: parseInt(req.params.id) }, function(err, servers) {
            
//             res.render('front/confirm', {
//                 title: app.locals.title,
//                 main_url: app.locals.main_url,
//                 header: parent.name + ' Top 200 Member Area',
//                 partials: { 
//                     header: 'header',
//                     footer: 'footer' 
//                 },
//                 name: parent.name,
//                 username: servers[0]['username'],
//                 url:  req.params.url,
//                 id: servers[0]['main_id']
//             });
//         });
//     });
// });


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
    var sess = req.session;

    if(sess.username && sess.user_id) {
        // If no Session Saved
        res.redirect('/dashboard');
    } else {
        // Render the Login Page
        res.render('back/login', {
            title: app.locals.title,
            partials: { 
                header: 'header',
                footer: 'footer' 
            },
            meta_content: 'User login page',
            error: app.get('login-error')
        });
        app.set('login-error', false);
    }
});

app.post('/logging', function(req, res) {
    var user = req.body;
    var sess = req.session;

    db.servers.findOne({ 
            // Get the Username
            username: user.username, 
            // Encrypt the Password
            password: myModule.encryptPass(user.password) 
        }, function(err, result) {
        if(!result) {
            // If no Account Found
            app.set('login-error', true);
            res.redirect('/login');
        } else {
            // Put value in the Sessions
            sess.username = user.username;
            sess.user_id = result._id;

            // then redirect to dashboard
            res.redirect('/dashboard');
        }
    });
});

app.get('/logout', function(req, res) {
    // Destroy the Session then Redirect
    req.session.destroy();
    res.redirect(app.locals.main_url);
});

app.get('/dashboard/add', function(req, res) {
    var sess = req.session;

    // If Session is Set
    if(sess.username && sess.user_id) {
        // Query all the Games
        db.categories.find({ parent: { $ne: null } }, function(err, gameslist) {
            // Get all the User Info
            db.servers.findOne({ username: sess.username, _id: ObjectId(sess.user_id) }, function(err, result) {
                res.render('back/add', {
                    title: app.locals.title,
                    main_url: app.locals.main_url,
                    meta_content: 'Gamesites200 Dashboard',
                    user: result, // Set the Variable for the User
                    gameslist: gameslist, // Set all the Variable for the Games
                    partials: { 
                        header: 'header',
                        footer: 'footer'
                    }
                });
            });
        });
    // Redirect
    } else { res.redirect('/login'); }
});

app.get('/dashboard/confirm/:category/:id', function(req, res) {
    var sess = req.session;
    // If Session is Set
    if(sess.username && sess.user_id) {
        db.categories.findOne({ url: '/'+ req.params.category +'/' }, function(err, parent) {
            // Get all the User Info
            db.servers.findOne({ username: sess.username, _id: ObjectId(sess.user_id) }, function(err, result) {
                res.render('back/confirm', {
                    title: app.locals.title,
                    main_url: app.locals.main_url,
                    url: parent.url,
                    name: parent.name,
                    user: result, // Set the Variable for the User
                    id: req.params.id,
                    meta_content: 'Gamesites200 Confirm',
                    partials: { 
                        header: 'header',
                        footer: 'footer'
                    }
                });
            });
        });
    // Redirect
    } else { res.redirect('/login'); }
});

app.get('/dashboard/sites/:server', function(req, res) {
    var sess = req.session;

    if(sess.username && sess.user_id) {
        db.servers.findOne({ username: sess.username, _id: ObjectId(sess.user_id) }, function(err, result) {
            // Get the Array Values of the selected Server
            db.servers.findOne({ username: result.username },
            { site_details:
                { $elemMatch: 
                    { site_name: req.params.server } 
                }
            }, function(err, server) {
                if(server.site_details) {
                    db.categories.findOne({ _id: ObjectId(server.site_details[0]['game_parent']) }, 
                    function(err, game_parent) {
                        res.render('back/sites', {
                            title: app.locals.title,
                            main_url: app.locals.main_url,
                            meta_content: 'Gamesites200 Sites',
                            user: result,
                            game: game_parent.name,
                            server: server.site_details,
                            partials: { 
                                header: 'header',
                                footer: 'footer'
                            }
                        });
                    });
                }
                else { res.redirect('/dashboard'); }
            });
        });
    } else { res.redirect('/login'); }
});

app.post('/dashboard/reg_server', function(req, res) {
    var user = req.body;
    var sess = req.session;
    var id = new ObjectId();

    if(sess.username && sess.user_id) {
        db.categories.findOne({ _id: ObjectId(user.gamescategory) }, function(err, parent) {
            db.servers.update({ _id: ObjectId(sess.user_id), username: sess.username }, 
                { $push:
                    { site_details:
                        {
                            _id: id,
                            site_name: user.site_name,
                            site_email: user.site_email,
                            site_url: user.site_url,
                            site_desc: user.site_desc,
                            site_banner: '',
                            game_parent: user.gamescategory,
                            game_name: parent.name,
                            game_url: parent.url,
                            this_month: 0,
                            hits: 0
                        }
                    }
                }, function(err, result) {
                    res.redirect(app.locals.main_url + '/dashboard/confirm' + parent.url + id);
            });
        });
    } else { res.redirect('/login'); }
});

app.post('/dashboard/update_server', function(req, res) {
    var user = req.body;
    var sess = req.session;

    if(sess.username && sess.user_id) {
        db.servers.findOne({ _id: ObjectId(sess.user_id), username: sess.username },
        { site_details: 
            { $elemMatch: 
                { _id: ObjectId(user.id) }
            }
        }, function(err, get_server) {
            if( !get_server.site_details || err ) {
                res.redirect('/login'); 
            }

            var server_id = get_server.site_details[0]['_id'];

            db.servers.update(
            { username: sess.username, 'site_details._id': server_id }, 
            { $set: 
                { 
                    'site_details.$.site_name': user.site_name,
                    'site_details.$.site_email': user.site_email,
                    'site_details.$.site_url': user.site_url,
                    'site_details.$.site_desc': user.site_desc,
                    'site_details.$.site_banner': user.site_banner
                }
            }, function(err, server) {
                res.redirect(app.locals.main_url + '/dashboard/sites/' + user.site_name);
            });
            // console.log(get_server);
        });
    } else { res.redirect('/login'); }
});

// app.get('/:url/details-:id', function(req, res) {
//     myModule.getCategories(function(categories) {

//         db.categories.find({ _id: ObjectId(req.query.parent) }, function(err, parent) {

//             db.categories.find({ _id: ObjectId(parent[0]['parent']) }, function(err, main) {

//                 db.servers.findOne({ _id: ObjectId(req.params.id) }, function(err, child) {
//                     res.render('front/details', {
//                         title: app.locals.title,
//                         main_url: app.locals.main_url,
//                         partials: { 
//                             header: 'header', 
//                             sidebar: 'sidebar',
//                             footer: 'footer' 
//                         },
//                         parent_name: parent[0]['name'],
//                         parent_url: parent[0]['url'],
//                         main_name: main[0]['name'],
//                         result: child,
//                         main: categories,
//                     });
//                 });
//             });
//         });
//     });
// });


app.get('/:category', function(req, res, next) {
    if(req.params.category.length) {
        var parts = url.parse(req.url);

        myModule.getCategories(function(categories) {
            if(parts.pathname != 'dashboard') {
                db.categories.findOne({ url: parts.pathname }, function(err, parent) {
                    var parent_id = parent._id.toString();
                    var parent_name = parent.name;

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
            }
        });
    }
    else { next(); }
});