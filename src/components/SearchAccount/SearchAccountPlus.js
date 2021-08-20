import React from 'react';
import onClickOutside from 'react-onclickoutside';
import uuidv4 from 'uuid/v4';
import { getData, getAllAccountUrl } from '../../helper/request'
import { checkPropsStateShouldUpdate, calculatePositionSearchBox, checkIsAdvisor } from '../../helper/functionUtils';
import logger from '../../helper/log';
import { translate } from 'react-i18next';
import dataStorage from '../../dataStorage';
class SearchAccount extends React.Component {
    constructor(props) {
        super(props);
        this.curentIndex = -1;
        this.lastDownTarget = null;
        this.searchBox = '';
        this.id = uuidv4();
        this.state = {
            valueSearch: '',
            dataSearch: [],
            loadingSearch: true
        };
    }

    nextHoverElement(unit) {
        try {
            this.curentIndex = this.curentIndex + unit;
            if (unit < 0 && this.curentIndex <= 0) {
                this.curentIndex = 0;
            }
            const nextElement = document.getElementById(`itemSuggest_${this.id}_${this.curentIndex}`);
            const currentlement = document.getElementById(`itemSuggest_${this.id}_${this.curentIndex - unit}`);

            if (nextElement) {
                nextElement.className = nextElement.className + ' itemSuggestSetHover';

                if (nextElement.offsetTop < nextElement.parentNode.scrollTop) {
                    nextElement.parentNode.scrollTop = nextElement.offsetTop
                }
                if (nextElement.offsetTop + nextElement.clientHeight > nextElement.parentNode.clientHeight + nextElement.parentNode.scrollTop) {
                    nextElement.parentNode.scrollTop = nextElement.offsetTop - nextElement.parentNode.clientHeight + nextElement.clientHeight
                }
            } else {
                if (this.curentIndex > 0 || this.curentIndex < 0) {
                    this.curentIndex = -1;
                    this.nextHoverElement(unit);
                }
            }
            if (currentlement) {
                currentlement.className = (currentlement.className + '').replace(/itemSuggestSetHover/g, '');
            }
        } catch (error) {
            logger.error('nextHoverElement On SearchBox' + error)
        }
    }
    componentWillReceiveProps(nextProps) {
        if (document.activeElement !== this.searchBox) {
            if (nextProps.accountId) {
                this.searchBox.value = nextProps.accountId
            } else {
                this.searchBox.value = ''
            }
        }
    }

    componentWillUnmount() {
        try {
            document.removeEventListener('mousedown', this.listenerMouseDown.bind(this), false);
            this.searchBox.removeEventListener('keydown', this.listenerKeyDown.bind(this), false);
        } catch (error) {
            logger.error('componentWillUnmount On SearchBox' + error)
        }
    }

    listenerMouseDown(event) {
        try {
            this.lastDownTarget = event.target;
            if (this.lastDownTarget && this.lastDownTarget.id === `searchBoxSelector_${this.id}`) {
                this.curentIndex = -1;
            }
        } catch (error) {
            logger.error('listenerMouseDown On SearchBox' + error)
        }
    }

    listenerKeyDown(event) {
        try {
            this.lastDownTarget = event.target;
            if (this.lastDownTarget && this.searchBox && this.lastDownTarget.id === this.searchBox.id) {
                if (event.keyCode === 40) {
                    this.nextHoverElement(1);
                    // down
                }
                if (event.keyCode === 38) {
                    // up
                    this.nextHoverElement(-1);
                }
            }
        } catch (error) {
            logger.error('listenerKeyDown On SearchBox' + error)
        }
    }

    handleOnInput(e) {
        this.setTimeOutID && clearTimeout(this.setTimeOutID)
        this.searchBox.value = e.target.value;
        (this.searchBox.value + '').length >= 2 ? this.setTimeOutID = setTimeout(() => {
            this.searchSymbol(this.searchBox.value)
        }, 300) : this.setState({ dataSearch: [] })
    }

    search() {
        try {
            const dataSearch = this.state.dataSearch
            if (dataSearch.length !== 0 && this.curentIndex > -1) {
                this.props.dataReceivedFromSearchAccount(dataSearch[this.curentIndex] || {})
                this.searchBox.value = dataSearch[this.curentIndex].account_id
                if (this.searchBox.value) {
                    this.oldValue = this.searchBox.value;
                }

                this.setState({
                    dataSearch: []
                })
            } else {
                if (!dataSearch || dataSearch.length === 0) {
                    if (this.searchBox.value !== '') return
                    this.props.dataReceivedFromSearchAccount({})
                    this.searchBox.value = ''
                } else {
                    this.props.dataReceivedFromSearchAccount(dataSearch[0])
                    this.searchBox.value = dataSearch[0].account_id || ''
                    if (this.searchBox.value) {
                        this.oldValue = this.searchBox.value;
                    }

                    this.setState({
                        dataSearch: []
                    })
                }
            }
        } catch (error) {
            logger.error('search On SearchBox' + error)
        }
    }

    handleKeyPress = (event) => {
        try {
            if (event.key === 'Enter') {
                this.search();
            }
        } catch (error) {
            logger.error('handleKeyPress On SearchBox' + error)
        }
    }

    handleClickGo = (event) => {
        try {
            if (!this.props.placing) this.search();
        } catch (error) {
            logger.error('handleClickGo On SearchBox' + error)
        }
    }

    showSuggest() {
        try {
            calculatePositionSearchBox(this.searchAccountDom, '.searchSuggest')
            if (this.state.dataSearch && this.state.dataSearch.length > 0) {
                return 'searchSuggest size--3 '
            } else {
                return 'searchSuggest size--3 disable '
            }
        } catch (error) {
            logger.error('showSuggest On SearchBox' + error)
        }
    }

    searchSymbol(stringSearch) {
        try {
            this.setState({
                loadingSearch: true
            })
            if (stringSearch.length > 0) {
                const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
                const url = getAllAccountUrl(userId, 1, 50, stringSearch, checkIsAdvisor())

                getData(url).then((response) => {
                    if (this.searchBox && this.searchBox.value !== stringSearch) return
                    if (response.data) {
                        let data = []
                        if (response.data.data && response.data.data.length) {
                            if (this.props.showInactiveAccount) {
                                data = response.data.data
                            } else {
                                data = response.data.data.filter(item => item.status === 'active')
                            }
                        }
                        this.setState({
                            dataSearch: data
                        }, () => {
                            this.setState({
                                loadingSearch: false
                            })
                        })
                    }
                })
            } else {
                this.setState({
                    dataSearch: []
                })
            }
        } catch (error) {
            logger.error('searchSymbol On SearchBox' + error)
        }
    }

    clickItemSuggest(item) {
        try {
            this.searchBox.value = item.account_id;
            if (this.searchBox.value) {
                this.oldValue = this.searchBox.value;
            }
            this.setState({
                dataSearch: []
            });
            this.props.dataReceivedFromSearchAccount(item)
        } catch (error) {
            logger.error('clickItemSuggest On SearchBox' + error)
        }
    }

    renderSuggest() {
        try {
            let listSearch = this.state.dataSearch

            if (!listSearch || listSearch.length === 0) return
            return listSearch.map((item, index) => {
                return <ItemSuggest
                    key={index}
                    keyItem={index}
                    id={this.id}
                    highlight={item.symbol === this.state.valueSearch}
                    clickItemSuggest={this.clickItemSuggest.bind(this)}
                    item={item} />
            })
        } catch (error) {
            logger.error('renderSuggest On SearchBox' + error)
        }
    }

    handleClickOutside = evt => {
        try {
            this.setState({
                dataSearch: []
            })
        } catch (error) {
            logger.error('handleClickOutside On SearchBox' + error)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                const check = checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
                return check;
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On SearchBox', error)
        }
    }

    handleOnBlur() {
        if (!this.searchBox.value) {
            this.searchBox.value = this.oldValue || '';
        }
    }

    render() {
        try {
            return (
                <div className={this.props.accountSumFlag ? 'searchAccountContainer accountSum' : 'searchAccountContainer'} ref={dom => this.searchAccountDom = dom}>
                    <div style={{
                        filter: this.placing ? 'brightness(70%)' : 'brightness(100%)'
                    }} className={'inputAddon size--3'}>
                        <input
                            className={this.state.trading_halt ? 'inputHalt size--3' : 'size--3'}
                            ref={dom => this.searchBox = dom}
                            id={`searchBoxSelector_${this.id}`}
                            disabled={!!this.props.placing}
                            type='text'
                            // value={this.state.valueSearch}
                            defaultValue={this.props.display_name}
                            onInput={this.handleOnInput.bind(this)}
                            onKeyPress={this.handleKeyPress}
                            onBlur={this.handleOnBlur.bind(this)}
                            required
                        />
                        <div className='placeHolder'>ADD...</div>
                        {/* <div className={'button'} onClick={this.handleClickGo}>{t('Go')}</div> */}
                    </div>
                    <div className={this.showSuggest()} >
                        {this.state.loadingSearch ? <div className='loaderGrid'></div> : this.renderSuggest()}
                    </div>
                </div>
            )
        } catch (error) {
            logger.error('render On SearchBox' + error)
        }
    }

    componentDidMount() {
        try {
            this.lastDownTarget = null;
            document.addEventListener('mousedown', this.listenerMouseDown.bind(this), false);
            this.searchBox.addEventListener('keydown', this.listenerKeyDown.bind(this), false);
        } catch (error) {
            logger.error('componentDidMount On SearchBox' + error)
        }
    }
}

export default translate('translations')(onClickOutside(SearchAccount));
