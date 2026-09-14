import NewBusinessForm from '@/components/new-business-form';
export default function NewBusinessPage() { return <NewBusinessForm apiUrl={process.env.API_URL ?? 'http://localhost:4000'} />; }
