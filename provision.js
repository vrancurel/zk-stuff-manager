var zookeeper = require('node-zookeeper-client');
var async = require('async');
var constants = require('./constants.js');

var client = zookeeper.createClient('localhost:2181');

client.once('connected', function () {
    console.log('Connected to the server.');

    console.log(constants.NAMESPACE);
    async.series([
	(callback) => {
	    client.create(constants.NAMESPACE,
			  (err, path) => {
			      callback((err && err.getCode() != zookeeper.Exception.NODE_EXISTS) ? err : null, path);
			  });
	},
	(callback) => {
	    client.create(constants.NAMESPACE + constants.ELECTION,
			  (err, path) => {
			      callback((err && err.getCode() != zookeeper.Exception.NODE_EXISTS) ? err : null, path);
			  });
	},
	(callback) => {
	    client.create(constants.NAMESPACE + constants.SERVERS,
			  (err, path) => {
			      callback((err && err.getCode() != zookeeper.Exception.NODE_EXISTS) ? err : null, path);
			  });
	},
	(callback) => {
	    client.create(constants.NAMESPACE + constants.STUFF,
			  (err, path) => {
			      callback((err && err.getCode() != zookeeper.Exception.NODE_EXISTS) ? err : null, path);
			  });
	},
	(callback) => {
	    client.create(constants.NAMESPACE + constants.STUFF + '/0',
			  (err, path) => {
			      callback((err && err.getCode() != zookeeper.Exception.NODE_EXISTS) ? err : null, path);
			  });
	},
	(callback) => {
	    client.create(constants.NAMESPACE + constants.STUFF + '/1',
			  (err, path) => {
			      callback((err && err.getCode() != zookeeper.Exception.NODE_EXISTS) ? err : null, path);
			  });
	},
	(callback) => {
	    client.create(constants.NAMESPACE + constants.STUFF + '/2',
			  (err, path) => {
			      callback((err && err.getCode() != zookeeper.Exception.NODE_EXISTS) ? err : null, path);
			  });
	},
	(callback) => {
	    client.create(constants.NAMESPACE + constants.STUFF + '/3',
			  (err, path) => {
			      callback((err && err.getCode() != zookeeper.Exception.NODE_EXISTS) ? err : null, path);
			  });
	},
	(callback) => {
	    client.create(constants.NAMESPACE + constants.STUFF + '/4',
			  (err, path) => {
			      callback((err && err.getCode() != zookeeper.Exception.NODE_EXISTS) ? err : null, path);
			  });
	},
	(callback) => {
	    client.create(constants.NAMESPACE + constants.STUFF + '/5',
			  (err, path) => {
			      callback((err && err.getCode() != zookeeper.Exception.NODE_EXISTS) ? err : null, path);
			  });
	},
	(callback) => {
	    client.create(constants.NAMESPACE + constants.STUFF + '/6',
			  (err, path) => {
			      callback((err && err.getCode() != zookeeper.Exception.NODE_EXISTS) ? err : null, path);
			  });
	},
	(callback) => {
	    client.create(constants.NAMESPACE + constants.STUFF + '/7',
			  (err, path) => {
			      callback((err && err.getCode() != zookeeper.Exception.NODE_EXISTS) ? err : null, path);
			  });
	},
    ], (err, path) => {
	if (err) {
	    console.log('error creating ' + path + ': ' + err);
	} else {
	    console.log('created: ' + path);
	}
        client.close();
    });
});

client.connect();
