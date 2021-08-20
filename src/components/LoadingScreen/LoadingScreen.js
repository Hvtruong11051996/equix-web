import Color from '../../constants/color'
import dataStorage from '../../dataStorage'
import { addVerUrl } from '../../helper/functionUtils'

const LoadingScreen = (props) => {
    const config = dataStorage.web_config[dataStorage.web_config.common.project]
    const logo = addVerUrl(config.branding.logoDark)
    const bg = addVerUrl(config.branding.background)
    return <div className={`loadingMainScreen ${props.className}`}
        ref={props.setRef}
        style={{
            backgroundColor: Color.BACKGROUND_DEFAULT,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundImage: `url(${bg})`
        }}>
        {props.children || <div className='loadingSpiner'><img src='common/Spinner-white.svg' width='26px' height='26px' /></div>}
        {props.children || <div><img className='loading_logo' src={logo} /></div>}
    </div>
}

export default LoadingScreen
