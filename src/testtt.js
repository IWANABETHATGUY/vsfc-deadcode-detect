const mo = require('../dist/vsfcdcd')
const fs = require('fs');
const path = require('path')
const file = fs.readFileSync(path.resolve(__dirname, 'template.test/large.test.vue')).toString()
console.log(mo.default(file))