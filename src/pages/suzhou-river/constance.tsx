import * as Cesium from 'cesium'
import WaterPrimitive from '@/utils/plugins/water-primitive'

export const addWaterRegion = (positions: any, instance: any[], viewerRef: React.RefObject<Cesium.Viewer | null>) => {
  let waterPrimitive = new WaterPrimitive(positions, {
    baseWaterColor: Cesium.Color.AQUA.withAlpha(0.8),
    normalMap: window.$$prefix + '/water-normals-small.jpg',
    frequency: 1000.0,
    animationSpeed: 0.01,
    amplitude: 100,
    specularIntensity: 100,
  })

  viewerRef.current!.scene.primitives.add(waterPrimitive) //添加到场景

  instance.push(waterPrimitive)
}

export const coordinatesToPositions = (coordinates: any[]) => {
  let positions = [] as any
  coordinates.map(c => {
    positions.push(Cesium.Cartesian3.fromDegrees(c[0], c[1], 0))
  })

  return positions
}

export const waterQualityChartsData = [
  {
    year: 1986,
    a: [
      { value: 0, name: '上游（白鹤）' },
      { value: 0, name: '下游（武宁路桥）' },
      { value: 0, name: '全河平均' },
    ],
    b: [
      { value: 5, name: '上游（白鹤）' },
      { value: 28, name: '下游（武宁路桥）' },
      { value: 15, name: '全河平均' },
    ],
    c: [
      { value: 4, name: '上游（白鹤）' },
      { value: 45, name: '下游（武宁路桥）' },
      { value: 20, name: '全河平均' },
    ],
    d: [
      { value: 1, name: '上游（白鹤）' },
      { value: 13, name: '下游（武宁路桥）' },
      { value: 6, name: '全河平均' },
    ],
    e: [
      { value: 0.8, name: '上游（白鹤）' },
      { value: 0.8, name: '下游（武宁路桥）' },
      { value: 1.4, name: '全河平均' },
    ],
  },
  {
    year: 1987,
    a: [
      { value: 0, name: '上游（白鹤）' },
      { value: 0, name: '下游（武宁路桥）' },
      { value: 0, name: '全河平均' },
    ],
    b: [
      { value: 4, name: '上游（白鹤）' },
      { value: 22, name: '下游（武宁路桥）' },
      { value: 14, name: '全河平均' },
    ],
    c: [
      { value: 3, name: '上游（白鹤）' },
      { value: 36, name: '下游（武宁路桥）' },
      { value: 16, name: '全河平均' },
    ],
    d: [
      { value: 0.5, name: '上游（白鹤）' },
      { value: 12, name: '下游（武宁路桥）' },
      { value: 5, name: '全河平均' },
    ],
    e: [
      { value: 0.6, name: '上游（白鹤）' },
      { value: 0.75, name: '下游（武宁路桥）' },
      { value: 1.2, name: '全河平均' },
    ],
  },
  {
    year: 1988,
    a: [
      { value: 25, name: '上游（白鹤）' },
      { value: 130, name: '下游（武宁路桥）' },
      { value: 77.5, name: '全河平均' },
    ],
    b: [
      { value: 4, name: '上游（白鹤）' },
      { value: 31, name: '下游（武宁路桥）' },
      { value: 19, name: '全河平均' },
    ],
    c: [
      { value: 2, name: '上游（白鹤）' },
      { value: 58, name: '下游（武宁路桥）' },
      { value: 26, name: '全河平均' },
    ],
    d: [
      { value: 2, name: '上游（白鹤）' },
      { value: 14, name: '下游（武宁路桥）' },
      { value: 7, name: '全河平均' },
    ],
    e: [
      { value: 0.4, name: '上游（白鹤）' },
      { value: 1.1, name: '下游（武宁路桥）' },
      { value: 1.05, name: '全河平均' },
    ],
  },
  {
    year: 1989,
    a: [
      { value: 35, name: '上游（白鹤）' },
      { value: 100, name: '下游（武宁路桥）' },
      { value: 80.5, name: '全河平均' },
    ],
    b: [
      { value: 6, name: '上游（白鹤）' },
      { value: 28, name: '下游（武宁路桥）' },
      { value: 17, name: '全河平均' },
    ],
    c: [
      { value: 3, name: '上游（白鹤）' },
      { value: 50, name: '下游（武宁路桥）' },
      { value: 22, name: '全河平均' },
    ],
    d: [
      { value: 1, name: '上游（白鹤）' },
      { value: 13, name: '下游（武宁路桥）' },
      { value: 6.5, name: '全河平均' },
    ],
    e: [
      { value: 0.6, name: '上游（白鹤）' },
      { value: 0.65, name: '下游（武宁路桥）' },
      { value: 0.9, name: '全河平均' },
    ],
  },
  {
    year: 1990,
    a: [
      { value: 25, name: '上游（白鹤）' },
      { value: 140, name: '下游（武宁路桥）' },
      { value: 77.5, name: '全河平均' },
    ],
    b: [
      { value: 7, name: '上游（白鹤）' },
      { value: 18, name: '下游（武宁路桥）' },
      { value: 12, name: '全河平均' },
    ],
    c: [
      { value: 3.5, name: '上游（白鹤）' },
      { value: 50, name: '下游（武宁路桥）' },
      { value: 22, name: '全河平均' },
    ],
    d: [
      { value: 1.2, name: '上游（白鹤）' },
      { value: 11.5, name: '下游（武宁路桥）' },
      { value: 6.2, name: '全河平均' },
    ],
    e: [
      { value: 0.55, name: '上游（白鹤）' },
      { value: 0.45, name: '下游（武宁路桥）' },
      { value: 0.75, name: '全河平均' },
    ],
  },
  {
    year: 1991,
    a: [
      { value: 30, name: '上游（白鹤）' },
      { value: 155, name: '下游（武宁路桥）' },
      { value: 92.5, name: '全河平均' },
    ],
    b: [
      { value: 6, name: '上游（白鹤）' },
      { value: 22, name: '下游（武宁路桥）' },
      { value: 12, name: '全河平均' },
    ],
    c: [
      { value: 3, name: '上游（白鹤）' },
      { value: 68, name: '下游（武宁路桥）' },
      { value: 26, name: '全河平均' },
    ],
    d: [
      { value: 1.2, name: '上游（白鹤）' },
      { value: 12, name: '下游（武宁路桥）' },
      { value: 6.3, name: '全河平均' },
    ],
    e: [
      { value: 0.2, name: '上游（白鹤）' },
      { value: 0.55, name: '下游（武宁路桥）' },
      { value: 0.55, name: '全河平均' },
    ],
  },
  {
    year: 1992,
    a: [
      { value: 20, name: '上游（白鹤）' },
      { value: 100, name: '下游（武宁路桥）' },
      { value: 60, name: '全河平均' },
    ],
    b: [
      { value: 7, name: '上游（白鹤）' },
      { value: 29, name: '下游（武宁路桥）' },
      { value: 17, name: '全河平均' },
    ],
    c: [
      { value: 3.5, name: '上游（白鹤）' },
      { value: 62, name: '下游（武宁路桥）' },
      { value: 25, name: '全河平均' },
    ],
    d: [
      { value: 4, name: '上游（白鹤）' },
      { value: 19, name: '下游（武宁路桥）' },
      { value: 10.5, name: '全河平均' },
    ],
    e: [
      { value: 0.1, name: '上游（白鹤）' },
      { value: 0.9, name: '下游（武宁路桥）' },
      { value: 0.6, name: '全河平均' },
    ],
  },
  {
    year: 1993,
    a: [
      { value: 23, name: '上游（白鹤）' },
      { value: 85, name: '下游（武宁路桥）' },
      { value: 54, name: '全河平均' },
    ],
    b: [
      { value: 7, name: '上游（白鹤）' },
      { value: 21, name: '下游（武宁路桥）' },
      { value: 12, name: '全河平均' },
    ],
    c: [
      { value: 3.8, name: '上游（白鹤）' },
      { value: 38, name: '下游（武宁路桥）' },
      { value: 18, name: '全河平均' },
    ],
    d: [
      { value: 2, name: '上游（白鹤）' },
      { value: 16, name: '下游（武宁路桥）' },
      { value: 9, name: '全河平均' },
    ],
    e: [
      { value: 0.1, name: '上游（白鹤）' },
      { value: 0.95, name: '下游（武宁路桥）' },
      { value: 0.55, name: '全河平均' },
    ],
  },
  {
    year: 1994,
    a: [
      { value: 25, name: '上游（白鹤）' },
      { value: 80, name: '下游（武宁路桥）' },
      { value: 52.5, name: '全河平均' },
    ],
    b: [
      { value: 8, name: '上游（白鹤）' },
      { value: 20, name: '下游（武宁路桥）' },
      { value: 13, name: '全河平均' },
    ],
    c: [
      { value: 3.8, name: '上游（白鹤）' },
      { value: 36, name: '下游（武宁路桥）' },
      { value: 16, name: '全河平均' },
    ],
    d: [
      { value: 1.3, name: '上游（白鹤）' },
      { value: 15.6, name: '下游（武宁路桥）' },
      { value: 8.5, name: '全河平均' },
    ],
    e: [
      { value: 0.05, name: '上游（白鹤）' },
      { value: 1.4, name: '下游（武宁路桥）' },
      { value: 0.8, name: '全河平均' },
    ],
  },
  {
    year: 1995,
    a: [
      { value: 25, name: '上游（白鹤）' },
      { value: 65, name: '下游（武宁路桥）' },
      { value: 45, name: '全河平均' },
    ],
    b: [
      { value: 9, name: '上游（白鹤）' },
      { value: 16, name: '下游（武宁路桥）' },
      { value: 14, name: '全河平均' },
    ],
    c: [
      { value: 5, name: '上游（白鹤）' },
      { value: 30, name: '下游（武宁路桥）' },
      { value: 15, name: '全河平均' },
    ],
    d: [
      { value: 3.5, name: '上游（白鹤）' },
      { value: 15, name: '下游（武宁路桥）' },
      { value: 9, name: '全河平均' },
    ],
    e: [
      { value: 0.25, name: '上游（白鹤）' },
      { value: 1, name: '下游（武宁路桥）' },
      { value: 0.75, name: '全河平均' },
    ],
  },
  {
    year: 1996,
    a: [
      { value: 25, name: '上游（白鹤）' },
      { value: 65, name: '下游（武宁路桥）' },
      { value: 45, name: '全河平均' },
    ],
    b: [
      { value: 9, name: '上游（白鹤）' },
      { value: 16.5, name: '下游（武宁路桥）' },
      { value: 13, name: '全河平均' },
    ],
    c: [
      { value: 5.5, name: '上游（白鹤）' },
      { value: 26, name: '下游（武宁路桥）' },
      { value: 16, name: '全河平均' },
    ],
    d: [
      { value: 3.5, name: '上游（白鹤）' },
      { value: 17, name: '下游（武宁路桥）' },
      { value: 10, name: '全河平均' },
    ],
    e: [
      { value: 0.22, name: '上游（白鹤）' },
      { value: 0.3, name: '下游（武宁路桥）' },
      { value: 0.35, name: '全河平均' },
    ],
  },
  {
    year: 1997,
    a: [
      { value: 20, name: '上游（白鹤）' },
      { value: 60, name: '下游（武宁路桥）' },
      { value: 40, name: '全河平均' },
    ],
    b: [
      { value: 9.2, name: '上游（白鹤）' },
      { value: 13.5, name: '下游（武宁路桥）' },
      { value: 10.5, name: '全河平均' },
    ],
    c: [
      { value: 5, name: '上游（白鹤）' },
      { value: 14, name: '下游（武宁路桥）' },
      { value: 12, name: '全河平均' },
    ],
    d: [
      { value: 3.5, name: '上游（白鹤）' },
      { value: 11, name: '下游（武宁路桥）' },
      { value: 7, name: '全河平均' },
    ],
    e: [
      { value: 0.1, name: '上游（白鹤）' },
      { value: 1.1, name: '下游（武宁路桥）' },
      { value: 0.5, name: '全河平均' },
    ],
  },
  {
    year: 1998,
    a: [
      { value: 25, name: '上游（白鹤）' },
      { value: 63, name: '下游（武宁路桥）' },
      { value: 44, name: '全河平均' },
    ],
    b: [
      { value: 9.5, name: '上游（白鹤）' },
      { value: 15.5, name: '下游（武宁路桥）' },
      { value: 11, name: '全河平均' },
    ],
    c: [
      { value: 5.5, name: '上游（白鹤）' },
      { value: 16, name: '下游（武宁路桥）' },
      { value: 14, name: '全河平均' },
    ],
    d: [
      { value: 1.5, name: '上游（白鹤）' },
      { value: 13, name: '下游（武宁路桥）' },
      { value: 4.5, name: '全河平均' },
    ],
    e: [
      { value: 0.3, name: '上游（白鹤）' },
      { value: 1.65, name: '下游（武宁路桥）' },
      { value: 0.65, name: '全河平均' },
    ],
  },
  {
    year: 1999,
    a: [
      { value: 20, name: '上游（白鹤）' },
      { value: 50, name: '下游（武宁路桥）' },
      { value: 35, name: '全河平均' },
    ],
    b: [
      { value: 6.5, name: '上游（白鹤）' },
      { value: 11, name: '下游（武宁路桥）' },
      { value: 10.5, name: '全河平均' },
    ],
    c: [
      { value: 5, name: '上游（白鹤）' },
      { value: 15, name: '下游（武宁路桥）' },
      { value: 13, name: '全河平均' },
    ],
    d: [
      { value: 2.5, name: '上游（白鹤）' },
      { value: 9.5, name: '下游（武宁路桥）' },
      { value: 4, name: '全河平均' },
    ],
    e: [
      { value: 0.28, name: '上游（白鹤）' },
      { value: 0.75, name: '下游（武宁路桥）' },
      { value: 0.5, name: '全河平均' },
    ],
  },
  {
    year: 2000,
    a: [
      { value: 30, name: '上游（白鹤）' },
      { value: 40, name: '下游（武宁路桥）' },
      { value: 35, name: '全河平均' },
    ],
    b: [
      { value: 6.5, name: '上游（白鹤）' },
      { value: 6.6, name: '下游（武宁路桥）' },
      { value: 6.4, name: '全河平均' },
    ],
    c: [
      { value: 2.9, name: '上游（白鹤）' },
      { value: 4.9, name: '下游（武宁路桥）' },
      { value: 3.2, name: '全河平均' },
    ],
    d: [
      { value: 4, name: '上游（白鹤）' },
      { value: 5.5, name: '下游（武宁路桥）' },
      { value: 4.5, name: '全河平均' },
    ],
    e: [
      { value: 0.28, name: '上游（白鹤）' },
      { value: 0.75, name: '下游（武宁路桥）' },
      { value: 0.5, name: '全河平均' },
    ],
  },
  {
    year: 2001,
    a: [
      { value: 18, name: '上游（白鹤）' },
      { value: 30, name: '下游（武宁路桥）' },
      { value: 24, name: '全河平均' },
    ],
    b: [
      { value: 6.4, name: '上游（白鹤）' },
      { value: 6.5, name: '下游（武宁路桥）' },
      { value: 6.3, name: '全河平均' },
    ],
    c: [
      { value: 3, name: '上游（白鹤）' },
      { value: 5, name: '下游（武宁路桥）' },
      { value: 3.5, name: '全河平均' },
    ],
    d: [
      { value: 3, name: '上游（白鹤）' },
      { value: 4.5, name: '下游（武宁路桥）' },
      { value: 3.5, name: '全河平均' },
    ],
    e: [
      { value: 0.22, name: '上游（白鹤）' },
      { value: 0.47, name: '下游（武宁路桥）' },
      { value: 0.45, name: '全河平均' },
    ],
  },
  {
    year: 2002,
    a: [
      { value: 19, name: '上游（白鹤）' },
      { value: 35, name: '下游（武宁路桥）' },
      { value: 27, name: '全河平均' },
    ],
    b: [
      { value: 6.3, name: '上游（白鹤）' },
      { value: 6.4, name: '下游（武宁路桥）' },
      { value: 6.2, name: '全河平均' },
    ],
    c: [
      { value: 3.2, name: '上游（白鹤）' },
      { value: 5.2, name: '下游（武宁路桥）' },
      { value: 3.3, name: '全河平均' },
    ],
    d: [
      { value: 2.5, name: '上游（白鹤）' },
      { value: 4, name: '下游（武宁路桥）' },
      { value: 3, name: '全河平均' },
    ],
    e: [
      { value: 0.45, name: '上游（白鹤）' },
      { value: 0.6, name: '下游（武宁路桥）' },
      { value: 0.55, name: '全河平均' },
    ],
  },
  {
    year: 2003,
    a: [
      { value: 15, name: '上游（白鹤）' },
      { value: 20, name: '下游（武宁路桥）' },
      { value: 17.5, name: '全河平均' },
    ],
    b: [
      { value: 6.3, name: '上游（白鹤）' },
      { value: 6.4, name: '下游（武宁路桥）' },
      { value: 6.2, name: '全河平均' },
    ],
    c: [
      { value: 3.3, name: '上游（白鹤）' },
      { value: 5.3, name: '下游（武宁路桥）' },
      { value: 3.4, name: '全河平均' },
    ],
    d: [
      { value: 5, name: '上游（白鹤）' },
      { value: 6, name: '下游（武宁路桥）' },
      { value: 5.5, name: '全河平均' },
    ],
    e: [
      { value: 0.53, name: '上游（白鹤）' },
      { value: 0.55, name: '下游（武宁路桥）' },
      { value: 0.54, name: '全河平均' },
    ],
  },
  {
    year: 2004,
    a: [
      { value: 16, name: '上游（白鹤）' },
      { value: 22, name: '下游（武宁路桥）' },
      { value: 19, name: '全河平均' },
    ],
    b: [
      { value: 6.4, name: '上游（白鹤）' },
      { value: 6.5, name: '下游（武宁路桥）' },
      { value: 6.3, name: '全河平均' },
    ],
    c: [
      { value: 3.3, name: '上游（白鹤）' },
      { value: 5.3, name: '下游（武宁路桥）' },
      { value: 3.4, name: '全河平均' },
    ],
    d: [
      { value: 5.5, name: '上游（白鹤）' },
      { value: 6.5, name: '下游（武宁路桥）' },
      { value: 6, name: '全河平均' },
    ],
    e: [
      { value: 0.72, name: '上游（白鹤）' },
      { value: 0.75, name: '下游（武宁路桥）' },
      { value: 0.74, name: '全河平均' },
    ],
  },
  {
    year: 2005,
    a: [
      { value: 17, name: '上游（白鹤）' },
      { value: 23, name: '下游（武宁路桥）' },
      { value: 20, name: '全河平均' },
    ],
    b: [
      { value: 6.4, name: '上游（白鹤）' },
      { value: 6.5, name: '下游（武宁路桥）' },
      { value: 6.3, name: '全河平均' },
    ],
    c: [
      { value: 1.6, name: '上游（白鹤）' },
      { value: 1.8, name: '下游（武宁路桥）' },
      { value: 1.7, name: '全河平均' },
    ],
    d: [
      { value: 5, name: '上游（白鹤）' },
      { value: 6, name: '下游（武宁路桥）' },
      { value: 5.5, name: '全河平均' },
    ],
    e: [
      { value: 0.56, name: '上游（白鹤）' },
      { value: 0.59, name: '下游（武宁路桥）' },
      { value: 0.57, name: '全河平均' },
    ],
  },
  {
    year: 2006,
    a: [
      { value: 17, name: '上游（白鹤）' },
      { value: 23, name: '下游（武宁路桥）' },
      { value: 20, name: '全河平均' },
    ],
    b: [
      { value: 6.4, name: '上游（白鹤）' },
      { value: 6.5, name: '下游（武宁路桥）' },
      { value: 6.3, name: '全河平均' },
    ],
    c: [
      { value: 1.7, name: '上游（白鹤）' },
      { value: 1.8, name: '下游（武宁路桥）' },
      { value: 1.9, name: '全河平均' },
    ],
    d: [
      { value: 5.8, name: '上游（白鹤）' },
      { value: 5.9, name: '下游（武宁路桥）' },
      { value: 5.85, name: '全河平均' },
    ],
    e: [
      { value: 0.55, name: '上游（白鹤）' },
      { value: 0.58, name: '下游（武宁路桥）' },
      { value: 0.56, name: '全河平均' },
    ],
  },
  {
    year: 2007,
    a: [
      { value: 16, name: '上游（白鹤）' },
      { value: 22, name: '下游（武宁路桥）' },
      { value: 19, name: '全河平均' },
    ],
    b: [
      { value: 6.3, name: '上游（白鹤）' },
      { value: 6.4, name: '下游（武宁路桥）' },
      { value: 6.2, name: '全河平均' },
    ],
    c: [
      { value: 1.65, name: '上游（白鹤）' },
      { value: 1.75, name: '下游（武宁路桥）' },
      { value: 1.85, name: '全河平均' },
    ],
    d: [
      { value: 4.9, name: '上游（白鹤）' },
      { value: 5, name: '下游（武宁路桥）' },
      { value: 4.9, name: '全河平均' },
    ],
    e: [
      { value: 0.54, name: '上游（白鹤）' },
      { value: 0.57, name: '下游（武宁路桥）' },
      { value: 0.55, name: '全河平均' },
    ],
  },
  {
    year: 2008,
    a: [
      { value: 15, name: '上游（白鹤）' },
      { value: 21, name: '下游（武宁路桥）' },
      { value: 18, name: '全河平均' },
    ],
    b: [
      { value: 6.3, name: '上游（白鹤）' },
      { value: 6.4, name: '下游（武宁路桥）' },
      { value: 6.2, name: '全河平均' },
    ],
    c: [
      { value: 1.64, name: '上游（白鹤）' },
      { value: 1.74, name: '下游（武宁路桥）' },
      { value: 1.84, name: '全河平均' },
    ],
    d: [
      { value: 4.95, name: '上游（白鹤）' },
      { value: 5.05, name: '下游（武宁路桥）' },
      { value: 4.95, name: '全河平均' },
    ],
    e: [
      { value: 0.57, name: '上游（白鹤）' },
      { value: 0.55, name: '下游（武宁路桥）' },
      { value: 0.56, name: '全河平均' },
    ],
  },
  {
    year: 2009,
    a: [
      { value: 14.5, name: '上游（白鹤）' },
      { value: 20.5, name: '下游（武宁路桥）' },
      { value: 17.5, name: '全河平均' },
    ],
    b: [
      { value: 6.3, name: '上游（白鹤）' },
      { value: 6.4, name: '下游（武宁路桥）' },
      { value: 6.2, name: '全河平均' },
    ],
    c: [
      { value: 1.63, name: '上游（白鹤）' },
      { value: 1.73, name: '下游（武宁路桥）' },
      { value: 1.83, name: '全河平均' },
    ],
    d: [
      { value: 4.75, name: '上游（白鹤）' },
      { value: 5.85, name: '下游（武宁路桥）' },
      { value: 4.8, name: '全河平均' },
    ],
    e: [
      { value: 0.52, name: '上游（白鹤）' },
      { value: 0.55, name: '下游（武宁路桥）' },
      { value: 0.54, name: '全河平均' },
    ],
  },
  {
    year: 2010,
    a: [
      { value: 14, name: '上游（白鹤）' },
      { value: 20, name: '下游（武宁路桥）' },
      { value: 17, name: '全河平均' },
    ],
    b: [
      { value: 6.1, name: '上游（白鹤）' },
      { value: 6.2, name: '下游（武宁路桥）' },
      { value: 6, name: '全河平均' },
    ],
    c: [
      { value: 1.62, name: '上游（白鹤）' },
      { value: 1.72, name: '下游（武宁路桥）' },
      { value: 1.82, name: '全河平均' },
    ],
    d: [
      { value: 4.7, name: '上游（白鹤）' },
      { value: 5.8, name: '下游（武宁路桥）' },
      { value: 4.75, name: '全河平均' },
    ],
    e: [
      { value: 0.55, name: '上游（白鹤）' },
      { value: 0.56, name: '下游（武宁路桥）' },
      { value: 0.55, name: '全河平均' },
    ],
  },
  {
    year: 2011,
    a: [
      { value: 13.5, name: '上游（白鹤）' },
      { value: 19.5, name: '下游（武宁路桥）' },
      { value: 16.5, name: '全河平均' },
    ],
    b: [
      { value: 6.1, name: '上游（白鹤）' },
      { value: 6.2, name: '下游（武宁路桥）' },
      { value: 6, name: '全河平均' },
    ],
    c: [
      { value: 1.61, name: '上游（白鹤）' },
      { value: 1.71, name: '下游（武宁路桥）' },
      { value: 1.81, name: '全河平均' },
    ],
    d: [
      { value: 5.1, name: '上游（白鹤）' },
      { value: 5.2, name: '下游（武宁路桥）' },
      { value: 5.1, name: '全河平均' },
    ],
    e: [
      { value: 0.54, name: '上游（白鹤）' },
      { value: 0.56, name: '下游（武宁路桥）' },
      { value: 0.55, name: '全河平均' },
    ],
  },
  {
    year: 2012,
    a: [
      { value: 13, name: '上游（白鹤）' },
      { value: 19, name: '下游（武宁路桥）' },
      { value: 16, name: '全河平均' },
    ],
    b: [
      { value: 6.3, name: '上游（白鹤）' },
      { value: 6.4, name: '下游（武宁路桥）' },
      { value: 6.2, name: '全河平均' },
    ],
    c: [
      { value: 1.6, name: '上游（白鹤）' },
      { value: 1.7, name: '下游（武宁路桥）' },
      { value: 1.8, name: '全河平均' },
    ],
    d: [
      { value: 4.9, name: '上游（白鹤）' },
      { value: 5, name: '下游（武宁路桥）' },
      { value: 4.92, name: '全河平均' },
    ],
    e: [
      { value: 0.54, name: '上游（白鹤）' },
      { value: 0.56, name: '下游（武宁路桥）' },
      { value: 0.55, name: '全河平均' },
    ],
  },
  {
    year: 2013,
    a: [
      { value: 12.5, name: '上游（白鹤）' },
      { value: 18.8, name: '下游（武宁路桥）' },
      { value: 15.65, name: '全河平均' },
    ],
    b: [
      { value: 6.1, name: '上游（白鹤）' },
      { value: 6.2, name: '下游（武宁路桥）' },
      { value: 6, name: '全河平均' },
    ],
    c: [
      { value: 1.59, name: '上游（白鹤）' },
      { value: 1.69, name: '下游（武宁路桥）' },
      { value: 1.79, name: '全河平均' },
    ],
    d: [
      { value: 3.5, name: '上游（白鹤）' },
      { value: 4, name: '下游（武宁路桥）' },
      { value: 3.62, name: '全河平均' },
    ],
    e: [
      { value: 0.56, name: '上游（白鹤）' },
      { value: 0.58, name: '下游（武宁路桥）' },
      { value: 0.57, name: '全河平均' },
    ],
  },
  {
    year: 2014,
    a: [
      { value: 11, name: '上游（白鹤）' },
      { value: 18.5, name: '下游（武宁路桥）' },
      { value: 14.75, name: '全河平均' },
    ],
    b: [
      { value: 6.1, name: '上游（白鹤）' },
      { value: 6.2, name: '下游（武宁路桥）' },
      { value: 6, name: '全河平均' },
    ],
    c: [
      { value: 1.55, name: '上游（白鹤）' },
      { value: 1.65, name: '下游（武宁路桥）' },
      { value: 1.75, name: '全河平均' },
    ],
    d: [
      { value: 2.82, name: '上游（白鹤）' },
      { value: 3.15, name: '下游（武宁路桥）' },
      { value: 2.88, name: '全河平均' },
    ],
    e: [
      { value: 0.57, name: '上游（白鹤）' },
      { value: 0.59, name: '下游（武宁路桥）' },
      { value: 0.58, name: '全河平均' },
    ],
  },
  {
    year: 2015,
    a: [
      { value: 10, name: '上游（白鹤）' },
      { value: 18.2, name: '下游（武宁路桥）' },
      { value: 14.1, name: '全河平均' },
    ],
    b: [
      { value: 4.8, name: '上游（白鹤）' },
      { value: 4.9, name: '下游（武宁路桥）' },
      { value: 4.85, name: '全河平均' },
    ],
    c: [
      { value: 1.58, name: '上游（白鹤）' },
      { value: 1.68, name: '下游（武宁路桥）' },
      { value: 1.78, name: '全河平均' },
    ],
    d: [
      { value: 2.22, name: '上游（白鹤）' },
      { value: 2.45, name: '下游（武宁路桥）' },
      { value: 2.28, name: '全河平均' },
    ],
    e: [
      { value: 0.6, name: '上游（白鹤）' },
      { value: 0.65, name: '下游（武宁路桥）' },
      { value: 0.62, name: '全河平均' },
    ],
  },
  {
    year: 2016,
    a: [
      { value: 9, name: '上游（白鹤）' },
      { value: 18, name: '下游（武宁路桥）' },
      { value: 13.5, name: '全河平均' },
    ],
    b: [
      { value: 4.9, name: '上游（白鹤）' },
      { value: 5, name: '下游（武宁路桥）' },
      { value: 4.95, name: '全河平均' },
    ],
    c: [
      { value: 1.54, name: '上游（白鹤）' },
      { value: 1.64, name: '下游（武宁路桥）' },
      { value: 1.74, name: '全河平均' },
    ],
    d: [
      { value: 2.12, name: '上游（白鹤）' },
      { value: 2.35, name: '下游（武宁路桥）' },
      { value: 2.18, name: '全河平均' },
    ],
    e: [
      { value: 0.3, name: '上游（白鹤）' },
      { value: 0.35, name: '下游（武宁路桥）' },
      { value: 0.32, name: '全河平均' },
    ],
  },
  {
    year: 2017,
    a: [
      { value: 8, name: '上游（白鹤）' },
      { value: 17, name: '下游（武宁路桥）' },
      { value: 12.5, name: '全河平均' },
    ],
    b: [
      { value: 5.1, name: '上游（白鹤）' },
      { value: 5.2, name: '下游（武宁路桥）' },
      { value: 5.15, name: '全河平均' },
    ],
    c: [
      { value: 1.53, name: '上游（白鹤）' },
      { value: 1.63, name: '下游（武宁路桥）' },
      { value: 1.73, name: '全河平均' },
    ],
    d: [
      { value: 1.28, name: '上游（白鹤）' },
      { value: 1.38, name: '下游（武宁路桥）' },
      { value: 1.28, name: '全河平均' },
    ],
    e: [
      { value: 0.33, name: '上游（白鹤）' },
      { value: 0.35, name: '下游（武宁路桥）' },
      { value: 0.34, name: '全河平均' },
    ],
  },
  {
    year: 2018,
    a: [
      { value: 7, name: '上游（白鹤）' },
      { value: 16, name: '下游（武宁路桥）' },
      { value: 11.5, name: '全河平均' },
    ],
    b: [
      { value: 5.05, name: '上游（白鹤）' },
      { value: 5.15, name: '下游（武宁路桥）' },
      { value: 5.1, name: '全河平均' },
    ],
    c: [
      { value: 1.52, name: '上游（白鹤）' },
      { value: 1.62, name: '下游（武宁路桥）' },
      { value: 1.72, name: '全河平均' },
    ],
    d: [
      { value: 1.27, name: '上游（白鹤）' },
      { value: 1.37, name: '下游（武宁路桥）' },
      { value: 1.27, name: '全河平均' },
    ],
    e: [
      { value: 0.31, name: '上游（白鹤）' },
      { value: 0.33, name: '下游（武宁路桥）' },
      { value: 0.32, name: '全河平均' },
    ],
  },
  {
    year: 2019,
    a: [
      { value: 5, name: '上游（白鹤）' },
      { value: 15, name: '下游（武宁路桥）' },
      { value: 10, name: '全河平均' },
    ],
    b: [
      { value: 5.04, name: '上游（白鹤）' },
      { value: 5.14, name: '下游（武宁路桥）' },
      { value: 5.09, name: '全河平均' },
    ],
    c: [
      { value: 1.51, name: '上游（白鹤）' },
      { value: 1.61, name: '下游（武宁路桥）' },
      { value: 1.71, name: '全河平均' },
    ],
    d: [
      { value: 1.26, name: '上游（白鹤）' },
      { value: 1.36, name: '下游（武宁路桥）' },
      { value: 1.26, name: '全河平均' },
    ],
    e: [
      { value: 0.28, name: '上游（白鹤）' },
      { value: 0.3, name: '下游（武宁路桥）' },
      { value: 0.29, name: '全河平均' },
    ],
  },
  {
    year: 2020,
    a: [
      { value: 4, name: '上游（白鹤）' },
      { value: 14, name: '下游（武宁路桥）' },
      { value: 9, name: '全河平均' },
    ],
    b: [
      { value: 5.05, name: '上游（白鹤）' },
      { value: 5.15, name: '下游（武宁路桥）' },
      { value: 5.1, name: '全河平均' },
    ],
    c: [
      { value: 1.5, name: '上游（白鹤）' },
      { value: 1.6, name: '下游（武宁路桥）' },
      { value: 1.7, name: '全河平均' },
    ],
    d: [
      { value: 1.25, name: '上游（白鹤）' },
      { value: 1.35, name: '下游（武宁路桥）' },
      { value: 1.25, name: '全河平均' },
    ],
    e: [
      { value: 0.26, name: '上游（白鹤）' },
      { value: 0.28, name: '下游（武宁路桥）' },
      { value: 0.27, name: '全河平均' },
    ],
  },
]
