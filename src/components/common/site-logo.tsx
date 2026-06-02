import Image from 'next/image';

import { SITE_ASSETS } from '@/lib/site-assets';

type SiteLogoProps = {
  alt: string;
  priority?: boolean;
  className?: string;
};

export function SiteLogo({
  alt,
  priority = false,
  className = 'h-9 w-auto object-contain sm:h-10 transparent',
}: SiteLogoProps) {
  return (
    <Image
      src={SITE_ASSETS.logo}
      alt={alt}
      width={200}
      height={70}
      className={className}
      priority={priority}
    />
  );
}
