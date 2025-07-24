# 🔄 Parameter Name Change: application_answers → answers

## Summary

Changed the parameter name from `application_answers` to `answers` when submitting application forms to match the backend API requirements.

## Files Modified

### 1. Campaign Service (`campaign.service.ts`)
- Updated `applyToCampaign` method parameter interface
- Updated `updateApplication` method parameter interface  
- Updated `CampaignApplication` interface property name

### 2. Hooks (`use-campaigns.ts`)
- Updated `applyToCampaign` callback parameter interface
- Updated `updateApplication` callback parameter interface

### 3. Application Form (`application-form.tsx`)
- Updated submit data structure to use `answers` instead of `application_answers`
- Updated form initialization to read from `existingApplication?.answers`

## Before vs After

### Before:
```typescript
const submitData = {
  application_message: "...",
  application_answers: {
    q1_1752725055229: 'test',
    q2_1752725055229: 'test',
    q3_1752725055229: 'Junior',
    q4_1752725055229: 'test'
  }
}
```

### After:
```typescript
const submitData = {
  application_message: "...",
  answers: {
    q1_1752725055229: 'test', 
    q2_1752725055229: 'test',
    q3_1752725055229: 'Junior',
    q4_1752725055229: 'test'
  }
}
```

## Impact

✅ **Frontend**: All TypeScript interfaces updated consistently
✅ **API Calls**: Now sending data with correct parameter name  
✅ **Form Handling**: Properly maps form data to API structure
✅ **Type Safety**: No compilation errors

The application form will now submit data with the `answers` parameter instead of `application_answers`, matching the expected backend API format.
