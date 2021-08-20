import React from 'react'
import Lang from '../Inc/Lang'
import s from './AccountDetail.module.css'
import Form, { TYPE } from '../Inc/Form/'
import SvgIcon, { path } from '../Inc/SvgIcon'
import { FIELD, BUTTON, OPTIONS, METHOD } from '../OpeningAccount/constant'
import countryOptions from '../../constants/country_options'
import { getOpeningAccountUrl, putData } from '../../helper/request'
import Button, { buttonType } from '../Elements/Button/Button'

const FORM_STUCTURE = {
    type: TYPE.OBJECT,
    properties: {
        trade_confirmations: {
            type: TYPE.ARRAY,
            items: {
                type: TYPE.OBJECT,
                properties: {
                    [FIELD.METHOD]: {
                        title: 'lang_method',
                        rules: {
                            required: true
                        },
                        options: OPTIONS.METHOD,
                        type: TYPE.DROPDOWN
                    },
                    [FIELD.EMAIL]: {
                        title: 'lang_email',
                        rules: {
                            required: true,
                            email: true
                        },
                        type: TYPE.STRING,
                        condition: {
                            [FIELD.METHOD]: METHOD.EMAIL
                        }
                    },
                    [FIELD.POSTAL_ADDRESS_COUNTRY]: {
                        title: 'lang_country',
                        rules: {
                            required: true
                        },
                        options: countryOptions,
                        translate: false,
                        type: TYPE.DROPDOWN,
                        defaultValue: 'AUSTRALIA',
                        help: 'lang_address_helptext',
                        disable: true,
                        condition: {
                            [FIELD.METHOD]: METHOD.POSTAL
                        }
                    },
                    [FIELD.POSTAL_ADDRESS_FULL_ADDRESS]: {
                        title: 'lang_address',
                        rules: {
                            required: true
                        },
                        type: TYPE.AUTOCOMPLETE,
                        condition: {
                            [FIELD.METHOD]: METHOD.POSTAL
                        },
                        prefix: 'postal_address_'
                    },
                    [FIELD.CLIENT_ADDRESS]: {
                        title: ' ',
                        subTitle: 'lang_i_confirm_this_is_my_contact_address',
                        rules: {
                            required: true
                        },
                        type: TYPE.BOOLEAN,
                        condition: {
                            [FIELD.METHOD]: [METHOD.POSTAL, METHOD.EMAIL]
                        }
                    }
                }
            }
        }
    }
}
const listButton = [BUTTON.SUBMIT, BUTTON.CANCEL]
export default class TradeConfirmations extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            reRender: 1
        }
    }
    renderHeader() {
        return <div className={s.header}>
            <div className={s.title + ' ' + 'showTitle' + ' ' + 'text-capitalize'}><Lang>lang_trade_confirmations</Lang></div>
            <div className={s.icon} onClick={() => this.props.close()}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }
    componentDidMount() {
        this.setEditMode && this.setEditMode(true)
    }
    onBtnClick = (btn) => {
        switch (btn) {
            case BUTTON.SUBMIT:
                this.onSubmit()
                break
            case BUTTON.CANCEL:
            default: this.props.close()
                break
        }
    }
    onSubmit = () => {
        const data = this.getData()
        if (data) {
            this.props.onSuccess && this.props.onSuccess(data.trade_confirmations)
            this.props.close()
        }
    }
    addItem = () => {
        const data = this.getDefaultData();
        data.trade_confirmations && data.trade_confirmations.push({});
        this.setData(data);
        this.setState({ reRender: this.state.reRender + 1 })
    }
    removeItem = () => {
        const data = this.getDefaultData();
        if (data.trade_confirmations.length > 1) {
            data.trade_confirmations.splice(data.trade_confirmations.length - 1, 1);
            this.setData(data);
            this.setState({ reRender: this.state.reRender + 1 })
        }
    }
    renderContent() {
        return <React.Fragment>
            <div style={{ color: 'var(--secondary-default)', fontSize: '14px', display: 'flex', justifyContent: 'flex-start', margin: '16px 68px', width: '100%' }}><div style={{ color: '#a35159' }}>*</div><span className='text-capitalize'>&nbsp;<Lang>lang_require_symbol</Lang></span></div>
            <div style={{ overflow: 'auto' }}>
                <Form
                    {...this.props}
                    data={this.props.frirtData}
                    onChange={this.onChange}
                    marginForm={true}
                    fn={fn => {
                        this.setEditMode = fn.setEditMode
                        this.getDefaultData = fn.getDefaultData
                        this.setData = fn.setData
                        this.getData = fn.getData
                    }}
                    schema={FORM_STUCTURE}
                />
            </div>
        </React.Fragment>
    }
    renderBtnAddRemove() {
        const data = this.props.data || {};
        return <div className={s.btnAddRemove}>
            <div onClick={() => this.addItem()} className={s.contentButton}>Add Another Trade Confirmation</div>
            {
                !data.trade_confirmations || data.trade_confirmations.length < 2 ? null : <div onClick={() => this.removeItem()} className={s.contentButton}>Remove Last Trade Confirmation</div>
            }
        </div>
    }
    renderButton() {
        return <div className={s.buttonGroup} ref={ref => this.refBtn = ref} style={{ padding: '8px 64px 16px' }}>
            {
                listButton.map((e, i) => {
                    return <Button type={[BUTTON.SUBMIT].includes(e) ? buttonType.ascend : ''} key={`button_item_${i}`} className={s.button}>
                        <div className={`${s.buttonContainer + ' ' + 'showTitle'}`} onClick={() => this.onBtnClick(e)}><Lang>{e}</Lang></div></Button>
                })
            }
        </div>
    }
    render() {
        return <div className={s.popup} style={{ height: '56vh', width: '72vw' }}>
            {this.renderHeader()}
            <div className={s.mainTitle + ' ' + 'showTitle'} style={{ fontSize: '24px', margin: '16px' }}><Lang>lang_trade_confirmations</Lang></div>
            <div style={{ flex: '1', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {this.renderContent()}
                {this.renderBtnAddRemove()}
            </div>
            {this.renderButton()}
        </div>
    }
}
