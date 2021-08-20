import React from 'react';
import NoTag from '../Inc/NoTag';
import Icon from '../Inc/Icon';
class QuickMenu extends React.Component {
  constructor(props) {
    super(props);
    this.isMount = false;
    this.template = this.props.template
    this.button = this.props.button;
    this.value = this.props.value;
    if (this.props.fn) {
      this.props.fn({
        clearAction: this.clearAction.bind(this),
        setMenu: this.setMenu.bind(this),
        setValue: this.setValue.bind(this)
      })
    }
    this.state = {
      menu: props.menu
    }
  }

  componentDidMount = () => {
    this.isMount = true;
  };

  componentWillUnmount() {
    this.isMount = false;
  }

  setMenu(menu) {
    this.isMount && this.setState({ menu });
  }

  clearAction() {
    if (this.workingItem) {
      delete this.workingItem.actionTemp
      this.forceUpdate();
    }
  }

  initButton() {
    this.button = {
      update: () => {
        if (this.isSaving) return ''
        return <Icon className='qe-lib-icon' style={{ transition: 'none', marginRight: '3px' }} src='image/edit' />
      },
      delete: (item) => {
        if (this.isSaving) return ''
        if (item.value === this.state.value) return ''
        return <Icon className='qe-lib-icon' style={{ transition: 'none' }} src='navigation/close' />
      },
      override: (item, next) => {
        if (!this.isSaving) return ''
        return <div className='pre-wl-btn-Override' onClick={() => {
          next(true);
        }}>Save</div>
      }
    }
  }

  setAction(item, action) {
    item.actionTemp = action;
    if (this.props.onlyOne) {
      if (this.workingItem && this.workingItem !== item) {
        delete this.workingItem.actionTemp
      }
      this.workingItem = item;
    }
  }

  itemClick(item) {
    if (item.actionTemp) {
      if (item.finished) {
        delete item.finished
        delete item.actionTemp
      }
    } else if (item.action && item.action.length === 1) {
      this.setAction(item, item.action[0])
    } else {
      if (!item.children) {
        if (this.workingItem) {
          delete this.workingItem.actionTemp
        }
        this.props.onChange(item);
        this.value = item.value;
      }
    }
    this.forceUpdate();
  }

  nextStep(item, yes) {
    if (yes && this.props.onChange) {
      this.props.onChange(item, item.actionTemp)
    }
    item.finished = true;
  }

  setValue(value) {
    if (this.value === value) return;
    this.value = value;
    this.forceUpdate();
  }

  renderItem(item) {
    if (item.actionTemp && this.template[item.actionTemp]) {
      return this.template[item.actionTemp](this, item, (yes) => {
          this.nextStep(item, yes)
      })
    }
    const action = item.action;
    const lst = [];
    if (item.value === this.value) {
      if (action && action.length > 0 && action.indexOf('delete') > -1) action.splice(action.indexOf('delete'), 1)
      lst.push(<div className='checked' key={'checked'}><Icon className='qe-lib-icon' style={{ transition: 'none', display: 'block' }} src='navigation/check' /></div>);
    }
    if (action) {
      action.map(key => {
        if (this.button[key]) {
          const element = typeof this.button[key] === 'function' ? this.button[key](item, this.nextStep) : this.button[key];
          lst.push(
            <div
              title={`${item.name ? item.name : ''}`}
              key={key}
              className={key}
              onClick={() => {
                this.setAction(item, key);
                this.forceUpdate();
              }}>
              {element}
            </div>);
        }
      })
    }
    if (item.value === this.value) {
      if (action && action.length > 0) action.push('delete')
    }
    return <NoTag><div key={'1'} title={`${item.name ? item.name : ''}`}>{item.label}</div><div key={'2'} className='qm-btn'>{lst}</div></NoTag>
  }

  handleOnMouseEnter(e) {
    this.subMenu = e.target.parentNode.querySelector('.submenu')
    document.addEventListener('mouseover', this.hoverEvent);
    if (this.subMenu) {
      const menuContainer = this.subMenu.parentElement && this.subMenu.parentElement.parentElement && this.subMenu.parentElement.parentElement.parentElement;
      if (menuContainer) {
        const right = (window.innerWidth - menuContainer.offsetLeft - menuContainer.clientWidth) || 0;
        const top = e.target.getBoundingClientRect().top + 32;
        const bottom = e.target.getBoundingClientRect().bottom + 32;
        if (right < this.subMenu.clientWidth) {
          this.subMenu.style.right = '100%';
          this.subMenu.style.left = 'unset';
        } else {
          this.subMenu.style.left = '100%';
          this.subMenu.style.right = 'unset';
        }

        if (bottom > this.subMenu.clientHeight) {
          this.subMenu.style.top = 0;
          this.subMenu.style.bottom = null;
        } else {
          this.subMenu.style.top = null;
          if (top > this.subMenu.clientHeight) {
            this.subMenu.style.bottom = 0;
          } else {
            if (window.innerHeight < this.subMenu.clientHeight) {
              this.subMenu.style.top = `-${top - 32}px`;
              this.subMenu.classList.add('qm-scroll')
            }
            this.subMenu.style.bottom = `-${bottom - 32}px`;
          }
        }
      }
    }
  }

  hoverEvent(event) {
    if (event.target) {
      if (this.subMenu) {
        if (this.subMenu.contains(event.target)) {

        } else {
          this.disableDropdown()
        }
      }
    }
  }

  disableDropdown() {
    document.removeEventListener('mouseover', this.hoverEvent);
    this.quickMenuDiv.parentNode.removeChild(this.subMenu);
  }

  renderList(lst) {
    if (!lst) return null;
    return lst.map((item, key) => {
      if (item.children) {
        return <div key={key}
          // ref={dom => this.refMenu = dom}
          onMouseEnter={this.handleOnMouseEnter.bind(this)}
          className={`size--3 ${item.className || ''} ${item.children.filter(m => m.value === this.value).length ? 'activeDropDown' : ''}`}>
          <div className='qm-label'><div>{item.label}</div>
            {
              item.children && item.children.length
                ? <Icon className='qe-lib-icon' src={'hardware/keyboard-arrow-right'} />
                : ''
            }
          </div>
          <div className={`submenu`}
            ref={dom => {
              if (dom) {
                this.refSubMenu = dom;
              }
            }}
          >{this.renderList(item.children)}</div>
        </div >
      }
      return <div
        key={key}
        className={`${item.actionTemp ? 'active' : 'showTitle'} qm-label size--3  ${item.className || ''} ${item.value === this.value ? ' check' : ''}`}
        onClick={() => this.itemClick(item)}>
        {this.renderItem(item)}
      </div>
    })
  }

  render() {
    return <div className='pre-qm size--3'>{this.renderList(this.state.menu)}</div>
  }
}
export default QuickMenu;
