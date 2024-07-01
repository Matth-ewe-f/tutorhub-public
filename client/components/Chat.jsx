"use client"

import SendbirdApp from '@sendbird/uikit-react/App';
import NavBar from './Navbar'; // Assuming you have this component for navigation
import { useUser } from "@clerk/nextjs";

const APP_ID = process.env.NEXT_PUBLIC_SEND_BIRD_APP_ID;

const myColorSet = {
   '--sendbird-light-primary-500': '#002D72', 
   '--sendbird-light-primary-400': '#004BA8', 
   '--sendbird-light-primary-300': '#2E4482', 
   '--sendbird-light-primary-200': '#5472B8', 
   '--sendbird-light-primary-100': '#9BA9D3', 
   
   '--sendbird-light-secondary-500': '#000000', 
};


export default function Chat({ userId }) {
   return (
      <div style={{ height: "100vh", width: "100vw" }}>
         <SendbirdApp appId={APP_ID} userId={userId} colorSet={myColorSet} />
      </div>
   );
}
