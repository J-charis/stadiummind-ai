import { Hero } from '@/features/landing/components/Hero';
import { FeatureGrid } from '@/features/landing/components/FeatureGrid';
import { ArchitectureOverview } from '@/features/landing/components/ArchitectureOverview';
import { Footer } from '@/features/landing/components/Footer';

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <FeatureGrid />
      <ArchitectureOverview />
      <Footer />
    </div>
  );
}
