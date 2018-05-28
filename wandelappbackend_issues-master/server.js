//  Gemaakt op de volgende manier met Openshift 3
// Inloggen
// Nieuwe node + mongodb example app maken op basis van deze git repository (wandelappbackend_issues_v2)

const
    env         = process.env,
    express     = require('express'),
    app         = express(),
    fs          = require('fs'),
    morgan      = require('morgan'),
    marked      = require('marked'),
    converter   = require('./converter').converter,
    mongo_cs    = require('./model/mongo_init').mongo_init(env),
    mongo_url   = mongo_cs.mongoURL,
    mongo_port  = mongo_cs.port,
    mongo_ip    = mongo_cs.ip_addr,
    wrs         = require('./model/wandelroutes').wandelroutes(mongo_url),
    usrs        = require('./model/users').users(mongo_url),
    cuid        = require('cuid');
    // cors        = require('cors');

let clientip = '';

Object.assign = require('object-assign');

//////////////////////////////////////////////////////////
//Middleware express
app.use(morgan('combined'));

//Set headers
// app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Find clientip
app.use(function(req, res, next) {
    clientip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    next();
});

//Check if correct cuid is given
app.use(function(req, res, next) {
    //but only if obliged for this route
    const validroutes = ['/','/cuid','/health'];
    if(!validroutes.includes(req.originalUrl)) {
        if (!req.query.hasOwnProperty('cuid')) {
            res.status(200).send({error: true, msg: "Please add valid cuid as query parameter."});
        } else {
            //check when cuid is given or cuid exists in the users database
            //EXCEPT cuid=test! Wandelapp uses test instead until it is developed by students
            usrs.finduser({ip: clientip, cuid: req.query.cuid}, (doc) => {
                if (doc === null) {
                    //todo: remove ip (this is for testpurposes only
                    console.log(req.query.cuid, clientip)
                    if (req.query.cuid !== 'test') {
                        res.status(200).send({
                            error: true,
                            msg: 'ip, cuid combination is invalid. Ask for a new one on /cuid.',
                            ip: clientip,
                            cuid: req.query.cuid
                        });
                    } else {
                        next();
                    }
                } else {
                    next();
                }
            });
        }
    } else {
        next();
    }
});

//Error handling
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send('Something bad happened!');
});


//////////////////////////////////////////////////////////
//ROUTES

// Return how to use this rest api (entire README.md)
app.get('/', function (req, res) {
    let help = "";
    fs.readFile('./README.md', 'utf8', (err, data) => {
        if (err) {
            help = err;
        } else {
            help = marked(data);
        }
        res.send(help);
    });
});

app.get('/routes',
    function(req, res) {
        wrs.routes(function(docs){
            res.setHeader('Content-Type', 'application/json');
            res.send(docs);
        }, req.query.cuid);
    }
);

app.get('/health',
    function (req, res) {
        res.send({health: 'Im OK!'});
    }
);

//////////////////////////////////////////////////////////
//When a new gpx route is uploaded
app.post('/upload', function (req, res) {
    const fp = "routes/dummy2.gpx";
    //upload text file (gpx file)
    const ws = fs.createWriteStream(fp);
    req.pipe(ws);
    //When gpx file is written, do conversion
    req.on('end', function () {
        //convert it
        converter.gpx_to_geojson(fp).then(
            (data) => {
                //add converted to db
                data.cuid = req.query.cuid;
                // console.log(data);
                wrs.add_route(data);
                res.send(JSON.stringify(data));
                // res.send({error: true, msg: "OK"}); //
            },
            (err) => {
                // data.error = true;
                // data.msg = "Error in file"
                // res.send(JSON.stringify(data));
                res.send({error: true, msg: "Invalid file", cuid: req.query.cuid});
            });
    });

});

//////////////////////////////////////////////////////////
//When a cuid is requested from a certain ip
app.get('/cuid', function (req, res) {
        /* save cuid in database when:
            - ip doesn't exist in database (user is new, add it)
            - ip exists in database (send cuid)
         */
        // usrs.finduser({ip: clientip}, (doc) => {
        //         if (doc === null){
                    const new_cuid = cuid();
                    usrs.add_user({cuid: new_cuid, ip: clientip, created: new Date()});
                    res.send({error: false, cuid: new_cuid});
                // } else {
                //     res.send({error: true, msg: 'ip already in use', ip:clientip, cuid: doc.cuid});
                // }
            // }
        // );

    }
);

app.get('/test/clearall', function (req,res) {
        usrs.deleteall((result) => {
            console.log(result);
        });
        wrs.deleteall((result) => {
            console.log(result);
        });

});


//////////////////////////////////////////////////////////
//Start (express) server
app.listen(mongo_port, mongo_ip, function () {
    console.log('Server running on http://%s:%s', mongo_ip, mongo_port);
});

module.exports = app ;
