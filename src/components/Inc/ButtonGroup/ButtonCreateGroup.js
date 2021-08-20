import React, { useState } from 'react'
import s from './ButtonGroup.module.css'
import SvgIcon, { path } from '../SvgIcon'
import Lang from '../Lang'
import AccountUploadFile from '../../AccountManager/AccountUploadFile'
import dataStorage from '../../../dataStorage'
import { checkRole } from '../../../helper/functionUtils'
import MapRoleComponent from '../../../constants/map_role_component'
import Button from '../../Elements/Button/Button'

const CreateBtn = ({ onClick, more }) => {
    return <Button className={more ? s.more : ''} onClick={() => onClick('create')}>
        <SvgIcon path={path.mdiAccountPlus} className={s.icon} />
        <div className={s.textBtn + ' ' + 'showTitle text-capitalize'}><Lang>lang_create_account</Lang></div>
    </Button>
}
const BulkCreateBtn = ({ onClick, more }) => {
    return <Button className={more ? s.more : ''} onClick={() => onClick('bulkCreate')}>
        <SvgIcon path={path.mdiAccountMultiplePlus} className={s.icon} />
        <div className={s.textBtn + ' ' + 'showTitle text-capitalize'}><Lang>lang_bulk_create_account</Lang></div>
    </Button>
}

const ButtonGroup = ({ callback, columns, more }) => {
    const [isShow, setIsShow] = useState(false)

    const onClick = (type) => {
        callback && callback(type)
        switch (type) {
            case 'create':
                dataStorage.goldenLayout.addComponentToStack('OpeningAccount')
                break
            case 'bulkCreate':
                setIsShow(true)
                break
            default: break
        }
    }

    return <div className={s.container}>
        {checkRole(MapRoleComponent.CREATE_ACCOUNT) ? <CreateBtn more={more} onClick={onClick} /> : null}
        {checkRole(MapRoleComponent.BULK_CREATE_ACCOUNT) ? <BulkCreateBtn more={more} onClick={onClick} /> : null}
        {
            isShow ? <div className={s.importFile}><AccountUploadFile columns={columns} onClose={() => setIsShow(false)} /></div> : null
        }
    </div>
}
export default ButtonGroup
