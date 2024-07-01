'use client';
import Head from 'next/head'
import dynamic from "next/dynamic";
import '@sendbird/uikit-react/dist/index.css';
import { useUser } from "@clerk/nextjs";
import NavBar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import '@/styles/global.css';

const DynamicAppWithNoSSR = dynamic(() => import("../../components/Chat"), {
  ssr: false,
  loading: () => <p>...</p>
});

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [jhed, setJhed] = useState("");

  const getSendbirdUserId = () => {
    if (user && user.primaryEmailAddress) {
      const email = user.primaryEmailAddress.toString();
      const atIndex = email.indexOf('@');
      if (atIndex !== -1 && email.endsWith('@jhu.edu')) {
        setJhed(email.substring(0, atIndex));
      } else {
        console.error('Invalid email format');
      }
    } else {
      console.error('Email address not available');
    }
  }

  useEffect(getSendbirdUserId, [isLoaded, isSignedIn, user]);

  return (
    <>
      <NavBar/>
      <Head>
        <title>UIKit with NextJS 13</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
      {/* <main className={styles.main}> */}
        <DynamicAppWithNoSSR userId={jhed}/>
      </main>
    </>
  )
}