import React from 'react';
class NumberInput extends React.Component {
  constructor(props) {
    super(props);
    this.data = {
      ...props
    }
  }
  format = (valStr) => {
    valStr = valStr.replace(/,/g, '');
    valStr = valStr.replace(new RegExp('^(-?\\w{0,' + (this.props.maxLength || 15) + '})[^.]*($|\\.)'), '$1$2')
    this.value = this.getValue(valStr);
    valStr = valStr.split('.');
    valStr[0] = valStr[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    return valStr.join('.');
  };

  getValue = (valStr) => {
    if (valStr) {
      if (isNaN(valStr)) return null;
      else return Number(valStr);
    } else return null;
  };
  setValue = value => {
    if (!value) value = 0;
    this.value = value;
    this.dom.value = value;
    if (!this.active) this.fill();
    this.formatValue();
  };
  formatValue = () => {
    const target = this.dom;
    let valStr = target.value + '';
    if (/^-?[0-9](\.\d+)?e[+-]\d+$/.test(valStr)) {
      const _a = valStr.split('e')
      const _b = _a[0].split('.')
      if (_a[1] < 0) {
        const _c = _b[0].match(/^(-?)(.*)$/)
        if (!_b[1]) _b[1] = ''
        valStr = _c[1] + '0.' + '0'.repeat(-_a[1] - _c[2].length) + _c[2] + _b[1]
      } else {
        if (!_b[1]) _b[1] = ''
        valStr = _b[0] + _b[1] + '0'.repeat(_a[1] - _b[1].length)
      }
    }
    if (/^-?0+([1-9]|0\.|0$)/.test(valStr)) valStr = valStr.replace(/(^-?)0+([1-9]|0\.|0$)/, '$1$2');
    if (/[^\d.,-]/.test(valStr)) valStr = valStr.replace(/[^\d.,-]/g, '');
    if (/\.[\d,]*\./.test(valStr)) valStr = valStr.replace(/(\.[\d,]*)\./g, '$1');
    if (/^-?\./.test(valStr)) valStr = valStr.replace(/^(-?)\./, '$1');
    if (this.data.negative) {
      if (/.-+/.test(valStr)) valStr = valStr.replace(/(.)-+/g, '$1');
    } else {
      if (/-/.test(valStr)) valStr = valStr.replace(/-/g, '');
    }

    if (typeof this.data.decimal === 'number') {
      const arr = valStr.split('.');
      if (this.data.decimal) {
        if (arr.length && arr[1]) {
          arr[1] = arr[1].substr(0, this.data.decimal);
          valStr = arr.join('.');
        }
      } else {
        valStr = arr[0];
      }
    }

    const ca = valStr.substr(0, target.selectionStart).split(',').length;
    const cb = valStr.substr(0, target.selectionEnd).split(',').length;

    const a = target.selectionStart;
    const b = target.selectionEnd;

    valStr = this.format(valStr);

    target.value = valStr;
    target.selectionStart = a + valStr.substr(0, a).split(',').length - ca;
    target.selectionEnd = b + valStr.substr(0, b).split(',').length - cb;
    if (this.data.monitor) this.data.monitor(this.value);
  };
  valueChanged = () => {
    this.formatValue();
    if (this.data.onChange) this.data.onChange(this.value, this.props.stateName);
    if (this.props.requrieRollback && this.props.requrieRollback()) {
      this.setValue(this.oldValue);
      if (this.data.onChange) this.data.onChange(this.value, this.props.stateName);
    } else this.oldValue = this.value;
  };
  componentWillReceiveProps(nextProps) {
    Object.assign(this.data, nextProps);
    if (nextProps.value !== this.value || nextProps.decimal !== this.props.decimal || nextProps.negative !== this.props.negative) this.setValue(nextProps.value);
  }
  shouldComponentUpdate() {
    return false;
  }
  fill = () => {
    if (this.dom.value === '-' || !this.dom.value) this.dom.value = 0
    if (typeof this.data.decimal === 'number' && this.data.decimal) {
      const arr = this.dom.value.split('.');
      if (!arr[0]) arr[0] = '0';
      if (!arr[1]) arr[1] = '0'.repeat(this.data.decimal);
      else {
        const checkarr = this.data.decimal - arr[1].length
        if (checkarr > 0) {
          arr[1] += '0'.repeat(this.data.decimal - arr[1].length);
        }
      }

      this.dom.value = arr.join('.');
      if (Number(this.dom.value) === 0 && this.props.placeholder) this.dom.value = ''
    }
  };
  blur = (event) => {
    this.active = false;
    this.fill();
    if (this.data.onBlur) this.data.onBlur(event);
  };
  focus = (event) => {
    this.active = true;
    this.dom.value = this.dom.value.replace(/\.0*$/, '');
    this.dom.value = this.dom.value.replace(/(\.[1-9])0*$/, '$1');
    if (/^0+$/.test(this.dom.value)) this.dom.value = '';
    if (this.data.onFocus) this.data.onFocus(event);
  };
  ref = dom => {
    if (dom) {
      this.dom = dom;
      setTimeout(() => {
        this.props.autoFocus && dom.focus()
      }, 10);
      if (this.active) this.dom.value = this.data.value || '';
      else this.dom.value = this.data.value || 0;
      if (this.data.defaultValue) this.dom.value = this.data.defaultValue || '';
      this.fill();
    }
  };
  render() {
    return <input
      className={`${this.data.className || ''}`} type="text"
      ref={this.ref} onChange={this.valueChanged}
      onFocus={this.focus} onBlur={this.blur}
      placeholder={this.props.placeholder}
    />
  }
}

export default NumberInput;
