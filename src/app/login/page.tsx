import AuthForm from '@/components/auth-form';
export default function LoginPage() { return <AuthForm apiUrl={process.env.API_URL ?? 'http://localhost:4000'} mode="login" />; }
