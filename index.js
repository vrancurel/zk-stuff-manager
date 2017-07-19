const zookeeper = require('node-zookeeper-client');
const path = require('path');
const constants = require('./constants');
const crypto = require('crypto');

const client = zookeeper.createClient('localhost:2181');
let myLeaderName = null;
let isLeader = false;
let owners = null;
let stuffs = null;

function message(msg) {
    console.log(msg);
}

function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len);   // return required number of characters
}

function stuffReassign(client) {
    message('stuff reassign');
    let ownerIdx = 0;
    let stuff;
    const ownersMap = {};
    if (owners === null || stuffs === null ||
        owners.length === 0 || stuffs.length === 0) {
        return;
    }
    // assign stuff to owners
    for (stuff in stuffs) {
        if (stuffs.hasOwnProperty(stuff)) {
            // message(ownerIdx + ' ' + stuff);
            const key = owners[ownerIdx];
            ownersMap[key] = ownersMap[key] || [];
            ownersMap[key].push(stuff);
            ownerIdx++;
            if (ownerIdx === owners.length) {
                ownerIdx = 0;
            }
        }
    }
    // now write data in owners
    Object.keys(ownersMap).forEach(owner => {
        message(`owner ${owner} ${ownersMap[owner]}`);
        const path = `${constants.NAMESPACE}${constants.OWNERS}/${owner}`;
        client.setData(path,
                       new Buffer(JSON.stringify(ownersMap[owner])),
                       -1, // version
                       err => {
                           if (err) {
                               message(`cannot setData to ${path}`);
                           }
                       });
    });
}

function leaderCheck(children) {
    let i;
    for (i in children) {
        if (children.hasOwnProperty(i)) {
            message(children[i]);
            if (children[i] < myLeaderName) {
                // message('found smaller');
                return false;
            }
        }
    }
    return true;
}

function leaderManage(client) {
    // monitor leader change
    client.getChildren(constants.NAMESPACE + constants.LEADERS,
                       event => {
                           message('Got leader event: %s', event);
                           leaderManage(client);
                       },
                       (err, children) => {
                           if (err) {
                               message(`list failed: ${err}`);
                               return;
                           }
                           message(`Leaders are: ${children}`);
                           isLeader = leaderCheck(children);
                           message(`leader: ${isLeader}`);
                           if (isLeader) {
                               stuffReassign(client);
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
                          message(`created: ${myLeaderName}`);
                          callback(null);
                      }
                  });
}

function ownerManage(client) {
    // monitor owner change
    client.getChildren(constants.NAMESPACE + constants.OWNERS,
                       event => {
                           message(`Got owner event: ${event}`);
                           ownerManage(client);
                       },
                       (err, children) => {
                           if (err) {
                               message(`list failed: ${err}`);
                               return;
                           }
                           owners = children;
                           message(`Owners are: ${owners}`);
                           if (isLeader) {
                               stuffReassign(client);
                           }
                       }
                      );
}

function ownerManageMyself(client, myPath, callback) {
    // monitor change in my content
    client.getData(myPath,
                   event => {
                       message(`Got owner self event: ${event}`);
                       ownerManageMyself(client, myPath, callback);
                   },
                   (err, data) => {
                       if (err) {
                           message(`get failed: ${err}`);
                           return;
                       }
                       // message('Data is: %j.', data);
                       if (data !== undefined) {
                           const results = JSON.parse(data);
                           // message(results);
                           callback(null, results);
                       }
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
                          message(`created: ${_path}`);
                          callback(null, _path);
                      }
                  });
}

function stuffManage(client) {
    // monitor stuff change
    client.getChildren(constants.NAMESPACE + constants.STUFFS,
                       event => {
                           message(`Got stuff event: ${event}`);
                           stuffManage(client);
                       },
                       (err, children) => {
                           if (err) {
                               message(`list failed: ${err}`);
                               return;
                           }
                           stuffs = children;
                           message(`Stuffs are: ${stuffs}`);
                           if (isLeader) {
                               stuffReassign(client);
                           }
                       }
                      );
}

function zkStuffManage(callback) {
    client.once('connected', () => {
        message('Connected to the ZK server.');
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
                ownerManageMyself(client, myPath, callback);
            }
        });
        stuffManage(client);
    });
    client.connect();
}

zkStuffManage((err, children) => {
    if (err) {
        message(`error: ${err}`);
    } else {
        message(`now I manage: ${children}`);
    }
});
