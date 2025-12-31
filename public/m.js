import fs from 'fs';

fs.readFile('./世界年降水量分布图.geojson', 'utf8', (err, data) => {

  if (err) {
    console.error(err);
    return;
  }

  const geojson = JSON.parse(data);

  console.log(geojson.features.length)
  geojson.features.forEach(feature => {
    const properties = feature.properties;

    /*     feature.properties = {
          fillColor: properties.FillColor,
        } */
  });

  /*   fs.writeFile('./世界年降水量分布图2.geojson', JSON.stringify(geojson), 'utf8', (err) => {
      if (err) {
        console.error(err);
      }
    }); */


})