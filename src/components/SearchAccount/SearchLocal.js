import React from 'react';
import ItemSuggest from './ItemSuggestLocal';
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
        if (this.searchBox && (document.activeElement !== this.searchBox)) {
            if (nextProps.displayValue) {
                this.searchBox.value = nextProps.displayValue
                this.oldValue = nextProps.displayValue
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
            if (dataSearch.length !== 0 && this.curentIndex > -1) {
                this.props.dataReceivedFromSearchAccount(dataSearch[this.curentIndex] || {})
                this.searchBox.value = dataSearch[this.curentIndex][this.props.fieldSearch]
                if (this.searchBox.value) {
                    this.oldValue = this.searchBox.value;
                }
                this.handleClickOutside()
            } else {
                if (!dataSearch || dataSearch.length === 0) {
                    if (this.searchBox.value !== '') return
                    this.props.dataReceivedFromSearchAccount({})
                    this.searchBox.value = ''
                } else {
                    this.props.dataReceivedFromSearchAccount(dataSearch[0], true)
                    this.searchBox.value = dataSearch[0][this.props.fieldSearch] || ''
                    if (this.searchBox.value) {
                        this.oldValue = this.searchBox.value;
                    }
                    this.handleClickOutside()
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
                let data = this.props.dataSource.filter(e => {
                    const value = (e[this.props.fieldSearch] + '').toLowerCase()
                    const label = (e[this.props.displayField] + '').toLowerCase()
                    const text = (stringSearch + '').toLowerCase()
                    return value.includes(text) || label.includes(text)
                })
                this.setState({
                    dataSearch: data || [],
                    loadingSearch: false
                }, () => {
                    this.loadDropdown()
                })
            })
        } catch (error) {
            logger.error('searchSymbol On SearchBox' + error)
        }
    }

    clickItemSuggest(item) {
        try {
            if (this.searchBox.value) {
                this.oldValue = this.searchBox.value;
            }
            this.disableDropdown();
            this.props.dataReceivedFromSearchAccount(item, this.textInput)
        } catch (error) {
            logger.error('clickItemSuggest On SearchBox' + error)
        }
    }

    renderSuggest() {
        try {
            let listSearch = this.state.dataSearch
            if (!listSearch || listSearch.length === 0) {
                if (this.searchBox && this.searchBox.value && this.searchBox.value.length > 1) {
                    return <div className='emptyListSuggest text-capitalize'>
                        <Lang>lang_no_data</Lang>
                    </div>
                } else {
                    return null
                }
            }
            return listSearch.map((item, index) => {
                return <ItemSuggest
                    key={index}
                    keyItem={index}
                    id={this.id}
                    clickItemSuggest={this.clickItemSuggest.bind(this)}
                    displayField={this.props.displayField || this.props.fieldSearch}
                    item={item}
                />
            })
        } catch (error) {
            logger.error('renderSuggest On SearchBox' + error)
        }
    }

    handleClickOutside = evt => {
        try {
            this.isFocus = false;
            this.searchBox.value = this.oldValue || '';
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
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On SearchBox', error)
        }
    }

    handleOnFocus() {
        this.isFocus = true;
        this.searchBox.value = ''
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
        if (!this.searchBox.value) {
            this.searchBox.value = '';
        }
        this.props.onBlur && this.props.onBlur();
    }
    handChange() {
        this.textInput = this.searchBox.value
    }

    onChange(data) {
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
                const rect = node.getBoundingClientRect();
                this.floatContent.style.position = 'absolute';
                this.floatContent.style.display = 'block';
                this.floatContent.style.minWidth = '220px'
                this.floatContent.style.width = rect.width + 50 + 'px'
                const top = rect.top + node.offsetHeight;
                const right = window.innerWidth - rect.left - rect.width;
                const spaceBottom = window.innerHeight - top
                if (rect.top > spaceBottom && spaceBottom < 100) {
                    this.floatContent.style.bottom = (spaceBottom + node.offsetHeight) + 'px';
                    this.floatContent.style.maxHeight = (rect.top > 336 ? 336 : rect.top) + 'px'
                    this.floatContent.style.top = null;
                } else {
                    this.floatContent.style.top = (rect.top + node.offsetHeight) + 'px';
                    this.floatContent.style.bottom = null
                    this.floatContent.style.maxHeight = (spaceBottom > 336 ? 336 : spaceBottom - 16) + 'px'
                }
                this.floatContent.style.right = right + 'px';
            }
        } catch (error) {
            logger.error('setWrapperRef error SearchAccount', error)
        }
    }

    renderSearchResultContent() {
        return (
            <div className={`searchSuggest ${this.showSuggest()} searchSuggestAccount searchLocal`}>
                <div>
                    {this.state.loadingSearch ? <div className={dataStorage.theme === 'theme-dark' ? 'loaderGridDark' : 'loaderGrid'}></div> : this.renderSuggest()}
                </div>
            </div>
        );
    }

    render() {
        try {
            return (
                <div className={`${'searchAccountContainer'}`} ref={dom => this.dom = dom}>
                    <div style={{
                        filter: this.placing ? 'brightness(70%)' : 'brightness(100%)',
                        width: '100%'
                    }} className={'inputAddon size--3'}>
                        <input
                            className={'size--3'}
                            ref={dom => this.searchBox = dom}
                            id={`searchBoxSelector_${this.id}`}
                            type='text'
                            defaultValue={this.props.displayValue}
                            onInput={this.handleOnInput.bind(this)}
                            onKeyPress={this.handleKeyPress}
                            onBlur={this.handleOnBlur.bind(this)}
                            onFocus={this.handleOnFocus.bind(this)}
                            onChange={this.handChange.bind(this)}
                            required
                        />
                        <div className={`placeHolder text-capitalize`}><Lang>{this.props.placeHolder || 'lang_search_account'}</Lang></div>
                    </div>
                </div>
            )
        } catch (error) {
            logger.error('render On SearchBox' + error)
        }
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
