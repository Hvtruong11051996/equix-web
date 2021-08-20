import React from 'react'
import dataStorage from '../../dataStorage'
import Icon from '../Inc/Icon/Icon'
import Lang from '../Inc/Lang/Lang'
import Item from './ItemLayout'

export default class Layout extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeLayout: props.getActiveLayout && props.getActiveLayout(),
            listData: props.listData || []
        }
    }

    onChangeLayout = (id) => {
        this.props.onChangeLayout && this.props.onChangeLayout(id)
    }

    renderLayoutDefault() {
        const isActive = this.state.activeLayout === 'default_template'
        return <Item isActive={isActive}
            label='lang_default_template'
            iconName='action/view-quilt'
            onChangeLayout={this.onChangeLayout}
            id='default_template' />
    }

    deleteLayout = (id) => {
        this.props.deleteLayout && this.props.deleteLayout(id)
    }

    updateLayout = (id, layoutName = '') => {
        this.props.updateLayout && this.props.updateLayout(id, layoutName)
    }

    createNewLayout = (layoutName = '') => {
        this.props.createNewLayout && this.props.createNewLayout(layoutName)
    }

    renderItem(e, i) {
        const isActive = this.state.activeLayout === e.key
        return <Item isActive={isActive}
            listExited={this.listExited}
            key={e.key}
            label={e.layout_name || ''}
            iconName='social/person'
            deleteLayout={this.deleteLayout}
            updateLayout={this.updateLayout}
            onChangeLayout={this.onChangeLayout}
            id={e.key} />
    }

    renderListLayout() {
        const listFixed = ['Default Template', 'Save Template']
        const name = this.state.listData.reduce((acc, cur) => {
            acc.push(cur.layout_name)
            return acc
        }, [])
        this.listExited = [...listFixed, ...name]
        return (
            this.state.listData.map((e, i) => {
                return this.renderItem(e, i)
            })
        )
    }

    renderSaveLayout() {
        return <Item label='lang_save_template'
            iconName='content/save'
            listExited={this.listExited}
            createNewLayout={this.createNewLayout}
            id='save_template' />
    }

    render() {
        return <div className='listContentLayoutDropdown'>
            {this.renderLayoutDefault()}
            {this.renderListLayout()}
            {this.renderSaveLayout()}
        </div>
    }
}
