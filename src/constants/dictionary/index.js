import ws from './dictionaryWS.js'
import fix from './dictionaryFIX.js'
import dataStorage from '../../dataStorage'
import env from '../enviroments'

const getDictionary = () => {
    switch (dataStorage.env_config.env) {
        default: return fix
    }
}
export default {
    getDictionary
}
