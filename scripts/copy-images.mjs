import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const assets = path.join(
  process.env.USERPROFILE,
  '.cursor/projects/d-Jayy-PROJECTS-DSS-01-CLIENTS-09-Brick-Beam-bhilar-Brick-and-Beam/assets'
)
const destRoot = path.join(root, 'public/images')

const renameMap = {
  '00_-_Cover': 'hero/cover-dusk.png',
  '01_-_Pool': 'gallery/pool-area.png',
  '01.1_-_Bonfire': 'gallery/bonfire.png',
  '02_-_BB_SV': 'logo/brick-and-beam-sign.png',
  '03_-_Game': 'gallery/game-room-1.png',
  '04_-_Living': 'gallery/living-room-1.png',
  '05_-_Dining': 'gallery/dining-room.png',
  '06_-_Bedroom_1-1': 'gallery/bedroom-1-1.png',
  '07_-_Bedroom_1-2': 'gallery/bedroom-1-2.png',
  '08_-_Balcony_1': 'gallery/balcony-1.png',
  '09_-_Bathroom_1': 'gallery/bathroom-1.png',
  '10_-_Bedroom_2-1': 'gallery/bedroom-2-1.png',
  '11_-_Bedroom_2-2': 'gallery/bedroom-2-2.png',
  '12_-_Balcony_2': 'gallery/balcony-2.png',
  '13_-_Bathroom_2': 'gallery/bathroom-2.png',
  '14_-_Vertical': 'gallery/balcony-view-1.png',
  '15_-_Vertical': 'gallery/balcony-view-2.png',
  '16_-_Vertical': 'gallery/balcony-view-3.png',
  '17_-_Bedroom_3-1': 'gallery/bedroom-3-1.png',
  '18_-_Bedroom_3-2': 'gallery/bedroom-3-2.png',
  '19_-_Balcony_3': 'gallery/balcony-3.png',
  '20_-_Bathroom_3': 'gallery/bathroom-3.png',
  '21_-_Passage': 'gallery/interior-passage.png',
  '22_-_Bedroom_4-1': 'gallery/bedroom-4-1.png',
  '23_-_Bedroom_4-2': 'gallery/bedroom-4-2.png',
  '24_-_Balcony_4': 'gallery/balcony-4.png',
  '25_-_Bathroom_4': 'gallery/bathroom-4.png',
  '26_-_Living': 'gallery/living-room-2.png',
  '27_-_Food': 'gallery/breakfast-spread.png',
  '28_-_Kitchen': 'gallery/kitchen.png',
  '29_-_Game': 'gallery/game-room-2.png',
  '30_-_Pool___Facade': 'hero/pool-facade-day.png',
  '32_-_Facade': 'hero/facade-day.png',
  '33_-_Facade': 'hero/facade-dusk.png',
}

function findKey(filename) {
  for (const key of Object.keys(renameMap)) {
    if (filename.includes(`_${key}-`)) return key
  }
  return null
}

const files = fs.readdirSync(assets)
let copied = 0
let extra = 0

for (const file of files) {
  const key = findKey(file)
  if (key) {
    const target = path.join(destRoot, renameMap[key])
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.copyFileSync(path.join(assets, file), target)
    console.log('OK', renameMap[key])
    copied++
  } else if (file.includes('_image-')) {
    extra++
    const target = path.join(destRoot, `gallery/extra-${extra}.png`)
    fs.copyFileSync(path.join(assets, file), target)
    console.log('OK', `gallery/extra-${extra}.png`)
    copied++
  }
}

console.log(`\nCopied ${copied} files to public/images/`)
