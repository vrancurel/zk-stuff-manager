const zookeeper = require('node-zookeeper-client');
const async = require('async');
const c = require('./constants.js');

const client = zookeeper.createClient('localhost:2181');

client.once('connected', () => {
    // console.log('Connected to the ZK server.');
    async.series([callback => {
        client.create(c.NAMESPACE, (err, path) => {
            callback((err && err.getCode() !==
                      zookeeper.Exception.NODE_EXISTS) ? err : null, path);
        });
    }, callback => {
        client.create(c.NAMESPACE + c.LEADERS, (err, path) => {
            callback((err && err.getCode() !==
                      zookeeper.Exception.NODE_EXISTS) ? err : null, path);
        });
    }, callback => {
        client.create(c.NAMESPACE + c.OWNERS, (err, path) => {
            callback((err && err.getCode() !==
                      zookeeper.Exception.NODE_EXISTS) ? err : null, path);
        });
    }, callback => {
        client.create(c.NAMESPACE + c.STUFFS, (err, path) => {
            callback((err && err.getCode() !==
                      zookeeper.Exception.NODE_EXISTS) ? err : null, path);
        });
    }, callback => {
        client.create(`${c.NAMESPACE}${c.STUFFS}/0`, (err, path) => {
            callback((err && err.getCode() !==
                      zookeeper.Exception.NODE_EXISTS) ? err : null, path);
        });
    }, callback => {
        client.create(`${c.NAMESPACE}${c.STUFFS}/1`, (err, path) => {
            callback((err && err.getCode() !==
                      zookeeper.Exception.NODE_EXISTS) ? err : null, path);
        });
    }, callback => {
        client.create(`${c.NAMESPACE}${c.STUFFS}/2`, (err, path) => {
            callback((err && err.getCode() !==
                      zookeeper.Exception.NODE_EXISTS) ? err : null, path);
        });
    }, callback => {
        client.create(`${c.NAMESPACE}${c.STUFFS}/3`, (err, path) => {
            callback((err && err.getCode() !==
                      zookeeper.Exception.NODE_EXISTS) ? err : null, path);
        });
    }, callback => {
        client.create(`${c.NAMESPACE}${c.STUFFS}/4`, (err, path) => {
            callback((err && err.getCode() !==
                      zookeeper.Exception.NODE_EXISTS) ? err : null, path);
        });
    }, callback => {
        client.create(`${c.NAMESPACE}${c.STUFFS}/5`, (err, path) => {
            callback((err && err.getCode() !==
                      zookeeper.Exception.NODE_EXISTS) ? err : null, path);
        });
    }, callback => {
        client.create(`${c.NAMESPACE}${c.STUFFS}/6`, (err, path) => {
            callback((err && err.getCode() !==
                      zookeeper.Exception.NODE_EXISTS) ? err : null, path);
        });
    }, callback => {
        client.create(`${c.NAMESPACE}${c.STUFFS}/7`, (err, path) => {
            callback((err && err.getCode() !==
                      zookeeper.Exception.NODE_EXISTS) ? err : null, path);
        });
    },
    ], err => {
        if (err) {
            // console.log(`error creating ${path}: ${err}`);
        } else {
            // console.log(`created: ${path}`);
        }
        client.close();
    });
});

client.connect();
