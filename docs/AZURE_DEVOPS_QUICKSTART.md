# Azure DevOps Integration - Quick Start

This repository now supports automated integration with Azure DevOps work items.

## What This Enables

✅ **Read Azure DevOps Stories/Tasks/Bugs** - Fetch work items programmatically  
✅ **Create PRs from Work Items** - Auto-generate GitHub branches and PRs  
✅ **Link PRs to Work Items** - Maintain bidirectional traceability  
✅ **AI-Assisted Development** - Foundation for automated code generation from work items

## Quick Setup (3 steps)

### 1. Create Azure DevOps PAT
- Go to: `https://dev.azure.com/{org}/_usersSettings/tokens`
- Create token with **Work Items (Read, Write)** permission
- Copy the token

### 2. Add GitHub Secrets
Navigate to: **Settings** → **Secrets** → **Actions** → **New secret**

Add these 3 secrets:
```
AZURE_DEVOPS_ORG_URL = https://dev.azure.com/your-org
AZURE_DEVOPS_PAT = your-token-here
AZURE_DEVOPS_PROJECT = YourProjectName
```

### 3. Use the Workflow
Go to: **Actions** → **Azure DevOps Integration** → **Run workflow**

Choose an action:
- **fetch-work-items**: List all active work items
- **create-pr-from-work-item**: Create PR from a work item (requires ID)
- **link-pr-to-work-item**: Link existing PR to work item (requires ID)

## Example Workflow

1. Create a User Story in Azure DevOps (e.g., ID: 456)
2. Run GitHub Action: **create-pr-from-work-item** with ID `456`
3. GitHub creates branch: `azure-devops/456-feature-name`
4. Implement the feature in that branch
5. Create PR on GitHub
6. Run GitHub Action: **link-pr-to-work-item** with ID `456`
7. Azure DevOps work item now shows link to GitHub PR

## For AI Agents

This integration provides the API layer for AI agents to:
1. Query work items: `node .github/scripts/fetch-work-items.js`
2. Create branches/PRs: `node .github/scripts/create-pr-from-work-item.js`
3. Link results: `node .github/scripts/link-pr-to-work-item.js`

## Full Documentation

- [Complete Integration Guide](./azure-devops-integration.md)
- [Azure DevOps Setup](./azure-devops-setup.md)

## Troubleshooting

**Error: "Missing environment variables"**
→ Add required secrets in GitHub repository settings

**Error: "Failed to fetch work items"**
→ Verify PAT has correct permissions and hasn't expired

**No work items found**
→ Ensure work items exist and are in "Active" state

## Security

- ✅ Use GitHub Secrets (never commit credentials)
- ✅ PAT tokens expire (rotate every 90 days)
- ✅ .env files ignored (see .gitignore)
- ✅ Minimal permissions (read/write work items only)
