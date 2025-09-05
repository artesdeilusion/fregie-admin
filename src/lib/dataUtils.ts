import { FormProduct } from "@/types";

export interface DataFolderProduct extends FormProduct {
  local_image_path?: string;
  storage_conditions?: string;
}

/**
 * Save a product to the appropriate data folder
 * This function simulates saving to the file system
 * In a real implementation, you would need to handle file system operations
 */
export const saveProductToDataFolder = async (
  product: FormProduct,
  category: string,
  subcategory: string
): Promise<boolean> => {
  try {
    console.log('Sending product to API:', { product, category, subcategory });
    
    // First, send to debug endpoint to see what data we're sending
    const debugResponse = await fetch('/api/debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product,
        category,
        subcategory,
      }),
    });
    
    console.log('Debug endpoint response:', await debugResponse.json());
    
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product,
        category,
        subcategory,
      }),
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', response.headers);

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      return false;
    }

    const result = await response.json();
    console.log('Product saved successfully:', result);
    return true;
  } catch (error) {
    console.error('Error saving product to data folder:', error);
    return false;
  }
};

/**
 * Bulk upload products to the data folder
 */
export const bulkUploadProducts = async (
  products: FormProduct[],
  category: string,
  subcategory: string
): Promise<boolean> => {
  try {
    console.log('Sending bulk upload to API:', { productsCount: products.length, category, subcategory });
    
    const response = await fetch('/api/products', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products,
        category,
        subcategory,
      }),
    });

    console.log('Bulk Upload API Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Bulk Upload API Error:', error);
      return false;
    }

    const result = await response.json();
    console.log('Bulk upload completed:', result);
    return true;
  } catch (error) {
    console.error('Error bulk uploading products:', error);
    return false;
  }
};

/**
 * Get the path to a products.json file
 */
export const getProductsFilePath = (category: string, subcategory: string): string => {
  return `data/${category}/${subcategory}/products.json`;
};

/**
 * Validate product data before saving
 */
export const validateProductData = (product: FormProduct): string[] => {
  const errors: string[] = [];
  
  if (!product.name.trim()) {
    errors.push("Product name is required");
  }
  
  if (!product.brand.trim()) {
    errors.push("Brand is required");
  }
  
  if (!product.barcode.trim()) {
    errors.push("Barcode is required");
  }
  
  if (product.ingredients.length === 0) {
    errors.push("At least one ingredient is required");
  }
  
  return errors;
};

/**
 * Format product data to match your existing JSON structure
 */
export const formatProductForDataFolder = (product: FormProduct): DataFolderProduct => {
  return {
    name: product.name,
    brand: product.brand,
    barcode: product.barcode,
    image_url: product.image_url,
    ingredients: product.ingredients,
    alergen_warning: product.alergen_warning,
    net_weight: product.net_weight,
    nutritional_info: product.nutritional_info,
    manufacturer: product.manufacturer,
    origin: product.origin,
    storage_conditions: "Serin ve Kuru Yerde Muhafaza Ediniz",
  };
};

/**
 * Get all available categories and subcategories
 */
export const getAvailableCategories = () => {
  return [
    {
      name: "Atıştırmalık",
      path: "atıştırmalık",
      subcategories: ["bar", "bisküvi", "cikolata", "cips", "gofret", "i̇kramlıklar", "kek", "kraker", "kuru_meyve", "kuru_yemiş", "sakız", "şekerleme"]
    },
    {
      name: "İçecek",
      path: "icecek",
      subcategories: ["cay", "gazlı_icecek", "gazsız_icecek", "günlük_icecek", "kahve", "kombucha_ve_malt_icecek", "maden_suyu", "su"]
    },
    {
      name: "Süt Ürünleri ve Kahvaltılık",
      path: "süt_ürünleri_ve_kahvaltılık",
      subcategories: ["dondurma", "kahvaltılıklar", "margarin", "peynir", "süt", "sütlü_tatlılar_ve_krema", "tereyağı", "yoğurt"]
    },
    {
      name: "Temel Gıda",
      path: "temel_gıda",
      subcategories: ["bakliyat_ve_pirinc", "corba_ve_bulyonlar", "hazır_yemek", "konserve,_salca_ve_turşu", "makarna", "mayalar", "şeker", "sıvı_yağlar", "soslar", "tuz,_baharat_ve_harc", "un_ve_irmik"]
    },
    {
      name: "Unlu Mamul ve Tatlı",
      path: "unlu_mamul_ve_tatlı",
      subcategories: ["börekler", "dondurulmuş", "ekmek", "galetta_ve_grissini_ve_gevrek", "hamur_ve_pasta_malzemeleri", "pasta_ve_kek_ceşitleri", "tatlılar", "toz_tatlılar", "yufka_ve_erişte"]
    },
    {
      name: "Yaşam ve Beslenme Tarzı",
      path: "yaşam_ve_beslenme_tarzı",
      subcategories: ["aktif_yaşam", "bar", "glutensiz", "kafeinsiz", "kolajen", "laktozsuz", "organik", "probiyotik", "şekersiz_tatlandırıcılar", "süper_gıdalar", "vegan_ve_vejetaryen"]
    }
  ];
};

/**
 * Sanitizes product data to ensure it's compatible with Firestore
 * Flattens nested arrays and converts complex structures to simple strings
 */
export const sanitizeProductData = (product: any): any => {
  const sanitized: any = {};
  
  // Helper function to flatten nested arrays and convert to string
  const flattenArray = (value: any): string[] => {
    if (!value) return [];
    
    if (Array.isArray(value)) {
      const flattened: string[] = [];
      
      for (const item of value) {
        if (Array.isArray(item)) {
          // Recursively flatten nested arrays
          flattened.push(...flattenArray(item));
        } else if (item && typeof item === 'object') {
          // Convert objects to strings
          flattened.push(JSON.stringify(item));
        } else if (item !== null && item !== undefined) {
          // Convert to string and add to array
          flattened.push(String(item));
        }
      }
      
      return flattened;
    }
    
    // If not an array, convert to string and wrap in array
    return [String(value || '')];
  };
  
  // Helper function to ensure string values
  const ensureString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      // If it's an array, join the elements
      return value.map(item => ensureString(item)).join(', ');
    }
    if (typeof value === 'object') {
      // If it's an object, stringify it
      return JSON.stringify(value);
    }
    return String(value);
  };
  
  // Sanitize each field
  sanitized.name = ensureString(product.name || product["﻿name"] || "");
  sanitized.brand = ensureString(product.brand || "");
  sanitized.barcode = ensureString(product.barcode || "");
  sanitized.image_url = ensureString(product.image_url || "");
  sanitized.ingredients = flattenArray(product.ingredients).map(item => item.toLowerCase());
  sanitized.alergen_warning = flattenArray(product.alergen_warning || product.allergen_warning).map(item => item.toLowerCase());
  sanitized.net_weight = ensureString(product.net_weight || "");
  sanitized.nutritional_info = ensureString(product.nutritional_info || "");
  sanitized.manufacturer = ensureString(product.manufacturer || "");
  sanitized.origin = ensureString(product.origin || "");
  sanitized.storage_conditions = ensureString(product.storage_conditions || "Serin ve Kuru Yerde Muhafaza Ediniz");
  sanitized.local_image_path = ensureString(product.local_image_path || "");
  
  return sanitized;
};
