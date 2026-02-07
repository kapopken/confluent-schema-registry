# Azure DevOps Integration Configuration

This repository includes integration with Azure DevOps to automatically sync work items and create pull requests.

## Features

1. **Fetch Work Items**: Query active stories, bugs, and tasks from Azure DevOps
2. **Create PRs from Work Items**: Automatically create GitHub branches and PRs from Azure DevOps work items
3. **Link PRs to Work Items**: Add GitHub PR links back to Azure DevOps work items for traceability

## Setup Instructions

### Step 1: Create Azure DevOps Personal Access Token (PAT)

1. Navigate to Azure DevOps: `https://dev.azure.com/{your-organization}`
2. Click on your profile icon (top right) → **Personal access tokens**
3. Click **+ New Token**
4. Configure the token:
   - **Name**: `GitHub Integration`
   - **Organization**: Select your organization
   - **Expiration**: Set appropriate expiration (90 days or custom)
   - **Scopes**: Select the following:
     - ✓ **Work Items**: Read, write, & manage
     - ✓ **Code**: Read
5. Click **Create** and copy the token immediately (you won't be able to see it again)

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AZURE_DEVOPS_ORG_URL` | `https://dev.azure.com/your-org` | Your Azure DevOps organization URL |
| `AZURE_DEVOPS_PAT` | `your-pat-token` | The PAT created in Step 1 |
| `AZURE_DEVOPS_PROJECT` | `YourProjectName` | Your Azure DevOps project name |

### Step 3: Enable GitHub Actions Workflow

The workflow is located at `.github/workflows/azure-devops-integration.yml` and will be available after these files are merged.

## Usage

### Fetching Work Items

To view all active work items from Azure DevOps:

1. Go to **Actions** tab in your GitHub repository
2. Select **Azure DevOps Integration** workflow
3. Click **Run workflow**
4. Select action: **fetch-work-items**
5. Click **Run workflow**

This will display all active work items in the workflow logs.

### Creating a PR from a Work Item

To automatically create a GitHub PR from an Azure DevOps work item:

1. Note the Work Item ID from Azure DevOps (e.g., `123`)
2. Go to **Actions** tab in GitHub
3. Select **Azure DevOps Integration** workflow
4. Click **Run workflow**
5. Enter the Work Item ID: `123`
6. Select action: **create-pr-from-work-item**
7. Click **Run workflow**

This will:
- Create a new branch named `azure-devops/{id}-{title}`
- Create a placeholder commit with work item details
- Push the branch to GitHub
- Provide a URL to create the PR

### Linking an Existing PR to a Work Item

To link a GitHub PR back to an Azure DevOps work item:

1. Ensure you're on the PR branch locally
2. Go to **Actions** tab in GitHub
3. Select **Azure DevOps Integration** workflow
4. Click **Run workflow**
5. Enter the Work Item ID
6. Select action: **link-pr-to-work-item**
7. Click **Run workflow**

This adds a hyperlink in the Azure DevOps work item pointing to your GitHub branch.

## Local Testing

You can also run these scripts locally for testing:

```bash
# Set environment variables
export AZURE_DEVOPS_ORG_URL="https://dev.azure.com/your-org"
export AZURE_DEVOPS_PAT="your-pat-token"
export AZURE_DEVOPS_PROJECT="YourProjectName"

# Fetch work items
node .github/scripts/fetch-work-items.js

# Create PR from work item
export WORK_ITEM_ID="123"
node .github/scripts/create-pr-from-work-item.js

# Link PR to work item (run from your PR branch)
node .github/scripts/link-pr-to-work-item.js
```

## Integration with AI Agents

These scripts provide the foundation for AI agents to:

1. **Read Stories**: Use `fetch-work-items.js` to retrieve active work items
2. **Create PRs**: Use `create-pr-from-work-item.js` to generate branches and PR templates
3. **Generate Code**: AI agents can be triggered to implement solutions based on work item requirements
4. **Link Back**: Use `link-pr-to-work-item.js` to maintain traceability

### Workflow for AI-Assisted Development

1. **Fetch** work items using the GitHub Action
2. **Review** work item details in the action logs
3. **Trigger** AI agent (e.g., GitHub Copilot, custom automation) to:
   - Analyze the work item requirements
   - Generate code changes
   - Create tests
   - Submit PR for review
4. **Link** the PR back to the work item for tracking

## Work Item Format

For best results with automated PR creation, structure your Azure DevOps work items as follows:

### Title
Clear, concise description of the feature or bug (e.g., "Add support for Protobuf schema validation")

### Description
Include:
- **Problem Statement**: What needs to be solved
- **Acceptance Criteria**: How to verify the solution works
- **Technical Details**: Any specific implementation requirements
- **References**: Links to documentation, related issues, etc.

### Example Work Item

**Title**: Add retry logic for schema registry requests

**Description**:
```
Problem Statement:
Network failures when communicating with the schema registry can cause 
intermittent errors. We need retry logic with exponential backoff.

Acceptance Criteria:
- Retry failed requests up to 3 times
- Use exponential backoff (100ms, 200ms, 400ms)
- Only retry on network errors and 5xx responses
- Add configuration option to disable retries

Technical Details:
- Update SchemaRegistry class in src/SchemaRegistry.ts
- Add retryConfig option to constructor
- Add tests for retry behavior
```

## Troubleshooting

### "Failed to fetch work items"
- Verify `AZURE_DEVOPS_PAT` has correct permissions
- Check that `AZURE_DEVOPS_ORG_URL` is correct format
- Ensure work items exist in "Active" state

### "Cannot create branch"
- Branch may already exist - check existing branches
- Verify GitHub token has write permissions

### "Failed to link work item"
- PAT must have "Work Items: Write" permission
- Verify work item ID is correct

## Security Notes

- Never commit PAT tokens to the repository
- Use GitHub Secrets for all sensitive values
- Rotate PAT tokens regularly (every 90 days recommended)
- Limit PAT scope to minimum required permissions

## See Also

- [Azure DevOps REST API Documentation](https://docs.microsoft.com/en-us/rest/api/azure/devops/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure DevOps Setup Guide](./azure-devops-setup.md)
