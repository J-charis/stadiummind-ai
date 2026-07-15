import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useSessionStore } from '@/store/sessionStore';
import { ROUTES } from '@/constants/routes';
const schema = z.object({
  email: z.string().email('Enter a valid work email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ops_manager', 'security', 'medical', 'volunteer']),
});

type FormValues = z.infer<typeof schema>;

/**
 * Demo-scoped login: resolves a role and populates sessionStore. Wiring to
 * real Supabase Auth email/password happens without changing this contract.
 */
export function LoginForm() {
  const navigate = useNavigate();
  const setSession = useSessionStore((s) => s.setSession);
  const setAnonymousFan = useSessionStore((s) => s.setAnonymousFan);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'ops_manager' },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setSession({
        id: `user-${Date.now()}`,
        email: values.email,
        fullName: values.email.split('@')[0],
        role: values.role,
        createdAt: new Date().toISOString(),
      });
      navigate(ROUTES.commandCenter);
    } catch {
      setFormError('Sign-in failed. Please try again.');
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-6">
      <h1 className="mb-1 font-display text-lg font-semibold text-text-primary">
        Staff sign in
      </h1>
      <p className="mb-5 text-sm text-text-secondary">
        Access the operations console with your assigned role.
      </p>

      {formError && (
        <div className="mb-4">
          <Alert tone="danger">{formError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-text-secondary">
            Work email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border border-border-strong bg-surface-overlay px-3 py-2.5 text-sm text-text-primary outline-none focus-visible:border-signal"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-risk-high">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-text-secondary">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-border-strong bg-surface-overlay px-3 py-2.5 text-sm text-text-primary outline-none focus-visible:border-signal"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-xs text-risk-high">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="role" className="mb-1.5 block text-xs font-medium text-text-secondary">
            Role
          </label>
          <select
            id="role"
            className="w-full rounded-lg border border-border-strong bg-surface-overlay px-3 py-2.5 text-sm text-text-primary outline-none focus-visible:border-signal"
            {...register('role')}
          >
            <option value="ops_manager">Operations Manager</option>
            <option value="security">Security</option>
            <option value="medical">Medical</option>
            <option value="volunteer">Volunteer</option>
          </select>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-5 border-t border-border pt-4 text-center">
        <button
          onClick={() => {
            setAnonymousFan();
            navigate(ROUTES.assistant);
          }}
          className="text-sm font-medium text-signal hover:underline"
        >
          Continue as a fan (no account needed)
        </button>
      </div>
    </div>
  );
}
