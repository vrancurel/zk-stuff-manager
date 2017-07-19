# zk-stuff-manager

NodeJS Zookeeper Stuff Manager: This program ensures that you will
always have an owner for a list of stuff.

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

$ cd zookeeper-release/bin
$ ./zkServer start

To check the status of the nodes:

$ ./zkServer.sh status

To navigate in the ZK namespace:

$ ./zkcli.sh
zkcli> ls /
zkcli> ls /monitor
zkcli> ls /monitor/owners
