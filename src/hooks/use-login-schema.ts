'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { z } from 'zod';

export function useLoginSchema() {
  const t = useTranslations('Validation');

  return useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t('emailRequired'))
          .email(t('emailInvalid')),
        password: z
          .string()
          .min(1, t('passwordRequired'))
          .min(6, t('passwordMin', { min: 6 })),
      }),
    [t],
  );
}

export type LoginFormValues = {
  email: string;
  password: string;
};
