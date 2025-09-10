/*
 * 等高线绘制主类
 * @author BJGiser
 * @date 2024/03/27
 */
import * as Cesium from "cesium";

import {
  featureEach,
  interpolate,
  point,
  rhumbDistance,
  isolines,
} from "@turf/turf";
import CreateRemindertip from "./ReminderTip.js";
class ContourAnalysis {
  viewer;
  interfaceNum;
  colorFill;
  countorLineList;
  drawGeomtry;
  countorLine;
  constructor(viewer) {
    if (!viewer) throw new Error("no viewer object!");
    this.viewer = viewer;
  }
  createContour(options) {
    options = options || {};
    this.interfaceNum = Cesium.defaultValue(options.interfaceNum, 25); //内插时均分的数量，即沿着边界长或宽均分成n分进行插点，默认值25
    this.colorFill = Cesium.defaultValue(options.colorFill, [
      "#8CEA00",
      "#B7FF4A",
      "#FFFF37",
      "#FFE66F",
      "#FFD1A4",
      "#FFCBB3",
      "#FFBD9D",
      "#FFAD86",
      "#FF9D6F",
      "#FF8F59",
      "#FF8040",
      "#FF5809",
      "#F75000",
      "#D94600",
      "#BB3D00",
      "#A23400",
      "#842B00",
      "#642100",
      "#4D0000",
      "#2F0000",
    ]); //等高线赋值颜色，内含default值
    this.countorLineList = Cesium.defaultValue(options.countorLineList, []);
    this.createNewLine();
  }
  createNewLine() {
    let $this = this;
    let viewer = this.viewer;
    let activeShapePoints = [];
    let activeShape;
    let floatingPoint;
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    let toolTip = "左键点击开始绘制区域";
    handler.setInputAction(function (event) {
      let earthPosition = viewer.scene.pickPosition(event.position);
      if (Cesium.defined(earthPosition)) {
        if (activeShapePoints.length === 0) {
          toolTip = "左键添加第二个点";
          floatingPoint = createPoint(earthPosition, false);
          activeShapePoints.push(earthPosition);
          let dynamicPositions = new Cesium.CallbackProperty(function () {
            return new Cesium.PolygonHierarchy(activeShapePoints);
          }, false);
          activeShape = drawShape(dynamicPositions);
        } else {
          toolTip = "左键添加点，右键完成绘制";
        }
        activeShapePoints.push(earthPosition);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(function (event) {
      let endPos = event.endPosition;
      CreateRemindertip(toolTip, endPos, true);
      if (Cesium.defined(floatingPoint)) {
        let newPosition = viewer.scene.pickPosition(event.endPosition);
        if (Cesium.defined(newPosition)) {
          floatingPoint.position.setValue(newPosition);
          activeShapePoints.pop();
          activeShapePoints.push(newPosition);
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(function (event) {
      CreateRemindertip(toolTip, event.position, false);
      terminateShape();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    function terminateShape() {
      activeShapePoints.pop();
      if (activeShapePoints.length) {
        drawShape(activeShapePoints);
      }
      viewer.entities.remove(floatingPoint);
      viewer.entities.remove(activeShape);
      handler.destroy();
      $this.interpolatePoint(activeShapePoints);
    }
    function createPoint(worldPosition, boolPoint) {
      let _size = boolPoint ? 30 : 5;
      let point = viewer.entities.add({
        position: worldPosition,
        point: {
          color: Cesium.Color.RED.withAlpha(0.8),
          pixelSize: _size,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
      return point;
    }
    function drawShape(positionData) {
      //绘制的几何图形
      $this.drawGeomtry = viewer.entities.add({
        name: "contourBoundary",
        polygon: {
          hierarchy: positionData,
          material: new Cesium.ColorMaterialProperty(
            Cesium.Color.BLUE.withAlpha(0.4)
          ),
        },
      });
      return $this.drawGeomtry;
    }
  }
  //利用turf在box内进行插点
  interpolatePoint(curPoints) {
    let $this = this;

    let features = [];
    const boundaryCoord = {
      minX: 360,
      maxX: -360,
      minY: 180,
      maxY: -180,
    }; //绘制几何图形的外围矩形box
    for (let index = 0; index < curPoints.length; index++) {
      const element = curPoints[index];
      let ellipsoid = this.viewer.scene.globe.ellipsoid;
      let cartographic = ellipsoid.cartesianToCartographic(element);
      let lat = Cesium.Math.toDegrees(cartographic.latitude);
      let lng = Cesium.Math.toDegrees(cartographic.longitude);
      boundaryCoord.maxY = Math.max(lat, boundaryCoord.maxY);
      boundaryCoord.minY = Math.min(lat, boundaryCoord.minY);
      boundaryCoord.maxX = Math.max(lng, boundaryCoord.maxX);
      boundaryCoord.minX = Math.min(lng, boundaryCoord.minX);

      let curFeature = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
      };
      features.push(curFeature);
    }
    let boundaryJson = {
      type: "FeatureCollection",
      features: features,
    };
    featureEach(boundaryJson, function (point) {
      point.properties.height = 0;
    });
    let options = {
      gridType: "points",
      property: "height",
      units: "kilometers",
    };
    let from = point([boundaryCoord.minX, boundaryCoord.minY]);
    let to = point([boundaryCoord.maxX, boundaryCoord.maxY]);
    let diagonalDistance = rhumbDistance(from, to, {
      units: "kilometers",
    });
    let grid = interpolate(
      boundaryJson,
      diagonalDistance / this.interfaceNum,
      options
    );
    let minHeight = 10000000; //最低点高程值
    let maxHeight = -100000000; //最高点高程值
    featureEach(grid, function (point) {
      let pos = point.geometry.coordinates;
      let cartographic = Cesium.Cartographic.fromDegrees(pos[0], pos[1]);
      let height = $this.viewer.scene.globe.getHeight(cartographic);
      maxHeight = Math.max(height, maxHeight);
      minHeight = Math.min(height, minHeight);
      point.properties.height = height;
    });
    let breaks = [];
    let stepCount = this.colorFill.length - 1;
    let step = (maxHeight - minHeight) / stepCount;
    for (let index = 0; index < stepCount + 1; index++) {
      breaks.push(Math.ceil(minHeight + step * index));
    }
    let linesJson = isolines(grid, breaks, { zProperty: "height" });
    let _countorLine = Cesium.GeoJsonDataSource.load(linesJson, {
      clampToGround: true,
    });
    _countorLine.then(function (dataSource) {
      $this.countorLine = dataSource; //最终计算生成的等高线对象，GeoJsonDataSource
      $this.countorLineList.push(dataSource); //等高线数组
      $this.viewer.dataSources.add(dataSource);
      let entities = dataSource.entities.values;
      for (let index = 0; index < entities.length; index++) {
        const element = entities[index];
        let cur_index = $this.getObjectIndex(
          breaks,
          element.properties.height._value
        );
        if (cur_index) {
          element.polyline.material = Cesium.Color.fromCssColorString(
            $this.colorFill[cur_index - 1]
          );
        }
      }
    });
    this.viewer.entities.remove(this.drawGeomtry);
  }
  /**
   * 返回随机插入的数在数组中的位置
   * @param {*} arr 元数组
   * @param {*} num 随机数
   * @returns 序号
   * @example getObjectIndex([0,218,325,333,444],354)=>4;
   */
  getObjectIndex(arr, num) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] > num) {
        return i;
      }
    }
  }
  clear(countorLine) {
    if (countorLine) {
      this.viewer.dataSources.remove(countorLine);
      let index = this.countorLineList.indexOf(countorLine);
      this.countorLineList.splice(index, 1);
    }
  }
  destroy() {
    this.countorLineList.forEach((element) => {
      this.viewer.dataSources.remove(element);
    });
    this.countorLineList = [];
  }
}

window.ContourAnalysis = ContourAnalysis;

export default ContourAnalysis;
