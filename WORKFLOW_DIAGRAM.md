# Azure DevOps Integration Workflow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Azure DevOps                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Work Items (Stories, Tasks, Bugs)                   │      │
│  │                                                       │      │
│  │  ID: 123                                             │      │
│  │  Title: "Add retry logic for API calls"             │      │
│  │  Description: Problem statement, acceptance criteria │      │
│  │  State: Active                                       │      │
│  └──────────────────────────────────────────────────────┘      │
│                           ▲                                     │
│                           │                                     │
│                           │ REST API                            │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            │
                            │ 1. Fetch Work Items
                            │ 2. Read Details
                            │ 3. Add Links
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                  GitHub Repository                              │
│                           │                                     │
│  ┌────────────────────────▼──────────────────────────────┐     │
│  │  GitHub Actions Workflow                              │     │
│  │  (.github/workflows/azure-devops-integration.yml)     │     │
│  │                                                        │     │
│  │  Trigger: workflow_dispatch (manual)                  │     │
│  │  Inputs: work_item_id, action                        │     │
│  │                                                        │     │
│  │  Actions:                                             │     │
│  │  ┌──────────────────────────────────────────┐        │     │
│  │  │ 1. fetch-work-items                      │        │     │
│  │  │    → fetch-work-items.js                 │        │     │
│  │  │    → List all active work items          │        │     │
│  │  └──────────────────────────────────────────┘        │     │
│  │  ┌──────────────────────────────────────────┐        │     │
│  │  │ 2. create-pr-from-work-item             │        │     │
│  │  │    → create-pr-from-work-item.js        │        │     │
│  │  │    → Create branch + placeholder commit  │        │     │
│  │  └──────────────────────────────────────────┘        │     │
│  │  ┌──────────────────────────────────────────┐        │     │
│  │  │ 3. link-pr-to-work-item                 │        │     │
│  │  │    → link-pr-to-work-item.js            │        │     │
│  │  │    → Add hyperlink to Azure DevOps      │        │     │
│  │  └──────────────────────────────────────────┘        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Integration Scripts (.github/scripts/)            │     │
│  │                                                     │     │
│  │  • fetch-work-items.js                            │     │
│  │    - Uses HTTPS to call Azure DevOps REST API     │     │
│  │    - Queries for active work items                │     │
│  │    - Displays in workflow logs                    │     │
│  │                                                     │     │
│  │  • create-pr-from-work-item.js                    │     │
│  │    - Fetches work item details                    │     │
│  │    - Creates branch: azure-devops/{id}-{title}    │     │
│  │    - Commits placeholder file                     │     │
│  │    - Pushes to GitHub                             │     │
│  │                                                     │     │
│  │  • link-pr-to-work-item.js                        │     │
│  │    - Gets current branch info                     │     │
│  │    - Adds hyperlink relation to work item         │     │
│  │    - Uses PATCH API                               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Pull Requests                                      │     │
│  │                                                     │     │
│  │  Branch: azure-devops/123-add-retry-logic          │     │
│  │  Title: AB#123: Add retry logic for API calls      │     │
│  │  Description: Links to Azure DevOps work item      │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Workflow Sequence Diagrams

### Scenario 1: Fetch Work Items

```
User                GitHub Actions              Azure DevOps
  |                        |                          |
  |──1. Trigger workflow──>|                          |
  |   (action: fetch)      |                          |
  |                        |                          |
  |                        |──2. GET work items──────>|
  |                        |                          |
  |                        |<─3. Return list──────────|
  |                        |   (ID, Title, State)     |
  |                        |                          |
  |<─4. Display in logs────|                          |
  |                        |                          |
```

### Scenario 2: Create PR from Work Item

```
User                GitHub Actions              Azure DevOps         GitHub
  |                        |                          |                |
  |──1. Trigger workflow──>|                          |                |
  |   (action: create)     |                          |                |
  |   (work_item_id: 123)  |                          |                |
  |                        |                          |                |
  |                        |──2. GET work item 123───>|                |
  |                        |<─3. Return details───────|                |
  |                        |                          |                |
  |                        |──4. git checkout -b──────────────────────>|
  |                        |──5. Create placeholder───────────────────>|
  |                        |──6. git commit───────────────────────────>|
  |                        |──7. git push─────────────────────────────>|
  |                        |                          |                |
  |<─8. Branch created─────|                          |                |
  |   (URL to create PR)   |                          |                |
  |                        |                          |                |
```

### Scenario 3: Link PR to Work Item

```
User                GitHub Actions              Azure DevOps         GitHub
  |                        |                          |                |
  |──1. Trigger workflow──>|                          |                |
  |   (action: link)       |                          |                |
  |   (work_item_id: 123)  |                          |                |
  |                        |                          |                |
  |                        |──2. Get current branch──────────────────>|
  |                        |<─3. Branch info──────────────────────────|
  |                        |                          |                |
  |                        |──4. PATCH work item 123─>|                |
  |                        |   (add hyperlink)        |                |
  |                        |<─5. Updated──────────────|                |
  |                        |                          |                |
  |<─6. Link added─────────|                          |                |
  |                        |                          |                |
```

## AI Agent Integration Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      AI Agent / Automation                        │
│                                                                   │
│  1. Query Azure DevOps for work items                           │
│     ↓                                                             │
│  2. Analyze requirements                                         │
│     • Parse title and description                                │
│     • Extract acceptance criteria                                │
│     • Identify technical requirements                            │
│     ↓                                                             │
│  3. Generate code solution                                       │
│     • Create implementation                                      │
│     • Write tests                                                │
│     • Update documentation                                       │
│     ↓                                                             │
│  4. Create PR using scripts                                      │
│     • Run create-pr-from-work-item.js                           │
│     • Commit generated code                                      │
│     ↓                                                             │
│  5. Link PR to work item                                         │
│     • Run link-pr-to-work-item.js                               │
│     • Establish traceability                                     │
└──────────────────────────────────────────────────────────────────┘
```

## Configuration Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    One-Time Setup                                 │
│                                                                   │
│  Step 1: Azure DevOps                                            │
│  ┌────────────────────────────────────────────────┐             │
│  │ Create Personal Access Token (PAT)             │             │
│  │ Permissions: Work Items (Read, Write)          │             │
│  └────────────────────────────────────────────────┘             │
│                         │                                         │
│                         ▼                                         │
│  Step 2: GitHub Repository Settings                              │
│  ┌────────────────────────────────────────────────┐             │
│  │ Add Secrets:                                   │             │
│  │ • AZURE_DEVOPS_ORG_URL                        │             │
│  │ • AZURE_DEVOPS_PAT                            │             │
│  │ • AZURE_DEVOPS_PROJECT                        │             │
│  └────────────────────────────────────────────────┘             │
│                         │                                         │
│                         ▼                                         │
│  Step 3: Verify                                                  │
│  ┌────────────────────────────────────────────────┐             │
│  │ Run: fetch-work-items action                   │             │
│  │ Expected: List of work items in logs           │             │
│  └────────────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────────┘
```

## Security Model

```
Credentials Storage:
┌─────────────────────────────────────────┐
│ GitHub Repository Secrets (Encrypted)    │
│ ┌─────────────────────────────────────┐ │
│ │ AZURE_DEVOPS_ORG_URL                │ │
│ │ AZURE_DEVOPS_PAT                    │ │
│ │ AZURE_DEVOPS_PROJECT                │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
              │
              │ Injected at runtime only
              ▼
┌─────────────────────────────────────────┐
│ GitHub Actions Workflow                 │
│ • Runs in isolated container            │
│ • Secrets available as env vars         │
│ • Never logged or exposed                │
└─────────────────────────────────────────┘
              │
              │ HTTPS with PAT auth
              ▼
┌─────────────────────────────────────────┐
│ Azure DevOps REST API                   │
│ • Validates PAT token                   │
│ • Enforces permissions                  │
│ • Audit logs all access                 │
└─────────────────────────────────────────┘

Protection:
✓ .gitignore excludes .env files
✓ No hardcoded credentials
✓ Minimal scope permissions
✓ Token rotation supported
✓ GitHub secret encryption
```

## File Structure

```
confluent-schema-registry/
│
├── .github/
│   ├── workflows/
│   │   └── azure-devops-integration.yml    ← GitHub Actions workflow
│   └── scripts/
│       ├── fetch-work-items.js             ← Query work items
│       ├── create-pr-from-work-item.js     ← Create PR
│       └── link-pr-to-work-item.js         ← Link to work item
│
├── docs/
│   ├── AZURE_DEVOPS_QUICKSTART.md          ← Quick start (3 steps)
│   ├── azure-devops-integration.md         ← Complete guide
│   └── azure-devops-setup.md               ← CI/CD setup
│
├── .env.example                             ← Configuration template
├── .gitignore                               ← Updated for security
├── AZURE_DEVOPS_README.md                   ← Main overview
├── IMPLEMENTATION_SUMMARY.md                ← What was built
├── WORKFLOW_DIAGRAM.md                      ← This file
└── README.md                                ← Updated with links
```
