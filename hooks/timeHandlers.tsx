import React from "react";

export const getDayInterval = (calendarId: string) => {
    //* Output: 45
};

export const getDayWorkHours = (selectedDate: Date) => {
  //* Object: { start_time: 2025-06-28 08:00, end_time: 2025-06-28 20:00 }
};


export const checkForReservations = (selectedDate: Date) => {
  
    // Output: 
  {

    {
      //start_time: 2025-06-28 18:00,
      //end_time: 2025-06-28 18:30
    }
    {
      //start_time: 19:00,
      //end_time: 19:30
    }
  }
};

export const getDaySlots = () => {
  // Output: 
  {
    {
      //start_time: 17:00,
      //end_time: 17:30
    }
    {
      //start_time: 17:30,
      //end_time: 18:00
    }
    {
      //start_time: 18:00,
      //end_time: 18:30
    }
    {
      //start_time: 18:30,
      //end_time: 19:00
    }
    {
      //start_time: 19:00,
      //end_time: 19:30
    }
  }
};

