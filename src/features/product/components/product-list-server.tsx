import { getTranslations } from 'next-intl/server';

import { getProductsAction } from '@/features/product/actions';

export async function ProductListServer() {
  const t = await getTranslations('Products');
  const products = await getProductsAction();

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {products.map((product) => (
        <li
          key={product.id}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm text-muted-foreground">
            ${product.price.toFixed(2)} · ISR
          </p>
          {product.description ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {product.description}
            </p>
          ) : null}
        </li>
      ))}
      {products.length === 0 ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : null}
    </ul>
  );
}
