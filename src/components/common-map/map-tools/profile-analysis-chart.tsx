import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { type DrawerProps } from 'antd'
import type { pointMetaType } from '@/utils/plugins/draw-profile-analysis';
import type ProfileAnalysis from '@/utils/plugins/draw-profile-analysis';

type ProfileAnalysisChartPropsType = {
  index: number;
  data: pointMetaType[]
  instance: ProfileAnalysis
  placement: DrawerProps['placement']
  profileAnalysisMetaData: { data: pointMetaType[]; type: string; instance: ProfileAnalysis }[]
}

const ProfileAnalysisChart: React.FC<ProfileAnalysisChartPropsType> = (props) => {

  const { data, index, instance, placement, profileAnalysisMetaData } = props

  const domInstance = useRef<HTMLDivElement>(null)

  const chartInstance = useRef<echarts.ECharts>(null)
  // 保存resize回调的引用，方便后续移除
  const resizeHandler = useRef<() => void>(() => { })
  const initCharts = () => {
    const chartDom = domInstance.current

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartDom, 'dark');
    }

    chartInstance.current!.resize()
    chartInstance.current.resize()

    // 2. 先移除旧的事件监听，避免重复绑定
    chartInstance.current.off('showtip')
    chartInstance.current.off('hidetip')

    const option = {
      color: ['#80FFA5'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function (params: { dataIndex: number, marker: string }[]) {
          const chartMetaData = params[0]

          const current = data[chartMetaData.dataIndex]

          return `
          <div>${chartMetaData.marker} 当前点位</div>
          <div>经度：${current.longitude < 0 ? '西' : '东'}经${current.longitude}</div>
          <div>纬度：${current.latitude < 0 ? '南' : '北'}纬${current.latitude}</div>
          <div>距离起点：${current.distanceFromStartTostring} 米</div>
          <div>海拔：${current.heightTostring} 米</div>
          `
        }
      },
      legend: {
        data: ['分析结果']
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: data.map(item => item.distanceFromStartTostring),
          name: '距离起点（米）',
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '高度（米）',
        }
      ],
      series: [
        {
          name: '分析结果',
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 0
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgb(128, 255, 165)'
              },
              {
                offset: 1,
                color: 'rgb(1, 191, 236)'
              }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.heightTostring)
        },
      ]
    };

    chartInstance.current.setOption(option, true);

    // 监听 tooltip 显示事件
    chartInstance.current.on('showtip', function (params: any) {

      const current = data[params.dataIndex]

      instance.updateSlideEntityPostion(current.longitude, current.latitude, current.height)
    });

    chartInstance.current.on('hidetip', function (params: any) {
      instance.updateSlideEntityPostion(false)
    });

    // 5. 处理resize事件：先移除旧的，再添加新的
    window.removeEventListener('resize', resizeHandler.current)
    resizeHandler.current = () => {
      chartInstance.current?.resize()
    }
  }

  useEffect(() => {
    initCharts()

    // 6. 组件卸载/依赖变化时的清理函数
    return () => {
      // 移除resize监听
      window.removeEventListener('resize', resizeHandler.current)
      // 销毁ECharts实例，移除所有事件监听
      if (chartInstance.current) {
        chartInstance.current.off('showtip')
        chartInstance.current.off('hidetip')
        chartInstance.current.dispose()
        chartInstance.current = null
      }
    }
  }, [data, placement, index])

  return <>
    <h4>第{profileAnalysisMetaData.length - index}次分析结果</h4>
    <br />
    <div key={index} style={{ width: '100%', height: 'calc(100% - 20px)', minHeight: 250, maxHeight: 400 }} ref={domInstance}></div>
    <br />
  </>

}

export default ProfileAnalysisChart