import React, { useState } from 'react';
import { Search, ScanBarcode, Plus, PackageOpen, AlertTriangle, AlertCircle, RefreshCw, X, Camera, FileDown, Image } from 'lucide-react';
import { Product } from '../types';

interface InventarioTabProps {
  products: Product[];
  onAddProduct: (item: Omit<Product, 'id' | 'updatedAt'>) => Promise<void>;
  onEditProduct: (item: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

const PRESET_IMAGES = [
  { label: 'Bebida Lata', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFlYMgz-vIQcuMIgjuYTAgcl-nd2AxDuI4_1FzyqcDEeVhAdW0OMPH_hMf-2C_eoEWwjLtXF4OE6iINZPMLbLMPO44e1oZxox9whWwTNOL4EEpG_rzZKLM-LTzue0SQzGQv6aW0DnZNBvZt71AsIjOj2IF7awSBI9J_pOpz9wbMiCISokAb8O2qvKoM3MgiKcse0wWbI4-VgkmYMCKIXWaneBXBg2GJxZR3Ky7cG2N7kn_qQSEnxMVl57dbd74Es_rMsFscsjqwjk' },
  { label: 'Pan', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr8u8wXDvpaNlG_Zq4Ebyy33Hy-gCEr5nVQiTk5CEI0Sva5jVF_J0WcfbJBeFSQsdIC5oP2vvQfC4mldu51JTs-gse8Xo9Zj_NFsaRcSvMoUW7EG_9wpJ4NqTZ-2IX0YinKfCGy_bapUtHhNVVbItz8ULk1KAo_dfFhbeN6srciOXmYuCynlfhrjZKOo9oyUKBd1kL_SYuZBxkvd2zEShZhfvVp4mffGMPr_1zkFzK7u8UC6koC1VsKpC1pOQEAMTzsE-KJkN743o' },
  { label: 'Leche', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfltLCYu3aB_3sd7mXGNlKGUjdV6mTGvaP8oLfH1ogkMUYzcysGwRqOHRlAIVNQfCncW2GfIvIpU05SFsHLsl7ibHcRbvnvri5c9JQ10kOaWz6PD9Ka3J3TGNh4anl0fKMxhmQ0iU7LziNgPkg4SnyTKmNmNEfFcnoMykBP3p2ZKqXjGgpdqlro8hwr2EaVDjhuSsQmJDerBcEwcSAlT-DAyF2m5UxA4pay_IrcpQdwU7ZgbhuaC4rmLEvnFUG227N0SrfINWzYqg' },
  { label: 'Snacks', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUF1NcIGYG2T3McNvhGUjed9u7fCunvxJ2UatiMBW1uGyTFK6frS3_ftz2XVCDronGS_zK23LrBTEEgg24yu5t3fj5TZu6L5pzpr6_jbJY5O6cudx5unBBU_yAwOQYwOrUr7Cv5ztUr02HzuHu0wXRjn3Q-qYwiKuHd38sjhTvRDDtwKEorPVyhYQfpJy6fad_aE1Svbe5pN8Xf2agc2pxkAmEfk0Wnla_3u8hQStkl7b1pMzBvIo0cza8sl5VfTO5lx6RXEm6Pws' },
  { label: 'Aguacate', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKHwCOIzMAguRTJrr8d3e9LlqCNrcvXChDmwyJ1INeC785VEq3zcb45qJdduZ9B6w7bfW9jjndYhiQPZj7lj26Bgi1WzCZVsFJsuBcFxJpotpFRcpH2zYvlED5lNmPNsJVcxg8CNTNelLVp8qzpLtmTDTVKRDElFVy3faTWb2hpCI_4taE5AeM4sj72NwNWlIRla2wcowcktVwejxl7gXRzeZFXDH5jzXm92SUW4wybAAAKORVhJec7LUNiT2kSro5ZAvRcsE02h4' },
  { label: 'Naranjas', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU7Odb9m9LVBsEv4N50b5NJeq4bSmQe9fWnrbQ_MFFXlflgpuektEG3pJlhrq7JEaqzZrPWP2wTS98S5M9PtW9BzjAdNjOSiwD1Y3PD5dMyCLmBdA2gQh4D-irqFYEnTAYsx4taGp5CeNQPF3IVGtIqXbNothSbFsLQ_mciNmM9EkZh-UbZ01BldH3wTPcc1FpP7CPqXQtAZ-XoR8rA9IeA4qX1I2omsgUwU-vJzzLY6QnBDuq3vZ9EIEmaLMtEC2tf8Z2no7Dvw0' },
  { label: 'Aceite', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0w6AWq-EHcBx5SuE1-ScX63fUy0pIOosoofZhQgWqRScufztzr1Cf2VtxDJmQVWbXZ3jwI5MHC640Tl9S-TPjjKr3mbyNjtKH0lwvpmtd16tk4KmQIbDOEpGxPoV9ekw_84kwl4Uebrv2OkS-9u84SA7YXTiFaDx-bNGvjGiM1j56mtdqwCMCuCArG-m3tmWksTH_a83vwvtRkNRyd3Xo8H6ZQD-O8nilMNJt70pim4Hz42_qeiAvcSLQ_jYF89-NYb-FPWUMklw' }
];

const CATEGORY_ICONS: Record<string, string> = {
  'Todos': '🛒',
  'Bebidas': '🥤',
  'Abarrotes': '🧴',
  'Lácteos': '🥛',
  'Snacks': '🍿',
};

function generateStockPDF(title: string, items: Pro
