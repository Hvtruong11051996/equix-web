
export default {
    login: {
        isLoadding: false
    },
    news: {
        isLoadding: true,
        listData: []
    },
    theme: {
        theme: localStorage ? localStorage.getItem('theme') : ''
    },
    orderForm: {
        open: false,
        data: {},
        actionClick: '',
        side: 'BUY',
        openFrom: ''
    },
    confirmForm: {
        open: false,
        data: {},
        actionClick: ''
    }
}
