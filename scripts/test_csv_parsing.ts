
import fs from "fs";
import path from "path";

// Copied from client/src/lib/csvUtils.ts to avoid import issues in script
function convertCSVToJSON(csvText: string, type: 'distilleries' | 'products'): any[] {
    console.log('Converting CSV with', csvText.split('\n').length, 'lines');
    const lines = csvText.trim().split('\n');

    if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
    }

    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    console.log(`Detected delimiter: ${delimiter === '\t' ? 'TAB' : 'COMMA'}`);

    const headers = parseCSVLine(lines[0], delimiter).map(h => h.trim());
    console.log('CSV headers detected:', headers.length, 'columns');
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
        let values = parseCSVLine(lines[i], delimiter);

        // Skip empty lines
        if (values.length === 1 && values[0] === '') continue;

        while (values.length < headers.length) {
            values.push('');
        }

        if (values.length > headers.length) {
            console.warn(`Row ${i + 1}: has ${values.length} columns, expected ${headers.length}, truncating`);
            values = values.slice(0, headers.length);
        }

        const row: any = {};
        headers.forEach((header, index) => {
            const value = values[index] ? values[index].trim() : '';

            let fieldName = header;
            if (type === 'products') {
                const fieldMappings: Record<string, string> = {
                    'distillery_id': 'distillery',
                    'distilleryId': 'distillery',
                    'distillery_name': 'distillery',
                    'distilleryName': 'distillery',
                    'distillery': 'distillery',
                    'abv_percent': 'abvPercent',
                    'abvPercent': 'abvPercent',
                    'abv': 'abvPercent',
                    'volume_cl': 'volumeCl',
                    'volumeCl': 'volumeCl',
                    'volume': 'volumeCl',
                    'tasting_nose': 'tastingNose',
                    'tastingNose': 'tastingNose',
                    'nose': 'tastingNose',
                    'tasting_taste': 'tastingTaste',
                    'tastingTaste': 'tastingTaste',
                    'taste': 'tastingTaste',
                    'palate': 'tastingTaste',
                    'tasting_finish': 'tastingFinish',
                    'tastingFinish': 'tastingFinish',
                    'finish': 'tastingFinish',
                    'product_url': 'productUrl',
                    'productUrl': 'productUrl',
                    'url': 'productUrl',
                    'filtration': 'filtration',
                    'appearance': 'appearance',
                    'product_image': 'productImage',
                    'productImage': 'productImage',
                    'image': 'productImage',
                    'image_url': 'productImage',
                    'description': 'description'
                };
                fieldName = fieldMappings[header] || header;
            }

            if (type === 'distilleries') {
                if (header === 'founded' && value) {
                    row[header] = parseInt(value) || null;
                } else if (header === 'status') {
                    row[header] = value || 'active';
                } else if (header === 'country') {
                    row[header] = value || 'Scotland';
                } else if (header === 'region') {
                    row[header] = value || 'Highland';
                } else if (header === 'name') {
                    row[header] = value || `Distillery ${i}`;
                } else {
                    row[header] = value || null;
                }
            } else if (type === 'products') {
                if (fieldName === 'name') {
                    row[fieldName] = value || `Product ${i}`;
                } else if (fieldName === 'distillery') {
                    row[fieldName] = value || null;
                } else if (fieldName === 'price' && value) {
                    const cleanPrice = value
                        .replace(/^[A-Z]{3}\s*/, '')
                        .replace(/^[£$€¥₹¢₽₩₨₪₡₦₴₸₼₻₺₾₺₵₶₷₸₹₺₻₼₽₾₿]/g, '')
                        .replace(/[,\s]/g, '')
                        .trim();
                    row[fieldName] = cleanPrice || null;
                } else if (fieldName === 'abvPercent' && value) {
                    // Keep as string for decimal type
                    const val = value.replace(/[^\d.]/g, '');
                    row[fieldName] = val || null;
                } else if (fieldName === 'volumeCl' && value) {
                    // Keep as string for decimal type
                    const val = value.replace(/[^\d.]/g, '');
                    row[fieldName] = val || null;
                } else {
                    row[fieldName] = value || null;
                }
            }
        });

        data.push(row);
    }

    return data;
}

function parseCSVLine(line: string, delimiter = ','): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i += 2;
                continue;
            }
            inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
            i++;
            continue;
        } else {
            current += char;
        }
        i++;
    }

    result.push(current.trim());
    return result.map(field => {
        if (field.startsWith('"') && field.endsWith('"')) {
            return field.slice(1, -1);
        }
        return field;
    });
}

const csvPath = path.resolve(process.cwd(), "test_upload.csv");
const csvContent = fs.readFileSync(csvPath, "utf-8");

console.log("Testing CSV parsing...");
const data = convertCSVToJSON(csvContent, "products");

// console.log("Parsed data (first item):", JSON.stringify(data[0], null, 2));

// Check types
const first = data[0];
if (typeof first.abvPercent === 'string') {
    console.log("✅ abvPercent is string");
} else {
    console.error("❌ abvPercent is NOT string:", typeof first.abvPercent);
}

if (typeof first.volumeCl === 'string') {
    console.log("✅ volumeCl is string");
} else {
    console.error("❌ volumeCl is NOT string:", typeof first.volumeCl);
}

if (first.productImage) {
    console.log("✅ productImage is mapped:", first.productImage);
} else {
    console.error("❌ productImage is NOT mapped");
}
