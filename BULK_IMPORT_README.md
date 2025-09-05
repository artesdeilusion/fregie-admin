# 🚀 Bulk Import Products - Fregie Admin

This guide explains how to import all products from your `public/data` folder structure into your database.

## 📁 What Gets Imported

The system will scan your `public/data` folder structure and import products from:
- **6 main categories** (atıştırmalık, içecek, süt_ürünleri_ve_kahvaltılık, temel_gıda, unlu_mamul_ve_tatlı, yaşam_ve_beslenme_tarzı)
- **59 subcategories** (bar, bisküvi, cikolata, etc.)
- **~6,000 total products** across all categories

## 🎯 How to Import

### Option 1: Web Interface (Recommended)

1. **Navigate to Admin Tab**
   - Go to your admin dashboard
   - Click on the "Admin" tab in the navigation
   - You'll see the "Bulk Import Products" section

2. **Choose Import Mode**
   - **Dry Run** (default): Counts products without importing
   - **Live Import**: Actually imports products to your database

3. **Start Import**
   - Click "Start Dry Run" to preview what will be imported
   - Review the results
   - If satisfied, uncheck "Dry Run" and click "Start Import"

### Option 2: Command Line

For more detailed output and control:

```bash
# Dry run (count products without importing)
node scripts/import-products.js --dry-run

# Actual import
node scripts/import-products.js
```

## 📊 Import Results

The system provides detailed feedback:

- **Total Products Found**: How many products were discovered
- **Successfully Imported**: Products that were added to the database
- **Failed to Import**: Products with validation errors
- **Detailed Results**: Breakdown by category/subcategory
- **Error Logging**: Specific issues for failed imports

## ✅ Validation Rules

Products are considered valid if they have:
- ✅ **Product Name** (required)
- ✅ **Brand** (required)
- 🔄 **Barcode** (auto-generated if missing)

## 🔧 Technical Details

### Data Normalization
- Handles special Turkish characters in category names
- Normalizes ingredient and allergen arrays
- Adds default storage conditions
- Generates unique IDs for products without barcodes

### Error Handling
- Gracefully handles missing files
- Reports validation errors
- Continues processing even if some products fail
- Provides detailed error messages

### Performance
- Processes files asynchronously
- Memory-efficient for large datasets
- Progress reporting during import

## 🚨 Important Notes

1. **Backup First**: Always backup your database before running a live import
2. **Dry Run First**: Always run a dry run to preview what will be imported
3. **Large Dataset**: Importing 6,000+ products may take several minutes
4. **Duplicate Handling**: The system will add new products (doesn't check for duplicates)

## 🐛 Troubleshooting

### Common Issues

1. **"Products not found"**
   - Check that your `public/data` folder structure is correct
   - Ensure `products.json` files exist in each subcategory

2. **"Validation errors"**
   - Products missing name or brand will be skipped
   - Check the detailed results for specific error messages

3. **"Import failed"**
   - Check browser console for error details
   - Verify your database connection
   - Check server logs for API errors

### Getting Help

- Check the browser console for detailed error messages
- Review the import results for specific failure reasons
- Use the command line version for more detailed output
- Check the `import-results.json` file for complete results

## 📈 Expected Results

Based on your current data:
- **Total Products**: ~6,000
- **Valid Products**: ~5,970
- **Invalid Products**: ~30 (missing name/brand)
- **Success Rate**: ~99.5%

## 🔄 Re-running Imports

You can safely re-run imports:
- The system will add new products
- Existing products won't be duplicated
- Each run provides fresh validation results

## 📝 File Structure

Your data should be organized as:
```
public/data/
├── atıştırmalık/
│   ├── bar/products.json
│   ├── bisküvi/products.json
│   └── ...
├── içecek/
│   ├── cay/products.json
│   └── ...
└── ...
```

Each `products.json` should contain an array of product objects with the required fields.
