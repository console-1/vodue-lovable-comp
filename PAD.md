
# VODUE TypeScript Error Fix Plan

## Analysis of Errors

### Primary Issues:
1. **Database Schema Mismatch**: Our code assumes properties that don't exist in the actual Supabase types
2. **Missing Table**: `workflow_templates` table doesn't exist in database
3. **Property Name Inconsistencies**: Using snake_case vs camelCase inconsistently
4. **Interface Mismatches**: NodeRecommendation interface doesn't match usage

### Error Categories:

#### 1. Node Service Issues (nodeService.ts)
- Missing `workflow_templates` table
- Properties like `deprecated`, `replaced_by`, `node_type` don't exist on NodeDefinition
- Parameter properties using wrong names (`parameter_name` vs `name`)

#### 2. Node Intelligence Service Issues 
- Trying to access `deprecated`, `node_type` properties that don't exist
- Type mismatches with database schema

#### 3. Node Recommendations Component
- Using `nodeType` instead of correct property names
- Missing properties in NodeRecommendation interface

#### 4. Database Type Issues
- Hooks expecting wrong property types for enum fields
- Type casting problems with database responses

## Fix Strategy:

### Phase 1: Fix Database Schema Alignment
1. Update NodeService to use actual database schema properties
2. Remove references to non-existent `workflow_templates` table
3. Fix property name mismatches

### Phase 2: Fix Interface Definitions
1. Update NodeRecommendation interface to match actual usage
2. Align NodeWithParameters with actual database schema

### Phase 3: Fix Component Usage
1. Update NodeRecommendations component to use correct property names
2. Fix type casting in hooks

### Phase 4: Clean Up
1. Remove unused imports and fix test files
2. Ensure all interfaces match database schema

## Implementation Order:
1. nodeService.ts - Core database interaction fixes
2. nodeIntelligenceService.ts - Interface alignment
3. NodeRecommendations.tsx - Component property fixes
4. Hook type casting fixes
5. Test file cleanup
