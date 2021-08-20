import React from 'react';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import Lang from '../Inc/Lang';
import { hideElement } from '../../helper/functionUtils';
import EditEmailNotification from './EditEmailNotification';
import PopupEditor from '../Inc/PopupEditor';
import showModal from '../Inc/Modal/Modal';
import Icon from '../Inc/Icon';
import uuidv4 from 'uuid/v4';
import NoTag from '../Inc/NoTag';
import { unregisterUser, registerUser } from '../../streaming';
import {
    putData,
    makeMappingAccountlUrl,
    getData,
    getUrlEditSmsNoti
} from '../../helper/request';
import styles from './UserInfor.module.css'
import env from '../../constants/enviroments'
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';

class UserInfor extends React.Component {
    constructor(props) {
        super(props);
        const initState = this.props.loadState();
        this.id = uuidv4();
        this.state = {
            userObj: initState.userObj || {},
            connected: true
        }
        props.resize((width) => {
            this.handleResize(width)
        });
        props.glContainer.on('show', () => {
            hideElement(props, false, this.id);
        });
        props.glContainer.on('hide', () => {
            hideElement(props, true, this.id);
        });
    }

    handleResize = (width) => {
        if (this.dom) {
            this.dom.className = 'accountInfo';
            if (width < 640) {
                this.dom.classList.add('single');
            } else if (width < 1280) {
                this.dom.classList.add('half');
            } else {
                this.dom.classList.add('lagre');
            }
        }
    }
    componentDidMount() {
        this.getDataUser()
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        registerUser(userId, this.getDataUser, 'user_detail');
    }
    componentWillUnmount() {
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        unregisterUser(userId, this.getDataUser, 'user_detail');
    }

    getDataUser = async () => {
        const data = dataStorage.userInfo || {}
        if (!data.user_id) return
        const urlMappingAccount = makeMappingAccountlUrl(`?user_id=${data.user_id}`);
        await getData(urlMappingAccount)
            .then(response => {
                if (response.data) {
                    this.dicAccount = {};
                    response.data.forEach(element => {
                        this.dicAccount[element.account_id] = element;
                    });
                }
            })
            .catch(error => {
                logger.log(error)
            })
        let objUser = {
            fullName: data.full_name,
            userLogin: data.user_login_id,
            role: dataStorage.userInfo.group_name || '--',
            phoneNumber: data.phone || '--',
            emailContact: data.email || '--',
            emailNotification: data.email_alert || '--',
            management: data.list_mapping || '',
            organisationCode: data.organisation_code || '',
            branchCode: data.branch_code || '',
            advisorCode: data.advisor_code || '',
            userId: data.user_id,
            userType: dataStorage.userInfo.user_type || '',
            smsNotification: data.sms_alert
        }
        this.setState({
            userObj: objUser
        })
    }

    editEmailNoti() {
        showModal({
            component: EditEmailNotification,
            props: {
                paramId: this.state.userObj.userId,
                headerText: 'lang_change_email_notifications',
                middleText: 'lang_please_enter_your_new_email'
            }
        })
    }
    editSmsNoti() {
        showModal({
            component: EditEmailNotification,
            props: {
                paramId: this.state.userObj.userId,
                isSmsNoti: true,
                headerText: 'lang_change_sms_notifications',
                middleText: 'lang_please_enter_your_new_sms'
            }
        })
    }

    renderOperator = () => {
        return <div className={`${styles.itemRow} ${styles.rowTag} text-capitalize`}>
            <p className={`${styles.lablel} size--3`}> <Lang>lang_management</Lang> </p>
            <p className={`${styles.Info} Manager-tag showTitle parent-tag size--3`}><Lang>lang_all_account</Lang></p>
        </div>
    }
    renderAdvisor = () => {
        return <NoTag>
            <div className={`${styles.itemRow} ${styles.rowTag}`}>
                <p className={`${styles.lablel} size--3 text-capitalize`}> <Lang>lang_organisation_code_management</Lang> </p>
                <p className={`${styles.Info} organisation-tag parent-tag size--3`}>{this.renderTag(this.state.userObj.organisationCode, true)}</p>
            </div>
            <div className={`${styles.itemRow} ${styles.rowTag}`}>
                <p className={`${styles.lablel} size--3 text-capitalize`}> <Lang>lang_branch_code_management</Lang> </p>
                <p className={`${styles.Info} branch-tag parent-tag size--3`}>{this.renderTag(this.state.userObj.branchCode, true)}</p>
            </div>
            <div className={`${styles.itemRow} ${styles.rowTag}`}>
                <p className={`${styles.lablel} size--3 text-capitalize`}> <Lang>lang_advisor_code_management</Lang> </p>
                <p className={`${styles.Info} advisor-tag parent-tag size--3`}>{this.renderTag(this.state.userObj.advisorCode, true)}</p>
            </div>
            <div className={`${styles.itemRow} ${styles.rowTag}`}>
                <p className={`${styles.lablel} size--3 ontop text-capitalize`}> <Lang>lang_account_manager</Lang> </p>
                <p className={`${styles.Info} Manager-tag parent-tag size--3`}>{this.renderTag(this.state.userObj.management)}</p>
            </div>
        </NoTag>
    }
    renderRetail = () => {
        return <div className={`${styles.itemRow} ${styles.rowTag}`}>
            <p className={`${styles.lablel} size--3 text-capitalize`}> <Lang>lang_account_manager</Lang> </p>
            <p className={`${styles.Info} Manager-tag parent-tag size--3`}>{this.renderTag(this.state.userObj.management)}</p>
        </div>
    }

    switchRole(role) {
        if (role === 'operation') return this.renderOperator()
        if (role === 'retail') return this.renderRetail()
        if (role === 'advisor') return this.renderAdvisor()
    }
    renderTag = (obj, isCodeTag) => {
        return obj && obj.match(/[^,\s]+/g).map((item, index) => {
            let tagCode = ''
            let showTitle = 'showTitle'
            if (isCodeTag) {
                showTitle = ''
                let code = item.match(/[^.\s]+/g)
                tagCode = ((code[0] && 'Organisation Code: ' + code[0])) + ((code[1] && ' | ' + 'Branch Code: ' + code[1]) || '') + ((code[2] && ' | ' + 'Advisor Code: ' + code[2]) || '')
            }
            return <span className={`${styles.tagColor} ${showTitle}`} title={tagCode} key={`${item}_${index}`}>{this.dicAccount && this.dicAccount[item] && this.dicAccount[item].account_name ? `${this.dicAccount[item].account_name}(${item})` : item}</span>
        })
    }

    renderSMSNotification() {
        if (dataStorage.env_config.roles.dontShowSMSNoti) return null
        return <div className={styles.itemRow}>
            <p className={`${styles.lablel} size--3`}> <Lang>lang_sms_notifications</Lang> </p>
            <p className={`${styles.Info} ${styles.btnEditEmail} size--3 number`}>
                <span className={`${styles.mailAlert} showTitle`}>{this.state.userObj.smsNotification || this.state.userObj.phoneNumber}</span>
                <span className={`${styles.mailAlertIcon} showTitle`} onClick={() => this.editSmsNoti()}>
                    <SvgIcon path={path.mdiPencil} style={{ height: 20 }} />
                    <span className='text-uppercase'><Lang>lang_edit</Lang></span>
                </span>
            </p>
        </div>
    }

    render() {
        try {
            return (
                <div className='userAccount'>
                    <div className='user-content'>
                        <div>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            <div className='accountInfo userInfo' ref={dom => this.dom = dom}>
                                <div>
                                    <div>
                                        <div className={styles.itemRow}>
                                            <p className={`${styles.lablel} size--3 text-capitalize`}> <Lang>lang_full_name</Lang> </p>
                                            <p className={`${styles.Info} size--3 number showTitle user-info`}>{this.state.userObj.fullName}
                                            </p>
                                        </div>
                                        <div className={styles.itemRow}>
                                            <p className={`${styles.lablel} size--3 text-capitalize`}> <Lang>lang_user_login</Lang> </p>
                                            <p className={`${styles.Info} size--3 showTitle user-info`}>{this.state.userObj.userLogin}</p>
                                        </div>
                                        <div className={styles.itemRow}>
                                            <p className={`${styles.lablel} size--3 text-capitalize`}> <Lang>lang_role</Lang> </p>
                                            <p className={`${styles.Info} ${styles.textUppercase} size--3 number showTitle user-info`}>{this.state.userObj.role}</p>
                                        </div>
                                        <div className={styles.itemRow}>
                                            <p className={`${styles.lablel} size--3 text-capitalize`}> <Lang>lang_phone</Lang></p>
                                            <p className={`${styles.Info} size--3 number showTitle user-info`}>{this.state.userObj.phoneNumber}</p>
                                        </div>
                                        <div className={styles.itemRow}>
                                            <p className={`${styles.lablel} size--3 text-capitalize`}> <Lang>lang_email_contact</Lang> </p>
                                            <p className={`${styles.Info} size--3 number showTitle user-info`}>{this.state.userObj.emailContact}</p>
                                        </div>
                                        <div className={styles.itemRow}>
                                            <p className={`${styles.lablel} size--3 text-capitalize`}> <Lang>lang_email_notifications</Lang> </p>
                                            <p className={`${styles.Info} ${styles.btnEditEmail} size--3 number`}>
                                                <span className={`${styles.mailAlert} showTitle`}>{this.state.userObj.emailNotification}</span>
                                                <span className={`${styles.mailAlertIcon} showTitle`} onClick={() => this.editEmailNoti()}>
                                                    <SvgIcon path={path.mdiPencil} style={{ height: 20 }} />
                                                    <span className='text-uppercase'><Lang>lang_edit</Lang></span>
                                                </span>
                                            </p>
                                        </div>
                                        {this.renderSMSNotification()}
                                        {this.switchRole(this.state.userObj.userType)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } catch (error) {
            logger.log('error user Info', error)
        }
    }
}

export default UserInfor;
