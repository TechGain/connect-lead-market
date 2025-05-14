
import LoadingState from '@/components/my-leads/LoadingState';
import TimeoutState from '@/components/my-leads/TimeoutState';
import RoleErrorState from '@/components/my-leads/RoleErrorState';
import LeadsListTab from './tabs/LeadsListTab';
import UploadLeadTab from '@/components/my-leads/UploadLeadTab';

// Export all tab-related components as a namespace
const MyLeadsTabs = {
  LoadingState,
  TimeoutState,
  RoleErrorState,
  LeadsListTab,
  UploadLeadTab
};

export default MyLeadsTabs;
