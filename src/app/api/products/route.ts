import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
// import { FormProduct } from '@/types'; // Unused import

// Helper function to get the correct file path
function getFilePath(category: string, subcategory: string): string {
  // Map the category names to their actual folder names
  const categoryMap: { [key: string]: string } = {
    'atıştırmalık': 'atıştırmalık',
    'icecek': 'i̇cecek', // Note: this has a special character
    'süt_ürünleri_ve_kahvaltılık': 'süt_ürünleri_ve_kahvaltılık',
    'temel_gıda': 'temel_gıda',
    'unlu_mamul_ve_tatlı': 'unlu_mamul_ve_tatlı',
    'yaşam_ve_beslenme_tarzı': 'yaşam_ve_beslenme_tarzı'
  };

  const actualCategory = categoryMap[category] || category;
  const actualSubcategory = subcategory;
  
  const filePath = path.join(process.cwd(), 'public', 'data', actualCategory, actualSubcategory, 'products.json');
  console.log('Resolved file path:', filePath);
  return filePath;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');

    if (!category || !subcategory) {
      return NextResponse.json({ error: 'Category and subcategory are required' }, { status: 400 });
    }

    const filePath = getFilePath(category, subcategory);
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const products = JSON.parse(fileContent);
      return NextResponse.json(products);
    } catch (error) {
      // If file doesn't exist, return empty array
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json([]);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error reading products:', error);
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, category, subcategory } = body;

    if (!product || !category || !subcategory) {
      return NextResponse.json({ error: 'Product, category, and subcategory are required' }, { status: 400 });
    }

    const filePath = getFilePath(category, subcategory);
    const dataDir = path.dirname(filePath);

    console.log('Adding product to:', filePath);
    console.log('Product data:', product);

    // Ensure directory exists
    await fs.mkdir(dataDir, { recursive: true });

    let products = [];
    
    // Try to read existing products
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      products = JSON.parse(fileContent);
      console.log('Existing products count:', products.length);
    } catch (error) {
      // If file doesn't exist, start with empty array
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error reading existing file:', error);
        throw error;
      }
      console.log('No existing file found, starting with empty array');
    }

    // Add new product
    const newProduct = {
      ...product,
      // Add any additional fields that match your existing format
      storage_conditions: "Serin ve Kuru Yerde Muhafaza Ediniz",
    };

    products.push(newProduct);
    console.log('Total products after adding:', products.length);

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf-8');
    console.log('File written successfully');

    return NextResponse.json({ 
      success: true, 
      message: `Product added to ${category}/${subcategory}`,
      product: newProduct 
    });
  } catch (error) {
    console.error('Error adding product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to add product: ' + errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, category, subcategory } = body;

    if (!products || !Array.isArray(products) || !category || !subcategory) {
      return NextResponse.json({ error: 'Products array, category, and subcategory are required' }, { status: 400 });
    }

    const filePath = getFilePath(category, subcategory);
    const dataDir = path.dirname(filePath);

    console.log('Bulk uploading products to:', filePath);
    console.log('Products count:', products.length);

    // Ensure directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Process products to match your existing format
    const processedProducts = products.map((product: Record<string, unknown>) => ({
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
      storage_conditions: "Serin ve Kuru Yerde Muhafaza Ediniz",
      local_image_path: product.local_image_path || "",
    }));

    // Write to file
    await fs.writeFile(filePath, JSON.stringify(processedProducts, null, 2), 'utf-8');
    console.log('Bulk upload file written successfully');

    return NextResponse.json({ 
      success: true, 
      message: `Bulk upload completed for ${category}/${subcategory}`,
      count: processedProducts.length 
    });
  } catch (error) {
    console.error('Error bulk uploading products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to bulk upload products: ' + errorMessage }, { status: 500 });
  }
}
