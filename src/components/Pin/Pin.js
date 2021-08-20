import React from 'react';
import logger from '../../helper/log';
import KeyBoardNumber from './KeyBoardNumber';
import { translate } from 'react-i18next';
import dataStorage from '../../dataStorage';
import warning from '../Inc/Warning';
import { postDecode, autoRefreshToken, postRefresh } from '../../helper/api';
import { afterLogin } from '../../helper/loginFunction';
import { registerUser } from '../../streaming';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import { func } from '../../storage';
import Icon from '../Inc/Icon';
import showModal from '../Inc/Modal';
import consfirm from '../Inc/Confirm';
import Settings from '../Settings';
import { logout, saveDataWhenChangeEnv } from '../../helper/functionUtils';
import Lang from '../Inc/Lang';

class Pin extends React.Component {
    constructor(props) {
        super(props);
        this.isMount = false;
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.lstStep = [
            'step1',
            'step2',
            'step3'
        ];
        if (this.props.title === 'firstLogin' && this.props.success) {
            this.lstStep = [
                'step1'
            ]
        } else if (this.props.title === 'firstLogin' && this.props.done) {
            this.lstStep = [
                'step2',
                'step3'
            ]
        } else if (this.props.title === 'Change PIN Old PIN') {
            this.lstStep = [
                'step1',
                'step2',
                'step3'
            ]
        } else if (this.props.title === 'Forgot PIN New PIN') {
            this.lstStep = [
                'step2',
                'step3'
            ]
        }
        const countFailedPIN = parseFloat(localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : '')) || '0')
        this.state = {
            isConnected: dataStorage.connected,
            error: dataStorage.connected ? null : 'lang_no_internet_connection',
            count: countFailedPIN,
            confirm: false,
            matchOldPIN: countFailedPIN > 0 ? 'not match' : '',
            step1: {
                header: this.props.title === 'firstLogin' ? 'lang_enter_your_pin' : 'lang_enter_your_current_pin',
                title: null,
                description: this.renderDescriptionContent()
            },
            step2: {
                header: ({ 'firstLogin': 'lang_set_pin', 'Change PIN Old PIN': 'lang_enter_your_new_pin', 'Forgot PIN New PIN': 'lang_enter_your_new_pin' })[this.props.title],
                title: null,
                description: this.props.title === 'firstLogin' ? <Lang>lang_first_set_pin_description</Lang> : ''
            },
            step3: {
                header: 'lang_confirm_your_new_pin',
                title: null,
                description: ''
            },
            step: this.lstStep[0],
            animationClass: '',
            flag: '',
            successAlert: ''
        };
        this.count = 0;
        this.lst = [1, 2, 3, 4, 5, 6];
        this.inputRef = this.inputRef.bind(this)
        this.disable = 'disable'
    }

    renderDescriptionContent() {
        if (this.props.title === 'firstLogin') {
            return <div className='forgotPIN' >
                <span onClick={this.handleForgotPIN.bind(this)}><Lang>lang_forgot_pin</Lang>?</span>
            </div>
        }
        return ''
    }

    changeConnection(isConnected) {
        if (isConnected !== this.state.isConnected) {
            const obj = {};
            obj['isConnected'] = isConnected;
            isConnected && (obj['error'] = '');
            this.isMount && this.setState(obj);
        }
        if (isConnected) {
            const donePin = document.querySelector('.rightSettings #pinDoneButton')
            donePin && donePin.classList.remove('visilibityHidden');
            this.removeLoading();
            const step = this.state[this.state.step];
            if (step && step.allPin && step.allPin.length === 6) this.nextStep();
        }
    }

    componentWillUnmount() {
        this.isMount = false;
        document.body.classList.remove('openPopupPinForm');
        this.emitConnectionID && this.emitConnectionID.remove();
    }

    componentDidMount() {
        this.isMount = true;
        document.body.classList.add('openPopupPinForm');
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        this.isMount && this.setState({
            animationClass: 'fadeInAnimation'
        })
        setTimeout(() => {
            document.getElementById('pinInputField') && document.getElementById('pinInputField').focus()
        }, 100)
    }

    handleForgotPIN() {
        try {
            console.log(this.props.closeSuccess)
            showModal({
                component: Settings,
                props: {
                    forgotPIN: true,
                    closePin: this.props.close,
                    closeSuccess: this.props.closeSuccess
                }
            });
        } catch (error) {
            logger.error('handleForgotPIN On PinForm' + error)
        }
    }

    renderDescription(step) {
        const stepObj = this.state[step];
        if (stepObj && stepObj.description) return stepObj.description
        return ''
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.title) {
            this.isMount && this.setState({
                title: nextProps.title,
                lightUpButton: false
            });
            if (nextProps.title === 'newPinSettings' && !this.allPin) {
                this.isMount && this.setState({
                    lightUpButton: true
                })
            }
        }
    }

    async checkPin(arrPin) {
        const pin = arrPin.join('');
        const loginEmail = dataStorage.loginEmail || localStorageNew.getItem('loginEmail', true);
        const refreshToken = localStorageNew.getItem(`${loginEmail}_refresh_token`);
        let decodeRes = null;
        await postDecode(pin, refreshToken, this.props.env).then(res => {
            decodeRes = res;
        }).catch(err => {
            decodeRes = err;
        });

        if (decodeRes && decodeRes.data) {
            this.isMount && this.setState({
                hidden: true
            });
            const dataRefresh = decodeRes.data;
            const decodeRefreshToken = decodeRes.data.token;
            dataStorage.intervalRefreshToken && clearInterval(dataStorage.intervalRefreshToken)
            this.refreshToken = decodeRefreshToken;
            await postRefresh(decodeRefreshToken, this.props.env)
                .then(response => {
                    if (response.data) {
                        dataStorage.accessToken = response.data.accessToken;
                        logger.log('CHECK TOKEN ===>  postREFRESH SET NEW TOKEN: ', dataStorage);
                        autoRefreshToken(dataRefresh.token);
                        dataStorage.showPin = false;
                        func.emitter(emitter.PIN_INPUT, eventEmitter.ENTER_PIN_SUCCESS, true)
                        if (localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))) localStorageNew.removeItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))
                        this.isMount && this.setState({
                            matchOldPIN: 'match',
                            count: 0
                        });
                        dataStorage.lastTimePin = new Date()
                    }
                }).catch(error => {
                    if (error.response && error.response.data && error.response.data.errorCode === 2089) {
                        localStorageNew.removeItem('isStayLogin', true);
                        warning({
                            message: 'lang_pin_expired',
                            callback: () => {
                                this.props.handlePopUpLogout && this.props.handlePopUpLogout(false)
                                window.location.reload();
                            }
                        });
                    }
                    if (error.response && error.response.data && error.response.data.errorCode === 429) {
                        this.isMount && this.setState({
                            count
                        });
                    }
                    logger.log(error)
                });

            if (!dataStorage.userInfo) {
                await afterLogin(() => {
                    saveDataWhenChangeEnv();
                    dataStorage.isGuest = false;
                    const uId = dataStorage.userInfo && dataStorage.userInfo.user_id;
                    registerUser(uId, this.realTimeData.bind(this), 'auth');
                }, null);
            }
            return true;
        } else {
            if (decodeRes.response && decodeRes.response.data && decodeRes.response.data.errorCode === 'TOKEN_WAS_CHANGED') {
                localStorageNew.removeItem('isStayLogin', true);
                warning({
                    message: 'lang_force_logout_change_password',
                    callback: () => {
                        this.props.handlePopUpLogout && this.props.handlePopUpLogout(false)
                        window.location.reload();
                    }
                });
            } else if (decodeRes.response && decodeRes.response.errorCode === 2089) {
                localStorageNew.removeItem('isStayLogin', true);
                warning({
                    message: 'lang_pin_expired',
                    callback: () => {
                        this.props.handlePopUpLogout && this.props.handlePopUpLogout(false)
                        window.location.reload();
                    }
                });
            } else {
                setTimeout(() => {
                    this.isMount && this.setState({
                        matchOldPIN: 'not match'
                    }, () => {
                        this.state[this.state.step].allPin = [];
                    });
                    let count;
                    const countInStorage = localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail || ''));
                    if (parseInt(countInStorage)) {
                        count = parseInt(countInStorage) + 1
                    } else {
                        count = 1;
                    }
                    localStorageNew.setItem('countFailedPIN' + dataStorage.loginEmail, count);
                    if (count >= 3) {
                        if (localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))) localStorageNew.removeItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))
                        this.isMount && this.setState({ count }, () => {
                            this.confirmLogout();
                        })
                    } else {
                        this.isMount && this.setState({
                            count
                        });
                    }
                }, 100)
            }
        }
        return false;
    }

    confirmLogout() {
        consfirm({
            className: 'isPinForm',
            message: 'lang_force_logout',
            callback: () => {
                setTimeout(() => {
                    if (localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))) localStorageNew.removeItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))
                    logout();
                }, 1000)
            }
        })
    }

    realTimeData(data) {
        if (data.errorCode === 'TOKEN_WAS_CHANGED') {
            logger.log('pinWasChange ===============>' + dataStorage.pinWasChanged);
            if (dataStorage.pinWasChanged) {
                dataStorage.pinWasChanged = false;
                return;
            }
            this.confirmLogout();
        }
    }

    async nextStep() {
        // if (!this.state.isConnected) {
        //     setTimeout(() => {
        //         this.addLoading();
        //     }, 1000)
        // }
        this.needToReload = true
        if (this.nowProccessing) return;
        this.nowProccessing = true;
        if (this.state.step === 'step1') {
            this.disable = 'disable'
            this.state.step2.allPin = [];
            const step = this.state[this.state.step];
            if (step) {
                const matched = await this.checkPin(step.allPin);
                console.log(matched)
                if (!matched) {
                    this.nowProccessing = false;
                    return;
                }
                this.disable = ''
            }
            if (this.lstStep.length === 1 && this.props.success) {
                dataStorage.verifiedPin = true;
                this.props.success(step.allPin.join(''));
                this.props.close && this.props.close();
            }
        } else if (this.state.step === 'step2') {
            this.disable = 'disable'
            if (this.state.step2.allPin.length === 6) {
                this.disable = ''
            }
            this.state.step3.allPin = [];
        } else if (this.state.step === 'step3') {
            this.disable = 'disable'
            const step3 = this.state[this.state.step];
            const step2 = this.state['step2'];

            if (step2.allPin.join() === step3.allPin.join()) {
                this.disable = ''
                this.isMount && this.setState({
                    matchNewPIN: 'match'
                }, () => {
                    setTimeout(() => {
                        this.isMount && this.setState({
                            matchNewPIN: 'done'
                        }, () => {
                            this.props.close && this.props.close();
                            setTimeout(() => {
                                this.props.done && this.props.done(step3.allPin.join(''), () => {
                                    dataStorage.pinWasChanged = true;
                                }, this.refreshToken);
                            }, 500)
                        })
                    }, 1000)
                })
                if (localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))) localStorageNew.removeItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))
            } else {
                this.isMount && this.setState({
                    matchNewPIN: 'not match'
                })
                setTimeout(() => {
                    this.nowProccessing = false;
                    this.hiddenError()
                    this.state[this.state.step].allPin = [];
                }, 1000)
            }
        }

        const index = this.lstStep.indexOf(this.state.step);
        const next = index + 1;
        if (next === this.lstStep.length) return;
        this.isMount && this.setState({
            step: this.lstStep[next]
        }, () => {
            this.nowProccessing = false;
        })
    }
    addLoading() {
        if (document.querySelector('.pinLoadingIcon')) return;
        const beforeHeader = document.querySelector('.rowRightContent .pinFormHeader');
        const donePin = document.querySelector('.rightSettings #pinDoneButton')
        donePin && donePin.classList.add('visilibityHidden');
        const loading = document.createElement('div');
        loading.classList.add('pinLoadingIcon');
        loading && beforeHeader && beforeHeader.appendChild(loading);
    }
    removeLoading() {
        const loading = document.querySelector('.pinLoadingIcon');
        loading && loading.remove();
    }
    prevStep() {
        if (!this.state.isConnected && this.state.step2.allPin.length === 6) {
            this.isMount && this.setState({
                graybutton: 'disableButtonBack'
            })
            return
        };
        // this.removeLoading();
        if (this.state.step1.allPin && this.state.step1.allPin.length === 6) {
            this.disable = ''
        } else if (this.state.step2.allPin && this.state.step2.allPin.length === 6) {
            this.disable = ''
        } else {
            this.disable = 'disable'
        }
        const index = this.lstStep.indexOf(this.state.step);
        this.isMount && this.setState({
            matchNewPIN: ''
        })
        if (this.lstStep.indexOf(this.state.step) <= 0) {
            this.isMount && this.setState({
                animationClass: 'fadeOutAnimation'
            })
            setTimeout(() => {
                if (index === 0) {
                    this.cancelFunc(this.props.title === 'Forgot PIN New PIN' ? 'Forgot PIN' : null)
                } else {
                    this.isMount && this.setState({ step: this.lstStep[index - 1] });
                }
            }, 400)
            return
        }
        if (index === 0) {
            this.cancelFunc(this.props.title === 'Forgot PIN New PIN' ? 'Forgot PIN' : null)
        } else {
            this.isMount && this.setState({ step: this.lstStep[index - 1] });
        }
    }

    keyBoardPress(e) {
        if (this.dom && this.dom.parentNode.parentNode.parentNode.classList.contains('myHidden')) return;
        if (e.key === 'Backspace') {
            this.disable = 'disable';
            this.getDataByKeyBoard('delete');
        } else {
            if (/^\d+$/.test(e.key)) {
                this.getDataByKeyBoard(Number(e.key));
            }
        }
    }

    getDataByKeyBoard(item) {
        if (this.state.count >= 3) return;
        this.input && this.input.focus();
        const step = this.state[this.state.step];
        if (!this.state.isConnected && step && step.allPin && step.allPin.length === 6) return;
        if (!step) return;
        if (!step.allPin) step.allPin = [];
        if (item === 'delete') {
            step.allPin.splice(-1, 1);
            this.isMount && this.setState({ show: false });
            if (this.timeoutId) clearTimeout(this.timeoutId);
        } else {
            if (step.allPin.length < 6) {
                step.allPin.push(item);
                this.isMount && this.setState({ show: true });
                if (this.timeoutId) clearTimeout(this.timeoutId);
                this.timeoutId = setTimeout(() => {
                    this.isMount && this.setState({ show: false });
                }, 2000);
            } else return;
        }
        const obj = {};
        if (step.allPin.length === 6) {
            if (this.state.isConnected) {
                obj[this.state.step] = step;
                this.isMount && this.setState(obj);
                this.nextStep();
            } else {
                this.addLoading();
                this.lastPin = step.allPin;
                // step.allPin = [];
                obj[this.state.step] = step;
                obj['error'] = 'lang_no_internet_connection'
                this.isMount && this.setState(obj)
            }
        }
    }

    hiddenError() {
        setTimeout(() => this.isMount && this.setState({
            matchNewPIN: '',
            matchOldPIN: ''
        }), 1000)
    }

    renderHeader() {
        const step = this.state[this.state.step];
        if (step && step.header) return <Lang>{step.header}</Lang>;
        return '';
    }

    renderTitle(step) {
        const stepObj = this.state[step];
        if (stepObj && stepObj.title) return stepObj.title;
        return '';
    }

    renderError() {
        if (this.state.error && !this.state.isConnected) {
            return (
                <div className='pinFormAlert size--3'>
                    <Lang>{this.state.error}</Lang>
                </div>
            );
        }

        if (this.state.matchOldPIN === 'not match' && this.state.step === 'step1') {
            if (localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))) {
                return (
                    <div className='pinFormAlert size--3'>
                        {localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))} {localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : '')) > 1 ? <Lang>lang_failed_pin_attempts</Lang> : <Lang>lang_failed_pin_attempt</Lang>}
                    </div>
                )
            }
        }

        if (this.state.matchNewPIN === 'not match') {
            return (
                <div className='pinFormAlert size--3'>
                    <Lang>lang_pin_did_not_match_try_again</Lang>
                </div>
            )
        }
    }

    renderBody(step) {
        return <div key={step}>
            <div className={`pinFormTitle size--4`}>{this.renderTitle(step)}</div>
            <div className='line1'></div>
            <div className={`pinFormInput`}>
                <div className='pinInputRoot'>
                    {
                        this.lst.map((v, i) => {
                            return <div key={i} className={`symbolPrivatePinCode ${this.state[step].allPin && this.state[step].allPin[i] !== undefined ? 'filled' : ''}`}>{
                                this.state.show && this.state[step].allPin && i === this.state[step].allPin.length - 1 ? this.state[step].allPin[i] : ''
                            }</div>;
                        })
                    }
                </div>
            </div>
            <div className='line2'></div>
            <div className='pinFormAtten size--3'>
                {this.renderAttem()}
                {this.renderDescription(step)}
            </div>
        </div>
    }

    renderAttem() {
        if (this.props.title === 'firstLogin' || this.props.title === 'Change PIN Old PIN' || this.props.title === 'Forgot PIN New PIN') {
            return this.renderError();
        }
        if (localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail || ''))) {
            return (
                <div className='pinFormAlert size--3'>
                    {localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail || ''))} {<Lang>lang_failed_pin_attempt</Lang>}
                </div>
            )
        }
    }

    cancelFunc(backScreen) {
        try {
            if (backScreen === 'Forgot PIN') {
                if (this.props.cancel) {
                    this.props.cancel('Forgot PIN');
                    return
                }
            }
            if (!this.state.confirm) {
                if (this.props.cancel) {
                    this.props.cancel();
                }
            }

            this.allPin = this.allPinStep1;
            if (this.sendKey) this.sendKey(this.allPinStep1);
            this.pinTmp = null;
            this.isMount && this.setState({
                confirm: false,
                matchNewPIN: ''
            })
        } catch (error) {
            logger.error('cancelFunc On PinForm' + error)
        }
    }

    addSpinnerforDone() {
        if (this.state.matchNewPIN === 'done') {
            return <Lang>lang_done</Lang>;
        }
        let disable = (this.state[this.state.step].allPin && this.state[this.state.step].allPin.length === 6) ? '' : 'disable'
        if (this.state.step3.allPin && this.state.step3.allPin.length === 6 && this.state.matchNewPIN !== 'match') {
            disable = 'disable'
        }
        if (!disable) {
            return this.props.success ? '' : this.lstStep.indexOf(this.state.step) === this.lstStep.length - 1 ? <img src='common/Spinner-white.svg' /> : <Lang>lang_next</Lang>
        } else {
            return this.props.success ? '' : this.lstStep.indexOf(this.state.step) === this.lstStep.length - 1 ? <Lang>lang_done</Lang> : <Lang>lang_next</Lang>
        }
    }

    inputRef(dom) {
        if (!dom || dom.listening) return;
        dom.listening = true;
        this.input = dom;
        if (this.input.parentNode.parentNode.classList.contains('rightSettings')) {
            const pinform = document.querySelector('.settings.background')
            if (pinform) {
                pinform.addEventListener('mouseover', this.handleOnClick.bind(this));
            } else {
                document.querySelector('.settings').addEventListener('mouseover', this.handleOnClick.bind(this));
            }
        } else {
            this.input.parentNode.parentNode.addEventListener('mouseover', this.handleOnClick.bind(this));
        }
        this.input.addEventListener('keydown', this.keyBoardPress.bind(this));
        this.input && this.input.parentNode && this.input.parentNode.parentNode && this.input.parentNode.parentNode.addEventListener('click', this.handleOnClick.bind(this));
    }

    handleOnClick() {
        this.input && this.input.focus();
    }

    render() {
        if (this.state[this.state.step].allPin && this.state[this.state.step].allPin.length < 6) {
            this.disable = 'disable'
        }
        try {
            logger.log('dataStorage.verifiedPin: ', dataStorage.verifiedPin);
            return (
                <div className={`pinFormRoot ${this.state.animationClass} ${this.props.title === 'firstLogin' ? 'qe-firstPinForm' : ''}`} tabIndex='0'>
                    {
                        this.props.canClose ? <div style={{ position: 'absolute', width: 20, height: 20, top: 20, right: 20, cursor: 'pointer' }}
                            onClick={() => {
                                this.props.close();
                            }}>
                            <Icon src={'navigation/close'} />
                        </div> : null
                    }
                    <input ref={dom => this.inputRef(dom)} id='pinInputField' autoComplete='off' />
                    <div className={`pinFormHeader size--3 ${this.props.title === 'firstLogin' ? 'firstLogin' : ''} text-capitalize`}>
                        <span className={`button match ${this.state.graybutton}`} onClick={this.prevStep.bind(this)}>
                            {this.lstStep.indexOf(this.state.step) > 0 ? <Lang>lang_back</Lang> : (this.props.cancel ? <Lang>lang_cancel</Lang> : '')}
                        </span>
                        <span className={`header size--4`}>
                            {this.renderHeader()}
                        </span>
                        <span id='pinDoneButton' onClick={this.nextStep.bind(this)} className={`button ${this.disable} text-capitalize`}>
                            {this.addSpinnerforDone()}
                        </span>
                    </div>
                    <div className='pinBody' style={{ width: (this.lstStep.length * 100) + '%', marginLeft: (100 * (-this.lstStep.indexOf(this.state.step))) + '%' }}>
                        {this.lstStep.map(step => {
                            return this.renderBody(step);
                        })}
                    </div>
                    <div className={`pinFormKeyBoard`}>
                        <KeyBoardNumber getDataByKeyBoard={this.getDataByKeyBoard.bind(this)} />
                    </div>
                </div >
            );
        } catch (error) {
            logger.error('render on PinForm' + error);
        }
    }
}

export default translate('translations')(Pin);
