import React from 'react';
import Lang from '../../Inc/Lang';
import Icon from '../../Inc/Icon';
import NoTag from '../../Inc/NoTag';
import ColorChooseOptions from '../../ColorChooseOptions/ColorChooseOptions';
import dataStorage from '../../../dataStorage';
import { func } from '../../../storage';
import { emitter, eventEmitter } from '../../../constants/emitter_enum'
import NumberInput from '../../Inc/NumberInput';
import { postData, getMarginLevelUrl } from '../../../helper/request';
import { mapError } from '../../../helper/functionUtils'
import Button, { buttonType } from '../../Elements/Button/Button';
import SvgIcon, { path } from '../SvgIcon/SvgIcon';
class PopupEditor extends React.Component {
    constructor(props) {
        super(props);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.valueOld = this.props.valueOld || (this.props.type === 'chooseColor' ? 0 : '')
        this.state = {
            connected: dataStorage.connected,
            error: '',
            value: '',
            isLoading: false
        }
    }

    hiddenWarning = () => {
        try {
            setTimeout(() => {
                this.setState({
                    error: '',
                    isLoading: false
                })
            }, 4000)
        } catch (error) {
            logger.error('hiddenWarning On PopupEditor ' + error)
        }
    }

    renderContent() {
        switch (this.props.type) {
            case 'inputNumber':
                return (
                    <NumberInput
                        className={`inputDrop size--3 cursor-text fullw100 padding-left8`}
                        decimal={2}
                        autoFocus={true}
                        value={this.state.value}
                        placeholder={this.props.placeholder || ''}
                        onChange={this.onChangeInput}
                    />
                )
            case 'inputText':
                return (
                    <textarea
                        className='input-text-email'
                        placeholder={this.props.placeholder || ''}
                        maxLength='255'
                        style={{ height: '48px', marginTop: 0, fontSize: '14px' }}
                        defaultValue={this.props.data || ''}
                        ref={dom => {
                            if (dom) {
                                setTimeout(() => {
                                    dom.focus()
                                }, 10);
                            }
                        }}
                        onChange={(event) => {
                            this.onChangeInput(event.target.value)
                        }}>
                    </textarea>
                )
            case 'chooseColor':
                return (
                    <NoTag>
                        <div className='text-capitalize'><Lang>{this.props.label || ''}</Lang></div>
                        <ColorChooseOptions
                            options={this.props.options}
                            rightAlign={true}
                            fixWidth={true}
                            value={this.props.value}
                            onChange={this.onChangeInput}
                        />
                    </NoTag>
                )
            default:
                break;
        }
    }

    renderFooter() {
        return <div className='footer confirmBtnRoot btn-group'>
            <Button type={buttonType.danger} disabled={!this.state.connected || this.state.isLoading} className='btn' onClick={() => {
                if (this.state.isLoading) return
                this.props.close()
            }
            }>
                <SvgIcon path={path.mdiClose} />
                <span className='text-uppercase'><Lang>lang_cancel</Lang></span>
            </Button>
            <Button type={buttonType.success} disabled={!this.state.connected || this.state.isLoading || (!this.state.value && this.state.value !== 0) || (this.valueOld === this.state.value)} className='btn' onClick={() => this.handleOnClickConfirm()}>
                {this.state.isLoading ? <img className="margin-right8" src='common/Spinner-white.svg' /> : <SvgIcon path={path.mdiCheck} />}
                <span className='text-uppercase'><Lang>lang_confirm</Lang></span>
            </Button>
        </div >
    }
    handleOnClickConfirm() {
        if ((!this.state.value && this.state.value !== 0) || (this.valueOld === this.state.value) || this.state.isLoading || !this.state.connected) return;
        switch (this.props.actionName) {
            case 'addNewMarginAction':
                this.addNewMarginAction()
                break;
            default:
                this.props.close && this.props.close()
                this.props.onChange && this.props.onChange(this.value)
                break;
        }
    }

    addNewMarginAction = () => {
        this.setState({
            isLoading: true
        })
        const levelUrl = getMarginLevelUrl();
        const dataValue = parseFloat(this.state.value);
        const dataBody = {
            data: {
                margin_value: dataValue
            }
        }
        postData(levelUrl, dataBody).then((e) => {
            this.props.onSuccess && this.props.onSuccess(e)
            this.props.close()
        }).catch((e) => {
            const error = (e.response && e.response.errorCode)
            this.setState({
                error: mapError(error),
                isLoading: false
            }, () => {
                this.hiddenWarning();
            })
        })
    }

    onChangeInput = (value) => {
        this.value = value;
        if (this.timeoutID) clearTimeout(this.timeoutID)
        this.timeoutID = setTimeout(() => {
            this.setState({
                value: value
            })
        }, 300);
    }

    changeConnection = connect => {
        this.setState({
            connected: connect
        })
    }
    componentDidMount() {
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection);
    }
    componentWillUnmount() {
        this.emitConnectionID && this.emitConnectionID.remove();
    }
    render() {
        return <div className='confirmUserGroupManagement editEmailAlert popupEditor'>
            <div className={`header text-center size--4 ${this.props.headerTextFixed ? '' : 'text-capitalize'}`}>{this.props.headerTextFixed || <Lang>{this.props.headerText}</Lang>}</div>
            {
                this.props.middleText
                    ? <div className='desc-header text-center size--3' style={{ marginTop: '8px' }}>
                        <Lang>{this.props.middleText}</Lang>
                    </div>
                    : null
            }
            <div className={`styleErrorPopup size--3 ${this.state.error ? '' : 'hidden'}`}><Lang>{this.state.error}</Lang></div>
            <div className='content size--3' style={{ paddingTop: '8px' }}>
                <div className='row'>
                    {this.renderContent()}
                </div>
            </div>
            {this.renderFooter()}
        </div>
    }
}

export default PopupEditor
