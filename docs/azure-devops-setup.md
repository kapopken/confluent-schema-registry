---
id: azure-devops-setup
title: Azure DevOps Setup
sidebar_label: Azure DevOps Setup
---

# Connecting to Azure DevOps

This guide explains how to connect this repository to Azure DevOps for continuous integration and deployment.

## Prerequisites

- An Azure DevOps account ([Create one for free](https://azure.microsoft.com/en-us/services/devops/))
- Admin access to your Azure DevOps organization
- GitHub repository access

## Step 1: Create an Azure DevOps Project

1. Navigate to [Azure DevOps](https://dev.azure.com)
2. Click on **+ New Project**
3. Enter a project name (e.g., "ConfluentSchemaRegistry")
4. Choose visibility (Private or Public)
5. Click **Create**

## Step 2: Set Up GitHub Connection

1. In your Azure DevOps project, go to **Project Settings** (bottom left corner)
2. Navigate to **Service connections** under Pipelines
3. Click **New service connection**
4. Select **GitHub**
5. Choose your authentication method:
   - **OAuth** (recommended for personal repositories)
   - **Personal Access Token** (for more control)
6. Follow the prompts to authorize Azure DevOps to access your GitHub repository
7. Name the connection (e.g., "GitHub")
8. Click **Save**

## Step 3: Create the Pipeline

1. In your Azure DevOps project, navigate to **Pipelines**
2. Click **New Pipeline** or **Create Pipeline**
3. Select **GitHub** as your code source
4. Select your repository from the list
5. Azure DevOps will detect the `azure-pipelines.yml` file automatically
6. Click **Run** to create and execute the pipeline

## Step 4: Configure Required Secrets

The pipeline requires several secrets to function properly. You'll need to create a variable group:

1. Go to **Pipelines** → **Library**
2. Click **+ Variable group**
3. Name it `secrets` (this matches the variable group referenced in `azure-pipelines.yml`)
4. Add the following variables:

### Required Variables

| Variable Name | Description | How to Get It |
|--------------|-------------|---------------|
| `GH_TOKEN` | GitHub Personal Access Token | [Create a GitHub PAT](https://github.com/settings/tokens) with `repo` scope |
| `GH_NAME` | GitHub username | Your GitHub username |
| `GH_EMAIL` | GitHub email | Your GitHub email address |

### For NPM Publishing (Optional)

If you want to publish to NPM, you'll also need to set up an NPM service connection:

1. Go to **Project Settings** → **Service connections**
2. Click **New service connection**
3. Select **npm**
4. Enter your NPM registry URL: `https://registry.npmjs.org/`
5. Enter your NPM access token ([Create one here](https://www.npmjs.com/settings/~/tokens))
6. Name the connection `npm_registry` (this matches the name in `azure-pipelines.yml`)
7. Click **Save**

## Step 5: Configure Branch Policies (Optional but Recommended)

To ensure code quality:

1. Go to **Repos** → **Branches**
2. Click the three dots next to the `master` branch
3. Select **Branch policies**
4. Enable **Require a minimum number of reviewers**
5. Enable **Check for linked work items**
6. Under **Build Validation**, click **+** to add your pipeline
7. Select your pipeline and click **Save**

## Pipeline Overview

The `azure-pipelines.yml` configures the following jobs:

### Continuous Integration (on every PR and commit to master)

- **Lint**: Runs ESLint and TypeScript type checking
- **Build**: Builds the project
- **Tests**: Runs integration tests with Docker Compose

### Automatic Deployment

- **NPM Release**: Publishes to NPM when a version tag (v*) is pushed
- **Website Deploy**: Deploys documentation to GitHub Pages when merged to master

## Triggering the Pipeline

The pipeline will automatically run on:

- **Pull Requests** to the `master` branch
- **Commits** to the `master` branch
- **Tags** matching `v*` (e.g., `v1.0.0`) for releases

## Monitoring Pipeline Runs

1. Go to **Pipelines** in your Azure DevOps project
2. Click on your pipeline name
3. View the list of recent runs
4. Click on any run to see detailed logs for each job

## Troubleshooting

### Pipeline fails to start

- Verify the GitHub service connection is authorized
- Check that the `azure-pipelines.yml` file exists in the repository root

### "Variable group 'secrets' not found" error

- Create the variable group in **Pipelines** → **Library**
- Ensure it's named exactly `secrets`
- Add all required variables

### NPM publish fails

- Verify the `npm_registry` service connection exists
- Check that your NPM token has publish permissions
- Ensure the package version in `package.json` hasn't been published before

### Docker Compose tests fail

- This usually indicates a legitimate test failure
- Review the test logs to identify the issue
- Tests require Docker to be available on the build agent

## Additional Resources

- [Azure Pipelines documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
- [YAML schema reference](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema/)
- [GitHub integration](https://docs.microsoft.com/en-us/azure/devops/pipelines/repos/github/)
