import React, { FC } from "react";
import { SignIn } from "@clerk/nextjs";
import "../../styles/global.css";

const Page : FC = () => {
  return (
		<div className="flex flex-wrap h-screen justify-center content-center">
			<SignIn path="/signIn"/>
		</div>
	);
};

export default Page;