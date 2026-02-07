# Azure DevOps Integration for AI-Assisted Development

This repository is now equipped with tools to connect Azure DevOps work items to GitHub pull requests, enabling AI agents and automation to read stories and create code to solve issues.

## 🎯 Objective

Enable AI agents (like GitHub Copilot) and automation tools to:
1. **Read** work items (stories, tasks, bugs) from Azure DevOps
2. **Create** GitHub PRs automatically from those work items
3. **Generate** code to solve the issues described in work items
4. **Link** everything together for full traceability

## 📋 What's Included

### GitHub Actions Workflow
**File**: `.github/workflows/azure-devops-integration.yml`

A manually-triggered workflow with 3 actions:
- Fetch all active work items
- Create PR from specific work item
- Link PR to work item

### Integration Scripts
**Location**: `.github/scripts/`

Three Node.js scripts that handle Azure DevOps API communication:
- `fetch-work-items.js` - Query and list active work items
- `create-pr-from-work-item.js` - Generate branch and PR from work item
- `link-pr-to-work-item.js` - Add GitHub link to Azure DevOps work item

### Documentation
**Location**: `docs/`

- `AZURE_DEVOPS_QUICKSTART.md` - 3-step quick start guide
- `azure-devops-integration.md` - Complete integration documentation
- `azure-devops-setup.md` - Azure Pipelines CI/CD setup

### Configuration
- `.env.example` - Template for local testing
- Updated `.gitignore` - Protects credentials from being committed

## 🚀 Getting Started

### Prerequisites
- Azure DevOps organization and project
- GitHub repository (this one!)
- Admin access to both

### Quick Setup

1. **Create Azure DevOps PAT** (Personal Access Token)
   ```
   https://dev.azure.com/{your-org}/_usersSettings/tokens
   Permissions: Work Items (Read, Write)
   ```

2. **Add GitHub Secrets**
   ```
   Repository Settings → Secrets → Actions → New secret
   
   AZURE_DEVOPS_ORG_URL = https://dev.azure.com/your-org
   AZURE_DEVOPS_PAT = your-pat-token
   AZURE_DEVOPS_PROJECT = YourProjectName
   ```

3. **Run the Workflow**
   ```
   Actions → Azure DevOps Integration → Run workflow
   ```

See [AZURE_DEVOPS_QUICKSTART.md](docs/AZURE_DEVOPS_QUICKSTART.md) for detailed steps.

## 💡 How It Works

### Scenario 1: List Active Work Items
```bash
Actions → Run Workflow → fetch-work-items
```
Output shows all active stories, tasks, and bugs with their IDs and descriptions.

### Scenario 2: Create PR from Work Item
```bash
Actions → Run Workflow → create-pr-from-work-item
Work Item ID: 123
```
This will:
1. Fetch work item details from Azure DevOps
2. Create branch: `azure-devops/123-work-item-title`
3. Generate placeholder commit with work item info
4. Push branch to GitHub
5. Provide PR creation URL

### Scenario 3: Link PR to Work Item
```bash
Actions → Run Workflow → link-pr-to-work-item
Work Item ID: 123
```
Adds a hyperlink in Azure DevOps pointing to the GitHub branch/PR.

## 🤖 AI Agent Integration

These scripts provide the foundation for AI-assisted development:

### Step 1: AI Reads Work Item
```javascript
const workItems = await fetchWorkItems();
// AI analyzes: title, description, acceptance criteria
```

### Step 2: AI Creates Solution
```javascript
const workItem = await getWorkItem(123);
// AI generates code based on requirements
```

### Step 3: AI Creates PR
```javascript
await createPRFromWorkItem(123);
// Branch created, code committed, PR opened
```

### Step 4: Link for Tracking
```javascript
await linkPRToWorkItem(123);
// Bidirectional traceability established
```

## 🔒 Security

- **Secrets**: All credentials stored in GitHub Secrets (encrypted)
- **Permissions**: Minimal scope (read/write work items only)
- **Rotation**: PAT tokens expire (recommended: 90 days)
- **No Commits**: `.env` files excluded via `.gitignore`

## 📚 Documentation Structure

```
docs/
├── AZURE_DEVOPS_QUICKSTART.md   ← Start here (3-step setup)
├── azure-devops-integration.md  ← Complete guide
└── azure-devops-setup.md        ← CI/CD pipeline setup

.github/
├── workflows/
│   └── azure-devops-integration.yml  ← GitHub Action
└── scripts/
    ├── fetch-work-items.js           ← List work items
    ├── create-pr-from-work-item.js   ← Create PR
    └── link-pr-to-work-item.js       ← Link PR
```

## 🧪 Testing Locally

```bash
# Copy example configuration
cp .env.example .env.local

# Edit with your credentials
nano .env.local

# Load environment and test
source .env.local
node .github/scripts/fetch-work-items.js
```

## 📖 Work Item Best Practices

For optimal AI code generation, structure work items as:

**Title**: Clear, actionable (e.g., "Add retry logic for API calls")

**Description**: Include:
- Problem statement
- Acceptance criteria
- Technical requirements
- References/examples

**Example**:
```
Problem: API calls fail intermittently due to network issues
Acceptance Criteria:
- Retry up to 3 times
- Exponential backoff (100ms, 200ms, 400ms)
- Only retry 5xx errors
Technical: Update src/api.ts, add retryConfig option
```

## 🔗 Related Resources

- [Azure DevOps REST API](https://docs.microsoft.com/en-us/rest/api/azure/devops/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Repository README](./README.md)

## ❓ FAQ

**Q: Can this work with GitHub Issues instead?**
A: Yes! Similar scripts can be created for GitHub Issues API.

**Q: Does this work with other Azure DevOps instances (on-prem)?**
A: Yes, just change AZURE_DEVOPS_ORG_URL to your instance URL.

**Q: Can I trigger this automatically?**
A: Yes! Modify the workflow to trigger on schedule or webhook.

**Q: Will this create actual code or just placeholders?**
A: Currently creates placeholders. Integrate with AI code generation tools for actual implementation.

## 🎉 Next Steps

1. ✅ Complete quick setup (see AZURE_DEVOPS_QUICKSTART.md)
2. ✅ Create test work item in Azure DevOps
3. ✅ Run fetch-work-items to verify connection
4. ✅ Run create-pr-from-work-item with test ID
5. ✅ Integrate with your AI tooling for code generation

---

**Ready to get started?** → See [AZURE_DEVOPS_QUICKSTART.md](docs/AZURE_DEVOPS_QUICKSTART.md)
