import dataStorage from '../dataStorage';
let optionLayout = {};
const initObjLayout = () => {
    optionLayout = dataStorage.env_config.useListLayoutDemo ? {
        'LAYOUT_0': 'Super Admin Default Layout',
        'LAYOUT_1': 'Admin Default Layout',
        'LAYOUT_2': 'Operator (DTR) Default Layout',
        'LAYOUT_3': 'Staff Default Layout',
        'LAYOUT_4': 'Adviser Trading Default Layout',
        'LAYOUT_5': 'Adviser View Only Default Layout',
        'LAYOUT_6': 'Retail User Trading Default Layout',
        'LAYOUT_7': 'Chinese User Trading Default Layout',
        'LAYOUT_8': 'Retail User View Only Default Layout',
        'LAYOUT_9': 'End Client User Trading Default Layout',
        'LAYOUT_10': 'End Client User View Only Default Layout',
        'LAYOUT_11': 'Trading Futures Default Layout',
        'LAYOUT_12': 'Retail Demo Default Layout',
        'LAYOUT_13': 'Advisor Demo Default Layout',
        'LAYOUT_14': 'Operator Demo Default Layout',
        'LAYOUT_15': 'Advisor Viewonly Demo Default Layout',
        'LAYOUT_16': 'Retail Viewonly Demo Default Layout'
    } : {
            'LAYOUT_0': 'Super Admin Default Layout',
            'LAYOUT_1': 'Admin Default Layout',
            'LAYOUT_2': 'Operator (DTR) Default Layout',
            'LAYOUT_3': 'Staff Default Layout',
            'LAYOUT_4': 'Adviser Trading Default Layout',
            'LAYOUT_5': 'Adviser View Only Default Layout',
            'LAYOUT_6': 'Retail User Trading Default Layout',
            'LAYOUT_7': 'Chinese User Trading Default Layout',
            'LAYOUT_8': 'Retail User View Only Default Layout',
            'LAYOUT_9': 'End Client User Trading Default Layout',
            'LAYOUT_10': 'End Client User View Only Default Layout',
            'LAYOUT_11': 'Trading Futures Default Layout'
        }
}
dataStorage.listFunctionInit.push(initObjLayout);
export default optionLayout
