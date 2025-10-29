import React, { useState, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { Button, Modal, Select, Tooltip } from 'antd'
import classNames from 'classnames'

type FishChartsPropsType = {
  year: number
  chartsContainerStyle?: React.CSSProperties
}

const FishCharts: React.FC<FishChartsPropsType> = (props) => {
  const [modal, modalContext] = Modal.useModal();

  const { year, chartsContainerStyle } = props

  const instance = useRef<HTMLDivElement>(null)

  const chartInstance = useRef<echarts.ECharts>(null)

  const [folder, setFolder] = useState<boolean>(false)

  const initCharts = () => {
    const chartDom = instance.current

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartDom, 'dark');
    }

    chartInstance.current!.resize()

    const yearList = ['2001', '2006', '2019',]

    const dataYear = yearList.filter(item => Number(item) <= year)

    const option = {
      legend: {
        top: '5px',
        left: '10px',
        data: yearList
      },
      /*       tooltip: {}, */
      grid: {
        left: '1%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      dataset: {
        source: [
          ['product'].concat(yearList),
          ...[
            ['赵屯', 1, 0, 22],
            ['白鹤', 33, 27, 23],
            ['黄渡', 27, 15, 33],
            ['封浜河口', 14, 0, 26],
            ['北新泾', 4, 0, 17],
            ['中山西路桥', 4, 0, 11],
            ['武宁路桥', 7, 0, 9],
            ['昌化路桥', 0, 0, 11],
            ['成都路桥', 4, 0, 6],
            ['外白渡桥', 3, 0, 13]].map(item => {
              return [item[0]].concat(item.slice(1, 1 + yearList.length))
            })
        ]
      },
      xAxis: { type: 'category', axisLabel: { color: '#fff', fontSize: 11, rotate: 45, interval: 0, } },
      yAxis: {
        interval: 5,
        min: 0,
        max: 35,
        name: '物种数'
      },
      // Declare several bar series, each will be mapped
      // to a column of dataset.source by default.
      series: dataYear.map(item => {
        return { type: 'bar' }
      })
    };

    chartInstance.current.setOption(option, true);

    window.addEventListener('resize', () => {
      chartInstance.current!.resize()
    })
  }

  useEffect(() => {
    initCharts()

    if (!folder) {
      initCharts()
    }
  }, [year, folder])

  return <>
    {modalContext}
    <div className={classNames('project-item-charts', {
      'project-item-charts-hide': folder
    })} style={chartsContainerStyle}>
      {
        <div style={{ width: '100%', height: '100%', display: !folder ? 'block' : 'none' }}>
          <div style={{ width: '100%', height: 'calc(100% - 20px)' }} ref={instance}></div>
          <div style={{ fontSize: 10, color: '#a0a0a0' }}>相关数据来自doi: 10.17520/biods.2020067</div>
        </div>
      }
      {
        folder && <div className='project-item-charts-hide-title'>鱼类种类历年图标</div>
      }
      <div className='project-item-charts-folder' onClick={() => {
        setFolder(!folder)
      }}></div>
    </div >
  </>

}

export default FishCharts