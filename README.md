# Restifizer example

Welcome to Restifizer example.

It's a joint example project for modules:
 * `restifizer` (https://github.com/vedi/restifizer),
 * `restifizer-files` (https://github.com/vedi/restifizer-files).
 * `oauthifizer` (https://github.com/vedi/oauthifizer).

It's a simple RESTful server, containing oauth2 authentication and example of usage a resource.

## Getting started

### Requirements

This project needs MongoDB server to be started locally.

### Installation

```bash
git clone https://github.com/vedi/restifizer-example.git
cd restifizer-example
npm install
```

### Running

```bash
npm start
```

It runs the server on port 3000.

### e2e tests

> In order to make ftp tests working you should have ftp server run on default port with access for anonymous user.

After you started the server, run the following command:
```bash
npm start
```
The test suite will be run and you'll see the results in console.

### Try it

Open new Terminal window.

> I use `httpie` (https://github.com/jakubroztocil/httpie) as a command line tool to test the servers. You can use any, but all the examples are created with syntax of `httpie`. Anyway it's recognizable.

In order to get authenticated use the path `/oauth`.

```bash
http POST localhost:3000/oauth grant_type=password client_id=myClientId client_secret=myClientSecret username=admin password=adminadmin
```

In order to access to restricted resource try the path `/users`.

```bash
http POST localhost:3000/api/users username=test password=testtest Authorization:'Bearer xxx'

http GET localhost:3000/api/users/<id> Authorization:'Bearer xxx'
http GET localhost:3000/api/users Authorization:'Bearer xxx'

http GET localhost:3000/api/users?q=adm Authorization:'Bearer xxx'
http GET 'localhost:3000/api/users?fields=username,createdAt' Authorization:'Bearer xxx'
http GET 'localhost:3000/api/users?filter={"username": "test"}' Authorization:'Bearer xxx'
http GET 'localhost:3000/api/users?orderBy={"username": -1}' Authorization:'Bearer xxx'
http GET 'localhost:3000/api/users?per_page=1&page=1' Authorization:'Bearer xxx'

http GET 'localhost:3000/api/users/count' Authorization:'Bearer xxx'
http GET 'localhost:3000/api/users/count?filter={"username": "test"}' Authorization:'Bearer xxx'

http PATCH localhost:3000/api/users/<id> username=anotherTest Authorization:'Bearer xxx'

http DELETE localhost:3000/api/users/<id> Authorization:'Bearer xxx'

```

## Contribution

We really appreciate any contribution.    

## License

MIT License. Copyright (c) 2017 Fedor Shubin.
