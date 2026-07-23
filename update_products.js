const fs = require('fs');
const file = './src/data/products.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/rating: \d+(\.\d+)?,/g, 'rating: 0,');
content = content.replace(/reviews: \d+,/g, 'reviews: 0,');
content = content.replace(/weight: '([^']+)',/g, (match, w) => {
  return `weight: '${w}',\n    contentVolume: '',`;
});

fs.writeFileSync(file, content);
console.log('Done modifying products.js');
