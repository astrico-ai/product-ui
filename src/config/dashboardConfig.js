// Regular Dashboard Configuration
export const regularDashboardConfig = {
  dataSources: [
    { value: 'salesforce', label: 'Salesforce' },
    { value: 'genesys', label: 'Genesys' },
    { value: 'exotel', label: 'Exotel' },
    { value: 'greylabs', label: 'GreyLabs' },
    { value: 'freshdesk', label: 'Freshdesk' }
  ],
  metrics: [
    { value: 'overdue_leads', label: 'Overdue for more than 1 year' },
    { value: 'lost_leads', label: 'Lost Leads' },
    { value: 'total_ar', label: 'Total AR for the entire year' },
    { value: 'avg_closure_time', label: 'Average deal closure time' },
    { value: 'low_performing_agents', label: 'Lowest performing agents (total revenue)' }
  ],
  groupByOptions: [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'annual', label: 'Annual' }
  ]
};

// Insurance Dashboard Configuration
export const insuranceDashboardConfig = {
  dataSources: [
    { value: 'salesforce', label: 'Salesforce' },
    { value: 'genesys', label: 'Genesys' },
    { value: 'exotel', label: 'Exotel' }
  ],
  metrics: [
    { value: 'total_premium', label: 'Total Premium Collection' },
    { value: 'new_policies', label: 'New Policies Issued' },
    { value: 'policy_renewals', label: 'Policy Renewals' },
    { value: 'claims_ratio', label: 'Claims Ratio' },
    { value: 'avg_claim_settlement', label: 'Average Claim Settlement Time' },
    { value: 'lapse_ratio', label: 'Policy Lapse Ratio' },
    { value: 'agent_performance', label: 'Agent Performance' },
    { value: 'customer_complaints', label: 'Customer Complaints' }
  ],
  groupByOptions: [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ]
};

// Marketing Dashboard Configuration (existing)
export const marketingDashboardConfig = {
  dataSources: [
    { value: 'google-ads', label: 'Google Ads' },
    { value: 'meta-ads', label: 'META Ads' },
    { value: 'linkedin-ads', label: 'LinkedIn Ads' },
    { value: 'mailchimp', label: 'Mailchimp' },
    { value: 'netcore', label: 'Netcore' }
  ],
  metrics: [
    { value: 'impressions', label: 'Impressions' },
    { value: 'clicks', label: 'Clicks' },
    { value: 'ctr', label: 'CTR' },
    { value: 'conversions', label: 'Conversions' },
    { value: 'cost', label: 'Cost' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'roas', label: 'ROAS' }
  ],
  groupByOptions: [
    { value: 'campaign', label: 'Campaign' },
    { value: 'ad_group', label: 'Ad Group' },
    { value: 'ad_name', label: 'Ad Name' },
    { value: 'platform', label: 'Platform' },
    { value: 'date', label: 'Date' },
    { value: 'device', label: 'Device' },
    { value: 'geography', label: 'Geography' },
    { value: 'channel', label: 'Channel' }
  ]
}; 