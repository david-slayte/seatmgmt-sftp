# Seatmgmt-sftp

The external facing SFTP server to receive Latitude updates.

## Description

Exposes a SFTP server that can only receive files. Upon receipt it will pass the buffer through to be parsed and scores/status of Latitude courses updated.

## Setup

1. Installation & compilation

```
$ yarn install
$ yarn run setup
$ yarn tsc
```

2. Run Server

```
$ sudo USERS_FILE=./test-users.json node server.js
```

3. Use Client

```
$ touch test.txt
$ USERNAME=user PASSWORD=password node client.js
```

