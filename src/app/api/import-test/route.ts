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
    const { limit = 5, category = 'atıştırmalık', subcategory = 'bar' } = body;
    
    console.log('🧪 Starting test import...');
    console.log(`📁 Testing with: ${category}/${subcategory}, limit: ${limit}`);
    
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const productsFile = path.join(dataDir, category, subcategory, 'products.json');
    
    // Check if products.json exists
    await fs.access(productsFile);
    
    // Read products from file
    const fileContent = await fs.readFile(productsFile, 'utf-8');
    const products = JSON.parse(fileContent);
    
    if (!Array.isArray(products)) {
      throw new Error('Invalid products file format');
    }
    
    console.log(`📊 Found ${products.length} products, testing with first ${limit}`);
    
    const testProducts = products.slice(0, limit);
    const results: { success: number; failed: number; errors: string[] } = { success: 0, failed: 0, errors: [] };
    
    for (const product of testProducts) {
      try {
        console.log(`🔄 Testing import: ${product.name || product["﻿name"]} (${product.brand})`);
        
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
            normalizedProduct.barcode = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }
          
          // Validate data before sending to Firestore
          if (normalizedProduct.ingredients.some(item => Array.isArray(item))) {
            throw new Error('Nested arrays detected in ingredients field');
          }
          if (normalizedProduct.alergen_warning.some(item => Array.isArray(item))) {
            throw new Error('Nested arrays detected in alergen_warning field');
          }
          
          console.log(`📝 Sanitized data:`, {
            name: normalizedProduct.name,
            ingredients: normalizedProduct.ingredients,
            alergen_warning: normalizedProduct.alergen_warning
          });
          
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
          
          console.log(`✅ Successfully imported: ${normalizedProduct.name} (ID: ${result})`);
          results.success++;
          
        } else {
          throw new Error('Missing required fields: name or brand');
        }
        
      } catch (error) {
        console.error(`❌ Failed to import product:`, error);
        console.error(`❌ Error details:`, {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          product: product.name || product["﻿name"]
        });
        results.failed++;
        results.errors.push(`${product.name || product["﻿name"]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log('');
    console.log('🧪 Test import completed!');
    console.log(`📊 Summary:`);
    console.log(`   Tested: ${testProducts.length} products`);
    console.log(`   Successfully imported: ${results.success}`);
    console.log(`   Failed to import: ${results.failed}`);
    console.log(`   Success rate: ${testProducts.length > 0 ? Math.round((results.success / testProducts.length) * 100) : 0}%`);
    
    return NextResponse.json({
      success: true,
      message: 'Test import completed',
      summary: {
        tested: testProducts.length,
        success: results.success,
        failed: results.failed
      },
      results
    });
    
  } catch (error) {
    console.error('Test import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: 'Test import failed: ' + errorMessage 
    }, { status: 500 });
  }
}


