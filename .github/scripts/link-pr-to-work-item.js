#!/usr/bin/env node

/**
 * Link a GitHub PR to an Azure DevOps work item
 * This script adds a link from the Azure DevOps work item to the GitHub PR
 */

const https = require('https');
const { execSync } = require('child_process');

const AZURE_DEVOPS_ORG_URL = process.env.AZURE_DEVOPS_ORG_URL;
const AZURE_DEVOPS_PAT = process.env.AZURE_DEVOPS_PAT;
const AZURE_DEVOPS_PROJECT = process.env.AZURE_DEVOPS_PROJECT;
const WORK_ITEM_ID = process.env.WORK_ITEM_ID;

if (!AZURE_DEVOPS_ORG_URL || !AZURE_DEVOPS_PAT || !AZURE_DEVOPS_PROJECT || !WORK_ITEM_ID) {
  console.error('Error: Missing required environment variables');
  process.exit(1);
}

const orgName = AZURE_DEVOPS_ORG_URL.replace(/https?:\/\/dev\.azure\.com\//, '').replace(/\/$/, '');

/**
 * Get the current PR URL from git branch
 */
function getCurrentPRInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const match = remote.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
    
    if (match) {
      const owner = match[1];
      const repo = match[2];
      return {
        branch,
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}/tree/${branch}`
      };
    }
  } catch (e) {
    console.error('Failed to get PR info:', e.message);
  }
  return null;
}

/**
 * Add a link to the Azure DevOps work item
 */
async function linkPRToWorkItem() {
  try {
    const prInfo = getCurrentPRInfo();
    
    if (!prInfo) {
      console.error('Could not determine PR information');
      process.exit(1);
    }

    console.log(`Linking work item ${WORK_ITEM_ID} to GitHub branch: ${prInfo.branch}`);
    console.log(`URL: ${prInfo.url}`);

    const auth = Buffer.from(`:${AZURE_DEVOPS_PAT}`).toString('base64');
    
    // Add a hyperlink relation to the work item
    const patchDocument = [
      {
        op: 'add',
        path: '/relations/-',
        value: {
          rel: 'Hyperlink',
          url: prInfo.url,
          attributes: {
            comment: `GitHub Branch: ${prInfo.branch}`
          }
        }
      }
    ];

    const data = JSON.stringify(patchDocument);
    
    const options = {
      hostname: 'dev.azure.com',
      port: 443,
      path: `/${orgName}/${AZURE_DEVOPS_PROJECT}/_apis/wit/workitems/${WORK_ITEM_ID}?api-version=7.0`,
      method: 'PATCH',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json-patch+json',
        'Content-Length': data.length
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✓ Successfully linked work item AB#${WORK_ITEM_ID} to GitHub`);
            console.log(`View work item: ${AZURE_DEVOPS_ORG_URL}/${AZURE_DEVOPS_PROJECT}/_workitems/edit/${WORK_ITEM_ID}`);
            resolve();
          } else {
            console.error(`Failed to link work item: ${res.statusCode}`);
            console.error(responseData);
            reject(new Error(`Request failed with status ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });

  } catch (error) {
    console.error('Error linking PR to work item:', error.message);
    process.exit(1);
  }
}

linkPRToWorkItem();
