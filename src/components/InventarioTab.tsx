import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ScanBarcode, Plus, PackageOpen, AlertTriangle, AlertCircle, RefreshCw, X, Camera, FileDown, Image, Check, UploadCloud, ChevronRight, FileSpreadsheet, FileText, Clipboard, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Product, BusinessConfig, isModuleActive, isFarmaciaModuleActive, getModuleForCategory } from '../types';
import { getCategoryPlaceholder, handleImageError, safeLocalStorageSetItem } from '../utils';
import { getUnidadLabel, getUnidadShortSuffix } from '../utils/unitHelpers';
import BarcodeScanner from './BarcodeScanner';
import { isPharmacyApp, fetchPharmacyBarcodeProduct } from '../lib/pharmacyBarcodeApi';

interface InventarioTabProps {
  products: Product[];
  onAddProduct: (item: Omit<Product, 'id' | 'updatedAt'> & { id?: string }) => Promise<void>;
  onEditProduct: (item: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  config?: BusinessConfig;
  userRole?: 'admin' | 'cajero';
  tenantId?: string;
  storeId?: string;
}

const PRESET_IMAGES = [
  { label: 'Bebida Lata', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFlYMgz-vIQcuMIgjuYTAgcl-nd2AxDuI4_1FzyqcDEeVhAdW0OMPH_hMf-2C_eoEWwjLtXF4OE6iINZPMLbLMPO44e1oZxox9whWwTNOL4EEpG_rzZKL-LTzue0SQzGQv6aW0DnZNBvZt71AsIjOj2IF7awSBI9J_pOpz9wbMiCISokAb8O2qvKoM3MgiKcse0wWbI4-VgkmYMCKIXWaneBXBg2GJxZR3Ky7cG2N7kn_qQSEnxMVl57dbd74Es_rMsFscsjqwjk' },
  { label: 'Pan', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr8u8wXDvpaNlG_Zq4Ebyy33Hy-gCEr5nVQiTk5CEI0Sva5jVF_J0WcfbJBeFSQsdIC5oP2vvQfC4mldu51JTs-gse8Xo9Zj_NFsaRcSvMoUW7EG_9wpJ4NqTZ-2IX0YinKfCGy_bapUtHhNVVbItz8ULk1KAo_dfFhbeN6srciOXmYuCynlfhrjZKOo9oyUKBd1kL_SYuZBxkvd2zEShZhfvVp4mffGMPr_1zkFzK7u8UC6koC1VsKpC1pOQEAMTzsE-KJkN743o' },
  { label: 'Leche', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfltLCYu3aB_3sd7mXGNlKGUjdV6mTGvaP8oLfH1ogkMUYzcysGwRqOHRlAIVNQfCncW2GfIvIpU05SFsHLsl7ibHcRbvnvri5c9JQ10kOaWz6PD9Ka3J3TGNh4anl0fKMxhmQ0iU7LziNgPkg4SnyTKmNmNEfFcnoMykBP3p2ZKqXjGgpdqlro8hwr2EaVDjhuSsQmJDerBcEwcSAlT-DAyF2m5UxA4pay_IrcpQdwU7ZgbhuaC4rmLEvnFUG227N0SrfINWzYqg' },
  { label: 'Snacks', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUF1NcIGYG2T3McNvhGUjed9u7fCunvxJ2UatiMBW1uGyTFK6frS3_ftz2XVCDronGS_zK23LrBTEEgg24yu5t3fj5TZu6L5pzpr6_jbJY5O6cudx5unBBU_yAwOQYwOrUr7Cv5ztUr02HzuHu0wXRjn3Q-qYwiKuHd38sjhTvRDDtwKEorPVyhYQfpJy6fad_aE1Svbe5pN8Xf2agc2pxkAmEfk0Wnla_3u8hQStkl7b1pMzBvIo0cza8sl5VfTO5lx6RXEm6Pws' },
  { label: 'Aguacate', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKHwCOIzMAguRTJrr8d3e9LlqCNrcvXChDmwyJ1INeC785VEq3zcb45qJdduZ9B6w7bfW9jjndYhiQPZj7lj26Bgi1WzCZVsFJsuBcFxJpotpFRcpH2zYvlED5lNmPNsJVcxg8CNTNelLVp8qzpLtmTDTVKRDElFVy3faTWb2hpCI_4taE5AeM4sj72NwNWlIRla2wcowcktVwejxl7gXRzeZFXDH5jzXm92SUW4wybAAAKORVhJec7LUNiT2kSro5ZAvRcsE02h4' },
  { label: 'Naranjas', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU7Odb9m9LVBsEv4N50b5NJeq4bSmQe9fWnrbQ_MFFXlflgpuektEG3pJlhrq7JEaqzZrPWP2wTS98S5M9PtW9BzjAdNjOSiwD1Y3PD5dMyCLmBdA2gQh4D-irqFYEnTAYsx4taGp5CeNQPF3IVGtIqXbNothSbFsLQ_mciNmM9EkZh-UbZ01BldH3wTPcc1FpP7CPqXQtAZ-XoR8rA9IeA4qX1I2omsgUwU-vJzzLY6QnBDuq3vZ9EIEmaLMtEC2tf8Z2no7Dvw0' },
  { label: 'Aceite', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0w6AWq-EHcBx5SuE1-ScX63fUy0pIOosoofZhQgWqRScufztzr1Cf2VtxDJmQVWbXZ3jwI5MHC640Tl9S-TPjjKr3mbyNjtKH0lwvpmtd16tk4KmQIbDOEpGxPoV9ekw_84kwl4Uebrv2OkS-9u84SA7YXTiFaDx-bNGvjGiM1j56mtdqwCMCuCArG-m3tmWksTH_a83vwvtRkNRyd3Xo8H6ZQD-O8nilMNJt70pim4Hz42_qeiAvcSLQ_jYF89-NYb-FPWUMklw' }
];

const PIZZA_PRESET_IMAGES = [
  { label: 'Pizzas Tradicionales', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
  { label: 'Pepperoni', url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
  { label: 'Papas Fritas', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400' },
  { label: 'Palitos de Ajo', url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400' },
  { label: 'Bebidas y Jugos', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFlYMgz-vIQcuMIgjuYTAgcl-nd2AxDuI4_1FzyqcDEeVhAdW0OMPH_hMf-2C_eoEWwjLtXF4OE6iINZPMLbLMPO44e1oZxox9whWwTNOL4EEpG_rzZKL-LTzue0SQzGQv6aW0DnZNBvZt71AsIjOj2IF7awSBI9J_pOpz9wbMiCISokAb8O2qvKoM3MgiKcse0wWbI4-VgkmYMCKIXWaneBXBg2GJxZR3Ky7cG2N7kn_qQSEnxMVl57dbd74Es_rMsFscsjqwjk' }
];

const CATEGORY_ICONS: Record<string, string> = {
  'Todos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png',
  'Bebidas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beverage%20Box.png',
  'Abarrotes': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Bags.png',
  'Lácteos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Milk%20Carton.png',
  'Snacks': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Potato%20Chips.png',
  'Frutas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Red%20Apple.png',
  'Frutas Frescas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Red%20Apple.png',
  'Verduras': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Broccoli.png',
  'Verduras y Hortalizas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Broccoli.png',
  'Frutos Secos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Peanuts.png',
  'Semillas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beans.png',
  'Legumbres': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beans.png',
  'Huevos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Egg.png',
  'Mermeladas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Honey%20Pot.png',
  'Miel': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Animals/Honeybee.png',
  'Abarrotes / Varios': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Package.png',
  'Medicamentos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Pill.png',
  'Cuidado de la Salud': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Stethoscope.png',
  'Mamá y Bebé': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Baby%20Bottle.png',
  'Cuidado Personal': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lotion%20Bottle.png',
  'Belleza': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lipstick.png',
  'Vitaminas y Suplementos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Symbols/Dna.png',
  'Adulto Mayor': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Probing%20Cane.png',
  'Conveniencia': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Travel%20Places/Convenience%20Store.png',
  'Pizzas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png',
  'Pizzas Tradicionales': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png',
  'Promos 2x / Económicas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Activities/Fire.png',
  'Promociones 2x': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Activities/Fire.png',
  'Promos 2x': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Activities/Fire.png',
  'Acompañamientos / Papas Fritas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/French%20Fries.png',
  'Acompañamientos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/French%20Fries.png',
  'Palitos de Ajo / Baguettes': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Baguette%20Bread.png',
  'Palitos de Ajo': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Baguette%20Bread.png',
  'Salsas y Extras': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Canned%20Food.png',
  'Bebidas y Jugos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cup%20With%20Straw.png',
  'Postres y Dulces': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Shortcake.png',
  'Queso Extra / Mozzarella': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cheese%20Wedge.png',
  'Pepperoni / Cecinas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Bacon.png',
  'Ajo / Especias': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Garlic.png',
  'Ají / Picante': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hot%20Pepper.png',
};

export function getCategoryIcon(cat: string, config?: BusinessConfig): string {
  if (cat === 'Todos' || cat === 'Todo') return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png';
  if (config?.categoryIcons?.[cat]) return config.categoryIcons[cat];
  
  if (typeof window !== 'undefined') {
    try {
      const saved = JSON.parse(localStorage.getItem('category_icons_v1') || '{}');
      if (saved[cat]) return saved[cat];
    } catch(e) {}
  }

  if (CATEGORY_ICONS[cat]) return CATEGORY_ICONS[cat];

  const lower = cat.toLowerCase();
  if (lower.includes('pizza')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png';
  if (lower.includes('promo') || lower.includes('2x') || lower.includes('oferta')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Activities/Fire.png';
  if (lower.includes('papas fritas') || lower.includes('acompaña') || lower.includes('fritas')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/French%20Fries.png';
  if (lower.includes('palitos') || lower.includes('baguette') || lower.includes('pan')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Baguette%20Bread.png';
  if (lower.includes('salsa') || lower.includes('extra') || lower.includes('aderezo')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Canned%20Food.png';
  if (lower.includes('jugo') || lower.includes('bebida') || lower.includes('gaseosa') || lower.includes('refresco')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cup%20With%20Straw.png';
  if (lower.includes('postre') || lower.includes('dulce') || lower.includes('torta') || lower.includes('tiramis')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Shortcake.png';
  if (lower.includes('mozzarella') || lower.includes('queso')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cheese%20Wedge.png';
  if (lower.includes('pepperoni') || lower.includes('cecina') || lower.includes('jamón') || lower.includes('jamon') || lower.includes('tocino')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Bacon.png';
  if (lower.includes('ajo') || lower.includes('especia')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Garlic.png';
  if (lower.includes('ají') || lower.includes('aji') || lower.includes('picante')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hot%20Pepper.png';
  if (lower.includes('cebolla')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Onion.png';
  if (lower.includes('champiñ') || lower.includes('champin') || lower.includes('seta') || lower.includes('hongo')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Mushroom.png';
  if (lower.includes('medicamento') || lower.includes('remedio') || lower.includes('fármaco') || lower.includes('farmaco') || lower.includes('píldora') || lower.includes('pastilla')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Pill.png';
  if (lower.includes('salud') || lower.includes('médico') || lower.includes('estetoscopio')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Stethoscope.png';
  if (lower.includes('mamá') || lower.includes('bebé') || lower.includes('bebe') || lower.includes('biberón') || lower.includes('mamadera')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Baby%20Bottle.png';
  if (lower.includes('cuidado personal') || lower.includes('loción') || lower.includes('crema')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lotion%20Bottle.png';
  if (lower.includes('belleza') || lower.includes('cosmética') || lower.includes('maquillaje') || lower.includes('labial')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lipstick.png';
  if (lower.includes('vitamina') || lower.includes('suplemento') || lower.includes('dna')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Symbols/Dna.png';
  if (lower.includes('adulto mayor') || lower.includes('bastón') || lower.includes('senior') || lower.includes('ortopedia')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Probing%20Cane.png';
  if (lower.includes('conveniencia')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Travel%20Places/Convenience%20Store.png';
  if (lower.includes('primeros auxilios') || lower.includes('curita') || lower.includes('venda')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Adhesive%20Bandage.png';
  if (lower.includes('termómetro') || lower.includes('termometro')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Travel%20Places/Thermometer.png';
  if (lower.includes('jeringa') || lower.includes('vacuna')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Syringe.png';
  if (lower.includes('dental') || lower.includes('dientes') || lower.includes('cepillo')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Toothbrush.png';
  if (lower.includes('jabón') || lower.includes('jabon')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Soap.png';

  return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Package.png';
}

export function getCategoryIconEmoji(cat: string, config?: BusinessConfig): string {
  const icon = getCategoryIcon(cat, config);
  if (icon && icon.startsWith('http')) {
    if (icon.includes('Pizza.png')) return '🍕';
    if (icon.includes('Fire.png')) return '🔥';
    if (icon.includes('French%20Fries.png')) return '🍟';
    if (icon.includes('Baguette%20Bread.png')) return '🥖';
    if (icon.includes('Canned%20Food.png')) return '🥫';
    if (icon.includes('Cup%20With%20Straw.png')) return '🥤';
    if (icon.includes('Shortcake.png')) return '🍰';
    if (icon.includes('Cheese%20Wedge.png')) return '🧀';
    if (icon.includes('Bacon.png')) return '🥓';
    if (icon.includes('Garlic.png')) return '🧄';
    if (icon.includes('Hot%20Pepper.png')) return '🌶️';
    if (icon.includes('Onion.png')) return '🧅';
    if (icon.includes('Mushroom.png')) return '🍄';
    if (icon.includes('Herb.png')) return '🌿';
    if (icon.includes('Pill.png')) return '💊';
    if (icon.includes('Stethoscope.png')) return '🩺';
    if (icon.includes('Baby%20Bottle.png') || icon.includes('Baby_Bottle')) return '🍼';
    if (icon.includes('Lotion%20Bottle.png') || icon.includes('Lotion_Bottle')) return '🧴';
    if (icon.includes('Soap.png')) return '🧼';
    if (icon.includes('Lipstick.png')) return '💄';
    if (icon.includes('Dna.png')) return '🧬';
    if (icon.includes('Probing%20Cane.png') || icon.includes('Probing_Cane')) return '🦯';
    if (icon.includes('Convenience%20Store.png') || icon.includes('Convenience_Store')) return '🏪';
    if (icon.includes('Adhesive%20Bandage.png') || icon.includes('Adhesive_Bandage')) return '🩹';
    if (icon.includes('Thermometer.png')) return '🌡️';
    if (icon.includes('Syringe.png')) return '💉';
    if (icon.includes('Toothbrush.png')) return '🪥';

    const lower = cat.toLowerCase();
    if (lower.includes('medicamento') || lower.includes('remedio') || lower.includes('fármaco') || lower.includes('farmaco') || lower.includes('píldora') || lower.includes('pastilla')) return '💊';
    if (lower.includes('salud') || lower.includes('médico') || lower.includes('estetoscopio')) return '🩺';
    if (lower.includes('mamá') || lower.includes('bebé') || lower.includes('bebe') || lower.includes('biberón') || lower.includes('mamadera')) return '🍼';
    if (lower.includes('cuidado personal') || lower.includes('loción') || lower.includes('crema')) return '🧴';
    if (lower.includes('belleza') || lower.includes('cosmética') || lower.includes('maquillaje') || lower.includes('labial')) return '💄';
    if (lower.includes('vitamina') || lower.includes('suplemento') || lower.includes('dna')) return '🧬';
    if (lower.includes('adulto mayor') || lower.includes('bastón') || lower.includes('senior') || lower.includes('ortopedia')) return '🦯';
    if (lower.includes('conveniencia')) return '🏪';
    if (lower.includes('primeros auxilios') || lower.includes('curita') || lower.includes('venda')) return '🩹';
    if (lower.includes('termómetro') || lower.includes('termometro')) return '🌡️';
    if (lower.includes('jeringa') || lower.includes('vacuna')) return '💉';
    if (lower.includes('dental') || lower.includes('dientes') || lower.includes('cepillo')) return '🪥';
    if (lower.includes('jabón') || lower.includes('jabon')) return '🧼';

    if (cat.includes('Bebida')) return '🥤';
    if (cat.includes('Abarrotes') && !cat.includes('Varios')) return '🧴';
    if (cat.includes('Lácteos')) return '🥛';
    if (cat.includes('Snacks')) return '🍿';
    if (cat.includes('Almuerzo')) return '🍳';
    if (cat.includes('Sopa')) return '🍲';
    if (cat.includes('Postre')) return '🍰';
    if (cat.includes('Fruta')) return '🍎';
    if (cat.includes('Verdura')) return '🥦';
    if (cat.includes('Seco')) return '🥜';
    if (cat.includes('Semilla') || cat.includes('Legumbre')) return '🫘';
    if (cat.includes('Huevo')) return '🥚';
    if (cat.includes('Mermelada')) return '🍯';
    if (cat.includes('Miel')) return '🐝';
    if (cat.includes('Varios')) return '📦';
    return '📦';
  }
  return icon;
}

export function CategoryIcon({ cat, config, className = "w-12 h-12 object-contain" }: { cat: string; config?: BusinessConfig; className?: string }) {
  const [hasError, setHasError] = useState(false);

  const getFallbackEmoji = (category: string): string => {
    const lower = category.toLowerCase();
    if (lower.includes('bebida')) return '🥤';
    if (lower.includes('almuerzo') || lower.includes('cocina') || lower.includes('comida') || lower.includes('hamburguesa') || lower.includes('sándwich')) return '🍔';
    if (lower.includes('sopa') || lower.includes('ramen')) return '🍲';
    if (lower.includes('postre') || lower.includes('dulce') || lower.includes('torta') || lower.includes('pastel') || lower.includes('shortcake')) return '🍰';
    if (lower.includes('lácteo') || lower.includes('leche') || lower.includes('queso')) return '🥛';
    if (lower.includes('snack') || lower.includes('papas') || lower.includes('papas fritas')) return '🍿';
    if (lower.includes('abarrote') || lower.includes('limpieza') || lower.includes('jabón')) return '🧴';
    if (lower.includes('pan') || lower.includes('medialuna') || lower.includes('factura') || lower.includes('croissant')) return '🍞';
    if (lower.includes('sushi')) return '🍣';
    if (lower.includes('fruta') || lower.includes('manzana')) return '🍎';
    if (lower.includes('verdura') || lower.includes('brócoli')) return '🥦';
    if (lower.includes('carne') || lower.includes('corte')) return '🥩';
    if (lower.includes('todos') || lower.includes('todo') || lower.includes('carrito')) return '🛒';
    
    // Expanded ones
    if (lower.includes('farmacia') || lower.includes('salud') || lower.includes('píldora') || lower.includes('medicamento')) return '💊';
    if (lower.includes('champaña') || lower.includes('vino') || lower.includes('licor') || lower.includes('botillería')) return '🍷';
    if (lower.includes('computador') || lower.includes('laptop') || lower.includes('tecnología')) return '💻';
    if (lower.includes('celular') || lower.includes('teléfono')) return '📱';
    if (lower.includes('balón') || lower.includes('fútbol') || lower.includes('deporte')) return '⚽';
    if (lower.includes('mancuerna') || lower.includes('gimnasio') || lower.includes('fitness')) return '🏋️';
    if (lower.includes('tocino') || lower.includes('fiambrería') || lower.includes('cecina')) return '🥓';
    if (lower.includes('conserva') || lower.includes('enlatado')) return '🥫';
    if (lower.includes('pescado') || lower.includes('pescadería')) return '🐟';
    if (lower.includes('camarón') || lower.includes('marisco') || lower.includes('marisquería')) return '🍤';
    if (lower.includes('condimento') || lower.includes('especias') || lower.includes('hierbas')) return '🌿';
    if (lower.includes('caliente') || lower.includes('olla')) return '🍲';
    if (lower.includes('escoba') || lower.includes('aseo')) return '🧹';
    if (lower.includes('cupcake')) return '🧁';
    if (lower.includes('cosmética') || lower.includes('belleza') || lower.includes('labial')) return '💄';
    if (lower.includes('perfumería') || lower.includes('perfume') || lower.includes('loción')) return '🧴';
    if (lower.includes('mochila') || lower.includes('útiles')) return '🎒';
    if (lower.includes('lápiz') || lower.includes('pencil')) return '✏️';
    if (lower.includes('oso') || lower.includes('juguete') || lower.includes('peluche')) return '🧸';
    if (lower.includes('rompecabezas') || lower.includes('puzzle')) return '🧩';
    if (lower.includes('dado') || lower.includes('azar') || lower.includes('juego')) return '🎲';
    if (lower.includes('caramelo') || lower.includes('dulce') || lower.includes('candy')) return '🍬';
    if (lower.includes('chocolate')) return '🍫';
    if (lower.includes('baguette')) return '🥖';
    if (lower.includes('congelado') || lower.includes('hielo')) return '🧊';
    if (lower.includes('mascota') || lower.includes('huella')) return '🐾';
    if (lower.includes('ferretería') || lower.includes('llave') || lower.includes('herramienta')) return '🔧';
    if (lower.includes('ropa') || lower.includes('polera') || lower.includes('vestuario')) return '👕';
    if (lower.includes('hogar') || lower.includes('casa')) return '🏠';
    return '📦';
  };

  const icon = getCategoryIcon(cat, config);

  if (icon && icon.startsWith('http') && !hasError) {
    return (
      <img
        src={icon}
        className={className}
        alt={cat}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    );
  }

  return <span className="select-none">{icon && icon.startsWith('http') ? getFallbackEmoji(cat) : (icon || '📦')}</span>;
}

function detectCategory(tags: string[]): Product['category'] {
  const s = tags.join(' ').toLowerCase();
  if (s.includes('bebida') || s.includes('drink') || s.includes('juice') || s.includes('water')) return 'Bebidas';
  if (s.includes('dairy') || s.includes('lacteo') || s.includes('milk') || s.includes('cheese')) return 'Lácteos';
  if (s.includes('snack') || s.includes('chip') || s.includes('cookie') || s.includes('galleta')) return 'Snacks';
  return 'Abarrotes';
}

function isBarcodeMatch(sku: string, scanCode: string): boolean {
  if (!sku || !scanCode) return false;
  
  const s1 = sku.trim().toLowerCase();
  const s2 = scanCode.trim().toLowerCase();
  
  // 1. Exact or case-insensitive match
  if (s1 === s2) return true;
  
  // 2. Sanitized alphanumeric match (removing all spaces, dashes, etc.)
  const san1 = s1.replace(/[^a-z0-9]/g, '');
  const san2 = s2.replace(/[^a-z0-9]/g, '');
  if (san1 === san2) return true;
  
  // 3. Match ignoring leading zeros (for numeric codes)
  if (/^\d+$/.test(san1) && /^\d+$/.test(san2)) {
    if (san1.replace(/^0+/, '') === san2.replace(/^0+/, '')) {
      return true;
    }
  }
  
  return false;
}

function generateStockPDF(title: string, items: Product[], tipo: 'bajo' | 'agotado') {
  const fecha = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  const color = tipo === 'bajo' ? '#D97706' : '#DC2626';
  const filas = items.map(p => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;font-weight:600">${p.name}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;color:#6366f1;font-weight:700">${p.sku}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;color:${color}">${p.stock} uds</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600">$${p.cost.toFixed(2)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;color:#6366f1">$${p.price.toFixed(2)}</td>
    </tr>`).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;padding:32px;color:#1e293b;max-width:800px;margin:0 auto}
    h1{color:${color};font-size:22px;margin-bottom:4px}.sub{color:#64748b;font-size:13px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse}
    th{background:${color};color:white;padding:10px 8px;text-align:left;font-size:12px;text-transform:uppercase}
    tr:nth-child(even){background:#f8fafc}
    .badge{display:inline-block;background:${color}22;color:${color};padding:2px 10px;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:16px}
    </style></head><body>
    <h1>${title}</h1><p class="sub">Generado el ${fecha}</p>
    <div class="badge">${items.length} producto${items.length !== 1 ? 's' : ''}</div>
    <table><thead><tr><th>Producto</th><th>SKU</th><th style="text-align:center">Stock</th>
    <th style="text-align:right">Costo</th><th style="text-align:right">Precio</th></tr></thead>
    <tbody>${filas}</tbody></table></body></html>`;
  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 400); }
}


export default function InventarioTab({ products, onAddProduct, onEditProduct, onDeleteProduct, config, userRole, tenantId, storeId }: InventarioTabProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  
  const invUrlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const invUrlTienda = invUrlParams?.get('tienda') || invUrlParams?.get('id_tienda') || invUrlParams?.get('modulo');
  const activeTenant = (tenantId || storeId || invUrlTienda || (config as any)?.storeKey || (config as any)?.storeId || (typeof window !== 'undefined' ? (localStorage.getItem('tenant_tienda_id') || localStorage.getItem('id_tienda')) : '') || '').toLowerCase();

  const isPizzeria = activeTenant === 'pasion-pizzas' ||
                     activeTenant === 'pasion_pizzas' ||
                     activeTenant === 'pasion' ||
                     activeTenant === 'pizzas' ||
                     activeTenant === 'pasionpizzas' ||
                     activeTenant === 'pizza' ||
                     activeTenant === 'pizzeria' ||
                     activeTenant === 'pizzería' ||
                     (config as any)?.storeKey === 'pasion-pizzas' ||
                     config?.name?.toLowerCase().includes('pasión') ||
                     config?.name?.toLowerCase().includes('pasion') ||
                     config?.name?.toLowerCase().includes('pizza');

  const isFruteriaByUrl = activeTenant === 'fruteria' || activeTenant === 'frutería' || activeTenant === 'fruteria_principe_gales';

  const isFruteria = !isPizzeria && (
                     isFruteriaByUrl ||
                     config?.name?.toLowerCase().includes('frutería') || 
                     config?.name?.toLowerCase().includes('gales') || 
                     (isModuleActive('frutería', config) && !isModuleActive('tiendaAbarrotes', config))
  );

  const isFarmacia = !isPizzeria && (
                     activeTenant === 'farmacia' || activeTenant === 'barrioseguro' || activeTenant === 'farmacia_barrio_seguro' ||
                     (config as any)?.storeKey === 'farmacia' ||
                     config?.name?.toLowerCase().includes('farmacia') ||
                     config?.name?.toLowerCase().includes('seguro')
  );

  const isArtico = !isPizzeria && !isFarmacia && (
                   activeTenant === 'artico' || activeTenant === 'artico_congelados' || activeTenant === 'congelados' ||
                   (config as any)?.storeKey === 'artico' ||
                   config?.name?.toLowerCase().includes('ártico') ||
                   config?.name?.toLowerCase().includes('artico') ||
                   config?.name?.toLowerCase().includes('congelados')
  );

  const OFFICIAL_PIZZA_CATEGORIES = [
    'Pizzas Tradicionales',
    'Promos 2x / Económicas',
    'Acompañamientos / Papas Fritas',
    'Palitos de Ajo / Baguettes',
    'Salsas y Extras',
    'Bebidas y Jugos',
    'Postres y Dulces',
    'Queso Extra / Mozzarella',
    'Pepperoni / Cecinas',
    'Ajo / Especias',
    'Ají / Picante'
  ];

  const getPizzaCategoriesList = (): string[] => {
    let list: string[] = [];
    if ((config as any)?.pizzaCategories && (config as any).pizzaCategories.length > 0) {
      list = (config as any).pizzaCategories;
    } else if (config?.productCategories && isPizzeria && config.productCategories.length > 0) {
      list = config.productCategories;
    } else if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('pizza_categories_v1') || localStorage.getItem('pasion_pizzas_categories_data');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        } catch (e) {}
      }
    }
    if (list.length === 0) {
      list = OFFICIAL_PIZZA_CATEGORIES;
    }
    return Array.from(new Set(list.map(c => c.replace(/^[^\w\sÁÉÍÓÚáéíóúÑñ/+-]+/, '').trim()).filter(Boolean)));
  };

  const OFFICIAL_FRUTERIA_CATEGORIES = [
    'Frutas',
    'Verduras',
    'Frutos Secos',
    'Semillas',
    'Huevos',
    'Mermeladas',
    'Miel',
    'Abarrotes / Varios'
  ];

  const OFFICIAL_ARTICO_CATEGORIES = [
    'Carnes y Churrascos',
    'Hamburguesas y Prefritos',
    'Congelados y Pulpas',
    'Mariscos y Pescados',
    'Refrigerados y Cecinas',
    'Kits y Huevos'
  ];

  const getArticoCategoriesList = (): string[] => {
    let list: string[] = [];
    if (config?.articoCategories && config.articoCategories.length > 0) {
      list = config.articoCategories;
    } else if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('artico_categories_data') || localStorage.getItem('artico_categories_v1');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        } catch (e) {}
      }
    }
    if (list.length === 0) {
      list = OFFICIAL_ARTICO_CATEGORIES;
    }
    return Array.from(new Set(list.map(c => c.replace(/^[^\w\sÁÉÍÓÚáéíóúÑñ]+/, '').trim()).filter(Boolean)));
  };

  const OFFICIAL_FARMACIA_CATEGORIES = [
    'Medicamentos',
    'Cuidado de la Salud',
    'Mamá y Bebé',
    'Cuidado Personal',
    'Belleza',
    'Vitaminas y Suplementos',
    'Adulto Mayor',
    'Conveniencia'
  ];

  const getFarmaciaCategoriesList = (): string[] => {
    let list: string[] = [];
    if (config?.farmaciaCategories && config.farmaciaCategories.length > 0) {
      list = config.farmaciaCategories;
    } else if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('farmacia_categories_v1');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        } catch (e) {}
      }
    }
    if (list.length === 0) {
      list = OFFICIAL_FARMACIA_CATEGORIES;
    }
    return Array.from(new Set(list.map(c => c.replace(/^[^\w\sÁÉÍÓÚáéíóúÑñ]+/, '').trim()).filter(Boolean)));
  };

  const rawProductCats = config?.productCategories || ['Bebidas', 'Abarrotes', 'Lácteos', 'Snacks'];
  const rawFruteriaCats = config?.fruteriaCategories || OFFICIAL_FRUTERIA_CATEGORIES;

  const productCats = isPizzeria
    ? getPizzaCategoriesList()
    : isArtico
      ? getArticoCategoriesList()
      : isFarmacia
        ? getFarmaciaCategoriesList()
        : isFruteria
          ? Array.from(new Set([...(config?.fruteriaCategories || []), ...OFFICIAL_FRUTERIA_CATEGORIES]))
          : Array.from(new Set([
              ...(isModuleActive('tiendaAbarrotes', config) ? rawProductCats.filter(cat => isModuleActive(cat, config)) : []),
              ...(isModuleActive('frutería', config) ? rawFruteriaCats.filter(cat => isModuleActive(cat, config)) : []),
              ...(isModuleActive('congelados', config) ? getArticoCategoriesList().filter(cat => isModuleActive(cat, config)) : []),
              ...(isModuleActive('farmacia', config) ? getFarmaciaCategoriesList().filter(cat => isModuleActive(cat, config)) : [])
            ]));

  const defaultCategory = productCats.length > 0
    ? productCats[0]
    : (isPizzeria ? 'Pizzas Tradicionales' : (isFruteria ? 'Frutas' : 'Abarrotes'));

  const [formData, setFormData] = useState<{
    sku: string;
    name: string;
    category: string;
    subcategoria?: string;
    marca?: string;
    stock: string | number;
    price: string | number;
    cost: string | number;
    precioNeto?: string | number;
    imageUrl: string;
    enOferta: boolean;
    precioOferta: string | number;
    unidadMedida?: 'unidad' | 'kg' | 'g' | 'familiar' | 'mediana' | 'personal' | 'combo_2x' | 'pack' | 'litro' | string;
  }>({
    sku: '', name: '', category: defaultCategory, subcategoria: '', marca: '',
    stock: isPizzeria ? 20 : (isFruteria ? 50 : 12),
    price: '', cost: '', precioNeto: '',
    imageUrl: isPizzeria ? PIZZA_PRESET_IMAGES[0].url : PRESET_IMAGES[0].url,
    enOferta: false, precioOferta: '',
    unidadMedida: isPizzeria ? 'unidad' : (isFruteria ? 'kg' : 'unidad')
  });
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [productFetchMsg, setProductFetchMsg] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [geminiSuggestion, setGeminiSuggestion] = useState<{ precio_sugerido: number; razon_sugerencia: string } | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const [iconUpdateTick, setIconUpdateTick] = useState(0);
  useEffect(() => {
    const handleIconsUpdated = () => setIconUpdateTick(prev => prev + 1);
    window.addEventListener('category_icons_updated', handleIconsUpdated);
    window.addEventListener('storage', handleIconsUpdated);
    return () => {
      window.removeEventListener('category_icons_updated', handleIconsUpdated);
      window.removeEventListener('storage', handleIconsUpdated);
    };
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [formData.imageUrl]);

  const compressImageFile = (file: File, maxWidth = 400, maxHeight = 400, quality = 0.75): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onerror = (err) => reject(err);
        reader.onload = (e) => {
          try {
            const img = new window.Image();
            img.onerror = (err) => reject(err);
            img.onload = () => {
              try {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                  if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                  }
                } else {
                  if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                  }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width || 300;
                canvas.height = height || 300;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  resolve(e.target?.result as string);
                  return;
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
              } catch (canvasErr) {
                reject(canvasErr);
              }
            };
            img.src = e.target?.result as string;
          } catch (readerErr) {
            reject(readerErr);
          }
        };
        reader.readAsDataURL(file);
      } catch (initErr) {
        reject(initErr);
      }
    });
  };

  // ── ESTADOS Y CLASES PARA CARGA MASIVA ──
  interface ImportProduct {
    sku: string;
    name: string;
    category: string;
    subcategoria?: string;
    stock: number;
    cost: number;
    price: number;
    precioNeto?: number;
    selected: boolean;
    marca?: string;
    imageUrl?: string;
  }

  const [showImportModal, setShowImportModal] = useState(false);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);
  const [importTab, setImportTab] = useState<'excel' | 'pdf' | 'text'>('excel');
  const [pastedText, setPastedText] = useState('');
  
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [excelRawRows, setExcelRawRows] = useState<any[][]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  
  const [mappings, setMappings] = useState({
    sku: '',
    name: '',
    category: '',
    subcategoria: '',
    stock: '',
    cost: '',
    price: '',
    precioNeto: '',
    marca: '',
    imageUrl: ''
  });

  const [candidateProducts, setCandidateProducts] = useState<ImportProduct[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'completed'>('idle');
  const [allSelected, setAllSelected] = useState(true);

  const getArtico3DPlaceholder = (subcat: string = '', name: string = ''): string => {
    const text = `${subcat} ${name}`.toLowerCase();
    
    if (text.includes('ave') || text.includes('pollo') || text.includes('pechuga') || text.includes('truto') || text.includes('ala')) {
      return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Poultry%20Leg.png';
    }
    if (text.includes('vacuno') || text.includes('lomo') || text.includes('asado') || text.includes('filete') || text.includes('churrasco') || text.includes('carne vacuno')) {
      return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cut%20of%20Meat.png';
    }
    if (text.includes('cerdo') || text.includes('panceta') || text.includes('costillar') || text.includes('chuleta') || text.includes('carne')) {
      return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Meat%20On%20Bone.png';
    }
    if (text.includes('hamburguesa') || text.includes('prefrito') || text.includes('papas') || text.includes('empanada')) {
      return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hamburger.png';
    }
    if (text.includes('pescado') || text.includes('merluza') || text.includes('salmón') || text.includes('salmon') || text.includes('reineta') || text.includes('marisco') || text.includes('camarón') || text.includes('camaron') || text.includes('chorito')) {
      return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Fish.png';
    }
    if (text.includes('pulpa') || text.includes('fruta') || text.includes('hielo') || text.includes('congelado')) {
      return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Ice.png';
    }
    if (text.includes('queso') || text.includes('cecina') || text.includes('jamón') || text.includes('jamon') || text.includes('salame') || text.includes('refrigerado')) {
      return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cheese%20Wedge.png';
    }
    if (text.includes('huevo')) {
      return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Egg.png';
    }
    if (text.includes('kit') || text.includes('caja') || text.includes('pack')) {
      return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Package.png';
    }
    return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Ice.png';
  };

  // Carga dinámica de PDF.js desde CDN para evitar cargar el bundle en runtime innecesariamente
  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: 'array' });
        
        setExcelSheets(workbook.SheetNames);
        const firstSheetName = workbook.SheetNames[0];
        setSelectedSheet(firstSheetName);
        
        processWorkbookSheet(workbook, firstSheetName);
      } catch (err) {
        console.error("Error parsing Excel:", err);
        alert("Ocurrió un error al procesar el archivo Excel. Asegúrese de que es un archivo .xlsx, .xls o .csv válido.");
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processWorkbookSheet = (workbook: XLSX.WorkBook, sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
    if (rawRows.length === 0) {
      setExcelRawRows([]);
      setExcelHeaders([]);
      return;
    }
    
    setExcelRawRows(rawRows);
    
    let headerIndex = 0;
    while (headerIndex < rawRows.length && (!rawRows[headerIndex] || rawRows[headerIndex].length === 0)) {
      headerIndex++;
    }
    
    const headers = rawRows[headerIndex] ? rawRows[headerIndex].map((h: any) => String(h || '').trim()) : [];
    setExcelHeaders(headers);
    
    const autoMappings = {
      sku: '',
      name: '',
      category: '',
      subcategoria: '',
      stock: '',
      cost: '',
      price: '',
      precioNeto: '',
      marca: '',
      imageUrl: ''
    };
    
    headers.forEach((h: string) => {
      const lh = h.toLowerCase().trim();
      if (isArtico) {
        if (lh === 'subcategoria' || lh === 'subcategoría') {
          autoMappings.subcategoria = h;
          if (!autoMappings.category) autoMappings.category = h;
        } else if (lh === 'producto' || lh === 'nombre' || lh === 'descripcion' || lh === 'descripción') {
          autoMappings.name = h;
        } else if (lh === 'con iva' || lh === 'precio con iva' || lh === 'p.venta' || lh === 'precio' || lh === 'pvp') {
          autoMappings.price = h;
        } else if (lh === 'precio neto' || lh === 'neto' || lh === 'valor neto') {
          autoMappings.precioNeto = h;
        } else if (lh === 'marca') {
          autoMappings.marca = h;
        } else if (lh === 'categoria' || lh === 'categoría') {
          autoMappings.category = h;
        } else if (/(sku|codigo|código|barras|barcode|upc|ean|id)/.test(lh)) {
          if (!autoMappings.sku) autoMappings.sku = h;
        } else if (/(stock|cantidad|cant|qty|quantity|inventario|uds|unidades|estado)/.test(lh)) {
          if (!autoMappings.stock) autoMappings.stock = h;
        } else if (/(costo|cost|compra|cost_price|precio compra|valor compra)/.test(lh)) {
          if (!autoMappings.cost) autoMappings.cost = h;
        } else if (/(imagen|url|foto|picture|img)/.test(lh)) {
          if (!autoMappings.imageUrl) autoMappings.imageUrl = h;
        }
      } else {
        if (/(sku|codigo|código|barras|barcode|upc|ean|id)/.test(lh)) {
          if (!autoMappings.sku) autoMappings.sku = h;
        } else if (/(nombre|name|producto|desc|descripcion|art|articulo|artículo|item)/.test(lh)) {
          if (!autoMappings.name) autoMappings.name = h;
        } else if (/(categoria|categoría|category|grupo|familia|tipo)/.test(lh)) {
          if (!autoMappings.category) autoMappings.category = h;
        } else if (/(stock|cantidad|cant|qty|quantity|inventario|uds|unidades)/.test(lh)) {
          if (!autoMappings.stock) autoMappings.stock = h;
        } else if (/(costo|cost|compra|cost_price|precio compra|valor compra)/.test(lh)) {
          if (!autoMappings.cost) autoMappings.cost = h;
        } else if (/(precio|price|venta|retail|precio venta|valor venta|pvp)/.test(lh)) {
          if (!autoMappings.price) autoMappings.price = h;
        }
      }
    });

    if (isArtico) {
      if (!autoMappings.name) autoMappings.name = headers.find(h => /(producto|nombre|nom|desc)/i.test(h)) || headers[1] || '';
      if (!autoMappings.category) autoMappings.category = headers.find(h => /(categoria|categoría|subcategoria|subcategoría)/i.test(h)) || headers[0] || '';
      if (!autoMappings.price) autoMappings.price = headers.find(h => /(con iva|precio|val|vent)/i.test(h)) || headers[2] || '';
      if (!autoMappings.precioNeto) autoMappings.precioNeto = headers.find(h => /(precio neto|neto)/i.test(h)) || '';
      if (!autoMappings.subcategoria) autoMappings.subcategoria = headers.find(h => /(subcategoria|subcategoría)/i.test(h)) || '';
      if (!autoMappings.marca) autoMappings.marca = headers.find(h => /(marca|brand)/i.test(h)) || '';
    } else {
      if (!autoMappings.sku) autoMappings.sku = headers.find(h => /(sku|cod)/i.test(h)) || headers[0] || '';
      if (!autoMappings.name) autoMappings.name = headers.find(h => /(nom|prod|desc)/i.test(h)) || headers[1] || '';
      if (!autoMappings.price) autoMappings.price = headers.find(h => /(prec|val|vent)/i.test(h)) || headers[2] || '';
    }
    
    setMappings(autoMappings);
    generateCandidatesFromExcel(rawRows, headerIndex + 1, autoMappings);
  };

  const generateCandidatesFromExcel = (rawRows: any[][], dataStartIdx: number, currentMappings: typeof mappings) => {
    const headers = rawRows[dataStartIdx - 1] ? rawRows[dataStartIdx - 1].map((h: any) => String(h || '').trim()) : [];
    
    const skuIdx = headers.indexOf(currentMappings.sku);
    const nameIdx = headers.indexOf(currentMappings.name);
    const categoryIdx = headers.indexOf(currentMappings.category);
    const subcatIdx = headers.indexOf(currentMappings.subcategoria);
    const stockIdx = headers.indexOf(currentMappings.stock);
    const costIdx = headers.indexOf(currentMappings.cost);
    const priceIdx = headers.indexOf(currentMappings.price);
    const precioNetoIdx = headers.indexOf(currentMappings.precioNeto);
    const marcaIdx = headers.indexOf(currentMappings.marca);
    const imageUrlIdx = headers.indexOf(currentMappings.imageUrl);
    
    const altCategoryIdx = headers.findIndex(h => /(categoria|categoría)/i.test(h));

    const candidates: ImportProduct[] = [];
    
    for (let i = dataStartIdx; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.length === 0) continue;
      
      const rawSku = skuIdx !== -1 ? String(row[skuIdx] ?? '').trim() : '';
      const rawName = nameIdx !== -1 ? String(row[nameIdx] ?? '').trim() : '';
      let rawCategory = categoryIdx !== -1 ? String(row[categoryIdx] ?? '').trim() : '';
      const rawSubcat = subcatIdx !== -1 ? String(row[subcatIdx] ?? '').trim() : '';
      const rawAltCategory = altCategoryIdx !== -1 && altCategoryIdx !== categoryIdx ? String(row[altCategoryIdx] ?? '').trim() : '';
      
      const rawStockVal = stockIdx !== -1 ? row[stockIdx] : undefined;
      const rawCostVal = costIdx !== -1 ? row[costIdx] : undefined;
      const rawPriceVal = priceIdx !== -1 ? row[priceIdx] : undefined;
      const rawNetoVal = precioNetoIdx !== -1 ? row[precioNetoIdx] : undefined;
      const rawMarca = marcaIdx !== -1 ? String(row[marcaIdx] ?? '').trim() : '';
      const rawImageUrl = imageUrlIdx !== -1 ? String(row[imageUrlIdx] ?? '').trim() : '';
      
      if (!rawSku && !rawName) continue;
      
      const finalSku = rawSku || 'SKU-' + Math.floor(1000 + Math.random() * 9000);
      const finalName = rawName || 'Producto sin Nombre';
      
      // Smart AGOTADO check
      const combinedCatStr = `${rawCategory} ${rawSubcat} ${rawAltCategory}`.toUpperCase();
      let isAgotado = combinedCatStr.includes('AGOTADO');
      if (typeof rawStockVal === 'string' && rawStockVal.toUpperCase().includes('AGOTADO')) {
        isAgotado = true;
      }

      let stock = 10;
      if (isAgotado) {
        stock = 0;
      } else if (rawStockVal !== undefined && rawStockVal !== null && rawStockVal !== '') {
        const parsedStock = Number(rawStockVal);
        if (!isNaN(parsedStock)) {
          stock = parsedStock;
        }
      }

      // Clean "AGOTADO" text from category
      let cleanRawCat = rawCategory.replace(/AGOTADO/gi, '').replace(/[-/]/g, '').trim();
      if (!cleanRawCat && rawSubcat) {
        cleanRawCat = rawSubcat.replace(/AGOTADO/gi, '').replace(/[-/]/g, '').trim();
      }
      if (!cleanRawCat && rawAltCategory) {
        cleanRawCat = rawAltCategory.replace(/AGOTADO/gi, '').replace(/[-/]/g, '').trim();
      }

      let finalCategory = defaultCategory;
      if (cleanRawCat) {
        const cleanSelected = cleanRawCat.toLowerCase();
        const matchedCat = productCats.find(c => {
          const cClean = c.replace(/^[^\w\sÁÉÍÓÚáéíóúÑñ]+/, '').trim().toLowerCase();
          return cClean === cleanSelected || c.toLowerCase() === cleanSelected;
        });
        if (matchedCat) {
          finalCategory = matchedCat;
        } else {
          const partialCat = productCats.find(c => {
            const cClean = c.replace(/^[^\w\sÁÉÍÓÚáéíóúÑñ]+/, '').trim().toLowerCase();
            return cClean.includes(cleanSelected) || cleanSelected.includes(cClean);
          });
          finalCategory = partialCat || cleanRawCat || defaultCategory;
        }
      } else {
        const detected = detectCategory([finalName]);
        const matchedDetected = productCats.find(c => c.toLowerCase() === detected.toLowerCase());
        finalCategory = matchedDetected || defaultCategory;
      }
      
      // Parse CLP price & cost sanitization
      const parseClpVal = (val: any): number => {
        if (val === null || val === undefined) return NaN;
        if (typeof val === 'number') return isNaN(val) ? NaN : Math.round(val);
        const str = String(val).trim();
        if (!str) return NaN;
        const cleaned = str.replace(/[$\s.]/g, '').replace(',', '.');
        const num = parseFloat(cleaned);
        return isNaN(num) ? NaN : Math.round(num);
      };

      const parsedPrice = parseClpVal(rawPriceVal);
      const parsedNeto = parseClpVal(rawNetoVal);

      let price = isNaN(parsedPrice) ? 0 : parsedPrice;
      let precioNeto = isNaN(parsedNeto) ? 0 : parsedNeto;

      if (price === 0 && precioNeto > 0) {
        price = Math.round(precioNeto * 1.19);
      } else if (precioNeto === 0 && price > 0) {
        precioNeto = Math.round(price / 1.19);
      }

      const parsedCost = parseClpVal(rawCostVal);
      const cost = isNaN(parsedCost) ? (precioNeto > 0 ? Math.round(precioNeto * 0.7) : (price > 0 ? Math.round(price * 0.6) : 0)) : parsedCost;
      
      let imageToUse = rawImageUrl;
      if (!imageToUse || !imageToUse.startsWith('http')) {
        imageToUse = isArtico ? getArtico3DPlaceholder(finalCategory, finalName) : PRESET_IMAGES[0].url;
      }

      candidates.push({
        sku: finalSku,
        name: finalName,
        category: finalCategory,
        subcategoria: rawSubcat || undefined,
        stock: stock,
        cost: cost,
        price: price,
        precioNeto: precioNeto || undefined,
        marca: rawMarca,
        imageUrl: imageToUse,
        selected: true
      });
    }
    
    setCandidateProducts(candidates);
    setAllSelected(true);
  };

  const handleMappingChange = (field: keyof typeof mappings, val: string) => {
    const updated = { ...mappings, [field]: val };
    setMappings(updated);
    
    let headerIndex = 0;
    while (headerIndex < excelRawRows.length && (!excelRawRows[headerIndex] || excelRawRows[headerIndex].length === 0)) {
      headerIndex++;
    }
    generateCandidatesFromExcel(excelRawRows, headerIndex + 1, updated);
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;
        
        const pdfjsLib = await loadPdfJs();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        parseTextLines(fullText);
      } catch (err) {
        console.error("Error parsing PDF:", err);
        alert("No se pudo extraer texto de este archivo PDF. Verifique que no sea una imagen escaneada sin OCR o intente copiar y pegar el texto en la pestaña de Texto Plano.");
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseTextLines = (text: string) => {
    const lines = text.split('\n');
    const parsed: ImportProduct[] = [];
    
    lines.forEach(line => {
      const clean = line.trim();
      if (!clean || clean.length < 5) return;
      
      if (/(total|subtotal|factura|fecha|proveedor|cliente|rut|iva|pagina|página|impuesto|remisión|guia|guía)/i.test(clean)) return;
      if (/^(código|sku|nombre|producto|descripción|precio|costo|cant|stock)/i.test(clean)) return;

      const tokens = clean.split(/\s+/);
      if (tokens.length < 2) return;

      let stock = 10;
      let cost = 0;
      let price = 0;
      let nameTokens = [...tokens];
      
      const numericValues: number[] = [];
      const numericIndices: number[] = [];
      
      for (let i = tokens.length - 1; i >= 0; i--) {
        const rawToken = tokens[i];
        const cleanedToken = rawToken.replace(/[$\s,.]/g, '');
        if (/^\d+$/.test(cleanedToken)) {
          const valStr = rawToken.replace(/[^\d.]/g, '').replace(',', '.');
          const val = parseFloat(valStr);
          if (!isNaN(val)) {
            numericValues.push(val);
            numericIndices.push(i);
          }
          if (numericValues.length >= 3) break;
        }
      }

      if (numericValues.length >= 3) {
        price = numericValues[0];
        cost = numericValues[1];
        stock = numericValues[2];
        nameTokens = tokens.slice(0, Math.min(...numericIndices));
      } else if (numericValues.length === 2) {
        price = numericValues[0];
        cost = numericValues[1];
        stock = 10;
        nameTokens = tokens.slice(0, Math.min(...numericIndices));
      } else if (numericValues.length === 1) {
        price = numericValues[0];
        cost = Math.round(price * 0.7);
        stock = 10;
        nameTokens = tokens.slice(0, Math.min(...numericIndices));
      }

      let sku = '';
      if (nameTokens.length > 1) {
        const firstToken = nameTokens[0];
        if (/^\d+$/.test(firstToken) || (firstToken.length >= 4 && /[0-9]/.test(firstToken))) {
          sku = firstToken;
          nameTokens.shift();
        } else {
          sku = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
        }
      } else {
        sku = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
      }

      const name = nameTokens.join(' ').trim();
      
      if (name && name.length > 2) {
        parsed.push({
          sku,
          name,
          category: detectCategory([name]),
          stock,
          cost,
          price,
          selected: true
        });
      }
    });

    if (parsed.length > 0) {
      setCandidateProducts(parsed);
      setAllSelected(true);
    } else {
      alert("No se pudieron extraer productos del archivo o texto. Asegúrese de que el formato coincida con una lista de productos.");
    }
  };

  const handleProcessPastedText = () => {
    if (!pastedText.trim()) return;
    
    const lines = pastedText.split('\n');
    const parsed: ImportProduct[] = [];
    
    lines.forEach(line => {
      const clean = line.trim();
      if (!clean) return;
      
      let delimiter = ',';
      if (clean.includes('\t')) {
        delimiter = '\t';
      } else if (clean.includes(';')) {
        delimiter = ';';
      }
      
      const parts = clean.split(delimiter).map(p => p.trim());
      
      if (parts.length >= 2) {
        let sku = parts[0];
        let name = parts[1];
        let category = parts[2] || '';
        let stock = parseFloat(parts[3] || '10');
        let cost = parseFloat(parts[4] || '0');
        let price = parseFloat(parts[5] || '0');
        
        if (parts.length === 2) {
          name = parts[0];
          price = parseFloat(parts[1]) || 0;
          sku = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
          category = detectCategory([name]);
          stock = 10;
          cost = Math.round(price * 0.7);
        } else if (parts.length === 3) {
          sku = parts[0];
          name = parts[1];
          price = parseFloat(parts[2]) || 0;
          category = detectCategory([name]);
          stock = 10;
          cost = Math.round(price * 0.7);
        } else if (parts.length === 4) {
          sku = parts[0];
          name = parts[1];
          category = parts[2];
          price = parseFloat(parts[3]) || 0;
          stock = 10;
          cost = Math.round(price * 0.7);
        } else if (parts.length === 5) {
          sku = parts[0];
          name = parts[1];
          category = parts[2];
          stock = parseFloat(parts[3]) || 10;
          price = parseFloat(parts[4]) || 0;
          cost = Math.round(price * 0.7);
        }
        
        const matchedCat = productCats.find(c => c.toLowerCase() === category.toLowerCase());
        const finalCategory = matchedCat || detectCategory([name]);
        
        if (name && name.length > 1) {
          parsed.push({
            sku: sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
            name: name,
            category: finalCategory,
            stock: isNaN(stock) ? 10 : stock,
            cost: isNaN(cost) ? 0 : cost,
            price: isNaN(price) ? 0 : price,
            selected: true
          });
        }
      }
    });
    
    if (parsed.length > 0) {
      setCandidateProducts(prev => [...prev, ...parsed]);
      setAllSelected(true);
      setPastedText('');
      alert(`Se procesaron ${parsed.length} productos con éxito y se agregaron a la vista previa.`);
    } else {
      parseTextLines(pastedText);
    }
  };

  const handleToggleCandidate = (index: number) => {
    setCandidateProducts(prev => {
      const next = [...prev];
      next[index].selected = !next[index].selected;
      return next;
    });
  };

  const handleUpdateCandidateField = (index: number, field: keyof ImportProduct, val: any) => {
    setCandidateProducts(prev => {
      const next = [...prev];
      const item = { ...next[index], [field]: val };
      if (field === 'precioNeto') {
        const numNeto = Number(val);
        if (!isNaN(numNeto) && numNeto >= 0) {
          item.price = Math.round(numNeto * 1.19);
        }
      } else if (field === 'price') {
        const numPrice = Number(val);
        if (!isNaN(numPrice) && numPrice >= 0) {
          item.precioNeto = Math.round(numPrice / 1.19);
        }
      }
      next[index] = item;
      return next;
    });
  };

  const handleRemoveCandidate = (index: number) => {
    setCandidateProducts(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleAllCandidates = () => {
    const nextVal = !allSelected;
    setAllSelected(nextVal);
    setCandidateProducts(prev => prev.map(p => ({ ...p, selected: nextVal })));
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    handleResetImport();
  };

  const handleExecuteImport = async () => {
    const active = candidateProducts.filter(p => p.selected);
    if (active.length === 0) {
      alert("Por favor, seleccione al menos un producto para importar.");
      return;
    }

    setImportStatus('importing');
    setImportProgress({ current: 0, total: active.length });

    try {
      const storeName = config?.name || (isArtico ? 'Ártico Congelados' : 'Tienda Virtual');
      const newlyAddedProducts: Product[] = [];

      // Process items in chunks for rapid UI feedback and non-blocking execution
      const BATCH_SIZE = 10;
      let processedCount = 0;

      for (let i = 0; i < active.length; i += BATCH_SIZE) {
        const chunk = active.slice(i, i + BATCH_SIZE);
        await Promise.all(chunk.map(async (item) => {
          const cleanName = item.name.trim().toLowerCase();
          const cleanSku = item.sku.trim().toLowerCase();

          const existingProduct = products.find(p => 
            (p.name && p.name.trim().toLowerCase() === cleanName) ||
            (p.sku && p.sku.trim().toLowerCase() === cleanSku)
          );
          
          const imageToUse = item.imageUrl && item.imageUrl.trim().length > 0
            ? item.imageUrl.trim()
            : (existingProduct?.imageUrl || (isArtico ? getArtico3DPlaceholder(item.category, item.name) : PRESET_IMAGES[0].url));

          const subcat = item.subcategoria?.trim() || existingProduct?.subcategoria?.trim() || '';
          const submarca = item.marca?.trim() || existingProduct?.marca?.trim() || '';
          const pNeto = Number(item.precioNeto) || (item.price ? Math.round(Number(item.price) / 1.19) : 0);

          const toAdd: any = {
            ...(existingProduct ? { id: existingProduct.id } : {}),
            sku: item.sku.trim(),
            name: item.name.trim(),
            category: item.category,
            stock: Number(item.stock) >= 0 ? Number(item.stock) : 0,
            cost: Number(item.cost) || 0,
            price: Number(item.price) || 0,
            imageUrl: imageToUse,
            store: isFruteria ? 'fruteria' : (isArtico ? 'artico' : 'turco')
          };
          if (subcat) toAdd.subcategoria = subcat;
          if (submarca) toAdd.marca = submarca;
          if (pNeto) toAdd.precioNeto = pNeto;

          await onAddProduct(toAdd);
          newlyAddedProducts.push({
            id: toAdd.id || ('SKU-' + item.sku.trim()),
            ...toAdd
          } as Product);
        }));

        processedCount += chunk.length;
        setImportProgress({ current: Math.min(processedCount, active.length), total: active.length });
      }

      // Persist directly into local storage keys for instant zero-latency UI re-render
      try {
        const cachedExisting = localStorage.getItem('artico_inventory') || localStorage.getItem('APP_PRODUCTS_DATA');
        let currentArr: any[] = [];
        if (cachedExisting) {
          try { currentArr = JSON.parse(cachedExisting); } catch (e) {}
        }
        if (!Array.isArray(currentArr)) currentArr = [];

        const mergedMap = new Map();
        [...currentArr, ...products, ...newlyAddedProducts].forEach(p => {
          if (p && p.id) mergedMap.set(p.id, p);
          else if (p && p.sku) mergedMap.set(p.sku, p);
        });
        const mergedList = Array.from(mergedMap.values());

        safeLocalStorageSetItem('artico_inventory', JSON.stringify(mergedList));
        safeLocalStorageSetItem('APP_PRODUCTS_DATA', JSON.stringify(mergedList));
        safeLocalStorageSetItem('FRUTERIA_DATA', JSON.stringify(mergedList));
      } catch (e) {
        console.warn('LocalStorage bulk sync error:', e);
      }

      // 1. Success notification Toast
      const successMessage = `¡${active.length} productos cargados con éxito en ${storeName}!`;
      setSuccessNotification(successMessage);
      setTimeout(() => setSuccessNotification(null), 7000);

      // 2. Clean internal preview state and reset form
      handleResetImport();

      // 3. EXPLICITLY CLOSE MODAL
      setShowImportModal(false);

    } catch (err) {
      console.error("Error doing bulk import:", err);
      alert("Hubo un error durante la carga de productos.");
      setImportStatus('idle');
      setImportProgress(null);
    }
  };

  const handleResetImport = () => {
    setCandidateProducts([]);
    setExcelSheets([]);
    setSelectedSheet('');
    setExcelRawRows([]);
    setExcelHeaders([]);
    setImportStatus('idle');
    setImportProgress(null);
    setAllSelected(true);
  };

  const fetchGeminiPriceSuggestion = async (name: string, barcode: string) => {
    if (!name.trim() && !barcode.trim()) return;
    setLoadingSuggestion(true);
    setSuggestionError(null);
    setGeminiSuggestion(null);
    try {
      const res = await fetch("/api/gemini/suggest-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, barcode }),
      });
      
      const rawText = await res.text();
      
      if (!res.ok) {
        let errData;
        try {
          errData = JSON.parse(rawText);
        } catch (e: any) {
          errData = { error: `Error del servidor (${res.status}): ${rawText.substring(0, 100)}` };
        }
        throw new Error(errData.error || "Error al obtener la sugerencia");
      }

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr: any) {
        console.error("ERROR CRÍTICO: Falló la decodificación de la respuesta JSON del backend para la sugerencia de precio de Gemini.", {
          rawText,
          errorMessage: parseErr.message,
          errorStack: parseErr.stack
        });
        data = {
          precio_sugerido: 1200,
          razon_sugerencia: "Precio de emergencia (falló respuesta JSON)."
        };
      }
      
      setGeminiSuggestion(data);
    } catch (err: any) {
      console.warn("Advertencia en fetchGeminiPriceSuggestion:", err.message);
      
      let friendlyMessage = err.message;
      if (err.message.includes("RESOURCE_EXHAUSTED") || err.message.toLowerCase().includes("quota") || err.message.toLowerCase().includes("exceeded") || err.message.includes("429")) {
        friendlyMessage = "Límite de cuota gratuita de la IA excedido (Gemini). Intenta de nuevo más tarde o usa precio manual.";
      } else if (err.message.includes("API_KEY") || err.message.toLowerCase().includes("key")) {
        friendlyMessage = "Servicio de IA no disponible (API Key no configurada o inválida).";
      } else {
        friendlyMessage = `Sugerencia temporalmente no disponible: ${err.message}`;
      }
      
      setSuggestionError(friendlyMessage);
      
      setGeminiSuggestion({
        precio_sugerido: 1200,
        razon_sugerencia: "Precio de emergencia por defecto debido a indisponibilidad de la IA."
      });
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const lookupBarcode = useCallback(async (barcode: string) => {
    setFormData(prev => ({ ...prev, sku: barcode }));
    setFetchingProduct(true);
    setProductFetchMsg('🔍 Buscando en inventario local...');
    setGeminiSuggestion(null);
    setSuggestionError(null);

    // Nivel 1: Buscar primero en nuestra colección de Firestore local (productos ya cargados en memoria)
    const localMatch = products.find(p => isBarcodeMatch(p.sku, barcode));
    if (localMatch) {
      setFormData({
        sku: localMatch.sku,
        name: localMatch.name,
        category: localMatch.category,
        stock: localMatch.stock,
        price: localMatch.price,
        cost: localMatch.cost,
        imageUrl: localMatch.imageUrl || PRESET_IMAGES[0].url
      });
      setProductFetchMsg(`✅ Encontrado en inventario local: ${localMatch.name}`);
      setFetchingProduct(false);
      return;
    }

    // Nivel EXCLUSIVO FARMACIA: Búsqueda en API pública de Farmacia, Salud y Cuidado Personal
    const isPharmacy = isPharmacyApp(config, invUrlTienda);
    if (isPharmacy) {
      setProductFetchMsg('💊 Consultando catálogo público de Farmacia, Salud & Cuidado Personal...');
      try {
        const pharmRes = await fetchPharmacyBarcodeProduct(barcode, true);
        if (pharmRes.found && pharmRes.name) {
          setFormData(prev => ({
            ...prev,
            sku: barcode,
            name: pharmRes.name,
            imageUrl: pharmRes.imageUrl || prev.imageUrl,
            category: pharmRes.category || prev.category,
            marca: pharmRes.brand || prev.marca || '',
            subcategoria: pharmRes.specifications || pharmRes.description || prev.subcategoria || ''
          }));
          setProductFetchMsg(`✅ Producto de Farmacia autocompletado: "${pharmRes.name}"`);
          setFetchingProduct(false);
          fetchGeminiPriceSuggestion(pharmRes.name, barcode);
          return;
        }
      } catch (pharmErr) {
        console.warn('Fallo no bloqueante en catálogo de Farmacia:', pharmErr);
      }
    }

    let found = false;
    let pName = '';
    let pImg = '';
    let pCat: Product['category'] = 'Abarrotes';

    // Nivel 2 (Primera API Pública): Consulta a Open Food Facts con un timeout estricto de 2 segundos
    setProductFetchMsg('🔍 Consultando Open Food Facts...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && (data.status === 'success' || data.status === 1 || data.product)) {
          const p = data.product;
          if (p) {
            pName = p.product_name_es || p.product_name || p.product_name_en || '';
            pImg = p.image_front_url || p.image_url || '';
            pCat = detectCategory(p.categories_tags || p.categories_hierarchy || []);
            found = !!pName;
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('Nivel 2: Open Food Facts lookup timed out (2s)');
      } else {
        console.warn('Nivel 2: Open Food Facts lookup failed:', err);
      }
    }

    // Nivel 3 (Segunda API Pública): Si falla la anterior, consulta a BigProductData o BarcodeLookup (con 2s timeout)
    if (!found) {
      setProductFetchMsg('🔍 Consultando BigProductData / BarcodeLookup...');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const res = await fetch(`https://api.barcodelookup.com/v3/products?barcode=${barcode}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.products && data.products.length > 0) {
            const prod = data.products[0];
            pName = prod.title || prod.product_name || '';
            pImg = prod.images?.[0] || '';
            if (prod.category) {
              pCat = detectCategory([prod.category]);
            }
            found = !!pName;
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn('Nivel 3: BarcodeLookup timed out (2s)');
        } else {
          console.warn('Nivel 3: BarcodeLookup failed:', err);
        }

        // Intento secundario con BigProductData u otro endpoint
        try {
          const controller2 = new AbortController();
          const timeoutId2 = setTimeout(() => controller2.abort(), 2000);
          const res2 = await fetch(`https://bigproductdata.com/api/v1/product/${barcode}`, {
            signal: controller2.signal
          });
          clearTimeout(timeoutId2);
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2 && data2.title) {
              pName = data2.title;
              pCat = detectCategory([data2.category || '']);
              pImg = data2.image || '';
              found = true;
            }
          }
        } catch (err2: any) {
          if (err2.name === 'AbortError') {
            console.warn('Nivel 3: BigProductData timed out (2s)');
          } else {
            console.warn('Nivel 3: BigProductData failed:', err2);
          }
        }
      }
    }

    // Nivel 4 (Gemini Flash Real): Si ninguna API tradicional encuentra el producto, dispara la llamada a Gemini 3.5 Flash de forma correcta
    if (!found) {
      setProductFetchMsg('✨ Activando modo asistido por IA con Gemini...');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos de timeout para el fallback de Gemini

        const res = await fetch("/api/gemini/ai-assisted-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ barcode }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        let data;
        const rawText = await res.text();
        
        if (!res.ok) {
          console.warn("Advertencia de escaneo asistido por IA (el backend retornó error):", rawText);
          data = {
            nombre_estimado: `Producto nuevo (${barcode})`,
            categoria_estimada: "Abarrotes" as Product['category'],
            precio_sugerido: 1200,
            razon_sugerencia: "Escaneo asistido no disponible (límite de cuota o error temporal de IA)."
          };
        } else {
          try {
            data = JSON.parse(rawText);
          } catch (jsonErr: any) {
            console.error("ERROR CRÍTICO: Falló el parseo de la respuesta JSON de escaneo asistido en backend.", {
              rawText,
              errorMessage: jsonErr.message,
              errorStack: jsonErr.stack
            });
            data = {
              nombre_estimado: `Producto nuevo (${barcode})`,
              categoria_estimada: "Abarrotes" as Product['category'],
              precio_sugerido: 1200,
              razon_sugerencia: "Precio de emergencia (falló respuesta JSON de escaneo asistido)."
            };
          }
        }

        if (data && data.nombre_estimado) {
          pName = data.nombre_estimado;
          pCat = data.categoria_estimada || 'Abarrotes';
          
          setFormData(prev => ({
            ...prev,
            sku: barcode,
            name: pName,
            category: pCat,
            price: data.precio_sugerido || ''
          }));

          setGeminiSuggestion({
            precio_sugerido: data.precio_sugerido,
            razon_sugerencia: data.razon_sugerencia
          });

          setProductFetchMsg(`✨ IA: Completado como "${pName}"`);
          found = true;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn('Nivel 4: Gemini assisted scan timed out (2s)');
        } else {
          console.warn('Nivel 4: Gemini assisted scan failed:', err);
        }
        
        // Final fallback en caso de error de red o timeout total
        pName = `Producto nuevo (${barcode})`;
        pCat = 'Abarrotes';
        setFormData(prev => ({
          ...prev,
          sku: barcode,
          name: pName,
          category: pCat,
          price: 1200
        }));
        setGeminiSuggestion({
          precio_sugerido: 1200,
          razon_sugerencia: "Precio estimado para abarrotes base en Chile."
        });
        setProductFetchMsg(`✨ IA (Local): Completado como "${pName}"`);
        found = true;
      }
    }

    // Paso final: Carga y actualización de inputs si fue encontrado por APIs de Nivel 2 o 3
    if (found) {
      if (!geminiSuggestion && pName) {
        // Encontrado por Open Food Facts, actualiza el formulario y busca precio sugerido en segundo plano
        setFormData(prev => ({
          ...prev,
          sku: barcode,
          name: pName,
          imageUrl: pImg || prev.imageUrl,
          category: pCat
        }));
        setProductFetchMsg(`✅ Encontrado: ${pName}`);
        fetchGeminiPriceSuggestion(pName, barcode);
      }
    } else {
      // Si la IA tampoco pudo determinarlo por timeout total de red, se permite el ingreso manual sin popup bloqueante
      setProductFetchMsg('⚠️ No encontrado. Por favor, ingresa los detalles de forma manual.');
    }

    setFetchingProduct(false);
  }, [products, detectCategory, fetchGeminiPriceSuggestion, geminiSuggestion]);

  const activeProducts = products.filter(product => {
    const catRaw = product.category || '';
    if (isPizzeria) return true;
    if (isFarmacia) return isFarmaciaModuleActive(catRaw, config);
    return isModuleActive(catRaw, config);
  });

  const totalStock = activeProducts.reduce((acc, p) => acc + p.stock, 0);
  const lowStockItems = activeProducts.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStockItems = activeProducts.filter(p => p.stock === 0);

  const filteredProducts = activeProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const catRaw = product.category || '';
    const cleanSelected = selectedCategory.replace(/^[^\w\sÁÉÍÓÚáéíóúÑñ/+-]+/, '').trim().toLowerCase();
    const cleanCatRaw = catRaw.replace(/^[^\w\sÁÉÍÓÚáéíóúÑñ/+-]+/, '').trim().toLowerCase();

    const matchesCat = selectedCategory === 'Todos' ||
      selectedCategory === 'Todo' ||
      catRaw === selectedCategory ||
      cleanCatRaw === cleanSelected;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = useCallback(() => {
    setEditingItem(null);
    setProductFetchMsg('');
    setGeminiSuggestion(null);
    setSuggestionError(null);
    setFormData({
      sku: 'SKU-' + Math.floor(100 + Math.random() * 900),
      name: '', category: defaultCategory, subcategoria: '', marca: '',
      stock: isPizzeria ? 20 : (isFruteria ? 50 : 12),
      price: '', cost: '',
      precioNeto: '',
      imageUrl: isPizzeria ? PIZZA_PRESET_IMAGES[0].url : PRESET_IMAGES[0].url,
      enOferta: false,
      precioOferta: '',
      unidadMedida: isPizzeria ? 'unidad' : (isFruteria ? 'kg' : 'unidad')
    });
    setShowAddModal(true);
  }, [defaultCategory, isFruteria, isPizzeria]);

  const handleOpenEdit = useCallback((product: Product) => {
    setEditingItem(product);
    setProductFetchMsg('');
    setGeminiSuggestion(null);
    setSuggestionError(null);
    const initPrice = product.price !== undefined && product.price !== null ? String(product.price) : '';
    const initNeto = product.precioNeto !== undefined && product.precioNeto !== null
      ? String(product.precioNeto)
      : (product.price ? String(Math.round(Number(product.price) / 1.19)) : '');

    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      subcategoria: product.subcategoria || '',
      marca: product.marca || '',
      stock: product.stock,
      price: initPrice,
      cost: product.cost,
      precioNeto: initNeto,
      imageUrl: product.imageUrl || (isPizzeria ? PIZZA_PRESET_IMAGES[0].url : PRESET_IMAGES[0].url),
      enOferta: product.enOferta || false,
      precioOferta: product.precioOferta !== undefined && product.precioOferta !== null ? String(product.precioOferta) : '',
      unidadMedida: product.unidadMedida || (isPizzeria ? 'unidad' : 'unidad')
    });
    setShowAddModal(true);
  }, [isPizzeria]);

  /* ── SISTEMA DE ENRUTAMIENTO DE ESCANEO DE CODIGO DE BARRAS (REGLA 6) ── */
  const handleBarcodeScanResult = useCallback((barcode: string) => {
    setShowScanner(false);
    
    // Buscar en el Firestore existente si el código ya existe con coincidencia robusta
    const foundProduct = products.find(
      p => isBarcodeMatch(p.sku, barcode)
    );

    if (foundProduct) {
      if (userRole !== 'admin') {
        // En modo cajero/lectura, solo filtramos y mostramos el producto en la lista
        setSearch(foundProduct.sku);
      } else {
        // Si existe: mostrar los datos del producto encontrado (abrir modal de edición)
        handleOpenEdit(foundProduct);
      }
    } else {
      if (userRole !== 'admin') {
        alert(`El producto con código ${barcode} no se encuentra registrado en el sistema.`);
      } else {
        // Si no existe: abrir formulario para agregar nuevo producto con el código pre-llenado
        setEditingItem(null);
        setProductFetchMsg('Buscando detalles del producto...');
        setFormData({
          sku: barcode,
          name: '',
          category: defaultCategory,
          stock: isPizzeria ? 20 : 12,
          price: '',
          cost: '',
          imageUrl: isPizzeria ? PIZZA_PRESET_IMAGES[0].url : PRESET_IMAGES[0].url,
          enOferta: false,
          precioOferta: '',
          unidadMedida: isPizzeria ? 'unidad' : (isFruteria ? 'kg' : 'unidad')
        });
        setShowAddModal(true);
        // Auto-buscar detalles desde bases de datos externas Open Food Facts / UPCitemdb
        lookupBarcode(barcode);
      }
    }
  }, [products, handleOpenEdit, lookupBarcode, defaultCategory, userRole, isPizzeria, isFruteria]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Por favor ingresa el nombre del producto.');
      return;
    }
    if (formData.enOferta) {
      const pOferta = parseFloat(String(formData.precioOferta));
      if (isNaN(pOferta) || pOferta <= 0) {
        alert('Por favor ingresa un precio de oferta válido y mayor a cero.');
        return;
      }
    }
    setLoading(true);
    try {
      const isFrut = isFruteria || getModuleForCategory(formData.category || defaultCategory) === 'frutería';
      const parsedPrice = parseFloat(String(formData.price)) || 0;
      const parsedNeto = parseFloat(String(formData.precioNeto)) || (parsedPrice ? Math.round(parsedPrice / 1.19) : 0);

      const parsedData: any = {
        sku: formData.sku || '',
        name: formData.name || '',
        category: formData.category || defaultCategory,
        stock: (isFrut && (formData.unidadMedida === 'kg' || formData.unidadMedida === 'g')) ? (parseFloat(String(formData.stock)) || 0) : (parseInt(String(formData.stock), 10) || 0),
        price: parsedPrice,
        precioNeto: parsedNeto,
        cost: parseFloat(String(formData.cost)) || 0,
        imageUrl: formData.imageUrl || (isPizzeria ? PIZZA_PRESET_IMAGES[0].url : PRESET_IMAGES[0].url),
        enOferta: formData.enOferta ? true : false,
        esOferta: formData.enOferta ? true : false,
        precioOferta: formData.enOferta ? (parseFloat(String(formData.precioOferta)) || null) : null,
        unidadMedida: formData.unidadMedida || (isPizzeria ? 'unidad' : (isFrut ? 'kg' : 'unidad')),
        store: isPizzeria ? 'pasion-pizzas' : (isFruteria ? 'fruteria' : (isArtico ? 'artico' : (isFarmacia ? 'barrioseguro' : 'turco'))),
        module: isPizzeria ? 'pizzeria' : (isFruteria ? 'fruteria' : (isFarmacia ? 'farmacia' : 'tiendaAbarrotes'))
      };
      if (formData.subcategoria?.trim()) parsedData.subcategoria = formData.subcategoria.trim();
      if (formData.marca?.trim()) parsedData.marca = formData.marca.trim();
      if (editingItem) {
        await onEditProduct({ ...editingItem, ...parsedData, updatedAt: new Date().toISOString() });
      } else {
        await onAddProduct(parsedData);
      }
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert('Error al guardar el producto: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id?: string) => {
    const targetId = id || editingItem?.id;
    if (!targetId) return;
    setLoading(true);
    try {
      setShowAddModal(false);
      setEditingItem(null);
      await onDeleteProduct(targetId);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el producto: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setImageError(false);

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error("El archivo seleccionado no es una imagen válida.");
      }

      // Safe client compression to max 400x400 to prevent Base64 memory bloat
      const compressedBase64 = await compressImageFile(file, 400, 400, 0.75);

      if (compressedBase64 && compressedBase64.length < 500000) {
        setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
      } else {
        const fallback = isArtico
          ? getArtico3DPlaceholder(formData.category, formData.name)
          : getCategoryPlaceholder(formData.category);
        setFormData(prev => ({ ...prev, imageUrl: fallback }));
      }
    } catch (err: any) {
      console.warn("Error seguro al procesar imagen cargada:", err);
      const fallback = isArtico
        ? getArtico3DPlaceholder(formData.category, formData.name)
        : getCategoryPlaceholder(formData.category);
      setFormData(prev => ({ ...prev, imageUrl: fallback }));
      setImageError(true);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const categories = ['Todos', ...productCats];

  return (
    <div className="space-y-5 pb-24">

      {/* ── NOTIFICACIÓN EXÍTOSA ── */}
      {successNotification && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center justify-between shadow-xl border-2 border-emerald-400 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5] text-emerald-100" />
            <span>{successNotification}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessNotification(null)} 
            className="text-white hover:bg-emerald-700 p-1.5 rounded-xl font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── STATS ── */}
      <section className="grid grid-cols-3 gap-3 mt-1">
        <div className="bg-slate-950 p-4 rounded-2xl shadow-md flex flex-col gap-1 border-2 border-slate-900">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Uds</span>
          <span className="text-3xl font-black text-white">{totalStock.toLocaleString()}</span>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-700 stroke-[2.5]" />
              <span className="text-xs font-black text-amber-805 uppercase tracking-wide">Bajo</span>
            </div>
            {lowStockItems.length > 0 && (
              <button type="button" onClick={() => generateStockPDF('⚠️ Bajo Stock', lowStockItems, 'bajo')} className="text-amber-600 hover:text-amber-900 transition-colors cursor-pointer bg-white p-1 rounded-lg border border-amber-200 shadow-2xs">
                <FileDown className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            )}
          </div>
          <span className="text-2xl font-black text-amber-700">{lowStockItems.length}</span>
        </div>
        <div className="bg-rose-50 p-4 rounded-2xl border-2 border-rose-300 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-rose-700 stroke-[2.5]" />
              <span className="text-xs font-black text-rose-805 uppercase tracking-wide">Agot.</span>
            </div>
            {outOfStockItems.length > 0 && (
              <button type="button" onClick={() => generateStockPDF('🔴 Agotados', outOfStockItems, 'agotado')} className="text-rose-600 hover:text-rose-900 transition-colors cursor-pointer bg-white p-1 rounded-lg border border-rose-200 shadow-2xs">
                <FileDown className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            )}
          </div>
          <span className="text-2xl font-black text-rose-700">{outOfStockItems.length}</span>
        </div>
      </section>

      {/* ── CARGA MASIVA BANNER ── */}
      {userRole === 'admin' && (
        <button
          type="button"
          onClick={() => {
            handleResetImport();
            setShowImportModal(true);
          }}
          className="w-full flex items-center justify-between p-3.5 bg-emerald-550/5 hover:bg-emerald-550/10 border-2 border-dashed border-emerald-300 rounded-2xl transition-all hover:scale-[1.01] active:scale-99 cursor-pointer group text-left shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5.5 h-5.5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800">Carga Masiva de Productos</h4>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5 leading-tight">Importa inventario desde archivos de Excel, PDF o texto plano.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* ── BÚSQUEDA CON BOTÓN DE ESCÁNER DE BARRAS DIRECTO (REGLA 6) ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 stroke-[2.5]" />
          <input
            className="w-full pl-11 pr-10 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all text-base placeholder:text-slate-500 font-extrabold shadow-sm text-slate-950"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 text-xl font-black cursor-pointer bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center">×</button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md border-2 border-emerald-500 active:scale-95 text-xs font-black gap-1.5"
          title="Scanner de Código de Barras"
        >
          <ScanBarcode className="w-5 h-5 stroke-[2.5]" />
          <span className="hidden sm:inline">Escanear</span>
        </button>
      </div>

      {/* ── CATEGORÍAS ── */}
      <div className="flex gap-3 overflow-x-auto -mx-3 px-3 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`flex flex-col items-center gap-1.5 px-6 py-3.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105 border-2 border-emerald-555'
                : 'bg-white text-slate-800 shadow-sm border-2 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-3xl flex items-center justify-center w-12 h-12">
              <CategoryIcon cat={cat} config={config} className="w-12 h-12 object-contain" />
            </span>
            <span className="font-black">{cat}</span>
          </button>
        ))}
      </div>

      {/* ── LISTA DE PRODUCTOS ── */}
      <section className="flex flex-col gap-4">
        {filteredProducts.map((p) => {
          const isOutOfStock = p.stock === 0;
          const isLowStock = p.stock > 0 && p.stock <= 5;
          const marginPercent = p.price > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) : 0;
          return (
            <div
              key={p.id}
              onClick={userRole === 'admin' ? () => handleOpenEdit(p) : undefined}
              className={`bg-white rounded-2xl overflow-hidden border-2 transition-all flex flex-col shadow-sm ${
                userRole !== 'admin' ? 'cursor-default' : 'cursor-pointer active:border-emerald-500 hover:shadow-md'
              } ${
                isOutOfStock ? 'border-slate-200 opacity-75 bg-slate-50' : isLowStock ? 'border-amber-400 ring-2 ring-amber-400/10' : 'border-slate-200'
              }`}
            >
              <div className="relative h-44 w-full bg-slate-100 shrink-0">
                <img
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-2.5 bg-white transition-transform duration-500 hover:scale-[1.01]"
                  src={p.imageUrl || getCategoryPlaceholder(p.category)}
                  onError={(e) => handleImageError(e, p.category)}
                  referrerPolicy="no-referrer"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-rose-600 text-white font-black text-xs uppercase px-4 py-1.5 rounded-full tracking-wider shadow-sm">
                      Agotado
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-lg">
                    <span className="inline-flex items-center gap-1">
                      <CategoryIcon cat={p.category} config={config} className="w-5 h-5 object-contain" />
                    </span> {p.category}
                  </span>
                  {userRole === 'admin' && (
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${marginPercent >= 30 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                      +{marginPercent}% margen
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-xl leading-tight truncate">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-extrabold tracking-wide mt-1 font-mono">SKU: {p.sku}</p>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-205">
                  <span className={`text-xs font-black px-3.5 py-2 rounded-xl border ${
                    isOutOfStock ? 'bg-rose-50 text-rose-700 border-rose-200' : isLowStock ? 'bg-amber-50 text-amber-700 border-amber-305' : 'bg-slate-50 text-slate-800 border-slate-250'
                  }`}>
                    {isLowStock && '⚠️ '}{p.stock} {getUnidadLabel(p.unidadMedida)}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Precio</span>
                    <span className="text-2xl font-black text-emerald-600">${p.price.toLocaleString('es-CL')} CLP{getUnidadShortSuffix(p.unidadMedida)}</span>
                  </div>
                </div>

                {userRole === 'admin' && (
                  <div className="flex justify-between text-xs text-slate-800 font-extrabold bg-slate-100 p-3.5 rounded-2xl mt-1 border-2 border-slate-200">
                    <span>Costo: ${p.cost.toFixed(2)}</span>
                    <span className="text-emerald-750 font-black">Ganancia: ${(p.price - p.cost).toFixed(2)}{getUnidadShortSuffix(p.unidadMedida)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <PackageOpen className="w-16 h-16 stroke-1 text-gray-300" />
            <p className="text-lg font-bold text-gray-500">Ningún producto encontrado</p>
          </div>
        )}
      </section>

      {/* ── FAB ── */}
      {userRole === 'admin' && (
        <button
          type="button"
          onClick={handleOpenAdd}
          className="fixed bottom-20 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-700 active:scale-95 hover:shadow-xl transition-all z-40 hover:rotate-90 duration-300 cursor-pointer"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}

      {/* ── MÁSCARA ESCÁNER CON PORTAL NATIVO ── */}
      {typeof document !== 'undefined' && createPortal(
        <BarcodeScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onBarcodeDetected={handleBarcodeScanResult}
        />,
        document.body
      )}

      {/* ── MODAL NUEVO/EDITAR PRODUCTO ── */}
      {showAddModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-white flex flex-col overflow-hidden md:max-w-md md:left-1/2 md:-translate-x-1/2 md:shadow-2xl md:border-x md:border-gray-100" style={{ zIndex: 9999 }}>

          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-white shrink-0">
            <h3 className="text-lg font-extrabold text-gray-950">
              {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <button type="button" onClick={() => setShowAddModal(false)}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cuerpo con Scroll */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-32">

            {/* Imagen */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Imagen del Producto</label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-300 shrink-0 bg-slate-50 relative flex items-center justify-center">
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                  {imageError || !formData.imageUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-2 text-center select-none">
                      <PackageOpen className="w-8 h-8 text-slate-350" />
                      <span className="text-[9px] font-bold text-slate-400 mt-1 leading-none">Sin Imagen</span>
                    </div>
                  ) : (
                    <img
                      src={formData.imageUrl}
                      className="w-full h-full object-contain p-1 bg-white"
                      alt="preview"
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="flex items-center justify-center gap-2 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 font-black text-xs py-2.5 px-3 rounded-xl cursor-pointer hover:bg-emerald-100/60 transition-colors">
                    <Image className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                    <span>Subir desde Galería</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleGalleryImage} />
                  </label>
                  <label className="flex items-center justify-center gap-2 bg-slate-100 border-2 border-slate-300 text-slate-700 font-black text-xs py-2.5 px-3 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                    <Camera className="w-4 h-4 text-slate-650 stroke-[2.5]" />
                    <span>Tomar Foto</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleGalleryImage} />
                  </label>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto py-1.5">
                {(isPizzeria ? PIZZA_PRESET_IMAGES : PRESET_IMAGES).map((img, i) => (
                  <button key={i} type="button" onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${formData.imageUrl === img.url ? 'ring-2 ring-emerald-500 scale-105 border-emerald-600' : 'border-slate-200 opacity-60'}`}>
                    <img src={img.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">O pegar URL de Imagen Externa</label>
                {(() => {
                  const activePresetList = isPizzeria ? PIZZA_PRESET_IMAGES : PRESET_IMAGES;
                  const isPresetUrl = activePresetList.some(img => img.url === formData.imageUrl);
                  const isBase64Url = formData.imageUrl?.startsWith('data:');
                  const displayUrl = (isPresetUrl || isBase64Url) ? '' : formData.imageUrl;
                  return (
                    <>
                      <input
                        type="text"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white outline-none font-bold text-slate-900"
                        value={displayUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                      {displayUrl && (imageError || !/\.(jpg|jpeg|png|webp|gif|svg|bmp)/i.test(displayUrl)) && (
                        <div className="p-3 bg-amber-50/85 border border-amber-200/80 rounded-2xl text-[11px] text-amber-800 font-medium leading-relaxed mt-2 animate-in fade-in duration-250">
                          <div className="flex gap-1.5 items-start">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-extrabold text-amber-900 block mb-0.5">La imagen no se cargó correctamente</strong>
                              La URL ingresada parece ser una página web o un enlace protegido. Para cargar la imagen con éxito:
                              <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-950 font-semibold">
                                <li>Busca el producto en Google o en tu proveedor.</li>
                                <li>Haz <strong>clic derecho</strong> (o mantén pulsado en celular) sobre la imagen del producto.</li>
                                <li>Selecciona <strong>"Copiar dirección de imagen"</strong>.</li>
                                <li>Pega ese enlace aquí (debe terminar en <code className="bg-amber-100 px-1 py-0.2 rounded text-rose-700 font-mono text-[9px] font-bold">.jpg</code>, <code className="bg-amber-100 px-1 py-0.2 rounded text-rose-700 font-mono text-[9px] font-bold">.png</code> o <code className="bg-amber-100 px-1 py-0.2 rounded text-rose-700 font-mono text-[9px] font-bold">.webp</code>).</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">Nombre *</label>
              <input type="text" placeholder="Ej. Coca Cola 3L"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white outline-none font-bold text-slate-950"
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">SKU / Código de Barras *</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Escanea o escribe SKU..."
                  className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none font-bold outline-hidden"
                  value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                <button type="button" onClick={() => lookupBarcode(formData.sku)}
                  disabled={!formData.sku?.trim() || fetchingProduct}
                  title="Consultar catálogo de código de barras"
                  className="bg-indigo-600 text-white px-3.5 rounded-2xl flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shrink-0 cursor-pointer border border-indigo-500 shadow-md font-black text-xs gap-1 disabled:opacity-50">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Buscar</span>
                </button>
                <button type="button" onClick={() => setShowScanner(true)}
                  className="bg-emerald-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all shrink-0 cursor-pointer border border-emerald-500 shadow-md">
                  <ScanBarcode className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
              {fetchingProduct && <p className="text-xs text-emerald-600 font-bold animate-pulse">🔍 Buscando en catálogos de farmacia y productos...</p>}
              {productFetchMsg && (
                <p className={`text-xs font-bold ${productFetchMsg.startsWith('✅') ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {productFetchMsg}
                </p>
              )}
            </div>

            {/* Categoría y Subcategoría (Si es Ártico) */}
            <div className={`grid ${isArtico ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">Categoría *</label>
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0 p-1.5 shadow-xs">
                    <CategoryIcon cat={formData.category} config={config} className="w-9 h-9 object-contain" />
                  </div>
                  <select name="category" className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3.5 text-sm outline-none font-bold text-slate-950 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white cursor-pointer"
                    value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    {Array.from(new Set([...productCats, ...(formData.category ? [formData.category] : [])])).map(cat => (
                      <option key={cat} value={cat}>
                        {getCategoryIconEmoji(cat, config)} {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isArtico && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">Subcategoría</label>
                  <input
                    type="text"
                    placeholder="Ej. Pollo, Vacuno, Pulpas..."
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3.5 text-sm outline-none font-bold text-slate-950 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white"
                    value={formData.subcategoria || ''}
                    onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* MARCA / LABORATORIO */}
            {(isArtico || isFarmacia) && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">
                  {isFarmacia ? 'Laboratorio / Marca' : 'Marca / Fabricante'}
                </label>
                <input
                  type="text"
                  placeholder={isFarmacia ? "Ej. Laboratorio Chile, Bayer, Mintlab, Nivea..." : "Ej. ÁRTICO CONGELADOS, SUPER BEEF..."}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-sm outline-none font-bold text-slate-950 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white"
                  value={formData.marca || ''}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                />
              </div>
            )}

            {/* ESPECIFICACIONES / DESCRIPCIÓN (Solo en Farmacia) */}
            {isFarmacia && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">
                  Especificaciones / Presentación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Paracetamol 500mg - Caja 16 Comprimidos"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-sm outline-none font-bold text-slate-950 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white"
                  value={formData.subcategoria || ''}
                  onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                />
              </div>
            )}

            {/* Unidad de Venta Dinámica según Tienda */}
            {isPizzeria ? (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">Unidad de Venta *</label>
                <select className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3.5 text-sm outline-none font-bold text-slate-950 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white cursor-pointer"
                  value={formData.unidadMedida || 'unidad'} 
                  onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value as any })}>
                  <optgroup label="🍕 Formatos y Porciones Gastronómicas">
                    <option value="unidad">Por Unidad / Porción</option>
                    <option value="familiar">Familiar (8 Cortes)</option>
                    <option value="mediana">Mediana (6 Cortes)</option>
                    <option value="personal">Personal (4 Cortes)</option>
                    <option value="combo_2x">Combo / Promoción 2x</option>
                    <option value="pack">Caja / Pack</option>
                  </optgroup>
                  <optgroup label="🥤 Líquidos y Bebidas">
                    <option value="litro">Por Litro (L)</option>
                  </optgroup>
                  <optgroup label="⚖️ Insumos y Cocina">
                    <option value="g">Por Gramos (g)</option>
                    <option value="kg">Por Kilo (Kg)</option>
                  </optgroup>
                </select>
              </div>
            ) : ((getModuleForCategory(formData.category || defaultCategory) === 'frutería' || isFruteria || (formData.category || '').toLowerCase().includes('frut') || (formData.category || '').toLowerCase().includes('verdur')) && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">Unidad de Venta *</label>
                <select className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3.5 text-sm outline-none font-bold text-slate-950 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white cursor-pointer"
                  value={formData.unidadMedida || 'unidad'} 
                  onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value as any })}>
                  <optgroup label="Granel y Unidades Libre">
                    <option value="unidad">Por Unidad</option>
                    <option value="kg">Por Kilo (Kg)</option>
                    <option value="g">Por Gramos (g)</option>
                  </optgroup>
                  <optgroup label="Sacos (Volumen Cerrado)">
                    <option value="saco_5kg">Saco 5 Kg</option>
                    <option value="saco_10kg">Saco 10 Kg</option>
                    <option value="saco_25kg">Saco 25 Kg</option>
                  </optgroup>
                  <optgroup label="Mallas (Empaque Cerrado)">
                    <option value="malla_3u">Malla 3 Unidades</option>
                    <option value="malla_4u">Malla 4 Unidades</option>
                    <option value="malla_5u">Malla 5 Unidades</option>
                    <option value="malla_6u">Malla 6 Unidades</option>
                  </optgroup>
                </select>
              </div>
            ))}

            {/* Precios y Stock (Separación entre Ártico y Comercio General) */}
            {isArtico ? (
              <div className="space-y-3 p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  💵 Precios y Stock (Ártico)
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                      Precio Neto ($)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Sin IVA"
                      className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-3 text-sm text-center outline-none font-extrabold text-slate-900 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600"
                      value={formData.precioNeto || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const numNeto = parseFloat(val);
                        if (!isNaN(numNeto) && numNeto >= 0) {
                          setFormData(prev => ({
                            ...prev,
                            precioNeto: val,
                            price: String(Math.round(numNeto * 1.19))
                          }));
                        } else {
                          setFormData(prev => ({ ...prev, precioNeto: val }));
                        }
                      }}
                    />
                    <span className="text-[10px] text-slate-500 font-bold block text-center">Sin IVA (+19%)</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-emerald-800 uppercase tracking-wider block">
                      Precio Con IVA ($) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Precio Final Venta"
                      className="w-full bg-white border-2 border-emerald-400 rounded-xl px-3 py-3 text-sm text-center outline-none font-black text-emerald-800 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600"
                      value={formData.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        const numConIva = parseFloat(val);
                        if (!isNaN(numConIva) && numConIva >= 0) {
                          setFormData(prev => ({
                            ...prev,
                            price: val,
                            precioNeto: String(Math.round(numConIva / 1.19))
                          }));
                        } else {
                          setFormData(prev => ({ ...prev, price: val }));
                        }
                      }}
                    />
                    <span className="text-[10px] text-emerald-600 font-black block text-center">Venta Final</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                      Costo Compra ($)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Costo"
                      className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2.5 text-xs text-center outline-none font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                      Stock Inicial
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Unidades"
                      className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2.5 text-xs text-center outline-none font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Stock', key: 'stock', type: 'number', step: getModuleForCategory(formData.category || defaultCategory) === 'frutería' ? '0.001' : '1' },
                  { label: 'Costo ($)', key: 'cost', type: 'number', step: '0.01' },
                  { label: 'Precio ($)', key: 'price', type: 'number', step: '0.01' },
                ].map(({ label, key, type, step }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">{label}</label>
                     <input type={type} step={step} min="0"
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-2 py-3.5 text-sm text-center outline-none font-bold text-slate-950 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white"
                       value={(formData as any)[key]}
                       onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
            )}

            {/* Sección Ofertas / Remates */}
            <div className="p-3.5 bg-rose-50/70 border-2 border-rose-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide flex items-center gap-1.5">
                    🔥 Oferta / Remate Especial
                  </h4>
                  <p className="text-[10px] font-bold text-rose-500 mt-0.5">
                    Activa un precio de oferta promocional para este producto.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.enOferta}
                    onChange={(e) => setFormData({ ...formData, enOferta: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-rose-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {formData.enOferta && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                  <label className="text-xs font-black text-rose-950 uppercase tracking-wider block">
                    Precio de Oferta ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="Ej. 1490"
                    className="w-full bg-white border-2 border-rose-300 rounded-2xl px-3 py-3 text-sm outline-none font-bold text-rose-950 focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500"
                    value={formData.precioOferta}
                    onChange={(e) => setFormData({ ...formData, precioOferta: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Sugerencia de Precio Gemini */}
            <div className="mt-2 p-3 bg-indigo-50/70 border-2 border-indigo-200/80 rounded-2xl space-y-2 animate-in fade-in duration-250">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-indigo-850 uppercase tracking-wider flex items-center gap-1.5">
                  ✨ Sugerencia de Precio IA (Chile)
                </span>
                <button
                  type="button"
                  onClick={() => fetchGeminiPriceSuggestion(formData.name, formData.sku)}
                  disabled={loadingSuggestion || (!formData.name.trim() && !formData.sku.trim())}
                  className="text-[10px] font-black text-indigo-700 hover:text-indigo-905 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border-2 border-indigo-100 active:scale-95 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingSuggestion ? 'animate-spin' : ''}`} />
                  {geminiSuggestion ? 'Recalcular' : 'Consultar'}
                </button>
              </div>

              {loadingSuggestion && (
                <div className="py-1.5 flex items-center gap-2 text-xs text-indigo-700 font-bold animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analizando mercado con Gemini...</span>
                </div>
              )}

              {suggestionError && (
                <div className="text-xs text-rose-600 font-bold p-1">
                  ❌ {suggestionError}
                </div>
              )}

              {geminiSuggestion && (
                <div className="space-y-1.5 animate-in fade-in duration-250">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-indigo-100">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="text-lg font-black text-slate-950">${geminiSuggestion.precio_sugerido.toLocaleString('es-CL')} CLP</span>
                      <p className="text-[11px] text-slate-550 font-bold leading-normal mt-0.5">{geminiSuggestion.razon_sugerencia}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, price: geminiSuggestion.precio_sugerido })}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black px-3.5 py-2 rounded-xl transition-colors shrink-0 shadow-sm shadow-indigo-500/10 active:scale-95 cursor-pointer border border-indigo-500"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              )}

              {!loadingSuggestion && !suggestionError && !geminiSuggestion && (
                <p className="text-[10px] text-indigo-550 font-bold leading-normal">
                  {formData.name.trim() 
                    ? 'Haz clic en "Consultar" para analizar precios recomendados para este producto.' 
                    : 'Ingresa el nombre del producto para habilitar la sugerencia con IA.'}
                </p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="p-4 bg-slate-100 border-t-2 border-slate-200 flex gap-3 shrink-0 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            {editingItem && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteProduct(editingItem.id);
                }}
                disabled={loading}
                className="flex-1 bg-white text-rose-600 border-2 border-rose-205 hover:bg-rose-50 py-3.5 rounded-2xl text-sm font-black active:scale-95 transition-all outline-none disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                🗑️ Eliminar
              </button>
            )}
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 bg-emerald-600 text-white font-black py-4 px-5 rounded-2xl text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 outline-none shadow-md cursor-pointer border border-emerald-500 flex items-center justify-center">
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
              ) : editingItem ? (
                '💾 Guardar Cambios'
              ) : (
                '✅ Agregar Producto'
              )}
            </button>
          </div>

        </div>,
        document.body
      )}

      {/* ── PORTAL PARA CARGA MASIVA DE PRODUCTOS ── */}
      {showImportModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 font-sans animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <UploadCloud className="w-5.5 h-5.5 text-emerald-600 stroke-[2.5]" />
                  Carga Masiva de Inventario
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Sube tu listado en Excel, PDF o Texto plano para agregar productos rápidamente.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseImportModal}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {importStatus === 'idle' ? (
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                  
                  {/* Left Column: Input Source Config */}
                  <div className="w-full md:w-80 border-r border-slate-100 p-5 flex flex-col gap-4 bg-slate-50/30 overflow-y-auto shrink-0">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">1. Origen del Archivo</h4>
                    
                    {/* Source Tab Selector */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setImportTab('excel')}
                        className={`py-2 text-[11px] font-extrabold rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${importTab === 'excel' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Excel
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportTab('pdf')}
                        className={`py-2 text-[11px] font-extrabold rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${importTab === 'pdf' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportTab('text')}
                        className={`py-2 text-[11px] font-extrabold rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${importTab === 'text' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        <Clipboard className="w-4 h-4" />
                        Texto
                      </button>
                    </div>

                    {/* Source tab inputs */}
                    {importTab === 'excel' && (
                      <div className="flex flex-col gap-4">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/10 p-6 rounded-2xl cursor-pointer transition-all text-center">
                          <FileSpreadsheet className="w-8 h-8 text-emerald-600 mb-2" />
                          <span className="text-xs font-bold text-slate-700">Seleccionar Excel/CSV</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Soporta .xlsx, .xls, .csv</span>
                          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelFileChange} className="hidden" />
                        </label>

                        {/* Sheet Selection if multiple */}
                        {excelSheets.length > 1 && (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-500">Hoja de cálculo:</span>
                            <select
                              value={selectedSheet}
                              onChange={(e) => {
                                setSelectedSheet(e.target.value);
                                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                if (fileInput && fileInput.files?.[0]) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    const data = evt.target?.result;
                                    if (data) {
                                      const workbook = XLSX.read(data, { type: 'array' });
                                      processWorkbookSheet(workbook, e.target.value);
                                    }
                                  };
                                  reader.readAsArrayBuffer(fileInput.files[0]);
                                }
                              }}
                              className="w-full text-xs font-bold bg-white border border-slate-200 p-2.5 rounded-xl outline-none text-slate-700"
                            >
                              {excelSheets.map(sheet => <option key={sheet} value={sheet}>{sheet}</option>)}
                            </select>
                          </div>
                        )}

                        {/* Mappings selection */}
                        {excelHeaders.length > 0 && (
                          <div className="flex flex-col gap-2.5 bg-slate-100/50 p-3 rounded-2xl border border-slate-100">
                            <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Mapeo de Columnas</h5>
                            
                            {(isArtico ? (['sku', 'name', 'category', 'subcategoria', 'marca', 'stock', 'cost', 'precioNeto', 'price'] as const) : (['sku', 'name', 'category', 'stock', 'cost', 'price'] as const)).map((field) => (
                              <div key={field} className="flex flex-col gap-0.5">
                                <label className="text-[10px] font-bold text-slate-600 capitalize">
                                  {field === 'marca' ? 'Marca / Fabricante' : field === 'subcategoria' ? 'Subcategoría' : field === 'precioNeto' ? 'Precio Neto ($)' : field === 'sku' ? 'Código / SKU *' : field === 'name' ? 'Nombre Producto *' : field === 'category' ? 'Categoría' : field === 'stock' ? 'Stock Inicial' : field === 'cost' ? 'Costo Compra' : 'Precio con IVA (Venta) *'}
                                </label>
                                <select
                                  value={mappings[field as keyof typeof mappings] || ''}
                                  onChange={(e) => handleMappingChange(field as keyof typeof mappings, e.target.value)}
                                  className="w-full text-xs font-bold bg-white border border-slate-200 px-2 py-1.5 rounded-lg outline-none text-slate-700"
                                >
                                  <option value="">-- Omitir / Auto --</option>
                                  {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {importTab === 'pdf' && (
                      <div className="flex flex-col gap-4">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/10 p-6 rounded-2xl cursor-pointer transition-all text-center">
                          <FileText className="w-8 h-8 text-rose-500 mb-2" />
                          <span className="text-xs font-bold text-slate-700">Seleccionar Factura PDF</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Soporta PDF con formato texto</span>
                          <input type="file" accept=".pdf" onChange={handlePdfFileChange} className="hidden" />
                        </label>
                        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800 font-medium leading-relaxed">
                          <strong>💡 Tip:</strong> El lector intentará identificar automáticamente el código de barras, descripción, precio unitario y cantidad del documento.
                        </div>
                      </div>
                    )}

                    {importTab === 'text' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-500">Pegar Texto / CSV / TSV:</span>
                          <textarea
                            rows={8}
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="SKU-123, Detergente Liquido, Abarrotes, 15, 3200, 4500&#10;SKU-124, Bebida Cola 3L, Bebidas, 24, 1800, 2500"
                            className="w-full text-xs font-mono border border-slate-200 p-2.5 rounded-xl outline-none resize-none bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleProcessPastedText}
                          className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-900 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Procesar Texto
                        </button>
                        <div className="p-3 bg-slate-100 rounded-2xl text-[10px] text-slate-500 font-medium leading-normal">
                          <strong>Formato admitido:</strong><br />
                          Una línea por producto.<br />
                          Separado por coma o tabulador:<br />
                          <code className="bg-white px-1 py-0.5 rounded text-rose-600 font-mono text-[9px]">SKU, Nombre, Categoría, Stock, Costo, Precio</code>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Preview Table with candidates */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">2. Vista Previa de Productos</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {candidateProducts.length} encontrados
                        </span>
                      </div>
                      
                      {candidateProducts.length > 0 && (
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={handleToggleAllCandidates}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                            />
                            Seleccionar Todos
                          </label>
                          <button
                            type="button"
                            onClick={handleResetImport}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Limpiar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Table or Empty State */}
                    <div className="flex-1 overflow-auto p-4">
                      {isProcessingFile ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
                          <p className="text-xs font-bold">Procesando archivo, por favor espere...</p>
                        </div>
                      ) : candidateProducts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 max-w-sm mx-auto text-center py-12">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-2xs">
                            <Clipboard className="w-8 h-8 stroke-[1.5]" />
                          </div>
                          <h5 className="text-sm font-extrabold text-slate-700">Sin datos que mostrar</h5>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Carga un archivo Excel, PDF o escribe/pega texto estructurado en el panel izquierdo para generar el listado preliminar.
                          </p>
                        </div>
                      ) : (
                        <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100/75 text-slate-600 font-extrabold border-b border-slate-150">
                                <th className="p-3 w-10 text-center">Sel.</th>
                                <th className="p-3 w-28">Código / SKU</th>
                                <th className="p-3">Nombre del Producto</th>
                                {isArtico && <th className="p-3 w-28">Marca</th>}
                                <th className="p-3 w-28">Categoría</th>
                                {isArtico && <th className="p-3 w-28">Subcategoría</th>}
                                <th className="p-3 w-16 text-right">Stock</th>
                                {isArtico && <th className="p-3 w-20 text-right">P. Neto</th>}
                                <th className="p-3 w-20 text-right">{isArtico ? 'Con IVA' : 'Precio'}</th>
                                <th className="p-3 w-10 text-center">Acción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {candidateProducts.map((p, idx) => (
                                <tr key={idx} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${!p.selected ? 'opacity-55' : ''}`}>
                                  <td className="p-2.5 text-center">
                                    <input
                                      type="checkbox"
                                      checked={p.selected}
                                      onChange={() => handleToggleCandidate(idx)}
                                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4.5 h-4.5 cursor-pointer"
                                    />
                                  </td>
                                  <td className="p-2.5">
                                    <input
                                      type="text"
                                      value={p.sku}
                                      onChange={(e) => handleUpdateCandidateField(idx, 'sku', e.target.value)}
                                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-150 px-2 py-1.5 rounded-lg outline-none font-mono text-[11px] text-indigo-700 font-black"
                                    />
                                  </td>
                                  <td className="p-2.5">
                                    <input
                                      type="text"
                                      value={p.name}
                                      onChange={(e) => handleUpdateCandidateField(idx, 'name', e.target.value)}
                                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-150 px-2 py-1.5 rounded-lg outline-none font-extrabold text-slate-800"
                                    />
                                  </td>
                                  {isArtico && (
                                    <td className="p-2.5">
                                      <input
                                        type="text"
                                        placeholder="Marca"
                                        value={p.marca || ''}
                                        onChange={(e) => handleUpdateCandidateField(idx, 'marca', e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-150 px-1.5 py-1.5 rounded-lg outline-none font-bold text-indigo-800 text-[11px]"
                                      />
                                    </td>
                                  )}
                                  <td className="p-2.5">
                                    <select
                                      value={p.category}
                                      onChange={(e) => handleUpdateCandidateField(idx, 'category', e.target.value)}
                                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-150 px-1 py-1.5 rounded-lg outline-none font-bold text-slate-700"
                                    >
                                      {productCats.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                      ))}
                                    </select>
                                  </td>
                                  {isArtico && (
                                    <td className="p-2.5">
                                      <input
                                        type="text"
                                        placeholder="Subcat."
                                        value={p.subcategoria || ''}
                                        onChange={(e) => handleUpdateCandidateField(idx, 'subcategoria', e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-150 px-1.5 py-1.5 rounded-lg outline-none font-bold text-slate-700 text-[11px]"
                                      />
                                    </td>
                                  )}
                                  <td className="p-2.5">
                                    <input
                                      type="number"
                                      value={p.stock}
                                      onChange={(e) => handleUpdateCandidateField(idx, 'stock', parseFloat(e.target.value) || 0)}
                                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-150 px-1.5 py-1.5 rounded-lg outline-none text-right font-black"
                                    />
                                  </td>
                                  {isArtico && (
                                    <td className="p-2.5">
                                      <input
                                        type="number"
                                        placeholder="Neto"
                                        value={p.precioNeto || ''}
                                        onChange={(e) => handleUpdateCandidateField(idx, 'precioNeto', parseFloat(e.target.value) || 0)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-150 px-1.5 py-1.5 rounded-lg outline-none text-right font-bold text-slate-700"
                                      />
                                    </td>
                                  )}
                                  <td className="p-2.5">
                                    <input
                                      type="number"
                                      value={p.price}
                                      onChange={(e) => handleUpdateCandidateField(idx, 'price', parseFloat(e.target.value) || 0)}
                                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-150 px-1.5 py-1.5 rounded-lg outline-none text-right font-black text-emerald-800"
                                    />
                                  </td>
                                  <td className="p-2.5 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCandidate(idx)}
                                      className="w-7 h-7 rounded-full hover:bg-rose-50 text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : importStatus === 'importing' ? (
                /* Importing Progress Screen */
                <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-5 text-emerald-600 animate-bounce">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-black text-slate-800">Cargando Inventario Masivamente</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">Por favor no cierres esta pestaña. Estamos registrando y sincronizando tus productos en el servidor.</p>
                  
                  {importProgress && (
                    <div className="w-full mt-6">
                      <div className="flex justify-between text-xs font-black text-slate-600 mb-2">
                        <span>Progreso total:</span>
                        <span>{importProgress.current} de {importProgress.total} ({Math.round((importProgress.current / importProgress.total) * 100)}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Completed Screen */
                <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-sm mx-auto text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5 shadow-sm animate-pulse">
                    <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                  </div>
                  <h4 className="text-base font-black text-slate-800">¡Importación Exitosa!</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    Se han registrado y guardado con éxito todos los productos seleccionados en la tienda virtual de forma masiva.
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleCloseImportModal}
                    className="mt-6 w-full bg-emerald-600 text-white font-black py-3.5 rounded-2xl text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-md cursor-pointer border border-emerald-500"
                  >
                    Entendido, Volver al Inventario
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {importStatus === 'idle' && (
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center shrink-0">
                <span className="text-xs font-bold text-slate-600">
                  {candidateProducts.filter(p => p.selected).length} productos listos para importar.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseImportModal}
                    className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-extrabold px-4.5 py-2.5 rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={candidateProducts.filter(p => p.selected).length === 0}
                    onClick={handleExecuteImport}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md cursor-pointer flex items-center gap-1.5 border border-emerald-500"
                  >
                    Confirmar Importación Masiva
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
