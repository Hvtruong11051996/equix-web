import React from 'react';
import logger from '../../helper/log';
import SvgIcon, { path } from '../Inc/SvgIcon'
import { translate, Trans } from 'react-i18next';
const arrKeyboard = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'delete']
class KeyBoardNumber extends React.Component {
    mapKeyBoard() {
        const keyboard = arrKeyboard.map((item, index) => {
            return (<div onClick={() => this.handleKeyBoard(item)} key={index} className={`btnNumKeyBoard ${item === null ? 'myHidden' : ''}`}>
                {item || item === 0 ? (item === 'delete' ? <SvgIcon path={path.mdiBackspace} fill='var(--secondary-default)' /> : item) : ''}
            </div>);
        })
        return keyboard;
    }
    handleKeyBoard(item) {
        this.props.getDataByKeyBoard && this.props.getDataByKeyBoard(item)
    }
    render() {
        try {
            return (
                <div className='keyBoardRoot'>{this.mapKeyBoard()}</div>
            );
        } catch (error) {
            logger.error('render on KeyBoardNumber' + error);
        }
    }
}

export default translate('translations')(KeyBoardNumber);
