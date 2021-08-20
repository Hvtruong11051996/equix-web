import React, { useEffect, useState } from 'react';

const colorEnum = {
    EQT: '#1D7CAD',
    MF: '#B75D69',
    ETF: '#7600A9',
    WAR: '#CAAF16',
    FUT: '#0BA6A6',
    OPT: '#8DB72E',
    IND: '#B44800',
    FX: '#57AA00'
}
const mapEnum = {
    'equity': 'EQT',
    'options': 'OPT',
    'futures': 'FUT',
    'etf': 'ETF',
    'index': 'IND',
    'forex': 'FX',
    'warrants': 'WAR',
    'mutual_funds': 'MF'
}

const TagRadius = (props) => {
    const [tagArr, setTagArr] = useState([])
    useEffect(() => {
        let newTagArr = []
        if (props.value) {
            newTagArr = (props.value).map(x => {
                return mapEnum[x]
            })
        }
        setTagArr(newTagArr)
    }, [props.value])
    return (
        <div className='box-overflow'>
            <div className='text-overflow showTitle'>
                {
                    tagArr.map((item, key) => {
                        return <label key={key} style={{ backgroundColor: colorEnum[item], borderRadius: '15px' }} className='tag'>{item}</label>
                    })
                }
            </div>
        </div>
    )
}
export default TagRadius;
