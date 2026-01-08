# Admin Dashboard Real Data Integration

## Backend Tasks
- [ ] Add `/dashboard/revenue-trend` endpoint to return revenue data over time periods (daily, weekly, monthly, yearly)
- [ ] Add `/dashboard/booking-trend` endpoint to return booking count data over time periods
- [ ] Test the new endpoints with sample data

## Frontend Tasks
- [ ] Remove mock functions `getRevenueTrend()` and `getBookingTrend()` from AdminDashboard.jsx
- [ ] Add API calls to fetch real trend data from new endpoints
- [ ] Update chart rendering to use real data instead of mock data
- [ ] Add proper loading states and error handling for trend data
- [ ] Test the updated dashboard with real data

## Testing
- [ ] Verify revenue trend chart shows correct data
- [ ] Verify booking trend chart shows correct data
- [ ] Test different time ranges (daily, weekly, monthly, yearly)
- [ ] Ensure proper error handling when no data is available
