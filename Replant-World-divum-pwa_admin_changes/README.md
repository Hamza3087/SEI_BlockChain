# replant

Replant project

# Development
## Basic setup

You should have [Docker](https://docs.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed. Then you can use command

```
make up
```
to run services locally. They can be found under:

Upload App: http://localhost:5173/

Marketplace App: http://localhost:5174/

Admin panel: http://localhost:8001/admin/

API: http://localhost:8001/api/docs/

## Other useful commands

To run only backend services use:

```
make up-backend
```

There is already a small testing dataset generated for you. You can create a new admin user using command:

```
make admin
```

To reset the database you can use command:

```
make reset
```

To run backend tests and lint code use:

```
make test-backend
```

To lint frontend code use:

```
make lint-upload-app
make lint-marketplace-app
```

## Backend tips

It's good to have [Python 3.12](https://www.python.org/downloads/) and [Poetry](https://python-poetry.org/docs/) installed. It's usefull for generating migrations, adding new dependencies or running tests with custom flags.

For generating email templates we use `mjml` which can be installed with `npm`

```
npm install
```

## Frontend tips

Follow instructions from README files of marketplace-app and upload-app.

### Tailwind + Visual Studio Code

To prevent `Unknown at rule @tailwind`, add the following setting to `.vscode/settings.json`:

```json
{
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

Next, install [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) Visual Studio Code extension.

Adding file association without installing the extension results in broken syntax coloring of CSS files.

Source: [StackOverflow](https://stackoverflow.com/questions/65247279/unknown-at-rule-tailwind-cssunknownatrules)

# Contribution

## Branch naming

`TICKET-ID-short-description` e.g `RW-55-list-company-members`

## Commit naming

`EMOJI TICKET-ID: Description`

Examples:

- `✨ RW-6: Add planting organizations`
- `💻 RW-3: Set up frontend`

## Allowed commit types

- 🐛 - bugfix
- 🚑 - fix crucial bug
- ✨ - new feature
- 🔧 - improvement
- 🏎️ - performance optimization
- ♻️ - refactor
- 🧪 - unit tests related
- ✅ - end to end tests related
- 🚧 - continuous integration related
- 🔨 - DevOps
- ⬆️ - 3rd party modules update
- 💻 - purely technical staff
- 📝 - documentation
- 🎨 - formatting
- 🗑️ - removing stuff

Avoid commits in the form of `CR fixes`. Either make the messages meaningful or squash the commits before merging to keep the history clear.

# Infrastructure

The infrastructure is build on Digital Ocean using [k8s](https://kubernetes.io/docs/tasks/tools/) and [helm](https://helm.sh/docs/intro/install/). There is no build in secret manager in DO so at this stage of the project we keep the secrets locally in `helm/envs/dev/secrets.yaml` and `helm/envs/prod/secrets.yaml`. Before deployment you should create these files with appropriate values
```yaml
vars:
  SECRET_KEY: ...
  DATABASE_URL: ...
  SEI_ADMIN_MNEMONIC: ...
  AWS_ACCESS_KEY_ID: ...
  AWS_SECRET_ACCESS_KEY: ...
  NFT_STORAGE_API_KEY: ...
  SENDGRID_API_KEY: ...
```

To connect to DO use [doctl](https://docs.digitalocean.com/reference/doctl/how-to/install/). Set up kubernetes config using
```
doctl kubernetes cluster kubeconfig save <use_your_cluster_name>
```
and login to DO registry with
```
doctl registry login
```
After doing the initial setup you can build all images locally using
```
make build
```
and then push the images to the registry and deploy with
```
make release
```
The default environment is `dev`. If you want to deploy a different environment for example `prod` you should set up k8s config for this env and in this context build and release with `ENV=prod`
```
make build ENV=prod
make release ENV=prod
```
