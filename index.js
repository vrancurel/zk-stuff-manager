var zookeeper = require('node-zookeeper-client');
var async = require('async');
var path = require('path');
var constants = require('./constants');

var client = zookeeper.createClient('localhost:2181');
var my_name = null; 
var is_leader = false;

function leader_check(children) {
    for (var i in children) {
	//console.log(children[i]);
	if (children[i] < my_name) {
	    //console.log('found smaller');
	    return false;
	}
    }
    return true;
}

function leader_manage(client) {
    //monitor leader change
    client.getChildren(constants.NAMESPACE + constants.ELECTION,
		       (event) => {
			   console.log('Got watcher event: %s', event);
			   leader_manage(client);
		       },
		       (err, children, stat) => {
			   if (err) {
			       console.log('list failed: ' + err);
			       return;
			   }
			   console.log('Children are: %j.', children);
			   is_leader = leader_check(children)
			   console.log('leader: ' + is_leader);
		       }
		      );
}

function leader_register(client, callback) {
    //register in election queue
    client.create(constants.NAMESPACE + constants.ELECTION + constants.MEMBER,
		  new Buffer('data'),
		  zookeeper.ACL.OPEN_ACL_UNSAFE,
		  zookeeper.CreateMode.EPHEMERAL_SEQUENTIAL,
		  (err, _path) => {
		      if (err) {
			  callback(err);
		      } else {
			  my_name = path.basename(_path);
			  console.log('created: ' + my_name);
			  callback(null);
		      }
		  });
}

client.once('connected', function () {
    console.log('Connected to the server.');

    leader_manage(client);
    leader_register(client,
		    (err) => {
			setTimeout(() => {
			    console.log('done');
 			    client.close();
			}, 50000);
		    });
});

client.connect();
