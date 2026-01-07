# TODO: Add Forgot Password Functionality

## Backend Changes
- [x] Add POST /forgot-password route in server/routes/auth.js: Validate email, hash new password, update DB.

## Frontend Changes
- [x] Add resetPassword function in frontend/src/Context/AuthContext.jsx: Call API, then login.
- [x] Add forgot password modal in frontend/src/User Page/Login.jsx: Form for email and new password, call resetPassword.

## Testing
- [x] Test the flow: Enter email, new password, update DB, auto-login.
