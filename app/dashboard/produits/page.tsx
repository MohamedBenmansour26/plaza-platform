import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Merchant, Product } from '@/types/supabase';
import { ProductsClient } from './ProductsClient';

export default async function ProduitsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle<Pick<Merchant, 'id'>>();

  if (!merchant) redirect('/onboarding');

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })
    .returns<Product[]>();

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-[1040px] mx-auto px-4 py-6 md:p-8">
        {/* Desktop page header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#1C1917]">Mes produits</h1>
          <Link
            href="/dashboard/produits/nouveau"
            className="h-10 px-4 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus className="w-5 h-5" />
            Ajouter un produit
          </Link>
        </div>

        <ProductsClient products={products ?? []} />
      </div>
    </div>
  );
}
