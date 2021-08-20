import React, { Component } from 'react'
import Icon from '../Icon/Icon'
import NoTag from '../NoTag/NoTag'
import Lang from '../../Inc/Lang'
import uuidv4 from 'uuid/v4'
import logger from '../../../helper/log';

const transformArrowStyle = 'rotate(-90deg)'
const STEP_RANGE = 270

class Slider extends Component {
    state = { hidden: false, disableLeft: true, disableRight: false }

    handleClickArrow = direction => {
        if (!this.refSlider) return
        if (direction === 'left') {
            if (this.refSlider.scrollLeft <= STEP_RANGE) {
                this.setState({ disableLeft: true })
            }
            this.refSlider.scrollLeft -= STEP_RANGE
            this.setState({ disableRight: false })
            return
        }
        if (direction === 'right') {
            this.setState({ disableLeft: false })
            const before = this.refSlider.scrollLeft
            this.refSlider.scrollLeft += STEP_RANGE
            const after = this.refSlider.scrollLeft
            if (after === before) {
                this.setState({ disableRight: true })
            }
        }
    }

    getSliderSize = ({ widgetWidth = 0, leftContainerWidth = 0 }) => {
        const { brokerHeaderInstance } = this.props
        try {
            const rightContainerWidth = widgetWidth - leftContainerWidth - 100
            const childrenLength = this.getChildrenLength()
            if (childrenLength < rightContainerWidth) {
                this.setState({ hidden: true }, () => {
                    this.sliderContent && (this.sliderContent.style.width = '100%')
                    brokerHeaderInstance && brokerHeaderInstance.style && (brokerHeaderInstance.style.flexWrap = '')
                })
                return
            }
            if (rightContainerWidth < 160) {
                this.setState({ hidden: false }, () => {
                    this.sliderContent && (this.sliderContent.style.width = widgetWidth - 56 + 'px')
                    brokerHeaderInstance && brokerHeaderInstance.style && (brokerHeaderInstance.style.flexWrap = 'wrap')
                })
                return
            }
            this.setState({ hidden: false }, () => {
                this.sliderContent && (this.sliderContent.style.width = rightContainerWidth + 'px')
                brokerHeaderInstance && brokerHeaderInstance.style && (brokerHeaderInstance.style.flexWrap = '')
            })
        } catch (error) {
            logger.log(`Error while get slider size: ${error}`)
            return 0
        }
    }

    getChildrenLength = () => {
        const items = this.refSlider && this.refSlider.querySelectorAll('.slider-item')
        let result = 0
        Array.from(items).map(item => {
            result += item.clientWidth
        })
        return result
    }

    render() {
        const { hidden, disableLeft, disableRight } = this.state
        return (
            <div className='slider-wrap'>
                <div
                    className={`slider-left-arrow ${hidden ? 'hidden' : ''}`}
                    onClick={() => this.handleClickArrow('left')}
                >
                    <Icon
                        src='navigation/arrow-drop-up'
                        style={{ transform: transformArrowStyle, fill: disableLeft ? 'rgba(197, 203, 206, 0.54)' : 'var(--secondary-default)' }}
                    />
                </div>
                <div className='slider-content' ref={dom => this.sliderContent = dom}>
                    <div className='slider-inner' ref={dom => this.refSlider = dom}>
                        {this.props.items.map(item => {
                            if (item) {
                                return (
                                    <div key={uuidv4()} className='slider-item'>
                                        <div className='slider-item-label text-capitalize'><Lang>{item.label}</Lang>:</div>
                                        <div className='slider-item-val'>{item.component}</div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
                <div
                    className={`slider-right-arrow ${hidden ? 'hidden' : ''}`}
                    onClick={() => this.handleClickArrow('right')}
                >
                    <Icon
                        src='navigation/arrow-drop-down'
                        style={{ transform: transformArrowStyle, fill: disableRight ? 'rgba(197, 203, 206, 0.54)' : 'var(--secondary-default)' }} />
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.getSliderSize(this.props)
    }

    componentWillReceiveProps(nextProps) {
        this.getSliderSize(nextProps)
    }
}

export default Slider
