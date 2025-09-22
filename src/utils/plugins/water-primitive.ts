// @ts-nocheck
import * as Cesium from 'cesium'

class WaterPrimitive {
  constructor(positions, options) {
    this.positions = positions
    this.options = options
    return this.createPrimitive()
  }

  createPrimitive() {
    //创建水体geometry
    let polygon1 = new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(this.positions),
      perPositionHeight: true,
      vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
    })

    let primitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: polygon1,
      }),
      appearance: this.getApper(),
      show: true,
    })
    return primitive
  }

  /*   updateColor(color) {
    this.options.baseWaterColor = color
    this.appearance.material.uniforms.baseWaterColor = color
  } */

  getApper() {
    let apper = new Cesium.EllipsoidSurfaceAppearance({
      aboveGround: true,
    })

    apper.material = new Cesium.Material({
      fabric: {
        type: 'Water',
        uniforms: {
          baseWaterColor: this.options.baseWaterColor,
          normalMap: this.options.normalMap,
          frequency: this.options.frequency,
          animationSpeed: this.options.animationSpeed,
          amplitude: this.options.amplitude,
          specularIntensity: this.options.specularIntensity,
        },
      },
    })

    return apper
  }
}

export default WaterPrimitive
