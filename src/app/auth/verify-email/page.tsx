import { Suspense } from 'react';
import VerifyEmailContent from './VerifyEmailContent';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}