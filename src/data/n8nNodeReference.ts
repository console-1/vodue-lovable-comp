
export interface N8nNode {
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  webhookId?: string;
}

export interface N8nConnection {
  main: Array<Array<{ node: string; type: string; index: number }>>;
}

export interface N8nWorkflow {
  name: string;
  nodes: N8nNode[];
  connections: Record<string, N8nConnection>;
  active: boolean;
  settings: Record<string, any>;
  staticData?: Record<string, any>;
}

// Current n8n node specifications (2024)
export const N8N_NODE_TYPES = {
  // Core nodes with current names
  WEBHOOK: {
    name: 'n8n-nodes-base.webhook',
    displayName: 'Webhook',
    typeVersion: 2,
    defaultParameters: {
      path: '',
      httpMethod: 'GET',
      responseMode: 'onReceived',
      responseData: 'allEntries'
    }
  },
  CODE: {
    name: 'n8n-nodes-base.code',
    displayName: 'Code',
    typeVersion: 2,
    defaultParameters: {
      mode: 'runOnceForAllItems',
      jsCode: `// Add your JavaScript code here
for (const item of $input.all()) {
  item.json.processed = true;
}
return $input.all();`
    }
  },
  EDIT_FIELDS: {
    name: 'n8n-nodes-base.set',
    displayName: 'Edit Fields (Set)',
    typeVersion: 3,
    defaultParameters: {
      mode: 'manual',
      fields: {
        values: []
      }
    }
  },
  HTTP_REQUEST: {
    name: 'n8n-nodes-base.httpRequest',
    displayName: 'HTTP Request',
    typeVersion: 4,
    defaultParameters: {
      method: 'GET',
      url: '',
      authentication: 'none',
      sendHeaders: false,
      sendQuery: false,
      sendBody: false,
      options: {}
    }
  },
  IF: {
    name: 'n8n-nodes-base.if',
    displayName: 'If',
    typeVersion: 2,
    defaultParameters: {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: '',
          operation: 'equal',
          rightValue: ''
        }
      }
    }
  },
  SWITCH: {
    name: 'n8n-nodes-base.switch',
    displayName: 'Switch',
    typeVersion: 3,
    defaultParameters: {
      mode: 'expression',
      output: 'input',
      rules: {
        values: []
      }
    }
  },
  ITEM_LISTS: {
    name: 'n8n-nodes-base.itemLists',
    displayName: 'Item Lists',
    typeVersion: 3,
    defaultParameters: {
      operation: 'aggregateItems',
      aggregate: 'aggregateAllItemData',
      fieldsToAggregate: {
        fieldToAggregate: []
      }
    }
  },
  MERGE: {
    name: 'n8n-nodes-base.merge',
    displayName: 'Merge',
    typeVersion: 3,
    defaultParameters: {
      mode: 'append',
      mergeByFields: {
        values: []
      }
    }
  }
};

// Deprecated node mappings
export const DEPRECATED_NODES = {
  'Function': 'Code',
  'Set': 'Edit Fields (Set)',
  'function': 'code',
  'set': 'edit-fields'
};

// Example workflows with current syntax
export const EXAMPLE_WORKFLOWS = {
  SIMPLE_DATA_PROCESSING: {
    name: 'Simple Data Processing',
    description: 'Process incoming webhook data and respond',
    nodes: [
      {
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [240, 300],
        parameters: {
          path: 'process-data',
          httpMethod: 'POST',
          responseMode: 'onReceived'
        },
        webhookId: 'webhook-1'
      },
      {
        name: 'Process Data',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [460, 300],
        parameters: {
          mode: 'runOnceForAllItems',
          jsCode: `// Process incoming data
for (const item of $input.all()) {
  item.json.processed_at = new Date().toISOString();
  item.json.status = 'processed';
}
return $input.all();`
        }
      },
      {
        name: 'Format Response',
        type: 'n8n-nodes-base.set',
        typeVersion: 3,
        position: [680, 300],
        parameters: {
          mode: 'manual',
          fields: {
            values: [
              {
                name: 'message',
                type: 'stringValue',
                stringValue: 'Data processed successfully'
              },
              {
                name: 'timestamp',
                type: 'stringValue',
                stringValue: '={{ new Date().toISOString() }}'
              }
            ]
          }
        }
      }
    ],
    connections: {
      'Webhook': {
        main: [[{ node: 'Process Data', type: 'main', index: 0 }]]
      },
      'Process Data': {
        main: [[{ node: 'Format Response', type: 'main', index: 0 }]]
      }
    }
  },
  API_INTEGRATION: {
    name: 'API Integration Workflow',
    description: 'Fetch data from API, process, and store',
    nodes: [
      {
        name: 'Schedule',
        type: 'n8n-nodes-base.cron',
        typeVersion: 1,
        position: [240, 300],
        parameters: {
          triggerTimes: {
            item: [
              {
                mode: 'everyMinute'
              }
            ]
          }
        }
      },
      {
        name: 'Fetch Data',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4,
        position: [460, 300],
        parameters: {
          method: 'GET',
          url: 'https://api.example.com/data',
          authentication: 'predefinedCredentialType',
          nodeCredentialType: 'httpBasicAuth',
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: 'Content-Type',
                value: 'application/json'
              }
            ]
          }
        }
      },
      {
        name: 'Check Response',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [680, 300],
        parameters: {
          conditions: {
            options: {
              caseSensitive: true,
              leftValue: '={{ $json.status }}',
              operation: 'equal',
              rightValue: 'success'
            }
          }
        }
      },
      {
        name: 'Process Success',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [900, 200],
        parameters: {
          mode: 'runOnceForAllItems',
          jsCode: `// Process successful response
const processedData = [];
for (const item of $input.all()) {
  processedData.push({
    ...item.json,
    processed: true,
    timestamp: new Date().toISOString()
  });
}
return processedData.map(data => ({ json: data }));`
        }
      },
      {
        name: 'Handle Error',
        type: 'n8n-nodes-base.set',
        typeVersion: 3,
        position: [900, 400],
        parameters: {
          mode: 'manual',
          fields: {
            values: [
              {
                name: 'error',
                type: 'stringValue',
                stringValue: 'API request failed'
              },
              {
                name: 'timestamp',
                type: 'stringValue',
                stringValue: '={{ new Date().toISOString() }}'
              }
            ]
          }
        }
      }
    ],
    connections: {
      'Schedule': {
        main: [[{ node: 'Fetch Data', type: 'main', index: 0 }]]
      },
      'Fetch Data': {
        main: [[{ node: 'Check Response', type: 'main', index: 0 }]]
      },
      'Check Response': {
        main: [
          [{ node: 'Process Success', type: 'main', index: 0 }],
          [{ node: 'Handle Error', type: 'main', index: 0 }]
        ]
      }
    }
  }
};
