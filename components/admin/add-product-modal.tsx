'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Cpu, AlertCircle, Check, Loader2, UploadCloud, Link as LinkIcon, Trash2, ShieldCheck, Zap, Radio, BatteryCharging, Tv, Wrench, CircleDot } from 'lucide-react';
import { useProducts } from '@/context/product-context';
import { useAuth } from '@/context/auth-context';
import { CustomSelect, SelectOption } from '@/components/ui/custom-select';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'microcontrollers', label: 'Microcontrollers & SOCs', description: 'ESP32, RP2040, STM32, Arduino', icon: <Cpu className="w-3.5 h-3.5 text-[#e51e2b]" /> },
  { value: 'sensors', label: 'Sensors & IMUs', description: 'IMU, ToF, Temp, Gas, Current', icon: <Radio className="w-3.5 h-3.5 text-blue-500" /> },
  { value: 'power', label: 'Power & Battery ICs', description: 'Buck/Boost, BMS, LiPo, USB-C PD', icon: <BatteryCharging className="w-3.5 h-3.5 text-amber-500" /> },
  { value: 'actuators', label: 'Displays & Relays', description: 'OLED, TFT, Solid State Relays', icon: <Tv className="w-3.5 h-3.5 text-purple-500" /> },
  { value: 'tools', label: 'Lab & Soldering Tools', description: 'Soldering Irons, Logic Analyzers', icon: <Wrench className="w-3.5 h-3.5 text-emerald-500" /> },
  { value: 'passives', label: 'Passives & Silicon ICs', description: 'Op-Amps, Logic Gates, SMD Passives', icon: <CircleDot className="w-3.5 h-3.5 text-cyan-500" /> },
];

export function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const { addProduct } = useProducts();
  const { isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'microcontrollers' | 'sensors' | 'power' | 'actuators' | 'passives' | 'tools'>('microcontrollers');
  const [price, setPrice] = useState('350');
  const [comparePrice, setComparePrice] = useState('450');
  const [stock, setStock] = useState('50');
  const [blrHubStock, setBlrHubStock] = useState('20');
  const [voltage, setVoltage] = useState('3.3V Logic');
  const [interfaceType, setInterfaceType] = useState('I2C / SPI');
  const [description, setDescription] = useState('');
  
  // Image Upload state
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [datasheetUrl, setDatasheetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    setIsUploadingImage(true);
    setErrorMsg('');
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image to S3 cloud storage');
      }

      setImageUrl(data.url);
      setUploadSuccess(true);
    } catch (err: any) {
      console.error('Image upload error:', err);
      setErrorMsg(err.message || 'Error uploading file to storage');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMsg('Role Denied: Only users with the "admin" role are authorized to list products.');
      return;
    }

    const finalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await addProduct({
        title,
        category,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : undefined,
        stock: Number(stock),
        blrHubStock: Number(blrHubStock),
        description,
        specs: {
          'Operating Voltage': voltage,
          'Communication Protocol': interfaceType,
          'Fulfillment Hub': 'New Thippasandra Central Warehouse (HAL 3rd Stage)',
        },
        features: [
          'Tested in Bengaluru hardware lab',
          'ESD-safe sealed packaging',
          'Same-day Porter 2-Wheeler dispatch eligible',
        ],
        imageUrl: finalImageUrl,
        images: [finalImageUrl],
        stockCount: Number(stock),
        datasheetUrl: datasheetUrl || undefined,
        isSameDayEligible: true,
        isFeatured: false,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to list product');
        setIsSubmitting(false);
        return;
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error listing component');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#10121a] text-neutral-900 dark:text-white shadow-2xl border border-neutral-200 dark:border-white/10 z-10 p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto transition-colors"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-red-500/10 text-[#e51e2b] flex items-center justify-center border border-red-500/20">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white display-title">
                    List New Component
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" /> Admin Only
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Adds item to live Dspace Bengaluru catalog with S3 cloud image storage
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Component Title & Model
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ESP32-CAM AI-Thinker with OV2640 Module"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#e51e2b] focus:bg-white dark:focus:bg-white/10 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Category
                </label>
                <CustomSelect
                  value={category}
                  onChange={(val) => setCategory(val as any)}
                  options={CATEGORY_OPTIONS}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Price (INR ₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#e51e2b] focus:bg-white dark:focus:bg-white/10 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Total Warehouse Stock
                </label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#e51e2b] focus:bg-white dark:focus:bg-white/10 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  HSR Hub Ready Units
                </label>
                <input
                  type="number"
                  required
                  value={blrHubStock}
                  onChange={(e) => setBlrHubStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#e51e2b] focus:bg-white dark:focus:bg-white/10 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Operating Voltage
                </label>
                <input
                  type="text"
                  placeholder="3.3V Logic"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#e51e2b] focus:bg-white dark:focus:bg-white/10 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Bus / Protocol
                </label>
                <input
                  type="text"
                  placeholder="I2C / SPI / UART"
                  value={interfaceType}
                  onChange={(e) => setInterfaceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#e51e2b] focus:bg-white dark:focus:bg-white/10 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Description & Pinout Notes
              </label>
              <textarea
                rows={2}
                required
                placeholder="Details on pinout, current draw, and microcontroller compatibility..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#e51e2b] focus:bg-white dark:focus:bg-white/10 focus:outline-none transition-colors"
              />
            </div>

            {/* Custom S3 Image Upload & URL Toggle */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Component Photo (S3 Storage)
                </label>
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/5 p-0.5 rounded-xl text-[11px] border border-neutral-200/60 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      imageMode === 'upload'
                        ? 'bg-white dark:bg-white/10 text-neutral-900 dark:text-white font-bold shadow-xs'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <UploadCloud className="h-3 w-3 inline mr-1 text-[#e51e2b]" />
                    Upload S3 File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      imageMode === 'url'
                        ? 'bg-white dark:bg-white/10 text-neutral-900 dark:text-white font-bold shadow-xs'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <LinkIcon className="h-3 w-3 inline mr-1 text-neutral-400" />
                    URL
                  </button>
                </div>
              </div>

              {imageMode === 'upload' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {imageUrl ? (
                    <div className="relative rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-3 flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 shrink-0">
                        <img
                          src={imageUrl}
                          alt="Uploaded component preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Image Stored Ready</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-mono mt-0.5">
                          {imageUrl.startsWith('data:') ? 'Custom image loaded' : imageUrl}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setUploadSuccess(false);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-2 rounded-xl text-neutral-400 hover:text-[#e51e2b] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all p-5 text-center flex flex-col items-center justify-center gap-2 ${
                        isDragging
                          ? 'border-[#e51e2b] bg-red-500/5'
                          : 'border-neutral-200 dark:border-white/10 bg-neutral-50/80 dark:bg-white/5 hover:bg-neutral-100/80 dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:border-white/20'
                      }`}
                    >
                      {isUploadingImage ? (
                        <div className="py-2 flex flex-col items-center gap-2">
                          <Loader2 className="h-6 w-6 text-[#e51e2b] animate-spin" />
                          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                            Uploading to S3 bucket...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="h-10 w-10 rounded-xl bg-white dark:bg-white/10 shadow-xs border border-neutral-200 dark:border-white/10 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                            <UploadCloud className="h-5 w-5 text-[#e51e2b]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                              Click to upload or drag & drop custom photo
                            </p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                              PNG, JPG, WEBP up to 10MB (S3 Cloud Storage integration)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#e51e2b] focus:bg-white dark:focus:bg-white/10 focus:outline-none font-mono text-[11px] transition-colors"
                  />
                  {imageUrl && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 shrink-0">
                        <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate">{imageUrl}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage || !isAdmin}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#e51e2b] hover:bg-[#c91823] active:bg-[#a6131d] text-white font-bold text-xs shadow-md shadow-[#e51e2b]/20 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Component to Catalog...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add Item to Live Catalog</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
