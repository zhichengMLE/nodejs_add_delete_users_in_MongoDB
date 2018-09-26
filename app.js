var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('nodejs_test', ['users'])
var ObjectId = mongojs.ObjectId;
var app = express()

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

// global vars
app.use(function(req, res, next){
    res.locals.error = null;
    next();
});

app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        var root = namespace.shift()
        var formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']'
        }
        return {
            paramm: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.get('/', function(req, res){
    db.users.find(function (err, docs){
        console.log(docs);
        res.render('index', {
            'title': 'Add and Delete Users Sample with MongoDB',
            'users': docs,
        });
    });
});

app.post('/', function(req, res){
    req.checkBody('first_name', 'First Name is Required').notEmpty();
    req.checkBody('last_name', 'Last Name is Required').notEmpty();

    var errors = req.validationErrors();

    if(errors){
        db.users.find(function (err, docs){
            console.log(docs);
            res.render('index', {
                'title': 'Add and Delete Users Sample with MongoDB',
                'users': docs,
                'errors': errors
            });
        });
    }
    else
    {
        var newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name
        }

        db.users.insert(newUser, function(err, result){
            if(err){
                console.log(err);
            }
            res.redirect('/')
        });
    }
});

app.delete("/users/delete/:id", function(req, res){
    console.log(req.params.id);
    db.users.remove({_id: ObjectId(req.params.id)}, function(err, result) {
        if(err)
        {
            console.log(err)
        }
        res.redirect('/')
    });
});

app.listen(3000, function(){
    console.log('Server started on Port 3000...');
});