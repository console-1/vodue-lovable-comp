
/**
 * Generates JavaScript code for different types of workflow nodes
 */
export class CodeGenerator {
  static generateProcessingCode(description: string): string {
    return `// Process webhook data for: ${description}
for (const item of $input.all()) {
  // Validate input
  if (!item.json || typeof item.json !== 'object') {
    item.json = { error: 'Invalid input data' };
    continue;
  }

  // Add processing timestamp
  item.json.processed_at = new Date().toISOString();
  item.json.workflow_description = "${description}";

  // Add your custom processing logic here
  console.log('Processing item:', item.json);
}

return $input.all();`;
  }

  static generateAdvancedProcessingCode(description: string): string {
    return `// Advanced data processing for: ${description}
const processedItems = [];

for (const item of $input.all()) {
  try {
    // Create processed version of the item
    const processed = {
      original: item.json,
      processed_at: new Date().toISOString(),
      description: "${description}",
      processing_steps: []
    };

    // Step 1: Data validation
    if (item.json && typeof item.json === 'object') {
      processed.processing_steps.push('validation_passed');

      // Step 2: Data transformation
      processed.transformed_data = {
        ...item.json,
        enhanced: true,
        processing_id: Math.random().toString(36).substr(2, 9)
      };
      processed.processing_steps.push('transformation_complete');

      // Step 3: Add metadata
      processed.metadata = {
        keys_count: Object.keys(item.json).length,
        has_arrays: Object.values(item.json).some(val => Array.isArray(val)),
        data_size_estimate: JSON.stringify(item.json).length
      };
      processed.processing_steps.push('metadata_added');

    } else {
      processed.error = 'Invalid input format';
      processed.processing_steps.push('validation_failed');
    }

    processedItems.push({ json: processed });

  } catch (error) {
    processedItems.push({
      json: {
        error: error.message,
        original: item.json,
        processing_failed_at: new Date().toISOString()
      }
    });
  }
}

return processedItems;`;
  }

  static generateScheduledProcessingCode(description: string): string {
    return `// Scheduled task processing for: ${description}
const taskResults = [];

console.log('Starting scheduled task:', "${description}");
console.log('Execution time:', new Date().toISOString());

for (const item of $input.all()) {
  const taskResult = {
    task_id: Math.random().toString(36).substr(2, 9),
    execution_time: new Date().toISOString(),
    description: "${description}",
    input_data: item.json || {},
    status: 'pending'
  };

  try {
    // Simulate task processing
    taskResult.processing_start = new Date().toISOString();

    // Add your scheduled task logic here
    // Example: Check conditions, process data, send notifications, etc.

    taskResult.result = {
      processed: true,
      message: 'Scheduled task completed successfully'
    };
    taskResult.status = 'completed';

  } catch (error) {
    taskResult.error = error.message;
    taskResult.status = 'failed';
  }

  taskResult.processing_end = new Date().toISOString();
  taskResults.push({ json: taskResult });
}

console.log('Scheduled task completed. Results:', taskResults.length);
return taskResults;`;
  }

  static generateBasicProcessingCode(description: string): string {
    return `// Basic processing for: ${description}
for (const item of $input.all()) {
  // Basic data processing
  item.json.processed = true;
  item.json.processed_at = new Date().toISOString();
  item.json.description = "${description}";

  // Add your custom logic here
  console.log('Processing:', item.json);
}

return $input.all();`;
  }
}
