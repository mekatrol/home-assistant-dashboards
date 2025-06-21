# Stuff

## Running app

```bash
flask --app app.py run
```

## Start flask shell

```bash
flask --app app.py shell
```

## Set up secrets

> The following commands are executed from the python shell

```python
import secrets

secrets.token_hex(24)

```

## Run production server

```bash
waitress-serve --port=8080 --call app:create_app
```

## Docker build

```bash
docker build --tag home-control-node .
```

## Docker run

```bash
docker run -d -p 5000:5000 home-control-node
```
