# Add Recent Activities for Client Operations

## Tasks
- [x] Update Prisma schema to add new ActivityType values: CLIENT_DELETED, CLIENT_EDITED, REPORT_DOWNLOADED
- [x] Update backend routes to log activities when clients are created, deleted, edited
- [x] Update backend routes to log activities when reports are downloaded
- [x] Update the recent-activities endpoint to include the new activity types
- [x] Update frontend activity display to handle the new activity types with appropriate icons and descriptions
- [x] Run Prisma migration after schema changes
- [x] Update frontend PDF export functions to log report download activities
- [x] Test the activity logging and display
