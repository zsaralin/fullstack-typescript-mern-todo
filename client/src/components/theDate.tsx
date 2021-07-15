import React, { useState, useEffect } from 'react';

export const DateTime = () => {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setDateTime(new Date()));
        return () => {
            clearInterval(id);
        }
    }, []);

    return (
        <h4
        style = {{ fontSize: '20px', marginBottom: '3px'
        }}>{`${dateTime.toLocaleDateString()}`}</h4>
    );

}

export default DateTime;