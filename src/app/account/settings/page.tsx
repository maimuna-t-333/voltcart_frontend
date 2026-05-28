'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Shield, ChevronRight, Save, CheckCircle2, Loader2, Key, IdCard, Fingerprint } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, changePasswordSchema, type UpdateProfileFormData, type ChangePasswordFormData } from '@/lib/validations/auth.schemas';
import api from '@/lib/axios';

const fieldCx = 'w-full h-11 px-4 rounded-xl text-sm outline-none transition-all duration-200';

const btnCx = 'relative w-full h-11 rounded-xl text-sm font-bold text-white overflow-hidden transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

function DotDivider() {
  return (
    <div className='flex items-center gap-3 my-6'>
      <div className='flex-1 h-px bg-linear-to-r from-transparent via-[var(--accent)]/20 to-transparent' />
      <div className='size-1.5 rounded-full' style={{ background: 'var(--accent)' }} />
      <div className='flex-1 h-px bg-linear-to-r from-transparent via-[var(--accent)]/20 to-transparent' />
    </div>
  );
}

function SpecBadge({ label }: { label: string }) {
  return (
    <span className='inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.15em] px-2.5 py-1 rounded-full uppercase'
      style={{
        background: 'var(--accent-dim)',
        color: 'var(--accent)',
        border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
      }}
    >
      <span className='size-1 rounded-full' style={{ background: 'var(--accent)' }} />
      {label}
    </span>
  );
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const springItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 18 } },
};

function CardGlow() {
  return (
    <div className='absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'
      style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--accent) 18%, transparent), 0 8px 32px color-mix(in srgb, var(--accent) 8%, transparent)' }}
    />
  );
}

function DotTexture() {
  return (
    <div aria-hidden className='pointer-events-none absolute inset-0 rounded-3xl overflow-hidden opacity-[0.02]'>
      <div className='absolute inset-0' style={{
        backgroundImage: 'radial-gradient(circle, var(--accent) 0.5px, transparent 0.5px)',
        backgroundSize: '20px 20px',
      }} />
    </div>
  );
}

function RippleLayer({ ripples }: { ripples: { x: number; y: number; id: number }[] }) {
  return (
    <>
      {ripples.map(r => (
        <span key={r.id} className='absolute rounded-full pointer-events-none'
          style={{ left: r.x - 8, top: r.y - 8, width: 16, height: 16,
          background: 'rgba(255,255,255,0.35)', transform: 'scale(0)',
          animation: 'ripple 0.6s ease-out forwards' }} />
      ))}
    </>
  );
}

export default function SettingsPage() {
  const { user, isLoading } = useRequireAuth();
  const accessToken = useAuthStore(s => s.accessToken);
  const setAuth = useAuthStore(s => s.setAuth);

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pfFocused, setPfFocused] = useState<string | null>(null);
  const [pwFocused, setPwFocused] = useState<string | null>(null);
  const [pfRipples, setPfRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const [pwRipples, setPwRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const pfRippleId = useRef(0);
  const pwRippleId = useRef(0);

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    values: { name: user?.name ?? '' },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  if (isLoading || !user) return null;

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>, setter: typeof setPfRipples, idRef: typeof pfRippleId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = idRef.current++;
    setter(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setter(prev => prev.filter(r => r.id !== id)), 600);
  };

  const focusStyle = (focused: string | null, field: string, errors: Record<string, any>) => ({
    borderColor: errors[field] ? '#ef4444' : focused === field ? '#6366f1' : 'var(--auth-input-border)',
    boxShadow: focused === field && !errors[field] ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
  } as React.CSSProperties);

  const handleProfileSubmit = async (data: UpdateProfileFormData) => {
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/update-profile', { name: data.name });
      const updated = res.data.data?.user ?? res.data.user;
      if (updated) setAuth(updated, accessToken ?? '');
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed');
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <PageTransition>
      <section className='relative overflow-hidden min-h-screen transition-colors duration-400' style={{ background: 'var(--bg)' }}>
        <div className='absolute inset-0 pointer-events-none z-0' aria-hidden>
          <div className='hb-grid-overlay absolute inset-0' />
          <div className='absolute rounded-full blur-[120px] pointer-events-none w-[600px] h-[500px] -top-[200px] -left-[200px]' style={{ background: 'var(--accent-glow)' }} />
          <div className='absolute rounded-full blur-[80px] pointer-events-none w-[350px] h-[350px] -bottom-[100px] -right-[100px]' style={{ background: 'rgba(139,92,246,0.08)' }} />
        </div>

        <div className='relative z-10 max-w-4xl mx-auto px-4 py-8 lg:py-12'>
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className='flex items-center gap-2 text-[12px] font-medium mb-6'
            style={{ color: 'var(--tx2)' }}
          >
            <Link href='/account' className='transition-colors duration-200 hover:text-[var(--accent)]'>Account</Link>
            <ChevronRight size={12} strokeWidth={2.5} />
            <span style={{ color: 'var(--accent)' }}>Settings</span>
          </motion.div>

          {/* ═══ Profile Header ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className='group relative rounded-3xl p-6 lg:p-8 backdrop-blur-xl mb-8 overflow-hidden'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--card-bdr)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
            }}
          >
            <DotTexture />
            <CardGlow />

            <div className='relative z-10 flex items-center gap-5'>
              <div className='size-18 sm:size-22 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-bold shrink-0 transition-transform duration-300 group-hover:scale-105'
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className='min-w-0'>
                <div className='flex items-center gap-2.5 flex-wrap'>
                  <h1 className='text-2xl lg:text-3xl font-extrabold tracking-tight truncate' style={{ color: 'var(--tx)' }}>
                    {user.name}
                  </h1>
                  <SpecBadge label={user.role === 'admin' ? 'Admin' : 'Customer'} />
                </div>
                <p className='text-sm mt-1.5 flex items-center gap-1.5' style={{ color: 'var(--tx2)' }}>
                  <Mail size={13} strokeWidth={1.8} />
                  {user.email}
                </p>
              </div>
            </div>
          </motion.div>

          <DotDivider />

          {/* ═══ Settings Sections ═══ */}
          <motion.div variants={stagger} initial='hidden' animate='show' className='grid gap-6 lg:gap-8'>
            {/* ═══ Profile Information ═══ */}
            <motion.div variants={springItem} className='group relative'>
              <div
                className='relative rounded-3xl p-6 lg:p-8 backdrop-blur-xl overflow-hidden'
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--card-bdr)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
                }}
              >
                <DotTexture />
                <CardGlow />

                <div className='relative z-10'>
                  <div className='flex items-center gap-3 mb-6 pb-5' style={{ borderBottom: '1px solid var(--auth-divider)' }}>
                    <div className='size-11 rounded-xl flex items-center justify-center shrink-0' style={{ background: 'var(--accent-dim)' }}>
                      <User size={19} strokeWidth={1.8} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2.5 flex-wrap'>
                        <h2 className='text-[16px] font-bold' style={{ color: 'var(--tx)' }}>Profile Information</h2>
                        <SpecBadge label='SET-01' />
                      </div>
                      <p className='text-[12.5px]' style={{ color: 'var(--tx2)' }}>Update your display name</p>
                    </div>
                  </div>

                  <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-[12.5px] font-semibold mb-1.5 uppercase tracking-wide'
                          style={{ color: pfFocused === 'name' ? '#6366f1' : 'var(--auth-label)' }}>
                          Full Name
                        </label>
                        <input
                          {...profileForm.register('name')}
                          type='text'
                          placeholder='Your name'
                          autoComplete='name'
                          className={fieldCx}
                          style={{ color: 'var(--tx)', background: 'var(--auth-input-bg)', border: '1px solid', ...focusStyle(pfFocused, 'name', profileForm.formState.errors) }}
                          onFocus={() => setPfFocused('name')}
                          onBlur={() => setPfFocused(null)}
                        />
                        {profileForm.formState.errors.name && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                            className='text-xs mt-1.5 text-red-500'>{profileForm.formState.errors.name.message}</motion.p>
                        )}
                      </div>

                      <div>
                        <label className='block text-[12.5px] font-semibold mb-1.5 uppercase tracking-wide'
                          style={{ color: 'var(--auth-label)' }}>
                          Email
                        </label>
                        <div
                          className={`${fieldCx} flex items-center gap-2.5 cursor-not-allowed min-w-0`}
                          style={{ color: 'var(--tx3)', background: 'var(--auth-input-bg)', border: '1px solid var(--auth-input-border)' }}
                        >
                          <Mail size={14} strokeWidth={1.8} className='shrink-0' />
                          <span className='text-sm truncate'>{user.email}</span>
                        </div>
                        <p className='text-[11px] mt-1.5 flex items-center gap-1' style={{ color: 'var(--tx3)' }}>
                          <span className='size-1 rounded-full' style={{ background: 'var(--tx3)' }} />
                          Email cannot be changed
                        </p>
                      </div>
                    </div>

                    <div className='mt-6 pt-4' style={{ borderTop: '1px solid var(--auth-divider)' }}>
                      <button
                        type='submit'
                        disabled={profileLoading}
                        onClick={(e) => addRipple(e, setPfRipples, pfRippleId)}
                        className={btnCx}
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(99,102,241,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.35)'; }}
                      >
                        <RippleLayer ripples={pfRipples} />
                        <motion.span className='relative z-10 inline-flex items-center gap-2'
                          animate={profileLoading ? { opacity: [1, 0.6, 1] } : {}}
                          transition={profileLoading ? { duration: 1, repeat: Infinity } : {}}
                        >
                          {profileLoading ? (
                            <><Loader2 size={15} strokeWidth={2} className='animate-spin' /> Saving...</>
                          ) : (
                            <span className='flex items-center gap-1.5'>
                              <Save size={15} strokeWidth={2} /> Save Changes
                            </span>
                          )}
                        </motion.span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* ═══ Change Password ═══ */}
            <motion.div variants={springItem} className='group relative'>
              <div
                className='relative rounded-3xl p-6 lg:p-8 backdrop-blur-xl overflow-hidden'
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--card-bdr)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
                }}
              >
                <DotTexture />
                <CardGlow />

                <div className='relative z-10'>
                  <div className='flex items-center gap-3 mb-6 pb-5' style={{ borderBottom: '1px solid var(--auth-divider)' }}>
                    <div className='size-11 rounded-xl flex items-center justify-center shrink-0'
                      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.06))' }}>
                      <Key size={19} strokeWidth={1.8} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2.5 flex-wrap'>
                        <h2 className='text-[16px] font-bold' style={{ color: 'var(--tx)' }}>Change Password</h2>
                        <SpecBadge label='SET-02' />
                      </div>
                      <p className='text-[12.5px]' style={{ color: 'var(--tx2)' }}>Update your account password</p>
                    </div>
                  </div>

                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-[12.5px] font-semibold mb-1.5 uppercase tracking-wide'
                          style={{ color: pwFocused === 'currentPassword' ? '#6366f1' : 'var(--auth-label)' }}>
                          Current Password
                        </label>
                        <input
                          {...passwordForm.register('currentPassword')}
                          type='password'
                          placeholder='Enter current password'
                          autoComplete='current-password'
                          className={fieldCx}
                          style={{ color: 'var(--tx)', background: 'var(--auth-input-bg)', border: '1px solid', ...focusStyle(pwFocused, 'currentPassword', passwordForm.formState.errors) }}
                          onFocus={() => setPwFocused('currentPassword')}
                          onBlur={() => setPwFocused(null)}
                        />
                        {passwordForm.formState.errors.currentPassword && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                            className='text-xs mt-1.5 text-red-500'>{passwordForm.formState.errors.currentPassword.message}</motion.p>
                        )}
                      </div>

                      <div>
                        <label className='block text-[12.5px] font-semibold mb-1.5 uppercase tracking-wide'
                          style={{ color: pwFocused === 'newPassword' ? '#6366f1' : 'var(--auth-label)' }}>
                          New Password
                        </label>
                        <input
                          {...passwordForm.register('newPassword')}
                          type='password'
                          placeholder='8–16 characters'
                          autoComplete='new-password'
                          className={fieldCx}
                          style={{ color: 'var(--tx)', background: 'var(--auth-input-bg)', border: '1px solid', ...focusStyle(pwFocused, 'newPassword', passwordForm.formState.errors) }}
                          onFocus={() => setPwFocused('newPassword')}
                          onBlur={() => setPwFocused(null)}
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                            className='text-xs mt-1.5 text-red-500'>{passwordForm.formState.errors.newPassword.message}</motion.p>
                        )}
                      </div>

                      <div>
                        <label className='block text-[12.5px] font-semibold mb-1.5 uppercase tracking-wide'
                          style={{ color: pwFocused === 'confirmPassword' ? '#6366f1' : 'var(--auth-label)' }}>
                          Confirm New Password
                        </label>
                        <input
                          {...passwordForm.register('confirmPassword')}
                          type='password'
                          placeholder='Re-enter new password'
                          autoComplete='new-password'
                          className={fieldCx}
                          style={{ color: 'var(--tx)', background: 'var(--auth-input-bg)', border: '1px solid', ...focusStyle(pwFocused, 'confirmPassword', passwordForm.formState.errors) }}
                          onFocus={() => setPwFocused('confirmPassword')}
                          onBlur={() => setPwFocused(null)}
                        />
                        {passwordForm.formState.errors.confirmPassword && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                            className='text-xs mt-1.5 text-red-500'>{passwordForm.formState.errors.confirmPassword.message}</motion.p>
                        )}
                      </div>
                    </div>

                    <div className='mt-6 pt-4' style={{ borderTop: '1px solid var(--auth-divider)' }}>
                      <button
                        type='submit'
                        disabled={passwordLoading}
                        onClick={(e) => addRipple(e, setPwRipples, pwRippleId)}
                        className={btnCx}
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(99,102,241,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.35)'; }}
                      >
                        <RippleLayer ripples={pwRipples} />
                        <motion.span className='relative z-10 inline-flex items-center gap-2'
                          animate={passwordLoading ? { opacity: [1, 0.6, 1] } : {}}
                          transition={passwordLoading ? { duration: 1, repeat: Infinity } : {}}
                        >
                          {passwordLoading ? (
                            <><Loader2 size={15} strokeWidth={2} className='animate-spin' /> Changing...</>
                          ) : (
                            <span className='flex items-center gap-1.5'>
                              <CheckCircle2 size={15} strokeWidth={2} /> Update Password
                            </span>
                          )}
                        </motion.span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* ═══ Account Info ═══ */}
            <motion.div variants={springItem} className='group relative'>
              <div
                className='relative rounded-3xl p-6 lg:p-8 backdrop-blur-xl overflow-hidden'
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--card-bdr)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
                }}
              >
                <DotTexture />
                <CardGlow />

                <div className='relative z-10'>
                  <div className='flex items-center gap-3 mb-6 pb-5' style={{ borderBottom: '1px solid var(--auth-divider)' }}>
                    <div className='size-11 rounded-xl flex items-center justify-center shrink-0' style={{ background: 'var(--accent-dim)' }}>
                      <IdCard size={19} strokeWidth={1.8} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2.5 flex-wrap'>
                        <h2 className='text-[16px] font-bold' style={{ color: 'var(--tx)' }}>Account Info</h2>
                        <SpecBadge label='SET-03' />
                      </div>
                      <p className='text-[12.5px]' style={{ color: 'var(--tx2)' }}>Your account details</p>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <div className='flex items-center gap-3 py-3.5 px-4 rounded-xl transition-colors duration-200 hover:[background:color-mix(in_srgb,var(--accent)_3%,transparent)]'
                      style={{ background: 'var(--auth-input-bg)' }}>
                      <Fingerprint size={16} strokeWidth={1.8} style={{ color: 'var(--accent)' }} />
                      <div className='min-w-0 flex-1'>
                        <p className='text-[11px] font-medium' style={{ color: 'var(--auth-label)' }}>Role</p>
                        <p className='text-[13px] font-semibold truncate' style={{ color: user.role === 'admin' ? '#f59e0b' : 'var(--tx)' }}>
                          {user.role === 'admin' ? 'Administrator' : 'Customer'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 py-3.5 px-4 rounded-xl transition-colors duration-200 hover:[background:color-mix(in_srgb,var(--accent)_3%,transparent)]'
                      style={{ background: 'var(--auth-input-bg)' }}>
                      <IdCard size={16} strokeWidth={1.8} style={{ color: 'var(--accent)' }} />
                      <div className='min-w-0 flex-1'>
                        <p className='text-[11px] font-medium' style={{ color: 'var(--auth-label)' }}>Account ID</p>
                        <p className='text-[13px] font-mono truncate' style={{ color: 'var(--tx3)' }}>{user.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* bottom circuit line */}
          <div className='mt-10 flex items-center gap-3 opacity-40'>
            <div className='flex-1 h-px bg-linear-to-r from-transparent via-[var(--accent)]/20 to-transparent' />
            <div className='flex items-center gap-1'>
              <span className='size-1 rounded-full' style={{ background: 'var(--accent)' }} />
              <span className='size-1 rounded-full' style={{ background: 'var(--accent)', opacity: 0.5 }} />
              <span className='size-1 rounded-full' style={{ background: 'var(--accent)', opacity: 0.25 }} />
            </div>
            <div className='flex-1 h-px bg-linear-to-r from-transparent via-[var(--accent)]/20 to-transparent' />
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
