const fs = require('fs')
const execSync = require('child_process').execSync

const path = './'
const files = fs.readdirSync(path, {})

// js
const jsFiles = files
  .filter(
    file => file.substr(file.length - 2) === 'js' // ||
    // file.substr(file.length - 3) === 'jsx'
  )
  .filter(file => file !== 'lebab.js' && file !== 'cities.js')
console.log('jsFiles', jsFiles)

// jsx
const jsxFiles = files.filter(file => file.substr(file.length - 3) === 'jsx')
console.log('jsxFiles', jsxFiles)

// call lebab.sh for each js file
let command
jsFiles.forEach(file => {
  command = `sh lebab.sh ${file}`
  console.log('current command', command)
  execSync(command)
})

// call lebab.sh for each jsx file
let command
jsxFiles.forEach(file => {
  command = `sh lebab.sh ${file}`
  console.log('current command', command)
  execSync(command)
})
