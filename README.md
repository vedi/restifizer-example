# Restifizer example

> It's just the simplest example. If you want to find anything for a quick start,
you can use our of seed project, based on MEAN.js with `restifizer` integrated (https://github.com/vedi/restifizer-mean.js)

Welcome to Restifizer example.

It's a joint example project for modules:
 * `restifizer` (https://github.com/vedi/restifizer),
 * `oauthifizer` (https://github.com/vedi/oauthifizer).

It's a simple RESTful server, containing oauth2 authentication and example of usage a resource. 

## Getting started

### Installation

```bash
git clone https://github.com/vedi/restifizer-example.git
cd restifizer-example
npm install
```
### Data migration

In order to create initial data please run:

```bash
sudo npm install -g migrate
migrate
```

### Running

```bash
npm start
```

It runs the server on port 3000.

### Testing

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

MIT License. Copyright (c) 2014 Fedor Shubin.
