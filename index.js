const zookeeper = require('node-zookeeper-client');
const path = require('path');
const constants = require('./constants');
const crypto = require('crypto');

const client = zookeeper.createClient('localhost:2181');
let myLeaderName = null;
let isLeader = false;
let owners = null;
let stuffs = null;

function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len);   // return required number of characters
}

function stuffReassign() {
    // console.log('stuff reassign');
    let ownerIdx = 0;
    let stuff;
    if (owners === null || stuffs === null ||
        owners.length === 0 || stuffs.length === 0) {
        return;
    }
    for (stuff in stuffs) {
        if (stuffs.hasOwnProperty(stuff)) {
            // console.log(ownerIdx + ' ' + stuff);
            ownerIdx++;
            if (ownerIdx === owners.length) {
                ownerIdx = 0;
            }
        }
    }
}

function leaderCheck(children) {
    let i;
    for (i in children) {
        // console.log(children[i]);
        if (children[i] < myLeaderName) {
            // console.log('found smaller');
            return false;
        }
    }
    return true;
}

function leaderManage(client) {
    // monitor leader change
    client.getChildren(constants.NAMESPACE + constants.LEADERS,
                       () => {
                           // console.log('Got leader event: %s', event);
                           leaderManage(client);
                       },
                       (err, children) => {
                           if (err) {
                               // console.log('list failed: ' + err);
                               return;
                           }
                           // console.log('Leaders are: %j.', children);
                           isLeader = leaderCheck(children);
                           // console.log('leader: ' + isLeader);
                           if (isLeader) {
                               stuffReassign();
                           }
                       }
                      );
}

function leaderRegister(client, callback) {
    // register in election queue
    client.create(constants.NAMESPACE + constants.LEADERS + constants.LEADER,
                  null,
                  zookeeper.ACL.OPEN_ACL_UNSAFE,
                  zookeeper.CreateMode.EPHEMERAL_SEQUENTIAL,
                  (err, _path) => {
                      if (err) {
                          callback(err);
                      } else {
                          myLeaderName = path.basename(_path);
                          // console.log('created: ' + myLeaderName);
                          callback(null);
                      }
                  });
}

function ownerManage(client) {
    // monitor owner change
    client.getChildren(constants.NAMESPACE + constants.OWNERS,
                       () => {
                           // console.log('Got owner event: %s', event);
                           ownerManage(client);
                       },
                       (err, children) => {
                           if (err) {
                               // console.log('list failed: ' + err);
                               return;
                           }
                           owners = children;
                           // console.log('Owners are: %j.', owners);
                           if (isLeader) {
                               stuffReassign();
                           }
                       }
                      );
}

function ownerManageMyself(client, myPath) {
    // monitor change in my content
    client.getData(myPath,
                   () => {
                       // console.log('Got owner event: %s', event);
                       ownerManageMyself(client, myPath);
                   },
                   err => {
                       if (err) {
                           // console.log('get failed: ' + err);
                           return;
                       }
                       // console.log('Data is: %j.', data);
                   }
                  );
}

function ownerRegister(client, callback) {
    // register in election queue
    const name = randomValueHex(12);
    const path = `${constants.NAMESPACE}${constants.OWNERS}/${name}`;
    client.create(path,
                  null,
                  zookeeper.ACL.OPEN_ACL_UNSAFE,
                  zookeeper.CreateMode.EPHEMERAL,
                  (err, _path) => {
                      if (err) {
                          callback(err);
                      } else {
                          // console.log('created: ' + _path);
                          callback(null, _path);
                      }
                  });
}

function stuffManage(client) {
    // monitor stuff change
    client.getChildren(constants.NAMESPACE + constants.STUFFS,
                       () => {
                           // console.log('Got stuff event: %s', event);
                           stuffManage(client);
                       },
                       (err, children) => {
                           if (err) {
                               // console.log('list failed: ' + err);
                               return;
                           }
                           stuffs = children;
                           // console.log('Stuffs are: %j.', stuffs);
                           if (isLeader) {
                               stuffReassign();
                           }
                       }
                      );
}

function zkStuffManage(callback) {
    client.once('connected', () => {
        // console.log('Connected to the ZK server.');
        leaderRegister(client, err => {
            if (err) {
                callback(err);
            } else {
                leaderManage(client);
            }
        });
        ownerRegister(client, (err, myPath) => {
            if (err) {
                callback(err);
            } else {
                ownerManage(client);
                ownerManageMyself(client, myPath);
            }
        });
        stuffManage(client);
    });
    client.connect();
}

zkStuffManage(err => {
    if (err) {
        // console.log('error: ' + err);
    } else {
        // console.log('now I manage: ' + children);
    }
});
