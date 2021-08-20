
import initState from './initState';

export const theme = (state = initState.theme, action) => {
    switch (action.type) {
        case 'CHANGE_THEME':
            return {
                ...state,
                theme: action.theme
            }
        default:
            return state
    }
}
