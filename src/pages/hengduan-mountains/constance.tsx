import SampleLabel from '@/utils/plugins/sample-label'
import type { NotificationInstance } from 'antd/es/notification/interface'
import * as Cesium from 'cesium'

export type sampleLabelType = {
  position: Cesium.Cartesian3
  text: string
  instance: SampleLabel
  key: string
}

/** @description 获取当前相机参数 */
export const getCameraParams = (viewerRef: React.RefObject<Cesium.Viewer | null>) => {
  const camera = viewerRef.current!.camera

  // 获取相机位置（笛卡尔坐标）
  const position = camera.position

  // 获取方向参数
  const heading = camera.heading
  const pitch = camera.pitch
  const roll = camera.roll

  // 转换为经纬度
  const cartographic = Cesium.Cartographic.fromCartesian(position)
  const lon = Cesium.Math.toDegrees(cartographic.longitude)
  const lat = Cesium.Math.toDegrees(cartographic.latitude)
  const height = cartographic.height

  // 生成flyTo代码
  const code = `viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(${lon.toFixed(8)}, ${lat.toFixed(8)}, ${height.toFixed(2)}),
    orientation: {
        heading: ${heading},
        pitch: ${pitch},
        roll: ${roll}
    }
});`

  console.log(code)

  return code
}

/** @description 点击事件 */
export const initClickHandler = (viewerRef: React.RefObject<Cesium.Viewer | null>,) => {
  const handler = new Cesium.ScreenSpaceEventHandler(viewerRef.current!.scene.canvas)

  handler.setInputAction((movement: { position: Cesium.Cartesian2 }) => {
    // 拾取椭球面上的点
    const cartesian = viewerRef.current!.camera.pickEllipsoid(movement.position, viewerRef.current!.scene.globe.ellipsoid)
    if (!cartesian) return

    // 转换为经纬度
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    const lon = Cesium.Math.toDegrees(cartographic.longitude)
    const lat = Cesium.Math.toDegrees(cartographic.latitude)

    // 获取当前相机大致层级
    const zoom = Math.round(Math.log2((2 * Math.PI * 6378137) / viewerRef.current!.camera.getMagnitude()))

    // 经纬度 → XYZ 瓦片坐标
    const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom))
    const y = Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, zoom))

    console.log(`lon=${lon}, lat=${lat}, zoom=${zoom}, x=${x}, y=${y}`)
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

/** @description 文字配置 */
export const labelConfig = {
  fillColor: Cesium.Color.WHITE,
  outlineColor: Cesium.Color.BLACK, // 黑色描边，增加可读性
  outlineWidth: 3,
  pixelOffset: new Cesium.Cartesian2(0, 0),
  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
  scale: 1.0,
  horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
  verticalOrigin: Cesium.VerticalOrigin.CENTER,
  showBackground: true,
  backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
  backgroundPadding: new Cesium.Cartesian2(6, 4),
  disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
}

/** @description 绘制国界 */
export const drawChinaBoundary = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>) => {

  if (checked) {
    fetch(window.$$prefix + '/data/china/china-boundary.geojson')
      .then(res => res.json())
      .then(data => {
        Cesium.GeoJsonDataSource.load(data, {
          stroke: Cesium.Color.BROWN,
          fill: Cesium.Color.BROWN.withAlpha(0.2),
          strokeWidth: 2,
          markerSymbol: 'circle',
        }).then(function (dataSource) {
          viewerRef.current!.dataSources.add(dataSource)
        })
      })
  }


}

/** @description 横断山区 */
export const drawHengduanMountainsDiagram = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, HengduanMountainsDiagramRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {
    if (HengduanMountainsDiagramRef.current?.length) {
      HengduanMountainsDiagramRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/hengduan-mountains-area.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.ORANGE,
            fill: Cesium.Color.ORANGE.withAlpha(0.5),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            HengduanMountainsDiagramRef.current = dataSource.entities.values

            HengduanMountainsDiagramRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(99.9156783576662, 28.506240020807176),
                label: {
                  text: '横断山区',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.ORANGE,
                },
              })
            )
          })
        })
    }
  } else {
    HengduanMountainsDiagramRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 长江 */
export const drawChangjiangRiver = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, changjiangRiverRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(107.7708852, 31.14346632, 3527892.68),
      orientation: {
        heading: 6.283185307179581,
        pitch: -1.5705328303764619,
        roll: 0,
      },
    })

    if (changjiangRiverRef.current?.length) {
      changjiangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/changjiang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            changjiangRiverRef.current = dataSource.entities.values

            changjiangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(109.84480653636214, 31.676271014964506),
                label: {
                  text: '长江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    changjiangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 澜沧江 */
export const drawLancangRiver = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, lancangRiverRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(102.90680454, 30.20169249, 3527892.68),
      orientation: {
        heading: 6.2831853071795845,
        pitch: -1.5702702380948708,
        roll: 0
      }
    })

    if (lancangRiverRef.current?.length) {
      lancangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/lancang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            lancangRiverRef.current = dataSource.entities.values

            lancangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(95.60080485634482, 33.66363160959343),
                label: {
                  text: '澜沧江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    lancangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 怒江 */
export const drawNujiangRiver = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, nujiangRiverRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(96.03191605, 28.98714853, 3527892.68),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5705376995527884,
        roll: 0,
      },
    })

    if (nujiangRiverRef.current?.length) {
      nujiangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/nujiang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            nujiangRiverRef.current = dataSource.entities.values

            nujiangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(92.03880869555387, 32.2995521335205),
                label: {
                  text: '怒江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    nujiangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 独龙江 */
export const drawDulongjiangRiver = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, dulongjiangRiverRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(98.59137891, 28.33325205, 715131.0),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5703325312386975,
        roll: 0,
      },
    })

    if (dulongjiangRiverRef.current?.length) {
      dulongjiangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/dulongjiang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            dulongjiangRiverRef.current = dataSource.entities.values
            dulongjiangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(97.84652837218303, 28.107092478607957),
                label: {
                  text: '独龙江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    dulongjiangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 金沙江 */
export const drawJinshajiangRiver = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, jinshajiangRiverRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(102.90680454, 30.20169249, 3527892.68),
      orientation: {
        heading: 6.2831853071795845,
        pitch: -1.5702702380948708,
        roll: 0
      }
    })

    if (jinshajiangRiverRef.current?.length) {
      jinshajiangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/jinshajiang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            jinshajiangRiverRef.current = dataSource.entities.values

            jinshajiangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(97.6058095014923, 33.02908771838989),
                label: {
                  text: '金沙江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    jinshajiangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 岷江 */
export const drawMinjiangRiver = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, minjiangRiverRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(102.59084722, 29.99187433, 3527892.68),
      orientation: {
        heading: 8.881784197001252e-16,
        pitch: -1.5705984938492015,
        roll: 0,
      },
    })

    if (minjiangRiverRef.current?.length) {
      minjiangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/minjiang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            minjiangRiverRef.current = dataSource.entities.values

            minjiangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(104.03353796391211, 31.029147766652784),
                label: {
                  text: '岷江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    minjiangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 雅砻江 */
export const drawYalongjiangRiver = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, yalongjiangRiverRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(98.49758224, 31.11454042, 3527892.68),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5707504947616706,
        roll: 0,
      },
    })

    if (yalongjiangRiverRef.current?.length) {
      yalongjiangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/yalongjiang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            yalongjiangRiverRef.current = dataSource.entities.values
            yalongjiangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(98.2699798471984, 33.62221082027084),
                label: {
                  text: '雅砻江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    yalongjiangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 大渡河 */
export const drawDaduheRiver = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, daduheRiverRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(101.60958657, 31.47050878, 3527892.68),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.570685025933066,
        roll: 0,
      },
    })

    if (daduheRiverRef.current?.length) {
      daduheRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/daduhe-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            daduheRiverRef.current = dataSource.entities.values

            daduheRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(101.18501373694866, 33.02592772285958),
                label: {
                  text: '大渡河',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    daduheRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 杉树 */
export const drawShanshu = async (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, shanshuRef: React.RefObject<Cesium.Model[]>) => {
  if (!viewerRef.current) return

  if (!checked) {
    // 隐藏已有熊猫
    shanshuRef.current?.forEach(model => {
      model.show = false
    })
    return
  }

  viewerRef.current!.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(103.38251056, 32.59808678, 3105.23),
    orientation: {
      heading: 1.0299469580859508,
      pitch: 0.08986601208615386,
      roll: 0.0000027846895083172285,
    },
  })

  if (shanshuRef.current?.length) {
    // 已存在模型，显示即可
    shanshuRef.current.forEach(model => {
      model.show = true
    })
    return
  }

  // 熊猫列表
  const pandaList = [
    {
      lon: 103.47117565227755,
      lat: 32.63255030483799,
      name: 'shanshu-01',
      uri: window.$$prefix + '/models/tree/scene.gltf',
      scale: 8,
      rotation: { z: 0 },
    },
    {
      lon: 103.48117565227755,
      lat: 32.63255030483799,
      name: 'shanshu-01',
      uri: window.$$prefix + '/models/tree/scene.gltf',
      scale: 8,
      rotation: { z: 0 },
    },
  ]

  // 转 Cartographic
  const cartos = pandaList.map(item => Cesium.Cartographic.fromDegrees(item.lon, item.lat))

  // 获取最精细地形高度
  const updatedCartos = await Cesium.sampleTerrainMostDetailed(viewerRef.current.terrainProvider, cartos)

  // 加载模型到 primitives
  shanshuRef.current = []

  for (let i = 0; i < pandaList.length; i++) {
    const item = pandaList[i]
    const carto = updatedCartos[i]

    // 最终高度 = 地形高度 + 5 米偏移
    const finalHeight = (carto.height || 0) + 1

    const position = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, finalHeight)

    // 朝向
    const hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(item.rotation.z), 0, 0)

    // 固定矩阵
    const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr)

    // 加载模型
    const model = await Cesium.Model.fromGltfAsync({
      url: item.uri,
      modelMatrix,
      scale: item.scale,
    })

    viewerRef.current.scene.primitives.add(model)
    shanshuRef.current.push(model)
  }
}

/** @description 大熊猫 */
export const drawPanda = async (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, pandaRef: React.RefObject<Cesium.Model[]>) => {
  if (!viewerRef.current) return

  if (!checked) {
    // 隐藏已有熊猫
    pandaRef.current?.forEach(model => {
      model.show = false
    })
    return
  }

  viewerRef.current!.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(103.37087154, 32.606162, 3017.33),
    orientation: {
      heading: 5.971222987539061,
      pitch: 0.2683846352166457,
      roll: 0.000003128307367816774,
    },
  })

  if (pandaRef.current?.length) {
    // 已存在模型，显示即可
    pandaRef.current.forEach(model => {
      model.show = true
    })
    return
  }

  // 熊猫列表
  const pandaList = [
    {
      lon: 103.32256515068411,
      lat: 32.704699998237025,
      name: 'panda-01',
      uri: window.$$prefix + '/models/panda/scene.gltf',
      scale: 120,
      rotation: { z: 90 },
    },
    {
      lon: 103.32959582119511,
      lat: 32.704699998237025,
      name: 'panda-02',
      uri: window.$$prefix + '/models/panda/scene.gltf',
      scale: 120,
      rotation: { z: 0 },
    },
    {
      lon: 103.3388788815005,
      lat: 32.704699998237025,
      name: 'panda-03',
      uri: window.$$prefix + '/models/panda/scene.gltf',
      scale: 120,
      rotation: { z: 180 },
    },
    {
      lon: 103.34799934747307,
      lat: 32.704699998237025,
      name: 'panda-04',
      uri: window.$$prefix + '/models/panda/scene.gltf',
      scale: 120,
      rotation: { z: 0 },
    },
  ]

  // 转 Cartographic
  const cartos = pandaList.map(item => Cesium.Cartographic.fromDegrees(item.lon, item.lat))

  // 获取最精细地形高度
  const updatedCartos = await Cesium.sampleTerrainMostDetailed(viewerRef.current.terrainProvider, cartos)

  // 加载模型到 primitives
  pandaRef.current = []

  for (let i = 0; i < pandaList.length; i++) {
    const item = pandaList[i]
    const carto = updatedCartos[i]

    // 最终高度 = 地形高度 + 5 米偏移
    const finalHeight = (carto.height || 0) + 1
    const position = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, finalHeight)

    // 朝向
    const hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(item.rotation.z), 0, 0)

    // 固定矩阵
    const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr)

    // 加载模型
    const model = await Cesium.Model.fromGltfAsync({
      url: item.uri,
      modelMatrix,
      scale: item.scale,
    })

    viewerRef.current.scene.primitives.add(model)
    pandaRef.current.push(model)
  }

}

/** @description 相关省域 */
export const drawProvince = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, provinceRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(98.81428905, 30.26172082, 3156200.7),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5703325312410912,
        roll: 0,
      },
    })

    if (provinceRef.current?.length) {
      provinceRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/province.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.PINK,
            fill: Cesium.Color.PINK.withAlpha(0.5),
            strokeWidth: 0.5,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            provinceRef.current = dataSource.entities.values

            const provinceNames = [
              {
                text: '西藏',
                position: Cesium.Cartesian3.fromDegrees(87.80433606069074, 31.28797794125832),
              },
              {
                text: '四川',
                position: Cesium.Cartesian3.fromDegrees(105.64506790860854, 31.491911447835545),
              },
              {
                text: '云南',
                position: Cesium.Cartesian3.fromDegrees(101.76608100350815, 24.12377274429042),
              },
            ]

            const provinceNamesInstance = provinceNames.map(item => {
              // 绘制文字
              return viewerRef.current!.entities.add({
                position: item.position,
                label: {
                  text: item.text,
                  font: '20px sans-serif',
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  outlineWidth: 2,
                  outlineColor: Cesium.Color.BLACK,
                  fillColor: Cesium.Color.WHITE,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
                },
              })
            })

            provinceRef.current.push(...provinceNamesInstance)
          })
        })
    }
  } else {
    provinceRef.current!.forEach(item => {
      item.show = false
    })
  }
}


/** @description 气候分布 */
export const drawChinaClimateDistribution = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, chinaClimateDistributionRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(105.90676345, 35.09453359, 5884376.89),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5707398108470874,
        roll: 0
      }
    })

    if (chinaClimateDistributionRef.current?.length) {
      chinaClimateDistributionRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/china/china-climate-distribution.geojson')
        .then(res => res.json())
        .then(data => {
          // 为5种气候类型定义颜色方案
          const climateColors: any = {
            高原山地气候: {
              fill: Cesium.Color.fromCssColorString('#4A90E2').withAlpha(0.6), // 冷蓝色
              stroke: Cesium.Color.fromCssColorString('#2C5AA0'),
              textPosition: [92.09404483908936, 34.53784283747934],
            },
            热带季风气候: {
              fill: Cesium.Color.fromCssColorString('#FF6B6B').withAlpha(0.6), // 暖红色
              stroke: Cesium.Color.fromCssColorString('#D64545'),
              textPosition: [100.81780521173025, 22.46855638524489],
            },
            温带大陆性气候: {
              fill: Cesium.Color.fromCssColorString('#FFA726').withAlpha(0.6), // 橙色
              stroke: Cesium.Color.fromCssColorString('#F57C00'),
              textPosition: [107.72144131427258, 40.440585432301184],
            },
            亚热带季风气候: {
              fill: Cesium.Color.fromCssColorString('#66BB6A').withAlpha(0.6), // 绿色
              stroke: Cesium.Color.fromCssColorString('#388E3C'),
              textPosition: [109.47667037219985, 29.4584931073585],
            },
            温带季风气候: {
              fill: Cesium.Color.fromCssColorString('#AB47BC').withAlpha(0.6), // 紫色
              stroke: Cesium.Color.fromCssColorString('#8E24AA'),
              textPosition: [112.99830415726292, 36.593583520746385],
            },
          }

          // 获取所有唯一的名称
          const uniqueNames = [...new Set(data.features.map((feature: any) => feature.properties.name))]

          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.BLACK.withAlpha(0),
            strokeWidth: 0,
            fill: Cesium.Color.WHITE.withAlpha(0),
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            const entities = dataSource.entities.values
            chinaClimateDistributionRef.current = entities

            // 根据气候类型设置颜色
            entities.forEach(entity => {
              const climateType = entity.name
              if (climateType && climateColors[climateType]) {
                const colorScheme = climateColors[climateType]
                if (entity.polygon) {
                  entity.polygon.material = colorScheme.fill
                  // @ts-ignore
                  entity.polygon.outline = false
                  entity.polygon.outlineColor = colorScheme.stroke
                  // @ts-ignore
                  entity.polygon.outlineWidth = 0
                }
              }
            })

            // 添加文字标签
            Object.keys(climateColors).forEach(climateType => {
              const colorScheme = climateColors[climateType]
              if (colorScheme.textPosition) {
                const [longitude, latitude] = colorScheme.textPosition

                // 创建文字标签
                const text = viewerRef.current!.entities.add({
                  position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                  label: {
                    text: climateType,
                    font: '16pt Microsoft YaHei', // 使用微软雅黑字体，更清晰
                    ...labelConfig,
                  },
                })

                chinaClimateDistributionRef.current.push(text)
              }
            })

            console.log('气候分布分类:', uniqueNames)
          })
        })
    }
  } else {
    chinaClimateDistributionRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/* 土壤分布 */
export const drawChinaSoilDistribution = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, chinaSoilDistributionRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(105.90676345, 35.09453359, 5884376.89),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5707398108470874,
        roll: 0
      }
    })

    if (chinaSoilDistributionRef.current?.length) {
      chinaSoilDistributionRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/china/china-soil-distribution.geojson')
        .then(res => res.json())
        .then(data => {
          // 为土壤类型定义颜色方案
          const soilColors: any = {
            砖红壤: {
              fill: Cesium.Color.fromCssColorString('#8B4513').withAlpha(0.6), // 红棕色
              stroke: Cesium.Color.fromCssColorString('#654321'),
              textPosition: [109.60266864561984, 18.925205005894433], // 海南附近
            },
            灰漠土: {
              fill: Cesium.Color.fromCssColorString('#A9A9A9').withAlpha(0.6), // 灰色
              stroke: Cesium.Color.fromCssColorString('#696969'),
              textPosition: [85.0, 45.0], // 新疆北部
            },
            棕漠土: {
              fill: Cesium.Color.fromCssColorString('#D2691E').withAlpha(0.6), // 棕色
              stroke: Cesium.Color.fromCssColorString('#8B4513'),
              textPosition: [90.0, 40.0], // 新疆南部
            },
            黑钙土: {
              fill: Cesium.Color.fromCssColorString('#2F4F4F').withAlpha(0.6), // 深灰色
              stroke: Cesium.Color.fromCssColorString('#000000'),
              textPosition: [111.19799358960789, 40.26795863764495], // 内蒙古东部
            },
            亚高山草原土带: {
              fill: Cesium.Color.fromCssColorString('#61fd61ff').withAlpha(0.6), // 淡绿色
              stroke: Cesium.Color.fromCssColorString('#556B2F'),
              textPosition: [88.9329247937849, 28.597591991570404], // 青藏高原
            },
            灰钙土: {
              fill: Cesium.Color.fromCssColorString('#D3D3D3').withAlpha(0.6), // 浅灰色
              stroke: Cesium.Color.fromCssColorString('#A9A9A9'),
              textPosition: [102.59440658804448, 36.02267693298963], // 甘肃、宁夏
            },
            黑土: {
              fill: Cesium.Color.fromCssColorString('#2F2F2F').withAlpha(0.6), // 近黑色
              stroke: Cesium.Color.fromCssColorString('#000000'),
              textPosition: [128.99970312431063, 45.634047159130965], // 东北地区
            },
            寒棕土: {
              fill: Cesium.Color.fromCssColorString('#8B7355').withAlpha(0.6), // 冷棕色
              stroke: Cesium.Color.fromCssColorString('#696969'),
              textPosition: [122.94437565648104, 52.214359020658], // 黑龙江北部
            },
            棕壤: {
              fill: Cesium.Color.fromCssColorString('#A0522D').withAlpha(0.6), // 标准棕色
              stroke: Cesium.Color.fromCssColorString('#8B4513'),
              textPosition: [115.0, 35.0], // 华北地区
            },
            黄棕壤: {
              fill: Cesium.Color.fromCssColorString('#DAA520').withAlpha(0.6), // 黄棕色
              stroke: Cesium.Color.fromCssColorString('#B8860B'),
              textPosition: [113.66903286043595, 31.508797605755067], // 长江中下游
            },
            赤红壤: {
              fill: Cesium.Color.fromCssColorString('#DC143C').withAlpha(0.6), // 赤红色
              stroke: Cesium.Color.fromCssColorString('#B22222'),
              textPosition: [100.68825517044883, 23.042228682822703], // 广东、广西
            },
            红壤: {
              fill: Cesium.Color.fromCssColorString('#CD5C5C').withAlpha(0.6), // 红色
              stroke: Cesium.Color.fromCssColorString('#B22222'),
              textPosition: [115.0, 26.0], // 福建、江西
            },
            高山漠土带: {
              fill: Cesium.Color.fromCssColorString('#708090').withAlpha(0.6), // 石板灰色
              stroke: Cesium.Color.fromCssColorString('#2F4F4F'),
              textPosition: [78.44630649651444, 36.17994722511998], // 青藏高原西部
            },
            亚高山漠土带: {
              fill: Cesium.Color.fromCssColorString('#46525eff').withAlpha(0.6), // 浅石板灰色
              stroke: Cesium.Color.fromCssColorString('#696969'),
              textPosition: [79.97242147078896, 33.4684656396256], // 青藏高原中部
            },
            高山草原土带: {
              fill: Cesium.Color.fromCssColorString('#4d4545ff').withAlpha(0.6), // 淡绿色
              stroke: Cesium.Color.fromCssColorString('#32CD32'),
              textPosition: [85.91594544886775, 32.84534541395958], // 青藏高原东部
            },
            高山草甸土带: {
              fill: Cesium.Color.fromCssColorString('#115311ff').withAlpha(0.6), // 草绿色
              stroke: Cesium.Color.fromCssColorString('#3CB371'),
              textPosition: [97.3786945658124, 34.218864101076356], // 青藏高原东南部
            },
          }

          // 获取所有唯一的名称
          const uniqueNames = [...new Set(data.features.map((feature: any) => feature.properties.name))]

          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.BLACK.withAlpha(0),
            strokeWidth: 0,
            fill: Cesium.Color.WHITE.withAlpha(0),
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            const entities = dataSource.entities.values
            chinaSoilDistributionRef.current = entities // 假设您有这个引用

            // 根据土壤类型设置颜色
            entities.forEach(entity => {
              const soilType = entity.name
              if (soilType && soilColors[soilType]) {
                const colorScheme = soilColors[soilType]
                if (entity.polygon) {
                  entity.polygon.material = colorScheme.fill
                  // @ts-ignore
                  entity.polygon.outline = false
                  entity.polygon.outlineColor = colorScheme.stroke
                  // @ts-ignore
                  entity.polygon.outlineWidth = 0
                }
              }
            })

            // 添加土壤类型文字标签
            Object.keys(soilColors).forEach(soilType => {
              const colorScheme = soilColors[soilType]
              if (colorScheme.textPosition) {
                const [longitude, latitude] = colorScheme.textPosition

                // 创建文字标签
                const text = viewerRef.current!.entities.add({
                  position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                  label: {
                    text: soilType,
                    font: '14pt Microsoft YaHei', // 稍小一点的字体，因为名称较长
                    ...labelConfig,
                  },
                })

                chinaSoilDistributionRef.current.push(text)
              }
            })

            console.log('土壤分布分类:', uniqueNames)
          })
        })
    }
  } else {
    chinaSoilDistributionRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 植被分布 */
export const drawChinaPlantDistribution = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, chinaPlantDistributionRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(105.90676345, 35.09453359, 5884376.89),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5707398108470874,
        roll: 0
      }
    })

    if (chinaPlantDistributionRef.current?.length) {
      chinaPlantDistributionRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/china/china-plant-distribution.geojson')
        .then(res => res.json())
        .then(data => {
          // 为植被带类型定义颜色方案
          const plantColors: any = {
            温带荒漠带: {
              fill: Cesium.Color.fromCssColorString('#F0E68C').withAlpha(0.6), // 沙黄色
              stroke: Cesium.Color.fromCssColorString('#DAA520'),
              textPosition: [85.0, 42.0], // 新疆荒漠地区
            },
            热带雨林带: {
              fill: Cesium.Color.fromCssColorString('#005900').withAlpha(0.6), // 深绿色
              stroke: Cesium.Color.fromCssColorString('#006400'),
              textPosition: [110.0, 18.0], // 海南、西双版纳
            },
            寒温带针叶林: {
              fill: Cesium.Color.fromCssColorString('#91a098ff').withAlpha(0.6), // 海绿色
              stroke: Cesium.Color.fromCssColorString('#1E5B3A'),
              textPosition: [122.0, 52.0], // 大兴安岭北部
            },
            温带针叶阔叶林: {
              fill: Cesium.Color.fromCssColorString('#3CB371').withAlpha(0.6), // 中绿色
              stroke: Cesium.Color.fromCssColorString('#2E8B57'),
              textPosition: [129.9085890708368, 45.408358156786555], // 小兴安岭、长白山
            },
            温带草原带: {
              fill: Cesium.Color.fromCssColorString('#486d48ff').withAlpha(0.6), // 浅绿色
              stroke: Cesium.Color.fromCssColorString('#6B8E23'),
              textPosition: [112.0, 44.0], // 内蒙古草原
            },
            暖温带落叶阔叶林: {
              fill: Cesium.Color.fromCssColorString('#32CD32').withAlpha(0.6), // 黄绿色
              stroke: Cesium.Color.fromCssColorString('#228B22'),
              textPosition: [115.0, 36.0], // 华北地区
            },
            亚热带常绿阔叶林: {
              fill: Cesium.Color.fromCssColorString('#008000').withAlpha(0.6), // 纯绿色
              stroke: Cesium.Color.fromCssColorString('#006400'),
              textPosition: [115.0, 28.0], // 长江以南地区
            },
            高原植被: {
              fill: Cesium.Color.fromCssColorString('#969696ff').withAlpha(0.6), // 淡绿色
              stroke: Cesium.Color.fromCssColorString('#7CFC00'),
              textPosition: [92.0, 32.0], // 青藏高原
            },
          }

          // 获取所有唯一的名称
          const uniqueNames = [...new Set(data.features.map((feature: any) => feature.properties.name))]

          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.BLACK.withAlpha(0),
            strokeWidth: 0,
            fill: Cesium.Color.WHITE.withAlpha(0),
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            const entities = dataSource.entities.values
            chinaPlantDistributionRef.current = entities // 假设您有这个引用

            // 根据植被带类型设置颜色
            entities.forEach(entity => {
              const vegetationType = entity.name
              if (vegetationType && plantColors[vegetationType]) {
                const colorScheme = plantColors[vegetationType]
                if (entity.polygon) {
                  entity.polygon.material = colorScheme.fill
                  // @ts-ignore
                  entity.polygon.outline = false
                  entity.polygon.outlineColor = colorScheme.stroke
                  // @ts-ignore
                  entity.polygon.outlineWidth = 0
                }
              }
            })

            // 添加植被带类型文字标签
            Object.keys(plantColors).forEach(vegetationType => {
              const colorScheme = plantColors[vegetationType]
              if (colorScheme.textPosition) {
                const [longitude, latitude] = colorScheme.textPosition

                // 创建文字标签
                const text = viewerRef.current!.entities.add({
                  position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                  label: {
                    text: vegetationType,
                    font: '14pt Microsoft YaHei',
                    ...labelConfig,
                  },
                })

                chinaPlantDistributionRef.current.push(text)
              }
            })

            console.log('植被带分布分类:', uniqueNames)
          })
        })
    }
  } else {
    chinaPlantDistributionRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description  滇冷杉介绍*/
export const showShanshuDetails = (value: boolean, notificationApi: NotificationInstance) => {
  notificationApi.destroy()
  if (value) {
    notificationApi.info({
      message: `滇冷杉`,
      description: (
        <div style={{ textIndent: '2em' }}>
          <p>滇冷杉是分布于中国西南横断山脉及青藏高原东南缘的特有树种，多生长于海拔2500-4000米的高山针叶林带。 </p>
          <p>其树冠呈尖塔形，叶片条形具芳香气味，球果成熟时呈黑褐色。</p>
          <p>作为水源涵养林的主要组成树种，该物种在维持区域生态平衡中发挥重要作用。</p>
          <p> 研究表明，第四纪冰期时滇冷杉曾以云南鹤庆盆地为避难所，现代分布区的稳定性与温度季节性和降雨季节性变化密切相关。</p>
        </div>
      ),
      placement: 'bottomLeft',
      duration: null,
    })
  } else {
    notificationApi.destroy()
  }
}

/** @description 大熊猫介绍 */
export const showPandaDetails = (value: boolean, notificationApi: NotificationInstance) => {
  notificationApi.destroy()
  if (value) {
    notificationApi.info({
      message: `大熊猫`,
      description: (
        <div style={{ textIndent: '2em' }}>
          <p>大熊猫是中国特有的哺乳动物，属于熊科、大熊猫属，被誉为“活化石”和“中国国宝”。</p>
          <p>它们栖息在海拔2600-3500米的茂密竹林中，以竹子为主要食物。</p>
          <p>外表肥硕、黑白相间，善于爬树。野外寿命约18-20岁，数量有所增长，截至2021年1月，中国大熊猫野生种群达1864只。</p>
        </div>
      ),
      placement: 'bottomLeft',
      duration: null,
    })
  } else {
    notificationApi.destroy()
  }
}

/** @description 贡嘎山介绍 */
export const showGonggashanDetails = (value: boolean, notificationApi: NotificationInstance, viewerRef: React.RefObject<Cesium.Viewer | null>, higherMountainPonitInstanceList: React.RefObject<sampleLabelType[]>) => {
  higherMountainPonitInstanceList.current.forEach(item => {
    item.instance.toggleVisible(value)
  })

  notificationApi.destroy()

  if (value) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(101.81087885, 29.52080401, 7599.75),
      orientation: {
        heading: 0.6762693278851586,
        pitch: -0.042912143092978194,
        roll: 0.0001878768739276282,
      },
    })

    notificationApi.info({
      message: `贡嘎山`,
      description: (
        <div style={{ textIndent: '2em' }}>
          <p>贡嘎山（岷雅贡嘎，英语：Minya Konka），为横断山系大雪山主峰，被当地人称为木雅贡嘎。</p>
          <p>位于四川省甘孜藏族自治州康定市、泸定县、九龙县和雅安市石棉县之间。藏语的“贡”是冰雪之意，“嘎”为白色，意为白色冰山。</p>
          <p>
            贡嘎山主峰海拔7508.9米（2023年公布
            [18]），是四川省最高的山峰，被称为“蜀山之王”，为世界上高差最大的山之一，周围有海拔6000米上的高峰45座。
          </p>
          <p>
            贡嘎山北起康定折多山口，南抵泸定田湾河东到大渡河西至雅砻江。以贡嘎雪山为中心的贡嘎山风景名胜区是中国面积最大、环境容量最大的风景区。
          </p>
          <p>在长期冰川作用下，山峰发育为锥状大角峰，周围绕着60°～70°的峭壁，攀登困难。</p>
          <p>
            贡嘎山有海螺沟、巴旺、燕子沟、磨子沟等冰川和木格措、五须海、巴旺海等高原湖泊以及康定二道桥等温泉，也是全球25个生物多样性热点地区之一。
          </p>
          <p>周围有小贡嘎山、嘉子峰、日乌且峰、勒多曼因峰等雪山环绕。以日照金山奇观出名。 </p>
        </div>
      ),
      placement: 'bottomLeft',
      duration: null,
    })
  } else {
    notificationApi.destroy()
  }
}

/** @description  三江并流 */
export const showSanjiangbingliuDetails = (value: boolean, notificationApi: NotificationInstance, viewerRef: React.RefObject<Cesium.Viewer | null>) => {
  viewerRef.current!.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(98.45607352, 28.12476188, 3527892.68),
    orientation: {
      heading: 1.7763568394002505e-15,
      pitch: -1.5707142551692401,
      roll: 0,
    },
  })

  notificationApi.destroy()

  if (value) {
    notificationApi.info({
      message: `三江并流`,
      description: (
        <div style={{ textIndent: '2em' }}>
          <p>
            三江并流，是指金沙江、澜沧江和怒江这三条发源于青藏高原的大江在云南省境内自北向南并行奔流170多千米的区域，
            位于中国云南省，跨越了云南省丽江市、迪庆藏族自治州、怒江傈僳族自治州的9个自然保护区和10个风景名胜区。
          </p>
          <p>
            地理坐标位于东经98°～100°30′，北纬25°30′～29°之间， 涵盖范围达170万公顷。
            分为15个不同的保护区，已被分为八区域，每个都能提供全方位的横断山脉的生物和地质多样性的具有代表性的样本。
          </p>
          <p>
            三江并流区域有高等植物210余科，1200余属，6000种以上；有44个中国特有属，2700个中国特有种，
            其中有600种为三江并流区域特有种；有国家珍稀濒危保护植物秃杉、桫椤、红豆杉等33种，省级珍稀濒危保护植物37种。
            区域内栖息着的珍稀濒危动物有滇金丝猴、羚羊、雪豹、孟加拉虎、黑颈鹤等等77种国家级保护动物。
          </p>
        </div>
      ),
      placement: 'bottomLeft',
      duration: null,
    })
  }
}

/** @description  最高峰点位*/
export const initHigherMountainPonit = (viewerRef: React.RefObject<Cesium.Viewer | null>, higherMountainPonitInstanceList: React.RefObject<sampleLabelType[]>) => {

  higherMountainPonitInstanceList.current = [
    {
      position: Cesium.Cartesian3.fromDegrees(101.88123898839554, 29.5935768399523, 7100.9),
      text: '贡嘎山',
      instance: null,
      key: 'gonggashan',
    },
  ].map(item => {
    const instance = new SampleLabel(viewerRef.current!, item.position, item.text, {
      containerBackgroundUrlType: 'position',
      defaultVisible: false,
    })

    return {
      ...item,
      instance,
    }
  })
}

/** @description 伯舒拉岭-高黎贡山 */
export const drawBoshulaling = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, boshulalingRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(98.85494471, 27.62975211, 1656506.30),
      orientation: {
        heading: 6.283185307179583,
        pitch: -1.5705000185647013,
        roll: 0
      }
    });

    if (boshulalingRef.current?.length) {
      boshulalingRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/boshulaling-gaoligongshan.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            boshulalingRef.current = dataSource.entities.values

            boshulalingRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(97.34634157900587,
                  29.0430861127563),
                label: {
                  text: '伯舒拉岭',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
            /* viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(98.29562051, 28.14677066, 3036.39),
                orientation: {
                    heading: 6.16180360604343,
                    pitch: -0.5573008123218886,
                    roll: 6.283169868518325
                }
            }); */
            boshulalingRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(98.37378003814831,
                  26.79269786960716),
                label: {
                  text: '高黎贡山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    boshulalingRef.current!.forEach(item => {
      item.show = false
    })
  }
}


/** @description 他念他翁山-怒山 */
export const drawTaniantawengshan = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, taniantawengshanRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(98.85494471, 27.62975211, 1656506.30),
      orientation: {
        heading: 6.283185307179583,
        pitch: -1.5705000185647013,
        roll: 0
      }
    });

    if (taniantawengshanRef.current?.length) {
      taniantawengshanRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/taniantawengshan-nushan.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            taniantawengshanRef.current = dataSource.entities.values

            taniantawengshanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(97.75085382769366,
                  30.033816565649452),
                label: {
                  text: '他念他翁山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )

            taniantawengshanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(99.04154615423067,
                  26.225806715977225),
                label: {
                  text: '怒山',
                  font: '20px sans-serif',

                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    taniantawengshanRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 芒康山-云岭 */
export const drawMangkangshan = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, mangkangshanRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(99.13110646, 29.56595366, 1887923.00),
      orientation: {
        heading: 6.283185307179583,
        pitch: -1.5703899551321632,
        roll: 0
      }
    });

    if (mangkangshanRef.current?.length) {
      mangkangshanRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/mangkangshan-yunling.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            mangkangshanRef.current = dataSource.entities.values

            mangkangshanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(98.40665629320692,
                  30.489661468408304),
                label: {
                  text: '芒康山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )

            mangkangshanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(99.40211213896258,
                  26.80612247599627),
                label: {
                  text: '云岭',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    mangkangshanRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 沙鲁里山 */
export const drawShalulishan = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, shalulishanRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(99.13110646, 29.56595366, 1887923.00),
      orientation: {
        heading: 6.283185307179583,
        pitch: -1.5703899551321632,
        roll: 0
      }
    });

    if (shalulishanRef.current?.length) {
      shalulishanRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/shalulishan.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            shalulishanRef.current = dataSource.entities.values

            shalulishanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(99.50471900227845,
                  31.08962223183079),
                label: {
                  text: '沙鲁里山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    shalulishanRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 大雪山 */
export const drawDaxueshan = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, daxueshanRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(99.13110646, 29.56595366, 1887923.00),
      orientation: {
        heading: 6.283185307179583,
        pitch: -1.5703899551321632,
        roll: 0
      }
    });

    if (daxueshanRef.current?.length) {
      daxueshanRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/daxueshan.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            daxueshanRef.current = dataSource.entities.values

            daxueshanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(101.36515981045625,
                  31.574323857583252),
                label: {
                  text: '大雪山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    daxueshanRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 大雪山 */
export const drawQionglaishan = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, qionglaishan: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(104.47583212, 31.42273029, 1888526.93),
      orientation: {
        heading: 6.283185307179582,
        pitch: -1.5702841970739416,
        roll: 0
      }
    });

    if (qionglaishan.current?.length) {
      qionglaishan.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/qionglaishan.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            qionglaishan.current = dataSource.entities.values

            qionglaishan.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(102.80395867428174,
                  32.28643306644907),
                label: {
                  text: '邛崃山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    qionglaishan.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 大雪山 */
export const drawMinshan = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, minshanRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(107.18146906, 31.31457030, 3528324.44),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5705239714367836,
        roll: 0
      }
    });

    if (minshanRef.current?.length) {
      minshanRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/minshan.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            minshanRef.current = dataSource.entities.values

            minshanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(104.0434617314983,
                  32.7493986221671),
                label: {
                  text: '岷山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    minshanRef.current!.forEach(item => {
      item.show = false
    })
  }
}