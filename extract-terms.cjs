const mammoth = require('mammoth');
const fs = require('fs');

mammoth.extractRawText({ path: 'TheDramJournal_Terms_of_Service.docx' })
  .then(result => {
    const text = result.value;
    fs.writeFileSync('terms-of-service-content.txt', text);
    console.log('Terms of Service extracted successfully!');
    console.log('\n--- Content Preview ---');
    console.log(text.substring(0, 500) + '...\n');
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
