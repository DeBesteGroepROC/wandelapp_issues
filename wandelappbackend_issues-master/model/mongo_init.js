//Init MongoDB Openshift

const mongo_init = function(env) {

    const proddev = env.NODE_ENV || 'dev';
    if (proddev === 'dev') {
        env = {
            PORT: 8081,
            IP: '127.0.0.1',
            MONGO_URL: 'mongodb://localhost:27017/wandelappbackendv2'
        };
    }

    let mongoURL = env.OPENSHIFT_MONGODB_DB_URL || env.MONGO_URL;
    if (mongoURL == null && env.DATABASE_SERVICE_NAME) {
        const mongoServiceName = env.DATABASE_SERVICE_NAME.toUpperCase(),
            mongoHost = env[mongoServiceName + '_SERVICE_HOST'],
            mongoPort = env[mongoServiceName + '_SERVICE_PORT'],
            mongoDatabase = env[mongoServiceName + '_DATABASE'],
            mongoPassword = env[mongoServiceName + '_PASSWORD'],
            mongoUser = env[mongoServiceName + '_USER'];

        if (mongoHost && mongoPort && mongoDatabase) {
            mongoURL = 'mongodb://';
            if (mongoUser && mongoPassword) {
                mongoURL += mongoUser + ':' + mongoPassword + '@';
            }
            // Provide UI label that excludes user id and pw
            mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

        }
    }
    return {
        ip_addr: env.IP || env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
        port: env.PORT || env.OPENSHIFT_NODEJS_PORT || 8080,
        mongoURL: mongoURL
    };
};

exports.mongo_init = mongo_init;
