'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('auth-token');
    
    if (accessToken) {
      // User is logged in, go to dashboard
      router.push('/dashboard');
    } else {
      // User is not logged in, go to login page
      router.push('/login');
    }
  }, [router]);

  // Show loading while checking auth
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, oklch(0.55 0.25 280 / 0.05) 0%, oklch(0.65 0.2 280 / 0.1) 100%)'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid oklch(0.55 0.25 280 / 0.2)',
        borderTopColor: 'oklch(0.55 0.25 280)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
