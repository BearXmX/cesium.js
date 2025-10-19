import React, { useEffect, useRef, useState } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'
import { latitudePositionInit, longitudePositionInit, obliquity } from './constance'

type SundialPropsType = {
  params: {
    latitudePosition: number
    longitudePosition: number
    currentTimeStr: string
    targetPositionCurrentTimeStr: string
    revolutionAngle: number
  }

  options: {
    location: 'beijing' | 'other'
  }
}

const Sundial: React.FC<SundialPropsType> = props => {
  const {
    params,
    options: { location },
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  const currentTimeSpanRef = useRef<HTMLSpanElement>(null)
  const targetTimeSpanRef = useRef<HTMLSpanElement>(null)

  const shadowRef = useRef<THREE.Mesh | null>(null)
  const cylinderGroupRef = useRef<THREE.Group | null>(null)

  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  // 常量定义
  const CYLINDER_RADIUS = 3
  const CYLINDER_THICKNESS = 1

  const CENTER_Y = CYLINDER_THICKNESS / 2 // 圆柱中心Y坐标

  const BASE_SHADOW_LENGTH = CYLINDER_RADIUS * 0.25 // 基础保留长度（19-6点）

  const INITIAL_24H_ANGLE = -Math.PI / 2 // 24点初始角度（-90°）

  const main = () => {
    if (!canvas.current) return

    // 1. 渲染器配置
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas.current })
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.sortObjects = true

    // 2. 相机配置
    const camera = new THREE.PerspectiveCamera(85, 1, 0.1, 300)
    camera.position.set(0, 7, 6)

    // 3. 场景与光源
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#050515') // 深色背景
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
    scene.add(ambientLight)

    // 4. 辅助轴
    const axesHelper = new THREE.AxesHelper(3)
    scene.add(axesHelper)

    // 5. 控制器
    const controls = new OrbitControls(camera, canvas.current)
    controls.enableDamping = true

    // 主容器组
    const riGuiGroup = new THREE.Group()
    const boxHeight = 1 // 底座高度

    // 🌞 根据地理物理公式计算阴影长度（改进版）
    const getPhysicalShadowLength = (latitude: number, longitude: number, revolutionAngle: number, localTime: string) => {
      const obliquityRad = (obliquity * Math.PI) / 180 // 黄赤交角（23.44°）
      const latRad = (latitude * Math.PI) / 180

      // 当前太阳直射点纬度（赤纬角 δ）
      // 春分: δ=0；夏至: δ=+23.44°（北半球），冬至: δ=-23.44°（北半球）
      // 对南北半球通用：
      const declinationRad = -obliquityRad * Math.sin(revolutionAngle)

      // 解析时间（HH:mm）
      const [h = 0, m = 0] = localTime.split(':').map(Number)
      const hour = Math.max(0, Math.min(23, h)) + Math.max(0, Math.min(59, m)) / 60

      // 经度修正：当地太阳时间 = 时区时间 + 经度差（每度4分钟）
      const timezoneOffset = Math.round(longitude / 15) // 当地标准经线（小时）
      const longitudeCorrection = (longitude - timezoneOffset * 15) / 15 // 小时
      const solarTime = hour + longitudeCorrection

      // 小时角 ω（正午0°，每小时15°）
      const hourAngleRad = ((solarTime - 12) * 15 * Math.PI) / 180

      // 🌅 太阳高度角公式（sinH = sinφ·sinδ + cosφ·cosδ·cosω）
      const sinAltitude = Math.sin(latRad) * Math.sin(declinationRad) + Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad)
      const solarAltitudeRad = Math.asin(sinAltitude)

      // 🌙 夜间或太阳低于地平线
      // 微调允许小于0的小角度，避免阴影提前消失
      if (solarAltitudeRad < -0.01) {
        return { length: 0.5, opacity: 0.3 } // 夜晚阴影几乎不可见
      }

      // 🌞 白天：阴影长度与太阳高度角成反比
      const shadowLength = 1 / Math.tan(Math.max(solarAltitudeRad, 0.01)) // 防止 tan(0) 无穷大

      // 🌈 缩放比例，使最长时刚好等于圆盘半径（CYLINDER_RADIUS）
      const scaledLength = Math.min(shadowLength, CYLINDER_RADIUS * 1.8)

      // ☀️ 根据太阳高度角控制透明度
      // 当太阳刚升起（sinAltitude≈0.1）时透明度≈0.2；中午(≈1)时透明度≈1
      const opacity = Math.max(0.2, Math.min(1, sinAltitude * 1.2))

      return { length: scaledLength, opacity }
    }

    // 🕒 更新阴影方向与长度
    const updateShadow = (time: string) => {
      const shadow = shadowRef.current
      if (!shadow) return

      const latitude = location === 'beijing' ? latitudePositionInit : params.latitudePosition
      const longitude = location === 'beijing' ? longitudePositionInit : params.longitudePosition
      const revolutionAngle = params.revolutionAngle

      // 🌍 计算阴影长度与透明度
      const { length: physicalLength, opacity } = getPhysicalShadowLength(latitude, longitude, revolutionAngle, time)

      // 时间转角度（每小时 15°）
      const [hours = 0, minutes = 0] = time.split(':').map(Number)
      const totalHours = Math.max(0, Math.min(23, hours)) + Math.max(0, Math.min(59, minutes)) / 60

      // 3. 计算影子旋转角度
      const timeAngleDegree = totalHours * 15
      const timeAngleRadian = timeAngleDegree * (Math.PI / 180) // 转为弧度
      shadow.rotation.y = INITIAL_24H_ANGLE - timeAngleRadian

      // 阴影长度变化
      shadow.scale.x = physicalLength

      const material = shadow.material as THREE.MeshStandardMaterial
      material.opacity = opacity
    }

    // ---------------------- 组件1：创建底座 ----------------------
    const createBox = () => {
      const texture = new THREE.TextureLoader().load(`${window.$$prefix}/textures/concrete_floor_worn_001_diff_1k.jpg`)
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(8, boxHeight, 8),
        new THREE.MeshStandardMaterial({
          color: '#b3b3b3',
          map: texture,
          side: THREE.DoubleSide,
        })
      )
      box.position.set(0, boxHeight / 2, 0)
      riGuiGroup.add(box)
    }

    // ---------------------- 组件2：创建刻度盘（圆柱组） ----------------------
    const createCylinder = () => {
      const long = 0.5
      const cylinderGroup = new THREE.Group()

      // 圆柱本体
      const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(CYLINDER_RADIUS, CYLINDER_RADIUS, CYLINDER_THICKNESS, 32),
        new THREE.MeshStandardMaterial({
          color: '#a1a1a1',
          transparent: true,
          opacity: 0.9,
        })
      )
      cylinder.position.set(0, 0, 0)
      cylinderGroup.add(cylinder)

      // ---------------------- 影子创建 ----------------------
      const shadowGeometry = new THREE.BoxGeometry(long, 0.02, 0.2)
      shadowGeometry.translate(-long / 2, 0, 0) // 原点移至一端（根部在中心，单向延伸）

      const shadow = new THREE.Mesh(
        shadowGeometry,
        new THREE.MeshStandardMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
        })
      )

      // 影子初始配置
      shadow.position.set(0, CENTER_Y, 0) // 根部固定在圆柱中心
      shadow.scale.x = BASE_SHADOW_LENGTH // 初始用基础长度
      shadow.rotation.y = INITIAL_24H_ANGLE // 默认指向24点（-90°）

      cylinderGroup.add(shadow)
      shadowRef.current = shadow

      // 刻度线（24小时制）
      const markerGroup = new THREE.Group()

      for (let i = 0; i < 24; i++) {
        const angle = i * 15 * (Math.PI / 180) // 每小时15度
        const x = Math.cos(angle) * CYLINDER_RADIUS
        const y = Math.sin(angle) * CYLINDER_RADIUS

        const flag = [0, 3, 6, 9, 12, 15, 18, 21].map(item => (item - 6 + 24) % 24).includes(i)

        // 原刻度线
        const marker = new THREE.Mesh(
          new THREE.BoxGeometry(flag ? 0.5 : 0.25, 0.05, 0.05),
          new THREE.MeshStandardMaterial({ color: flag ? '#622f0a' : 0x333333 })
        )

        marker.position.set((x + Math.cos(angle) * 0.25) / 1.2, (y + Math.sin(angle) * 0.25) / 1.2, -0.5)
        marker.rotation.z = angle
        markerGroup.add(marker)

        // 刻度线下面的平面Mesh（贴在圆柱表面）
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(0.5, 0.5),
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
          })
        )

        // 贴在圆柱表面
        plane.position.set((x + Math.cos(angle) * 0.25) / 1.5, (y + Math.sin(angle) * 0.25) / 1.5, -0.5)
        plane.rotation.z = angle

        /*         markerGroup.add(plane) */
      }

      markerGroup.rotation.x = Math.PI / 2
      cylinderGroup.add(markerGroup)

      riGuiGroup.add(cylinderGroup)
      cylinderGroupRef.current = cylinderGroup
      return cylinderGroup
    }

    // ---------------------- 组件3：创建晷针 ----------------------
    const createGnomon = (parentGroup: THREE.Group) => {
      const gnomon = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.1), new THREE.MeshStandardMaterial({ color: 0x8b4513 }))
      gnomon.position.set(0, 0.75, 0) // 位于圆柱中心
      parentGroup.add(gnomon)
    }

    // ---------------------- 窗口resize处理 ----------------------
    const handleResize = () => {
      if (!canvas.current) return
      const { clientWidth: width, clientHeight: height } = canvas.current!

      const { clientWidth: containerWidth, clientHeight: containerHeight } = containerRef.current?.parentElement!

      const halfContainerParentHeight = containerHeight / 2

      if (containerWidth * 2 > containerHeight) {
        setContainerHeight(halfContainerParentHeight)
        setContainerWidth(halfContainerParentHeight)
      } else {
        setContainerHeight(containerWidth)
        setContainerWidth(containerWidth)
      }

      renderer.setSize(width, height, false)
      camera.aspect = 1
      camera.updateProjectionMatrix()
    }

    // ---------------------- 初始化组件 ----------------------
    createBox()
    const cylinderGroup = createCylinder()
    createGnomon(cylinderGroup)
    scene.add(riGuiGroup)

    // 初始化时更新影子（用当前时间）
    updateShadow(params.currentTimeStr)
    handleResize()

    // ---------------------- 渲染循环 ----------------------
    const render = () => {
      if (!canvas.current) return

      requestAnimationFrame(render)
      handleResize()
      updateShadow(location === 'beijing' ? params.currentTimeStr : params.targetPositionCurrentTimeStr) // 用目标时间实时更新

      // 刻度盘倾斜逻辑
      if (cylinderGroupRef.current) {
        const latitude = location === 'beijing' ? latitudePositionInit : params.latitudePosition

        cylinderGroupRef.current.rotation.x = Math.abs(latitude) * (Math.PI / 180)

        cylinderGroupRef.current.position.y = boxHeight + 3 * Math.sin(cylinderGroupRef.current.rotation.x)
      }

      // 更新时间显示
      if (currentTimeSpanRef.current) {
        currentTimeSpanRef.current!.innerText = params.currentTimeStr
      }

      if (targetTimeSpanRef.current) {
        targetTimeSpanRef.current!.innerText = params.targetPositionCurrentTimeStr
      }

      renderer.render(scene, camera)
      controls.update()
    }
    requestAnimationFrame(render)

    // ---------------------- 清理函数 ----------------------
    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      // 几何体与材质清理（避免内存泄漏）
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose()
          }
        }
      })
    }
  }

  // ---------------------- React生命周期 ----------------------
  useEffect(() => {
    const clean = main()
    return clean
  }, [canvas.current, params.latitudePosition, params.currentTimeStr])

  // ---------------------- 渲染DOM ----------------------
  return (
    <div className="sundial-container" style={{ height: containerHeight, width: containerWidth, position: 'relative' }} ref={containerRef}>
      <div style={{ color: '#fff', width: '100%', marginBottom: 8, position: 'absolute', bottom: 10, left: 0, zIndex: 999, textAlign: 'center' }}>
        {location === 'beijing' && (
          <>
            <div style={{ fontSize: 12 }}>
              北京坐标：
              <span>
                东经 {longitudePositionInit} 北纬 {latitudePositionInit}{' '}
              </span>
            </div>
            <div style={{ fontSize: 12 }}>
              北京时间：<span ref={currentTimeSpanRef}>{params.currentTimeStr}</span>
            </div>
          </>
        )}
        {location === 'other' && (
          <>
            <div style={{ fontSize: 12 }}>
              目标坐标：
              <span>
                {params.longitudePosition < 0 ? '西' : '东'}经 {Math.abs(params.longitudePosition)} {params.latitudePosition < 0 ? '南' : '北'}纬{' '}
                {Math.abs(params.latitudePosition)}{' '}
              </span>
            </div>
            <div style={{ fontSize: 12 }}>
              目标时间：<span ref={targetTimeSpanRef}>{params.targetPositionCurrentTimeStr}</span>
            </div>
          </>
        )}
      </div>
      <div style={{ height: '100%' }}>
        <canvas className="canvas-container-body" ref={canvas}></canvas>
      </div>
    </div>
  )
}

export default Sundial
