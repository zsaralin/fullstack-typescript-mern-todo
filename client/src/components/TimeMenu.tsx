import React from 'react'
import ToggleButton from "./ToggleButton";

function TimeMenu(props: {
    timeMenu: boolean, toggleTimeMenu: () => void, isDemo: boolean, changeMeetingStyle: () => void,
}) {
    return (
        <div className="dropdownMenu">
            <div className="addPresMenu" style={{display: !props.timeMenu ? 'none' : ''}}>
                <label> Debug Mode:
                    <ToggleButton/>
                </label>
                <button className="xOutSettingsBar" onClick={props.toggleTimeMenu}>x</button>
            </div>

        </div>)
}

export default TimeMenu
