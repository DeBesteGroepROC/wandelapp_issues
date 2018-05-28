//Factory function returns users object
const users = function (connectionstring) {

    let data = {error: false, msg: ''};
    let self = {
        connectionstring : connectionstring,
        mongoconnection : () => {
            const MongoClient = require('mongodb').MongoClient;
            return new Promise((resolve, reject) => {
                MongoClient.connect(self.connectionstring, function(err, db) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(db);
                    }
                });
            });
        },
        users: (callback) => {
            self.mongoconnection().then(
                (db) => {
                    const col = db.collection('users');
                    col.find({}).toArray(function(err, docs) {
                        callback(docs);
                        db.close();
                    });
                },
                (err) => console.log(err)
            );
        },
        add_user : (data, callback) => {
            //Store user into users collection (datetimestamp needed!)
            return self.mongoconnection().then(
                (db) => {
                    db.collection('users').insertOne(data, function(err, r) {
                        db.close();
                        if (callback) {
                            if (err) {
                                callback(err);
                            } else {
                                //console.log("Inserted:" + r.insertedCount);
                                callback(true);
                            }
                        }
                    });
                },
                (err) => err
            );
        },
        finduser: (query, callback) => {
            self.mongoconnection().then(
                (db) => {
                    const col = db.collection('users');
                    const doc = col.findOne(query, function(err, r) {
                        db.close();
                        if (callback) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(r);
                            }
                        }
                    });
                },
                (err) => callback(err)
            );
        },
        deleteall: (callback) => {
            return self.mongoconnection().then(
                (db) => {
                    db.dropCollection('users', function (err, r) {
                        db.close();
                        if (callback) callback(true);
                    });
                },
                (err) => err
            );
        }
    };
    return self;
};

exports.users = users;
