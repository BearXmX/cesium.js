import * as Cesium from 'cesium'
import DiyShape from './diyShape'
import Circle from './Circle'

class DrawerCountour {
  static drawerDiyShapeCountour = (viewer: Cesium.Viewer): DiyShape => {
    return new DiyShape(viewer)
  }

  static drawerCircleCountour = (viewer: Cesium.Viewer): Circle => {
    return new Circle(viewer)
  }
}

export default DrawerCountour
