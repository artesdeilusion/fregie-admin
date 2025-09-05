export interface Product {
  id: string; // Firestore auto ID
  alergen_warning: string[]; // Example: ["asd"] - stored in lowercase
  barcode: string; // Example: "8684207695843"
  brand: string; // Example: "FELLAS"
  image_url: string; // Product image
  ingredients: string[]; // Example: ["asfasasf"] - stored in lowercase
  manufacturer?: string; // Manufacturer info (optional)
  name: string; // Product name
  net_weight?: string; // Example: "120" (optional)
  nutritional_info: string; // Example: "Enerji (kcal): 480..."
  origin?: string; // Example: "TÜRKİYE" (optional)
}

export interface Preference {
  id: string; // Firestore auto ID
  ingredients: string[]; // Example: ["nnn", "Tarhana"]
  name: string; // Preference/Diet name, e.g. "Candida"
  type: string; // Example: "diet"
  typeId: string; // Example: "candida_unfriendly"
}

export interface FormProduct {
  alergen_warning: string[];
  barcode: string;
  brand: string;
  image_url: string;
  ingredients: string[];
  manufacturer?: string;
  name: string;
  net_weight?: string;
  nutritional_info: string;
  origin?: string;
}

export interface FormPreference {
  ingredients: string[];
  name: string;
  type: string;
  typeId: string;
}
