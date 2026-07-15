import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-base px-6 text-center">
      <span className="font-mono text-sm text-signal">404</span>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Page not found</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to={ROUTES.landing}>
        <Button className="mt-2">Back to home</Button>
      </Link>
    </div>
  );
}
