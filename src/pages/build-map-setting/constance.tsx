import * as Cesium from "cesium";
import DrawCountour from '@/utils/plugins/draw-multiple-shape-countour'
import MultipleShape from '@/utils/plugins/draw-multiple-shape'
import LineShape from '@/utils/plugins/draw-line-shape'
import DrawerText from '@/utils/plugins/draw-text'
import MeasureDistance from '@/utils/plugins/draw-measure-distance'
import ProfileAnalysis, { type pointMetaType } from '@/utils/plugins/draw-profile-analysis'
import type MultipleShapeCountour from '@/utils/plugins/draw-multiple-shape-countour'
import DrawBillboard from '@/utils/plugins/draw-billboard'
import DrawText from "@/utils/plugins/draw-text";
import type { cameraFlyParamsType, CommonMapInstanceType } from "@/components/common-map";

export type ProfileAnalysisWidget = {
  type: 'profileAnalysis',
  title: string,
  instance?: ProfileAnalysis
  points: {
    longitude: number
    latitude: number
    height?: number
  }[]
  params: {
    content?: string
    color?: string
    width?: number
  }
}

export type MeasureDistanceWidget = {
  type: 'messureDistance',
  title: string,
  instance?: MeasureDistance
  points: {
    longitude: number
    latitude: number
    height?: number
  }[]
  params: {
    content?: string
    color?: string
    width?: number
  }
}


export type MultipleShapeCountourWidget = {
  type: 'multipleShapeCountour',
  title: string,
  instance?: MultipleShapeCountour
  points: {
    longitude: number
    latitude: number
    height?: number
  }[]
  params: {
  }
}

export type MultipleShapeWidget = {
  type: 'multipleShape',
  title: string,
  instance?: MultipleShape
  points: {
    longitude: number
    latitude: number
    height?: number
  }[]
  params: {
  }
}

export type LineWidget = {
  type: 'line',
  title: string,
  instance?: LineShape
  points: {
    longitude: number
    latitude: number
    height?: number
  }[]
  params: {
    content?: string
    color?: string
    width?: number
  }
}

export type TextWidget = {
  type: 'text'
  title: string
  position: {
    longitude: number
    latitude: number
    height?: number
  }
  instance?: DrawerText
  params: {
    content?: string
    label?: string
    color?: string
    fontSize?: number
    outlineColor?: string
    outlineWidth?: number
    showBackground?: number
    backgroundColor?: string
    backgroundPaddingX?: number
    backgroundPaddingY?: number
  }
}

export type BillboardWidget = {
  type: 'billboard',
  title: string,
  position: {
    longitude: number
    latitude: number
    height?: number
  }
  instance?: DrawBillboard
  params: {
    scale?: number
    content?: string
  }
}

export type settingType = {
  mapMetadata: {
    id: number
    title: string
    desciption: string
    cover: string
  }
  initialView: {
    title?: string;
    destination: {
      longitude: number
      latitude: number
      height: number
    }
    orientation?: {
      heading: number
      pitch: number
      roll: number
    }
  }[]

  mapWidget: (LineWidget | TextWidget | BillboardWidget | MultipleShapeCountourWidget | MultipleShapeWidget | MeasureDistanceWidget | ProfileAnalysisWidget)[]
}

export const setting_default: settingType = {
  mapMetadata: {
    id: 1,
    title: '',
    desciption: '',
    cover: 'https://q3.itc.cn/images01/20251004/6b6104cb287743fa82808c060ab22f83.png',
  },
  initialView: [],
  mapWidget: []
}


export const transfromDestination = (destination: settingType['initialView'][0]['destination']) => {
  return Cesium.Cartesian3.fromDegrees(destination.longitude, destination.latitude, destination.height)
}

export const parseMapJson = (viewerRef: React.RefObject<Cesium.Viewer | null>, mapInstance: React.RefObject<CommonMapInstanceType | null>, options?: {
  onClickWidget?: (index: number) => void
}): settingType => {
  // 拿url的查询参数
  const query = new URLSearchParams(window.location.search)

  const id = Number(query.get('id'))

  if (!id) return setting_default

  const json = JSON.parse(localStorage.getItem('build-map-list') || '[]')

  const list = (Array.isArray(json) ? json : []) as settingType[]

  const params = {
    ...list.find(item => item.mapMetadata.id === id)
  } as settingType

  /* 先处理视角 */
  const initialViewParams: cameraFlyParamsType[] = params.initialView.map(item => {

    const current = item

    return {
      destination: transfromDestination(current.destination),
      orientation: current.orientation
    }

  })

  mapInstance.current?.executeFlySequence(initialViewParams)

  /* 处理地图组件 */
  params.mapWidget = params.mapWidget.map((item, index) => {

    if (item.type === 'line') {
      const { points, params } = item

      const instance = new LineShape(viewerRef.current!, {
        ...params,
        onClick(ref) {
          if (options?.onClickWidget) {
            options.onClickWidget(index)
          }
        }
      })

      instance.creatFinalShape(points.map(item => {
        return Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude)
      }))

      item.instance = instance

      return {
        ...item,
        instance: instance,
      }
    }

    if (item.type === 'text') {
      const { position, params } = item

      const instance = new DrawText(viewerRef.current!, {
        label: item.params.label,
        ...params,
        onClick(ref) {
          if (options?.onClickWidget) {
            options.onClickWidget(index)
          }
        }
      })

      item.instance = instance

      instance.createFinalTextEntity(Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.height))

      return {
        ...item,
        instance: instance,
      }
    }

    if (item.type === 'billboard') {
      const { position, params } = item

      const instance = new DrawBillboard(viewerRef.current!, {
        ...params,
        onClick(ref) {
          if (options?.onClickWidget) {
            options.onClickWidget(index)
          }
        }
      })

      item.instance = instance

      instance.createFinalbBillboardEntity(Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.height))

      return {
        ...item,
        instance: instance,
      }
    }

    return item
  })

  return params
}




// ========== 第一步：定义核心Entity类型（数组项类型） ==========
/**
 * Geo类型配置（对应原GeoJSON加载逻辑）
 */
type GeoEntity = {
  type: 'geo';
  url: string;
  geoOptions?: Cesium.GeoJsonDataSource.LoadOptions;
  callbacks?: {
    loadedDataCallback?: (data: any, dataSource: Cesium.GeoJsonDataSource) => void;
    useFetchOnlyCallback?: (data: any) => void;
  };
};

/**
 * Text类型配置（文字实体）
 */
type TextEntity = {
  type: 'text';
  position: Cesium.Cartesian3;
  text: string;
  fontSize?: number;
  labelOptions?: Partial<Cesium.LabelGraphics.ConstructorOptions>;
};

/**
 * Billboard类型配置（广告牌/图片实体）
 */
type BillboardEntity = {
  type: 'billboard';
  image: string;
  position: Cesium.Cartesian3;
  billboardOptions?: Partial<Cesium.BillboardGraphics.ConstructorOptions>;
  properties?: Record<string, any>;
};

/**
 * 统一的Entity项类型（联合类型，数组项只能是geo/text/billboard之一）
 */
type DrawEntityItem = GeoEntity | TextEntity | BillboardEntity;

/**
 * 最终暴露的参数类型（极简）
 */
type DrawGeometryParams = {
  show: boolean;
  viewerRef: React.RefObject<Cesium.Viewer | null>
  entityRef: React.RefObject<Cesium.Entity[]>
  entities: DrawEntityItem[]; // 核心：包含geo/text/billboard的数组
};

// ========== 第二步：抽离工具函数（复用+单一职责） ==========
/**
 * 校验Viewer实例有效性
 */
const validateViewer = (viewerRef: React.RefObject<Cesium.Viewer | null>): Cesium.Viewer => {
  if (!viewerRef.current) {
    throw new Error('Cesium Viewer实例未初始化，请检查viewerRef');
  }
  return viewerRef.current;
};

/**
 * 创建单个Text实体
 */
const createSingleTextEntity = (
  textItem: TextEntity,
  viewer: Cesium.Viewer,
  entityRef: DrawGeometryParams['entityRef']
) => {
  const labelColor = textItem.labelOptions!.outlineColor || Cesium.Color.BLACK;
  const textEntity = viewer.entities.add({
    position: textItem.position,
    label: {
      text: textItem.text,
      font: `${textItem.fontSize || 16}px sans-serif`,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      outlineColor: labelColor,
      fillColor: Cesium.Color.WHITE,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      ...textItem.labelOptions,
    },
  });
  entityRef.current?.push(textEntity);
};

/**
 * 创建单个Billboard实体
 */
const createSingleBillboardEntity = (
  billboardItem: BillboardEntity,
  viewer: Cesium.Viewer,
  entityRef: DrawGeometryParams['entityRef']
) => {
  const billboardEntity = viewer.entities.add({
    properties: { position: billboardItem.position, ...billboardItem.properties },
    position: billboardItem.position,
    billboard: {
      image: window.$$prefix + billboardItem.image,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      ...billboardItem.billboardOptions,
    },
  });
  entityRef.current?.push(billboardEntity);
};

/**
 * 加载单个Geo实体（GeoJSON）
 */
const loadSingleGeoEntity = async (
  geoItem: GeoEntity,
  viewer: Cesium.Viewer,
  entityRef: DrawGeometryParams['entityRef']
) => {
  try {
    const res = await fetch(window.$$prefix + geoItem.url);
    const data = await res.json();

    // 仅获取数据不渲染
    if (typeof geoItem.callbacks?.useFetchOnlyCallback === 'function') {
      geoItem.callbacks.useFetchOnlyCallback(data);
      return;
    }

    // 加载GeoJSON到Cesium
    const dataSource = await Cesium.GeoJsonDataSource.load(data, {
      markerSymbol: 'circle',
      ...geoItem.geoOptions,
    });
    viewer.dataSources.add(dataSource);
    entityRef.current?.push(...dataSource.entities.values);

    // 触发加载完成回调
    geoItem.callbacks?.loadedDataCallback?.(data, dataSource);
  } catch (error) {
    console.error(`GeoJSON加载失败（url: ${geoItem.url}）:`, error);
  }
};

// ========== 第三步：极简参数的主函数 ==========
/**
 * 渲染Cesium几何图形（极简参数版）
 * @param show 是否显示实体
 * @param viewerRef Cesium Viewer实例引用
 * @param entityRef 实体管理引用（用于显示/隐藏/销毁）
 * @param entities 实体配置数组（包含geo/text/billboard类型）
 */
export const drawEntity = (
  show: boolean,
  viewerRef: DrawGeometryParams['viewerRef'],
  entityRef: DrawGeometryParams['entityRef'],
  entities: DrawEntityItem[] = []
) => {
  // ========== 1. 显示/隐藏逻辑（核心分支） ==========
  if (show) {
    // 已有实体：直接显示
    if (entityRef.current?.length) {
      entityRef.current.forEach(item => {
        item.show = true;
      });
      return;
    }

    try {
      // 校验Viewer实例
      const viewer = validateViewer(viewerRef);

      // ========== 2. 遍历entity数组，按类型创建实体 ==========
      entities.forEach(entityItem => {
        switch (entityItem.type) {
          case 'text':
            createSingleTextEntity(entityItem, viewer, entityRef);
            break;
          case 'billboard':
            createSingleBillboardEntity(entityItem, viewer, entityRef);
            break;
          case 'geo':
            loadSingleGeoEntity(entityItem, viewer, entityRef);
            break;
          default:
            console.warn(`未知的实体类型: ${(entityItem as any).type}`);
        }
      });
    } catch (error) {
      console.error('几何图形渲染失败:', error);
    }
  } else {
    // 隐藏逻辑：遍历所有实体设置为隐藏
    entityRef.current?.forEach(item => {
      item.show = false;
    });
  }
};