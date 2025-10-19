import React, { useState, useEffect, useRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createDebugLatLonSphere, earthRadius, latitudePositionInit, latLonToPosition, longitudePositionInit, obliquityRad } from './constance'

export type PickEarthPropsType = {
  confirmPickLocation: [lon: number, lat: number] | []
  modalVisible: boolean
}

export type PickEarthInstanceType = {
  getPickLocation: () => [lon: number, lat: number] | []
  setPickLocation: (params: [lon: number, lat: number] | []) => void
}

const PickEarth = React.forwardRef<PickEarthInstanceType, PickEarthPropsType>((props, ref) => {
  const { confirmPickLocation, modalVisible } = props

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const earthGroupRef = useRef<THREE.Group | null>(null)
  const earthRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> | null>(null)
  const lineGroupRef = useRef<THREE.Group | null>(null)
  const markersRef = useRef<THREE.Mesh[]>([])

  const [pickLocation, setPickLocation] = useState<[lon: number, lat: number] | []>([])

  /** 销毁旧标记点 */
  const destroyOldMarkers = () => {
    if (markersRef.current.length === 0) return
    markersRef.current.forEach(marker => {
      if (marker.name !== 'init') {
        if (marker.parent) marker.parent.remove(marker)
        marker.geometry.dispose()
        if (Array.isArray(marker.material)) {
          marker.material.forEach(mat => mat.dispose())
        } else {
          marker.material.dispose()
        }
      }
    })
    markersRef.current = markersRef.current.filter(marker => marker.name === 'init')
  }

  /** 创建标记点 */
  const createMarker = (params: { lat: number; lon: number; color?: string; size?: number; name?: string }): THREE.Mesh => {
    if (!earthRef.current) return new THREE.Mesh()
    destroyOldMarkers()

    const { lat, lon, color = '#00b96b', size = 0.05, name = '' } = params
    const earthMesh = earthRef.current
    const earthScale = earthMesh.scale.x
    const actualEarthRadius = earthRadius / earthScale
    const position = latLonToPosition(lat, lon, actualEarthRadius)
    const geometry = new THREE.SphereGeometry(size, 16, 16)
    const material = new THREE.MeshBasicMaterial({ color })
    const marker = new THREE.Mesh(geometry, material)
    if (name) marker.name = name
    marker.position.copy(position)
    markersRef.current.push(marker)
    earthMesh.add(marker)
    return marker
  }

  /** 初始化场景 */
  const init = () => {
    if (!canvasRef.current) return

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    })
    renderer.setPixelRatio(window.devicePixelRatio)

    const camera = new THREE.PerspectiveCamera(45, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000)
    camera.position.set(3, 2, 6)

    const scene = new THREE.Scene()

    const controls = new OrbitControls(camera, canvasRef.current)
    controls.enableDamping = true
    controls.enableZoom = true // ✅ 防止首次放大
    controls.target.set(0, 0, 0)

    const axesHelper = new THREE.AxesHelper(50)
    scene.add(axesHelper)

    const light = new THREE.AmbientLight('#ffffff', 1.5)
    scene.add(light)

    /** 点击事件 */
    const addEarthClickEvent = () => {
      if (!canvasRef.current || !earthRef.current) return
      if ((canvasRef.current as any)._hasClickEvent) return // ✅ 防止重复绑定

      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

      const onCanvasClick = (event: MouseEvent) => {
        const earthMesh = earthRef.current
        if (!earthMesh) return

        const rect = canvasRef.current!.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        camera.updateMatrixWorld()
        raycaster.setFromCamera(mouse, camera)

        const intersects = raycaster.intersectObject(earthMesh, false)
        if (intersects.length === 0) return

        const worldPoint = intersects[0].point.clone()
        const earthToWorldMatrix = earthMesh.matrixWorld
        const worldToEarthMatrix = new THREE.Matrix4().copy(earthToWorldMatrix).invert()
        const earthLocalPoint = worldPoint.applyMatrix4(worldToEarthMatrix)

        const scaleFactor = (earthMesh.scale.x + earthMesh.scale.y + earthMesh.scale.z) / 3
        const actualEarthRadius = earthRadius * scaleFactor

        const lat = Math.asin(earthLocalPoint.y / actualEarthRadius) * (180 / Math.PI)
        const reversedX = -earthLocalPoint.x
        const rawLon = Math.atan2(earthLocalPoint.z, reversedX) * (180 / Math.PI)
        const offset = 180
        let lon = (rawLon + offset) % 360
        if (lon > 180) lon -= 360
        else if (lon < -180) lon += 360

        const _lat = Number(lat.toFixed(1))
        const _lon = Number(lon.toFixed(1))

        setPickLocation([_lon, _lat])
        createMarker({ lon: _lon, lat: _lat, color: '#00b96b', size: 0.04, name: 'other' })
      }

      canvasRef.current.addEventListener('click', onCanvasClick)
      ;(canvasRef.current as any)._hasClickEvent = true // ✅ 标记已绑定
    }

    /** 创建地球 */
    const createEarth = () => {
      const earthGroup = new THREE.Group()
      earthGroupRef.current = earthGroup

      const geometry = new THREE.SphereGeometry(earthRadius, 62, 62)
      const textureLoader = new THREE.TextureLoader()

      textureLoader.load(
        window.$$prefix + '/models/earth/textures/Material.002_diffuse.jpg',
        earthTexture => {
          const material = new THREE.MeshStandardMaterial({
            map: earthTexture,
            color: '#fff',
            side: THREE.DoubleSide,
          })

          const earthMesh = new THREE.Mesh(geometry, material)
          earthRef.current = earthMesh
          earthMesh.rotation.x = obliquityRad

          const latLonLines = createDebugLatLonSphere(earthRadius, earthGroup)
          lineGroupRef.current = latLonLines
          earthMesh.add(latLonLines)

          earthGroup.add(earthMesh)
          scene.add(earthGroup)

          // ✅ 等纹理加载完成再绑定点击事件
          addEarthClickEvent()

          createMarker({
            lon: longitudePositionInit,
            lat: latitudePositionInit,
            color: 'red',
            size: 0.08,
            name: 'init',
          })
        },
        undefined,
        err => console.error('贴图加载失败', err)
      )
    }

    const handleResize = () => {
      if (!canvasRef.current) return
      const width = canvasRef.current.clientWidth
      const height = canvasRef.current.clientHeight
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    createEarth()
    handleResize()

    function render(time: number) {
      handleResize()
      controls.update()
      renderer.render(scene, camera)
      requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      destroyOldMarkers()
    }
  }

  useImperativeHandle(ref, () => ({
    getPickLocation() {
      return pickLocation
    },
    setPickLocation(location: [lon: number, lat: number] | []) {
      setPickLocation(location)

      if (location.length) {
        createMarker({ lon: location[0], lat: location[1], color: '#00b96b', size: 0.04, name: 'other' })
      } else {
        destroyOldMarkers()
      }
    },
  }))

  /** ✅ 确保只初始化一次 */
  useEffect(() => {
    if (!canvasRef.current) return
    const clean = init()
    return clean
  }, [])

  useEffect(() => {
    if (modalVisible) {
      console.log('confirmPickLocation', confirmPickLocation, modalVisible)
      if (confirmPickLocation.length > 0) {
        const [lon, lat] = confirmPickLocation as [number, number]
        createMarker({ lon, lat, color: '#00b96b', size: 0.04, name: 'other' })
      }
    } else {
      setPickLocation([])
      destroyOldMarkers()
    }
  }, [modalVisible])

  return (
    <div className="pick-earth" style={{ width: '100%', height: '400px', position: 'relative' }}>
      <span style={{ position: 'absolute', top: 10, left: 10, color: '#fff' }}>
        {pickLocation.length > 0 &&
          `坐标：${pickLocation[0]! < 0 ? '西经' : '东经'}${pickLocation[0]},${pickLocation[1]! < 0 ? '南纬' : '北纬'}${pickLocation[1]}`}
      </span>
      <canvas className="pick-earth-body" ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
    </div>
  )
})

export default PickEarth
