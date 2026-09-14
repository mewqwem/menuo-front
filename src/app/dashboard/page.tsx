import BusinessDashboard from '@/components/business-dashboard';
export default function DashboardPage() { return <BusinessDashboard apiUrl={process.env.API_URL ?? 'http://localhost:4000'} />; }
