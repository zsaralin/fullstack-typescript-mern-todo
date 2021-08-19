import React from 'react'

function TimeMenu(props: {
    timeMenu: boolean, toggleTimeMenu: () => void, isDemo: boolean, changeMeetingStyle: () => void,
}) {
    return (
        <div className="dropdownMenu">
            <div className="addPresMenu" style={{display: !props.timeMenu ? 'none' : ''}}>
                <label> Meeting Time:
                    <button className= 'timeButton' onClick={props.changeMeetingStyle}>{props.isDemo? 'SECONDS': 'MINUTES'}</button>
                </label>
                <button className="xOutSettingsBar" onClick={props.toggleTimeMenu}>x</button>
            </div>
        </div>)
}

export default TimeMenu
