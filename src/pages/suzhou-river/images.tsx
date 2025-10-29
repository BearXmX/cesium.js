import React, { useState, useEffect, useRef } from 'react'
import { Button, Carousel, Modal, Select, Tooltip } from 'antd'
import classNames from 'classnames'
import image1 from '@/assets/suzhou-river/group1-1.jpg'
import image2 from '@/assets/suzhou-river/group1-2.jpg'
import image3 from '@/assets/suzhou-river/group2-1.jpg'
import image4 from '@/assets/suzhou-river/group2-2.jpg'
import image5 from '@/assets/suzhou-river/group3-1.jpg'
import image6 from '@/assets/suzhou-river/group3-2.jpg'

type ImagesPropsType = {
  year: number
  chartsContainerStyle?: React.CSSProperties
}

const Images: React.FC<ImagesPropsType> = (props) => {
  const [modal, modalContext] = Modal.useModal();

  const { year, chartsContainerStyle } = props

  const [value, setValue] = useState<string>('a')

  const list = [
    {
      value: 'a', label: '组图1'
    },
    {
      value: 'b', label: '组图2'
    },
    {
      value: 'c', label: '组图3'
    },
  ]


  const [folder, setFolder] = useState<boolean>(false)

  const initCharts = (type: string) => {



  }

  useEffect(() => {
    initCharts('a')

    if (!folder) {
      initCharts('a')
    }
  }, [year, value, folder])

  return <>
    {modalContext}
    <div className={classNames('project-item-charts', {
      'project-item-charts-hide': folder
    })} style={chartsContainerStyle}>
      {
        <div style={{ width: '100%', height: '100%', display: !folder ? 'block' : 'none' }}>
          <div style={{ height: 35, display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
            <Select
              size='small'
              value={value}
              style={{ width: 100, transform: 'translateY(6px)', marginBottom: 10 }}
              options={list}
              onChange={(val) => {
                setValue(val)
              }}
            />
          </div>
          <div style={{ width: '100%', height: 'calc(100% - 40px)', position: 'relative', overflow: 'auto' }}>
            <Carousel key={value} style={{ height: '100%', width: '100%' }} autoplay autoplaySpeed={2000}>
              {
                [
                  {
                    src: image1,
                    value: 'a'
                  },
                  {
                    src: image2,
                    value: 'a'
                  },
                  {
                    src: image3,
                    value: 'b'
                  },
                  {
                    src: image4,
                    value: 'b'
                  },
                  {
                    src: image5,
                    value: 'c'
                  },
                  {
                    src: image6,
                    value: 'c'
                  },
                ].filter(item => item.value === value).map((item, index) => {

                  return <div style={{ width: '100%', height: '100%' }}>
                    <img src={item.src} style={{ margin: '0 auto' }} alt="" />
                  </div>
                })
              }

              {/*               {
                [
                  {
                    src: image1,
                    value: 'a'
                  },
                  {
                    src: image2,
                    value: 'a'
                  },
                  {
                    src: image3,
                    value: 'b'
                  },
                  {
                    src: image4,
                    value: 'b'
                  },
                  {
                    src: image5,
                    value: 'c'
                  },
                  {
                    src: image6,
                    value: 'c'
                  },
                ].filter(item => item.value === value).map((item, index) => {
                  const zIndex = index

                  const style: any = {
                    width: '100%',
                    opacity: index === 1 ? 0 : 1,
                  }

                  const className = index === 1 ? 'project-item-charts-image' : 'project-item-charts-image project-item-charts-image-animate'

                  return <div className={className} style={{ position: 'absolute', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', zIndex, height: '100%', ...style }}>
                    <img src={item.src} key={item.src} style={{
                      objectFit: 'cover',
                      position: 'absolute',
                      maxHeight: '100%',
                      maxWidth: '100%',
                    }} />
                  </div>
                })
              } */}
            </Carousel>



          </div>
        </div>
      }
      {
        folder && <div className='project-item-charts-hide-title'>苏州河治理成果</div>
      }
      <div className='project-item-charts-folder' onClick={() => {
        setFolder(!folder)
      }}></div>
    </div >
  </>

}

export default Images