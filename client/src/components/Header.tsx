import React from 'react'
import DateComp from "./theDate";

function Header(props: { meetingLen: number }) {
    return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <h1 style={{fontSize: '30px', flex: '1 1', color: 'black'}}>Research Project Updates
                Meeting </h1>
            <div className="headerWrapper" style={{alignContent: 'right', textAlign: 'right'}}>
                <div style={{fontSize: '20px', fontWeight: 'bold'}}> {props.meetingLen / 1000} min
                </div>
                <DateComp/>
            </div>
        </div>)
}
export default Header
