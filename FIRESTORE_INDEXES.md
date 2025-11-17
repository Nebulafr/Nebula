# Firestore Indexes Configuration

This document describes the Firestore indexes required for optimal query performance in the Nebula coaching platform.

## Overview

The `firestore.indexes.json` file contains all composite indexes needed for complex queries across different collections.

## Index Categories

### Programs Collection
- **Basic filtering**: `isActive + createdAt` for public program listings
- **Category filtering**: `isActive + category + createdAt` for category-specific queries
- **Coach filtering**: `isActive + coachId + createdAt` for coach-specific programs
- **Combined filtering**: `isActive + coachId + category + createdAt` for advanced filtering
- **Rating sorting**: `isActive + rating + createdAt` for top-rated programs

### Enrollments Collection
- **Student queries**: `studentId + createdAt` for student enrollment history
- **Coach queries**: `coachId + createdAt` for coach enrollment tracking
- **Program queries**: `programId + createdAt` for program enrollment lists
- **Status filtering**: `studentId + status + createdAt` for enrollment status tracking

### Sessions Collection
- **Scheduling**: `coachId/studentId + scheduledAt` for calendar views
- **Status tracking**: `coachId/studentId + status + scheduledAt` for session management

### Reviews Collection
- **Program reviews**: `programId + createdAt` for program review listings
- **Coach reviews**: `coachId + createdAt` for coach review aggregation
- **Rating sorting**: `programId + rating + createdAt` for best reviews first

### Messaging System
- **Message ordering**: `conversationId + timestamp` for chat message retrieval
- **Conversation lists**: `participants + updatedAt` for user conversation lists

### Notifications
- **User notifications**: `userId + createdAt` for user notification feeds
- **Unread filtering**: `userId + read + createdAt` for unread notifications

### Events
- **Active events**: `isActive + date` for upcoming events
- **Category events**: `isActive + category + date` for filtered event listings

### Financial Data
- **Payment history**: `studentId/coachId + createdAt` for payment tracking
- **Payment status**: `studentId + status + createdAt` for payment management
- **Payout tracking**: `coachId + status + createdAt` for coach payouts

## Array Field Overrides

### Contains Queries
- **Program tags**: `programs.tags` array contains searches
- **Program prerequisites**: `programs.prerequisites` array filtering
- **Coach specialties**: `coaches.specialties` skill-based matching
- **Student interests**: `students.interests` preference matching
- **Enrolled programs**: `students.enrolledPrograms` enrollment tracking
- **Conversation participants**: `conversations.participants` user messaging

## Deployment

### Automatic Deployment
```bash
# Make the script executable (if not already)
chmod +x scripts/deploy-indexes.sh

# Deploy all indexes
./scripts/deploy-indexes.sh
```

### Manual Deployment
```bash
# Using Firebase CLI
firebase deploy --only firestore:indexes
```

### Verification
After deployment, verify indexes in the Firebase Console:
```
https://console.firebase.google.com/v1/r/project/YOUR_PROJECT_ID/firestore/indexes
```

## Index Creation Time

- **Simple indexes**: Usually complete in seconds
- **Composite indexes**: Can take 5-15 minutes depending on data size
- **Array indexes**: May take longer for large collections

## Monitoring

Monitor index build progress in:
1. Firebase Console → Firestore → Indexes
2. Check status: Building → Active
3. Failed indexes will show error messages

## Query Optimization Tips

1. **Filter order matters**: Place equality filters before range/ordering filters
2. **Use array-contains**: For tag/category filtering in arrays
3. **Limit results**: Always use `.limit()` for better performance
4. **Pagination**: Implement cursor-based pagination for large datasets

## Troubleshooting

### Common Issues
1. **Index not found**: Wait for build completion or check spelling
2. **Query still slow**: Verify field names match exactly
3. **Build failures**: Check for conflicting field types

### Debug Queries
```javascript
// Enable Firestore debug logging
import { enableNetwork } from 'firebase/firestore';
```

## Cost Optimization

1. **Avoid over-indexing**: Only create indexes for actual queries
2. **Monitor usage**: Remove unused indexes to reduce storage costs
3. **Compound wisely**: Combine related queries into single indexes where possible

## Updates

When adding new query patterns:
1. Update `firestore.indexes.json`
2. Test locally with Firestore emulator
3. Deploy to staging environment first
4. Deploy to production

---

For more information, see:
- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Query Performance Best Practices](https://firebase.google.com/docs/firestore/best-practices)