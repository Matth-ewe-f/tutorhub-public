import React, { FC } from "react";
import { SignUp } from "@clerk/nextjs";
import "../../styles/global.css";

const Page : FC = () => {
  return (
		<div className="flex flex-wrap h-screen justify-center content-center">
			<SignUp/>
		</div>
	);
};

export default Page;