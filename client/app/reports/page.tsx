"use client";

import "@/styles/global.css";
import "@/styles/basic.css";
import Loader from "@/components/Loader";
import NavBar from "@/components/Navbar";
import ReportCard from "@/components/ReportCard";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Cookies from "universal-cookie";

const Page : FC = () => {
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;
  const cookies = new Cookies(null, {path: "/"});
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Profile>();
  const [authorized, setAuthorized] = useState(false);
  const [allReports, setAllReports] = useState<report[]>([]);
  const [visibleReports, setVisibleReports] = useState<report[]>([]);
  const [viewMode, setViewMode] = useState("unresolved");
  const router = useRouter();

  const verifyAdmin = async () => {
    const username = cookies.get("tutorhub-public-username");
    const response = await axios.get(`${api}/profiles/getByUsername/${username}`);
    if (response.data.data.length == 0 || username !== "Admin") {
      router.replace("/");
    } else {
      setProfileData(response.data.data[0]);
      setAuthorized(true);
    }
  }

  useEffect(() => { verifyAdmin() }, [])

  const loadReports = async () => {
    if (!authorized) {
      return;
    }
    const response = await axios.get(`${api}/reports/findAll`);
    setAllReports(response.data.reports);
    setLoading(false);
  }

  useEffect(() => { loadReports() }, [authorized]);

  const filterReports = () => {
    if (viewMode === "all") {
      setVisibleReports(allReports);
    } else if (viewMode === "unresolved") {
      setVisibleReports(allReports.filter((report) => !report.resolved));
    } else if (viewMode === "resolved") {
      setVisibleReports(allReports.filter((report) => report.resolved));
    }
  }

  useEffect(filterReports, [allReports, viewMode]);

  if (loading) {
    return (<> <Loader /> </>);
  }

  const resolveById = async (id: string) => {
    const url = `${api}/reports/resolve/${id}`;
    const response = await axios.put(url);
    if (response.status === 200) {
      let newReports = allReports.slice();
      newReports.forEach((report) => {
        if (report._id === id) {
          report.resolved = true;
        }
      });
      setAllReports(newReports);
    }
  }

  return (
    <>
      <NavBar profile={profileData}/>
      <div className="flex flex-col md:flex-row md:justify-center min-h-96 mx-4">
        <div 
          className="mt-4 md:mt-12 md:pr-6 md:mr-12 pt-4 min-w-56
          md:border-r-2 border-black"
        >
          <RadioGroup 
            defaultValue="unresolved"
            onValueChange={ (value) => setViewMode(value) }
          >
            <div className="flex gap-x-1 items-center">
              <RadioGroupItem value="unresolved" id="radio-unresolved"/>
              <Label htmlFor="radio-unresolved" className="md:text-lg cursor-pointer">
                Unresolved Only
              </Label>
            </div>
            <div className="flex gap-x-1 items-center">
              <RadioGroupItem value="resolved" id="radio-resolved"/>
              <Label htmlFor="radio-resolved" className="md:text-lg cursor-pointer">
                Resolved Only
              </Label>
            </div>
            <div className="flex gap-x-1 items-center">
              <RadioGroupItem value="all" id="radio-all"/>
              <Label htmlFor="radio-all" className="md:text-lg cursor-pointer">
                All Reports
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div 
          className="mt-8 md:mt-16 max-w-3xl w-full
          flex flex-col items-center gap-y-4 "
        >
          { visibleReports.map((report, index) => {
            return (
              <ReportCard
                key={`report-${index}`}
                report={report}
                className="mb-4 bg-white rounded-lg shadow-md w-full"
                resolveFunc={() => { resolveById(report._id) }}
              />
            )
          })}
          { visibleReports.length === 0 ? 
            <p>No reports!</p>
          :
            <></>
          }
        </div>
      </div>
    </>
  );
};

export default Page;
