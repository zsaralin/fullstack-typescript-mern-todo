import React, {useState} from 'react'
import './cssFiles/DropdownMenu.css'

function MeetingLenMenu(props: { meetingLenMenu: boolean, toggleMeetingLenMenu:()=>void,
    meetingLenCallback: (e: React.FormEvent, meetingLen: number) => void
    }) {
    const [tempMeeting, setTempMeeting] = useState<number>();

    const handleForm = (e: any) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setTempMeeting(undefined)
            props.meetingLenCallback(e,e.target.value);
        }
    }
    const handleFormOnSubmit = (e: any) => {
        e.preventDefault();
        setTempMeeting(undefined)
        props.meetingLenCallback(e,e.target.value);
    }
    return (
        <form className="meetingLenForm" onSubmit={handleFormOnSubmit}
              style={{display: !props.meetingLenMenu ? 'none' : ''}}
        >
            <label> Meeting Length:
                <input className="inputMeetingLen" onKeyDown={handleForm}
                       onSubmit={handleFormOnSubmit}
                       onChange={(e: any) => setTempMeeting(e.target.value)}
                       value={tempMeeting || ''}
                       id='meetingLen'/> min
            </label>
            <button className="submitButton" disabled={tempMeeting === undefined}
                    type='submit'>Submit
            </button>
            <button className="xOutSettingsBar" onClick={props.toggleMeetingLenMenu}>x</button>
        </form>)
}
export default MeetingLenMenu
