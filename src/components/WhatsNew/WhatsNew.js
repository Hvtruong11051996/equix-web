import React from 'react';
import Icon from '../Inc/Icon';
import { translate } from 'react-i18next';
import logger from '../../helper/log';
import Lang from '../Inc/Lang';
import config from '../../../public/config';
import dataStorage from '../../dataStorage';
import s from './WhatsNew.module.css'
import Button, { buttonType } from '../Elements/Button/Button';
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';
export class WhatsNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            animation: ''
        }
    }

    handleShowWhatsNew() {
        try {
            this.setState({
                animation: 'AccOpacityOut'
            })
            this.props.close();
        } catch (error) {
            logger.error('handleShowWhatsNew On handleShowWhatsNew' + error)
        }
    }

    handleClickOKButton() {
        try {
            localStorageNew.setItem('hideWhatsNew-' + config.version, 'true');
            this.props.close();
        } catch (error) {
            logger.error('handleClickOKButton On handleShowWhatsNew' + error)
        }
    }

    importData() {
        try {
            let data = '';
            const folder = dataStorage.env_config.roles.showWhatsNewFu ? 'WhatsNewFu' : 'WhatsNew';
            data = (function () {
                try {
                    return require('../../../public/' + folder + '/data_' + this.props.i18n.language + '.json')
                } catch (ex) {
                    return '';
                }
            })();
            if (!data) data = require('../../../public/' + folder + '/data_en.json');
            return data;
        } catch (error) {
            logger.error(error)
        }
    }

    renderContent() {
        const folder = dataStorage.env_config.roles.showWhatsNewFu ? 'WhatsNewFu' : 'WhatsNew';
        try {
            const data = this.importData() || [];
            return data.map((item, index) => (
                <div className={`whatsNewRow ${index % 2 === 0 ? 'odd' : ''}`} key={index}>
                    <div>
                        <img src={`${folder}/${item.img}?ver=${config.version}`} height='118px' width='240px' />
                    </div>
                    <div className='whatsNewText'>
                        <div className='title size--4'>
                            {item.title}
                        </div>
                        <div className='content size--3'>
                            {item.content}
                        </div>
                    </div>
                </div>
            ))
        } catch (error) {
            logger.error('renderContent On handleShowWhatsNew' + error)
        }
    }
    /* istanbul ignore next */
    render() {
        try {
            return (
                <div className={`whatsNew ${this.state.animation}`} ref={dom => dom && dom.parentNode.classList.add('fixed')} >
                    <div className='whatsNewContainer'>
                        <div className='whatsNewHeader size--4 text-capitalize' >
                            <div><Lang>lang_whats_new</Lang></div>
                            <div onClick={this.handleShowWhatsNew.bind(this)}>
                                <Icon
                                    src={'navigation/close'}
                                    color='var(--secondary-default)'
                                    style={{ width: 20, height: 20 }}
                                />
                            </div>
                        </div>
                        <div className='whatsNewContent'>
                            {this.renderContent()}
                        </div>
                        <div className='whatsNewFooter btn-group'>
                            <Button type={buttonType.ascend} className={`btn fs15 size--4 ${s.clWhite}`} onClick={this.handleClickOKButton.bind(this)}>
                                <SvgIcon path={path.mdiCheck} />
                                <span className='text-uppercase'><Lang>lang_ok</Lang></span>
                            </Button>
                        </div>
                    </div>
                </div>
            )
        } catch (error) {
            logger.error('render On handleShowWhatsNew' + error)
        }
    }

    handlePressEnter(e) {
        if (e.key === 'Enter') {
            this.handleClickOKButton()
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handlePressEnter.bind(this))
        document.body.classList.add('showingWhatsNew');
    }

    componentWillMount() {
        this.setState({
            animation: 'AccOpacityIn'
        });
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handlePressEnter.bind(this))
        document.body.classList.remove('showingWhatsNew');
    }
}

export default translate('translations')(WhatsNew)
