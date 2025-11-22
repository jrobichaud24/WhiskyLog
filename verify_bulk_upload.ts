
import { convertCSVToJSON } from './client/src/lib/csvUtils';
import * as fs from 'fs';
import * as path from 'path';

try {
    const csvPath = path.resolve('./test_upload.csv');
    console.log(`Reading CSV from ${csvPath}`);
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    console.log('Converting CSV to JSON...');
    const json = convertCSVToJSON(csvContent, 'products');

    console.log(`Converted ${json.length} items.`);

    if (json.length === 0) {
        throw new Error('No items converted');
    }

    const firstItem = json[0];
    console.log('First item sample:', JSON.stringify(firstItem, null, 2));

    // Verification Checks
    const errors: string[] = [];

    // Check new fields
    if (!('filtration' in firstItem)) errors.push('Missing field: filtration');
    if (!('appearance' in firstItem)) errors.push('Missing field: appearance');

    // Check number parsing
    if (typeof firstItem.abvPercent !== 'number') {
        errors.push(`abvPercent should be a number, got ${typeof firstItem.abvPercent} (${firstItem.abvPercent})`);
    }
    if (typeof firstItem.volumeCl !== 'number') {
        // Note: volume_cl might be empty in the first row of test_upload.csv, let's check a row where it exists if possible, 
        // or just check that it's not a string if it has a value.
        // Looking at the CSV, row 2 (index 0) has empty volume_cl.
        // Row 11 (index 9) "Aberfeldy 22..." has volume_cl "70".
        // Let's find an item with volumeCl
        const itemWithVolume = json.find(i => i.volumeCl !== null && i.volumeCl !== undefined);
        if (itemWithVolume) {
            if (typeof itemWithVolume.volumeCl !== 'number') {
                errors.push(`volumeCl should be a number, got ${typeof itemWithVolume.volumeCl} (${itemWithVolume.volumeCl})`);
            }
        } else {
            console.warn('No item with volumeCl found to verify type');
        }
    }

    if (errors.length > 0) {
        console.error('Verification Failed with errors:');
        errors.forEach(e => console.error(`- ${e}`));
        process.exit(1);
    }

    console.log('Verification Successful! All fields mapped and types correct.');

} catch (error) {
    console.error('Verification script failed:', error);
    process.exit(1);
}
