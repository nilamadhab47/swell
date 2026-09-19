import { FaqJsonLd } from '@/components/json-ld';
import { Hero } from '@/components/hero/hero';
import { CravingLoop } from '@/components/product-demo/craving-loop';
import { ThreeMinutes } from '@/components/sections/three-minutes';
import { Journey } from '@/components/sections/journey';
import { Ocean } from '@/components/sections/ocean';
import { WhySwell } from '@/components/sections/why-swell';
import { Proof } from '@/components/sections/proof';
import { FaqSection } from '@/components/sections/faq';
import { FinalCta } from '@/components/sections/final-cta';

export default function HomePage() {
  return (
    <main>
      <FaqJsonLd />
      <Hero />
      <CravingLoop />
      <ThreeMinutes />
      <Journey />
      <Ocean />
      <WhySwell />
      <Proof />
      <FaqSection />
      <FinalCta />
    </main>
  );
}
