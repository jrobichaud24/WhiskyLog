export function convertCSVToJSON(csvText: string, type: 'distilleries' | 'products'): any[] {
  console.log('Converting CSV with', csvText.split('\n').length, 'lines');
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  console.log('CSV headers detected:', headers.length, 'columns');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    let values = parseCSVLine(lines[i]);
    
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
          'product_image': 'productImage',
          'productImage': 'productImage',
          'image': 'productImage',
          'image_url': 'productImage'
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
          row[fieldName] = value;
        } else if (fieldName === 'volumeCl' && value) {
          row[fieldName] = value;
        } else {
          row[fieldName] = value || null;
        }
      }
    });

    if (i >= 70 && i <= 75) {
      console.log(`Row ${i}: name="${row.name}", region="${row.region}", headers:`, headers);
    }

    data.push(row);
  }

  console.log(`Successfully converted ${data.length} rows from CSV`);
  return data;
}

export function parseCSVLine(line: string): string[] {
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
    } else if (char === ',' && !inQuotes) {
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
