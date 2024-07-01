import React, { FC } from "react";
import HelloWorld from "../components/HelloWorld";
import "../styles/global.css";
import { UserButton } from "@clerk/nextjs";

const Page : FC = () => {
  return <>
    <HelloWorld/>
    <UserButton/>
    <a href="/signIn">sign in</a>
  </>;
};

export default Page;