import React from 'react';
import InformationVariantIcon from 'mdi-react/InformationVariantIcon';
import dataStorage from '../../../../dataStorage';

class ButtonCell extends React.Component {
    render() {
        const t = dataStorage.translate
        const obj = this.props.data
        return (
            <div className='btn-group btn-fix-size'>
                <div title={t('lang_details')} className='btn btn-detail' onClick={() => dataStorage.goldenLayout.addComponentToStack('UserDetail', { user_id: obj.user_id })}>
                    <img className='icon' src='common/baseline-error-outline-24-px.svg' />
                </div>
                <div title={t('lang_activities')} className={`btn`} onClick={() => dataStorage.goldenLayout.addComponentToStack('Activities', { user_id: obj.user_id, user_login_id: obj.user_login_id })}>
                    <InformationVariantIcon className="icon" color="#fff" />
                </div>
                <div title={t('lang_reset_password')} className={`btn ${obj.access_method ? 'disabled' : 'btn-dask'}`} onClick={() => !obj.access_method ? this.props.schema.callBack(obj.user_login_id) : null}>
                    <img className='icon' src='common/lock-reset.svg' />
                </div>
            </div>
        )
    }
}
export default ButtonCell;
