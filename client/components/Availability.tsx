import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useUser } from '@clerk/clerk-react';


const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const api = process.env.NEXT_PUBLIC_BACKEND_URL;

const TimeSlot = ({ intervalIndex, selectActive, isSelected, onToggle }) => {
    const borderClass = intervalIndex % 2 !== 0 ? "border-dashed" : "border-solid";
    const backgroundColor = isSelected ? "bg-green-200" : "bg-white";
    return (
      <div
        className={`border-t border-black h-6 ${borderClass} ${backgroundColor} cursor-pointer`}
        onClick={selectActive ? () => onToggle(intervalIndex) : undefined}
      />
    );
};

const DayColumn = ({ day, selectActive, selections, onToggle }) => {
    const intervals = Array.from({ length: 48 }, (_, index) => index);
    
    return (
      <div className="flex flex-col border-y border-l border-black last:border-r">
        <div className="text-center font-bold">{day}</div>
        {intervals.map(interval => (
          <TimeSlot
            key={interval}
            intervalIndex={interval + daysOfWeek.indexOf(day) * 48} // Calculate global index based on day and local index
            selectActive={selectActive}
            isSelected={selections[interval + daysOfWeek.indexOf(day) * 48]}
            onToggle={onToggle}
          />
        ))}
      </div>
    );
};

const WeekGrid = ({ selectActive, selections, onToggle }) => {
    return (
        <div className="grid grid-cols-8"> 
            <HourLabels />
            {daysOfWeek.map((day, index) => (
                <DayColumn key={index} day={day} selectActive={selectActive} selections={selections} onToggle={onToggle} />
            ))}
        </div>
    );
};

const HourLabels = () => {
    const hours = Array.from({ length: 24 }, (_, index) => `${index}:00`);
    
    return (
      <div className="flex flex-col justify-between h-full py-3">
        {hours.map((hour, index) => (
          <div key={index} className="text-right text-xs pr-2 h-12 leading-6 font-bold">{hour}</div>
        ))}
      </div>
    );
};

const Page = () => {
    const [select, setSelect] = useState(false);
    const [selections, setSelections] = useState(new Array(336).fill(0));
    const { isLoaded, isSignedIn, user } = useUser();
    const [userId, setUserId] = useState('');

    const fetchData = async () => {
        if (!isLoaded || !isSignedIn) {
          return false;
        }
        const userInfo = await axios.get(`${api}/profiles/getByEmail/${user.primaryEmailAddress.toString()}`);
        const userId = userInfo.data.data[0]._id;
        setUserId(userId);
        const availability = userInfo.data.data[0].availability;
        const avail = new Array(336).fill(0);
        availability.forEach(index => avail[index] = 1);
        setSelections(avail);
    }

    useEffect(() => {
        fetchData();
    }, [api, user, isLoaded, isSignedIn]);

    const handleEditAvailability = async () => {
        const availability = selections.map((value, index) => value === 1 ? index : -1).filter(index => index !== -1);
        if (select) {
            axios.put(`${api}/profiles/availability/${userId}`, { availability: availability });
        }
        setSelect((prevSelect) => !prevSelect);
    };

    const toggleSelection = async (index) => {
        const newSelections = [...selections];
        if (newSelections[index] === 0) {
            newSelections[index] = 1;
        } else {
            newSelections[index] = 0;
        }
        
        setSelections(newSelections);
    };

    return (
    <div className="p-5">
      <div className="grid grid-cols-8"> 
        <div />
        <div>
          <button 
            onClick={handleEditAvailability}
            className={`h-10 w-24 p-2 mt-2 mb-4 font-bold rounded-md
            text-white
            ${select 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-custom-blue hover:bg-blue-900'
            }`}
          >
            {select ? 'Save' : 'Edit'}
          </button>
          <p className={`font-bold w-96 ${select ? 'text-red-600' : ''}`}>
            { select ?
              "Currently editing availability..."
            :
              "Your Availability"
            }
          </p>
        </div>
      </div>
      <WeekGrid selectActive={select} selections={selections} onToggle={toggleSelection} />
    </div>
    );
};

export default Page;