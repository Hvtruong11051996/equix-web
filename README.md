# golden-layout-react-redux
Minimal example showing how to link redux state to react components embedded within golden-layout.

Run `npm install`, then `npm run dev` and point your browser to `localhost:8080` to run the example.

The example consists of three golden-layout tabs, each with a single React component. There are two buttons and one label which displays a count stored in the Redux state. The buttons increment or decrement this count.


# New Order mapping

willreceiveprops
- get data from searchbox:
    + symbolObj


didmount
- open from porfolio

- open from watchlist

- open from order

resetData
- get detail from last order || resetData 

refreshData
- get the newest price 

getAccountbalance
- get account balance

ruleOrderType --> saveDic, getFees
- map OrderType, Condition, Duration, Exchange

checkOrderValue


setDefaultValue
- limitPrice, stopPrice, getFee, orderValue


Selenium:
https://seleniumhq.github.io/selenium/docs/api/javascript/index.html