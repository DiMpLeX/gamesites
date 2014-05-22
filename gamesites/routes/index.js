// Require the app.js file
app = require('../app');

// Custom Functions
var myModule = require('../myModule.js');

// Node Initializer
var fs = require('fs'),
    url = require('url'),
    path = require('path'),
    crypto = require('crypto');

// Database Connection
var db = require('mongojs').connect('gamesites', ['categories', 'servers']);
var ObjectId = require('mongojs').ObjectId;

// Local Variables
app.locals({
    title: 'GAME SITES 200 - Top Gaming Game Sites',
    main_url: 'http://localhost:3000'
});

/**
 *
 * Dashboard Admin Page 
 *
 */
app.get('/dashboard', function(req, res) {
    // Put the Session in a variable
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

/**
 *
 * Forgot Password Page 
 *
 */
app.get('/forgot', function(req, res) {
    // Render the Page
    res.render('back/forgot', {
        partials: { header: 'header', footer: 'footer' }
    });
});

/**
 *
 * Home Page 
 *
 */
app.get('/', function(req, res) {
    myModule.getCategories(function(categories) {
        // Render the Page
        res.render('front', { 
            title: app.locals.title, 
            main_url: app.locals.main_url,
            header: 'Game Sites', 
            partials: { header: 'header', footer: 'footer' },
            main: categories
        });
    });
});


/**
 *
 * Advertise Page 
 *
 */
app.get('/advertise', function(req, res) {
    var sess = req.session;

    // Render the Page
    res.render('front/advertise', {
        title: app.locals.title, 
        main_url: app.locals.main_url,
        header: 'Advertise on Game Sites 200', 
        partials: { header: 'header', footer: 'footer' },
        logged: sess.username && sess.user_id
    });
});

/**
 *
 * Terms and Agreement Page 
 *
 */
app.get('/join/toa', function(req, res) {
    // Render the Page
    res.render('front/toa', {
        header: 'Game Sites - Add Your Site', 
        partials: { header: 'header', footer: 'footer' }
    });
});

/**
 *
 * Registration Page 
 *
 */
app.get('/join', function(req, res) {
    db.categories.find({ parent: { $ne: null } }, function(err, result) {
        // Render the Page
        res.render('back/register', {
            title: app.locals.title,
            main_url: app.locals.main_url,
            gameslist: result,
            exist_error: app.get('exist'), // If user already Exists
            partials: { 
                header: 'header',
                footer: 'footer' 
            }
        });
        // Set the Exist Variable to normal
        app.set('exist', false);
    });
});

/**
 *
 * Registration Action Page
 *
 */
app.post('/join/signup', function(req, res) {
    // Get all the User Input Infos
    var user = req.body;

    // Save into DB
    db.servers.findOne({ $or: [{ username: user.username }, { email: user.email }] }, function(err, result) {
        // If User already exist
        if(result) {
            // Set the Variable 'exist' to true
            app.set('exist', true);

            // Redirect back to join page
            res.redirect('/join');
        } else {
            // Save it to Database
            db.servers.insert({
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

/**
 *
 * How it Works Page 
 *
 */
app.get('/how', function(req, res) {
    // Render the Page
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

/**
 *
 * Contact Us Page 
 *
 */
app.get('/contact', function(req, res) {
    // Render the Page
    res.render('front/contact', {
        title: app.locals.title,
        main_url: app.locals.main_url,
        header: 'Contact Game Sites 200',
        partials: { 
            header: 'header',
            footer: 'footer' 
        }
    });
});

/**
 *
 * Login Page 
 *
 */
app.get('/login', function(req, res) {
    // Put the Session into a variable
    var sess = req.session;

    if(sess.username && sess.user_id) {
        // If no Session Saved
        res.redirect('/dashboard');
    } else {
        // Render the Page
        res.render('back/login', {
            title: app.locals.title,
            partials: { 
                header: 'header',
                footer: 'footer' 
            },
            meta_content: 'User login page',
            error: app.get('login-error') // if login is not recognized
        });
        // Set the login-error to normal
        app.set('login-error', false);
    }
});

/**
 *
 * Login Action Page 
 *
 */
app.post('/logging', function(req, res) {
    // Put the Session and User info into a variable
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
            // Redirect
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

/**
 *
 * Logout Action Page 
 *
 */
app.get('/logout', function(req, res) {
    // Destroy the Session then Redirect
    req.session.destroy();
    res.redirect(app.locals.main_url);
});

/**
 *
 * Add Private Server Page 
 *
 */
app.get('/dashboard/add', function(req, res) {
    // Get all the User Input Infos
    var sess = req.session;

    // If Session is Set
    if(sess.username && sess.user_id) {
        // Query all the Games
        db.categories.find({ parent: { $ne: null } }, function(err, gameslist) {
            // Get all the User Info
            db.servers.findOne({ username: sess.username, _id: ObjectId(sess.user_id) }, function(err, result) {
                // Render the Page
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

/**
 *
 * Confirm Add Private Server Page 
 *
 */
app.get('/dashboard/confirm/:category/:id', function(req, res) {
    // Get all the Session into a Variable
    var sess = req.session;

    // If Session is Set
    if(sess.username && sess.user_id) {
        db.categories.findOne({ url: '/'+ req.params.category +'/' }, function(err, parent) {
            // Get all the User Info
            db.servers.findOne({ username: sess.username, _id: ObjectId(sess.user_id) }, function(err, result) {
                // Render the Page
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

/**
 *
 * Private Server Page 
 *
 */
app.get('/dashboard/sites/:server', function(req, res) {
    // Get all the Session into a Variable
    var sess = req.session;

    // If Session is Set
    if(sess.username && sess.user_id) {
        // Find the User
        db.servers.findOne({ username: sess.username, _id: ObjectId(sess.user_id) }, function(err, result) {
            // Get the Array Values of the selected Server
            db.servers.findOne({ username: result.username },
            { site_details:
                { $elemMatch: 
                    { site_name: req.params.server } 
                }
            }, function(err, server) {
                // If it has Result
                if(server.site_details) {
                    // Query to Find the Game Parent Name
                    db.categories.findOne({ _id: ObjectId(server.site_details[0]['game_parent']) }, 
                    function(err, game_parent) {
                        // Render the Page
                        res.render('back/sites', {
                            title: app.locals.title,
                            main_url: app.locals.main_url,
                            meta_content: 'Gamesites200 Sites',
                            user: result,
                            game: game_parent.name,
                            server: server.site_details, // Selected Server Details
                            partials: { 
                                header: 'header',
                                footer: 'footer'
                            }
                        });
                    });
                }
                // Redirect
                else { res.redirect('/dashboard'); }
            });
        });
    // Redirect
    } else { res.redirect('/login'); }
});

/**
 *
 * Add Private Server Action Page 
 *
 */
app.post('/dashboard/reg_server', function(req, res) {
    // Put all in Variables
    var user = req.body;
    var sess = req.session;
    var id = new ObjectId();

    // If Session is Set
    if(sess.username && sess.user_id) {
        // Find the Parent Category
        db.categories.findOne({ _id: ObjectId(user.gamescategory) }, function(err, parent) {
            // Find the User and Add this in his database
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
                // Then Redirect
                res.redirect(app.locals.main_url + '/dashboard/confirm' + parent.url + id);
            });
        });
    // Redirect
    } else { res.redirect('/login'); }
});


/**
 *
 * Update Private Server Action Page 
 *
 */
app.post('/dashboard/update_server', function(req, res) {
    // Put the Session and User Info in a Variable
    var user = req.body;
    var sess = req.session;

    // If Session is Set
    if(sess.username && sess.user_id) {
        // Find the User
        db.servers.findOne({ _id: ObjectId(sess.user_id), username: sess.username },
        // using the Server ID
        { site_details: 
            { $elemMatch: 
                { _id: ObjectId(user.id) }
            }
        }, function(err, get_server) {
            // If no Result
            if( !get_server.site_details || err ) {
                res.redirect('/login'); 
            }

            // Get the ID
            var server_id = get_server.site_details[0]['_id'];

            // Update the Specific Server
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
                // then Redirect
                res.redirect(app.locals.main_url + '/dashboard/sites/' + user.site_name);
            });
        });
    // Redirect
    } else { res.redirect('/login'); }
});

/**
 *
 * Server Details Page (Front) 
 *
 */
app.get('/:category/details-:id/:username', function(req, res) {
    // Get All the Database For Sidebar
    myModule.getCategories(function(categories) {
        // Find the User using the username in the URL
        db.servers.findOne({ username: req.params.username },
        { site_details: 
            { $elemMatch: 
                { 
                    _id: ObjectId(req.params.id)
                }
            }
        }, function(err, server) {
            // Get the Result
            var server_info = server.site_details[0];

            // Render the Page
            res.render('front/details', {
                title: app.locals.title,
                main_url: app.locals.main_url,
                partials: { 
                    header: 'header', 
                    sidebar: 'sidebar',
                    footer: 'footer' 
                },
                main: categories,
                result: server_info // SEt the Result
            });
        });
    });
});

/**
 *
 * Server List Page (Ranking) 
 *
 */
app.get('/:category', function(req, res, next) {
    // Get All the Database For Sidebar
    myModule.getCategories(function(categories) {
        // Get the Url
        var parts = url.parse(req.url);

        // If the URL is not Dashboard
        if(parts.pathname != 'dashboard') {
            // Look in the categories db for Parent Name
            db.categories.findOne({ url: '/'+ req.params.category +'/' }, function(err, parent_category) {

                // Get all Servers with corresponding category
                db.servers.find({ 'site_details.game_url' : '/'+ req.params.category +'/' },
                // Show only site_details and username
                { 'site_details': 1, username: 1 },
                function( err, category_list ) {
                    for (var cIdx in category_list) {
                        var categoryList = category_list[cIdx];

                        for (var dIdx = 0; dIdx < categoryList.site_details.length; dIdx++) {
                            var siteDetail = categoryList.site_details[dIdx];

                            if (siteDetail.game_url !== '/'+ req.params.category +'/') {
                                category_list[cIdx].site_details.splice(dIdx, 1);
                                dIdx--;
                            }
                        }
                    }

                    var idx = 1;

                    // Render the Page
                    res.render('front/list', { 
                        title: app.locals.title,
                        main_url: app.locals.main_url,
                        partials: { 
                            header: 'header', 
                            sidebar: 'sidebar', 
                            footer: 'footer' 
                        },
                        main: categories,
                        result: category_list,
                        parent_name: parent_category.name,
                        idx: function() {
                            return idx++;
                        }
                    });
                });
            });
        }
        else { next(); }
    });
});