# Deployment

This app is a static HTML/CSS/JavaScript site served by Nginx.

## Admin results API

An admin page is available at `/admin/` to manually save official match results into a server JSON file.

- Admin UI: `/admin/`
- API base: `/admin/api/`
- Healthcheck: `/admin/api/healthz`
- Data file inside containers: `/data/match-results.json`

The API is a small Node.js service (`admin-api/server.js`) and is reverse-proxied by Nginx.
In Docker Compose, a named volume (`results_data`) persists JSON data between restarts.

Basic Auth protection is intentionally not enforced in this repository logic; configure it in your Nginx/Coolify layer for `/admin` and `/admin/api` routes.

## Cache Invalidation

The Docker image build stamps `index.html` with a version query string for the local CSS and JavaScript files:

```html
styles.css?v=<version>
app.js?v=<version>
```

In GitHub Actions, `<version>` is the commit SHA. In local Docker builds, it falls back to a build timestamp unless you pass `APP_VERSION` yourself.

Nginx also sends `Cache-Control: no-store` for HTML, CSS, and JavaScript files. Together, this keeps deployments straightforward: when a new container version is released, browsers should request the newest app files instead of reusing stale cached ones.

Image/font assets can still be cached for a short period because they are not the source of app logic.

If a browser had already cached an older `index.html` from before this mechanism existed, it may need one hard reload. After that, new deployments should invalidate the CSS and JavaScript URLs automatically.

## Coolify

### Option 1: Deploy the Docker image

After the GitHub Action has run, deploy the published image directly in Coolify:

```txt
ghcr.io/<owner>/<repo>:latest
```

Coolify settings:

- Deployment type: Docker image
- Image: `ghcr.io/<owner>/<repo>:latest`
- Internal port: `8080`
- Healthcheck path: `/healthz`
- Volumes: none
- Environment variables: none required

The GHCR package must be public if you want Coolify to pull it without registry authentication.

### Option 2: Deploy with Docker Compose

Use the Docker Compose deployment type and point Coolify at this repository.

- Compose file: `docker-compose.yml`
- Service: `worldcup-tracker`
- Internal port: `8080`
- Healthcheck path: `/healthz`

If Coolify asks for an exposed port, use `8080`.

To make Compose pull the prebuilt GitHub Container Registry image instead of building locally, set:

```sh
IMAGE_NAME=ghcr.io/<owner>/<repo>:latest
```

If you do not set `IMAGE_NAME`, Docker Compose will build the image from this repository.

## Published Image

The GitHub Action publishes the image to GitHub Container Registry:

```txt
ghcr.io/<owner>/<repo>:latest
```

The workflow also publishes branch, tag, and SHA-based tags.

## Local Docker

```sh
docker compose up --build
```

Then open `http://localhost:8080`.
Admin is at `http://localhost:8080/admin/`.

To use a different local host port:

```sh
APP_PORT=3000 docker compose up --build
```

Then open `http://localhost:3000`.
