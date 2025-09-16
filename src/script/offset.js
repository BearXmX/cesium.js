import * as fs from 'fs';
import { fileURLToPath } from 'url'
import * as path from 'path';
import { escape } from 'querystring';

//  node .\src\script\offset.js --/earthquake/AFRICA-mainland-outline.geojson

const args = process.argv.slice(2); // 去掉前两个（node 路径 + 脚本路径）

// 取第一个参数
const filePath = args[0].replace('--', '');

const __dirname = process.cwd()

const prefix = __dirname + '/public/data'

const geoPath = prefix + filePath

const geojson = JSON.parse(fs.readFileSync(geoPath, 'utf8'));

function offset(num) {
  let str = num.toString();

  // 整数情况
  if (!str.includes('.')) {
    const rand = Math.floor(Math.random() * 9) + 1; // 1-9
    return parseFloat(str + '.' + rand);
  }

  const [intPart, decPart] = str.split('.');
  let newDec = decPart;

  // 根据小数长度决定加几位随机数
  if (decPart.length < 6) {
    // 末位随机且不为0
    const rand = Math.floor(Math.random() * 9) + 1;
    newDec = decPart + rand;
  } else if (decPart.length < 10) {
    const rand1 = Math.floor(Math.random() * 9) + 1;
    const rand2 = Math.floor(Math.random() * 9) + 1;
    newDec = decPart + rand1 + rand2;
  } else {
    const rand = Math.floor(Math.random() * 9) + 1;
    // 替换最后一位
    newDec = newDec.slice(0, -1) + rand;
  }

  return parseFloat(intPart + '.' + newDec);
}


geojson.features.forEach(feature => {

  if (feature.geometry) {

    if (!feature.geometry.geometries) {


      if (feature.geometry.type === 'MultiLineString') {

        feature.geometry.coordinates = feature.geometry.coordinates.map(line =>
          line.map(coord => coord.map(offset))
        )

      }

      if (feature.geometry.type === 'LineString') {

        feature.geometry.coordinates = feature.geometry.coordinates.map(line =>
          line.map(offset)
        )

      }

      if (feature.geometry.type === 'Point') {

        feature.geometry.coordinates = feature.geometry.coordinates.map(item => {
          return offset(item)
        })
      }

      if (feature.geometry.type === 'MultiPolygon') {

        feature.geometry.coordinates[0][0] = feature.geometry.coordinates[0][0].map((coordinateItem, index) => {
          coordinateItem = coordinateItem.map(item => {

            return offset(item)
          })

          return coordinateItem
        })
      }

      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates = feature.geometry.coordinates.map(Polygon =>
          Polygon.map(coord => coord.map(offset))
        )
      }

      return
    }

    if (feature.geometry.geometries) {

      feature.geometry.geometries.forEach(geometryItem => {

        if (geometryItem.type === 'Polygon') {

          geometryItem.coordinates[0] = geometryItem.coordinates[0].map((coordinateItem, index) => {
            coordinateItem = coordinateItem.map(item => {
              return offset(item)
            })

            return coordinateItem
          })
        }


      })
    }


  }
});


// 获取当前文件的目录
const __filename = path.resolve(fileURLToPath(import.meta.url), '..')

fs.writeFileSync(__filename + '/offset.json', JSON.stringify(geojson))

process.stdout.write('offset.json 文件已生成，请确认无误再覆盖')

process.exit(0)



