'use client';

import AuthContext from '@/contexts/AuthContext';
import axios from 'axios';
import { FormEvent, useContext, useState } from 'react';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useContext(AuthContext);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_HOST}/dash/login/`, { email, password });
      loginUser(response.data);
    } catch (error) {
      console.error('Login failed', error);
    }
  };
  return (
    <form onSubmit={handleLogin}>
      <div className='mb-4'>
        <label htmlFor='email' className='mb-2.5 block font-medium text-dark dark:text-white'>
          Email
        </label>
        <div className='relative'>
          <input
            type='email'
            placeholder='Enter your email'
            name='email'
            onChange={(e) => setEmail(e.target.value)}
            className='w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary'
          />
          <span className='absolute right-4.5 top-1/2 -translate-y-1/2'>
            <i className='fa-regular fa-envelope'></i>
          </span>
        </div>
      </div>
      <div className='mb-5'>
        <label htmlFor='password' className='mb-2.5 block font-medium text-dark dark:text-white'>
          Password
        </label>
        <div className='relative'>
          <input
            type='password'
            name='password'
            placeholder='Enter your password'
            autoComplete='password'
            onChange={(e) => setPassword(e.target.value)}
            className='w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary'
          />
          <span className='absolute right-4.5 top-1/2 -translate-y-1/2'>
            <i className='fa-solid fa-lock'></i>
          </span>
        </div>
      </div>
      <div className='mb-4.5'>
        <button
          type='submit'
          className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90'>
          Sign In
        </button>
      </div>
    </form>
  );
}
