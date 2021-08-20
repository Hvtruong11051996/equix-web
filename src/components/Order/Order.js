import React from 'react';
import logger from '../../helper/log';
import { translate } from 'react-i18next';
import NewOrder from '../NewOrder';
import ModifyOrder from '../ModifyOrder';
import ConfirmOrder from '../ConfirmOrder';
import DetailOrder from '../DetailOrder';
import uuidv4 from 'uuid/v4';
import { hideElement } from '../../helper/functionUtils';
import { getData, getUrlAnAccount } from '../../helper/request';
class Order extends React.Component {
    constructor(props) {
        super(props);
        this.id = uuidv4();

        this.state = this.props.loadState();
        props.glContainer.on('show', () => {
            hideElement(props, false, this.id);
        });
        props.glContainer.on('hide', () => {
            hideElement(props, true, this.id);
        });
        props.stateChanged(() => {
            const state = this.props.loadState();
            if (state.stateOrder !== this.state.stateOrder || state.needConfirm !== this.state.needConfirm) {
                const obj = {}
                obj.stateOrder = state.stateOrder
                obj.needConfirm = state.needConfirm
                if (state.data) obj.data = state.data
                if (state.dataConfirm) obj.dataConfirm = state.dataConfirm
                this.setState(obj)
            }
        })
    }

    render() {
        try {
            let mainElement;
            switch (this.state.stateOrder) {
                case 'NewOrder':
                    const Order = NewOrder
                    if (this.state.needConfirm) {
                        this.props.setTitle({ text: 'lang_review_order' });
                    } else {
                        this.props.setTitle({ text: 'lang_new_order' });
                    }
                    mainElement = <Order {...this.props} data={this.state.data} currency={(this.state.dataConfirm && this.state.dataConfirm.dataAccount.currency) ? this.state.dataConfirm.dataAccount.currency : this.state.currency} />
                    break;
                case 'ModifyOrder':
                    const Modify = ModifyOrder
                    if (this.state.needConfirm) {
                        this.props.setTitle({ text: 'lang_review_order', orderId: this.state.dataConfirm.dataAccount.broker_order_id });
                    } else {
                        this.props.setTitle({ text: 'lang_modify_order', orderId: (this.state.data.data && this.state.data.data.display_order_id) || '' });
                    }
                    mainElement = <Modify {...this.props} data={this.state.data} currency={(this.state.dataConfirm && this.state.dataConfirm.dataAccount.currency) ? this.state.dataConfirm.dataAccount.currency : this.state.currency} />
                    break;
                case 'DetailOrder':
                    if (this.state.needConfirm) {
                        this.props.setTitle({ text: 'lang_review_cancel_order', orderId: this.state.dataConfirm.dataAccount.broker_order_id });
                    } else {
                        this.props.setTitle({ text: 'lang_order_detail', orderId: this.state.data.display_order_id || this.state.data.order_number || this.state.data.broker_order_id });
                    }
                    if (this.state.data.display_order_id || this.state.data.order_number || this.state.data.broker_order_id) {
                        mainElement = <DetailOrder {...this.props} data={this.state.data} currency={(this.state.dataConfirm && this.state.dataConfirm.dataAccount.currency) ? this.state.dataConfirm.dataAccount.currency : this.state.currency} />
                    }
                    break;
            }
            return <div>
                {mainElement}
                {this.state.needConfirm ? <ConfirmOrder {...this.props} data={this.state.dataConfirm} currency={(this.state.dataConfirm && this.state.dataConfirm.dataAccount.currency) ? this.state.dataConfirm.dataAccount.currency : this.state.currency} /> : null}
            </div>
        } catch (error) {
            logger.error('render On ORDER' + error)
        }
    }
}

export default (translate('translations')(Order));
