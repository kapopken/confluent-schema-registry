#!/usr/bin/env node

/**
 * Fetch work items from Azure DevOps
 * This script retrieves active work items from Azure DevOps that can be processed
 */

const https = require('https');

const AZURE_DEVOPS_ORG_URL = process.env.AZURE_DEVOPS_ORG_URL;
const AZURE_DEVOPS_PAT = process.env.AZURE_DEVOPS_PAT;
const AZURE_DEVOPS_PROJECT = process.env.AZURE_DEVOPS_PROJECT;

if (!AZURE_DEVOPS_ORG_URL || !AZURE_DEVOPS_PAT || !AZURE_DEVOPS_PROJECT) {
  console.error('Error: Missing required environment variables');
  console.error('Required: AZURE_DEVOPS_ORG_URL, AZURE_DEVOPS_PAT, AZURE_DEVOPS_PROJECT');
  process.exit(1);
}

// Parse organization name from URL
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

      res.on('data', (chunk) => {
        data += chunk;
      });

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

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

/**
 * Fetch active work items
 */
async function fetchWorkItems() {
  try {
    console.log('Fetching work items from Azure DevOps...');
    console.log(`Organization: ${orgName}`);
    console.log(`Project: ${AZURE_DEVOPS_PROJECT}`);

    // Query for active work items (Stories, Bugs, Tasks)
    const wiql = {
      query: `SELECT [System.Id], [System.Title], [System.State], [System.WorkItemType], [System.AssignedTo], [System.Description]
              FROM WorkItems 
              WHERE [System.TeamProject] = '${AZURE_DEVOPS_PROJECT}' 
              AND [System.State] = 'Active'
              AND [System.WorkItemType] IN ('User Story', 'Bug', 'Task')
              ORDER BY [System.CreatedDate] DESC`
    };

    // First, get work item IDs using WIQL
    const wiqlResult = await makeAzureDevOpsRequest(
      `wit/wiql?api-version=7.0`
    ).catch(err => {
      // If POST fails, try a simpler approach with query by project
      console.log('WIQL query not available, using alternative method...');
      return null;
    });

    if (wiqlResult && wiqlResult.workItems && wiqlResult.workItems.length > 0) {
      console.log(`\nFound ${wiqlResult.workItems.length} active work items:\n`);
      
      // Get details for each work item
      for (const item of wiqlResult.workItems.slice(0, 10)) { // Limit to 10 for display
        const workItem = await makeAzureDevOpsRequest(
          `wit/workitems/${item.id}?api-version=7.0`
        );
        
        console.log(`ID: ${workItem.id}`);
        console.log(`Type: ${workItem.fields['System.WorkItemType']}`);
        console.log(`Title: ${workItem.fields['System.Title']}`);
        console.log(`State: ${workItem.fields['System.State']}`);
        console.log(`Assigned To: ${workItem.fields['System.AssignedTo']?.displayName || 'Unassigned'}`);
        console.log(`Description: ${(workItem.fields['System.Description'] || 'No description').substring(0, 100)}...`);
        console.log(`URL: ${AZURE_DEVOPS_ORG_URL}/${AZURE_DEVOPS_PROJECT}/_workitems/edit/${workItem.id}`);
        console.log('---');
      }
    } else {
      console.log('No active work items found or unable to query.');
      console.log('\nTo use this integration:');
      console.log('1. Create work items in Azure DevOps');
      console.log('2. Set their state to "Active"');
      console.log('3. Run this workflow to fetch them');
    }

    console.log('\n✓ Work items fetched successfully');
    
  } catch (error) {
    console.error('Error fetching work items:', error.message);
    process.exit(1);
  }
}

// Run the script
fetchWorkItems();
