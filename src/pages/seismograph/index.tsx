import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as gui from 'lil-gui'

const Seismograph: React.FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null)
  const guiRef = useRef<gui.GUI | null>(null)
  // ---------- 参数与 GUI ----------
  const params = {
    earthquakeLevel: 5,
    waveSpeed: 5,
    isQuaking: false,
    startEarthquake: () => {
      params.isQuaking = true
    },
    stopEarthquake: () => {
      params.isQuaking = false
    },
  }

  const initGUI = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('地震模拟')
    guiRef.current.add(params, 'earthquakeLevel', 0, 9, 0.1).name('地震等级').listen()
    guiRef.current.add(params, 'waveSpeed', 1, 10, 0.1).name('波动速度')
    guiRef.current.add(params, 'startEarthquake').name('⚡ 开始地震')
    guiRef.current.add(params, 'stopEarthquake').name('⏸ 暂停地震')
  }

  useEffect(() => {
    if (!canvas.current) return

    // ---------- 初始化渲染器 ----------
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas.current })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true

    // ---------- 摄像机 ----------
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(3, 10, 15)

    // ---------- 场景 ----------
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#3d362f')

    // ---------- 光源 ----------
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(6, 10, 6)
    dirLight.castShadow = true
    scene.add(ambient, dirLight)

    // ---------- 控制器 ----------
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, 2, 0)

    // ---------- 地基 ----------
    const baseLength = 8
    const baseGeo = new THREE.BoxGeometry(baseLength, 0.5, 6)
    const baseMat = new THREE.MeshStandardMaterial({ color: '#c7b299', roughness: 0.8 })
    const base = new THREE.Mesh(baseGeo, baseMat)
    base.position.y = -0.25
    base.receiveShadow = true
    scene.add(base)

    // ---------- 顶梁 ----------
    const topBeam = new THREE.Mesh(
      new THREE.BoxGeometry(baseLength - 0.4, 0.3, 0.3),
      new THREE.MeshStandardMaterial({ color: '#333333', metalness: 0.7, roughness: 0.3 })
    )
    topBeam.position.set(0, 4.9, 0)
    topBeam.castShadow = true
    scene.add(topBeam)

    // ---------- 摆锤组 ----------
    const pendulumGroup = new THREE.Group()
    pendulumGroup.position.set(0, 4.9, 0)
    scene.add(pendulumGroup)

    // ---------- 弹簧（一直曲线） ----------
    const spring = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          Array.from({ length: 20 }, (_, i) => {
            const t1 = i / 19
            return new THREE.Vector3(Math.sin(t1 * Math.PI * 6) * 0.15, -t1 * 1.8, 0)
          })
        ),
        100,
        0.05,
        8,
        false
      ),
      new THREE.MeshStandardMaterial({ color: '#222222', metalness: 0.8, roughness: 0.2 })
    )
    spring.castShadow = true
    pendulumGroup.add(spring)

    // ---------- 球 ----------
    const ballRadius = 0.5
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius, 32, 32),
      new THREE.MeshStandardMaterial({ color: '#a37632', metalness: 0.5, roughness: 0.5 })
    )
    ball.position.y = -1.8
    ball.castShadow = true
    pendulumGroup.add(ball)

    // ---------- 笔 ----------
    const penLength = 1.0
    const pen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, penLength, 12),
      new THREE.MeshStandardMaterial({ color: '#111111', metalness: 0.3, roughness: 0.6 })
    )
    pen.position.y = ball.position.y - ballRadius - penLength / 2
    pen.castShadow = true
    pendulumGroup.add(pen)

    // ---------- 纸 ----------
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(baseLength, 2), new THREE.MeshStandardMaterial({ color: '#e6d7b9', side: THREE.DoubleSide }))
    paper.rotation.x = -Math.PI / 2
    paper.position.set(0, 0.1, 0)
    paper.receiveShadow = true
    scene.add(paper)

    // ---------- 纸上波形 ----------
    const pointCount = 600
    const positions = new Float32Array(pointCount * 3)
    const waveGeo = new THREE.BufferGeometry()
    waveGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const wave = new THREE.Line(waveGeo, new THREE.LineBasicMaterial({ color: 0x000000 }))
    wave.position.set(0, 0.12, 0)
    scene.add(wave)

    // 窗口大小调整
    const handleResize = () => {
      if (!canvas.current) return
      const width = window.innerWidth
      const height = window.innerHeight
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    initGUI()
    handleResize()

    // ---------- 动画 ----------
    let t = 0
    let penX = 0
    const penSpeed = 0.02
    const waveHistory: { x: number; z: number }[] = []

    const animate = () => {
      requestAnimationFrame(animate)

      t += 0.05

      // 摆锤和纸带运动
      const waveValue = params.isQuaking ? params.earthquakeLevel * Math.sin(t * params.waveSpeed) * 0.1 : 0
      ball.position.z = waveValue
      pen.position.z = waveValue
      pen.position.y = ball.position.y - ballRadius - penLength / 2

      // 弹簧更新：保持 X 方向曲线 + 摇晃 Z 偏移
      spring.geometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          Array.from({ length: 20 }, (_, i) => {
            const t1 = i / 19
            const waveX = Math.sin(t1 * Math.PI * 6) * 0.15
            const waveZ = waveValue * t1
            return new THREE.Vector3(waveX, -t1 * 1.8, waveZ)
          })
        ),
        100,
        0.05,
        8,
        false
      )

      // 纸带滚动
      if (params.isQuaking) {
        penX += penSpeed
        waveHistory.push({ x: penX, z: waveValue })
        while (waveHistory.length > 0 && waveHistory[0].x - penX < -baseLength / 2) waveHistory.shift()
        const arr = wave.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < waveHistory.length; i++) {
          arr[i * 3 + 0] = waveHistory[i].x - penX
          arr[i * 3 + 1] = 0.001
          arr[i * 3 + 2] = waveHistory[i].z
        }
        wave.geometry.setDrawRange(0, waveHistory.length)
        wave.geometry.attributes.position.needsUpdate = true
      }

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // ---------- 窗口自适应 ----------
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      guiRef.current?.destroy()
    }
  }, [])

  return (
    <div className="canvas-container">
      <canvas className="canvas-container-body" ref={canvas}></canvas>
    </div>
  )
}

export default Seismograph
