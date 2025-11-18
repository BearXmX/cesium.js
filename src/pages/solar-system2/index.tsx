import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { createDebugLatLonSphere, earthRadius, getEarthCenterPos, makeStars, obliquityRad, staticConfig, sunRadius } from './constance'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// 节气定义（保留）
const solarTerms = [
  { name: '春分', angle: 0, directLat: 0 },
  { name: '夏至', angle: -Math.PI / 2, directLat: obliquityRad },
  { name: '秋分', angle: -Math.PI, directLat: 0 },
  { name: '冬至', angle: (-Math.PI * 3) / 2, directLat: -obliquityRad },
]

export const latitudePositionInit = 40 // 北京纬度
export const longitudePositionInit = 120 // 北京经度

type SolarPropsType = {}

const Solar: React.FC<SolarPropsType> = props => {
  const {} = props

  // 新增：时间显示相关ref
  const timeDisplayRef = useRef<HTMLDivElement>(null)

  // 核心ref（保留）
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null)
  const earthGroupRef = useRef<THREE.Group | null>(null)
  const earthRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> | null>(null)
  const lineGroupRef = useRef<THREE.Group | null>(null)
  const animationIdRef = useRef<number>(0)
  const guiRef = useRef<GUI>(null)
  const terminatorRef = useRef<THREE.Mesh | null>(null)

  // 公转参数（保留）
  const revolutionParams = useRef({
    isRevolution: false,
    positionPercent: 0,
    angle: solarTerms[0].angle,
    lastTime: 0,
    period: 100,
    orbitRadius: staticConfig.radius,
  })

  // 自转参数（保留）
  const rotationParams = useRef({
    isRotation: false,
    positionPercent: 0,
    angle: 0,
    lastTime: 0,
    period: 5, // 自转周期5秒（对应现实24小时）
  })

  const cameraParams = useRef({
    activeCameraIndex: 0,
  })

  // 工具函数（保留）
  const normalizeAngle = (angle: number): number => {
    return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  }

  const angleToPercent = (normalizedAngle: number): number => {
    return 100 - (normalizedAngle / (2 * Math.PI)) * 100
  }

  const percentToAngle = (percent: number): number => {
    return -(percent / 100) * 2 * Math.PI
  }

  // 替换：最终版时间计算函数（修复夏至日时间错误）
  const calculateBeijingTime = (rotationAngle: number, revolutionAngle: number) => {
    // 1. 自转带来的晨线偏移（保留正确逻辑）
    const rotationDeg = -(rotationAngle / (2 * Math.PI)) * 360

    // 核心修复：适配公转角度递减（0→-π/2→-π），让晨线正确西移（夏至日）
    // 原逻辑：revolutionDeg = (revolutionAngle / (2 * Math.PI)) * 360;
    // 新逻辑：加负号，将递减的公转角度转为递增的晨线偏移
    const revolutionDeg = -(revolutionAngle / (2 * Math.PI)) * 360

    // 2. 晨线当前实际经度（初始90°E + 公转偏移 + 自转偏移，归一化到0~360°）
    const morningLineLon = (90 + revolutionDeg + rotationDeg + 360) % 360

    // 3. 东八区中央经线（120°E）计算严格北京时间
    const beijingTimeZoneLon = 120
    let lonDiff = beijingTimeZoneLon - morningLineLon
    lonDiff = lonDiff < 0 ? lonDiff + 360 : lonDiff // 确保经度差为正（向东）

    // 4. 时间计算（晨线=6点，15°=1小时，向东加时间）
    const baseHours = 6
    const hoursFromLon = lonDiff / 15
    let totalHours = (baseHours + hoursFromLon) % 24
    totalHours = totalHours < 0 ? totalHours + 24 : totalHours

    // 5. 格式化显示
    const hours = Math.floor(totalHours).toString().padStart(2, '0')
    const minutes = Math.floor((totalHours - Math.floor(totalHours)) * 60)
      .toString()
      .padStart(2, '0')
    const seconds = Math.floor(((totalHours - Math.floor(totalHours)) * 60 - Math.floor((totalHours - Math.floor(totalHours)) * 60)) * 60)
      .toString()
      .padStart(2, '0')

    return `${hours}:${minutes}:${seconds}`
  }

  const init = () => {
    if (!canvasRef.current) return () => {}

    // 新增：创建时间显示元素
    const timeDisplay = document.createElement('div')
    timeDisplay.style.position = 'absolute'
    timeDisplay.style.bottom = '20px'
    timeDisplay.style.left = '20px'
    timeDisplay.style.color = 'white'
    timeDisplay.style.fontSize = '24px'
    timeDisplay.style.zIndex = '100'
    timeDisplay.textContent = '北京时间: 08:00:00'
    canvasRef.current.parentElement?.appendChild(timeDisplay)
    timeDisplayRef.current = timeDisplay

    // 1. 渲染器（保留）
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current!,
      antialias: true,
      alpha: true,
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // 2. 场景（保留）
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050515)
    sceneRef.current = scene
    const stars = makeStars()
    scene.add(stars)

    // 环境光（保留）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambientLight)

    // 初始化相机（保留）
    const cameraInstanceList: THREE.PerspectiveCamera[] = []

    const createCamera = (
      base: [fov: number, aspect: number, near: number, far: number],
      position: [x: number, y: number, z: number],
      name: string,
      parent: any
    ) => {
      const camera = new THREE.PerspectiveCamera(...base)
      camera.position.set(...position)
      camera.userData.name = name
      cameraInstanceList.push(camera)
      parent.add(camera)
      return camera
    }

    const mainCamera = createCamera([75, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000], [5, 5, 30], '主相机', scene)

    mainCamera.lookAt(0, 0, 5)
    cameraRef.current = mainCamera

    const observeEarthMorningLineCamera = createCamera(
      [80, canvasRef.current!.clientWidth / canvasRef.current!.clientHeight, 0.1, 300],
      [0, 0, 0],
      '观察地球晨线相机',
      scene
    )
    const observeEarthNightLineCamera = createCamera(
      [80, canvasRef.current!.clientWidth / canvasRef.current!.clientHeight, 0.1, 300],
      [0, 0, 0],
      '观察地球昏线相机',
      scene
    )

    const updateObserveEarthCamera = (camera: THREE.PerspectiveCamera, angle: number, angleOffset: number, yOffset: number) => {
      const position = getEarthCenterPos(angle + angleOffset, revolutionParams.current.orbitRadius)
      position[1] += yOffset
      camera.position.set(...position)
      if (earthGroupRef.current) {
        camera.lookAt(earthGroupRef.current!.position)
      }
    }

    // 轨道控制器（保留）
    const controls = new OrbitControls(mainCamera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.target.set(0, 0, 5)
    controls.update()

    // 4. 公转轨道（保留）
    const orbitGeometry = new THREE.RingGeometry(revolutionParams.current.orbitRadius - 0.05, revolutionParams.current.orbitRadius + 0.1, 128)
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: '#f7f7f7',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    })
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial)
    orbit.rotation.x = Math.PI / 2
    scene.add(orbit)

    // 5. 太阳（保留）
    const createSun = () => {
      const textureLoader = new THREE.TextureLoader()
      const suntexture = textureLoader.load(window.$$prefix + '/textures/sun.png')
      const sunGeometry = new THREE.SphereGeometry(sunRadius, 32, 32)
      const sunMaterial = new THREE.MeshBasicMaterial({ map: suntexture })
      const sun = new THREE.Mesh(sunGeometry, sunMaterial)
      sun.position.set(0, 0, 5)
      scene.add(sun)

      const sunLight = new THREE.DirectionalLight(0xffffff, 5)
      sunLight.castShadow = true
      sunLight.shadow.mapSize.width = 2048
      sunLight.shadow.mapSize.height = 2048
      sunLight.shadow.camera.near = 5
      sunLight.shadow.camera.far = 80
      sunLight.shadow.camera.left = -40
      sunLight.shadow.camera.right = 40
      sunLight.shadow.camera.top = 40
      sunLight.shadow.camera.bottom = -40

      sunLightRef.current = sunLight
      sun.add(sunLight)
      sunLight.position.set(0, 0, -5) // 太阳光沿-z方向照射
    }
    createSun()

    // 更新太阳光目标（保留）
    const updateSunlightTarget = () => {
      if (sunLightRef.current && earthGroupRef.current) {
        sunLightRef.current.target.position.copy(earthGroupRef.current.position)
        sunLightRef.current.target.updateMatrixWorld()

        /* 处理晨昏线 */
        const sunLightPos = new THREE.Vector3(0, 0, 0) // 太阳固定位置
        const earthPosVec = new THREE.Vector3(...getEarthCenterPos(revolutionParams.current.angle, revolutionParams.current.orbitRadius)) // 地球当前位置
        // 太阳→地球的向量（即太阳光线照射方向）
        const sunToEarthVec = earthPosVec.clone().sub(sunLightPos).normalize()

        // 让晨昏线平面的法线 = 太阳光线方向（确保平面与光线垂直）
        const targetQuaternion = new THREE.Quaternion()
        targetQuaternion.setFromUnitVectors(
          new THREE.Vector3(0, 0, 1), // 晨昏线初始法线（z轴）
          sunToEarthVec // 目标法线（太阳光线方向）
        )
        terminatorRef.current!.quaternion.copy(targetQuaternion)
      }
    }

    // 6. 创建地球（新增晨昏线）
    const createEarth = () => {
      const earthGroup = new THREE.Group()
      earthGroup.name = 'EarthGroup'
      earthGroupRef.current = earthGroup

      /* 晨昏线 */
      const terminatorGeometry = new THREE.RingGeometry(earthRadius + 0.01, earthRadius + 0.2, 128)
      const terminatorMaterial = new THREE.MeshBasicMaterial({
        color: '#4e12bd',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      })
      const terminator = new THREE.Mesh(terminatorGeometry, terminatorMaterial)
      terminator.rotation.y = Math.PI / 2
      terminatorRef.current = terminator
      earthGroup.add(terminator)

      const geometry = new THREE.SphereGeometry(earthRadius, 62, 62)
      const textureLoader = new THREE.TextureLoader()
      const earthTexture = textureLoader.load(window.$$prefix + '/models/earth/textures/Material.002_diffuse.jpg')
      const material = new THREE.MeshStandardMaterial({
        map: earthTexture,
        color: '#fff',
        side: THREE.DoubleSide,
      })
      const earthMesh = new THREE.Mesh(geometry, material)
      earthRef.current = earthMesh
      earthMesh.rotation.x = obliquityRad // 地球自转轴倾斜

      // 初始位置：春分
      const earthPosition = getEarthCenterPos(solarTerms[0].angle, revolutionParams.current.orbitRadius)
      earthGroup.position.set(...earthPosition)
      earthGroup.add(earthMesh)

      // 相机初始位置更新（保留）
      updateObserveEarthCamera(observeEarthMorningLineCamera, solarTerms[0].angle, -Math.PI / 10, 1)
      updateObserveEarthCamera(observeEarthNightLineCamera, solarTerms[0].angle, Math.PI / 10, 1)

      // 经纬线（保留）
      const latLonLines = createDebugLatLonSphere(earthRadius, earthGroup)
      lineGroupRef.current = latLonLines
      earthMesh.add(latLonLines)

      // 赤道（保留）
      const equatorGeometry = new THREE.RingGeometry(earthRadius + 0.05, earthRadius + 1, 128)
      const equatorMaterial = new THREE.MeshBasicMaterial({
        color: '#cf3c3c',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      })
      const equator = new THREE.Mesh(equatorGeometry, equatorMaterial)
      equator.rotation.x = Math.PI / 2
      earthMesh.add(equator)

      scene.add(earthGroup)
    }
    createEarth()

    // 7. 窗口resize（保留）
    const handleResize = () => {
      if (!canvasRef.current) return
      const { clientWidth: width, clientHeight: height } = canvasRef.current
      if (renderer.domElement.width !== width || renderer.domElement.height !== height) {
        renderer.setSize(width, height, false)
        cameraInstanceList.forEach(camera => {
          camera.aspect = width / height
          camera.updateProjectionMatrix()
        })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    // 8. GUI控制（保留）
    const gui = new GUI()
    guiRef.current = gui

    const revolutionFolder = gui.addFolder('公转控制（100秒周期）')
    revolutionFolder.add(revolutionParams.current, 'isRevolution').name('启用自动公转')
    const revolutionPercentControl = revolutionFolder
      .add(revolutionParams.current, 'positionPercent', 0, 100, 0.1)
      .name('公转位置（0~100%）')
      .onChange((percent: number) => {
        const angle = percentToAngle(percent)
        revolutionParams.current.angle = angle
        if (earthGroupRef.current) {
          earthGroupRef.current.position.set(...getEarthCenterPos(angle, revolutionParams.current.orbitRadius))
        }
        revolutionParams.current.lastTime = performance.now()
      })

    solarTerms.forEach(term => {
      revolutionFolder.add(
        {
          [term.name]: () => {
            revolutionParams.current.angle = term.angle
            const normalized = normalizeAngle(term.angle)
            revolutionParams.current.positionPercent = angleToPercent(normalized)

            if (earthGroupRef.current) {
              earthGroupRef.current.position.set(...getEarthCenterPos(term.angle, revolutionParams.current.orbitRadius))
            }

            revolutionPercentControl.updateDisplay()

            // 时间更新：传入自转角度+公转角度，共同计算晨线位置
            if (timeDisplayRef.current) {
              const beijingTime = calculateBeijingTime(
                rotationParams.current.angle,
                revolutionParams.current.angle // 新增：传入公转角度，修正晨线位置
              )

              timeDisplayRef.current.textContent = `北京时间: ${beijingTime}`
            }
          },
        },
        term.name
      )
    })
    revolutionFolder.open()

    const cameraFolder = guiRef.current.addFolder('相机控制')
    const cameraOptions: Record<string, number> = {}
    cameraInstanceList.forEach((item, index) => {
      cameraOptions[item.userData.name] = index
    })
    cameraFolder.add(cameraParams.current, 'activeCameraIndex').options(cameraOptions).name('切换相机')

    const rotationFolder = gui.addFolder('自转控制（5秒周期）')
    rotationFolder.add(rotationParams.current, 'isRotation').name('启用自转')
    const rotationPercentControls = rotationFolder
      .add(rotationParams.current, 'positionPercent', 0, 100, 0.1)
      .name('自转位置（0~100%）')
      .onChange((percent: number) => {
        const angle = (percent / 100) * 2 * Math.PI
        rotationParams.current.angle = angle

        if (earthRef.current) {
          earthRef.current.rotation.y = angle
        }

        rotationParams.current.lastTime = performance.now()

        // 时间更新：传入自转角度+公转角度，共同计算晨线位置
        if (timeDisplayRef.current) {
          const beijingTime = calculateBeijingTime(
            rotationParams.current.angle,
            revolutionParams.current.angle // 新增：传入公转角度，修正晨线位置
          )

          timeDisplayRef.current.textContent = `北京时间: ${beijingTime}`
        }
      })
    rotationFolder.open()

    // 9. 动画循环（新增时间更新）
    const animate = (time: number) => {
      animationIdRef.current = requestAnimationFrame(animate)
      if (!scene || !mainCamera || !renderer) return

      const deltaTime = (time - revolutionParams.current.lastTime) / 1000
      revolutionParams.current.lastTime = time
      rotationParams.current.lastTime = time

      // 公转逻辑（保留）
      if (revolutionParams.current.isRevolution && earthGroupRef.current) {
        const angleIncrement = -((2 * Math.PI) / revolutionParams.current.period) * deltaTime
        revolutionParams.current.angle += angleIncrement

        const normalizedAngle = normalizeAngle(revolutionParams.current.angle)
        revolutionParams.current.positionPercent = angleToPercent(normalizedAngle)

        // 更新地球位置
        const earthPos = getEarthCenterPos(revolutionParams.current.angle, revolutionParams.current.orbitRadius)
        earthGroupRef.current.position.set(...earthPos)

        revolutionPercentControl.updateDisplay()
      }

      // 自转逻辑（新增时间计算）
      if (rotationParams.current.isRotation && earthRef.current) {
        const rotationIncrement = ((2 * Math.PI) / rotationParams.current.period) * deltaTime
        rotationParams.current.angle = (rotationParams.current.angle + rotationIncrement) % (2 * Math.PI)
        rotationParams.current.positionPercent = (rotationParams.current.angle / (2 * Math.PI)) * 100
        earthRef.current.rotation.y = rotationParams.current.angle

        rotationPercentControls.updateDisplay()

        // 时间更新：传入自转角度+公转角度，共同计算晨线位置
        if (timeDisplayRef.current) {
          const beijingTime = calculateBeijingTime(
            rotationParams.current.angle,
            revolutionParams.current.angle // 新增：传入公转角度，修正晨线位置
          )

          timeDisplayRef.current.textContent = `北京时间: ${beijingTime}`
        }
      }

      updateObserveEarthCamera(observeEarthMorningLineCamera, revolutionParams.current.angle, -Math.PI / 10, 1)
      updateObserveEarthCamera(observeEarthNightLineCamera, revolutionParams.current.angle, Math.PI / 10, 1)
      updateSunlightTarget()
      controls.update()
      renderer.render(scene, cameraInstanceList[cameraParams.current.activeCameraIndex])
    }
    animate(performance.now())

    // 清理函数（保留）
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationIdRef.current)
      renderer.dispose()
      guiRef.current?.destroy()
      // 新增：移除时间显示元素
      timeDisplayRef.current?.remove()
    }
  }

  useEffect(() => {
    const clear = init()
    return () => clear()
  }, [])

  return (
    <div className="canvas-container" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
    </div>
  )
}

export default Solar
