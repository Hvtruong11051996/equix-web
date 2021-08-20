import React from 'react'
import { translate } from 'react-i18next'
import Grid from '../Inc/CanvasGrid'
import DropDown from '../DropDown'
import FilterBox from '../Inc/FilterBox'
import optionsDrop from '../../constants/options_drop_down'
import sideEnum from '../../constants/enum'
import SymbolClass, { LANG_CLASS } from '../../constants/symbol_class';
import orderState from '../../constants/order_state'
import { registerAllOrders, unregisterAllOrders, unregisterUser, registerUser } from '../../streaming'
import {
	makeSymbolUrl,
	getData,
	postData,
	getUrlAnAccount,
	getReportCsvFileUrl
} from '../../helper/request'
import {
	checkPropsStateShouldUpdate,
	enableOrder,
	hideElement,
	getActionType,
	colorOrder,
	formatSide,
	formatCompanyName,
	formatAccountName,
	formatAccountId,
	getDisplayExchange,
	formatLimitPrice,
	formatStopPrice,
	formatVolume,
	formatInitTime,
	formatAdvisorCode,
	formatFilledQuantity,
	formatOrderType,
	formatOrderField,
	formatEstTotalAud,
	formatNumberPrice,
	formatDuration,
	convertFormatStpOfPicker,
	checkToday,
	getCsvFile,
	formatOrderId,
	formatDestinationOrderList,
	getOrigination,
	toDisplayTime,
	clone,
	isOneAccount
} from '../../helper/functionUtils';
import dataStorage from '../../dataStorage';
import logger from '../../helper/log';
import SearchAccount from '../SearchAccount';
import uuidv4 from 'uuid/v4';
import MultiDropDown from '../MultiDropDown'
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import errorEnum from '../../constants/error_enum';
import DatePicker, { getStartTime, getEndTime, convertTimeStamp, getResetMaxDate } from '../Inc/DatePicker';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import moment from 'moment-timezone';
import ExampleCustomInput from '../Inc/ExampleCustomInput';
import { getApiFilter } from '../api';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

const options = [];
options.push(optionsDrop.optionsOrder[1]);
options.push(optionsDrop.optionsOrder[0]);
options.push(optionsDrop.optionsOrder[2]);
options.push(optionsDrop.optionsOrder[3]);

const optionsDurations = optionsDrop.optionsDurations;
optionsDurations.splice(0, 1);

const dicOrderTag = {
	'WORKING_': 'open',
	'STOPLOSS_': 'stoploss',
	'FILLED_': 'filled',
	'CANCELLED_': 'cancelled'
}

const lstCheckSide = [
	{
		label: 'buy',
		value: 1
	},
	{
		label: 'sell',
		value: 0
	}
]

const lstCheckStatus = [
	{ label: 'lang_place', value: 15 },
	{ label: 'lang_replace', value: 16 },
	{ label: 'lang_cancel', value: 17 },
	{ label: 'lang_trigger', value: 27 },
	{ label: 'lang_pending_cancel', value: 6 },
	{ label: 'lang_pending_replace', value: 14 },
	{ label: 'lang_approve_to_cancel', value: 25 },
	{ label: 'lang_approve_to_replace', value: 26 },
	{ label: 'lang_replaced', value: 5 },
	{ label: 'lang_deny_to_cancel', value: 22 },
	{ label: 'lang_deny_to_replace', value: 23 },
	{ label: 'lang_pending_new', value: 10 },
	{ label: 'lang_new', value: 0 },
	{ label: 'lang_partially_filled', value: 1 },
	{ label: 'lang_filled', value: 2 },
	{ label: 'lang_done_for_day', value: 3 },
	{ label: 'lang_cancelled', value: 4 },
	{ label: 'lang_stopped', value: 7 },
	{ label: 'lang_rejected', value: 8 },
	{ label: 'lang_suspended', value: 9 },
	{ label: 'lang_calculated', value: 11 },
	{ label: 'lang_expired', value: 12 },
	{ label: 'lang_accepted_for_bidding', value: 13 },
	{ label: 'lang_purged', value: 24 }
]
const lstOrigination = [
	{ label: 'lang_equix_mobile', value: '110##111##112' },
	{ label: 'lang_equix_web', value: '130##131##132##133##134##135' },
	{ label: 'lang_iress_ws', value: 201 },
	{ label: 'lang_iress_fix', value: 202 },
	{ label: 'lang_saxo_fix', value: 203 },
	{ label: 'lang_margin_call', value: 400 }
]

const lstCheckOrderType = [
	{ label: 'lang_limit', value: 'LIMIT_ORDER' },
	{ label: 'lang_market_to_limit', value: 'MARKETTOLIMIT_ORDER' },
	{ label: 'lang_market', value: 'MARKET_ORDER' },
	{ label: 'lang_stop_loss', value: 'STOPLIMIT_ORDER##STOPLOSS_ORDER' },
	{ label: 'lang_dark_limit', value: 'DARKLIMIT_ORDER' },
	{ label: 'lang_best', value: 'BEST' }
]

const lstCheckDuration = [
	{ label: 'lang_day_only', value: 'DAY' },
	{ label: 'lang_good_till_date', value: 'GTD' },
	{ label: 'lang_good_till_cancelled', value: 'GTC' },
	{ label: 'lang_fill_or_kill', value: 'FOK' },
	{ label: 'lang_fill_and_kill', value: 'FAK' },
	{ label: 'lang_immediate_or_cancel', value: 'IOC' }
]
class OrderList extends React.Component {
	constructor(props) {
		super(props);
		const initState = this.props.loadState();
		this.id = uuidv4();
		this.isReady = false;
		this.collapse = initState.collapse ? 1 : 0
		this.isConnected = dataStorage.connected;
		this.filterText = initState.valueFilter || '';
		// if (!initState.filterState) {
		// 	initState.filterState = '{"origination":{"value":["110","111","112","110##111##112","130","131","132","133","134","135","130##131##132##133##134##135"],"operator":"OR","filterType":"number","checkAll":0}}';
		// 	this.props.saveState(initState)
		// }
		this.pageObj = {
			total_count: 0,
			total_pages: 1,
			current_page: 1,
			temp_end_page: 0,
			page_size: 50
		}
		const filter = {
			option: (typeof initState.valFilter === 'string' ? [initState.valFilter] : initState.valFilter) || (initState.account && initState.account.filter && initState.account.filter.option) || [options[0].value],
			duration: initState.valFilterDuration ? initState.valFilterDuration : (optionsDurations[0].value || (initState.account && initState.account.filter && initState.account.filter.duration))
		};
		this.props.saveState({
			openWidget: 'OrderList',
			filter: filter,
			collapse: this.collapse
		})
		this.state = {
			openWidget: 'OrderList',
			filter: filter,
			accountObj: dataStorage.accountInfo || {},
			valueFilter: initState.valueFilter || '',
			minDate: initState.minDate || moment(),
			maxDate: initState.maxDate || moment(),
			isCustom: '0',
			currency: ''
		}
		this.columns = this.returnColumn(null);
		// this.resetDatepickerPosition = this.resetDatepickerPosition.bind(this);
		props.glContainer.on('show', () => {
			hideElement(props, false, this.id);
		});
		props.glContainer.on('hide', () => {
			hideElement(props, false, this.id);
		});
		props.resize(() => {
		});
		this.changeAccount = this.changeAccount.bind(this);
		this.realtimeData = this.realtimeData.bind(this);
		this.realTimeDataUser = this.realTimeDataUser.bind(this)
		this.returnColumn = this.returnColumn.bind(this)
		this.props.receive({
			account: this.changeAccount
		});
	}

	isFilled = () => {
		return this.state.filter && this.state.filter.option && this.state.filter.option.length === 1 && this.state.filter.option[0] === 'FILLED_'
	}

	returnColumn(currency) {
		return [
			{
				header: 'lang_user_login',
				name: 'user_login',
				hide: !this.props.allOrders,
				align: 'right',
				formater: (params) => {
					let orderAction = {}
					orderAction = (params.data && JSON.parse(params.data.order_action)) || {}
					return orderAction.user_login || '--'
				}
			},
			{
				header: 'lang_account_name',
				name: 'account_name',
				hide: true,
				formater: (params) => {
					return formatAccountName(params.data)
				}
			},
			{
				header: 'lang_account_id',
				hide: !this.props.allOrders || isOneAccount(),
				name: 'account_id',
				formater: (params) => {
					return formatAccountId(params.data)
				}
			},
			{
				header: 'lang_security_type',
				name: 'class',
				align: 'right',
				options: [
					{ label: LANG_CLASS.EQUITY, value: 'equity' },
					{ label: LANG_CLASS.ETF, value: 'etf' },
					{ label: LANG_CLASS.FUTURES, value: 'future' },
					{ label: LANG_CLASS.MF, value: 'managed funds' },
					{ label: LANG_CLASS.OPTION, value: 'option' },
					{ label: LANG_CLASS.WARRANT, value: 'warrant' },
					{ label: LANG_CLASS.OTHERS, value: 'Others' }
				],
				groupIndex: 0,
				valueGetter: (params) => {
					if (params.data) {
						let result;
						result = params.data.class || 'others'
						return (result + '').toUpperCase();
					}
				}
			},
			{
				header: 'lang_status',
				name: 'order_status',
				options: lstCheckStatus,
				type: TYPE.LABEL_WIDTH_BG,
				getBackgroundColorKey: (params) => {
					return colorOrder(params.data.order_status);
				},
				formater: (params) => {
					return getActionType(params.data.order_status, true);
				}
			},
			{
				header: 'lang_side',
				name: 'is_buy',
				options: lstCheckSide,
				type: TYPE.LABEL_WIDTH_BG,
				getBackgroundColorKey: (params) => {
					const side = formatSide(params.data);
					if (side === sideEnum.BUYSIDE) return '--background-green';
					return '--background-red';
				},
				formater: (params) => {
					const side = formatSide(params.data);
					return side;
				}
			},
			{
				header: 'lang_filled',
				align: 'right',
				name: 'filled_quantity',
				formater: (params) => {
					return formatFilledQuantity(params.data)
				}
			},
			{
				header: 'lang_code',
				name: 'symbol',
				type: TYPE.SYMBOL,
				formater: (params) => {
					return params.data.display_name || params.data.symbol;
				}
			},
			{
				header: 'lang_quantity',
				name: 'volume',
				align: 'right',
				valueGetter: params => {
					if (params.filled_quantity) return `${formatFilledQuantity(params.data)}/${formatVolume(params.data)}`
					else return formatVolume(params.data)
				}
			},
			{
				header: 'lang_limit_price',
				align: 'right',
				name: 'limit_price',
				formater: (params) => {
					return formatLimitPrice(params.data)
				}
			},
			{
				header: 'lang_stop_price',
				name: 'stop_price',
				align: 'right',
				formater: (params) => {
					return formatStopPrice(params.data)
				}
			},
			{
				header: 'lang_filled_price',
				align: 'right',
				name: 'avg_price',
				formater: (params) => {
					return formatNumberPrice(params.data.avg_price, true);
				}
			},
			{
				header: 'lang_order_type',
				name: 'order_type',
				options: lstCheckOrderType,
				formater: (params) => {
					return formatOrderType(params.data, true);
				}
			},
			{
				header: 'lang_time_in_force',
				name: 'duration',
				options: lstCheckDuration,
				formater: (params) => {
					return formatDuration(params.data, true)
				}
			},
			{
				header: 'lang_security',
				name: 'company_name',
				formater: (params) => {
					return formatCompanyName(params.data)
				}
			},
			{
				header: 'lang_destination',
				name: 'destination',
				formater: (params) => {
					return formatDestinationOrderList(params.data)
				}
			},
			{
				header: 'lang_exchange',
				name: 'exchange',
				formater: (params) => {
					if (!params.data) return '';
					let exchange = getDisplayExchange(params.data)
					if (exchange === '--') {
						exchange = params.data.exchange || '--'
					}
					return exchange
				}
			},
			{
				header: 'lang_advisor',
				name: 'advisor_code',
				formater: (params) => {
					return formatAdvisorCode(params.data)
				}
			},
			{
				header: 'lang_order_id',
				name: 'broker_order_id',
				pinned: 'left',
				formater: (params) => {
					return formatOrderId(params.data)
				}
			},
			{
				header: 'lang_entry_time',
				name: 'init_time',
				formater: (params) => {
					return formatInitTime(params.data, dataStorage.timeZone, true);
				}
			},
			{
				header: 'lang_origination',
				hide: true,
				name: 'origination',
				options: lstOrigination,
				formater: (params) => {
					return getOrigination(params.data.origination);
				}
			},
			{
				header: 'lang_last_updated',
				name: 'updated',
				hide: true,
				formater: (params) => {
					let data = params.data;
					return toDisplayTime(data.updated);
				}
			},
			{
				header: this.isFilled() ? 'lang_fees' : 'lang_est_dot_fees',
				name: 'estimated_fees',
				align: 'right',
				formater: (params) => {
					return formatOrderField(params.data, 'estimated_fees', currency)
				}
			},
			{
				header: this.isFilled() ? 'lang_total' : 'lang_est_dot_total',
				name: 'total_convert',
				align: 'right',
				formater: (params) => {
					return formatEstTotalAud(params.data, currency)
				}
			},
			{
				header: 'lang_action',
				name: 'actionOrder',
				float: true,
				type: TYPE.ORDER_ACTION
			}
		];
	}
	getFilterOnSearch = (query, noReSetPage, rangeTime) => {
		if (!this.props.allOrders && (!this.state.accountObj || !this.state.accountObj.account_id)) {
			console.log('YOLO accountObj')
			return
		}
		if (query) this.filterAndSearch = query;
		if (!this.filterAndSearch) {
			console.log('YOLO filterAndSearch')
			return;
		}
		const filterBody = clone(this.filterAndSearch);
		if (!noReSetPage) this.page_id = 1;
		if (this.state.filter.option.length) {
			let fromDate
			let toDate
			if (this.state.filter.duration === 'custom') {
				if (!rangeTime) {
					rangeTime = {
						min: this.state.minDate,
						max: this.state.maxDate
					}
				}
			}
			if (!rangeTime) {
				if (this.state.filter.duration === 'custom') {
					fromDate = convertTimeStamp(getStartTime(moment()))
					toDate = convertTimeStamp(getEndTime())
				} else {
					fromDate = convertTimeStamp(getStartTime(this.state.filter.duration), true)
					toDate = convertTimeStamp(getEndTime())
				}
			} else {
				fromDate = convertFormatStpOfPicker(rangeTime.min, dataStorage.timeZone, true)
				toDate = convertFormatStpOfPicker(rangeTime.max, dataStorage.timeZone)
			}
			const orderTag = this.state.filter.option.map(item => {
				if (item === 'FILLED_' || item === 'CANCELLED_') {
					return {
						'bool': {
							'must': [
								{
									'term': {
										'order_tag': {
											'value': dicOrderTag[item]
										}
									}
								},
								{
									'range': {
										'updated': {
											'from': fromDate,
											'to': toDate
										}
									}
								}
							]
						}
					}
				}
				return {
					'term': {
						'order_tag': {
							'value': dicOrderTag[item]
						}
					}
				}
			})
			filterBody.query.bool.must.push({
				'bool': {
					'should': orderTag
				}
			});
			if (!this.props.allOrders && this.state.accountObj && this.state.accountObj.account_id) {
				filterBody.query.bool.must.push({
					'term': {
						'account_id.keyword': {
							'value': this.state.accountObj.account_id
						}
					}
				});
			}
			filterBody.query.bool.must.push({
				'script': {
					'script': "if(doc['origin_broker_order_id.keyword'].size()!=0)doc['origin_broker_order_id.keyword'].value==doc['broker_order_id.keyword'].value"
				}
			});

			this.props.loading(true);
			const requestId = uuidv4();
			this.requestId = requestId;
			const url = getApiFilter('order', this.page_id);
			postData(url, filterBody)
				.then(response => {
					this.props.loading(false);
					if (requestId !== this.requestId) return;
					const data = (response.data) || [];
					if (data.length === 0 || (data.data && data.data.length === 0)) {
						this.pageObj = {
							total_count: 0,
							total_pages: 1,
							current_page: 1,
							temp_end_page: 0,
							page_size: 50
						};
						this.setData([]);
						this.setPage && this.setPage(this.pageObj);
						return
					}
					if (data.total_pages || data.total_pages === 0) {
						this.pageObj = {
							total_count: data.total_count || 0,
							total_pages: data.total_pages || 1,
							current_page: data.current_page,
							temp_end_page: 0,
							page_size: 50
						};
						const lstSymbol = [];
						this.setPage && this.setPage(this.pageObj);
						for (let i = 0; i < data.data.length; i++) {
							let item = data.data[i];
							if (!dataStorage.symbolsObjDic[item.symbol]) {
								lstSymbol.push(encodeURIComponent(item.symbol));
							}
						}
						(async () => {
							if (lstSymbol.length) {
								const symbolStringUrl = makeSymbolUrl(lstSymbol.join(','));
								this.props.loading(true)
								await getData(symbolStringUrl)
									.then(response => {
										this.props.loading(false)
										if (response.data && response.data.length) {
											for (let i = 0; i < response.data.length; i++) {
												dataStorage.symbolsObjDic[response.data[i].symbol] = response.data[i]
											}
										}
									})
									.catch(error => {
										logger.log(error)
									})
							}
							data.data.forEach(item => {
								const symbolObj = dataStorage.symbolsObjDic[item.symbol] || {};
								this.mapSymbol(item, symbolObj);
							})
							this.setData(data.data);
						})();
					}
				})
				.catch(error => {
					logger.log(error)
					this.props.loading(false)
					if (requestId !== this.requestId) return;
					if (error.message && error.message !== '' && error.message.toUpperCase() === errorEnum.NETWORK_ERROR) {
						//
					} else {
						this.pageObj = {
							total_count: 0,
							total_pages: 1,
							current_page: 1,
							temp_end_page: 0,
							page_size: 50
						};
						this.setData([]);
						this.setPage(this.pageObj)
					}
				});
		} else {
			this.setData([]);
		}
	}
	getSubOrder = (data, setDetail) => {
		const query = {
			'query': {
				'bool': {
					'must': [
						{
							'term': {
								'origin_broker_order_id': {
									'value': data.broker_order_id
								}
							}
						},
						{
							'script': {
								'script': "if(doc['origin_broker_order_id.keyword'].size()!=0)doc['origin_broker_order_id.keyword'].value!=doc['broker_order_id.keyword'].value"
							}
						}
					]
				}
			},
			'sort': [
				{
					'updated': {
						'order': 'desc'
					}
				}
			]
		}
		const url = getApiFilter('order', 1, 200);
		postData(url, query)
			.then(response => {
				setDetail((response.data && response.data.data) || []);
			})
			.catch(error => {
				console.log('error getSubOrder: ', error);
				setDetail();
			});
	}

	changeAccount(account) {
		if (this.props.allOrders) return;
		if (!account) account = dataStorage.accountInfo;
		if (!account || !account.account_id) return
		if (!account) account = {};
		if (!this.state.accountObj || this.state.accountObj.account_id !== account.account_id) {
			this.setState({
				accountObj: account,
				currency: account.currency
			}, () => {
				if (!this.props.allOrders) this.setColumn(this.returnColumn(this.state.currency))
				this.getFilterOnSearch()
				this.props.send({
					account: account
				})
			})
		}
	}

	handleOnChangeDropDown(index) {
		try {
			const filter = this.state.filter;
			filter.option = index;
			this.page_id = 1;
			this.setData([]);
			if (!index || (index && index.length <= 0)) {
				this.setPage({
					total_count: 0,
					total_pages: 1,
					current_page: 1,
					temp_end_page: 0
				})
			}
			this.props.saveState({
				filter: filter,
				valFilter: index
			})
			this.setState({
				filter
			}, () => {
				this.setColumn(this.returnColumn(this.state.currency))
				this.getFilterOnSearch();
			});
		} catch (error) {
			logger.error('handleOnChangeDropDown On OrderList ' + error)
		}
	}

	handleOnDurationChangeDropDown(index) {
		try {
			const filter = this.state.filter;
			filter.duration = index;
			this.setData([]);
			this.props.saveState({
				filter: filter,
				valFilterDuration: index
			})
			this.setState({
				filter,
				isCustom: (filter.duration === 'custom' ? '1' : '0')
			}, () => {
				this.getFilterOnSearch();
			});
		} catch (error) {
			logger.error('handleOnDurationChangeDropDown On OrderList ', error)
		}
	}
	countParent = (lst) => {
		const uniqueKey = {};
		lst.map(item => {
			uniqueKey[item.origin_broker_order_id] = true;
		});
		return Object.keys(uniqueKey).length
	}

	async realtimeData(data, title) {
		if (!this.props.allOrders) {
			if (this.state.accountObj && this.state.accountObj.account_id && this.state.accountObj.account_id !== data.account_id) return
		}
		if (this.props.allOrders && this.page_id && this.page_id !== 1) return;
		if (title) {
			if (/#SUCCESS$/.test(title)) return
			if (/#REJECT$/.test(title)) return
			if (/#TIMEOUT/.test(title)) return
		}
		if (!data) return;
		if (data.broker_order_id !== data.origin_broker_order_id) {
			dataStorage.symbolsObjDic[data.symbol] && this.mapSymbol(data, dataStorage.symbolsObjDic[data.symbol]);
			this.addDetail(data, data.origin_broker_order_id);
			return;
		}
		if (!this.doesRowPassFilter(data)) return;
		if (!this.dicOrderId) this.dicOrderId = {};
		const oldData = this.dicOrderId[data.broker_order_id];
		if (oldData && oldData.seq_num > data.seq_num) return;
		if (oldData && oldData.seq_num === data.seq_num && oldData.updated > data.updated) return;
		this.dicOrderId[data.broker_order_id] = data;
		const filter = this.state.filter ? this.state.filter.option : [];
		let symbolObj = dataStorage.symbolsObjDic[data.symbol];
		if (symbolObj) {
			this.mapSymbol(data, symbolObj)
		} else {
			if (!dataStorage.symbolsObjDic[data.symbol]) {
				const urlMarketInfo = makeSymbolUrl(encodeURIComponent(data.symbol))
				await getData(urlMarketInfo)
					.then(response => {
						if (response.data && response.data[0]) {
							symbolObj = response.data[0]
							dataStorage.symbolsObjDic[data.symbol] = symbolObj
							this.mapSymbol(data, symbolObj)
						}
					})
					.catch(error => {
						logger.log(error)
					})
			}
		}
		if (this.state.filter.duration === 'custom') {
			if (data && data.init_time) {
				let fromDate = convertFormatStpOfPicker(this.state.minDate, dataStorage.timeZone, true)
				let toDate = convertFormatStpOfPicker(this.state.maxDate, dataStorage.timeZone)
				if (!((fromDate < data.init_time) && (toDate > data.init_time))) {
					return
				}
			}
		}
		if ([
			orderState.CANCELLED,
			orderState.EXPIRED,
			orderState.REJECTED,
			orderState.UNKNOWN
		].indexOf(data.order_status) > -1
		) {
			if (filter.indexOf('CANCELLED_') > -1) {
				this.addOrUpdate(data);
			} else {
				this.remove(data)
			}
		} else if (data.order_status === orderState.FILLED) {
			if (filter.indexOf('FILLED_') > -1) {
				this.addOrUpdate(data);
			} else {
				this.remove(data)
			}
		} else {
			if (filter.indexOf('WORKING_') > -1 && (data.condition_name + '').toUpperCase() !== 'STOPLOSS') {
				this.addOrUpdate(data);
			} else if (filter.indexOf('STOPLOSS_') > -1 && (data.condition_name + '').toUpperCase() === 'STOPLOSS') {
				this.addOrUpdate(data);
			} else {
				this.remove(data)
			}
		}
	}
	mapSymbol(data, symbolObj) {
		data.company_name = symbolObj.company_name || symbolObj.company || ''
		data.display_name = symbolObj.display_name || ''
		data.trading_halt = symbolObj.trading_halt || 0
		data.display_exchange = symbolObj.display_exchange || ''
		data.class = symbolObj.class || ''
		data.display_master_code = symbolObj.display_master_code || ''
		data.display_master_name = symbolObj.display_master_name || ''
		data.security_name = symbolObj.security_name || ''
		data.country = symbolObj.country || ''
		data.currency = symbolObj.currency || ''
		data.master_code = symbolObj.master_code
		data.first_noti_day = symbolObj.first_noti_day
		data.expiry_date = symbolObj.expiry_date
	}

	refreshData = (eventName) => {
		try {
			if (eventName !== 'refresh') return;
			this.getFilterOnSearch();
		} catch (error) {
			logger.error('refreshData On OrderList ', error)
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		try {
			if (nextState.isHidden) return false;
			if (dataStorage.checkUpdate) {
				return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
			}
			return true;
		} catch (error) {
			logger.error('shouldComponentUpdate On OrderList', error)
		}
	}

	pageChanged(pageId) {
		if (this.page_id === pageId) return;
		this.page_id = pageId;
		this.getFilterOnSearch(null, true, null);
	}

	tempEndPage(tempEndPage) {
		if (tempEndPage) {
			this.pageObj.temp_end_page = tempEndPage
		}
	}

	dataReceivedFromSearchAccount(data) {
		if (data) {
			this.changeAccount(data)
			data.filter = this.state.filter
			this.props.send({
				account: data
			})
		}
	}

	onRowClicked = async (data) => {
		if (data && data.symbol) {
			this.dicSymbol = {}
			this.dicAccount = {}
			if (!this.dicSymbol[data.symbol]) {
				const url = makeSymbolUrl(encodeURIComponent(data.symbol))
				// this.props.loading(true)
				await getData(url)
					.then(response => {
						// this.props.loading(false)
						if (response.data && response.data.length) {
							this.dicSymbol[data.symbol] = response.data[0]
						}
					})
					.catch(error => {
						logger.log(error)
						// this.props.loading(false)
					})
			}
			if (!this.dicAccount[data.account_id]) {
				const url = getUrlAnAccount(data.account_id)
				await getData(url)
					.then(res => {
						this.dicAccount[data.account_id] = res.data[0]
					})
					.catch(error => {
						logger.log(error)
						// this.props.loading(false)
					})
			}
			this.props.send({
				symbol: this.dicSymbol[data.symbol],
				account: this.dicAccount[data.account_id]
			})
		}
	}

	handleChangeMinDate = (date) => {
		try {
			this.setState({
				minDate: date,
				value: 0,
				openDatePickerFrom: false
			}, () => {
				this.handleAllMaxMinDate(date, this.state.maxDate);
				this.checkFromDate = moment(date).tz(dataStorage.timeZone).format('DD/MM/YYYY');
			})
			this.props.saveState({
				minDate: date
			})
		} catch (error) {
			logger.error('handleChangeMinDate On ReportsTab' + error)
		}
	};

	handleChangeMaxDate = (date) => {
		try {
			this.setState({
				maxDate: date,
				value: 0,
				openDatePickerTo: false
			}, () => {
				this.handleAllMaxMinDate(this.state.minDate, date);
				this.checkToDate = moment(date).tz(dataStorage.timeZone).format('DD/MM/YYYY');
			})
			this.props.saveState({
				maxDate: date
			})
		} catch (error) {
			logger.error('handleChangeMaxDate On ReportsTab' + error)
		}
	}

	handleAllMaxMinDate(min, max) {
		try {
			const rangeTime = {
				min: min,
				max: max
			}
			this.getFilterOnSearch(null, null, rangeTime)
		} catch (err) {
			console.log('handleAllMaxMinDate')
		}
	}
	onChangeDate(type, value) {
		if (type === 'from') {
			this.fromDate = value;
		} else {
			this.toDate = value;
		}
	}

	handleOnClickOutside(isFrom) {
		try {
			if (isFrom && this.checkFromDate === moment(this.state.minDate).format('DD/MM/YYYY')) return;
			if (!isFrom && this.checkToDate === moment(this.state.maxDate).format('DD/MM/YYYY')) return;
			if (typeof (this.fromDate) === 'string') this.fromDate = parseInt(this.fromDate);
			if (typeof (this.toDate) === 'string') this.toDate = parseInt(this.toDate);
			const fromDate = moment(this.fromDate).format('DD/MM/YYYY');
			const toDate = moment(this.toDate).format('DD/MM/YYYY');
			const newValue = isFrom ? this.fromDate.split('/') : this.toDate.split('/');
			const newDay = parseInt(newValue[0]);
			const newMonth = parseInt(newValue[1]) - 1;
			const newYear = parseInt(newValue[2]);
			const newDate = new Date(newYear, newMonth, newDay);
			if (isFrom) {
				if (fromDate.includes('d') || fromDate.includes('m') || fromDate.includes('y') ||
					newDate.getTime() > this.state.maxDate.getTime() || !this.checkDateInvalid(newYear, newMonth, newDay)) {
					this.setState({
						openDatePickerTo: false,
						openDatePickerFrom: false
					})
				} else {
					this.getDataFromTimeTab(newDate, this.state.maxDate, true);
					this.setState({
						minDate: newDate,
						openDatePickerTo: false,
						openDatePickerFrom: false
					})
				}
			} else {
				if (toDate.includes('d') || toDate.includes('m') || toDate.includes('y') ||
					newDate.getTime() < this.state.minDate.getTime() || !this.checkDateInvalid(newYear, newMonth, newDay)) {
					this.setState({
						openDatePickerTo: false,
						openDatePickerFrom: false
					})
				} else {
					this.getDataFromTimeTab(this.state.minDate, newDate, true);
					this.setState({
						maxDate: newDate,
						openDatePickerTo: false,
						openDatePickerFrom: false
					})
				}
			}
		} catch (error) {
			logger.error('handleOnClickOutside On ReportsTab' + error)
		}
	}

	renderFromDate() {
		const check = checkToday(moment(this.state.maxDate));
		return (
			<DatePicker
				customInput={<ExampleCustomInput type='from' onChangeDate={this.onChangeDate.bind(this, 'from')} />}
				selected={moment(this.state.minDate)}
				maxDate={check ? moment() : moment(this.state.maxDate)}
				// onClickOutside={() => this.handleOnClickOutside(true)}
				onChange={this.handleChangeMinDate.bind(this)}
			/>
		);
	}

	renderToDate() {
		return (
			<DatePicker
				customInput={<ExampleCustomInput type='to' onChangeDate={this.onChangeDate.bind(this, 'to')} />}
				selected={moment(this.state.maxDate)}
				minDate={moment(this.state.minDate)}
				maxDate={moment()}
				// onClickOutside={() => this.handleOnClickOutside(false)}
				onChange={this.handleChangeMaxDate.bind(this)}
			/>
		);
	}
	getCsvFunction = (obj) => {
		if (this.csvWoking) return;
		this.csvWoking = true;
		getCsvFile({
			url: getReportCsvFileUrl('order'),
			body_req: this.filterAndSearch,
			columnHeader: obj.columns,
			lang: dataStorage.lang,
			glContainer: this.props.glContainer
		}, () => {
			this.csvWoking = false;
		});
	}
	returnDicDataOrigin = (id) => {
		return this.dicDataOrigin[id]
	}

	collapseFunc = (collapse) => {
		this.collapse = collapse ? 1 : 0
		this.props.saveState({
			collapse: this.collapse
		})
		this.forceUpdate()
	}

	createMoreOption = () => {
		const check = checkToday(moment(this.state.maxDate));
		return [
			{
				component: <div className={`fullw100`}><MultiDropDown
					className="DropDownOrder"
					translate={true}
					options={options}
					value={this.state.filter.option}
					onChange={this.handleOnChangeDropDown.bind(this)}
				/>
				</div>
			},
			{
				component: (this.state.filter.option.indexOf('FILLED_') > -1 || this.state.filter.option.indexOf('CANCELLED_') > -1)
					? <div className={`dropDownNormal`}>
						<DropDown
							className="DropDownOrder"
							translate={true}
							options={optionsDurations}
							value={this.state.filter.duration}
							onChange={this.handleOnDurationChangeDropDown.bind(this)}
						/>
					</div>
					: <div></div>
			},
			{
				component: this.state.filter.duration === 'custom' && (this.state.filter.option.indexOf('FILLED_') > -1 || this.state.filter.option.indexOf('CANCELLED_') > -1)
					? <div className="input-date-gr">
						<DatePicker
							customInput={<ExampleCustomInput type='from' onChangeDate={this.onChangeDate.bind(this, 'from')} />}
							selected={this.state.minDate}
							maxDate={check ? moment().tz(dataStorage.timeZone) : this.state.maxDate}
							onClickOutside={() => this.handleOnClickOutside(true)}
							onChange={this.handleChangeMinDate.bind(this)}
							isMinDate={true}
						/>
					</div>
					: null
			},
			{
				component: this.state.filter.duration === 'custom' && (this.state.filter.option.indexOf('FILLED_') > -1 || this.state.filter.option.indexOf('CANCELLED_') > -1)
					? <div className="input-date-gr input-date-gr-to">
						<DatePicker
							customInput={<ExampleCustomInput type='to' onChangeDate={this.onChangeDate.bind(this, 'to')} />}
							selected={this.state.maxDate}
							minDate={this.state.minDate}
							maxDate={moment().tz(dataStorage.timeZone)}
							onClickOutside={() => this.handleOnClickOutside(false)}
							onChange={this.handleChangeMaxDate.bind(this)}
						/>
					</div>
					: null
			}
		]
	}

	createagSideButtons = () => {
		return [
			{
				value: 'ExportCSV',
				label: 'lang_export_csv',
				callback: () => this.exportCSV()
			},
			{
				value: 'ResetFilter',
				label: 'lang_reset_filter',
				callback: () => this.resetFilter(true)
			},
			{
				value: 'Resize',
				label: 'lang_resize',
				callback: () => this.resize()
			},
			{
				value: 'Columns',
				label: 'lang_columns',
				callback: (bound, optionBound) => this.showColumnMenu(optionBound)
			},
			{
				value: 'Filters',
				label: 'lang_filters',
				callback: (bound, optionBound) => this.showFilterMenu(optionBound)
			}
		]
	}

	triggerButton = (btn) => {
		this.dom.querySelector('button ' + btn).click()
	}

	onRowDbClick = (data) => {
		dataStorage.goldenLayout.addComponentToStack('Order', {
			needConfirm: false,
			stateOrder: 'DetailOrder',
			data,
			currency: data.currency || 'needGetAccount',
			color: 5
		})
	}

	render() {
		try {
			let accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
			let accountName = (this.state.accountObj && this.state.accountObj.account_name) || '';
			return (
				<div id='orderRoot' className='orderRootAdmin alwaysShow qe-widget qe-form' ref={dom => this.dom = dom}>
					<div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`}>
						<div className='navbar'>
							<div className='accountSumSearch size--3' style={{ marginBottom: '0px' }}>
								{this.props.allOrders
									? null
									: <div className='accSearchRowAd'>
										<SearchAccount
											position={'left'}
											accountSumFlag={true}
											accountId={accountId}
											dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)} />
										<div className={`rightRowOrderPad accSumName size--3 showTitle`}>{`${accountName} ${accountId ? '(' + accountId + ')' : ''}`}</div>
									</div>
								}
								<div className={`orderSearch ${this.props.allOrders ? 'fullw100' : ''}`}>
									<FilterBox
										onChange={(e) => {
											this.setQuickFilter(e)
										}}
										value={this.state.valueFilter}
									/>
								</div>
							</div>
						</div>
						<MoreOption lstItems={this.createMoreOption()} agSideButtons={this.createagSideButtons()} />
					</div>
					<ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
					<Grid
						{...this.props}
						id={this.props.allOrders ? FORM.ALL_ORDERS : FORM.ORDERS}
						onRowClicked={this.onRowClicked.bind(this)}
						paginate={{
							setPage: (cb) => {
								this.setPage = cb
							},
							pageChanged: this.pageChanged.bind(this),
							temp_end_page: this.tempEndPage.bind(this)
						}}
						columns={this.columns}
						onRowDbClick={this.onRowDbClick}
						detailSource={dataStorage.env_config.env === 'equix' ? null : this.getSubOrder}
						getFilterOnSearch={this.getFilterOnSearch}
						fnKey={data => {
							return data.broker_order_id;
						}}
						// getCsvFunction={this.getCsvFunction}
						fn={fn => {
							this.addDetail = fn.addDetail
							this.addOrUpdate = fn.addOrUpdate
							this.remove = fn.remove
							this.setData = fn.setData
							this.getData = fn.getData
							this.setColumn = fn.setColumn
							this.doesRowPassFilter = fn.doesRowPassFilter
							this.resize = fn.autoSize
							this.exportCSV = fn.exportCsv
							this.resetFilter = fn.resetFilter
							this.setQuickFilter = fn.setQuickFilter
							this.showColumnMenu = fn.showColumnMenu
							this.showFilterMenu = fn.showFilterMenu
						}}
						widgetName={'orderList'}
						sort={{
							updated: 'desc'
						}} />
				</div>
			)
		} catch (error) {
			logger.error('render On OrderList ', error)
		}
	}
	realTimeDataUser(value) {
		if (value.timezone) {
			this.setState({
				minDate: getStartTime(this.state.minDate),
				maxDate: getEndTime(getResetMaxDate(this.state.maxDate))
			}, () => {
				this.refreshData('refresh')
			})
		}
	}
	componentDidMount() {
		try {
			const userId = dataStorage.userInfo.user_id;
			addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
			registerAllOrders(this.realtimeData, 'order');
			// unregisterUser(userId, this.realTimeData, 'user_setting')
			registerUser(userId, this.realTimeDataUser, 'user_setting');
		} catch (error) {
			logger.error('componentDidMount On OrderList ', error)
		}
	}

	componentWillUnmount() {
		try {
			const userId = dataStorage.userInfo.user_id;
			removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
			unregisterUser(userId, this.realTimeDataUser, 'user_setting')
			unregisterAllOrders(this.realtimeData, 'order');
		} catch (error) {
			logger.error('componentWillUnmount On OrderList ', error)
		}
	}
}

export default translate('translations')(OrderList);
