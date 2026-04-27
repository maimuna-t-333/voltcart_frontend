'use client';
import PageTransition from '@/components/layout/PageTransition';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoBanner from '@/components/home/PromoBanner';
import BestSellers from '@/components/home/BestSellers';

export default function Home() {
  return (
    <PageTransition>
      <HeroBanner />
      <PromoBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <BestSellers />
    </PageTransition>
  );
}