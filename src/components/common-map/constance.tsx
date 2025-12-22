import * as Cesium from 'cesium'
export const initClickHandler = (viewer: Cesium.Viewer) => {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

  handler.setInputAction(async (movement: { position: Cesium.Cartesian2 }) => {
    // 拾取椭球面上的点
    const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid)
    if (!cartesian) return

    const terrainCartos = await Cesium.sampleTerrainMostDetailed(viewer!.terrainProvider, [Cesium.Cartographic.fromCartesian(cartesian)])

    const cartographic = terrainCartos[0]

    const lon = Cesium.Math.toDegrees(cartographic.longitude)
    const lat = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height

    // 获取当前相机大致层级
    const zoom = Math.round(Math.log2((2 * Math.PI * 6378137) / viewer.camera.getMagnitude()))

    // 经纬度 → XYZ 瓦片坐标
    const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom))
    const y = Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, zoom))

    console.log(`lon=${lon}, lat=${lat}, height=${height} zoom=${zoom}, x=${x}, y=${y}`)

    getCameraParams(viewer)
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

/** @description 获取当前相机参数 */
export const getCameraParams = (viewer: Cesium.Viewer | null) => {
  const camera = viewer!.camera

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

  return {
    destination: {
      longitude: lon,
      latitude: lat,
      height: height,
    },
    orientation: {
      heading: heading,
      pitch: pitch,
      roll: roll,
    },
  }
}