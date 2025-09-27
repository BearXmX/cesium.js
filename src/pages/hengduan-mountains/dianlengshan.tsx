import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

type dianlengshanPropsType = {}

const Dianlengshan: React.FC<dianlengshanPropsType> = props => {
  const {} = props

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const rendererRef = useRef<THREE.WebGLRenderer>(null)

  const initScene = () => {
    /* 渲染器 */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current!,
    })

    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer

    /* 场景 */
    const scene = new THREE.Scene()

    scene.background = new THREE.Color('#fff')

    /* 环境光 */
    const ambientLight = new THREE.AmbientLight('#ffffffff', 10)
    scene.add(ambientLight)

    /* 相机 */
    const camera = new THREE.PerspectiveCamera(75, canvasRef.current?.width! / canvasRef.current?.height!, 0.1, 1000)
    camera.position.set(-1, 1.8, 2)
    camera.lookAt(0, 0, 0)

    /* 控制器 */
    const controls = new OrbitControls(camera, canvasRef.current)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.target.set(0, 0, 0)
    controls.update()
    controls.autoRotate = true

    /* 世界坐标辅助器 */
    const axesHelper = new THREE.AxesHelper(5)
    /*     scene.add(axesHelper) */

    /* 地板 */
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#a9c388' }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)

    const textureLoader = new THREE.TextureLoader()
    const floorColorTexture = textureLoader.load(window.$$prefix + '/textures/floor.png')

    floor.material.map = floorColorTexture

    /* 阴影 */
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    floor.receiveShadow = true

    // 加载熊猫模型
    const gltfLoader = new GLTFLoader()
    gltfLoader.load(window.$$prefix + '/models/dianlengshan/scene.gltf', gltf => {
      const group = new THREE.Group()
      group.position.set(0, 0, 0)
      scene.add(group)

      // 循环6个
      for (let i = 0; i < 6; i++) {
        const dianlengshan = gltf.scene.clone()
        dianlengshan.scale.set(0.005, 0.005, 0.005)

        // 位置为圆周
        dianlengshan.position.set(Math.cos(i * (Math.PI / 3)), 0, Math.sin(i * (Math.PI / 3)))
        group.add(dianlengshan)
      }
    })

    // 窗口大小调整
    const handleResize = () => {
      if (!canvasRef.current) return

      const { clientWidth: width, clientHeight: height } = canvasRef.current

      if (renderer.domElement.width !== width || renderer.domElement.height !== height) {
        renderer.setSize(width, width, false)

        camera.aspect = width / height

        camera.updateProjectionMatrix()
      }
    }

    handleResize()

    function render(time: number) {
      const seconds = time * 0.001

      /* update ghosts */

      handleResize()

      controls.update()

      renderer.render(scene, camera)

      requestAnimationFrame(render)
    }

    requestAnimationFrame(render)

    window.addEventListener('resize', handleResize)

    return () => {
      renderer.dispose()
      window.removeEventListener('resize', handleResize)
    }
  }

  useEffect(() => {
    const cleanup = initScene()

    return cleanup
  }, [])

  return (
    <div className="canvas-container">
      <canvas className="canvas-container-body" ref={canvasRef}></canvas>
    </div>
  )
}

export default Dianlengshan
