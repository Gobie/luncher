# luncher

[![Build Status](https://travis-ci.org/Gobie/luncher.svg?branch=master)](https://travis-ci.org/Gobie/luncher)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/fe6b1b719dd44522b13df74b42036f95)](https://www.codacy.com/app/michal-brasna/luncher)

Accessible lunch menus.

## Install

```sh
npm i
```

## Test

```sh
npm test
```

## Configure

Get environment variables

```sh
heroku config --app sbks-luncher | sed '1d' | sed 's/: */=/' > .env
```

Or you can get if from maintainers

### `.env` structure

```
PORT=3000
NODE_ENV=development
# necessary for server/service communication
CLOUDAMQP_URL=amqp://....
# when you need caching to work
MEMCACHEDCLOUD_PASSWORD=...
MEMCACHEDCLOUD_SERVERS=...
MEMCACHEDCLOUD_USERNAME=...
# when you want to use slack notifier
URL=http://localhost:8080/
SLACK_API_TOKEN=...
```

## Run

```sh
heroku local
# or
npm run server
npm run service
```

## Structure

`bin` - one-off scripts like slack notifier

`client` - frontend

`lib` - common code shared between server & service, possibly frontend

`server` - web server related code like routes

`service` - worker related code like scrappers
