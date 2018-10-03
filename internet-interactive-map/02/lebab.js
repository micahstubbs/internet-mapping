const fs = require('fs')
const execSync = require('child_process').execSync

const path = './'
const files = fs.readdirSync(path, {})
const jsFiles = files
  .filter(
    file => file.substr(file.length - 2) === 'js' // ||
    // file.substr(file.length - 3) === 'jsx'
  )
  .filter(file => file !== 'lebab.js' && file !== 'cities.js')
console.log('jsFiles', jsFiles)

// call lebab.sh for each file
let command
jsFiles.forEach(file => {
  command = `sh lebab.sh ${file}`
  console.log('current command', command)
  execSync(command)
})
