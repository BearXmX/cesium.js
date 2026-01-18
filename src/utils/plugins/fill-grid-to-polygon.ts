import * as Cesium from 'cesium'

/**
 * 边界框类型
 */
interface Bounds {
  west: number
  east: number
  north: number
  south: number
}

/**
 * 栅栏填充配置选项
 */
interface FencePatternOptions {
  spacing?: number // 经度间隔
  lineWidth?: number // 线宽
  lineColor?: Cesium.Color // 线颜色
  outlineColor?: Cesium.Color // 轮廓颜色
  outlineWidth?: number // 轮廓宽度
  steps?: number // 纬度细分步数
  clampToGround?: boolean // 是否贴地
  rotateAngle?: number // 旋转角度（弧度）
  lineType?: 'vertical' | 'horizontal' | 'both' // 线条类型
  rotationCenter?: 'first-point' | 'center' | 'custom' // 旋转中心类型
}

/**
 * 坐标点类型
 */
type Coordinate = [number, number] // [经度, 纬度]

/**
 * 创建栅栏填充效果
 * @param viewer - Cesium Viewer实例
 * @param coordinates - 多边形坐标数组 [[lng, lat], ...]
 * @param options - 配置选项
 */
export function createFencePattern(viewer: Cesium.Viewer, coordinates: Coordinate[], options: FencePatternOptions = {}): void {
  const {
    spacing = 0.2,
    lineWidth = 2,
    lineColor = Cesium.Color.BLUE.withAlpha(1),
    outlineColor = Cesium.Color.BLACK,
    outlineWidth = 2,
    steps = 50,
    clampToGround = true,
    rotateAngle = 0, // 默认不旋转
    lineType = 'vertical', // 默认垂直线
    rotationCenter = 'first-point', // 默认以第一个点为旋转中心
  } = options

  // 1. 创建多边形轮廓
  viewer.entities.add({
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(coordinates.flat())),
      material: Cesium.Color.TRANSPARENT,
      outline: true,
      outlineColor,
      outlineWidth,
    },
  })

  // 2. 计算边界
  const bounds: Bounds = getBounds(coordinates)

  // 3. 创建多边形的笛卡尔坐标版本
  const polygonCartesian: Cesium.Cartesian3[] = coordinates.map(coord => Cesium.Cartesian3.fromDegrees(coord[0], coord[1]))

  // 4. 创建栅栏线
  if (lineType === 'vertical' || lineType === 'both') {
    createVerticalLines(viewer, bounds, polygonCartesian, spacing, steps, lineWidth, lineColor, clampToGround, rotateAngle, rotationCenter)
  }

  if (lineType === 'horizontal' || lineType === 'both') {
    createHorizontalLines(viewer, bounds, polygonCartesian, spacing, steps, lineWidth, lineColor, clampToGround, rotateAngle, rotationCenter)
  }
}

/**
 * 创建垂直线
 */
function createVerticalLines(
  viewer: Cesium.Viewer,
  bounds: Bounds,
  polygonCartesian: Cesium.Cartesian3[],
  spacing: number,
  steps: number,
  lineWidth: number,
  lineColor: Cesium.Color,
  clampToGround: boolean,
  rotateAngle: number,
  rotationCenter: string
): void {
  for (let lon = bounds.west; lon <= bounds.east; lon += spacing) {
    createVerticalLineSegment(viewer, lon, bounds, polygonCartesian, steps, lineWidth, lineColor, clampToGround, rotateAngle, rotationCenter)
  }
}

/**
 * 创建水平线
 */
function createHorizontalLines(
  viewer: Cesium.Viewer,
  bounds: Bounds,
  polygonCartesian: Cesium.Cartesian3[],
  spacing: number,
  steps: number,
  lineWidth: number,
  lineColor: Cesium.Color,
  clampToGround: boolean,
  rotateAngle: number,
  rotationCenter: string
): void {
  for (let lat = bounds.south; lat <= bounds.north; lat += spacing) {
    createHorizontalLineSegment(viewer, lat, bounds, polygonCartesian, steps, lineWidth, lineColor, clampToGround, rotateAngle, rotationCenter)
  }
}

/**
 * 创建单条垂直线段
 */
function createVerticalLineSegment(
  viewer: Cesium.Viewer,
  lon: number,
  bounds: Bounds,
  polygonCartesian: Cesium.Cartesian3[],
  steps: number,
  lineWidth: number,
  lineColor: Cesium.Color,
  clampToGround: boolean,
  rotateAngle: number,
  rotationCenter: string
): void {
  const linePoints: number[] = []
  const latStep = (bounds.north - bounds.south) / steps

  for (let lat = bounds.south; lat <= bounds.north; lat += latStep) {
    const point = Cesium.Cartesian3.fromDegrees(lon, lat)

    if (isPointInPolygon(point, polygonCartesian)) {
      linePoints.push(lon, lat)
    } else if (linePoints.length >= 4) {
      // 遇到多边形外点且已有线段，创建线段
      createRotatedSegment(viewer, linePoints, lineWidth, lineColor, clampToGround, rotateAngle, rotationCenter)
      linePoints.length = 0 // 清空数组
    }
  }

  // 处理最后一段线段
  if (linePoints.length >= 4) {
    createRotatedSegment(viewer, linePoints, lineWidth, lineColor, clampToGround, rotateAngle, rotationCenter)
  }
}

/**
 * 创建单条水平线段
 */
function createHorizontalLineSegment(
  viewer: Cesium.Viewer,
  lat: number,
  bounds: Bounds,
  polygonCartesian: Cesium.Cartesian3[],
  steps: number,
  lineWidth: number,
  lineColor: Cesium.Color,
  clampToGround: boolean,
  rotateAngle: number,
  rotationCenter: string
): void {
  const linePoints: number[] = []
  const lonStep = (bounds.east - bounds.west) / steps

  for (let lon = bounds.west; lon <= bounds.east; lon += lonStep) {
    const point = Cesium.Cartesian3.fromDegrees(lon, lat)

    if (isPointInPolygon(point, polygonCartesian)) {
      linePoints.push(lon, lat)
    } else if (linePoints.length >= 4) {
      // 遇到多边形外点且已有线段，创建线段
      createRotatedSegment(viewer, linePoints, lineWidth, lineColor, clampToGround, rotateAngle, rotationCenter)
      linePoints.length = 0 // 清空数组
    }
  }

  // 处理最后一段线段
  if (linePoints.length >= 4) {
    createRotatedSegment(viewer, linePoints, lineWidth, lineColor, clampToGround, rotateAngle, rotationCenter)
  }
}

/**
 * 创建旋转后的线段
 */
function createRotatedSegment(
  viewer: Cesium.Viewer,
  originalPoints: number[],
  lineWidth: number,
  lineColor: Cesium.Color,
  clampToGround: boolean,
  rotateAngle: number,
  rotationCenter: string
): void {
  // 如果没有旋转角度，直接创建原始线段
  if (Math.abs(rotateAngle) < 0.001) {
    viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(originalPoints),
        width: lineWidth,
        material: lineColor,
        clampToGround,
      },
    })
    return
  }

  // 确定旋转中心
  const rotationPoint = determineRotationCenter(originalPoints, rotationCenter)

  // 应用旋转
  const rotatedPoints = applyRotation(originalPoints, rotateAngle, rotationPoint)

  // 创建旋转后的线段
  viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(rotatedPoints),
      width: lineWidth,
      material: lineColor,
      clampToGround,
    },
  })
}

/**
 * 确定旋转中心
 */
function determineRotationCenter(points: number[], rotationCenterType: string): [number, number] {
  if (rotationCenterType === 'first-point') {
    // 使用第一个点作为旋转中心
    return [points[0], points[1]]
  } else if (rotationCenterType === 'center') {
    // 计算线段中心点作为旋转中心
    const centerLon = (points[0] + points[points.length - 2]) / 2
    const centerLat = (points[1] + points[points.length - 1]) / 2
    return [centerLon, centerLat]
  } else {
    // 自定义旋转中心（这里使用第一个点）
    return [points[0], points[1]]
  }
}

/**
 * 应用旋转到点集
 */
function applyRotation(points: number[], angle: number, rotationPoint: [number, number]): number[] {
  const [centerLon, centerLat] = rotationPoint
  const rotatedPoints: number[] = []

  for (let i = 0; i < points.length; i += 2) {
    const lon = points[i]
    const lat = points[i + 1]

    // 计算相对于旋转中心的偏移
    const dx = lon - centerLon
    const dy = lat - centerLat

    // 应用2D旋转公式
    const cosAngle = Math.cos(angle)
    const sinAngle = Math.sin(angle)

    const rotatedLon = centerLon + dx * cosAngle - dy * sinAngle
    const rotatedLat = centerLat + dx * sinAngle + dy * cosAngle

    rotatedPoints.push(rotatedLon, rotatedLat)
  }

  return rotatedPoints
}

/**
 * 计算多边形边界
 */
function getBounds(coordinates: Coordinate[]): Bounds {
  let west = 180
  let east = -180
  let south = 90
  let north = -90

  coordinates.forEach(coord => {
    const [lon, lat] = coord
    west = Math.min(west, lon)
    east = Math.max(east, lon)
    south = Math.min(south, lat)
    north = Math.max(north, lat)
  })

  return { west, east, south, north }
}

/**
 * 判断点是否在多边形内（射线法）
 */
function isPointInPolygon(point: Cesium.Cartesian3, polygon: Cesium.Cartesian3[]): boolean {
  const cartographic = Cesium.Cartographic.fromCartesian(point)
  const lon = Cesium.Math.toDegrees(cartographic.longitude)
  const lat = Cesium.Math.toDegrees(cartographic.latitude)

  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const carto1 = Cesium.Cartographic.fromCartesian(polygon[i])
    const carto2 = Cesium.Cartographic.fromCartesian(polygon[j])

    const xi = Cesium.Math.toDegrees(carto1.longitude)
    const yi = Cesium.Math.toDegrees(carto1.latitude)
    const xj = Cesium.Math.toDegrees(carto2.longitude)
    const yj = Cesium.Math.toDegrees(carto2.latitude)

    const intersect = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

// 使用示例1：创建30度旋转的垂直线
// createFencePattern(viewer, coordinates, {
//   spacing: 0.2,
//   lineWidth: 2,
//   lineColor: Cesium.Color.BLUE.withAlpha(1),
//   steps: 50,
//   clampToGround: true,
//   rotateAngle: Math.PI / 6, // 30度
//   lineType: 'vertical',
//   rotationCenter: 'first-point'
// });

// 使用示例2：创建45度旋转的网格
// createFencePattern(viewer, coordinates, {
//   spacing: 0.2,
//   lineWidth: 1,
//   lineColor: Cesium.Color.RED.withAlpha(0.7),
//   steps: 50,
//   clampToGround: true,
//   rotateAngle: Math.PI / 4, // 45度
//   lineType: 'both',
//   rotationCenter: 'first-point'
// });

// 使用示例3：创建不同角度的填充用于区分区域
export function createFilledRegions(viewer: Cesium.Viewer, regions: { coordinates: Coordinate[]; color: Cesium.Color; angle: number }[]) {
  regions.forEach((region, index) => {
    createFencePattern(viewer, region.coordinates, {
      spacing: 0.2,
      lineWidth: 2,
      lineColor: region.color.withAlpha(0.6),
      outlineColor: region.color.withAlpha(1),
      steps: 50,
      clampToGround: true,
      rotateAngle: region.angle, // 每个区域不同的旋转角度
      lineType: 'vertical',
      rotationCenter: 'first-point',
    })
  })
}

// 使用示例4：用不同角度填充两个相邻区域
// const region1 = {
//   coordinates: region1Coordinates,
//   color: Cesium.Color.BLUE,
//   angle: Math.PI / 12 // 15度
// };

// const region2 = {
//   coordinates: region2Coordinates,
//   color: Cesium.Color.RED,
//   angle: -Math.PI / 12 // -15度
// };

// createFilledRegions(viewer, [region1, region2]);
