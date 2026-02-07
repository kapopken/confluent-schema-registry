#!/usr/bin/env node

/**
 * Create a PR from an Azure DevOps work item
 * This script reads a work item and creates a corresponding GitHub PR with the details
 */

const https = require('https');
const { execSync } = require('child_process');

const AZURE_DEVOPS_ORG_URL = process.env.AZURE_DEVOPS_ORG_URL;
const AZURE_DEVOPS_PAT = process.env.AZURE_DEVOPS_PAT;
const AZURE_DEVOPS_PROJECT = process.env.AZURE_DEVOPS_PROJECT;
const WORK_ITEM_ID = process.env.WORK_ITEM_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!AZURE_DEVOPS_ORG_URL || !AZURE_DEVOPS_PAT || !AZURE_DEVOPS_PROJECT) {
  console.error('Error: Missing required Azure DevOps environment variables');
  process.exit(1);
}

if (!WORK_ITEM_ID) {
  console.error('Error: WORK_ITEM_ID is required');
  process.exit(1);
}

const orgName = AZURE_DEVOPS_ORG_URL.replace(/https?:\/\/dev\.azure\.com\//, '').replace(/\/$/, '');

/**
 * Makes an HTTPS request to Azure DevOps API
 */
function makeAzureDevOpsRequest(path) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`:${AZURE_DEVOPS_PAT}`).toString('base64');
    
    const options = {
      hostname: 'dev.azure.com',
      port: 443,
      path: `/${orgName}/${AZURE_DEVOPS_PROJECT}/_apis/${path}`,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Get the repository information
 */
function getRepoInfo() {
  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const match = remote.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  } catch (e) {
    console.error('Failed to get repository info:', e.message);
  }
  return null;
}

/**
 * Create a PR from work item
 */
async function createPRFromWorkItem() {
  try {
    console.log(`Fetching work item ${WORK_ITEM_ID} from Azure DevOps...`);
    
    const workItem = await makeAzureDevOpsRequest(
      `wit/workitems/${WORK_ITEM_ID}?api-version=7.0`
    );

    const title = workItem.fields['System.Title'];
    const description = workItem.fields['System.Description'] || 'No description provided';
    const workItemType = workItem.fields['System.WorkItemType'];
    const workItemUrl = `${AZURE_DEVOPS_ORG_URL}/${AZURE_DEVOPS_PROJECT}/_workitems/edit/${WORK_ITEM_ID}`;

    console.log(`\nWork Item Details:`);
    console.log(`Type: ${workItemType}`);
    console.log(`Title: ${title}`);
    console.log(`URL: ${workItemUrl}`);

    // Create a branch name from the work item
    const branchName = `azure-devops/${WORK_ITEM_ID}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)}`;
    
    console.log(`\nCreating branch: ${branchName}`);
    
    try {
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    } catch (e) {
      console.log('Branch may already exist, checking out...');
      execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
    }

    // Create a placeholder file to make the commit non-empty
    const placeholderPath = `.github/work-items/AB#${WORK_ITEM_ID}.md`;
    execSync(`mkdir -p .github/work-items`, { stdio: 'inherit' });
    
    const placeholderContent = `# Azure DevOps Work Item: AB#${WORK_ITEM_ID}

**Type:** ${workItemType}
**Title:** ${title}
**Link:** ${workItemUrl}

## Description

${description}

## Next Steps

This PR was automatically created from Azure DevOps work item AB#${WORK_ITEM_ID}.
The actual implementation should be added to this PR.

Related: AB#${WORK_ITEM_ID}
`;

    require('fs').writeFileSync(placeholderPath, placeholderContent);
    
    execSync(`git add ${placeholderPath}`, { stdio: 'inherit' });
    execSync(`git commit -m "Azure DevOps: AB#${WORK_ITEM_ID} - ${title}"`, { stdio: 'inherit' });
    execSync(`git push origin ${branchName}`, { stdio: 'inherit' });

    console.log(`\n✓ Branch created and pushed: ${branchName}`);
    console.log('\nTo create a PR, use the GitHub CLI or web interface:');
    
    const repoInfo = getRepoInfo();
    if (repoInfo) {
      const prBody = `Addresses Azure DevOps work item: [AB#${WORK_ITEM_ID}](${workItemUrl})

## Work Item Details

**Type:** ${workItemType}
**Title:** ${title}

## Description

${description}

---
*This PR was automatically created from Azure DevOps work item AB#${WORK_ITEM_ID}*`;

      console.log(`\nGitHub PR URL: https://github.com/${repoInfo.owner}/${repoInfo.repo}/compare/${branchName}?expand=1`);
      console.log(`\nPR Title: AB#${WORK_ITEM_ID}: ${title}`);
      console.log(`\nPR Body:\n${prBody}`);
    }

  } catch (error) {
    console.error('Error creating PR from work item:', error.message);
    process.exit(1);
  }
}

createPRFromWorkItem();
