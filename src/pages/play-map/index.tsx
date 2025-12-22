import CommonMap, { type CommonMapInstanceType } from '@/components/common-map'
import PathAnimationManager from '@/utils/plugins/ani';
import * as Cesium from "cesium";
import { set } from 'lodash';
import React, { useState, useEffect, useRef, useMemo } from 'react'

// 定义组件属性类型（当前无属性）
type PlayMapPropsType = {

}

// 地图漫游组件：实现一个实体沿指定线段路径匀速移动，到达终点后停止
const PlayMap: React.FC<PlayMapPropsType> = (props) => {
  // Cesium 地图视图实例引用
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  // 自定义地图组件实例引用
  const mapInstance = useRef<CommonMapInstanceType>(null);
  // 移动实体的引用（用于后续清理和跟踪）
  const movingEntityRef = useRef<Cesium.Entity | null>(null);
  // 标记是否已到达终点
  const isReachEndRef = useRef<boolean>(false);

  // 组件卸载时的清理逻辑
  useEffect(() => {
    return () => {
      // 移除移动实体，防止内存泄漏
      if (viewerRef.current && movingEntityRef.current) {
        viewerRef.current.entities.remove(movingEntityRef.current);
      }
    };
  }, []);

  return <CommonMap
    ref={mapInstance}
    // 开启地形深度测试，让要素贴合地形
    // 地形初始化完成后的回调函数（核心逻辑入口）
    terrainInitCallback={() => {
      // 获取 Cesium Viewer 实例（非空断言，确保地图已初始化）
      viewerRef.current = mapInstance.current?.getViewer()!;

      // ===================== 1. 定义路径线段的坐标点 =====================
      // 定义由两个经纬度点组成的线段（北京区域）
      var positions = [
        Cesium.Cartesian3.fromDegrees(116.0, 39.9),  // 起点：经度116.0，纬度39.9
        Cesium.Cartesian3.fromDegrees(116.1, 39.9),  // 终点：经度116.1，纬度39.9
      ];

      // ===================== 2. 创建可视化的路径线段 =====================
      viewerRef.current.entities.add({
        polyline: {
          positions: positions,          // 线段的坐标点数组
          width: 3,                      // 线段宽度（像素）
          material: Cesium.Color.BLUE,   // 线段颜色
          clampToGround: true            // 贴合地形
        }
      });

      // ===================== 3. 计算路径的长度信息（核心预处理） =====================
      // 存储每段线段的信息：起点、终点、长度
      var segmentLengths = [] as any[];
      // 路径总长度（米）
      var totalLength = 0;

      // 遍历所有线段，计算每段长度和总长度
      for (var i = 0; i < positions.length - 1; i++) {
        // 计算两个笛卡尔坐标点之间的直线距离（米）
        const length = Cesium.Cartesian3.distance(positions[i], positions[i + 1]);

        // 存储当前线段的详细信息
        segmentLengths.push({
          start: positions[i],   // 线段起点
          end: positions[i + 1], // 线段终点
          length: length         // 线段长度（米）
        });

        // 累加总长度
        totalLength += length;
      }

      // ===================== 4. 设置漫游的基础参数 =====================
      // 漫游开始时间（使用当前系统时间）
      const startTime = Cesium.JulianDate.now();
      // 移动速度（单位：米/秒）
      const speed = 150;

      // ===================== 5. 创建移动实体并实现漫游逻辑（核心） =====================
      movingEntityRef.current = viewerRef.current.entities.add({
        // 动态计算实体位置：使用 CallbackProperty 实现随时间变化的位置
        // @ts-ignore 忽略类型警告
        position: new Cesium.CallbackProperty(function (time, result) {
          // 如果已到达终点，直接返回最后一个点，不再计算
          if (isReachEndRef.current) {
            return Cesium.Cartesian3.clone(positions[positions.length - 1], result);
          }

          // -------- 5.1 计算时间差和移动距离 --------
          // 计算从开始到当前的时间差（秒）
          const elapsedSeconds = Cesium.JulianDate.secondsDifference(time!, startTime);
          // 计算已移动的总距离（不再取模，只单向移动）
          const distance = elapsedSeconds * speed;

          // 判断是否到达终点（距离超过总长度）
          if (distance >= totalLength) {
            isReachEndRef.current = true; // 标记到达终点

            viewerRef.current!.clock.shouldAnimate = false; // 停止时钟动画

            // 可选：移除 CallbackProperty，直接设置固定位置（彻底停止回调）
            if (movingEntityRef.current) {
              // @ts-ignore
              movingEntityRef.current.position = Cesium.Cartesian3.clone(positions[positions.length - 1]);
            }

            return Cesium.Cartesian3.clone(positions[positions.length - 1], result);
          }

          // -------- 5.2 定位当前所在的线段段 --------
          // 累计距离，用于判断当前点在哪个线段上
          let accumulatedDistance = 0;

          // 遍历所有线段段，找到当前距离对应的线段
          for (var i = 0; i < segmentLengths.length; i++) {
            const segment = segmentLengths[i];

            // 判断当前距离是否在当前线段段范围内
            if (distance <= accumulatedDistance + segment.length) {
              // -------- 5.3 计算当前线段内的具体位置 --------
              // 计算在当前线段内的偏移距离
              const segmentDistance = distance - accumulatedDistance;
              // 计算当前位置占该线段的比例（0~1）
              const ratio = segmentDistance / segment.length;

              // 线性插值计算当前位置：根据比例在起点和终点之间计算中间点
              // result 参数用于复用对象，减少内存分配
              return Cesium.Cartesian3.lerp(
                segment.start,    // 线段起点
                segment.end,      // 线段终点
                ratio,            // 插值比例
                result || new Cesium.Cartesian3() // 结果存储对象
              );
            }
            // 累计距离，进入下一线段判断
            accumulatedDistance += segment.length;
          }

          // 边界处理：返回最后一个点
          return Cesium.Cartesian3.clone(positions[positions.length - 1], result);
        }, false), // 第二个参数：是否随时间变化自动更新

        // -------- 5.4 移动实体的样式配置 --------
        point: {
          pixelSize: 15,                // 点的像素大小
          color: Cesium.Color.RED,      // 点的填充颜色
          outlineColor: Cesium.Color.WHITE, // 点的轮廓颜色
          outlineWidth: 2,              // 轮廓宽度
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴合地形
        },
        label: {
          text: '漫游点',               // 标签文字
          font: '14px sans-serif',      // 字体样式
          pixelOffset: new Cesium.Cartesian2(0, -20), // 像素偏移（向上20像素）
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 标签贴合地形
        },
        box: {
          dimensions: new Cesium.Cartesian3(1000, 1000, 1000),
          material: Cesium.Color.YELLOW.withAlpha(0.8),
          outline: true,
          outlineColor: Cesium.Color.WHITE,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴合地形
        },
      });

      // ===================== 6. 启动时钟动画 =====================
      viewerRef.current.clock.shouldAnimate = true; // 开启时钟动画
      viewerRef.current.clock.multiplier = 1;      // 动画速度倍率（1=正常速度）

      // ===================== 7. 跟踪移动实体 =====================
      // 让相机自动跟踪移动的实体，视角跟随
      /*       if (viewerRef.current && movingEntityRef.current) {
              viewerRef.current.trackedEntity = movingEntityRef.current;
            } */
    }}
  ></CommonMap>
}

export default PlayMap



/* 
      // 初始化管理器
      const animManager = new PathAnimationManager(viewerRef.current);

      // 示例1：两点直线移动（完全兼容之前用法）
      const box1 = viewerRef.current.entities.add({
        id: '直线移动Box',
        position: Cesium.Cartesian3.fromDegrees(121.67498064898889, 31.111979444895365, 0),
        box: {
          dimensions: new Cesium.Cartesian3(50000, 50000, 30000),
          material: Cesium.Color.RED,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          outline: true,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 3,
        },

      });

      animManager.addMoveAnimation(
        box1,
        [ // 两点数组
          [121.67498064898889, 31.111979444895365, 0],    // 起点
          [114.32655563101586, 37.357925769512725, 0],
          [110.32655563101586, 37.357925769512725, 0] // 终点
        ],
        20, // 4秒完成
        // @ts-ignore
        PathAnimationManager.Easing.linear,
      );

      const div = document.createElement('div')

      div.style.position = 'absolute'
      div.style.left = '50%'
      div.style.top = '50%'
      div.style.transform = 'translate(-50%, -50%)'
      div.innerHTML = `<div style="text-align: center;">暂停</div>`
      div.style.width = '100px'
      div.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'

      document.body.appendChild(div)

      div.addEventListener('click', () => {
        animManager.pauseAll()
      })


      const div2 = document.createElement('div')
      div2.style.position = 'absolute'
      div2.style.left = '65%'
      div2.style.top = '50%'
      div2.style.transform = 'translate(-50%, -50%)'
      div2.innerHTML = `<div style="text-align: center;">开始</div>`
      div2.style.width = '100px'
      div2.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'

      document.body.appendChild(div2)

      div2.addEventListener('click', () => {
        animManager.resumeAll()
      })

      return
*/