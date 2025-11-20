import React, { useState, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { Button, Modal, Select, Tooltip, type DrawerProps } from 'antd'
import type { pointMetaType } from '@/utils/plugins/draw-profile-analysis';
import type ProfileAnalysis from '@/utils/plugins/draw-profile-analysis';

type ProfileAnalysisChartPropsType = {
  index: number;
  data: pointMetaType[]
  instance: ProfileAnalysis
  placement: DrawerProps['placement']
}

const ProfileAnalysisChart: React.FC<ProfileAnalysisChartPropsType> = (props) => {
  const [modal, modalContext] = Modal.useModal();

  const { data, index, instance, placement } = props

  console.log(data, index);


  const domInstance = useRef<HTMLDivElement>(null)

  const chartInstance = useRef<echarts.ECharts>(null)

  const initCharts = () => {
    const chartDom = domInstance.current

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartDom, 'dark');
    }

    chartInstance.current!.resize()


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

    window.addEventListener('resize', () => {
      chartInstance.current!.resize()
    })
  }

  useEffect(() => {
    initCharts()
  }, [data, placement])

  return <>
    {modalContext}
    <h4>第{index + 1}次分析结果</h4>
    <br />
    <div style={{ width: '100%', height: 'calc(100% - 20px)', minHeight: 250, maxHeight: 400 }} ref={domInstance}></div>
    <br />
  </>

}

export default ProfileAnalysisChart