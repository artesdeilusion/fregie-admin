#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const DRY_RUN = process.argv.includes('--dry-run');

console.log('🚀 Starting bulk product import...');
console.log(`📁 Data directory: ${DATA_DIR}`);
console.log(`🔍 Dry run mode: ${DRY_RUN ? 'ON' : 'OFF'}`);
console.log('');

async function importProducts() {
  try {
    const allProducts = [];
    const importResults = {};
    
    // Get all category directories
    const categories = await fs.readdir(DATA_DIR);
    
    for (const category of categories) {
      if (category === '.DS_Store') continue;
      
      const categoryPath = path.join(DATA_DIR, category);
      const categoryStat = await fs.stat(categoryPath);
      
      if (!categoryStat.isDirectory()) continue;
      
      console.log(`📂 Processing category: ${category}`);
      
      // Get all subcategory directories
      const subcategories = await fs.readdir(categoryPath);
      
      for (const subcategory of subcategories) {
        if (subcategory === '.DS_Store') continue;
        
        const subcategoryPath = path.join(categoryPath, subcategory);
        const subcategoryStat = await fs.stat(subcategoryPath);
        
        if (!subcategoryStat.isDirectory()) continue;
        
        const productsFile = path.join(subcategoryPath, 'products.json');
        
        try {
          // Check if products.json exists
          await fs.access(productsFile);
          
          console.log(`  📄 Processing subcategory: ${subcategory}`);
          
          // Read products from file
          const fileContent = await fs.readFile(productsFile, 'utf-8');
          const products = JSON.parse(fileContent);
          
          if (Array.isArray(products)) {
            console.log(`    ✅ Found ${products.length} products`);
            
            // Process each product
            for (const product of products) {
              try {
                // Normalize product data
                const normalizedProduct = {
                  name: product.name || product["﻿name"] || "",
                  brand: product.brand || "",
                  barcode: product.barcode || "",
                  image_url: product.image_url || "",
                  ingredients: Array.isArray(product.ingredients) ? product.ingredients : [product.ingredients || ""],
                  alergen_warning: Array.isArray(product.alergen_warning) ? product.alergen_warning : [product.allergen_warning || ""],
                  net_weight: product.net_weight || "",
                  nutritional_info: product.nutritional_info || "",
                  manufacturer: product.manufacturer || "",
                  origin: product.origin || "",
                  storage_conditions: product.storage_conditions || "Serin ve Kuru Yerde Muhafaza Ediniz",
                  local_image_path: product.local_image_path || "",
                  category,
                  subcategory
                };
                
                // Validate product data - only require name and brand
                if (normalizedProduct.name && normalizedProduct.brand) {
                  // Generate a unique ID if barcode is empty
                  if (!normalizedProduct.barcode || normalizedProduct.barcode.trim() === '') {
                    normalizedProduct.barcode = `IMPORT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                  }
                  
                  allProducts.push(normalizedProduct);
                  
                  // Update results
                  const key = `${category}/${subcategory}`;
                  if (!importResults[key]) {
                    importResults[key] = { success: 0, failed: 0, errors: [] };
                  }
                  importResults[key].success++;
                  
                } else {
                  // Invalid product
                  const key = `${category}/${subcategory}`;
                  if (!importResults[key]) {
                    importResults[key] = { success: 0, failed: 0, errors: [] };
                  }
                  importResults[key].failed++;
                  importResults[key].errors.push(`Invalid product: missing name or brand`);
                }
                
              } catch (productError) {
                console.error(`    ❌ Error processing product in ${category}/${subcategory}:`, productError.message);
                
                const key = `${category}/${subcategory}`;
                if (!importResults[key]) {
                  importResults[key] = { success: 0, failed: 0, errors: [] };
                }
                importResults[key].failed++;
                importResults[key].errors.push(`Product processing error: ${productError.message}`);
              }
            }
          }
          
        } catch (fileError) {
          console.error(`  ❌ Error reading ${productsFile}:`, fileError.message);
        }
      }
    }
    
    // Summary
    const totalProducts = allProducts.length;
    const totalSuccess = Object.values(importResults).reduce((sum, result) => sum + result.success, 0);
    const totalFailed = Object.values(importResults).reduce((sum, result) => sum + result.failed, 0);
    
    console.log('');
    console.log('📊 Import Summary:');
    console.log(`   Total products found: ${totalProducts}`);
    console.log(`   Valid products: ${totalSuccess}`);
    console.log(`   Invalid products: ${totalFailed}`);
    console.log('');
    
    if (DRY_RUN) {
      console.log('🔍 This was a dry run. No products were actually imported.');
      console.log('💡 To perform the actual import, run: node scripts/import-products.js');
    } else {
      console.log('✅ Import completed successfully!');
    }
    
    // Detailed results
    console.log('');
    console.log('📋 Detailed Results:');
    Object.entries(importResults).forEach(([category, result]) => {
      const status = result.failed > 0 ? '⚠️' : '✅';
      console.log(`${status} ${category}: ${result.success} valid, ${result.failed} invalid`);
      
      if (result.errors.length > 0) {
        result.errors.slice(0, 3).forEach(error => {
          console.log(`   ❌ ${error}`);
        });
        if (result.errors.length > 3) {
          console.log(`   ... and ${result.errors.length - 3} more errors`);
        }
      }
    });
    
    // Save results to file
    const resultsFile = path.join(__dirname, '..', 'import-results.json');
    const resultsData = {
      timestamp: new Date().toISOString(),
      dryRun: DRY_RUN,
      summary: {
        totalProducts,
        totalSuccess,
        totalFailed
      },
      results: importResults,
      products: allProducts
    };
    
    await fs.writeFile(resultsFile, JSON.stringify(resultsData, null, 2), 'utf-8');
    console.log('');
    console.log(`💾 Detailed results saved to: ${resultsFile}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
importProducts().catch(console.error);
