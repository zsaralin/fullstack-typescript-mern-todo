import React from 'react'

function MeetingLenMenu(props: { handleFormOnSubmit:(e:any)=>void, meetingLenMenu: boolean,
    handleForm:(e:any)=>void, tempMeeting: number | undefined,
    setTempMeeting:(e: any)=>void, toggleMeetingLenMenu:()=>void
    }) {
    return (
        <form className="meetingLenForm" onSubmit={props.handleFormOnSubmit}
              style={{display: !props.meetingLenMenu ? 'none' : ''}}
        >
            <label> Meeting Length:
                <input className="inputMeetingLen" onKeyDown={props.handleForm}
                       onSubmit={props.handleFormOnSubmit}
                       onChange={(e: any) => props.setTempMeeting(e.target.value)}
                       value={props.tempMeeting || ''}
                       id='meetingLen'/> min
            </label>
            <button className="buttonStyle" disabled={props.tempMeeting === undefined}
                    type='submit'>Submit
            </button>
            <button className="xOutMeetingLen" onClick={props.toggleMeetingLenMenu}>x</button>
        </form>)
}
export default MeetingLenMenu
