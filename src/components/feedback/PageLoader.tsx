import { Loader } from '@/components/ui/Loader';

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
      <Loader label="Loading module" />
    </div>
  );
}
