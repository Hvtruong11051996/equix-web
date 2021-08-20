import React from 'react';
import ItemSuggest from './ItemSuggest';
import { getData, getAllAccountUrl, getAllAccountNewUrl } from '../../helper/request'
import {
    checkPropsStateShouldUpdate,
    checkIsAdvisor,
    checkShowAccountSearch,
    getDropdownContentDom
} from '../../helper/functionUtils';
import uuidv4 from 'uuid/v4';
import Lang from '../Inc/Lang'
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import DropDown from '../DropDown';
import Button from '../Elements/Button';
class SearchAccount extends React.Component {
    constructor(props) {
        super(props);
        this.isFocus = false;
        this.curentIndex = -1;
        this.lastDownTarget = null;
        this.searchBox = null;
        this.id = uuidv4();
        this.state = {
            dataSearch: [],
            loadingSearch: false,
            accountObj: {}
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
        if (nextProps.isCustomField) return;
        if (this.searchBox && (document.activeElement !== this.searchBox)) {
            if (nextProps.accountId) {
                this.searchBox.value = nextProps.accountId
                this.oldValue = nextProps.accountId
            } else {
                this.searchBox.value = ''
                this.oldValue = ''
            }
        }
    }

    componentWillUnmount() {
        try {
            document.removeEventListener('click', this.handlerClickOutside);
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
        (this.searchBox.value + '').length >= 2 ? this.setTimeOutID = setTimeout(() => {
            this.searchSymbol(this.searchBox.value)
        }, 300) : this.setState({
            dataSearch: [],
            loadingSearch: false
        })
    }

    search() {
        try {
            this.disableDropdown();
            const dataSearch = this.state.dataSearch
            if (this.props.exists && this.props.exists.includes(this.searchBox.value)) {
                return;
            }
            if (dataSearch.length && dataSearch[this.curentIndex] && this.props.exists && this.props.exists.includes(dataSearch[this.curentIndex].account_id)) {
                return;
            }
            if (dataSearch.length !== 0 && this.curentIndex > -1) {
                this.props.dataReceivedFromSearchAccount(dataSearch[this.curentIndex] || {})
                this.searchBox.value = dataSearch[this.curentIndex].account_id
                if (this.searchBox.value) {
                    this.oldValue = this.searchBox.value;
                }

                if (!this.props.isCustomField) {
                    this.handleClickOutside()
                }
            } else {
                if (!dataSearch || dataSearch.length === 0) {
                    if (this.searchBox.value !== '') return
                    this.props.dataReceivedFromSearchAccount({})
                    this.searchBox.value = ''
                } else {
                    this.props.dataReceivedFromSearchAccount(dataSearch[0], true)
                    this.searchBox.value = dataSearch[0].account_id || ''
                    if (this.searchBox.value) {
                        this.oldValue = this.searchBox.value;
                    }

                    if (!this.props.isCustomField) {
                        this.handleClickOutside()
                    }
                }
            }
        } catch (error) {
            logger.error('search On SearchBox' + error)
        }
    }

    handleKeyPress = (event) => {
        try {
            if (event.key === 'Enter') {
                this.props.onBlur && this.props.onBlur();
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
                    const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;

                    let url;
                    url = this.props.newLink ? getAllAccountNewUrl(userId, 1, 30, stringSearch, checkIsAdvisor()) : getAllAccountUrl(userId, 1, 30, stringSearch, checkIsAdvisor())
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
                            let dataSearch = [];
                            dataSearch = data
                            if (this.props.CreateAccount && dataSearch.length > 30) { // create user show item suggest max 30
                                dataSearch = dataSearch.splice(0, 30);
                                this.setState({
                                    dataSearch: dataSearch,
                                    loadingSearch: false
                                }, () => {
                                    this.loadDropdown()
                                })
                            } else {
                                this.setState({
                                    dataSearch: dataSearch,
                                    loadingSearch: false
                                }, () => {
                                    this.loadDropdown()
                                })
                            }
                        }
                    })
                        .catch(error => {
                            this.props && this.props.loading && this.props.loading(false)
                            this.setState({ loadingSearch: false }, () => {
                                this.loadDropdown()
                            })
                        })
                } else {
                    this.setState({
                        dataSearch: [],
                        loadingSearch: false
                    }, () => {
                        this.loadDropdown()
                    })
                }
            })
        } catch (error) {
            logger.error('searchSymbol On SearchBox' + error)
        }
    }

    clickItemSuggest(item) {
        try {
            if (!this.props.isCustomField) {
                this.searchBox.value = item.account_id;
            }
            if (this.searchBox.value) {
                this.oldValue = this.searchBox.value;
            }
            if (!this.props.isCustomField) {
                !this.props.CreateAccount && this.setState({
                    dataSearch: []
                });
                if (this.props.CreateAccount && this.props.objDicAccount && this.props.objDicAccount.length === 0) {
                    this.setState({
                        dataSearch: []
                    });
                }
                this.oldValue = item.account_id;
                dataStorage.accountInfo = item;
                dataStorage.account_id = item.account_id;
            }
            if (!this.props.multiSelect) this.disableDropdown();
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
                if (this.searchBox && this.searchBox.value && this.searchBox.value.length > 1) {
                    return <div className='emptyListSuggest text-capitalize'
                        style={{
                            minHeight: '200px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        <Lang>lang_no_data</Lang>
                    </div>
                } else {
                    return null
                }
            }
            return listSearch.map((item, index) => {
                let isExisted = false;
                if (this.props.exists && this.props.exists.includes(item.account_id)) {
                    isExisted = true;
                }
                return <ItemSuggest
                    className={this.props.className}
                    isCustomField={this.props.isCustomField}
                    key={index}
                    exist={isExisted}
                    keyItem={index}
                    id={this.id}
                    clickItemSuggest={this.clickItemSuggest.bind(this)}
                    removeItem={this.removeItem.bind(this)}
                    item={item}
                    objDicAccount={objDicAccount}
                    CreateAccount={this.props.CreateAccount}
                    createUser={this.props.createUser}
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
        if (!dataStorage.lstAccountDropdown) {
            try {
                this.isFocus = false;
                if (this.props.CreateAccount && this.searchBox) {
                    this.searchBox.value = '';
                }
                this.searchBox.value = this.oldValue || '';
                this.setState({
                    dataSearch: []
                })
            } catch (error) {
                logger.error('handleClickOutside On SearchBox' + error)
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On SearchBox', error)
        }
    }

    handleOnFocus() {
        this.isFocus = true;
    }

    disableDropdown() {
        if (this.floatContent) {
            ReactDOM.render(null, this.floatContent);
            this.floatContent.parentNode && this.floatContent.parentNode.removeChild(this.floatContent);
            this.floatContent = null;
        }
    }

    handleOnBlur() {
        this.isFocus = false;
        if (this.props.isNull && this.textInput === '') {
            this.disableDropdown();
            this.props.dataReceivedFromSearchAccount({})
        } else if (!this.searchBox.value) {
            if (this.props.CreateAccount) {
                this.searchBox.value = '';
            } else {
                this.searchBox.value = this.props.accountId || (!this.props.isCustomField && this.oldValue) || '';
            }
        }
        this.props.onBlur && this.props.onBlur();
    }
    handChange() {
        this.textInput = this.searchBox.value
    }

    onChange(data) {
        if (data.account_id && this.props.accountId === data.account_id) return
        this.props.dataReceivedFromSearchAccount(data)
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
                this.floatContent.style.boxShadow = '0 2px 5px 0 #000';
                // this.floatContent.style.height = '336px'
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
                    // this.floatContent.style.left = (window.innerWidth - this.floatContent.offsetWidth) + 'px'
                    const spaceLeft = left + this.dom.offsetWidth - 450;
                    if (spaceLeft < 0) this.floatContent.style.left = '0px'
                    else this.floatContent.style.left = spaceLeft + 'px'
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
            <div className={`searchSuggest ${this.showSuggest()} searchSuggestAccount`} style={this.props.createUser ? { position: 'unset' } : null}>
                <div>
                    {this.state.loadingSearch ? <div className={dataStorage.theme === 'theme-dark' ? 'loaderGridDark' : 'loaderGrid'}></div> : this.renderSuggest()}
                </div>
            </div>
        );
    }

    render() {
        let optionsdropdown = []
        try {
            if (this.props.optionsAcc && this.props.optionsAcc.length) {
                if ((!this.props.activeValue || (this.props.activeValue && !Object.keys(this.props.activeValue).length)) && this.props.optionsAcc.length <= 5) this.props.dataReceivedFromSearchAccount(this.props.optionsAcc[0].value)
                return (
                    this.props.optionsAcc.length <= 5
                        ? <DropDown
                            title='accountDropdown'
                            isOpeningAccount={true}
                            className={this.props.className}
                            isFooter={this.props.isFooter}
                            options={this.props.optionsAcc}
                            value={this.props.activeValue || (this.props.optionsAcc.length && this.props.optionsAcc[0].value) || 0}
                            onChange={this.onChange.bind(this)}
                            onBlur={this.props.onBlur}
                            position={this.props.position}
                        />
                        : <div className={`${this.props.accountSumFlag ? 'searchAccountContainer accountSum' : 'searchAccountContainer'} ${this.props.className || ''} ${this.props.isCustomField ? 'fullWidth' : ''}`} ref={dom => this.dom = dom}>
                            <div style={{
                                filter: this.placing ? 'brightness(70%)' : 'brightness(100%)', marginTop: '0px'
                            }} className={'inputAddon size--3'}>
                                {this.props.required === 'noNeed' ? <input
                                    className={`${this.state.trading_halt ? 'inputHalt size--3' : 'size--3'} ${this.props.className || ''}`}
                                    ref={dom => this.searchBox = dom}
                                    id={`searchBoxSelector_${this.id}`}
                                    disabled={!!this.props.placing}
                                    type='text'
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
                                    this.props.isCustomField ? <div className='search-account-btn-add text-uppercase'>
                                        {
                                            this.state.loadingSearch ? <img className='icon' style={{ filter: 'brightness(0) invert(1)' }} src={'common/Spinner-white.svg'} /> : this.Add()
                                        }
                                    </div> : null
                                }
                                <div className={`placeHolder text-capitalize ${this.props.readOnly ? 'readOnly' : ''}`}><Lang>{this.props.placeHolder || 'lang_search_account'}</Lang></div>
                                {
                                    this.props.isCustomField ? null : <Button className='button text-capitalize' mini={true} onClick={this.handleClickGo}><Lang>{this.props.actionButton || 'lang_go'}</Lang></Button>
                                }
                            </div>
                        </div>
                )
            } else {
                const show = checkShowAccountSearch();
                const className = this.props.isFooter ? 'isFooter' : '';
                if (this.props.formName === 'newOrder') {
                    dataStorage.lstAccountDropdown && dataStorage.lstAccountDropdown.map(item => {
                        if (!item.value.status.includes('inactive')) optionsdropdown.push(item)
                    })
                    if (!this.props.accountId && optionsdropdown.length && (dataStorage.lstAccountCheck && dataStorage.lstAccountCheck.length <= 5)) this.props.dataReceivedFromSearchAccount(optionsdropdown[0].value)
                } else optionsdropdown = dataStorage.lstAccountDropdown || []
                if (show) {
                    return (
                        dataStorage.lstAccountCheck && (dataStorage.lstAccountCheck.length <= 5) && !this.props.newLink
                            ? <DropDown
                                title='accountDropdown'
                                className={className}
                                isFooter={this.props.isFooter}
                                options={optionsdropdown}
                                value={this.props.accountId || (optionsdropdown.length && optionsdropdown[0].value) || 0}
                                onChange={this.onChange.bind(this)}
                                onBlur={this.props.onBlur}
                                position={this.props.position}
                            />
                            : <div className={`${this.props.accountSumFlag ? 'searchAccountContainer accountSum' : 'searchAccountContainer'} ${this.props.className || ''} ${this.props.isCustomField ? 'fullWidth' : ''}`} ref={dom => this.dom = dom}>
                                <div style={{
                                    filter: this.placing ? 'brightness(70%)' : 'brightness(100%)', marginTop: '0px'
                                }} className={'inputAddon size--3'}>
                                    {this.props.required === 'noNeed' ? <input
                                        className={`${this.state.trading_halt ? 'inputHalt size--3' : 'size--3'} ${this.props.className || ''}`}
                                        ref={dom => this.searchBox = dom}
                                        id={`searchBoxSelector_${this.id}`}
                                        disabled={!!this.props.placing}
                                        type='text'
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
                                        this.props.isCustomField ? <div>
                                            {this.state.loadingSearch ? <img className='icon' style={{ filter: 'brightness(0) invert(1)', height: '16px', width: '16px' }} src={'common/Spinner-white.svg'} /> : this.Add()}
                                        </div> : null
                                    }
                                    <div className={`placeHolder text-capitalize ${this.props.readOnly ? 'readOnly' : ''}`}><Lang>{this.props.placeHolder || 'lang_search_account'}</Lang></div>
                                </div>
                            </div>
                    )
                } else {
                    return null
                }
            }
        } catch (error) {
            logger.error('render On SearchBox' + error)
        }
    }

    Add = () => {
        if (!this.props.noAdd) return <Lang>lang_add</Lang>
        else return null
    }

    handlerClickOutside = (e) => {
        if ((this.dom && !this.dom.contains(e.target)) && (!this.floatContent || (this.floatContent && !this.floatContent.contains(e.target))) && (!e.target || (e.target && !e.target.className) || (e.target && e.target.className && ![`searchBoxSelector_${this.id}`, 'searchAccountContainer'].includes(e.target.className)))) {
            this.disableDropdown();
            this.handleClickOutside();
        }
    }

    componentDidMount() {
        try {
            this.props.refDom && this.props.refDom(this.searchBox);
            this.lastDownTarget = null;
            document.addEventListener('mousedown', this.listenerMouseDown.bind(this), false);
            document.addEventListener('click', this.handlerClickOutside);
            this.searchBox && this.searchBox.addEventListener('keydown', this.listenerKeyDown.bind(this), false);
        } catch (error) {
            logger.error('componentDidMount On SearchBox' + error)
        }
    }
}

export default SearchAccount
