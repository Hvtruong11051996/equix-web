import React from 'react';
import 'react-dates/initialize'
import { DayPickerSingleDateController } from 'react-dates';
import moment from 'moment';
// import DefaultTheme from 'react-dates/lib/theme/DefaultTheme'
// import ThemedStyleSheet from 'react-with-styles/lib/ThemedStyleSheet'
// import 'react-dates/lib/css/_datepicker.css';
import DayPickerInput from 'react-day-picker/DayPickerInput';// import 'react-day-picker'
import 'react-day-picker/lib/style.css';
// ThemedStyleSheet.registerTheme(DefaultTheme);

class DemoNewPicker extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            startDate: moment(),
            endDate: moment(),
            focusedInput: null,
            focused: null,
            date: moment()
        };
    }
    onDateChange = date => {
        this.setState({ date });
    };
    onFocusChange = () => {
        // Force the focused states to always be truthy so that date is always selectable
        this.setState({ focused: true });
    };
    focusedInput = focusedInput => {
        console.log(`focusedInput`, focusedInput);
        this.setState({ focusedInput });
    };
    render() {
        const { focused, date } = this.state;
        return (
            <div>
                <DayPickerInput
                    selectedDays={new Date(2019, 9, 9)}
                />
                {/* <DayPickerSingleDateController
                    onDateChange={this.onDateChange}
                    onFocusChange={this.onFocusChange}
                    focused={focused}
                    date={date}
                /> */}
            </div>
        )
    }
}

export default DemoNewPicker;
