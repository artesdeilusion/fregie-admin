import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { addProduct } from '@/lib/firestore';
import { sanitizeProductData } from '@/lib/dataUtils';

interface ImportedProduct {
  name: string;
  brand: string;
  barcode: string;
  image_url: string;
  ingredients: string[];
  alergen_warning: string[];
  net_weight: string;
  nutritional_info: string;
  manufacturer: string;
  origin: string;
  storage_conditions: string;
  local_image_path?: string;
  category: string;
  subcategory: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dryRun = false } = body; // If true, just count products without importing
    
    console.log('🚀 Starting bulk import...');
    console.log('🔍 Dry run mode:', dryRun);
    console.log('📁 Data directory:', path.join(process.cwd(), 'public', 'data'));
    
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const allProducts: ImportedProduct[] = [];
    const importResults: { [key: string]: { success: number; failed: number; errors: string[] } } = {};
    let processedCount = 0;
    
    // Get all category directories
    const categories = await fs.readdir(dataDir);
    
    for (const category of categories) {
      if (category === '.DS_Store') continue;
      
      const categoryPath = path.join(dataDir, category);
      const categoryStat = await fs.stat(categoryPath);
      
      if (!categoryStat.isDirectory()) continue;
      
      console.log(`Processing category: ${category}`);
      
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
          
          console.log(`  Processing subcategory: ${subcategory}`);
          
          // Read products from file
          const fileContent = await fs.readFile(productsFile, 'utf-8');
          const products = JSON.parse(fileContent);
          
          if (Array.isArray(products)) {
            console.log(`    Found ${products.length} products`);
            
            // Process each product
            for (const product of products) {
              try {
                processedCount++;
                
                // Sanitize product data to ensure Firestore compatibility
                const sanitizedProduct = sanitizeProductData(product);
                
                // Normalize product data
                const normalizedProduct: ImportedProduct = {
                  name: sanitizedProduct.name,
                  brand: sanitizedProduct.brand,
                  barcode: sanitizedProduct.barcode,
                  image_url: sanitizedProduct.image_url,
                  ingredients: sanitizedProduct.ingredients,
                  alergen_warning: sanitizedProduct.alergen_warning,
                  net_weight: sanitizedProduct.net_weight,
                  nutritional_info: sanitizedProduct.nutritional_info,
                  manufacturer: sanitizedProduct.manufacturer,
                  origin: sanitizedProduct.origin,
                  storage_conditions: sanitizedProduct.storage_conditions,
                  local_image_path: sanitizedProduct.local_image_path,
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
                  
                  // Update results for both dry run and live import
                  const key = `${category}/${subcategory}`;
                  if (!importResults[key]) {
                    importResults[key] = { success: 0, failed: 0, errors: [] };
                  }
                  
                  if (!dryRun) {
                    try {
                      // Log progress every 100 products
                      if (processedCount % 100 === 0) {
                        console.log(`📊 Progress: Processed ${processedCount} products...`);
                      }
                      
                      console.log(`🔄 Adding to Firestore: ${normalizedProduct.name} (${normalizedProduct.brand})`);
                      
                      // Validate data before sending to Firestore
                      if (normalizedProduct.ingredients.some(item => Array.isArray(item))) {
                        throw new Error('Nested arrays detected in ingredients field');
                      }
                      if (normalizedProduct.alergen_warning.some(item => Array.isArray(item))) {
                        throw new Error('Nested arrays detected in alergen_warning field');
                      }
                      
                      // Add to Firestore
                      const result = await addProduct({
                        name: normalizedProduct.name,
                        brand: normalizedProduct.brand,
                        barcode: normalizedProduct.barcode,
                        image_url: normalizedProduct.image_url,
                        ingredients: normalizedProduct.ingredients,
                        alergen_warning: normalizedProduct.alergen_warning,
                        net_weight: normalizedProduct.net_weight,
                        nutritional_info: normalizedProduct.nutritional_info,
                        manufacturer: normalizedProduct.manufacturer,
                        origin: normalizedProduct.origin
                      });
                      
                      console.log(`✅ Firestore result for ${normalizedProduct.name}:`, result);
                      importResults[key].success++;
                      
                    } catch (error) {
                      console.error(`❌ Failed to import product ${normalizedProduct.name}:`, error);
                      console.error(`❌ Error details:`, {
                        message: error instanceof Error ? error.message : 'Unknown error',
                        stack: error instanceof Error ? error.stack : undefined,
                        product: normalizedProduct.name,
                        ingredients: normalizedProduct.ingredients,
                        alergen_warning: normalizedProduct.alergen_warning
                      });
                      importResults[key].failed++;
                      importResults[key].errors.push(`${normalizedProduct.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                  } else {
                    // In dry run mode, just count as successful
                    importResults[key].success++;
                  }
                }
              } catch (productError) {
                console.error(`Error processing product in ${category}/${subcategory}:`, productError);
                
                const key = `${category}/${subcategory}`;
                if (!importResults[key]) {
                  importResults[key] = { success: 0, failed: 0, errors: [] };
                }
                importResults[key].failed++;
                importResults[key].errors.push(`Product processing error: ${productError instanceof Error ? productError.message : 'Unknown error'}`);
              }
            }
          }
          
        } catch (fileError) {
          console.error(`Error reading ${productsFile}:`, fileError);
        }
      }
    }
    
    const totalProducts = allProducts.length;
    const totalSuccess = Object.values(importResults).reduce((sum, result) => sum + result.success, 0);
    const totalFailed = Object.values(importResults).reduce((sum, result) => sum + result.failed, 0);
    
    console.log('');
    console.log('🎉 Import completed!');
    console.log(`📊 Summary:`);
    console.log(`   Total products found: ${totalProducts}`);
    console.log(`   Total processed: ${totalSuccess + totalFailed}`);
    console.log(`   Successfully imported: ${totalSuccess}`);
    console.log(`   Failed to import: ${totalFailed}`);
    console.log(`   Success rate: ${totalProducts > 0 ? Math.round((totalSuccess / totalProducts) * 100) : 0}%`);
    
    return NextResponse.json({
      success: true,
      message: dryRun ? 'Dry run completed' : 'Bulk import completed',
      summary: {
        totalProducts,
        totalSuccess,
        totalFailed,
        dryRun
      },
      results: importResults
    });
    
  } catch (error) {
    console.error('Bulk import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: 'Bulk import failed: ' + errorMessage 
    }, { status: 500 });
  }
}
