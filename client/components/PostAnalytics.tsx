"use client";
import axios from 'axios';
import { ChevronDown, ChevronUp, Square, Star } from 'lucide-react';
import React, { FC, useEffect, useState } from 'react';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem } from './ui/dropdown-menu';
import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu';
import { Button } from './ui/button';

type view = {
  viewerId: string,
  timestamp: string,
  durationInSeconds: number,
}

type Review = {
  postId: string,
  postName?: string,
  postType?: string,
  posterId: string,
  reviewerId: string,
  title?: string,
  reviewDescription: string,
  rating: number,
}

type lineGraphPoint = { label: string, value: number }

type pieGraphPoint = { _id: string, count: number }

type Post = {
  _id: string;
  userId: string;
  username?: string;
  activityTitle?: string;
  activityDescription?: string;
  courseName?: string;
  description?: string;
  imageUrl?: string;
  price: number;
  courseNumber?: string;
  courseDepartment?: string[];
  gradeReceived?: string;
  semesterTaken?: string;
  professorTakenWith?: string;
  takenAtHopkins?: boolean;
  schoolTakenAt?: string;
  tags?: string[];
  reviews: Review[],
  __v: number;
}

type props = {
  postId: string,
  postType: string
}

const PostAnalytics : FC<props> = (props) => {
  const analyticsSections = ["Overview", "Post Viewers"];
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;
  const id = props.postId;
  const animDuration = 1000;

  const [open, setOpen] = useState(false);
  const [activeAnalytics, setActiveAnalytics] = useState(analyticsSections[0]);
  const [timeScale, setTimeScale] = useState("Last 30 Days");
  const [rawViewsData, setRawViewsData] = useState<view[]>([]);
  const [viewsGraphData, setViewsGraphData] = useState<lineGraphPoint[]>([]);
  const [timeGraphData, setTimeGraphData] = useState<lineGraphPoint[]>([]);
  const [majorData, setMajorData] = useState<pieGraphPoint[]>([]);
  const [yearData, setYearData] = useState<pieGraphPoint[]>([]);
  const [affiliationData, setAffiliationData] = useState<pieGraphPoint[]>([]);
  const postType = props.postType;

  const capitalize = (s : string) => {
    const pieces = s.split(" ");
    const newPieces = pieces.map((piece) => {
      return `${piece.charAt(0).toUpperCase()}${piece.substring(1)}`
    })
    return newPieces.join(' ');
  }

  const timeScaleToDays = () => {
    if (timeScale === "Last Week") {
      return 8;
    } else if (timeScale === "Last 30 Days") {
      return 30;
    } else if (timeScale === "Last 90 Days") {
      return 90;
    } else if (timeScale === "Last 6 Months") {
      return 180;
    }
  }

  const getDaysAgo = (days : number) => {
    const result = new Date();
    result.setHours(0);
    result.setMinutes(0);
    result.setSeconds(0);
    result.setDate(result.getDate() - (days - 1));
    return result;
  }

  const getDateLabel = (date : Date) => {
    var options = { month: "long", day: "numeric" };
    // @ts-ignore (issue with the options)
    return date.toLocaleDateString(undefined, options);
  }

  const getBuckets = (input : Date, days : number) => {
    const interval = Math.floor(days / 4);
    const boundary1 = getDaysAgo(interval);
    const boundary2 = getDaysAgo(interval * 2);
    const boundary3 = getDaysAgo(interval * 3);
    const boundary4 = getDaysAgo(interval * 4);
    if (input > boundary1) {
      return 3;
    } else if (input > boundary2) {
      return 2;
    } else if (input > boundary3) {
      return 1;
    } else if (input > boundary4) {
      return 0;
    } else {
      return -1;
    }
  }

  const getViewsData = async () => {
    const endpoint = `${api}/${postType}/views/${id}`;
    const response = await axios.get(endpoint);
    const rawData : view[] = response.data.data.views;
    setRawViewsData(rawData);
  }

  const displayViewsData = async () => {
    const days = timeScaleToDays();
    const interval = Math.floor(days / 4);
    let frequency = [0, 0, 0, 0];
    let viewTime = [0, 0, 0, 0];
    rawViewsData.forEach((data : view) => {
      const bucket = getBuckets(new Date(data.timestamp), days);
      if (bucket != -1) {
        frequency[bucket]++;
        viewTime[bucket] += data.durationInSeconds;
      }
    })
    let viewsData = [];
    let timeData = [];
    frequency.forEach((number, index) => {
      viewsData[index] = {
        label: getDateLabel(getDaysAgo((4 - index) * interval)),
        value: number
      }
      timeData[index] = {
        label: getDateLabel(getDaysAgo((4 - index) * interval)),
        value: number === 0 ? 0 : viewTime[index] / number
      }
    })
    setViewsGraphData(viewsData);
    setTimeGraphData(timeData);
  }

  const getDemographicsData = async () => {
    const endpoint = `${api}/${postType}/demographics/${id}`;
    const params = { params: { start: getDaysAgo(timeScaleToDays()) }};
    const response = await axios.get(endpoint, params);
    const data = response.data;
    let majors : pieGraphPoint[] = data.departments;
    majors = majors.map((point) => {
      point._id = capitalize(point._id);
      return point;
    })
    setMajorData(majors);
    let affiliations : pieGraphPoint[] = data.affiliations;
    affiliations = affiliations.map((point) => {
      point._id = capitalize(point._id);
      return point;
    })
    setAffiliationData(affiliations);
    let grads : pieGraphPoint[] = data.graduationYears;
    grads = grads.filter((obj) => obj._id );
    setYearData(grads);
  }

  useEffect(() => { getViewsData() }, [])

  useEffect(() => { displayViewsData() }, [timeScale, rawViewsData])

  useEffect(() => { getDemographicsData() }, [])
  
  const pieColors = ['#ef4444', '#a3e635', '#38bdf8', '#ec4899', '#f59e0b', '#34d399', '#a855f7']
  
  const lineChartTooltipGenereator = (
    { payload, label, active }, valueLabel : string
  ) => {
    if (active) {
      return (
        <div 
          className="bg-white px-2 py-1 border
          border-slate-300"
        >
          <p className="font-bold text-slate-800">{label}</p>
          <p className="text-gray-600">{`${valueLabel}: ${payload[0].value.toFixed(1)}`}</p>
        </div>
      );
    }
    return <></>;
  }

  const lineChartTooltip = (valueLabel : string) => {
    return ({ payload, label, active }) => { 
      return lineChartTooltipGenereator({ payload, label, active }, valueLabel)
    } 
  }

  const pieChartLabel = (
    { cx, cy, midAngle, innerRadius, outerRadius, percent }
  ) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
  
    return (
      <text 
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getAnalyticsOverview = () => {
    return (
      <>
        <div 
          className="flex flex-col flex-grow basis-[440px] 
          md:min-w-[440px] max-w-[640px]"
        >
          <div className="bg-white md:px-8 py-8 mb-8 md:rounded-xl md:shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Number of Post Views
            </h3>
            <ResponsiveContainer width="100%" height={300} className="pr-4 md:pr-0">
              <LineChart data={viewsGraphData}>
                <CartesianGrid stroke="#ccc"/>
                <Line type="monotone" dataKey="value" stroke="#8884d8" animationDuration={animDuration}/>
                <Tooltip content={lineChartTooltip("views")}/>
                <XAxis dataKey="label"/>
                <YAxis/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white md:px-8 py-8 mb-8 md:rounded-xl md:shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Average Time Spent on Post
            </h3>
            <ResponsiveContainer width="100%" height={300} className="pr-4 md:pr-0"> 
              <LineChart data={timeGraphData}>
                <CartesianGrid stroke="#ccc"/>
                <Line type="monotone" dataKey="value" stroke="#8884d8" animationDuration={animDuration}/>
                <Tooltip content={lineChartTooltip("seconds")}/>
                <XAxis dataKey="label"/>
                <YAxis/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    )
  }

  const getViewersSection = () => {
    if (majorData.length < 1) {
      return <div className='h-96'>
        <h3 className='text-2xl'>
          Your post does not have enough views!
        </h3>
      </div>;
    }
    return <>
      <div
        className="bg-white px-8 py-8 mb-8 md:rounded-xl md:shadow-md
        flex-grow md:basis-[480px] md:min-w-[480px] max-w-[540px]"
      >
        <h3 className="text-2xl font-bold mb-4 text-center">
          Post Viewers by Major
        </h3>
        <div className="flex md:flex-row flex-col">
          <PieChart width={300} height={300}>
            <Pie 
              data={majorData}
              dataKey="count"
              nameKey="id"
              outerRadius={130}
              fill='#3b82f6'
              labelLine={false}
              label={pieChartLabel}
              animationDuration={animDuration}
            >
              { majorData.map((data, index) => {
                return (
                  <Cell 
                    fill={pieColors[index % pieColors.length]}
                    key={`major-pie-cell-${index}`}
                  />
                )
              })}
            </Pie>
          </PieChart>
          <div className="flex flex-col justify-start">
            { majorData.map((data, index) => {
              return (
                <div className="flex gap-x-2" key={`pie-1-key-${index}`}>
                  <Square 
                    fill={pieColors[index % pieColors.length]}
                    strokeWidth={1}
                  />
                  <p>{data._id}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div
        className="bg-white px-8 py-8 mb-8 md:rounded-xl md:shadow-md
        flex-grow md:basis-[480px] md:min-w-[480px] max-w-[540px]"
      >
        <h3 className="text-2xl font-bold mb-4 text-center">
          Post Viewers by Graduation Year
        </h3>
        <div className="flex md:flex-row flex-col">
          <PieChart width={300} height={300}>
            <Pie 
              data={yearData}
              dataKey="count"
              nameKey="id"
              outerRadius={130}
              fill='#3b82f6'
              labelLine={false}
              label={pieChartLabel}
              animationDuration={animDuration}
            >
              { yearData.map((data, index) => {
                return (
                  <Cell 
                    fill={pieColors[index % pieColors.length]}
                    key={`year-pie-cell-${index}`}
                  />
                )
              })}
            </Pie>
          </PieChart>
          <div className="flex flex-col justify-start">
            { yearData.map((data, index) => {
              return (
                <div className="flex gap-x-2" key={`pie-2-key-${index}`}>
                  <Square 
                    fill={pieColors[index % pieColors.length]}
                    strokeWidth={1}
                  />
                  <p>{data._id}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div
        className="bg-white px-8 py-8 mb-8 md:rounded-xl md:shadow-md
        flex-grow md:basis-[480px] md:min-w-[480px] max-w-[540px]"
      >
        <h3 className="text-2xl font-bold mb-4 text-center">
          Post Viewers by Affiliation Type
        </h3>
        <div className="flex md:flex-row flex-col">
          <PieChart width={300} height={300}>
            <Pie 
              data={affiliationData}
              dataKey="count"
              nameKey="id"
              outerRadius={130}
              fill='#3b82f6'
              labelLine={false}
              label={pieChartLabel}
              animationDuration={animDuration}
            >
              { affiliationData.map((data, index) => {
                return (
                  <Cell 
                    fill={pieColors[index % pieColors.length]}
                    key={`year-pie-cell-${index}`}
                  />
                )
              })}
            </Pie>
          </PieChart>
          <div className="flex flex-col justify-start">
            { affiliationData.map((data, index) => {
              return (
                <div className="flex gap-x-2" key={`pie-3-key-${index}`}>
                  <Square 
                    fill={pieColors[index % pieColors.length]}
                    strokeWidth={1}
                  />
                  <p>{data._id}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  }

  if (rawViewsData.length < 3) {
    return <h1 className="font-sans font-extrabold text-xl leading-none text-slate-800 py-2">
      No Analytics (not enough views)
    </h1> 
  }

  return (
    <>
      <div className="flex flex-col flex-grow">
        <div className="flex items-center mb-1">
          <h1 className="font-sans font-extrabold uppercase text-3xl leading-none text-slate-800 py-2">Post Analytics</h1>
          { open ?
            <button className='ml-4' onClick={() => setOpen(false)}>
              <ChevronDown/>
            </button>
          :
            <button className='ml-4' onClick={() => setOpen(true)}>
              <ChevronUp/>
            </button>
          }
        </div>
        <div 
          className={`flex justify-center gap-x-4 mb-4 
          ${!open ? 'hidden' : ''}`}
        >
          <div 
            className="flex flex-row flex-grow-0 px-1 py-1 bg-sky-50 gap-x-1
            rounded-lg"
          >
            { analyticsSections.map((section) => {
              return (
                <button 
                  className={`text-lg px-2 py-1 rounded-md transition
                  ${section === activeAnalytics ? 'bg-sky-200' 
                  : 'hover:bg-blue-300'}`}
                  disabled={section === activeAnalytics}
                  onClick={() => setActiveAnalytics(section)}
                  key={section}
                >
                  {section}
                </button>
              )
            })}
          </div>
          <div className='flex justify-center z-10'>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button 
                  className='text-lg font-bold bg-custom-blue hover:bg-blue-900
                  rounded-lg'
                >
                  {timeScale} <ChevronDown/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className='bg-blue-300 rounded-xl px-2 py-1.5 border mt-1'
              >
                <DropdownMenuItem 
                  className='p-0 mb-1 hover:cursor-pointer text-lg font-bold
                  rounded-xl overflow-hidden'
                  onClick={ () => setTimeScale("Last Week") }
                >
                  <div className='hover:bg-sky-100 px-3 py-1 w-full'>
                    Last Week
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className='p-0 mb-1 hover:cursor-pointer text-lg font-bold
                  rounded-xl overflow-hidden'
                  onClick={ () => setTimeScale("Last 30 Days") }
                >
                  <div className='hover:bg-sky-100 px-3 py-1 w-full'>
                    Last 30 Days
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className='p-0 mb-1 hover:cursor-pointer text-lg font-bold
                  rounded-xl overflow-hidden'
                  onClick={ () => setTimeScale("Last 90 Days") }
                >
                  <div className='hover:bg-sky-100 px-3 py-1 w-full'>
                    Last 90 Days
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className='p-0 hover:cursor-pointer text-lg font-bold
                  rounded-xl overflow-hidden'
                  onClick={ () => setTimeScale("Last 6 Months") }
                >
                  <div className='hover:bg-sky-100 px-3 py-1 w-full'>
                    Last 6 Months
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div 
          className={`flex justify-center flex-wrap flex-grow gap-x-8
          ${!open ? 'hidden' : ''}`}
        >
          { activeAnalytics === "Overview" ? 
            getAnalyticsOverview()
          :
            getViewersSection()
          }
        </div>
      </div>
      </>
  );
}

export default PostAnalytics;