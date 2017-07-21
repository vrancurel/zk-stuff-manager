# zk-stuff-manager

This module ensures that you will
always have an owner (server) for a list of stuff (can be numbers, strings
or whatever). The module will first
elect a leader, then the leader will ensure that the stuff is
evenly distributed among the different owners (servers). If an
owner happens to die, then the leader will re-assign the stuff
to others. If the leader dies, another owner will be elected
as a leader.

Quick Start w/ 3 nodes:
-----------------------

Get ZK from here: http://zookeeper.apache.org/releases.html

Edit the zoo.cfg, e.g.:

``` 
tickTime=2000
dataDir=/var/zookeeper
clientPort=2181
initLimit=5
syncLimit=2
server.1=10.100.166.254:2888:3888
server.2=10.100.166.255:2888:3888
server.3=10.100.167.1:2888:3888
```

Every server shall have a /var/zookeeper/myid file numbered from 1 to 3

To start the server:

```
$ cd zookeeper-release/bin
$ ./zkServer start
```

To check the status of the nodes:

```
$ ./zkServer.sh status
```

First, provision the namespace and the stuff:

```
$ node provision.js
```

To navigate in the ZK namespace:

```
$ ./zkcli.sh
zkcli> ls /
zkcli> ls /monitor
zkcli> ls /monitor/stuff
0 1 2 3 4 5 6 7
zkcli> ls /monitor/owners
```

Here we have 8 "stuffs" (numbers)

To use the lib, just do:

``` 
zkStuffManage((err, children) => {
    if (err) {
        message(`error: ${err}`);
    } else {
        message(`now I manage: ${children}`);
    }
});
```

Owners (servers) can arrive at any time or leave at any time, the leader will always ensure
there is an owner for each stuff.
