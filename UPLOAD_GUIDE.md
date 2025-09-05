# Product Upload Guide

This guide explains how to use the new product upload functionality to add products to the `public/data` folder structure.

## Overview

The system now includes a comprehensive product upload feature that allows you to:
- Upload individual products to specific categories and subcategories
- Bulk upload multiple products from JSON files
- Automatically organize products into the existing folder structure

## How to Use

### 1. Access the Upload Feature

1. Navigate to the Products page in your admin panel
2. Click the **"Upload to Data Folder"** button (green button with upload icon)
3. This will open the Product Upload Form modal

### 2. Select Category and Subcategory

The form includes a dropdown to select from the available categories:

- **Atıştırmalık** (Snacks)
  - bar, bisküvi, cikolata, cips, gofret, ikramlıklar, kek, kraker, kuru_meyve, kuru_yemiş, sakız, şekerleme
- **İçecek** (Beverages)
  - cay, gazlı_icecek, gazsız_icecek, günlük_icecek, kahve, kombucha_ve_malt_icecek, maden_suyu, su
- **Süt Ürünleri ve Kahvaltılık** (Dairy Products and Breakfast)
  - dondurma, kahvaltılıklar, margarin, peynir, süt, sütlü_tatlılar_ve_krema, tereyağı, yoğurt
- **Temel Gıda** (Basic Food)
  - bakliyat_ve_pirinc, corba_ve_bulyonlar, hazır_yemek, konserve,_salca_ve_turşu, makarna, mayalar, şeker, sıvı_yağlar, soslar, tuz,_baharat_ve_harc, un_ve_irmik
- **Unlu Mamul ve Tatlı** (Bakery and Desserts)
  - börekler, dondurulmuş, ekmek, galetta_ve_grissini_ve_gevrek, hamur_ve_pasta_malzemeleri, pasta_ve_kek_ceşitleri, tatlılar, toz_tatlılar, yufka_ve_erişte
- **Yaşam ve Beslenme Tarzı** (Lifestyle and Nutrition)
  - aktif_yaşam, bar, glutensiz, kafeinsiz, kolajen, laktozsuz, organik, probiyotik, şekersiz_tatlandırıcılar, süper_gıdalar, vegan_ve_vejetaryen

### 3. Upload Modes

#### Single Product Upload
- Fill out the product form with all required information
- Required fields: Name, Brand, Barcode, Ingredients
- Optional fields: Net Weight, Origin, Manufacturer, Image URL, Nutritional Information, Allergen Warnings
- Click "Upload Product" to save

#### Bulk Upload (JSON)
- Select "Bulk Upload (JSON)" mode
- Choose a JSON file containing an array of products
- The system will automatically process and upload all products
- Click "Process Bulk Upload" to complete the operation

### 4. Product Data Format

Products are automatically formatted to match your existing JSON structure:

```json
{
  "name": "Product Name",
  "brand": "Brand Name",
  "barcode": "1234567890123",
  "image_url": "https://example.com/image.jpg",
  "ingredients": ["ingredient1", "ingredient2"],
  "alergen_warning": ["allergen1", "allergen2"],
  "net_weight": "100g",
  "nutritional_info": "Nutritional information text",
  "manufacturer": "Manufacturer Name",
  "origin": "TÜRKİYE",
  "storage_conditions": "Serin ve Kuru Yerde Muhafaza Ediniz"
}
```

### 5. File Storage

Products are automatically saved to:
```
public/data/{category}/{subcategory}/products.json
```

The system will:
- Create the directory structure if it doesn't exist
- Read existing products from the file
- Add new products to the array
- Save the updated file back to disk

## Technical Details

### API Endpoints

- `POST /api/products` - Add single product
- `PUT /api/products` - Bulk upload products
- `GET /api/products?category={cat}&subcategory={sub}` - Read products from specific folder

### Data Validation

The system validates:
- Required fields are present
- Ingredients array is not empty
- Product data structure is correct

### Error Handling

- Validation errors are displayed to the user
- File system errors are logged and reported
- Network errors are handled gracefully

## Example JSON for Bulk Upload

```json
[
  {
    "name": "Sample Product 1",
    "brand": "Sample Brand",
    "barcode": "1234567890123",
    "ingredients": ["ingredient1", "ingredient2"],
    "alergen_warning": ["allergen1"],
    "net_weight": "100g",
    "nutritional_info": "Sample nutritional info",
    "manufacturer": "Sample Manufacturer",
    "origin": "TÜRKİYE"
  },
  {
    "name": "Sample Product 2",
    "brand": "Sample Brand",
    "barcode": "1234567890124",
    "ingredients": ["ingredient3", "ingredient4"],
    "alergen_warning": [],
    "net_weight": "200g",
    "nutritional_info": "Sample nutritional info 2",
    "manufacturer": "Sample Manufacturer",
    "origin": "TÜRKİYE"
  }
]
```

## Notes

- The system automatically adds `storage_conditions` field to all products
- Existing products in the JSON files are preserved
- The system handles both individual and bulk uploads efficiently
- All operations are logged for debugging purposes

## Troubleshooting

If you encounter issues:

1. Check that all required fields are filled
2. Ensure the JSON file is valid
3. Verify that the selected category and subcategory exist
4. Check the browser console for error messages
5. Ensure the API endpoints are accessible

For technical support, check the server logs and API response messages.
