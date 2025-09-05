import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const testDir = path.join(process.cwd(), 'public', 'data', 'test');
    const testFile = path.join(testDir, 'test.json');
    
    // Test directory creation
    await fs.mkdir(testDir, { recursive: true });
    
    // Test file writing
    const testData = { message: 'Test successful', timestamp: new Date().toISOString() };
    await fs.writeFile(testFile, JSON.stringify(testData, null, 2), 'utf-8');
    
    // Test file reading
    const readData = await fs.readFile(testFile, 'utf-8');
    const parsedData = JSON.parse(readData);
    
    // Clean up
    await fs.unlink(testFile);
    await fs.rmdir(testDir);
    
    return NextResponse.json({
      success: true,
      message: 'File system operations working',
      testData,
      readData: parsedData,
      cwd: process.cwd(),
      testPath: testFile
    });
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      cwd: process.cwd()
    }, { status: 500 });
  }
}
