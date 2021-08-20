import React, {useEffect, useState} from 'react'
import ToggleButton from "./ToggleButton";

function TimeMenu(props: {
    timeMenu: boolean, toggleTimeMenu: () => void, isDebug:() => void, meetingActive : boolean
}) {
    const [presenterWarning, setPresenterWarning] = useState(false);
    //get time from presenter
    const warningCallback = () => {
        setPresenterWarning(true)
    }
    useEffect(() => {
        if (presenterWarning) {
            setTimeout(() => {
                setPresenterWarning(false)
            }, 3000)
        }
    }, [presenterWarning])
    return (
        <div className="dropdownMenu">
            <div className="addPresMenu" style={{display: !props.timeMenu ? 'none' : '',
            zIndex: !props.timeMenu ? 0:1}}>
                <label> Debug Mode:
                    <ToggleButton isDebug={props.isDebug} meetingActive = {props.meetingActive}
                    presenterWarning={warningCallback}/>
                </label>
                <button className="xOutSettingsBar" onClick={props.toggleTimeMenu}>x</button>
            </div>
            <div className='addPresMenu'
                 style={{width: 'fit-content', opacity: !presenterWarning ? 0 : '100%',
                     transition: !presenterWarning ? 'opacity 5s' : 'opacity 1s'
                 }}> Cannot change modes when meeting is active. Please refresh and try again. </div>

        </div>)
}

export default TimeMenu
