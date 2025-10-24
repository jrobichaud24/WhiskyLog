const mammoth = require('mammoth');
const fs = require('fs');

mammoth.extractRawText({ path: 'TheDramJournal_Privacy_Policy.docx' })
  .then(result => {
    const text = result.value;
    fs.writeFileSync('privacy-policy-content.txt', text);
    console.log('Privacy policy extracted successfully!');
    console.log('\n--- Content Preview ---');
    console.log(text.substring(0, 500) + '...\n');
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
