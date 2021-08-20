import React from 'react';
import ItemSuggest from './ItemSuggest';
import { getData } from '../../helper/request'
import { checkPropsStateShouldUpdate, getDropdownContentDom } from '../../helper/functionUtils';
import uuidv4 from 'uuid/v4';
import Lang from '../Inc/Lang'
import logger from '../../helper/log';
import { translate } from 'react-i18next';
import dataStorage from '../../dataStorage';
import onClickOutside from 'react-onclickoutside';
import userTypeEnum from '../../constants/user_type_enum';
class SearchCode extends React.Component {
    constructor(props) {
        super(props);
        this.isFocus = false;
        this.curentIndex = -1;
        this.lastDownTarget = null;
        this.searchBox = null;
        this.id = uuidv4();
        this.state = {
            valueSearch: '',
            dataSearch: [],
            loadingSearch: false
        };
        this.handlerClickOutside = this.handlerClickOutside.bind(this)
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

    handlerClickOutside(e) {
        if ((this.dom && !this.dom.contains(e.target)) && (this.floatContent && !this.floatContent.contains(e.target))) {
            this.disableDropdown()
        }
    }

    componentWillUnmount() {
        try {
            const dropDownContent = document.getElementById('dropDownContent')
            dropDownContent && this.floatContent && dropDownContent.contains(this.floatContent) && dropDownContent.removeChild(this.floatContent);
            document.removeEventListener('mousedown', this.listenerMouseDown.bind(this), false);
            this.searchBox && this.searchBox.removeEventListener('keydown', this.listenerKeyDown.bind(this), false);
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
        if ((this.searchBox.value + '').length >= 2) {
            this.setTimeOutID = setTimeout(() => {
                this.searchSymbol(this.searchBox.value)
            }, 300)
        } else {
            this.disableDropdown();
            this.setState({ dataSearch: [] })
        }
    }

    search() {
        try {
            this.disableDropdown()
            const dataSearch = this.state.dataSearch
            if (dataSearch.length && dataSearch[this.curentIndex] && this.props.exists && this.props.exists.includes(dataSearch[this.curentIndex][this.props.mainKey])) {
                return;
            }
            if (dataSearch.length !== 0 && this.curentIndex > -1) {
                this.props.dataReceivedFromSearchAccount(dataSearch[this.curentIndex] || {})
                this.searchBox.value = dataSearch[this.curentIndex][this.props.mainKey]
                if (this.searchBox.value) {
                    this.oldValue = this.searchBox.value;
                }

                this.props.isCustomField || this.setState({
                    dataSearch: []
                })
            } else {
                if (!dataSearch || dataSearch.length === 0) {
                    if (this.searchBox.value !== '') return
                    this.props.dataReceivedFromSearchAccount('')
                    this.searchBox.value = ''
                } else {
                    this.props.dataReceivedFromSearchAccount(dataSearch[0])
                    this.searchBox.value = dataSearch[0][this.props.mainKey] || ''
                    if (this.searchBox.value) {
                        this.oldValue = this.searchBox.value;
                    }

                    this.props.isCustomField || this.setState({
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
            if (this.state.dataSearch && this.state.dataSearch.length > 0) {
                return 'size--3 '
            } else {
                return `size--3 ${this.searchBox && this.searchBox.value && this.searchBox.value.length > 1 && this.isFocus ? '' : 'disable'}`
            }
        } catch (error) {
            logger.error('showSuggest On SearchBox' + error)
        }
    }

    searchSymbol(stringSearch) {
        try {
            this.setState({
                loadingSearch: true
            }, () => {
                this.loadDropdown()
                if (stringSearch.length > 0) {
                    let url = this.props.url + stringSearch;
                    getData(url).then((response) => {
                        if (this.searchBox && this.searchBox.value !== stringSearch) return
                        if (response.data) {
                            let data = []
                            if (response.data && response.data.length) {
                                data = response.data
                            }
                            let dataSearch = [];
                            dataSearch = data
                            this.setState({
                                loadingSearch: false,
                                dataSearch: dataSearch
                            }, () => {
                                this.loadDropdown()
                            })
                        }
                    })
                } else {
                    this.setState({
                        loadingSearch: false,
                        dataSearch: []
                    }, () => {
                        this.loadDropdown()
                    })
                }
            })
        } catch (error) {
            logger.error('searchSymbol On SearchBox' + error)
        }
    }

    componentWillReceiveProps(nextProps) {
        if ((!nextProps.exists || nextProps.exists.length === 0) && this.props.exists.length) {
            this.searchBox.value = ''
            this.oldValue = ''
        }
    }

    clickItemSuggest(item) {
        try {
            if (!this.props.isCustomField) {
                this.searchBox.value = item[this.props.mainKey];
            }
            if (this.searchBox.value) {
                this.oldValue = this.searchBox.value;
            }
            // this.disableDropdown()
            this.props.dataReceivedFromSearchAccount(item, this.textInput)
        } catch (error) {
            logger.error('clickItemSuggest On SearchBox' + error)
        }
    }

    renderSuggest() {
        try {
            let listSearch = this.state.dataSearch
            const objDicAccount = this.props.objDicAccount
            if (!listSearch || listSearch.length === 0) {
                if (this.searchBox.value && this.searchBox.value.length > 1) {
                    return <div className='emptyListSuggest text-capitalize' style={{ minHeight: '200px' }}>
                        <Lang>lang_no_data</Lang>
                    </div>
                } else {
                    return null
                }
            }
            return listSearch.map((item, index) => {
                let isExisted = false;
                if (this.props.exists && this.props.exists.includes(item[this.props.mainKey])) {
                    isExisted = true;
                }
                return <ItemSuggest
                    isCode={true}
                    className={this.props.className}
                    isCustomField={this.props.isCustomField}
                    key={index}
                    exist={isExisted}
                    keyItem={index}
                    id={this.id}
                    highlight={item.symbol === this.state.valueSearch}
                    removeItem={this.removeItem.bind(this)}
                    clickItemSuggest={this.clickItemSuggest.bind(this)}
                    item={item}
                    objDicAccount={objDicAccount}
                    CreateAccount={this.props.CreateAccount}
                />
            })
        } catch (error) {
            logger.error('renderSuggest On SearchBox' + error)
        }
    }

    removeItem = (item) => {
        this.props.removeItem && this.props.removeItem(item)
    }

    handleClickOutside = evt => {
        try {
            this.isFocus = false;
            if (this.props.CreateAccount && this.searchBox) {
                this.searchBox.value = '';
            }
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

    handleOnFocus() {
        this.isFocus = true;
    }

    handleOnBlur() {
        this.isFocus = false;
        if (this.props.isNull && this.textInput === '') {
            this.disableDropdown();
            this.props.dataReceivedFromSearchAccount(this.textInput)
        } else if (!this.searchBox.value) {
            if (this.props.CreateAccount) {
                this.searchBox.value = '';
            } else {
                this.searchBox.value = this.props.accountId || '';
            }
        }
    }
    handChange() {
        this.textInput = this.searchBox.value
    }

    disableDropdown() {
        if (this.floatContent) {
            ReactDOM.render(null, this.floatContent);
            this.floatContent.parentNode && this.floatContent.parentNode.removeChild(this.floatContent);
            this.floatContent = null;
        }
    }

    loadDropdown() {
        const div = document.getElementById('dropDownContent');
        if (this.floatContent && div && div.children && div.children[0]) {
            ReactDOM.render(this.renderSearchResultContent(), this.floatContent);
        } else {
            this.setWrapperRef()
        }
    }

    setWrapperRef() {
        try {
            const node = this.dom;
            if (node && node.offsetParent) {
                let div = getDropdownContentDom()
                this.floatContent = document.createElement('div');
                div.appendChild(this.floatContent);
                ReactDOM.render(this.renderSearchResultContent(), this.floatContent);
                this.floatContent.style.position = 'absolute';
                this.floatContent.style.display = 'block';
                this.floatContent.style.minWidth = '220px'
                const rect = node.getBoundingClientRect();
                const top = rect.top + node.offsetHeight;
                const left = rect.left;
                const totalWidth = left + this.floatContent.offsetWidth;
                const spaceBottom = window.innerHeight - top
                if (rect.top > spaceBottom && spaceBottom < 100) {
                    this.floatContent.style.bottom = (spaceBottom + node.offsetHeight) + 'px';
                    this.floatContent.style.maxHeight = (rect.top > 336 ? 336 : rect.top) + 'px'
                    this.floatContent.style.top = null;
                } else {
                    this.floatContent.style.top = (rect.top + node.offsetHeight) + 'px';
                    this.floatContent.style.bottom = null
                    this.floatContent.style.maxHeight = (spaceBottom > 336 ? 336 : spaceBottom) + 'px'
                }
                if (totalWidth > window.innerWidth) {
                    this.floatContent.style.left = (window.innerWidth - this.floatContent.offsetWidth) + 'px'
                } else {
                    this.floatContent.style.left = rect.left + 'px';
                }
            }
        } catch (error) {
            logger.error('setWrapperRef error SearchAccount', error)
        }
    }

    renderSearchResultContent() {
        return (
            <div className={`searchSuggest ${this.showSuggest()} searchSuggestAccount`} style={{ maxHeight: '336px' }}>
                {this.state.loadingSearch ? <div className={dataStorage.theme === 'theme-dark' ? 'loaderGridDark' : 'loaderGrid'}></div> : this.renderSuggest()}
            </div>
        );
    }
    Add = () => {
        if (!this.props.noAdd) return <Lang>lang_add</Lang>
        else return null
    }

    render() {
        try {
            if ((dataStorage.userInfo.user_type === userTypeEnum.OPERATOR) || (dataStorage.userInfo.user_type === userTypeEnum.ADVISOR)) {
                return (
                    <div className={`${this.props.accountSumFlag ? 'searchAccountContainer accountSum' : 'searchAccountContainer'} ${this.props.className || ''} ${this.props.isCustomField ? 'fullWidth' : ''}`} ref={dom => this.dom = dom}>
                        <div style={{
                            filter: this.placing ? 'brightness(70%)' : 'brightness(100%)', marginTop: '0px'
                        }} className={'inputAddon size--3'}>
                            {this.props.required === 'noNeed' ? <input
                                className={`${this.state.trading_halt ? 'inputHalt size--3' : 'size--3'} ${this.props.className || ''}`}
                                ref={dom => this.searchBox = dom}
                                id={`searchBoxSelector_${this.id}`}
                                disabled={!!this.props.placing}
                                type='text'
                                // value={'adjfhajhfdjahfjhdsajhfj'}
                                defaultValue={this.props.display_name}
                                readOnly={this.props.readOnly}
                                onInput={this.handleOnInput.bind(this)}
                                onKeyPress={this.handleKeyPress}
                                onBlur={this.handleOnBlur.bind(this)}
                                onFocus={this.handleOnFocus.bind(this)}
                                onChange={this.handChange.bind(this)}
                            /> : <input
                                    className={this.state.trading_halt ? 'inputHalt size--3' : 'size--3'}
                                    ref={dom => this.searchBox = dom}
                                    id={`searchBoxSelector_${this.props.id || this.id}`}
                                    disabled={!!this.props.placing}
                                    type='text'
                                    // value={this.props.display_name}
                                    defaultValue={this.props.display_name}
                                    readOnly={this.props.readOnly}
                                    onInput={this.handleOnInput.bind(this)}
                                    onKeyPress={this.handleKeyPress}
                                    onBlur={this.handleOnBlur.bind(this)}
                                    onFocus={this.handleOnFocus.bind(this)}
                                    onChange={this.handChange.bind(this)}
                                    required
                                />}
                            {
                                this.props.isCustomField ? <div className='text-uppercase'>
                                    {
                                        this.state.loadingSearch ? <img className='icon' style={{ filter: 'brightness(0) invert(1)' }} src={'common/Spinner-white.svg'} /> : this.Add()
                                    }
                                </div> : null
                            }
                            <div className={`placeHolder text-capitalize ${this.props.readOnly ? 'readOnly' : ''}`}><Lang>{this.props.placeHolder || 'lang_search_account'}</Lang></div>
                            {
                                this.props.isCustomField ? null : <div className={'button text-capitalize size--3'} onClick={this.handleClickGo}><Lang>{this.props.actionButton || 'lang_go'}</Lang></div>
                            }
                        </div>
                    </div>
                )
            } else {
                return (
                    null
                );
            }
        } catch (error) {
            logger.error('render On SearchBox' + error)
        }
    }

    componentDidMount() {
        try {
            this.lastDownTarget = null;
            document.addEventListener('click', this.handlerClickOutside);
            document.addEventListener('mousedown', this.listenerMouseDown.bind(this), false);
            this.searchBox && this.searchBox.addEventListener('keydown', this.listenerKeyDown.bind(this), false);
        } catch (error) {
            logger.error('componentDidMount On SearchBox' + error)
        }
    }
}

export default translate('translations')(onClickOutside(SearchCode));
