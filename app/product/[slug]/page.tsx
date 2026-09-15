'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Zap,
  ArrowRight,
  Check,
  MapPin,
  ChevronRight,
  FileText,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getProductBySlug, getRelatedProducts, getFrequentlyBoughtTogether } from '@/lib/products';
import { ProductGallery } from '@/components/products/product-gallery';
import { ProductSpecsTable } from '@/components/products/product-specs-table';
import { ProductReviews } from '@/components/products/product-reviews';
import { BundleBuilder } from '@/components/products/bundle-builder';
import { StickyBuyBar } from '@/components/products/sticky-buy-bar';
import { ProductCard } from '@/components/products/product-card';
import { useCart } from '@/context/cart-context';
import { useProducts } from '@/context/product-context';
import { useWishlist } from '@/context/wishlist-context';
import { useToast } from '@/context/toast-context';
import { BLRZoneModal } from '@/components/blr-zone-modal';
import { ProductVariant } from '@/lib/types';
import { notFound } from 'next/navigation';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { products } = useProducts();
  
  const product =
    products.find((p) => p.slug === resolvedParams.slug || p.id === resolvedParams.slug) ||
    getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const { addToCart, openCart, selectedZone } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'reviews' | 'bundle'>('specs');
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const unitPrice = product.price + (selectedVariant?.priceModifier || 0);
  const totalPrice = unitPrice * quantity;
  const discountPercent = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);
  const frequentlyBoughtTogether = products
    .filter((p) => p.id !== product.id)
    .slice(0, 2);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    setIsAdded(true);
    success('Added to Cart', `${quantity}x ${product.title} added.`);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant);
    router.push('/checkout');
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product);
    if (added) {
      success('Saved to Wishlist', `${product.title} saved.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-24 space-y-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-neutral-400 dark:text-neutral-600" />
        <Link href="/shop" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Catalog
        </Link>
        <ChevronRight className="w-3 h-3 text-neutral-400 dark:text-neutral-600" />
        <Link
          href={`/shop?category=${product.category}`}
          className="hover:text-neutral-900 dark:hover:text-white transition-colors truncate max-w-[150px]"
        >
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3 h-3 text-neutral-400 dark:text-neutral-600" />
        <span className="text-neutral-900 dark:text-white font-semibold truncate max-w-[200px]">
          {product.title}
        </span>
      </nav>

      {/* Main Two-Column PDP Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left Column: Product Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images}
            title={product.title}
            pinoutUrl={product.pinoutUrl}
            datasheetUrl={product.datasheetUrl}
          />
        </div>

        {/* Right Column: Buying Information & Specs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Badges */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6366f1] uppercase tracking-wider">
                {product.categoryName}
              </span>
              {product.voltageLogic && (
                <span className="text-[10px] font-mono font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-white/5 px-2 py-0.5 rounded border border-neutral-200 dark:border-white/10">
                  {product.voltageLogic}
                </span>
              )}
              {product.isFeatured && (
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-rose-50 dark:bg-red-600/20 text-[#6366f1] dark:text-red-400 border border-rose-200 dark:border-red-500/30 px-2 py-0.5 rounded">
                  Flagship
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
              {product.title}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {product.subtitle || product.editorialBlurb}
            </p>

            {/* Ratings & Hub Stock */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'}`}
                  />
                ))}
                <span className="text-xs font-bold text-neutral-900 dark:text-white ml-1">{product.rating}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">({product.reviewsCount} reviews)</span>
              </div>

              <span className="text-neutral-300 dark:text-neutral-700">•</span>

              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                {product.blrHubStock} units ready in HAL Hub
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-neutral-950 dark:text-white">
                  ₹{unitPrice.toLocaleString('en-IN')}
                </span>
                {product.comparePrice && (
                  <span className="text-sm font-mono text-neutral-400 dark:text-neutral-500 line-through">
                    ₹{product.comparePrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-[#6366f1] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/20 px-2 py-0.5 rounded-md font-mono">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 block">
                Price includes 18% GST · Tax invoice provided
              </span>
            </div>

            <div className="text-right text-[11px] text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-900 dark:text-white block">Free Shipping</span>
              <span>on orders over ₹1,499</span>
            </div>
          </div>

          {/* Hardware Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider block">
                {product.variantLabel || 'Available Configurations'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-red-50 dark:bg-red-600/10 border-[#6366f1] text-neutral-950 dark:text-white shadow-xs'
                          : 'bg-white dark:bg-[#0e1117] border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{variant.name}</span>
                        {variant.priceModifier !== 0 && (
                          <span
                            className={`text-[10px] font-mono ${
                              isSelected ? 'text-[#6366f1] dark:text-red-400 font-semibold' : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            {variant.priceModifier > 0 ? `+₹${variant.priceModifier}` : `-₹${Math.abs(variant.priceModifier)}`}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono block mt-0.5 text-neutral-400 dark:text-neutral-500">
                        SKU: {variant.sku}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-neutral-200 dark:border-white/10 rounded-xl overflow-hidden bg-neutral-50 dark:bg-[#0e1117] shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-white/5 transition-colors"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-3.5 py-1 text-sm font-mono font-bold text-neutral-950 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-white/5 transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] active:scale-95 text-white text-xs sm:text-sm font-bold py-3.5 px-5 rounded-xl transition-all shadow-md shadow-[#6366f1]/25 cursor-pointer"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart (₹{totalPrice.toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>

              {/* Wishlist Toggle */}
              <button
                onClick={handleToggleWishlist}
                className={`p-3 rounded-xl border transition-colors shrink-0 cursor-pointer ${
                  inWishlist
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/30 text-[#6366f1]'
                    : 'bg-white dark:bg-[#0e1117] border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Buy Now with 1-Click */}
            <button
              onClick={handleBuyNow}
              className="w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 border border-neutral-200 dark:border-white/10 active:scale-98 text-neutral-900 dark:text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <span>Instant Buy Now with 1-Click Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bengaluru Dispatch ETA Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-950 dark:text-white flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#6366f1]" />
                Bengaluru Few-Hour Dispatch ETA
              </span>
              <button
                onClick={() => setIsZoneModalOpen(true)}
                className="text-[11px] font-semibold text-[#6366f1] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Change Zone
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300 pt-1">
              <span>
                Dispatching to <strong className="text-neutral-950 dark:text-white">{selectedZone.name}</strong> ({selectedZone.pincode})
              </span>
              <span className="font-bold text-[#6366f1]">{selectedZone.deliveryEtaMinutes} mins</span>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
              Order placed before 7:00 PM dispatches via dedicated Porter 2-Wheeler rider immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Tabbed Section: Specs, Features, Reviews, Bundle */}
      <div className="pt-8 border-t border-neutral-200 dark:border-white/10 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-white/10 pb-2 overflow-x-auto">
          {[
            { id: 'specs', label: 'Technical Specifications' },
            { id: 'features', label: 'Features & Circuit Notes' },
            { id: 'reviews', label: `Verified Reviews (${product.reviewsCount})` },
            { id: 'bundle', label: 'Companion Bundle' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                activeTab === t.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Technical Specs */}
        {activeTab === 'specs' && (
          <ProductSpecsTable
            specs={product.specs}
            datasheetUrl={product.datasheetUrl}
            pinoutUrl={product.pinoutUrl}
          />
        )}

        {/* Tab 2: Features & Notes */}
        {activeTab === 'features' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-neutral-950 dark:text-white">
              Hardware Highlights &amp; Application Advice
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">{product.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {product.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Verified Reviews */}
        {activeTab === 'reviews' && (
          <ProductReviews
            rating={product.rating}
            reviewsCount={product.reviewsCount}
            reviews={product.reviews}
          />
        )}

        {/* Tab 4: Frequently Bought Together */}
        {activeTab === 'bundle' && (
          <BundleBuilder
            currentProduct={product}
            bundleItems={frequentlyBoughtTogether}
          />
        )}
      </div>

      {/* Related Products Rack */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-neutral-200 dark:border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#6366f1] uppercase tracking-wider">
                Related Silicon
              </span>
              <h3 className="text-xl font-bold text-neutral-950 dark:text-white mt-0.5">
                More in {product.categoryName}
              </h3>
            </div>
            <Link
              href={`/shop?category=${product.category}`}
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-[#6366f1] flex items-center gap-1"
            >
              <span>View Category</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Purchase Bar for PDP scroll */}
      <StickyBuyBar
        product={product}
        selectedVariant={selectedVariant}
        quantity={quantity}
        onQuantityChange={setQuantity}
      />

      {/* Zone Picker Modal */}
      <BLRZoneModal isOpen={isZoneModalOpen} onClose={() => setIsZoneModalOpen(false)} />
    </div>
  );
}
