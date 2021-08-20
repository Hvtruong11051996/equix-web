import React from 'react'
import { checkRole } from '../../../helper/functionUtils'
import MapRoleComponent from '../../../constants/map_role_component'
import Icon from '../Icon/Icon'
import dataStorage from '../../../dataStorage'
import Lang from '../../Inc/Lang';

const SecurityDetailIcon = (props) => {
    if (props.isHidden) return null
    if (!checkRole(MapRoleComponent.SecurityDetail)) return null
    return (
        <div>
            <div style={props.iconStyle} title={dataStorage.translate('lang_security_detail').toCapitalize()} className='security-icon showTitle next'>
                <Icon
                    src='action/info-outline'
                    hoverColor='rgb(197, 203, 206)'
                    onClick={() => {
                        dataStorage.goldenLayout.addComponentToStack('SecurityDetail', {
                            needConfirm: false,
                            data: { symbolObj: props.symbolObj }
                            // color
                        })
                    }}
                />
            </div>
            <div className='hidden'>{dataStorage.translate('lang_security_detail').toCapitalize()}</div>
        </div>
    )
}

export default SecurityDetailIcon
