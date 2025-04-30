'use client';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthContext from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { FiLock, FiUser } from 'react-icons/fi';

export default function LoginPage() {
  const { loginUser, error } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await loginUser(username, password);
    setLoading(false);
    if (success) {
      router.replace('/');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-background dark:bg-background px-4'>
      <Card className='w-full max-w-md p-8 shadow-lg bg-card dark:bg-card border border-border'>
        <h1 className='text-2xl font-bold mb-6 text-center text-foreground'>Admin Login</h1>
        {error && (
          <Alert variant='destructive' className='mb-4 whitespace-normal'>
            Invalid credentials. Please try again.
          </Alert>
        )}
        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <Label htmlFor='username' className='text-foreground flex items-center gap-2'>
              <FiUser /> Username (Email)
            </Label>
            <Input
              id='username'
              type='email'
              autoComplete='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className='mt-1 bg-background border-border text-foreground'
              placeholder='admin@example.com'
            />
          </div>
          <div>
            <Label htmlFor='password' className='text-foreground flex items-center gap-2'>
              <FiLock /> Password
            </Label>
            <Input
              id='password'
              type='password'
              autoComplete='current-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='mt-1 bg-background border-border text-foreground'
              placeholder='Your password'
            />
          </div>
          <Button type='submit' className='w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90' disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
