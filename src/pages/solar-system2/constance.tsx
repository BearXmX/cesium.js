import * as THREE from 'three'

export const sunRadius = 3
// 黄赤交角（核心参数）
export const obliquity = 23.44 // 度
export const obliquityRad = THREE.MathUtils.degToRad(obliquity) // 弧度制黄赤交角
export const earthRadius = 2

export const latitudePositionInit = 40 // 北京纬度
export const longitudePositionInit = 116 // 北京经度

// 节气配置（包含直射纬度）
export const solarTerms = [
  { name: '春分', angle: 0, directLat: 0 }, // 春分：右侧（0°）
  { name: '夏至', angle: -Math.PI / 2, directLat: obliquity }, // 夏至：上方（-90°，即270°）
  { name: '秋分', angle: -Math.PI, directLat: 0 }, // 秋分：左侧（-180°）
  { name: '冬至', angle: (-Math.PI * 3) / 2, directLat: -obliquity }, // 冬至：下方（-270°，即90°）
]

// 纬线
export const latitudes = [
  { lat: 0, color: '#ff1030', width: 0.06 }, // 赤道
  { lat: obliquity, color: '#f5f500', width: 0.03 }, // 北回归线
  { lat: 30, color: '#f5f500', width: 0.03 },
  { lat: 60, color: '#f5f500', width: 0.03 },
  { lat: -obliquity, color: '#f5f500', width: 0.03 }, // 南回归线
  { lat: -30, color: '#f5f500', width: 0.03 },
  { lat: -60, color: '#f5f500', width: 0.03 },
]

// 经线
export const longitudes = [
  { lon: 0, color: '#00b96b' },
  { lon: 30, color: '#fff' },
  { lon: 60, color: '#fff' },
  { lon: 90, color: '#fff' },
  { lon: 120, color: '#fff' },
  { lon: 150, color: '#fff' },
  { lon: 180, color: '#fff' },
  { lon: 210, color: '#fff' },
  { lon: 240, color: '#fff' },
  { lon: 270, color: '#fff' },
  { lon: 300, color: '#fff' },
  { lon: 330, color: '#fff' },
  { lon: 360, color: '#04a9ff' },
]

// 静态配置
export const staticConfig = {
  radius: 20, // 轨道半径
}

/** 根据角度计算地球中心位置 */
export const getEarthCenterPos = (angle: number, radius?: number): [number, number, number] => {
  const useRadis = radius || staticConfig.radius
  return [
    Math.cos(angle) * useRadis,
    0, // 轨道平面为赤道面（Y=0）
    Math.sin(angle) * useRadis,
  ]
}

/** 创建经纬线&极点&回归线标记 */
export const createDebugLatLonSphere = (earthRadius: number, earthGroup: THREE.Group) => {
  const linesGroup = new THREE.Group()
  linesGroup.name = 'linesGroup'

  // 基准参数（与地球保持微小距离，避免重叠）
  const baseSize = earthRadius
  const distanceFromEarth = earthRadius * 0.008
  const actualRadius = baseSize + distanceFromEarth

  // 关键：让经纬线组整体继承地球的倾斜角度（与地球自转轴一致）
  // 这样纬线平面会与地球赤道平面平行，角度正确

  // ---------------------- 纬线修复 ----------------------
  latitudes.forEach(latItem => {
    const latDeg = latItem.lat
    const latRad = THREE.MathUtils.degToRad(latDeg)
    const obliquityRad = THREE.MathUtils.degToRad(obliquity) // 黄赤交角（弧度）

    // 1. 基础尺寸（与地球半径严格绑定）
    const radius = earthRadius
    const gap = radius * 0.002 // 贴近地球表面的间隙
    const ringRadius = radius + gap

    // 2. 核心：三维位置计算（完整补偿旋转后的坐标系偏移）
    // 纬度对应的径向距离（垂直于自转轴的半径）
    const latitudeCircleRadius = ringRadius * Math.cos(latRad)
    // 纬度对应的轴向距离（沿自转轴的距离，北纬为正，南纬为负）
    const axialDistance = ringRadius * Math.sin(latRad)

    // 3. 计算旋转后的实际位置（关键修复）
    // 地球自转轴倾斜后，沿自转轴的点在世界坐标系中会同时有Y和Z分量
    const yPosition = axialDistance * Math.cos(obliquityRad) // Y轴分量
    const zPosition = axialDistance * Math.sin(obliquityRad) // Z轴分量（之前缺失的部分）

    // 4. 创建纬线圈
    const latLine = new THREE.Mesh(
      new THREE.RingGeometry(latitudeCircleRadius, latitudeCircleRadius + latItem.width, 128),
      new THREE.MeshBasicMaterial({
        color: latItem.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      })
    )

    // 5. 位置与旋转（匹配你的正确角度）
    latLine.position.set(0, yPosition, zPosition) // 同时设置Y和Z

    latLine.rotation.x = THREE.MathUtils.degToRad(obliquity - 90) // 保持你确认的正确角度

    // 6. 确保与地球同中心
    latLine.matrixAutoUpdate = true
    latLine.updateMatrix()

    earthGroup.add(latLine)
  })

  // ---------------------- 经线修复 ----------------------
  longitudes.forEach((lonItem, index) => {
    const lonRad = THREE.MathUtils.degToRad(lonItem.lon)

    // 创建经线圈（半圆环，覆盖南北极）
    const meridian = new THREE.Mesh(
      new THREE.RingGeometry(0, actualRadius + earthRadius * 0.0005, 128, 0, Math.PI),
      new THREE.MeshBasicMaterial({
        color: lonItem.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      })
    )

    // 经线旋转：使其从默认平面转为沿经线方向
    meridian.rotation.z = Math.PI / 2
    meridian.rotation.x = Math.PI
    meridian.rotation.y = lonRad // 沿经度旋转
    meridian.position.z = 0.0001 * index // 微小偏移避免重叠
    meridian.name = `longitude-item-${lonItem.lon}`

    linesGroup.add(meridian)
  })

  // 关键：将经纬线组添加到地球的父级（如scene），而非earthGroup
  // 这样经纬线不会跟随earthGroup自转（如果earthGroup有自转逻辑）
  // 示例：scene.add(linesGroup); 而非 earthGroup.add(linesGroup);

  return linesGroup
}

/** 创建星空 */
export const makeStars = () => {
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load(window.$$prefix + '/textures/star.png')
  const count = 1000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * staticConfig.radius * 4
    colors[i] = Math.random() * 10
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.4,
    sizeAttenuation: true,
    color: '#ff88cc',
    transparent: true,
    alphaMap: texture,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })

  const stars = new THREE.Points(geometry, material)

  return stars
}
