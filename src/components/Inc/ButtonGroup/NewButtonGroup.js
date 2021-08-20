import React, { useState, useRef, useEffect } from 'react'
import s from './ButtonGroup.module.css'
import SvgIcon, { path } from '../SvgIcon'
import Lang from '../Lang'
import Button, { buttonType } from '../../Elements/Button';

const EditBtn = ({ onClick }) => {
    return <Button className={s.btn} onClick={() => onClick('edit')}>
        <SvgIcon path={path.mdiSquareEditOutline} className={s.icon} />
        <div className={s.textBtn + ' ' + 'showTitle text-uppercase'}><Lang>lang_edit</Lang></div>
    </Button>
}

const CancelBtn = ({ onClick, more }) => {
    return <Button type={buttonType.danger} className={more ? s.more : ''} onClick={() => onClick('cancel')}>
        <SvgIcon path={path.mdiCloseCircle} className={s.icon} />
        <div className={s.textBtn + ' ' + 'showTitle text-uppercase'}><Lang>lang_cancel</Lang></div>
    </Button>
}
const SaveBtn = ({ onClick, more }) => {
    return <Button type={buttonType.info} className={more ? s.more : ''} onClick={() => onClick('save')}>
        <SvgIcon path={path.mdiCheckCircle} className={s.icon} />
        <div className={s.textBtn + ' ' + 'showTitle text-uppercase'}><Lang>lang_save_changes</Lang></div>
    </Button>
}

const ButtonGroup = ({ callback, value, more }) => {
    const [editMode, setEditMode] = useState(!!value)
    useEffect(() => {
        setEditMode(!!value)
    }, [value])
    const onClick = (type) => {
        callback && callback(type)
    }

    return <div className={s.container}>
        {
            editMode ? <React.Fragment>
                <SaveBtn more={more} onClick={onClick} />
                <CancelBtn more={more} onClick={onClick} />
            </React.Fragment> : <EditBtn onClick={onClick} />
        }
    </div>
}
export default ButtonGroup
