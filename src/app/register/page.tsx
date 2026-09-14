import AuthForm from '@/components/auth-form';
export default function RegisterPage() { return <AuthForm apiUrl={process.env.API_URL ?? 'http://localhost:4000'} mode="register" />; }
