import Lang from '../Lang';
import React from 'react';
import config from '../../../../public/config';
import LoadingScreen from '../../LoadingScreen/LoadingScreen'
import dataStorage from '../../../dataStorage'
import { addVerUrl } from '../../../helper/functionUtils'

const UpdateSysem = () => {
    return (
        <LoadingScreen className='updateMeContainer'>
            <div><img className='loading_logo' src={addVerUrl(dataStorage.env_config.branding.logoDark)} /></div>
            <div className='loadingSpiner'><img src='common/Spinner-white.svg' width='26px' height='26px' /></div>
            <div className='textUpdateMe'>
                <Lang>lang_update_system</Lang>
            </div>
        </LoadingScreen>
    )
}
export default UpdateSysem;
