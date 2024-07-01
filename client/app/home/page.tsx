import React from "react";
import Link from 'next/link'; 
//import TutorHubLogo from "./TutorHubLogo.svg";
import "./LandingPage.css"; // Import your CSS file for styling
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { LinkedinIcon } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="header">
        {/* <img src={TutorHubLogo} alt="TutorHub Logo" className="logo" /> */}
        <h1 className="title">Welcome to TutorHub</h1>
        <p className="subtitle">Comprehensive Tutoring/Learning Platform for BlueJays</p>
      </div>

      <div className="typewriter">
        <div className="slide"><i></i></div>
        <div className="paper"></div>
        <div className="keyboard"></div>
      </div>


      <div className="content">
        <p className="description">
          Find someone at Hopkins who wants to teach exactly what you want to learn. <br/><br/>
          Whether it's math, science, language, sports, or music, TutorHub has you
          covered.
        </p>
        <Link href="/browse">
          <button className="startButton">
            Get Started
          </button>
        </Link>
        
      </div>
        <div className="footer">
        <a href="https://github.com/cs421sp24-homework/project-team-02" target="_blank" rel="noopener noreferrer">
            <GitHubIcon className="github-icon"/>
        </a>
        <a href="https://www.linkedin.com/in/dokyung-yang-679a1b19a/" target="_blank" rel="noopener noreferrer">
            <LinkedinIcon className="linkedin-icon"/>
        </a>
      </div>
      
    </div>
  );
};

export default LandingPage;

