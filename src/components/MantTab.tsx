import React, { useState, useEffect } from 'react';
import { ShieldCheck, Edit3, Trash2, Save, MapPin, RefreshCw, AlertTriangle, Plus, X, Laptop, KeyRound, Lock, Image, Camera, PackageOpen, Copy, QrCode, Download, ExternalLink, Check, Clock } from 'lucide-react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, FoodItem, BusinessConfig, Empleado, isModuleActive, SectorConfig, ScheduleConfig, DaySchedule } from '../types';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const DEFAULT_WEEKLY_SCHEDULE: Record<string, DaySchedule> = {
  'Lunes': { isOpen: true, openTime: '08:00', closeTime: '20:00' },
  'Martes': { isOpen: true, openTime: '08:00', closeTime: '20:00' },
  'Miércoles': { isOpen: true, openTime: '08:00', closeTime: '20:00' },
  'Jueves': { isOpen: true, openTime: '08:00', closeTime: '20:00' },
  'Viernes': { isOpen: true, openTime: '08:00', closeTime: '20:00' },
  'Sábado': { isOpen: true, openTime: '08:00', closeTime: '20:00' },
  'Domingo': { isOpen: true, openTime: '08:00', closeTime: '20:00' },
};
import { checkStoreOpenStatus } from '../utils';

const FOOD_PRESET_IMAGES = [
  { label: 'Salada', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200' },
  { label: 'Pan', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200' },
  { label: 'Sopa', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=200' },
  { label: 'Carne', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=200' },
  { label: 'Desayuno', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=200' },
  { label: 'Postre', url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=200' },
  { label: 'Bebida', url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=200' }
];

const PRESET_3D_ICONS = [
  { label: 'Panqueques/Desayuno', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pancakes.png' },
  { label: 'Café', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hot%20Beverage.png' },
  { label: 'Sushi', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Sushi.png' },
  { label: 'Sándwich', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Sandwich.png' },
  { label: 'Medialuna/Pan', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Croissant.png' },
  { label: 'Sopa/Ramen', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Steaming%20Bowl.png' },
  { label: 'Pizza', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png' },
  { label: 'Hamburguesa', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hamburger.png' },
  { label: 'Postres/Pastel', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Shortcake.png' },
  { label: 'Botella/Bebidas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beverage%20Box.png' },
  { label: 'Caja de Leche/Lácteos', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Milk%20Carton.png' },
  { label: 'Queso', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cheese%20Wedge.png' },
  { label: 'Huevo', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Egg.png' },
  { label: 'Manzana/Frutas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Red%20Apple.png' },
  { label: 'Brócoli/Verduras', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Broccoli.png' },
  { label: 'Corte de Carne/Pollo', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cut%20of%20Meat.png' },
  { label: 'Bolsa de Alimentos/Abarrotes', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Bags.png' },
  { label: 'Papas Fritas/Snacks', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Potato%20Chips.png' },
  { label: 'Jabón/Limpieza', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Soap.png' },
  { label: 'Pan Blanco', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Bread.png' },
  { label: 'Carrito de Compras', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png' },
  
  // Novedades expandidas para completar exactamente 50 opciones
  { label: 'Farmacia/Salud/Medicamentos 💊', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Pill.png' },
  { label: 'Botillería/Vino/Licores 🍷', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Wine%20Glass.png' },
  { label: 'Botillería/Champaña/Licores 🍾', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Bottle%20with%20Popping%20Cork.png' },
  { label: 'Tecnología/Computador 💻', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Laptop.png' },
  { label: 'Tecnología/Celular 📱', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Mobile%20Phone.png' },
  { label: 'Deportes/Balón ⚽', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Activities/Soccer%20Ball.png' },
  { label: 'Deportes/Mancuerna 🏋️', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Dumbbell.png' },
  { label: 'Fiambrería/Tocino/Cecinas 🥓', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Bacon.png' },
  { label: 'Conservas/Enlatados 🥫', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Canned%20Food.png' },
  { label: 'Pescadería/Pescado 🐟', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Animals/Fish.png' },
  { label: 'Marisquería/Camarón/Mariscos 🍤', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Fried%20Shrimp.png' },
  { label: 'Condimentos/Hierbas/Especias 🌿', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Animals/Herb.png' },
  { label: 'Cocina Caliente/Sopa/Olla 🍲', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pot%20of%20Food.png' },
  { label: 'Aseo/Escoba/Productos de Limpieza 🧹', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Broom.png' },
  { label: 'Repostería/Cupcake/Dulces 🧁', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cupcake.png' },
  { label: 'Cosmética/Labial/Belleza 💄', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lipstick.png' },
  { label: 'Perfumería/Loción/Perfumes 🧴', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lotion%20Bottle.png' },
  { label: 'Librería/Mochila/Escolares 🎒', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Backpack.png' },
  { label: 'Librería/Lápiz ✏️', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Pencil.png' },
  { label: 'Juguetería/Oso/Juegos 🧸', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Activities/Teddy%20Bear.png' },
  { label: 'Juguetería/Rompecabezas 🧩', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Activities/Puzzle%20Piece.png' },
  { label: 'Entretenimiento/Dado/Juegos 🎲', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Activities/Game%20Die.png' },
  { label: 'Confitería/Caramelo/Snacks 🍬', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Candy.png' },
  { label: 'Confitería/Chocolate/Snacks 🍫', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Chocolate%20Bar.png' },
  { label: 'Panadería/Baguette 🥖', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Baguette%20Bread.png' },
  { label: 'Congelados/Hielo 🧊', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Travel%20Places/Ice.png' },
  { label: 'Mascotas/Huellas 🐾', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Animals/Paw%20Prints.png' },
  { label: 'Ferretería/Llave/Herramientas 🔧', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Wrench.png' },
  { label: 'Ropa/Vestuario/Polera 👕', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/T-Shirt.png' }
];

export const FRUTERIA_CATEGORY_MAP = [
  { id: 'cat_frutas', name: 'Frutas', icon: '🍎' },
  { id: 'cat_verduras', name: 'Verduras', icon: '🥦' },
  { id: 'cat_frutos_secos', name: 'Frutos Secos', icon: '🥜' },
  { id: 'cat_semillas', name: 'Semillas', icon: '🫘' },
  { id: 'cat_huevos', name: 'Huevos', icon: '🥚' },
  { id: 'cat_mermeladas', name: 'Mermeladas', icon: '🍯' },
  { id: 'cat_miel', name: 'Miel', icon: '🐝' },
  { id: 'cat_varios', name: 'Abarrotes / Varios', icon: '📦' }
];

const FRUTERIA_STICKER_PRESET = [
  '🍎', '🍏', '🍓', '🍒', '🍌', '🍇', '🍉', '🍍', '🍑', '🍋', '🍊', // Frutas
  '🥦', '🥕', '🥬', '🥔', '🧅', '🧄', '🌽', '🥒', '🫑', '🍆', '🥑', '🍄', // Verduras
  '🥜', '🫘', '🌿', '🥚', '🍯', '🐝', '📦', '🌻', // Rubros Varios
  '🔥', '🏷️', '✨' // Estado
];

function getFruteria3DUrl(emoji: string): string {
  switch (emoji) {
    // Frutas
    case '🍎': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Red%20Apple.png';
    case '🍏': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Green%20Apple.png';
    case '🍓': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Strawberry.png';
    case '🍒': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cherries.png';
    case '🍌': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Banana.png';
    case '🍇': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Grapes.png';
    case '🍉': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Watermelon.png';
    case '🍍': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pineapple.png';
    case '🍑': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Peach.png';
    case '🍋': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Lemon.png';
    case '🍊': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Tangerine.png';

    // Verduras
    case '🥦': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Broccoli.png';
    case '🥕': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Carrot.png';
    case '🥬': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Leafy%20Green.png';
    case 'PotatoIcon':
    case '🥔': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Potato.png';
    case 'OnionIcon':
    case '🧅': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Onion.png';
    case '🧄': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Garlic.png';
    case '🌽': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Ear%20of%20Corn.png';
    case '🥒': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cucumber.png';
    case '🫑': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Bell%20Pepper.png';
    case '🍆': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Eggplant.png';
    case 'AvocadoIcon':
    case '🥑': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Avocado.png';
    case '🍄': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Mushroom.png';

    // Rubros Varios
    case '🥜': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Peanuts.png';
    case 'FrijolIcon':
    case '🫘': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beans.png';
    case 'SpiceIcon':
    case '🌿': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Animals/Herb.png';
    case 'EggIcon':
    case '🥚': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Egg.png';
    case '🍯': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Honey%20Pot.png';
    case '🐝': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Animals/Honeybee.png';
    case '📦': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Package.png';
    case 'FlowerIcon':
    case '🌻': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Animals/Sunflower.png';

    // Estado
    case 'FireIcon':
    case '🔥': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Activities/Fire.png';
    case 'TagIcon':
    case '🏷️': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Label.png';
    case 'SparkleIcon':
    case '✨': return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Smilies/Sparkles.png';

    default:
      if (emoji.startsWith('http://') || emoji.startsWith('https://')) return emoji;
      return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Red%20Apple.png';
  }
}

export const TURCO_STORE_STICKERS = ['🥤', '🍿', '🧴', '🧼', '🍞', '🥫', '🍫', '🧃', '🧻', '📦', '🥛', '🧀', '🛍️', '🍬', '🧹', '🥓', '🧊'];

export const TURCO_STORE_STICKER_ITEMS = [
  { label: 'Bebidas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cup%20With%20Straw.png', nativeEmoji: '🥤' },
  { label: 'Snacks', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Potato%20Chips.png', nativeEmoji: '🍿' },
  { label: 'Aseo y Loción', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lotion%20Bottle.png', nativeEmoji: '🧴' },
  { label: 'Jabón', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Soap.png', nativeEmoji: '🧼' },
  { label: 'Panadería', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Bread.png', nativeEmoji: '🍞' },
  { label: 'Conservas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Canned%20Food.png', nativeEmoji: '🥫' },
  { label: 'Chocolates', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Chocolate%20Bar.png', nativeEmoji: '🍫' },
  { label: 'Caja de Jugo', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beverage%20Box.png', nativeEmoji: '🧃' },
  { label: 'Papel / Aseo', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Roll%20of%20Paper.png', nativeEmoji: '🧻' },
  { label: 'Abarrotes / Varios', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Package.png', nativeEmoji: '📦' },
  { label: 'Lácteos', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Milk%20Carton.png', nativeEmoji: '🥛' },
  { label: 'Quesos', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cheese%20Wedge.png', nativeEmoji: '🧀' },
  { label: 'Bolsas de Compra', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Bags.png', nativeEmoji: '🛍️' },
  { label: 'Dulces', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Candy.png', nativeEmoji: '🍬' },
  { label: 'Limpieza', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Broom.png', nativeEmoji: '🧹' },
  { label: 'Fiambrería', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Bacon.png', nativeEmoji: '🥓' },
  { label: 'Congelados', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Travel%20Places/Ice.png', nativeEmoji: '🧊' }
];

export const TURCO_KITCHEN_STICKERS = ['🍔', '🍲', '🍰', '☕', '🍕', '🌮', '🥪', '🍳', '🥤', '🍣', '🥞', '🥐', '🥩', '🧁'];

export const TURCO_KITCHEN_STICKER_ITEMS = [
  { label: 'Hamburguesas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hamburger.png', nativeEmoji: '🍔' },
  { label: 'Sopas y Almuerzos', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Steaming%20Bowl.png', nativeEmoji: '🍲' },
  { label: 'Postres y Tortas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Shortcake.png', nativeEmoji: '🍰' },
  { label: 'Cafetería', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hot%20Beverage.png', nativeEmoji: '☕' },
  { label: 'Pizzas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png', nativeEmoji: '🍕' },
  { label: 'Tacos y Wraps', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Taco.png', nativeEmoji: '🌮' },
  { label: 'Sándwiches', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Sandwich.png', nativeEmoji: '🥪' },
  { label: 'Comida Preparada', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cooking.png', nativeEmoji: '🍳' },
  { label: 'Bebidas Frías', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beverage%20Box.png', nativeEmoji: '🥤' },
  { label: 'Sushi', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Sushi.png', nativeEmoji: '🍣' },
  { label: 'Panqueques', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pancakes.png', nativeEmoji: '🥞' },
  { label: 'Croissants', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Croissant.png', nativeEmoji: '🥐' },
  { label: 'Carnes', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cut%20of%20Meat.png', nativeEmoji: '🥩' },
  { label: 'Repostería', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cupcake.png', nativeEmoji: '🧁' }
];

export const FRUTERIA_STICKERS = ['🍎', '🥦', '🥜', '🫘', '🥚', '🍯', '🐝', '📦'];

export const EXCLUSIVE_FRUTERIA_STICKERS = FRUTERIA_STICKERS;

export const FRUTERIA_STICKER_ITEMS = [
  { label: 'Frutas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Red%20Apple.png', nativeEmoji: '🍎' },
  { label: 'Verduras', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Broccoli.png', nativeEmoji: '🥦' },
  { label: 'Frutos Secos', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Peanuts.png', nativeEmoji: '🥜' },
  { label: 'Semillas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beans.png', nativeEmoji: '🫘' },
  { label: 'Huevos', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Egg.png', nativeEmoji: '🥚' },
  { label: 'Mermeladas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Honey%20Pot.png', nativeEmoji: '🍯' },
  { label: 'Miel', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Animals/Honeybee.png', nativeEmoji: '🐝' },
  { label: 'Abarrotes / Varios', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Package.png', nativeEmoji: '📦' }
];

export const EXCLUSIVE_FRUTERIA_STICKER_ITEMS = FRUTERIA_STICKER_ITEMS;

export const ARTICO_STICKER_ITEMS = [
  { label: 'Carnes', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Meat%20On%20Bone.png', nativeEmoji: '🥩' },
  { label: 'Hamburguesas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hamburger.png', nativeEmoji: '🍔' },
  { label: 'Congelados', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Ice.png', nativeEmoji: '🧊' },
  { label: 'Pescados y Mariscos', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Fish.png', nativeEmoji: '🦐' },
  { label: 'Quesos y Cecinas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cheese%20Wedge.png', nativeEmoji: '🧀' },
  { label: 'Kits y Cajas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Package.png', nativeEmoji: '📦' },
  { label: 'Pollo y Aves', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Poultry%20Leg.png', nativeEmoji: '🍗' }
];

export const FARMACIA_STICKER_ITEMS = [
  { label: 'Medicamentos 💊', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Pill.png', nativeEmoji: '💊' },
  { label: 'Cuidado Salud 🩺', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Stethoscope.png', nativeEmoji: '🩺' },
  { label: 'Mamá y Bebé 🍼', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Baby%20Bottle.png', nativeEmoji: '🍼' },
  { label: 'Cuidado Personal 🧴', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lotion%20Bottle.png', nativeEmoji: '🧴' },
  { label: 'Jabón / Higiene 🧼', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Soap.png', nativeEmoji: '🧼' },
  { label: 'Belleza / Cosmética 💄', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lipstick.png', nativeEmoji: '💄' },
  { label: 'Vitaminas / Suplementos 🧬', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Symbols/Dna.png', nativeEmoji: '🧬' },
  { label: 'Adulto Mayor 🦯', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Probing%20Cane.png', nativeEmoji: '🦯' },
  { label: 'Conveniencia 🏪', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Travel%20Places/Convenience%20Store.png', nativeEmoji: '🏪' },
  { label: 'Primeros Auxilios 🩹', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Adhesive%20Bandage.png', nativeEmoji: '🩹' },
  { label: 'Termómetro 🌡️', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Travel%20Places/Thermometer.png', nativeEmoji: '🌡️' },
  { label: 'Jeringa 💉', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Syringe.png', nativeEmoji: '💉' },
  { label: 'Higiene Dental 🪥', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Toothbrush.png', nativeEmoji: '🪥' }
];

export const PIZZA_STORE_STICKER_ITEMS = [
  { label: 'Pizzas Tradicionales 🍕', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png', nativeEmoji: '🍕' },
  { label: 'Promos 2x / Económicas 🔥', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Activities/Fire.png', nativeEmoji: '🔥' },
  { label: 'Acompañamientos / Papas Fritas 🍟', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/French%20Fries.png', nativeEmoji: '🍟' },
  { label: 'Palitos de Ajo / Baguettes 🥖', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Baguette%20Bread.png', nativeEmoji: '🥖' },
  { label: 'Salsas y Extras 🥫', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Canned%20Food.png', nativeEmoji: '🥫' },
  { label: 'Bebidas y Jugos 🥤', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cup%20With%20Straw.png', nativeEmoji: '🥤' },
  { label: 'Postres y Dulces 🍰', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Shortcake.png', nativeEmoji: '🍰' },
  { label: 'Queso Extra / Mozzarella 🧀', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cheese%20Wedge.png', nativeEmoji: '🧀' },
  { label: 'Pepperoni / Cecinas 🥓', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Bacon.png', nativeEmoji: '🥓' },
  { label: 'Ajo / Especias 🧄', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Garlic.png', nativeEmoji: '🧄' },
  { label: 'Ají / Picante 🌶️', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hot%20Pepper.png', nativeEmoji: '🌶️' },
  { label: 'Cebolla / Toppings 🧅', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Onion.png', nativeEmoji: '🧅' },
  { label: 'Champiñones / Toppings 🍄', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Mushroom.png', nativeEmoji: '🍄' },
  { label: 'Albahaca / Hierbas 🌿', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Animals/Herb.png', nativeEmoji: '🌿' }
];

const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  'Todos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png',
  'Todo': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png',
  'Bebidas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beverage%20Box.png',
  'Abarrotes': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Bags.png',
  'Lácteos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Milk%20Carton.png',
  'Snacks': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Potato%20Chips.png',
  'Almuerzos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cooking.png',
  'Sopas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Steaming%20Bowl.png',
  'Postres': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Shortcake.png',
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
  'Pizzas Tradicionales': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png',
  'Pizzas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png',
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

function getCategoryIcon(cat: string, customIcons?: Record<string, string>): string {
  if (cat === 'Todos' || cat === 'Todo') return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png';
  if (customIcons?.[cat]) return customIcons[cat];
  if (DEFAULT_CATEGORY_ICONS[cat]) return DEFAULT_CATEGORY_ICONS[cat];

  const lower = cat.toLowerCase();
  if (lower.includes('medicamento') || lower.includes('remedio') || lower.includes('píldora') || lower.includes('pastilla')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Pill.png';
  if (lower.includes('salud') || lower.includes('médico') || lower.includes('estetoscopio')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Stethoscope.png';
  if (lower.includes('mamá') || lower.includes('bebé') || lower.includes('biberón') || lower.includes('mamadera')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Baby%20Bottle.png';
  if (lower.includes('cuidado personal') || lower.includes('loción') || lower.includes('crema')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lotion%20Bottle.png';
  if (lower.includes('belleza') || lower.includes('cosmética') || lower.includes('maquillaje') || lower.includes('labial')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lipstick.png';
  if (lower.includes('vitamina') || lower.includes('suplemento') || lower.includes('dna')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Symbols/Dna.png';
  if (lower.includes('adulto mayor') || lower.includes('bastón') || lower.includes('senior')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Probing%20Cane.png';
  if (lower.includes('conveniencia') || lower.includes('tienda')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Travel%20Places/Convenience%20Store.png';

  if (lower.includes('carne') || lower.includes('churrasco')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Meat%20On%20Bone.png';
  if (lower.includes('hamburguesa') || lower.includes('prefrito')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hamburger.png';
  if (lower.includes('congelado') || lower.includes('pulpa') || lower.includes('hielo')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Ice.png';
  if (lower.includes('marisco') || lower.includes('pescado') || lower.includes('camarón')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Fish.png';
  if (lower.includes('refrigerado') || lower.includes('cecina')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cheese%20Wedge.png';
  if (lower.includes('kit') || lower.includes('caja')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Package.png';

  if (lower.includes('huevo')) return DEFAULT_CATEGORY_ICONS['Huevos'];
  if (lower.includes('miel') || lower.includes('abeja')) return DEFAULT_CATEGORY_ICONS['Miel'];
  if (lower.includes('mermelada')) return DEFAULT_CATEGORY_ICONS['Mermeladas'];
  if (lower.includes('seco') || lower.includes('maní')) return DEFAULT_CATEGORY_ICONS['Frutos Secos'];
  if (lower.includes('semilla') || lower.includes('legumbre') || lower.includes('poroto')) return DEFAULT_CATEGORY_ICONS['Semillas'];
  if (lower.includes('fruta') || lower.includes('manzana')) return DEFAULT_CATEGORY_ICONS['Frutas'];
  if (lower.includes('verdura') || lower.includes('brócoli')) return DEFAULT_CATEGORY_ICONS['Verduras'];

  if (lower.includes('bebida') || lower.includes('jugo')) return DEFAULT_CATEGORY_ICONS['Bebidas'];
  if (lower.includes('abarrote') || lower.includes('despensa')) return DEFAULT_CATEGORY_ICONS['Abarrotes'];
  if (lower.includes('lácteo') || lower.includes('leche') || lower.includes('queso')) return DEFAULT_CATEGORY_ICONS['Lácteos'];
  if (lower.includes('snack') || lower.includes('papa')) return DEFAULT_CATEGORY_ICONS['Snacks'];
  if (lower.includes('almuerzo') || lower.includes('comida') || lower.includes('plato') || lower.includes('cocina')) return DEFAULT_CATEGORY_ICONS['Almuerzos'];
  if (lower.includes('sopa') || lower.includes('ramen')) return DEFAULT_CATEGORY_ICONS['Sopas'];
  if (lower.includes('postre') || lower.includes('torta') || lower.includes('pastel')) return DEFAULT_CATEGORY_ICONS['Postres'];
  if (lower.includes('aseo') || lower.includes('limpieza') || lower.includes('jabón')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Soap.png';
  if (lower.includes('pan')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Bread.png';

  return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Package.png';
}

function CategoryIcon({ cat, iconUrl, className = "w-8 h-8 object-contain" }: { cat: string; iconUrl: string; className?: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [iconUrl]);

  const getFallbackEmoji = (category: string): string => {
    const lower = category.toLowerCase();
    if (lower.includes('bebida') || lower.includes('jugo')) return '🥤';
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
    if (lower.includes('huevo')) return '🥚';
    if (lower.includes('miel') || lower.includes('abeja')) return '🐝';
    if (lower.includes('mermelada')) return '🍯';
    if (lower.includes('seco') || lower.includes('maní')) return '🥜';
    if (lower.includes('semilla') || lower.includes('poroto') || lower.includes('legumbre')) return '🫘';
    if (lower.includes('varios')) return '📦';
    if (lower.includes('todos') || lower.includes('todo') || lower.includes('carrito')) return '🛒';
    
    return '📦';
  };

  if (!iconUrl) {
    return <span className="select-none text-xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] leading-none inline-block">{getFallbackEmoji(cat)}</span>;
  }

  if (iconUrl.startsWith('http') && !hasError) {
    return (
      <img
        src={iconUrl}
        className={`${className} filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.20)]`}
        alt={cat}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    );
  }

  const displayEmoji = (iconUrl && !iconUrl.startsWith('http')) ? iconUrl : getFallbackEmoji(cat);

  return (
    <span className="select-none text-xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] leading-none inline-block">
      {displayEmoji}
    </span>
  );
}

function getNativeEmojiForLabel(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes('bebida') || lower.includes('jugo')) return '🥤';
  if (lower.includes('snack') || lower.includes('papa')) return '🍿';
  if (lower.includes('aseo') || lower.includes('limpieza') || lower.includes('loción')) return '🧴';
  if (lower.includes('jabón')) return '🧼';
  if (lower.includes('pan')) return '🍞';
  if (lower.includes('conserva')) return '🥫';
  if (lower.includes('chocolate')) return '🍫';
  if (lower.includes('lácteo') || lower.includes('leche')) return '🥛';
  if (lower.includes('queso')) return '🧀';
  if (lower.includes('hamburguesa')) return '🍔';
  if (lower.includes('sopa') || lower.includes('almuerzo')) return '🍲';
  if (lower.includes('postre') || lower.includes('torta')) return '🍰';
  if (lower.includes('café') || lower.includes('cafetería')) return '☕';
  if (lower.includes('pizza')) return '🍕';
  if (lower.includes('taco')) return '🌮';
  if (lower.includes('sándwich')) return '🥪';
  if (lower.includes('preparada') || lower.includes('cocina')) return '🍳';
  if (lower.includes('fruta') || lower.includes('manzana')) return '🍎';
  if (lower.includes('verdura') || lower.includes('brócoli')) return '🥦';
  if (lower.includes('seco') || lower.includes('maní')) return '🥜';
  if (lower.includes('semilla') || lower.includes('poroto') || lower.includes('legumbre')) return '🫘';
  if (lower.includes('huevo')) return '🥚';
  if (lower.includes('mermelada')) return '🍯';
  if (lower.includes('miel') || lower.includes('abeja')) return '🐝';
  return '📦';
}

function SelectorStickerItem({ item, selected, onClick }: { item: { label: string; url: string; nativeEmoji?: string }; selected: boolean; onClick: () => void; key?: any }) {
  const [hasError, setHasError] = useState(false);

  const emojiChar = item.nativeEmoji || getNativeEmojiForLabel(item.label);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 transition-all border cursor-pointer select-none p-1 shadow-2xs ${
        selected
          ? 'bg-rose-100/90 border-rose-600 ring-4 ring-rose-500/30 scale-110 shadow-md font-bold'
          : 'bg-white border-slate-200/90 hover:bg-slate-50 opacity-90 hover:scale-105 hover:opacity-100'
      }`}
      title={item.label}
    >
      {selected && (
        <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs border border-white">
          ✓
        </span>
      )}
      {item.url && item.url.startsWith('http') && !hasError ? (
        <img
          src={item.url}
          className="w-9 h-9 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
          alt={item.label}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-xl select-none filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.12)] leading-none">
          {emojiChar}
        </span>
      )}
    </button>
  );
}

interface MantTabProps {
  products: Product[];
  foodItems: FoodItem[];
  config: BusinessConfig;
  onUpdateConfig: (newCfg: BusinessConfig) => Promise<void>;
  onEditProduct: (p: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onAddFoodItem: (f: Omit<FoodItem, 'id'>) => Promise<void>;
  onEditFoodItem?: (f: FoodItem) => Promise<void>;
  onDeleteFoodItem: (id: string) => Promise<void>;
  isUnlocked: boolean;
  onUnlock: (unlocked: boolean) => void;
  isMasterUnlocked: boolean;
  onUnlockMaster: (unlocked: boolean) => void;
  currentEmployee: Empleado | null;
  onLoginSuccess: (emp: Empleado | null) => void;
  tenantId?: string;
}

const DEFAULT_RUTAS_CAMION: Record<string, SectorConfig> = {
  comunasDiarias: {
    name: "Comunas Diarias",
    comunas: ["Estación Central", "Independencia", "Quinta Normal", "Recoleta", "San Miguel", "Santiago Centro"],
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    fee: 3400
  },
  ejeCentral: {
    name: "Eje Central",
    comunas: ["Ñuñoa", "Providencia", "Santiago Centro"],
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    fee: 3400
  },
  norte: {
    name: "Sector Norte",
    comunas: ["Colina", "Conchalí", "Huechuraba", "Independencia", "Lampa", "Quilicura", "Recoleta", "Renca"],
    days: ["Lunes", "Jueves", "Sábado"],
    fee: 3400
  },
  poniente: {
    name: "Sector Poniente",
    comunas: ["Cerrillos", "Cerro Navia", "Estación Central", "Lo Prado", "Maipú", "Padre Hurtado", "Pedro Aguirre Cerda", "Peñaflor", "Pudahuel", "Quinta Normal", "Talagante"],
    days: ["Lunes", "Jueves"],
    fee: 3400
  },
  sur: {
    name: "Sector Sur",
    comunas: ["Buin", "Calera de Tango", "El Bosque", "La Cisterna", "La Granja", "La Pintana", "Lo Espejo", "Puente Alto", "San Bernardo", "San Ramón"],
    days: ["Martes", "Viernes", "Sábado"],
    fee: 3400
  },
  oriente: {
    name: "Sector Oriente",
    comunas: ["La Reina", "Las Condes", "Lo Barnechea", "Ñuñoa", "Peñalolén", "Providencia", "Vitacura"],
    days: ["Martes", "Miércoles", "Viernes"],
    fee: 3400
  },
  surOriente: {
    name: "Sector Sur Oriente",
    comunas: ["La Florida", "La Granja", "La Pintana", "Macul", "Pirque", "Puente Alto", "San Joaquín", "San José de Maipo", "San Miguel", "San Ramón"],
    days: ["Miércoles", "Sábado"],
    fee: 3400
  }
};

export default function MantTab({
  products,
  foodItems,
  config,
  onUpdateConfig,
  onEditProduct,
  onDeleteProduct,
  onAddFoodItem,
  onEditFoodItem,
  onDeleteFoodItem,
  isUnlocked,
  onUnlock,
  isMasterUnlocked,
  onUnlockMaster,
  currentEmployee,
  onLoginSuccess,
  tenantId
}: MantTabProps) {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const totalRaciones = foodItems.reduce((acc, curr) => acc + (curr.stock ?? 0), 0);
  
  // Role-based login and employee states
  const [employeesList, setEmployeesList] = useState<Empleado[]>([]);
  const [loginRole, setLoginRole] = useState<'dueno' | 'empleado'>('empleado');
  const [loginSelectedEmpId, setLoginSelectedEmpId] = useState<string>('');
  
  // Custom interactive confirm/alert states
  const [confirmDeleteDish, setConfirmDeleteDish] = useState<{ id: string; name: string } | null>(null);
  
  // Dashboard fields state
  const [localName, setLocalName] = useState(config.name || 'Donde el Goyo');
  const [whatsapp, setWhatsapp] = useState(config.whatsapp || '+5491112345678');
  const [gps, setGps] = useState(config.gps || 'Calle Principal #123');
  const [adminPinField, setAdminPinField] = useState(config.adminPin || '1234');
  const [localBannerUrl, setLocalBannerUrl] = useState(config.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800');
  const [ivaPercentInput, setIvaPercentInput] = useState(config.ivaPercentage !== undefined ? config.ivaPercentage : 15);
  
  // Schedule state
  const [scheduleMode, setScheduleMode] = useState<'auto' | 'forced_open' | 'forced_closed'>(config.schedule?.mode || 'auto');
  const [scheduleOpenTime, setScheduleOpenTime] = useState<string>(config.schedule?.openTime || '08:00');
  const [scheduleCloseTime, setScheduleCloseTime] = useState<string>(config.schedule?.closeTime || '20:00');
  const [scheduleDaysOpen, setScheduleDaysOpen] = useState<string[]>(
    config.schedule?.daysOpen || DAYS_OF_WEEK
  );
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, DaySchedule>>(() => {
    if (config.schedule?.weeklySchedule) {
      return { ...DEFAULT_WEEKLY_SCHEDULE, ...config.schedule.weeklySchedule };
    }
    const openT = config.schedule?.openTime || '08:00';
    const closeT = config.schedule?.closeTime || '20:00';
    const daysO = config.schedule?.daysOpen || DAYS_OF_WEEK;
    const initSched: Record<string, DaySchedule> = {};
    DAYS_OF_WEEK.forEach(day => {
      initSched[day] = {
        isOpen: daysO.includes(day),
        openTime: openT,
        closeTime: closeT
      };
    });
    return initSched;
  });

  const [rutasCamion, setRutasCamion] = useState<Record<string, SectorConfig>>(config.rutasCamion || DEFAULT_RUTAS_CAMION);
  const [uploadMethod, setUploadMethod] = useState<'link' | 'gallery'>('link');
  const [modulosActivos, setModulosActivos] = useState<{
    tiendaAbarrotes: boolean;
    cocinaAlmuerzos: boolean;
    bodega: boolean;
    farmacia: boolean;
    frutería: boolean;
  }>({
    tiendaAbarrotes: true,
    cocinaAlmuerzos: true,
    bodega: true,
    farmacia: true,
    frutería: true
  });

  const [articoActiveModules, setArticoActiveModules] = useState<{
    congeladosPulpas: boolean;
    carnesChurrascos: boolean;
    mariscosPescados: boolean;
    refrigeradosCecinas: boolean;
    kitsCajasCerradas: boolean;
  }>({
    congeladosPulpas: true,
    carnesChurrascos: true,
    mariscosPescados: true,
    refrigeradosCecinas: true,
    kitsCajasCerradas: true
  });

  const [farmaciaActiveModules, setFarmaciaActiveModules] = useState<{
    medicamentos: boolean;
    cuidadoSalud: boolean;
    mamaBebe: boolean;
    cuidadoPersonal: boolean;
    belleza: boolean;
    vitaminasSuplementos: boolean;
    adultoMayor: boolean;
    conveniencia: boolean;
  }>({
    medicamentos: true,
    cuidadoSalud: true,
    mamaBebe: true,
    cuidadoPersonal: true,
    belleza: true,
    vitaminasSuplementos: true,
    adultoMayor: true,
    conveniencia: true
  });
  
  // SII Integration states
  const [siiEnabled, setSiiEnabled] = useState(config.siiEnabled || false);
  const [siiRut, setSiiRut] = useState(config.siiRut || '');
  const [siiDigitalCert, setSiiDigitalCert] = useState(config.siiDigitalCert || '');
  const [siiApiKey, setSiiApiKey] = useState(config.siiApiKey || '');
  
  // Dynamic categories management state
  const [productCategoriesList, setProductCategoriesList] = useState<string[]>([]);
  const [foodItemCategoriesList, setFoodItemCategoriesList] = useState<string[]>([]);
  const [fruteriaCategoriesList, setFruteriaCategoriesList] = useState<string[]>([]);
  const [articoCategoriesList, setArticoCategoriesList] = useState<string[]>([]);
  const [farmaciaCategoriesList, setFarmaciaCategoriesList] = useState<string[]>([]);
  const [pizzaCategoriesList, setPizzaCategoriesList] = useState<string[]>([]);
  const [newProductCat, setNewProductCat] = useState('');
  const [newFoodCat, setNewFoodCat] = useState('');
  const [newFruteriaCat, setNewFruteriaCat] = useState('');
  const [newArticoCat, setNewArticoCat] = useState('');
  const [newFarmaciaCat, setNewFarmaciaCat] = useState('');
  const [newPizzaCat, setNewPizzaCat] = useState('');
  const [productSelectedEmoji, setProductSelectedEmoji] = useState('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Bags.png');
  const [foodSelectedEmoji, setFoodSelectedEmoji] = useState('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pancakes.png');
  const [fruteriaSelectedEmoji, setFruteriaSelectedEmoji] = useState('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Red%20Apple.png');
  const [articoSelectedEmoji, setArticoSelectedEmoji] = useState('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Ice.png');
  const [farmaciaSelectedEmoji, setFarmaciaSelectedEmoji] = useState('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Pill.png');
  const [pizzaSelectedEmoji, setPizzaSelectedEmoji] = useState('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png');
  const [categoryIconsList, setCategoryIconsList] = useState<Record<string, string>>({});

  // Kitchen dish builder form state
  const [showDishModal, setShowDishModal] = useState(false);
  const [editingDish, setEditingDish] = useState<FoodItem | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState<string>('');
  const [dishStock, setDishStock] = useState<string>('0');
  const [dishCategory, setDishCategory] = useState<string>('Almuerzos');
  const [dishImageUrl, setDishImageUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200');
  const [uploadingDishImage, setUploadingDishImage] = useState(false);
  const [dishImageError, setDishImageError] = useState(false);
  const [dishEnOferta, setDishEnOferta] = useState(false);
  const [dishPrecioOferta, setDishPrecioOferta] = useState<string>('');

  useEffect(() => {
    setDishImageError(false);
  }, [dishImageUrl]);

  const handleDishImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDishImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Optimal width for food thumbnails
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          const scale = MAX_WIDTH / width;
          width = MAX_WIDTH;
          height = height * scale;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setDishImageUrl(compressed);
        } else {
          setDishImageUrl(event.target?.result as string);
        }
        setUploadingDishImage(false);
      };
      img.onerror = () => {
        setUploadingDishImage(false);
      };
    };
    reader.onerror = () => {
      setUploadingDishImage(false);
    };
    reader.readAsDataURL(file);
  };
  
  const [loading, setLoading] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false);
  const [notifySavedKitchenCats, setNotifySavedKitchenCats] = useState(false);
  const [notifySavedFruteriaCats, setNotifySavedFruteriaCats] = useState(false);
  const [notifySavedArticoCats, setNotifySavedArticoCats] = useState(false);
  const [notifySavedFarmaciaCats, setNotifySavedFarmaciaCats] = useState(false);
  const [notifySavedPizzaCats, setNotifySavedPizzaCats] = useState(false);

  const getActiveStoreInfo = () => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlTienda = params?.get('tienda') || params?.get('id_tienda');
    const tId = (tenantId || config?.id || '').toLowerCase();
    const nameLower = (config?.name || '').toLowerCase();

    if (urlTienda === 'pasion-pizzas' || urlTienda === 'pasion_pizzas' || urlTienda === 'pizza' || urlTienda === 'pizzeria' || urlTienda === 'pizzería' || tId.includes('pasion') || tId.includes('pizza') || nameLower.includes('pasión') || nameLower.includes('pasion') || nameLower.includes('pizza')) {
      return {
        key: 'pasion-pizzas',
        paramValue: 'pasion-pizzas',
        moduleLabel: 'Pizzería',
        emoji: '🍕',
        storeName: config?.name || 'Pasión por las Pizzas',
        sectionTitle: '📱 Enlace Directo y Código QR Exclusivo de Pizzería',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    }

    if (urlTienda === 'artico' || urlTienda === 'artico_congelados' || urlTienda === 'congelados' || tId.includes('artico') || tId.includes('congelados') || nameLower.includes('ártico') || nameLower.includes('artico')) {
      return {
        key: 'artico',
        paramValue: 'artico',
        moduleLabel: 'Ártico Congelados',
        emoji: '🧊',
        storeName: config?.name || 'Ártico Congelados',
        sectionTitle: '📱 Enlace Directo y Código QR Exclusivo de Ártico Congelados',
        badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200'
      };
    }

    if (urlTienda === 'fruteria' || tId.includes('fruteria') || tId.includes('gales') || nameLower.includes('frutería') || nameLower.includes('gales')) {
      return {
        key: 'fruteria',
        paramValue: 'fruteria',
        moduleLabel: 'Frutería',
        emoji: '🍎',
        storeName: config?.name || 'Frutería Príncipe de Gales',
        sectionTitle: '📱 Enlace Directo y Código QR Exclusivo de Frutería',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    }

    if (urlTienda === 'farmacia' || tId.includes('farmacia') || tId.includes('seguro') || nameLower.includes('farmacia') || nameLower.includes('seguro')) {
      return {
        key: 'farmacia',
        paramValue: 'farmacia',
        moduleLabel: 'Farmacia',
        emoji: '💊',
        storeName: config?.name || 'Farmacia Barrio Seguro',
        sectionTitle: '📱 Enlace Directo y Código QR Exclusivo de Farmacia',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200'
      };
    }

    return {
      key: 'turco',
      paramValue: 'turco',
      moduleLabel: 'Minimarket',
      emoji: '🏪',
      storeName: config?.name || 'Donde El Turco',
      sectionTitle: '📱 Enlace Directo y Código QR Exclusivo de Minimarket',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
  };

  const activeStoreInfo = getActiveStoreInfo();
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-aizigdsszomixcqyfzgzwo-445840781421.us-west2.run.app';
  const activeDirectUrl = `${currentOrigin}/?tienda=${activeStoreInfo.paramValue}`;
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSaveFruteriaCategories = async () => {
    setLoading(true);
    try {
      const mergedIcons = {
        ...config.categoryIcons,
        ...categoryIconsList
      };
      await onUpdateConfig({
        ...config,
        fruteriaCategories: fruteriaCategoriesList,
        categoryIcons: mergedIcons
      });
      localStorage.setItem('fruteria_categories_v1', JSON.stringify(fruteriaCategoriesList));
      localStorage.setItem('category_icons_v1', JSON.stringify(mergedIcons));
      setNotifySavedFruteriaCats(true);
      setTimeout(() => setNotifySavedFruteriaCats(false), 3000);
    } catch (err) {
      console.error("Error al guardar categorías de frutería:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArticoCategories = async () => {
    setLoading(true);
    try {
      const mergedIcons = {
        ...config.categoryIcons,
        ...categoryIconsList
      };
      await onUpdateConfig({
        ...config,
        articoCategories: articoCategoriesList,
        categoryIcons: mergedIcons
      });
      localStorage.setItem('artico_categories_data', JSON.stringify(articoCategoriesList));
      localStorage.setItem('artico_categories_v1', JSON.stringify(articoCategoriesList));
      localStorage.setItem('category_icons_v1', JSON.stringify(mergedIcons));
      setNotifySavedArticoCats(true);
      setTimeout(() => setNotifySavedArticoCats(false), 3000);
    } catch (err) {
      console.error("Error al guardar categorías de Ártico:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFarmaciaCategories = async () => {
    setLoading(true);
    try {
      const mergedIcons = {
        ...config.categoryIcons,
        ...categoryIconsList
      };
      await onUpdateConfig({
        ...config,
        farmaciaCategories: farmaciaCategoriesList,
        categoryIcons: mergedIcons
      });
      localStorage.setItem('farmacia_categories_v1', JSON.stringify(farmaciaCategoriesList));
      localStorage.setItem('category_icons_v1', JSON.stringify(mergedIcons));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('category_icons_updated'));
      }
      setNotifySavedFarmaciaCats(true);
      setTimeout(() => setNotifySavedFarmaciaCats(false), 3000);
    } catch (err) {
      console.error("Error al guardar categorías de farmacia:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePizzaCategories = async () => {
    setLoading(true);
    try {
      const mergedIcons = {
        ...config.categoryIcons,
        ...categoryIconsList
      };
      await onUpdateConfig({
        ...config,
        pizzaCategories: pizzaCategoriesList,
        categoryIcons: mergedIcons
      });
      localStorage.setItem('pizza_categories_v1', JSON.stringify(pizzaCategoriesList));
      localStorage.setItem('category_icons_v1', JSON.stringify(mergedIcons));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('category_icons_updated'));
      }
      setNotifySavedPizzaCats(true);
      setTimeout(() => setNotifySavedPizzaCats(false), 3000);
    } catch (err) {
      console.error("Error al guardar categorías de pizzería:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPizzaCat = () => {
    const trimmed = newPizzaCat.trim();
    if (!trimmed) return;
    if (!pizzaCategoriesList.includes(trimmed)) {
      const updated = [...pizzaCategoriesList, trimmed];
      setPizzaCategoriesList(updated);
      const updatedIcons = {
        ...categoryIconsList,
        [trimmed]: pizzaSelectedEmoji
      };
      setCategoryIconsList(updatedIcons);
      localStorage.setItem('pizza_categories_v1', JSON.stringify(updated));
      localStorage.setItem('category_icons_v1', JSON.stringify(updatedIcons));
      setNewPizzaCat('');
    }
  };

  const handleRemovePizzaCat = (catToRemove: string) => {
    const updated = pizzaCategoriesList.filter(c => c !== catToRemove);
    setPizzaCategoriesList(updated);
    localStorage.setItem('pizza_categories_v1', JSON.stringify(updated));
  };

  const handleSaveKitchenCategories = async () => {
    setLoading(true);
    try {
      await onUpdateConfig({
        ...config,
        foodItemCategories: foodItemCategoriesList,
        categoryIcons: {
          ...config.categoryIcons,
          ...categoryIconsList
        }
      });
      setNotifySavedKitchenCats(true);
      setTimeout(() => setNotifySavedKitchenCats(false), 3000);
    } catch (err) {
      console.error("Error al guardar categorías de cocina:", err);
    } finally {
      setLoading(false);
    }
  };

  // Keep state sync with firebase config loaded prop
  useEffect(() => {
    setLocalName(config.name || 'Donde el Goyo');
    setWhatsapp(config.whatsapp || '+5491112345678');
    setGps(config.gps || 'Calle Principal #123');
    setAdminPinField(config.adminPin || '1234');
    
    // Store Isolation for Banner URL
    const activeStore = getActiveStoreInfo();
    const storeBannerKey = `${activeStore.key}_banner_v1`;
    const cachedStoreBanner = localStorage.getItem(storeBannerKey) || localStorage.getItem(`${activeStore.key}_store_banner`);
    let defaultBannerForStore = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800';
    if (activeStore.key === 'artico') {
      defaultBannerForStore = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800';
    } else if (activeStore.key === 'fruteria') {
      defaultBannerForStore = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800';
    }
    const finalBanner = cachedStoreBanner || config.bannerUrl || defaultBannerForStore;
    setLocalBannerUrl(finalBanner);
    setIvaPercentInput(config.ivaPercentage !== undefined ? config.ivaPercentage : 15);

    // Schedule per store key isolation
    const scheduleKey = `${activeStore.key}_schedule_v1`;
    const cachedScheduleStr = localStorage.getItem(scheduleKey);
    if (cachedScheduleStr) {
      try {
        const cachedSched = JSON.parse(cachedScheduleStr);
        setScheduleMode(cachedSched.mode || 'auto');
        setScheduleOpenTime(cachedSched.openTime || '08:00');
        setScheduleCloseTime(cachedSched.closeTime || '20:00');
        setScheduleDaysOpen(cachedSched.daysOpen || DAYS_OF_WEEK);
        if (cachedSched.weeklySchedule) {
          setWeeklySchedule({ ...DEFAULT_WEEKLY_SCHEDULE, ...cachedSched.weeklySchedule });
        } else {
          const openT = cachedSched.openTime || '08:00';
          const closeT = cachedSched.closeTime || '20:00';
          const daysO = cachedSched.daysOpen || DAYS_OF_WEEK;
          const initSched: Record<string, DaySchedule> = {};
          DAYS_OF_WEEK.forEach(day => {
            initSched[day] = {
              isOpen: daysO.includes(day),
              openTime: openT,
              closeTime: closeT
            };
          });
          setWeeklySchedule(initSched);
        }
      } catch (e) {
        setScheduleMode(config.schedule?.mode || 'auto');
        setScheduleOpenTime(config.schedule?.openTime || '08:00');
        setScheduleCloseTime(config.schedule?.closeTime || '20:00');
        setScheduleDaysOpen(config.schedule?.daysOpen || DAYS_OF_WEEK);
        if (config.schedule?.weeklySchedule) {
          setWeeklySchedule({ ...DEFAULT_WEEKLY_SCHEDULE, ...config.schedule.weeklySchedule });
        } else {
          const openT = config.schedule?.openTime || '08:00';
          const closeT = config.schedule?.closeTime || '20:00';
          const daysO = config.schedule?.daysOpen || DAYS_OF_WEEK;
          const initSched: Record<string, DaySchedule> = {};
          DAYS_OF_WEEK.forEach(day => {
            initSched[day] = {
              isOpen: daysO.includes(day),
              openTime: openT,
              closeTime: closeT
            };
          });
          setWeeklySchedule(initSched);
        }
      }
    } else {
      setScheduleMode(config.schedule?.mode || 'auto');
      setScheduleOpenTime(config.schedule?.openTime || '08:00');
      setScheduleCloseTime(config.schedule?.closeTime || '20:00');
      setScheduleDaysOpen(config.schedule?.daysOpen || DAYS_OF_WEEK);
      if (config.schedule?.weeklySchedule) {
        setWeeklySchedule({ ...DEFAULT_WEEKLY_SCHEDULE, ...config.schedule.weeklySchedule });
      } else {
        const openT = config.schedule?.openTime || '08:00';
        const closeT = config.schedule?.closeTime || '20:00';
        const daysO = config.schedule?.daysOpen || DAYS_OF_WEEK;
        const initSched: Record<string, DaySchedule> = {};
        DAYS_OF_WEEK.forEach(day => {
          initSched[day] = {
            isOpen: daysO.includes(day),
            openTime: openT,
            closeTime: closeT
          };
        });
        setWeeklySchedule(initSched);
      }
    }

    // State Isolation for Minimarket (Donde el Turco)
    const cachedTurco = localStorage.getItem('turco_categories_v1');
    let initialTurcoCats = ['Bebidas', 'Abarrotes', 'Lácteos', 'Snacks'];
    if (cachedTurco) {
      initialTurcoCats = JSON.parse(cachedTurco);
    } else if (config.productCategories && config.productCategories.length > 0) {
      initialTurcoCats = config.productCategories;
      localStorage.setItem('turco_categories_v1', JSON.stringify(initialTurcoCats));
    } else {
      localStorage.setItem('turco_categories_v1', JSON.stringify(initialTurcoCats));
    }
    setProductCategoriesList(initialTurcoCats);

    setFoodItemCategoriesList(config.foodItemCategories || ['Almuerzos', 'Sopas', 'Postres', 'Bebidas']);

    // Clean & Force Override for Frutería Categories with official 8 categories
    const officialFruteriaNames = FRUTERIA_CATEGORY_MAP.map(s => s.name);
    const cachedFruteria = localStorage.getItem('fruteria_categories_v1');
    let initialFruteriaCats: string[] = [...officialFruteriaNames];

    if (cachedFruteria) {
      try {
        const parsed = JSON.parse(cachedFruteria);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed
            .map((c: string) => {
              if (c === 'Frutas Frescas') return 'Frutas';
              if (c === 'Verduras y Hortalizas') return 'Verduras';
              if (c === 'Legumbres') return 'Semillas';
              if (['Hierbas y Aliños', 'Hongos y Champiñones', 'Congelados y Pulpas', 'Ofertas / Remates'].includes(c)) return null;
              return c;
            })
            .filter((c: string | null): c is string => Boolean(c));

          const merged = [...officialFruteriaNames];
          cleaned.forEach((c: string) => {
            if (!merged.includes(c)) merged.push(c);
          });
          initialFruteriaCats = merged;
        }
      } catch (e) {
        console.error("Error parsing cached fruteria categories:", e);
      }
    }

    setFruteriaCategoriesList(initialFruteriaCats);
    localStorage.setItem('fruteria_categories_v1', JSON.stringify(initialFruteriaCats));

    // State Isolation for Ártico Congelados
    const OFFICIAL_ARTICO_DEFAULTS = [
      'Carnes y Churrascos',
      'Hamburguesas y Prefritos',
      'Congelados y Pulpas',
      'Mariscos y Pescados',
      'Refrigerados y Cecinas',
      'Kits y Huevos'
    ];
    const cachedArtico = localStorage.getItem('artico_categories_data') || localStorage.getItem('artico_categories_v1');
    let initialArticoCats = [...OFFICIAL_ARTICO_DEFAULTS];
    if (cachedArtico) {
      try {
        const parsed = JSON.parse(cachedArtico);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialArticoCats = parsed.map((c: string) => c.replace(/^[^\w\sÁÉÍÓÚáéíóúÑñ]+/, '').trim()).filter(Boolean);
        }
      } catch (e) {
        console.error("Error parsing cached artico categories:", e);
      }
    } else if (config.articoCategories && config.articoCategories.length > 0) {
      initialArticoCats = config.articoCategories.map((c: string) => c.replace(/^[^\w\sÁÉÍÓÚáéíóúÑñ]+/, '').trim()).filter(Boolean);
    }
    setArticoCategoriesList(initialArticoCats);
    localStorage.setItem('artico_categories_data', JSON.stringify(initialArticoCats));
    localStorage.setItem('artico_categories_v1', JSON.stringify(initialArticoCats));

    // State Isolation for Farmacia Categories
    const OFFICIAL_FARMACIA_DEFAULTS = [
      'Medicamentos',
      'Cuidado de la Salud',
      'Mamá y Bebé',
      'Cuidado Personal',
      'Belleza',
      'Vitaminas y Suplementos',
      'Adulto Mayor',
      'Conveniencia'
    ];
    const cachedFarmacia = localStorage.getItem('farmacia_categories_v1');
    let initialFarmaciaCats = [...OFFICIAL_FARMACIA_DEFAULTS];
    if (cachedFarmacia) {
      try {
        const parsed = JSON.parse(cachedFarmacia);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialFarmaciaCats = parsed;
        }
      } catch (e) {
        console.error("Error parsing cached farmacia categories:", e);
      }
    } else if (config.farmaciaCategories && config.farmaciaCategories.length > 0) {
      initialFarmaciaCats = config.farmaciaCategories;
    }
    setFarmaciaCategoriesList(initialFarmaciaCats);
    localStorage.setItem('farmacia_categories_v1', JSON.stringify(initialFarmaciaCats));

    // State Isolation for Pizza Categories
    const OFFICIAL_PIZZA_DEFAULTS = [
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
    const cachedPizza = localStorage.getItem('pizza_categories_v1') || localStorage.getItem('pizza_categories_data');
    let initialPizzaCats = [...OFFICIAL_PIZZA_DEFAULTS];
    if (cachedPizza) {
      try {
        const parsed = JSON.parse(cachedPizza);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialPizzaCats = parsed;
        }
      } catch (e) {
        console.error("Error parsing cached pizza categories:", e);
      }
    } else if (config.pizzaCategories && config.pizzaCategories.length > 0) {
      initialPizzaCats = config.pizzaCategories;
    }
    setPizzaCategoriesList(initialPizzaCats);
    localStorage.setItem('pizza_categories_v1', JSON.stringify(initialPizzaCats));

    const savedIcons = JSON.parse(localStorage.getItem('category_icons_v1') || '{}');
    const PIZZA_DEFAULT_STICKERS: Record<string, string> = {
      'Pizzas Tradicionales': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png',
      'Pizzas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png',
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
      'Ají / Picante': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hot%20Pepper.png'
    };
    const FARMACIA_DEFAULT_STICKERS: Record<string, string> = {
      'Medicamentos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Pill.png',
      'Cuidado de la Salud': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Stethoscope.png',
      'Mamá y Bebé': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Baby%20Bottle.png',
      'Cuidado Personal': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lotion%20Bottle.png',
      'Belleza': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Lipstick.png',
      'Vitaminas y Suplementos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Symbols/Dna.png',
      'Adulto Mayor': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Probing%20Cane.png',
      'Conveniencia': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Travel%20Places/Convenience%20Store.png'
    };
    const initialIcons = {
      ...PIZZA_DEFAULT_STICKERS,
      ...FARMACIA_DEFAULT_STICKERS,
      ...(config.categoryIcons || {}),
      ...savedIcons
    };
    FRUTERIA_CATEGORY_MAP.forEach(s => {
      if (!initialIcons[s.name]) {
        initialIcons[s.name] = getFruteria3DUrl(s.icon) || s.icon;
      }
    });
    setCategoryIconsList(initialIcons);
    localStorage.setItem('category_icons_v1', JSON.stringify(initialIcons));

    setSiiEnabled(config.siiEnabled || false);
    setSiiRut(config.siiRut || '');
    setSiiDigitalCert(config.siiDigitalCert || '');
    setSiiApiKey(config.siiApiKey || '');
    setModulosActivos(config.modulosActivos || {
      tiendaAbarrotes: true,
      cocinaAlmuerzos: true,
      bodega: true,
      farmacia: true,
      frutería: true
    });

    const cachedArticoMods = localStorage.getItem('artico_active_modules');
    if (cachedArticoMods) {
      try {
        setArticoActiveModules(JSON.parse(cachedArticoMods));
      } catch (e) {
        console.error("Error parsing artico_active_modules:", e);
      }
    } else if (config.articoActiveModules) {
      setArticoActiveModules(config.articoActiveModules as any);
    } else {
      const defaultArticoMods = {
        congeladosPulpas: true,
        carnesChurrascos: true,
        mariscosPescados: true,
        refrigeradosCecinas: true,
        kitsCajasCerradas: true
      };
      setArticoActiveModules(defaultArticoMods);
      localStorage.setItem('artico_active_modules', JSON.stringify(defaultArticoMods));
    }

    const cachedFarmaciaMods = localStorage.getItem('farmacia_active_modules');
    if (cachedFarmaciaMods) {
      try {
        setFarmaciaActiveModules(JSON.parse(cachedFarmaciaMods));
      } catch (e) {
        console.error("Error parsing farmacia_active_modules:", e);
      }
    } else if (config.farmaciaActiveModules) {
      setFarmaciaActiveModules(config.farmaciaActiveModules as any);
    } else {
      const defaultFarmaciaMods = {
        medicamentos: true,
        cuidadoSalud: true,
        mamaBebe: true,
        cuidadoPersonal: true,
        belleza: true,
        vitaminasSuplementos: true,
        adultoMayor: true,
        conveniencia: true
      };
      setFarmaciaActiveModules(defaultFarmaciaMods);
      localStorage.setItem('farmacia_active_modules', JSON.stringify(defaultFarmaciaMods));
    }

    const cachedRutas = localStorage.getItem('rutas_camion_v1');
    if (cachedRutas) {
      try {
        setRutasCamion(JSON.parse(cachedRutas));
      } catch (e) {
        setRutasCamion(config.rutasCamion || DEFAULT_RUTAS_CAMION);
      }
    } else {
      setRutasCamion(config.rutasCamion || DEFAULT_RUTAS_CAMION);
    }
  }, [config]);

  // Fetch employees list from config/business_info/empleados subcollection
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const ref = tenantId
          ? collection(db, 'tenants', tenantId, 'config', 'business_info', 'empleados')
          : collection(db, 'config', 'business_info', 'empleados');
        const snap = await getDocs(ref);
        const list: Empleado[] = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() } as Empleado);
        });
        
        // Ensure there are at least 3 slots for employees to configure
        const filledList = [...list];
        while (filledList.length < 3) {
          filledList.push({
            id: `emp_${filledList.length + 1}`,
            name: '',
            pin: '',
            role: 'cajero'
          });
        }
        const final3 = filledList.slice(0, 3);
        setEmployeesList(final3);
        
        // Default select first employee with a name if none selected
        const firstWithName = final3.find(e => e.name.trim() !== '');
        if (firstWithName) {
          setLoginSelectedEmpId(firstWithName.id);
        } else if (final3.length > 0) {
          setLoginSelectedEmpId(final3[0].id);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    }
    fetchEmployees();
  }, []);

  const handleAddProductCat = () => {
    const val = newProductCat.trim();
    if (!val) return;
    if (productCategoriesList.includes(val)) return;
    const nextList = [...productCategoriesList, val];
    setProductCategoriesList(nextList);
    localStorage.setItem('turco_categories_v1', JSON.stringify(nextList));
    setCategoryIconsList(prev => ({
      ...prev,
      [val]: productSelectedEmoji
    }));
    setNewProductCat('');
  };

  const handleAddFoodCat = () => {
    const val = newFoodCat.trim();
    if (!val) return;
    if (foodItemCategoriesList.includes(val)) return;
    setFoodItemCategoriesList([...foodItemCategoriesList, val]);
    setCategoryIconsList(prev => ({
      ...prev,
      [val]: foodSelectedEmoji
    }));
    setNewFoodCat('');
  };

  const handleRemoveProductCat = (cat: string) => {
    const nextList = productCategoriesList.filter(c => c !== cat);
    setProductCategoriesList(nextList);
    localStorage.setItem('turco_categories_v1', JSON.stringify(nextList));
    setCategoryIconsList(prev => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
  };

  const handleRemoveFoodCat = (cat: string) => {
    setFoodItemCategoriesList(foodItemCategoriesList.filter(c => c !== cat));
    setCategoryIconsList(prev => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
  };

  const handleAddArticoCat = () => {
    const val = newArticoCat.trim();
    if (!val) return;
    if (articoCategoriesList.includes(val)) return;
    const nextList = [...articoCategoriesList, val];
    setArticoCategoriesList(nextList);
    localStorage.setItem('artico_categories_data', JSON.stringify(nextList));
    localStorage.setItem('artico_categories_v1', JSON.stringify(nextList));

    const activeSticker = articoSelectedEmoji || 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Ice.png';
    const updatedIcons = {
      ...categoryIconsList,
      [val]: activeSticker
    };
    setCategoryIconsList(updatedIcons);

    try {
      const savedIcons = JSON.parse(localStorage.getItem('category_icons_v1') || '{}');
      savedIcons[val] = activeSticker;
      localStorage.setItem('category_icons_v1', JSON.stringify(savedIcons));
    } catch (e) {
      console.error("Error persisting category_icons_v1:", e);
    }

    setNewArticoCat('');
  };

  const handleRemoveArticoCat = (cat: string) => {
    const nextList = articoCategoriesList.filter(c => c !== cat);
    setArticoCategoriesList(nextList);
    localStorage.setItem('artico_categories_data', JSON.stringify(nextList));
    localStorage.setItem('artico_categories_v1', JSON.stringify(nextList));
    setCategoryIconsList(prev => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
  };

  const handleAddFarmaciaCat = () => {
    const val = newFarmaciaCat.trim();
    if (!val) return;
    if (farmaciaCategoriesList.includes(val)) return;
    const nextList = [...farmaciaCategoriesList, val];
    setFarmaciaCategoriesList(nextList);
    localStorage.setItem('farmacia_categories_v1', JSON.stringify(nextList));

    const activeSticker = farmaciaSelectedEmoji || 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Pill.png';
    const updatedIcons = {
      ...categoryIconsList,
      [val]: activeSticker
    };
    setCategoryIconsList(updatedIcons);

    try {
      const savedIcons = JSON.parse(localStorage.getItem('category_icons_v1') || '{}');
      savedIcons[val] = activeSticker;
      localStorage.setItem('category_icons_v1', JSON.stringify(savedIcons));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('category_icons_updated'));
      }
    } catch (e) {
      console.error("Error persisting category_icons_v1:", e);
    }

    setNewFarmaciaCat('');
  };

  const handleRemoveFarmaciaCat = (cat: string) => {
    const nextList = farmaciaCategoriesList.filter(c => c !== cat);
    setFarmaciaCategoriesList(nextList);
    localStorage.setItem('farmacia_categories_v1', JSON.stringify(nextList));
    setCategoryIconsList(prev => {
      const next = { ...prev };
      delete next[cat];
      try {
        localStorage.setItem('category_icons_v1', JSON.stringify(next));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('category_icons_updated'));
        }
      } catch (e) {}
      return next;
    });
  };

  const handleAddFruteriaCat = () => {
    const val = newFruteriaCat.trim();
    if (!val) return;
    if (fruteriaCategoriesList.includes(val)) return;
    const nextList = [...fruteriaCategoriesList, val];
    setFruteriaCategoriesList(nextList);
    localStorage.setItem('fruteria_categories_v1', JSON.stringify(nextList));

    const activeSticker = fruteriaSelectedEmoji || DEFAULT_CATEGORY_ICONS['Frutas'];
    const updatedIcons = {
      ...categoryIconsList,
      [val]: activeSticker
    };
    setCategoryIconsList(updatedIcons);

    try {
      const savedIcons = JSON.parse(localStorage.getItem('category_icons_v1') || '{}');
      savedIcons[val] = activeSticker;
      localStorage.setItem('category_icons_v1', JSON.stringify(savedIcons));
    } catch (e) {
      console.error("Error persisting category_icons_v1:", e);
    }

    setNewFruteriaCat('');
  };

  const handleRemoveFruteriaCat = (cat: string) => {
    const nextList = fruteriaCategoriesList.filter(c => c !== cat);
    setFruteriaCategoriesList(nextList);
    localStorage.setItem('fruteria_categories_v1', JSON.stringify(nextList));
    setCategoryIconsList(prev => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
  };

  // Handle cell phone gallery selection & browser canvas mini-compression to keep data fast and small (under 80kb)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Optimal display width for phone banners
        const scale = MAX_WIDTH / img.width;
        const width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        const height = img.width > MAX_WIDTH ? img.height * scale : img.height;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress high resolution files to light JPEG representation
          const compressed = canvas.toDataURL('image/jpeg', 0.65);
          setLocalBannerUrl(compressed);
          const activeStore = getActiveStoreInfo();
          localStorage.setItem(`${activeStore.key}_banner_v1`, compressed);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Handle physical keyboard keypresses when screen is locked
  useEffect(() => {
    if (isUnlocked) return;

    let buffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keys if they are typing in an input element
      if (document.activeElement?.tagName === 'INPUT') {
        return;
      }
      
      const key = e.key;
      if (key === 'Backspace') {
        buffer = buffer.slice(0, -1);
      } else if (key.length === 1) {
        buffer += key;
        if (buffer.length > 20) {
          buffer = buffer.slice(-20);
        }
        
        if (buffer.endsWith('Saraghina2024') || buffer.endsWith('2024') || buffer.endsWith('Aramis2012')) {
          onUnlockMaster(true);
          onUnlock(true);
          const devEmp: Empleado = { id: 'dev', name: 'Desarrollador', pin: 'Saraghina2024', role: 'admin' };
          onLoginSuccess(devEmp);
          buffer = '';
        } else if (buffer.endsWith(config.adminPin || '1234')) {
          onUnlock(true);
          onUnlockMaster(false);
          const ownerEmp: Empleado = { id: 'dueno', name: 'Dueño', pin: config.adminPin || '1234', role: 'admin' };
          onLoginSuccess(ownerEmp);
          buffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUnlocked, onUnlock, onUnlockMaster, config.adminPin, onLoginSuccess]);

  const handleVerifyPin = (overridePin?: string) => {
    const pinToVerify = (overridePin !== undefined ? overridePin : pin).trim();
    
    // 1. Master/Desarrollador Bypass
    if (pinToVerify === 'Saraghina2024' || pinToVerify === '2024' || pinToVerify === 'Aramis2012') {
      onUnlockMaster(true);
      onUnlock(true);
      const devEmp: Empleado = { id: 'dev', name: 'Desarrollador', pin: pinToVerify, role: 'admin' };
      onLoginSuccess(devEmp);
      setPin('');
      return;
    }
    
    // 2. Dueño Login
    if (loginRole === 'dueno') {
      const correctPin = config.adminPin || '1234';
      if (pinToVerify === correctPin) {
        onUnlock(true);
        onUnlockMaster(false);
        const ownerEmp: Empleado = { id: 'dueno', name: 'Dueño', pin: pinToVerify, role: 'admin' };
        onLoginSuccess(ownerEmp);
        setPin('');
      } else {
        setPinError(true);
        setTimeout(() => {
          setPin('');
          setPinError(false);
        }, 1500);
      }
    } 
    // 3. Empleado Login
    else {
      const selectedEmp = employeesList.find(e => e.id === loginSelectedEmpId);
      if (selectedEmp && selectedEmp.pin === pinToVerify) {
        onUnlock(false);
        onUnlockMaster(false);
        onLoginSuccess(selectedEmp);
        setPin('');
      } else {
        setPinError(true);
        setTimeout(() => {
          setPin('');
          setPinError(false);
        }, 1500);
      }
    }
  };

  // Handle dial entries
  const handleDial = (num: string) => {
    if (pinError) setPinError(false);
    const nextPin = pin + num;
    setPin(nextPin);
    
    // Auto check if it matches master PIN
    if (nextPin === '2024' || nextPin === 'Saraghina2024' || nextPin === 'Aramis2012') {
      onUnlockMaster(true);
      onUnlock(true);
      const devEmp: Empleado = { id: 'dev', name: 'Desarrollador', pin: nextPin, role: 'admin' };
      onLoginSuccess(devEmp);
      setPin('');
      return;
    }

    // Check if nextPin is a prefix of any master pin to prevent early auto-submit
    const isMasterPrefix = 
      'Saraghina2024'.startsWith(nextPin) || 
      'Aramis2012'.startsWith(nextPin);

    if (isMasterPrefix) {
      return;
    }

    // Auto submit employee PIN if they complete 4 digits
    if (loginRole === 'empleado' && nextPin.length === 4) {
      const selectedEmp = employeesList.find(e => e.id === loginSelectedEmpId);
      if (selectedEmp && selectedEmp.pin === nextPin) {
        onUnlock(false);
        onUnlockMaster(false);
        onLoginSuccess(selectedEmp);
        setPin('');
      } else {
        setPinError(true);
        setTimeout(() => {
          setPin('');
          setPinError(false);
        }, 1500);
      }
    }
    // Auto submit owner PIN if they complete their configured 4-digit PIN
    else if (loginRole === 'dueno' && nextPin.length === (config.adminPin || '1234').length) {
      const correctPin = config.adminPin || '1234';
      if (nextPin === correctPin) {
        onUnlock(true);
        onUnlockMaster(false);
        const ownerEmp: Empleado = { id: 'dueno', name: 'Dueño', pin: nextPin, role: 'admin' };
        onLoginSuccess(ownerEmp);
        setPin('');
      }
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const handleBackspace = () => {
    setPin(p => p.slice(0, -1));
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const activeDays = DAYS_OF_WEEK.filter(d => weeklySchedule[d]?.isOpen);
      const scheduleObj: ScheduleConfig = {
        mode: scheduleMode,
        openTime: weeklySchedule['Lunes']?.openTime || scheduleOpenTime || '08:00',
        closeTime: weeklySchedule['Lunes']?.closeTime || scheduleCloseTime || '20:00',
        daysOpen: activeDays,
        weeklySchedule: weeklySchedule
      };

      await onUpdateConfig({
        ...config,
        id: config.id || 'business_info',
        name: localName.trim(),
        whatsapp: whatsapp.trim(),
        gps: gps.trim(),
        adminPin: adminPinField.trim(),
        bannerUrl: localBannerUrl.trim(),
        ivaPercentage: Number(ivaPercentInput),
        schedule: scheduleObj,
        productCategories: productCategoriesList,
        foodItemCategories: foodItemCategoriesList,
        fruteriaCategories: fruteriaCategoriesList,
        articoCategories: articoCategoriesList,
        farmaciaCategories: farmaciaCategoriesList,
        categoryIcons: categoryIconsList,
        siiEnabled,
        siiRut: siiRut.trim(),
        siiDigitalCert: siiDigitalCert.trim(),
        siiApiKey: siiApiKey.trim(),
        modulosActivos,
        articoActiveModules,
        farmaciaActiveModules,
        rutasCamion
      });
      localStorage.setItem('artico_active_modules', JSON.stringify(articoActiveModules));
      localStorage.setItem('farmacia_active_modules', JSON.stringify(farmaciaActiveModules));
      if (rutasCamion) {
        localStorage.setItem('rutas_camion_v1', JSON.stringify(rutasCamion));
      }
      localStorage.setItem(`${activeStoreInfo.key}_schedule_v1`, JSON.stringify(scheduleObj));

      // Save each employee slot to the config/business_info/empleados subcollection
      for (const emp of employeesList) {
        if (emp.name.trim() && emp.pin.trim()) {
          const empDocRef = tenantId
            ? doc(db, 'tenants', tenantId, 'config', 'business_info', 'empleados', emp.id)
            : doc(db, 'config', 'business_info', 'empleados', emp.id);
          await setDoc(empDocRef, {
            id: emp.id,
            name: emp.name.trim(),
            pin: emp.pin.trim(),
            role: emp.role || 'cajero'
          });
        } else {
          // If empty, clean up document
          const empDocRef = tenantId
            ? doc(db, 'tenants', tenantId, 'config', 'business_info', 'empleados', emp.id)
            : doc(db, 'config', 'business_info', 'empleados', emp.id);
          await deleteDoc(empDocRef).catch(() => {});
        }
      }

      // Contextual save of categories and banner to isolated localStorage keys according to active store
      const storeBannerKey = `${activeStoreInfo.key}_banner_v1`;
      if (localBannerUrl.trim()) {
        localStorage.setItem(storeBannerKey, localBannerUrl.trim());
      }

      if (activeStoreInfo.key === 'turco') {
        localStorage.setItem('turco_categories_v1', JSON.stringify(productCategoriesList));
      } else if (activeStoreInfo.key === 'fruteria') {
        localStorage.setItem('fruteria_categories_v1', JSON.stringify(fruteriaCategoriesList));
      } else if (activeStoreInfo.key === 'artico') {
        localStorage.setItem('artico_categories_data', JSON.stringify(articoCategoriesList));
        localStorage.setItem('artico_categories_v1', JSON.stringify(articoCategoriesList));
      } else if (activeStoreInfo.key === 'farmacia') {
        localStorage.setItem('farmacia_categories_v1', JSON.stringify(farmaciaCategoriesList));
      } else {
        localStorage.setItem('turco_categories_v1', JSON.stringify(productCategoriesList));
        localStorage.setItem('fruteria_categories_v1', JSON.stringify(fruteriaCategoriesList));
        localStorage.setItem('artico_categories_data', JSON.stringify(articoCategoriesList));
        localStorage.setItem('artico_categories_v1', JSON.stringify(articoCategoriesList));
        localStorage.setItem('farmacia_categories_v1', JSON.stringify(farmaciaCategoriesList));
      }

      setNotifySaved(true);
      setTimeout(() => setNotifySaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (sectorKey: string, day: string) => {
    setRutasCamion(prev => {
      const currentConfig = prev || DEFAULT_RUTAS_CAMION;
      const sector = currentConfig[sectorKey];
      if (!sector) return currentConfig;
      const days = sector.days.includes(day)
        ? sector.days.filter(d => d !== day)
        : [...sector.days, day];
      return {
        ...currentConfig,
        [sectorKey]: {
          ...sector,
          days
        }
      };
    });
  };

  const handleFeeChange = (sectorKey: string, val: string) => {
    const feeNum = parseFloat(val) || 0;
    setRutasCamion(prev => {
      const currentConfig = prev || DEFAULT_RUTAS_CAMION;
      const sector = currentConfig[sectorKey];
      if (!sector) return currentConfig;
      return {
        ...currentConfig,
        [sectorKey]: {
          ...sector,
          fee: feeNum
        }
      };
    });
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    setLoading(true);
    try {
      const parsedStock = Math.max(0, Math.floor(Number(dishStock)) || 0);
      const parsedPrecioOferta = dishEnOferta ? (parseFloat(dishPrecioOferta) || 0) : null;
      if (editingDish) {
        if (onEditFoodItem) {
          await onEditFoodItem({
            ...editingDish,
            name: dishName.trim(),
            description: dishDesc.trim(),
            price: parseFloat(dishPrice) || 0,
            category: dishCategory,
            stock: parsedStock,
            imageUrl: dishImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200',
            enOferta: dishEnOferta,
            precioOferta: parsedPrecioOferta
          });
        }
      } else {
        await onAddFoodItem({
          name: dishName.trim(),
          description: dishDesc.trim(),
          price: parseFloat(dishPrice) || 0,
          category: dishCategory,
          isPopular: false,
          stock: parsedStock,
          imageUrl: dishImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200',
          enOferta: dishEnOferta,
          precioOferta: parsedPrecioOferta
        });
      }
      setDishName('');
      setDishDesc('');
      setDishPrice('');
      setDishStock('0');
      setDishImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200');
      setDishEnOferta(false);
      setDishPrecioOferta('');
      setEditingDish(null);
      setShowDishModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteDish = async () => {
    if (!confirmDeleteDish) return;
    const { id } = confirmDeleteDish;
    setConfirmDeleteDish(null);
    setLoading(true);
    try {
      await onDeleteFoodItem(id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDishItem = (id: string, name: string) => {
    setConfirmDeleteDish({ id, name });
  };

  // 1. Employee Dashboard (Active Non-Admin/Cajero Session)
  if (currentEmployee && currentEmployee.role === 'cajero') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-2 text-indigo-600 select-none">
          <ShieldCheck className="w-8 h-8 stroke-[1.8]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight">Sesión de Empleado</h2>
          <p className="text-xs text-slate-500 font-semibold">
            Usuario activo: <span className="text-indigo-650 font-black">{currentEmployee.name}</span>
          </p>
          <p className="text-[11px] text-slate-405 font-medium px-6 max-w-xs mx-auto leading-normal">
            La pestaña de configuración está restringida para el personal de caja. Pídale al Dueño desbloquearla con su clave si necesita realizar cambios.
          </p>
        </div>
        <button
          onClick={() => {
            onLoginSuccess(null);
            onUnlock(false);
            onUnlockMaster(false);
          }}
          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95 uppercase tracking-wider cursor-pointer"
        >
          🔒 Cerrar Sesión
        </button>
      </div>
    );
  }

  // 2. LOCK SCREEN (Initial Auth State)
  if (!isUnlocked) {
    // Only show employees that have a name configured
    const activeEmployees = employeesList.filter(e => e.name.trim() !== '');

    return (
      <div id="lockscreen-container" className="flex flex-col items-center justify-center min-h-[500px] space-y-7 animate-in fade-in duration-300 animate-out duration-300">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-2 text-indigo-600 select-none">
            <ShieldCheck className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight">Acceso Restringido</h2>
          <p className="text-xs text-gray-405 font-medium leading-normal">
            Seleccione su rol e ingrese sus credenciales para continuar
          </p>
        </div>

        {/* Unified Selector Panel */}
        <div className="w-full max-w-[270px] space-y-4">
          {/* Dropdown: Seleccionar Rol */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">
              Rol de Acceso
            </label>
            <select
              value={loginRole}
              onChange={(e) => {
                const role = e.target.value as 'dueno' | 'empleado';
                setLoginRole(role);
                setPin('');
                setPinError(false);
                if (role === 'empleado' && activeEmployees.length > 0) {
                  setLoginSelectedEmpId(activeEmployees[0].id);
                }
              }}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-bold text-center focus:outline-none focus:border-indigo-600 transition-all text-sm shadow-sm cursor-pointer"
            >
              <option value="empleado">Empleado (Cajero)</option>
              <option value="dueno">Dueño / Administrador</option>
            </select>
          </div>

          {/* Dropdown: Seleccionar Empleado (only visible if role is Empleado) */}
          {loginRole === 'empleado' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">
                Seleccione su Usuario
              </label>
              <select
                value={loginSelectedEmpId}
                onChange={(e) => {
                  setLoginSelectedEmpId(e.target.value);
                  setPin('');
                  setPinError(false);
                }}
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-extrabold text-center focus:outline-none focus:border-indigo-600 transition-all text-sm shadow-sm cursor-pointer"
              >
                {activeEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
                {activeEmployees.length === 0 && (
                  <option value="">Sin empleados registrados</option>
                )}
              </select>
            </div>
          )}

          {/* Password/PIN Input Field */}
          <div className="space-y-1">
            <input
              type="password"
              placeholder="PIN o Clave Alfanumérica"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleVerifyPin();
                }
              }}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-center font-black text-slate-850 focus:outline-none focus:border-indigo-600 transition-all text-sm shadow-sm tracking-widest outline-none"
              autoFocus
            />

            <button
              onClick={() => handleVerifyPin()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl transition-all shadow-md active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Desbloquear</span>
            </button>
          </div>
        </div>

        {/* Visual Dots Indicators */}
        <div className={`flex gap-4 py-1 items-center ${pinError ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const active = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  pinError 
                    ? 'border-rose-400 bg-rose-500 shadow-rose-200 shadow-sm' 
                    : active 
                      ? 'border-indigo-600 bg-indigo-600 shadow-indigo-100 shadow-md scale-110' 
                      : 'border-gray-200 bg-transparent'
                }`}
              ></div>
            );
          })}
          {pin.length > 4 && (
            <span className="text-[10px] text-indigo-600 font-extrabold font-mono leading-none bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">+{pin.length - 4}</span>
          )}
        </div>

        {/* Tactical Dial Numeric Pad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[270px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDial(num)}
              className="h-15 rounded-2xl bg-gray-50 border border-gray-100/50 hover:bg-gray-100/80 font-bold text-gray-800 text-lg active:scale-90 transition-transform flex items-center justify-center outline-none select-none cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-15 rounded-2xl text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center justify-center outline-none select-none cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={() => handleDial('0')}
            className="h-15 rounded-2xl bg-gray-50 border border-gray-100/50 hover:bg-gray-100/80 font-bold text-gray-800 text-lg active:scale-90 transition-transform flex items-center justify-center outline-none select-none cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-15 rounded-2xl text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center justify-center outline-none select-none cursor-pointer"
          >
            Backspace
          </button>
        </div>
      </div>
    );
  }

  // 2. UNLOCKED STATE (Admin dashboard revealed)
  return (
    <div id="admin-dashboard-container" className="space-y-6 pb-28 animate-in slide-in-from-bottom-8 duration-400">
      
      {/* Admin Quick Status and Logout bar */}
      <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-indigo-650 rounded-full animate-pulse shrink-0"></div>
          <span className="text-xs font-extrabold text-indigo-950 font-sans">Sesión de Dueño Activa</span>
        </div>
        <button
          onClick={() => {
            onUnlock(false);
            setPin('');
          }}
          className="bg-white border border-indigo-200 hover:bg-slate-50 text-indigo-700 font-extrabold text-[10px] px-3 py-1.5 rounded-xl shadow-3xs cursor-pointer select-none"
        >
          🔒 Cerrar Sesión
        </button>
      </div>

      {/* Messages banner */}
      {notifySaved && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold animate-in fade-in duration-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>¡Datos actualizados con éxito en Firestore!</span>
        </div>
      )}

      {/* Section A: Global operational variables editing card */}
      <section className="space-y-3">
        <h3 className="text-sm font-extrabold text-gray-950 px-1 uppercase tracking-wider">
          Datos del Negocio (Punto de Venta)
        </h3>
        
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">Nombre del Local</label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white transition-all font-semibold outline-none"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp del Dueño (Recibe Pedidos de Clientes)</label>
            <input
              type="tel"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white transition-all font-semibold outline-none"
              placeholder="Ej: 5491112345678"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            <span className="text-[9px] text-indigo-600 font-bold block leading-tight pt-1">
              ⚠️ Ingrese el código de país y número celular (ejemplo: argentino sin prefijos raros, solo números, sin "+" ni guiones). Ej: 5491112345678. Los clientes le enviarán aquí sus carritos de compra.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">Ubicación GPS / Dirección</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm pr-9 focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white outline-none"
                  value={gps}
                  onChange={(e) => setGps(e.target.value)}
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">PIN del Administrador</label>
              <input
                type="text"
                placeholder="Ej. 1234"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white outline-none text-center font-bold"
                value={adminPinField}
                onChange={(e) => setAdminPinField(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label id="iva-factor-label" className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">Porcentaje de IVA (%)</label>
            <input
              id="iva-factor-input"
              type="number"
              step="any"
              min="0"
              max="100"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white transition-all font-semibold outline-none"
              placeholder="Ej. 15 o según regulación fiscal"
              value={ivaPercentInput}
              onChange={(e) => setIvaPercentInput(parseFloat(e.target.value) || 0)}
            />
            <span className="text-[9px] text-gray-400 font-bold block">
              Se utilizará este porcentaje para calcular los impuestos (IVA) automática y dinámicamente al momento de confirmar ventas y generar tickets de respaldo.
            </span>
          </div>

          {/* ⏰ Horario de Funcionamiento y Estado de Tienda */}
          <div className="space-y-3.5 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[10.5px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>HORARIO DE ATENCIÓN Y ESTADO AUTOMÁTICO</span>
                </label>
                <span className="text-[9.5px] text-gray-500 font-semibold block leading-tight mt-0.5">
                  Define el horario de la tienda para que el distintivo superior cambie automáticamente a "ABIERTO" o "CERRADO".
                </span>
              </div>
            </div>

            {/* Modo de Operación Selection */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Modo de Operación:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleMode('auto')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all border cursor-pointer text-center ${
                    scheduleMode === 'auto'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ⚡ Automático
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleMode('forced_open')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all border cursor-pointer text-center ${
                    scheduleMode === 'forced_open'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🟢 Forzar Abierto
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleMode('forced_closed')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all border cursor-pointer text-center ${
                    scheduleMode === 'forced_closed'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🔴 Forzar Cerrado
                </button>
              </div>
            </div>

            {/* Realtime Live Calculated Status Box */}
            {(() => {
              const currentCalculatedStatus = checkStoreOpenStatus({
                mode: scheduleMode,
                openTime: scheduleOpenTime,
                closeTime: scheduleCloseTime,
                daysOpen: DAYS_OF_WEEK.filter(d => weeklySchedule[d]?.isOpen),
                weeklySchedule: weeklySchedule
              });
              return (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-extrabold ${
                  currentCalculatedStatus.isOpen
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/70 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      currentCalculatedStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`} />
                    <span>
                      Estado Actual Calculado: <strong>{currentCalculatedStatus.isOpen ? 'ABIERTO' : 'CERRADO'}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold opacity-80">{currentCalculatedStatus.reason}</span>
                </div>
              );
            })()}

            {/* Quick Actions Shortcuts Toolbar */}
            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Acciones Rápidas de Horario:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const lunesOpen = weeklySchedule['Lunes']?.openTime || '08:00';
                    const lunesClose = weeklySchedule['Lunes']?.closeTime || '20:00';
                    setWeeklySchedule(prev => {
                      const next = { ...prev };
                      DAYS_OF_WEEK.forEach(day => {
                        if (next[day]) {
                          next[day] = { ...next[day], openTime: lunesOpen, closeTime: lunesClose };
                        }
                      });
                      return next;
                    });
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 text-[11px] font-extrabold cursor-pointer transition-all flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copiar Horario de Lunes a Toda la Semana
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWeeklySchedule(prev => {
                      const next = { ...prev };
                      DAYS_OF_WEEK.forEach(day => {
                        next[day] = { isOpen: true, openTime: '09:00', closeTime: '21:00' };
                      });
                      return next;
                    });
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold cursor-pointer transition-all"
                >
                  ⚡ Aplicar 09:00 - 21:00 (Lunes a Domingo)
                </button>
              </div>
            </div>

            {/* Per-Day Hours Editor */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-extrabold text-slate-700 uppercase tracking-wider block">
                  Configuración de Horario por Día Individual:
                </span>
                <span className="text-[9.5px] font-bold text-slate-400">
                  Personalice apertura y cierre para cada día
                </span>
              </div>

              <div className="space-y-2">
                {DAYS_OF_WEEK.map(day => {
                  const dayConfig = weeklySchedule[day] || { isOpen: true, openTime: '08:00', closeTime: '20:00' };
                  return (
                    <div
                      key={day}
                      className={`p-2.5 rounded-2xl border transition-all ${
                        dayConfig.isOpen
                          ? 'bg-white border-slate-200/90 shadow-2xs'
                          : 'bg-slate-50/80 border-slate-200/50 opacity-75'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {/* Day Label & Toggle Switch */}
                        <div className="flex items-center gap-2.5 min-w-[130px]">
                          <button
                            type="button"
                            onClick={() => {
                              setWeeklySchedule(prev => ({
                                ...prev,
                                [day]: {
                                  ...dayConfig,
                                  isOpen: !dayConfig.isOpen
                                }
                              }));
                            }}
                            className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                              dayConfig.isOpen ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                            }`}
                          >
                            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-2xs" />
                          </button>

                          <span className="text-xs font-black text-slate-800">
                            {day}
                          </span>

                          <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${
                            dayConfig.isOpen
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {dayConfig.isOpen ? 'ABIERTO' : 'CERRADO'}
                          </span>
                        </div>

                        {/* Hours Inputs */}
                        {dayConfig.isOpen ? (
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <div className="flex items-center gap-1">
                              <span className="text-[9.5px] font-bold text-slate-400">Abre:</span>
                              <input
                                type="time"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 outline-none w-24 text-center"
                                value={dayConfig.openTime || '08:00'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setWeeklySchedule(prev => ({
                                    ...prev,
                                    [day]: {
                                      ...dayConfig,
                                      openTime: val
                                    }
                                  }));
                                }}
                              />
                            </div>
                            <span className="text-slate-300 text-xs font-bold">-</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[9.5px] font-bold text-slate-400">Cierra:</span>
                              <input
                                type="time"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 outline-none w-24 text-center"
                                value={dayConfig.closeTime || '20:00'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setWeeklySchedule(prev => ({
                                    ...prev,
                                    [day]: {
                                      ...dayConfig,
                                      closeTime: val
                                    }
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 italic pr-1">
                            Sin atención el día {day}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Banner Selector Component */}
          <div className="space-y-2.5 border-t border-gray-100 pt-3.5">
            <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest block">Foto de Banner / Portada</label>
            
            {/* Real-time Banner Preview */}
            <div className="relative h-24 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={localBannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'}
                className="w-full h-full object-cover"
                alt="Vista previa del banner"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';
                }}
              />
              <div className="absolute inset-0 bg-slate-950/25 flex items-center justify-center">
                <span className="text-white text-[9px] font-black uppercase tracking-wider bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
                  Vista Previa
                </span>
              </div>
            </div>

            {/* Selector of method */}
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() => setUploadMethod('link')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  uploadMethod === 'link' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-gray-450 hover:text-gray-700'
                }`}
              >
                Ingresar Enlace
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('gallery')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  uploadMethod === 'gallery' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-gray-450 hover:text-gray-700'
                }`}
              >
                Subir de la Galería 📱
              </button>
            </div>

            {/* Render selected configuration input fields */}
            {uploadMethod === 'link' ? (
              <div className="space-y-1">
                <input
                  type="url"
                  placeholder="Pegue la URL de la imagen aquí..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white transition-all font-semibold outline-none"
                  value={localBannerUrl.startsWith('data:image/') ? '' : localBannerUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalBannerUrl(val);
                    if (val.trim()) {
                      const activeStore = getActiveStoreInfo();
                      localStorage.setItem(`${activeStore.key}_banner_v1`, val.trim());
                    }
                  }}
                />
                <span className="text-[9px] text-gray-400 font-bold block">Sugerencia: puedes copiar un enlace de Unsplash o Imgur.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 bg-indigo-50/20 hover:bg-indigo-50/50 p-3 rounded-xl cursor-pointer text-xs font-bold text-indigo-750 transition-all select-none">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Seleccionar Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  {localBannerUrl.startsWith('data:image/') && (
                    <button
                      type="button"
                      onClick={() => {
                        const activeStore = getActiveStoreInfo();
                        let defaultBannerForStore = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800';
                        if (activeStore.key === 'artico') {
                          defaultBannerForStore = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800';
                        } else if (activeStore.key === 'fruteria') {
                          defaultBannerForStore = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800';
                        }
                        setLocalBannerUrl(defaultBannerForStore);
                        localStorage.setItem(`${activeStore.key}_banner_v1`, defaultBannerForStore);
                      }}
                      className="px-3 bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Restaurar
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-indigo-600 font-bold block bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-150/40 leading-normal">
                  ⚡ La imagen se optimiza y comprime automáticamente para que cargue súper rápido en el celular.
                </span>
              </div>
            )}
          </div>

          {/* Categories Management Panel */}
          <div className="space-y-4 border-t border-gray-100 pt-3.5">
            <h4 className="text-[11px] font-black text-gray-950 uppercase tracking-wider">
              Categorías de {activeStoreInfo.moduleLabel}
            </h4>
            <p className="text-[10px] text-gray-400 leading-normal">
              Agregue, organice y personalice los rubros ofrecidos para {activeStoreInfo.storeName}. Los cambios se aplicarán al guardar la configuración general.
            </p>

            {/* Product Categories (La Bodega / Minimarket) */}
            {activeStoreInfo.key === 'turco' && isModuleActive('tiendaAbarrotes', config) && (
              <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <label className="text-[9.5px] font-black text-indigo-700 uppercase tracking-widest block">
                  🛍️ Categorías de Productos (La Bodega)
                </label>
                <div className="flex flex-wrap gap-2.5 p-1.5 bg-white border border-slate-200 rounded-xl min-h-12 items-center">
                  {productCategoriesList.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 text-[11px] font-extrabold pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 shadow-3xs hover:bg-slate-150 transition-colors">
                      <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-2xs border border-slate-100 shrink-0">
                        <CategoryIcon cat={cat} iconUrl={getCategoryIcon(cat, categoryIconsList)} className="w-5 h-5 object-contain" />
                      </span>
                      <span className="font-bold">{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProductCat(cat)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer ml-1 p-0.5 rounded-full hover:bg-slate-200"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </span>
                  ))}
                  {productCategoriesList.length === 0 && (
                    <span className="text-[10px] text-gray-400 px-2 italic">Sin categorías</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. Bebidas, Enlatados, Jabones..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:outline-hidden focus:bg-white transition-all font-semibold outline-hidden"
                    value={newProductCat}
                    onChange={(e) => setNewProductCat(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddProductCat(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddProductCat}
                    className="bg-indigo-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer shadow-3xs"
                  >
                    Agregar
                  </button>
                </div>
                {/* Product Sticker Selector */}
                <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-150">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                    🎨 Escoge un sticker 3D para asociarlo al rubro nuevo que va a agregar:
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-none max-w-full">
                    {TURCO_STORE_STICKER_ITEMS.map(item => (
                      <SelectorStickerItem
                        key={item.label}
                        item={item}
                        selected={productSelectedEmoji === item.url}
                        onClick={() => setProductSelectedEmoji(item.url)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Food Item Categories (Cocina) - Exclusivo Minimarket/Cocina */}
            {activeStoreInfo.key === 'turco' && isModuleActive('cocinaAlmuerzos', config) && (
              <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <label className="text-[9.5px] font-black text-emerald-700 uppercase tracking-widest block">
                  🍳 Categorías del Menú (Alimentos y Cocina)
                </label>
                <div className="flex flex-wrap gap-2.5 p-1.5 bg-white border border-slate-200 rounded-xl min-h-12 items-center">
                  {foodItemCategoriesList.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-2 bg-slate-100 text-slate-850 text-[11px] font-extrabold pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 shadow-3xs hover:bg-slate-150 transition-colors">
                      <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-2xs border border-slate-100 shrink-0">
                        <CategoryIcon cat={cat} iconUrl={getCategoryIcon(cat, categoryIconsList)} className="w-5 h-5 object-contain" />
                      </span>
                      <span className="font-bold">{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFoodCat(cat)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer ml-1 p-0.5 rounded-full hover:bg-slate-200"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </span>
                  ))}
                  {foodItemCategoriesList.length === 0 && (
                    <span className="text-[10px] text-gray-400 px-2 italic">Sin categorías</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. Sopas, Desayunos, Postres..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:outline-hidden focus:bg-white transition-all font-semibold outline-hidden"
                    value={newFoodCat}
                    onChange={(e) => setNewFoodCat(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFoodCat(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFoodCat}
                    className={`font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-3xs ${
                      newFoodCat.trim() !== ''
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-slate-200 text-slate-450 hover:bg-slate-250'
                    }`}
                  >
                    Agregar
                  </button>
                </div>
                {/* Food Sticker Selector */}
                <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-150">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                    🎨 Escoge un sticker 3D para asociarlo al rubro nuevo que va a agregar:
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-none max-w-full">
                    {TURCO_KITCHEN_STICKER_ITEMS.map(item => (
                      <SelectorStickerItem
                        key={item.label}
                        item={item}
                        selected={foodSelectedEmoji === item.url}
                        onClick={() => setFoodSelectedEmoji(item.url)}
                      />
                    ))}
                  </div>
                </div>

                {/* Botón de Guardado Específico */}
                <div className="pt-1.5 space-y-2">
                  <button
                    type="button"
                    onClick={handleSaveKitchenCategories}
                    disabled={!isUnlocked || loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Categorías de Cocina</span>
                  </button>
                  {notifySavedKitchenCats && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold animate-in fade-in duration-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                      <span>¡Categorías de cocina guardadas con éxito!</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Frutería Categories - Exclusivo Frutería */}
            {activeStoreInfo.key === 'fruteria' && (
              <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <label className="text-[9.5px] font-black text-rose-700 uppercase tracking-widest block">
                  🍎 Categorías de Frutería y Verdulería
                </label>
                <div className="flex flex-wrap gap-2.5 p-1.5 bg-white border border-slate-200 rounded-xl min-h-12 items-center">
                  {fruteriaCategoriesList.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-2 bg-slate-100 text-slate-850 text-[11px] font-extrabold pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 shadow-3xs hover:bg-slate-150 transition-colors">
                      <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-2xs border border-slate-100 shrink-0">
                        <CategoryIcon cat={cat} iconUrl={getCategoryIcon(cat, categoryIconsList)} className="w-5 h-5 object-contain" />
                      </span>
                      <span className="font-bold">{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFruteriaCat(cat)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer ml-1 p-0.5 rounded-full hover:bg-slate-200"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </span>
                  ))}
                  {fruteriaCategoriesList.length === 0 && (
                    <span className="text-[10px] text-gray-400 px-2 italic">Sin categorías</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. Frutas, Verduras, Legumbres..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-rose-600/10 focus:outline-hidden focus:bg-white transition-all font-semibold outline-hidden"
                    value={newFruteriaCat}
                    onChange={(e) => setNewFruteriaCat(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFruteriaCat(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFruteriaCat}
                    className={`font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-3xs ${
                      newFruteriaCat.trim() !== ''
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-slate-200 text-slate-450 hover:bg-slate-250'
                    }`}
                  >
                    Agregar
                  </button>
                </div>
                {/* Frutería Sticker Selector */}
                <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-150">
                  <span className="text-[9.5px] font-bold text-slate-600 uppercase tracking-wider block">
                    🎨 Escoge un sticker 3D para asociarlo al rubro nuevo que va a agregar:
                  </span>
                  <div className="flex gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-none max-w-full justify-start items-center">
                    {EXCLUSIVE_FRUTERIA_STICKER_ITEMS.map(item => (
                      <SelectorStickerItem
                        key={item.nativeEmoji}
                        item={item}
                        selected={fruteriaSelectedEmoji === item.url || fruteriaSelectedEmoji === item.nativeEmoji}
                        onClick={() => setFruteriaSelectedEmoji(item.url)}
                      />
                    ))}
                  </div>
                </div>

                {/* Botón de Guardado Específico */}
                <div className="pt-1.5 space-y-2">
                  <button
                    type="button"
                    onClick={handleSaveFruteriaCategories}
                    disabled={!isUnlocked || loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Categorías de Frutería</span>
                  </button>
                  {notifySavedFruteriaCats && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold animate-in fade-in duration-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                      <span>¡Categorías de frutería guardadas con éxito!</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ártico Congelados Categories */}
            {activeStoreInfo.key === 'artico' && (
              <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <label className="text-[9.5px] font-black text-cyan-700 uppercase tracking-widest block">
                  🧊 Categorías de Ártico Congelados
                </label>
                <div className="flex flex-wrap gap-2.5 p-1.5 bg-white border border-slate-200 rounded-xl min-h-12 items-center">
                  {articoCategoriesList.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-2 bg-slate-100 text-slate-850 text-[11px] font-extrabold pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 shadow-3xs hover:bg-slate-150 transition-colors">
                      <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-2xs border border-slate-100 shrink-0">
                        <CategoryIcon cat={cat} iconUrl={getCategoryIcon(cat, categoryIconsList)} className="w-5 h-5 object-contain" />
                      </span>
                      <span className="font-bold">{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArticoCat(cat)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer ml-1 p-0.5 rounded-full hover:bg-slate-200"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </span>
                  ))}
                  {articoCategoriesList.length === 0 && (
                    <span className="text-[10px] text-gray-400 px-2 italic">Sin categorías</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. Carnes, Mariscos, Congelados..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-600/10 focus:outline-hidden focus:bg-white transition-all font-semibold outline-hidden"
                    value={newArticoCat}
                    onChange={(e) => setNewArticoCat(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddArticoCat(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddArticoCat}
                    className={`font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-3xs ${
                      newArticoCat.trim() !== ''
                        ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                        : 'bg-slate-200 text-slate-450 hover:bg-slate-250'
                    }`}
                  >
                    Agregar
                  </button>
                </div>
                {/* Ártico Sticker Selector */}
                <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-150">
                  <span className="text-[9.5px] font-bold text-slate-600 uppercase tracking-wider block">
                    🎨 Escoge un sticker 3D para asociarlo al rubro nuevo que va a agregar:
                  </span>
                  <div className="flex gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-none max-w-full justify-start items-center">
                    {ARTICO_STICKER_ITEMS.map(item => (
                      <SelectorStickerItem
                        key={item.label}
                        item={item}
                        selected={articoSelectedEmoji === item.url || articoSelectedEmoji === item.nativeEmoji}
                        onClick={() => setArticoSelectedEmoji(item.url)}
                      />
                    ))}
                  </div>
                </div>

                {/* Botón de Guardado Específico */}
                <div className="pt-1.5 space-y-2">
                  <button
                    type="button"
                    onClick={handleSaveArticoCategories}
                    disabled={!isUnlocked || loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Categorías de Ártico Congelados</span>
                  </button>
                  {notifySavedArticoCats && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold animate-in fade-in duration-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                      <span>¡Categorías de Ártico Congelados guardadas con éxito!</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Farmacia Categories */}
            {activeStoreInfo.key === 'farmacia' && (
              <div className="space-y-2.5 bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                <label className="text-[9.5px] font-black text-blue-700 uppercase tracking-widest block">
                  💊 Categorías de Farmacia
                </label>
                <div className="flex flex-wrap gap-2.5 p-1.5 bg-white border border-blue-200 rounded-xl min-h-12 items-center">
                  {farmaciaCategoriesList.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 text-[11px] font-extrabold pl-1.5 pr-2.5 py-1 rounded-full border border-blue-200 shadow-3xs hover:bg-blue-100 transition-colors">
                      <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-2xs border border-blue-100 shrink-0">
                        <CategoryIcon cat={cat} iconUrl={getCategoryIcon(cat, categoryIconsList)} className="w-5 h-5 object-contain" />
                      </span>
                      <span className="font-bold">{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFarmaciaCat(cat)}
                        className="text-blue-400 hover:text-blue-600 focus:outline-hidden cursor-pointer ml-1 p-0.5 rounded-full hover:bg-blue-200"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </span>
                  ))}
                  {farmaciaCategoriesList.length === 0 && (
                    <span className="text-[10px] text-gray-400 px-2 italic">Sin categorías</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. Medicamentos, Cuidado Personal..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600/10 focus:outline-hidden focus:bg-white transition-all font-semibold outline-hidden"
                    value={newFarmaciaCat}
                    onChange={(e) => setNewFarmaciaCat(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFarmaciaCat(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFarmaciaCat}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-3xs"
                  >
                    Agregar
                  </button>
                </div>

                {/* Farmacia Sticker Selector */}
                <div className="space-y-1 bg-white p-2.5 rounded-xl border border-blue-150">
                  <span className="text-[9.5px] font-bold text-slate-600 uppercase tracking-wider block">
                    🎨 Escoge un sticker 3D para asociarlo a la categoría de farmacia:
                  </span>
                  <div className="flex gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-none max-w-full justify-start items-center">
                    {FARMACIA_STICKER_ITEMS.map(item => (
                      <SelectorStickerItem
                        key={item.label}
                        item={item}
                        selected={farmaciaSelectedEmoji === item.url}
                        onClick={() => setFarmaciaSelectedEmoji(item.url)}
                      />
                    ))}
                  </div>
                </div>

                {/* Botón de Guardado Específico */}
                <div className="pt-1.5 space-y-2">
                  <button
                    type="button"
                    onClick={handleSaveFarmaciaCategories}
                    disabled={!isUnlocked || loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Categorías de Farmacia</span>
                  </button>
                  {notifySavedFarmaciaCats && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold animate-in fade-in duration-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                      <span>¡Categorías de farmacia guardadas con éxito!</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pizzería Categories - Exclusivo Pizzería */}
            {activeStoreInfo.key === 'pasion-pizzas' && (
              <div className="space-y-2.5 bg-amber-50/40 p-3 rounded-2xl border border-amber-100">
                <label className="text-[9.5px] font-black text-amber-900 uppercase tracking-widest block">
                  🍕 Menú y Carta de Pizzería
                </label>
                <div className="flex flex-wrap gap-2.5 p-1.5 bg-white border border-amber-200 rounded-xl min-h-12 items-center">
                  {pizzaCategoriesList.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-2 bg-amber-50 text-amber-950 text-[11px] font-extrabold pl-1.5 pr-2.5 py-1 rounded-full border border-amber-200 shadow-3xs hover:bg-amber-100 transition-colors">
                      <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-2xs border border-amber-100 shrink-0">
                        <CategoryIcon cat={cat} iconUrl={getCategoryIcon(cat, categoryIconsList)} className="w-5 h-5 object-contain" />
                      </span>
                      <span className="font-bold">{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePizzaCat(cat)}
                        className="text-amber-500 hover:text-amber-700 focus:outline-hidden cursor-pointer ml-1 p-0.5 rounded-full hover:bg-amber-200"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </span>
                  ))}
                  {pizzaCategoriesList.length === 0 && (
                    <span className="text-[10px] text-gray-400 px-2 italic">Sin categorías</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. Pizzas Tradicionales, Promos 2x, Acompañamientos..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-600/10 focus:outline-hidden focus:bg-white transition-all font-semibold outline-hidden"
                    value={newPizzaCat}
                    onChange={(e) => setNewPizzaCat(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPizzaCat(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddPizzaCat}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-3xs"
                  >
                    Agregar
                  </button>
                </div>

                {/* Pizza Sticker Selector */}
                <div className="space-y-1 bg-white p-2.5 rounded-xl border border-amber-150">
                  <span className="text-[9.5px] font-bold text-slate-600 uppercase tracking-wider block">
                    🎨 Escoge un sticker 3D para asociarlo a la categoría de pizzería:
                  </span>
                  <div className="flex gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-none max-w-full justify-start items-center">
                    {PIZZA_STORE_STICKER_ITEMS.map(item => (
                      <SelectorStickerItem
                        key={item.label}
                        item={item}
                        selected={pizzaSelectedEmoji === item.url}
                        onClick={() => setPizzaSelectedEmoji(item.url)}
                      />
                    ))}
                  </div>
                </div>

                {/* Botón de Guardado Específico */}
                <div className="pt-1.5 space-y-2">
                  <button
                    type="button"
                    onClick={handleSavePizzaCategories}
                    disabled={!isUnlocked || loading}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Categorías de Pizzería</span>
                  </button>
                  {notifySavedPizzaCats && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold animate-in fade-in duration-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                      <span>¡Categorías de pizzería guardadas con éxito!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section: Enlace Directo y Código QR del Negocio */}
          <div className="space-y-4 border-t border-gray-100 pt-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-100">
                  <QrCode className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {activeStoreInfo.sectionTitle}
                </h4>
              </div>
              <span className={`self-start sm:self-auto text-[10px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-3xs ${activeStoreInfo.badgeBg}`}>
                <Lock className="w-3 h-3" />
                <span>Módulo Activo: {activeStoreInfo.emoji} {activeStoreInfo.moduleLabel}</span>
              </span>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-normal">
              Permite que tus clientes ingresen de forma directa al módulo exclusivo de <strong className="text-slate-800">{activeStoreInfo.storeName}</strong> escaneando el código QR o pulsando el enlace, sin pasar por la selección manual de tiendas.
            </p>

            {/* URL Display and Action Block */}
            <div className="space-y-3 bg-slate-55 p-4 rounded-xl border border-slate-150">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  Enlace de Acceso Directo Exclusivo ({activeStoreInfo.moduleLabel}):
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activeDirectUrl}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeDirectUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all shadow-3xs cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copiar Enlace Exclusivo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code and Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                <div className="bg-white p-3.5 rounded-xl border border-slate-250 shadow-2xs flex-shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(activeDirectUrl)}`}
                    alt={`Código QR para ${activeStoreInfo.storeName}`}
                    className="w-32 h-32 object-contain"
                  />
                </div>
                
                <div className="flex-1 space-y-2.5 text-center sm:text-left w-full">
                  <div className="space-y-0.5">
                    <h5 className="text-[11px] font-extrabold text-slate-900">
                      Código QR Exclusivo - {activeStoreInfo.storeName}
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Imprime este código QR y colócalo en tu local. Tus clientes podrán escanearlo con la cámara de sus teléfonos para abrir directamente tu rubro de {activeStoreInfo.moduleLabel}.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeDirectUrl)}`;
                        try {
                          const response = await fetch(qrImageUrl);
                          const blob = await response.blob();
                          const blobUrl = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = blobUrl;
                          link.download = `QR_Codigo_Exclusivo_${activeStoreInfo.paramValue}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(blobUrl);
                        } catch (err) {
                          window.open(qrImageUrl, '_blank');
                        }
                      }}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] py-2 px-3 rounded-lg shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar QR para Impresión</span>
                    </button>
                    
                    <a
                      href={activeDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-[11px] py-2 px-3 rounded-lg shadow-3xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Probar Enlace</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Gestión de Personal */}
          <div className="space-y-3.5 border-t border-gray-100 pt-3.5">
            <h4 className="text-[11px] font-black text-gray-950 uppercase tracking-wider">
              👥 Gestión de Personal (Hasta 3 Empleados)
            </h4>
            <p className="text-[10px] text-gray-450 leading-normal">
              Configure los nombres y códigos PIN de acceso para su personal de turno. Deje campos vacíos para deshabilitar un slot. Los cambios se aplicarán al guardar la configuración general.
            </p>

            <div className="space-y-3">
              {employeesList.map((emp, index) => (
                <div key={emp.id} className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-150 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                      Slot #{index + 1} - {emp.name.trim() ? `Empleado: ${emp.name}` : 'Disponible'}
                    </span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 font-black px-2 py-0.5 rounded-md border border-slate-200">
                      Rol: Cajero
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-gray-450 uppercase tracking-widest block">Nombre completo</label>
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:outline-none transition-all font-semibold outline-none"
                        value={emp.name}
                        onChange={(e) => {
                          const newList = [...employeesList];
                          newList[index] = { ...newList[index], name: e.target.value };
                          setEmployeesList(newList);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-gray-450 uppercase tracking-widest block">PIN (4 dígitos)</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Ej. 1111"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-center focus:ring-2 focus:ring-indigo-600/10 focus:outline-none transition-all font-black tracking-widest outline-none"
                        value={emp.pin}
                        onChange={(e) => {
                          const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                          const newList = [...employeesList];
                          newList[index] = { ...newList[index], pin: cleanVal };
                          setEmployeesList(newList);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel de Configuración Tributaria */}
          <div className="space-y-3.5 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[11px] font-black text-gray-950 uppercase tracking-wider">
                  Integración Oficial con el SII (Chile)
                </h4>
                <p className="text-[10px] text-gray-400">
                  Active la emisión de boletas y facturas electrónicas directamente conectadas con impuestos de Chile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSiiEnabled(!siiEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  siiEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    siiEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[10px] text-gray-500 leading-normal bg-slate-50 p-3 rounded-xl border border-slate-100 font-semibold">
              💡 <strong className="text-gray-700">Nota aclaratoria:</strong> Si está desactivado, el sistema operará en <strong className="text-indigo-600">"Modo Control Interno"</strong>, emitiendo tickets de inventario y despacho (válido si sus clientes pagan con tarjeta/Mercado Pago, cuyo comprobante actúa como boleta legal en Chile).
            </p>

            {siiEnabled && (
              <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-indigo-100/60 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-[9.5px] font-black text-indigo-700 uppercase tracking-widest block">
                  Credenciales del Facturador Electrónico
                </span>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-gray-450 uppercase tracking-widest block">RUT de la Empresa</label>
                      <input
                        type="text"
                        placeholder="Ej. 76.123.456-K"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:outline-none font-semibold"
                        value={siiRut}
                        onChange={(e) => setSiiRut(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-gray-450 uppercase tracking-widest block">Certificado Digital (Simulado)</label>
                      <input
                        type="text"
                        placeholder="Ej. certificado_felipe.pfx"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:outline-none font-semibold"
                        value={siiDigitalCert}
                        onChange={(e) => setSiiDigitalCert(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-gray-450 uppercase tracking-widest block">API Key del Facturador</label>
                    <input
                      type="password"
                      placeholder="Ingrese la API Key provista por el PSE/Facturador"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:outline-none font-mono"
                      value={siiApiKey}
                      onChange={(e) => setSiiApiKey(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Truck Route Delivery Logistics Config */}
            {config?.modules?.rutasCamion !== false && (
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mt-4">
                <div>
                  <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest block">
                    🚚 CONFIGURACIÓN DE RUTAS DE CAMIÓN
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5">
                    Configura los días que el camión visita cada zona de Santiago y el costo del flete.
                  </p>
                </div>

                <div className="space-y-3">
                  {Object.entries(rutasCamion || DEFAULT_RUTAS_CAMION).map(([key, sectorVal]) => {
                    const sector = sectorVal as SectorConfig;
                    return (
                      <div key={key} className="bg-white p-3.5 rounded-xl border border-slate-150 shadow-3xs space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                              📍 {sector.name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold block leading-normal max-w-sm mt-0.5">
                              Comunas: {sector.comunas.join(', ')}
                              {key === 'norte' && <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-black text-[9px] border border-amber-200 ml-1.5 inline-block">Lampa: $3.900 CLP (Lun y Jue)</span>}
                              {key === 'sur' && <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-black text-[9px] border border-amber-200 ml-1.5 inline-block">Buin: $4.900 CLP (Mar y Vie)</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">Costo Envío:</span>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">$</span>
                              <input
                                type="number"
                                min="0"
                                className="w-24 bg-slate-50 border border-slate-200 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-slate-800 text-right focus:bg-white outline-none"
                                value={sector.fee}
                                onChange={(e) => handleFeeChange(key, e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                            📅 Días de entrega para {sector.name}:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => {
                              const isChecked = sector.days.includes(day);
                              return (
                                <label key={day} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-all select-none ${
                                  isChecked
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-3xs'
                                    : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}>
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isChecked}
                                    onChange={() => handleToggleDay(key, day)}
                                  />
                                  <span>{day.substring(0, 2)}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-5 rounded-xl text-xs hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-55 flex items-center justify-center gap-1 shadow-sm select-none outline-none cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-white" />}
            <span>Guardar Configuración</span>
          </button>
        </div>
      </section>

      {/* Section B: Traditional Meals Management list */}
      {isModuleActive('cocinaAlmuerzos', config) && config?.mostrarAlmuerzos !== false && (
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-extrabold text-gray-950 uppercase tracking-wider">
            Gestión del Menú
          </h3>
          <span className="text-[10.5px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5 animate-pulse">
            {totalRaciones} porciones totales
          </span>
        </div>

        <button
          onClick={() => {
            setEditingDish(null);
            setDishName('');
            setDishDesc('');
            setDishPrice('');
            setDishStock('0');
            setDishEnOferta(false);
            setDishPrecioOferta('');
            if (foodItemCategoriesList.length > 0) {
              setDishCategory(foodItemCategoriesList[0]);
            }
            setDishImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200');
            setDishImageError(false);
            setShowDishModal(true);
          }}
          className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-2 border-dashed border-indigo-200 p-4 rounded-xl text-xs font-bold transition-all outline-hidden cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5 stroke-[2.2]" />
          <span>Agregar nuevo plato al menú</span>
        </button>

        <div className="grid grid-cols-1 gap-4">
          {foodItems.map(dish => (
            <div
              key={dish.id}
              className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 flex flex-col shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative h-44 w-full bg-gray-50 shrink-0">
                <img 
                   src={dish.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'} 
                   className="w-full h-full object-cover" 
                   alt={dish.name} 
                   onError={(e) => {
                     (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
                   }}
                   referrerPolicy="no-referrer" 
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDish(dish);
                      setDishName(dish.name);
                      setDishDesc(dish.description);
                      setDishPrice(String(dish.price));
                      setDishStock(String(dish.stock ?? 0));
                      setDishCategory(dish.category);
                      setDishImageUrl(dish.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200');
                      setDishEnOferta(!!dish.enOferta);
                      setDishPrecioOferta(dish.precioOferta !== null && dish.precioOferta !== undefined ? String(dish.precioOferta) : '');
                      setDishImageError(false);
                      setShowDishModal(true);
                    }}
                    className="w-9 h-9 rounded-full bg-white/95 hover:bg-indigo-50 hover:text-indigo-600 shadow-md flex items-center justify-center text-indigo-500 transition-colors cursor-pointer shrink-0 border border-slate-100 select-none active:scale-90"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDishItem(dish.id, dish.name)}
                    className="w-9 h-9 rounded-full bg-white/95 hover:bg-rose-50 hover:text-rose-600 shadow-md flex items-center justify-center text-rose-500 transition-colors cursor-pointer shrink-0 border border-slate-100 select-none active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {dish.category}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block">Precio</span>
                    <span className="text-lg font-black text-indigo-650">${dish.price.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-950 text-base leading-tight truncate">{dish.name}</h4>
                  <p className="text-xs text-gray-450 font-semibold leading-relaxed mt-1 line-clamp-2">{dish.description}</p>
                </div>
                <div className="pt-1 flex items-center justify-between border-t border-dashed border-slate-100 mt-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Disponibilidad</span>
                  <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg ${
                    (dish.stock ?? 0) <= 0 
                      ? 'bg-rose-100 text-rose-700 font-bold' 
                      : (dish.stock ?? 0) <= 5 
                        ? 'bg-amber-150 text-amber-900 font-black animate-pulse' 
                        : 'bg-emerald-100 text-emerald-800 font-bold'
                  }`}>
                    {(dish.stock ?? 0) <= 0 ? 'Agotado ❌' : `${dish.stock ?? 0} porciones`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Auxiliary modal popup for creating dishes */}
      {showDishModal && isModuleActive('cocinaAlmuerzos', config) && config?.mostrarAlmuerzos !== false && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center bg-gray-50/50 px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-950">{editingDish ? 'Editar Plato' : 'Nuevo Plato'}</h3>
              <button 
                onClick={() => setShowDishModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-550 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nombre del Plato *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Empanadas de Carne"
                  className="w-full bg-gray-50 border border-gray-10s rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all font-semibold"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                />
              </div>

              {/* Imagen del Plato */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Imagen del Plato</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-300 shrink-0 bg-slate-50 relative flex items-center justify-center">
                    {uploadingDishImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <RefreshCw className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                    {dishImageError || !dishImageUrl ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-2 text-center select-none">
                        <PackageOpen className="w-6 h-6 text-slate-350" />
                        <span className="text-[8px] font-bold text-slate-400 mt-1 leading-none">Sin Imagen</span>
                      </div>
                    ) : (
                      <img
                        src={dishImageUrl}
                        className="w-full h-full object-contain p-1 bg-white"
                        alt="preview"
                        referrerPolicy="no-referrer"
                        onError={() => setDishImageError(true)}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-[10px] py-1.5 px-2 rounded-xl cursor-pointer hover:bg-emerald-100/60 transition-colors select-none">
                      <Image className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                      <span>Subir desde Galería</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleDishImageUpload} />
                    </label>
                    <label className="flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-300 text-slate-700 font-extrabold text-[10px] py-1.5 px-2 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors select-none">
                      <Camera className="w-3.5 h-3.5 text-slate-650 stroke-[2.5]" />
                      <span>Tomar Foto</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleDishImageUpload} />
                    </label>
                  </div>
                </div>
                
                {/* Preset food images selection row */}
                <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {FOOD_PRESET_IMAGES.map((img, i) => (
                    <button key={i} type="button" onClick={() => setDishImageUrl(img.url)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${dishImageUrl === img.url ? 'ring-2 ring-emerald-500 scale-105 border-emerald-600' : 'border-slate-200 opacity-60'}`}>
                      <img src={img.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>

                {/* External Image URL with same auto-clean mechanism for presets/base64 */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">O pegar URL de Imagen Externa</label>
                  {(() => {
                    const isPresetUrl = FOOD_PRESET_IMAGES.some(img => img.url === dishImageUrl);
                    const isBase64Url = dishImageUrl?.startsWith('data:');
                    const displayUrl = (isPresetUrl || isBase64Url) ? '' : dishImageUrl;
                    return (
                      <>
                        <input
                          type="text"
                          placeholder="https://ejemplo.com/plato.jpg"
                          className="w-full bg-slate-50 border border-slate-350 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white outline-none font-bold text-slate-900"
                          value={displayUrl}
                          onChange={(e) => setDishImageUrl(e.target.value)}
                        />
                        {displayUrl && (dishImageError || !/\.(jpg|jpeg|png|webp|gif|svg|bmp)/i.test(displayUrl)) && (
                          <div className="p-2.5 bg-amber-50/85 border border-amber-200/80 rounded-xl text-[10px] text-amber-800 font-medium leading-relaxed mt-1.5 animate-in fade-in duration-250">
                            <div className="flex gap-1.5 items-start">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-extrabold text-amber-900 block mb-0.5">La imagen no se cargó correctamente</strong>
                                Asegúrate de que la URL termine en <code className="bg-amber-100 px-1 py-0.2 rounded text-rose-700 font-mono text-[8px] font-bold">.jpg</code>, <code className="bg-amber-100 px-1 py-0.2 rounded text-rose-700 font-mono text-[8px] font-bold">.png</code> o <code className="bg-amber-100 px-1 py-0.2 rounded text-rose-700 font-mono text-[8px] font-bold">.webp</code>.
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-center outline-none font-bold"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoría *</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-10s rounded-xl px-3 py-3 text-sm outline-none cursor-pointer"
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                  >
                    {foodItemCategoriesList.filter(cat => isModuleActive(cat, config)).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Porciones Disponibles (Stock) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Ej. 15"
                  className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-bold"
                  value={dishStock}
                  onChange={(e) => setDishStock(e.target.value)}
                />
              </div>

              {/* Sección Ofertas / Remates */}
              <div className="p-3.5 bg-rose-50/70 border-2 border-rose-200 rounded-2xl space-y-3 animate-in fade-in duration-200 font-sans">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide flex items-center gap-1.5">
                      🔥 ¿Poner en oferta de tarde?
                    </h4>
                    <p className="text-[10px] font-bold text-rose-500 mt-0.5">
                      Activa un precio de liquidación promocional para este plato.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={dishEnOferta}
                      onChange={(e) => setDishEnOferta(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-rose-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                {dishEnOferta && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                    <label className="text-xs font-black text-rose-950 uppercase tracking-wider block">
                      Precio de Oferta ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="Ej. 3500"
                      className="w-full bg-white border-2 border-rose-300 rounded-2xl px-3 py-3 text-sm outline-none font-bold text-rose-950 focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500"
                      value={dishPrecioOferta}
                      onChange={(e) => setDishPrecioOferta(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descripción *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ej. masa crujiente frita rellena con carne desmechada sazonada..."
                  className="w-full bg-gray-50 border border-gray-10s rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none"
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-indigo-700 active:scale-[0.98] transition-all outline-none"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : (editingDish ? 'Guardar Cambios' : 'Crear Plato')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete food dish item confirmation modal */}
      {confirmDeleteDish && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 px-4 animate-in fade-in duration-350">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center border border-slate-150 shadow-2xl relative">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3.5 text-slate-650 border border-slate-200">
              <Trash2 className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">¿Eliminar Plato?</h3>
            <p className="text-xs text-slate-500 mb-4.5 leading-normal">
              ¿Seguro que desea quitar <span className="font-bold">"{confirmDeleteDish.name}"</span> de la cocina?
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDeleteDish(null)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 outline-none select-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={executeDeleteDish}
                className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl text-xs hover:bg-rose-700 outline-none select-none cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
