const express = require('express');
const router = express.Router();

const PLANS = [
  {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    features: ['20 Questions/day', '1 Company Track overview', 'Job feed (view only)'],
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 99,
    features: ['Unlimited Practice', 'All Company Tracks', 'Direct Apply to Jobs', 'Performance Analytics', 'Ad-free'],
  },
  {
    id: 'pro_annual',
    name: 'Pro Annual',
    price: 799,
    features: ['Unlimited Practice', 'All Company Tracks', 'Direct Apply to Jobs', 'Performance Analytics', 'Ad-free', 'Priority Support'],
  }
];

// GET /v1/plans
router.get('/', (req, res) => {
  res.json({ success: true, data: { plans: PLANS } });
});

module.exports = router;
