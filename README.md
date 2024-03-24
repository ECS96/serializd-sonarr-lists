# serializd-sonarr-lists

Connect sonarr to serializd.com watchlists based on [letterboxd-list-radarr](https://github.com/screeny05/letterboxd-list-radarr/)

## Usage

This service requires self hosting due to a requirement on a tmdb API key so is limited. For personal/private set the `TMDB_API_KEY` in the environment of the render.yaml on render to setup your own.

### Sonarr latest (tested on v4.0.1.929)

1. Configure a new list in sonarr, using the _Custom Lists_ provider.
2. Set _List URL_ to your `<HOST>` followed by the path to your watchlist in serializd. For example: `<HOST>/api/user/ec5/watchlist/`
3. Configure the rest of the settings to your liking
4. Test & Save.

### Supported Lists:

-   Watchlists: https://serializd.com<b>/api/user/ec5/watchlist/</b>

## FAQ

### The API is currently available (as of Q1 24)

This means that serializd.com does allow these /api URLs to be crawled per their [robots.txt](https://serializd.com/robots.txt). Your standard watchlist URL is not supported as this service contains no HTML scraping.

## Self-hosting

### Using render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

It might take a few minutes after deploying to render, before the instance becomes available.

Be aware that render currently has a [free limit](https://render.com/docs/free) of 750h/month. That's exactly enough to run this single service for the whole month.

### Using heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

If you are planning on running this instance for a lot of movies, be sure to set the correct cache-eviction policy for the redis:

```
heroku redis:maxmemory <name-of-redis-instance> --policy allkeys-lfu
```

### Using docker

#### Pre-built docker-image

You will get the newest image by pulling `ecstephens/serializd-sonarr-lists:latest`. The image is available for x86-64.

Here is an example of how to use the image with docker-compose:

```
version: "3.8"
services:
    web:
        image: ecstephens/serializd-sonarr-lists:latest
        ports:
            - 5000:5000
        environment:
            - REDIS_URL=redis://redis:6379
            - TMDB_API_KEY:<INSERT_API_KEY>
        depends_on:
            - redis
    redis:
        image: redis:6.0
```

For optimal configuration of redis, please check out the [redis.conf](redis.conf) file in this repository.

#### Building it yourself

```
git clone git@github.com:ECS96/serializd-sonarr-lists.git
cd serializd-sonarr-lists
npm install
docker-compose up -d
```

The file redis.conf can be used to configure your own settings for redis. It comes with a memory-limit of 256mb by default. You might want to increase that based on your usage.

Your local instance will be available on port 5000 `http://localhost:5000`

### Local & development

You need a working redis-instance, which is used for caching show id- & list-data.

Following environment-params are supported:

-   `REDIS_URL` - A [redis connection string](https://github.com/ServiceStack/ServiceStack.Redis#redis-connection-strings) to your redis-instance
-   `PORT` - The http-port which the application listens on
-   `LOG_LEVEL` - Set to `debug` for more info. Defaults to `info`
-   `USER_AGENT` - Allows you to set your own user-agent string

1. Clone this repo
2. Make sure you have configured the env-variables
3. `npm install`
4. `npm start`
