//Factory function returns wandelroutes object
const wandelroutes = function(connectionstring) {

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
                    }
                );
            });
        },
        routes: (callback, cuid) => {
            self.mongoconnection().then(
                (db) => {
                    let col = db.collection('wandelroutes');
                    col.find({'cuid': cuid}).toArray(function(err, docs) {
                        callback(docs);
                        db.close();
                    });
                },
                (err) => console.log(err)
            );
        },
        add_route : (data, callback) => {
            //Store route (json) into MongoDB
            self.mongoconnection().then(
                (db) => {
                    db.collection('wandelroutes').insertOne(data, function(err, r) {
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
                (err) => console.log(err)
            );
        },
        findroute: (query, callback) => {
            self.mongoconnection().then(
                (db) => {
                    const col = db.collection('wandelroutes');
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
                    db.dropCollection('wandelroutes', function (err, r) {
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

exports.wandelroutes = wandelroutes;
