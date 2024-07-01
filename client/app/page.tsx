import React, { FC } from "react";
import "../styles/global.css";
import { UserButton } from "@clerk/nextjs";

const Page : FC = () => {
  return <>
    <UserButton/>
    <a href="/signIn">sign in</a>
  </>;
};

export default Page;