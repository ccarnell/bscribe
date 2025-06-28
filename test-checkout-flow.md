# Checkout Flow Testing Guide

## Overview
This guide helps you test the complete checkout and analytics flow to ensure everything is working before your book launch.

## Critical Issues Fixed

### 1. ✅ Download Tracking for Paid Purchases
- **Fixed**: `get-downloads` API now logs all downloads to `download_logs` table
- **Fixed**: `file-proxy` API logs actual file downloads with session/customer info
- **Fixed**: Success page passes session and customer data to file downloads

### 2. ✅ Analytics Discrepancy Resolution
- **Fixed**: Analytics now pulls from both `purchases` and `download_logs` tables
- **Fixed**: Added purchase metrics alongside download metrics
- **Fixed**: Added discrepancy detection to identify data inconsistencies

### 3. ✅ Comprehensive Analytics Dashboard
- **Added**: Purchase breakdown by type (individual vs bundle)
- **Added**: Revenue tracking and conversion rates
- **Added**: Daily purchase and download statistics
- **Added**: Health monitoring with discrepancy alerts

## Testing Checklist

### Pre-Test Setup
- [ ] Ensure Stripe webhook is configured and working
- [ ] Verify Supabase connection and permissions
- [ ] Check that book files exist in Supabase storage

### Test 1: Individual Book Purchase ($4.20, $6.66, or $9.11)
1. [ ] Go to your checkout page
2. [ ] Purchase an individual book
3. [ ] Complete Stripe payment
4. [ ] Verify redirect to success page
5. [ ] Confirm automatic download starts
6. [ ] Check that download completes successfully

**Expected Results:**
- [ ] Purchase record created in `purchases` table
- [ ] Download logged in `download_logs` table with customer email
- [ ] File download tracked in `download_logs` via file-proxy
- [ ] Analytics show both purchase and download

### Test 2: Bundle Purchase ($13.37 or $90.01)
1. [ ] Purchase a bundle
2. [ ] Complete Stripe payment
3. [ ] Verify both files download automatically
4. [ ] Check download completion

**Expected Results:**
- [ ] Purchase record created with `download_type: 'bundle'`
- [ ] Two download logs created (free book + paid book)
- [ ] Both files download successfully
- [ ] Analytics reflect bundle purchase and downloads

### Test 3: Analytics Verification
1. [ ] Go to `/admin/analytics`
2. [ ] Verify all metrics are populated:
   - [ ] Total Downloads matches actual downloads
   - [ ] Total Purchases matches Stripe data
   - [ ] Revenue matches Stripe amounts
   - [ ] Unique customers counted correctly
   - [ ] No discrepancy alerts (or expected ones only)

### Test 4: Free Download (Control Test)
1. [ ] Download free book
2. [ ] Verify it's logged in analytics
3. [ ] Confirm it doesn't affect purchase metrics

### Test 5: Error Handling
1. [ ] Test with invalid session ID
2. [ ] Test with network interruption
3. [ ] Verify error messages are helpful
4. [ ] Check fallback download links work

## Data Verification Queries

### Check Purchase Records
```sql
SELECT * FROM purchases 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

### Check Download Logs
```sql
SELECT * FROM download_logs 
WHERE downloaded_at > NOW() - INTERVAL '1 day'
ORDER BY downloaded_at DESC;
```

### Check for Discrepancies
```sql
-- Purchases without corresponding downloads
SELECT p.* FROM purchases p
LEFT JOIN download_logs dl ON p.stripe_payment_intent_id = dl.session_id
WHERE dl.session_id IS NULL AND p.status = 'succeeded';

-- Downloads without corresponding purchases (should only be free downloads)
SELECT dl.* FROM download_logs dl
LEFT JOIN purchases p ON dl.session_id = p.stripe_payment_intent_id
WHERE p.stripe_payment_intent_id IS NULL;
```

## Monitoring After Launch

### Daily Checks
1. [ ] Review analytics dashboard for discrepancies
2. [ ] Check error logs for failed downloads
3. [ ] Verify revenue matches Stripe dashboard
4. [ ] Monitor conversion rates

### Weekly Reviews
1. [ ] Analyze customer behavior patterns
2. [ ] Review download completion rates
3. [ ] Check for any data inconsistencies
4. [ ] Optimize based on analytics insights

## Troubleshooting Common Issues

### Downloads Not Logging
- Check Supabase permissions
- Verify webhook endpoint is reachable
- Check environment variables

### Analytics Discrepancies
- Run data verification queries
- Check webhook processing logs
- Verify Stripe session data

### File Download Failures
- Check Supabase storage permissions
- Verify file paths are correct
- Test file-proxy endpoint directly

## Success Metrics

Your system is working correctly when:
- ✅ Purchase count in analytics = Stripe payment count
- ✅ Download count ≥ Purchase count (due to free downloads)
- ✅ Revenue in analytics = Stripe revenue
- ✅ No discrepancy alerts in dashboard
- ✅ Customer emails match between systems

## Emergency Contacts

If issues arise during launch:
1. Check `/admin/analytics` for immediate health status
2. Review server logs for error patterns
3. Use direct download links as fallback
4. Monitor Stripe dashboard for payment issues

---

**Note**: Test thoroughly in a staging environment before going live. The analytics now provide comprehensive visibility into your entire funnel, from purchases to actual downloads.
