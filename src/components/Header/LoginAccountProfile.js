import React, { useEffect, useState, useRef } from 'react';
import Lang from '../Inc/Lang';
import dataStorage from '../../dataStorage';
import Icon from '../Inc/Icon';
import SvgIcon, { path } from '../Inc/SvgIcon'
import styles from './Header.module.css'
import userTypeEnum from '../../constants/user_type_enum'
const LoginAccountProfile = (props) => {
    let email = dataStorage.userInfo.user_login_id || ''
    let role = dataStorage.userInfo.group_name || '';
    let isHiddenRole = dataStorage.env_config.roles.dontShowRoleDetail
    let isRetail = dataStorage.userInfo.user_type === userTypeEnum.RETAIL
    return (
        <div className={styles.accountProfile}>
            <div className={styles.title}>
                <SvgIcon style={{ width: '20px', paddingRight: '4px' }} path={path.mdiAccountCircle} />
                {email}
                <div><SvgIcon style={{ width: '20px', paddingLeft: '4px' }} path={path.mdiChevronDown} /></div>
            </div>
            <div className={styles.list}>
                {
                    isHiddenRole && isRetail
                        ? null
                        : <div className={styles.rowAccount}>
                            <span className='text-capitalize'><Lang>lang_role</Lang></span>:&nbsp;<div className='showTitle' style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}> {role}</div>
                        </div>
                }
                <div style={{ cursor: 'pointer' }} onClick={() => {
                    dataStorage.goldenLayout.addComponentToStack('UserInfor')
                }} className={styles.rowAccount + ' text-capitalize'}><Lang>lang_my_account</Lang> <SvgIcon style={{ width: '20px', paddingLeft: '4px' }} path={path.mdiAccount} /></div>
                <div className={styles.divide}></div>
                <div style={{ cursor: 'pointer' }} onClick={() => {
                    props.logOut && props.logOut()
                }} className={styles.rowAccount + ' text-capitalize'}><Lang>lang_sign_out</Lang> <SvgIcon style={{ width: '20px', paddingLeft: '4px' }} path={path.mdiLogoutVariant} /></div>
            </div>
        </div>
    )
}
export default LoginAccountProfile;
