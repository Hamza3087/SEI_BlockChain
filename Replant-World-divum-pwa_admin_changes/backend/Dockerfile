# Based on poetry recommendation https://github.com/orgs/python-poetry/discussions/1879

# Base
FROM --platform=linux/amd64 python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_VERSION=1.7.1 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv"

ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

RUN apt-get -yqq update \
    && apt-get install -yqq \
        libpq-dev \
        nodejs

# Builder
FROM base as builder

RUN apt-get install -yqq \
        curl \
        gcc \
        npm

RUN curl -sSL https://install.python-poetry.org | python3 -

WORKDIR $PYSETUP_PATH

COPY poetry.lock pyproject.toml ./

RUN poetry install

WORKDIR /app/

COPY package.json package-lock.json ./

RUN npm install

# Final
FROM base AS final

COPY --from=builder $PYSETUP_PATH $PYSETUP_PATH

COPY --from=builder /app/node_modules/ /app/node_modules/

WORKDIR /app/

COPY ./ ./

EXPOSE 8000

RUN python manage.py collectstatic --no-input

VOLUME ["/app/media", "/app/static", "/app/db"]

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]