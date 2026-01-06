# TODO: Add Social Login to Sign-in Page

## Backend Changes
- [x] Update server/prisma/schema.prisma: Add social ID fields and make password optional
- [x] Run prisma migration
- [x] Update server/package.json: Add passport and OAuth strategy dependencies
- [x] Install dependencies
- [x] Update server/routes/auth.js: Add Passport setup and OAuth routes
- [x] Update server/index.js: Add session and passport middleware

## Frontend Changes
- [x] Update frontend/src/Context/AuthContext.jsx: Add social login functions
- [x] Update frontend/src/User Page/Signin.jsx: Add social login buttons

## Testing
- [ ] Set up environment variables for OAuth
- [ ] Test OAuth flows
