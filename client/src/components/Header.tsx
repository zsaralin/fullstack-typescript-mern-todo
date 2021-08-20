import React from 'react'
import DateComp from "./theDate";

function Header(props: { meetingLen: number, debug: boolean }) {
    let divValue = props.debug? 1000: 60;
    return (
        <div style={{display: 'flex', flexDirection: 'row', backgroundColor: 'white', marginBottom: '.3%'}}>
            <h1 style={{fontSize: '30px', flex: '1 1', color: 'black'}}>Research Project Updates
                Meeting </h1>
            <div className="headerWrapper" style={{alignContent: 'right', textAlign: 'right'}}>
                <div style={{fontSize: '20px', fontWeight: 'bold'}}> {props.meetingLen / divValue} min
                </div>
                <DateComp/>
            </div>
        </div>)
}
export default Header
