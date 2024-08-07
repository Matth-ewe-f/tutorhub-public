"use client";
import axios from 'axios';
import { ChevronDown, Square, Star } from 'lucide-react';
import React, { FC, useEffect, useState } from 'react';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem } from './ui/dropdown-menu';
import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu';
import { Button } from './ui/button';

type props = {
  profileId: string,
  bestPosts: Post[],
}

const ProfileAnalytics : FC<props> = (props) => {
  const analyticsSections = ["Overview", "Profile Viewers"];
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;
  const id = props.profileId;
  const animDuration = 1000;

  const [activeAnalytics, setActiveAnalytics] = useState(analyticsSections[0]);
  const [timeScale, setTimeScale] = useState("Last 30 Days");
  const [rawViewsData, setRawViewsData] = useState<view[]>([]);
  const [viewsGraphData, setViewsGraphData] = useState<lineGraphPoint[]>([]);
  const [timeGraphData, setTimeGraphData] = useState<lineGraphPoint[]>([]);
  const [majorData, setMajorData] = useState<pieGraphPoint[]>([]);
  const [yearData, setYearData] = useState<pieGraphPoint[]>([]);
  const [affiliationData, setAffiliationData] = useState<pieGraphPoint[]>([]);

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

  const getRandomInt = (max : number) => {
    // not perfectly random but good enough
    return Math.round(Math.random() * max);
  }

  const getRandomTimestamp = (earliest: Date) => {
    const lowest : number = earliest.getTime();
    const highest : number = new Date().getTime();
    return new Date(getRandomInt(highest - lowest) + lowest);
  }

  const getViewsData = async () => {
    // uncomment to use real data
    // const endpoint = `${api}/profiles/views/${id}`;
    // const response = await axios.get(endpoint);
    // const rawData : view[] = response.data.data.views;
    let rawData : view[] = [];
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - (1000 * 60 * 60 * 24 * 180));
    for (let i = 0;i < 300;i++) {
      rawData[i] = { 
        viewerId: "",
        timestamp: getRandomTimestamp(sixMonthsAgo).toISOString(),
        durationInSeconds: getRandomInt(40),
      }
    }
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

  const createOtherCategory = (points : pieGraphPoint[], bound: number) => {
    let total = 0;
    points.forEach((point) => (total += point.count));
    const lowerBound = total * bound;
    let abovePoints = points.filter((point) => point.count > lowerBound);
    const belowPoints = points.filter((point) => point.count <= lowerBound);
    let otherTotal = 0;
    belowPoints.forEach((point) => (otherTotal += point.count));
    if (otherTotal > 0) {
      abovePoints = abovePoints.concat({ _id: "Other", count: otherTotal});
    }
    return abovePoints;
  }

  const getRandomDepartments = () => {
    let departments = ["Computer Science", "East Asian Studies", "Mathematics", "Physics", "Archeology", "Chemistry", "Biology", "Mechanical Engineering", "Film and Media Studies", "Philosophy", "History", "French", "English", "Civil Engineering", "Biophysics", "Computer Engineering", "Electrical Engineering"]
    let result : pieGraphPoint[] = [];
    const bound = getRandomInt(4) + 8;
    for (let i = 0;i < bound;i++) {
      const index = getRandomInt(departments.length - 1);
      result[i] = { _id: departments[index], count: getRandomInt(15) };
      departments.splice(index, 1);
    }
    return result;
  }

  const getRandomAffiliations = () => {
    return [
      { _id: "Student", count: getRandomInt(15)},
      { _id: "Faculty", count: getRandomInt(15)},
      { _id: "Other", count: getRandomInt(5)},
    ]
  }

  const getRandomYears = () => {
    const now = new Date().getFullYear();
    return [
      { _id: now.toString(), count: getRandomInt(15)},
      { _id: (now + 1).toString(), count: getRandomInt(15)},
      { _id: (now + 2).toString(), count: getRandomInt(15)},
      { _id: (now + 3).toString(), count: getRandomInt(15)},
    ]
  }

  const getDemographicsData = async () => {
    // uncomment to use real data
    // const endpoint = `${api}/profiles/demographics/${id}`;
    // const params = { params: { start: getDaysAgo(timeScaleToDays()) }};
    // const response = await axios.get(endpoint, params);
    // const data = response.data;
    let data = {
      departments: getRandomDepartments(),
      affiliations: getRandomAffiliations(),
      graduationYears: getRandomYears(),
    }
    let majors : pieGraphPoint[] = data.departments;
    majors = majors.map((point) => {
      point._id = capitalize(point._id);
      return point;
    })
    setMajorData(createOtherCategory(majors, 0.05));
    let affiliations : pieGraphPoint[] = data.affiliations;
    affiliations = affiliations.map((point) => {
      point._id = capitalize(point._id);
      return point;
    })
    setAffiliationData(affiliations);
    let grads : pieGraphPoint[] = data.graduationYears;
    grads = grads.filter((obj) => obj._id );
    setYearData(createOtherCategory(grads, 0.05));
  }

  useEffect(() => { getViewsData() }, [])

  useEffect(() => { displayViewsData() }, [timeScale, rawViewsData])

  useEffect(() => { getDemographicsData() }, [])
  
  const pieColors = ['#ef4444', '#a3e635', '#38bdf8', '#ec4899', '#f59e0b', '#34d399', '#a855f7', '#e3d000', '#79e880', '#ffaf85', '#5727f5', '#adadad']
  
  const lineChartTooltipGenereator = (
    { payload, label, active}, valueLabel : string, d : number
  ) => {
    if (active) {
      return (
        <div 
          className="bg-white px-2 py-1 border
          border-slate-300"
        >
          <p className="font-bold text-slate-800">{label}</p>
          <p className="text-gray-600">{`${valueLabel}: ${payload[0].value.toFixed(d)}`}</p>
        </div>
      );
    }
    return <></>;
  }

  const lineChartTooltip = (valueLabel : string, d : number) => {
    return ({ payload, label, active }) => { 
      return lineChartTooltipGenereator({ payload, label, active }, valueLabel, d)
    } 
  }

  const pieChartLabel = (
    { cx, cy, midAngle, innerRadius, outerRadius, percent }
  ) => {
    const radiusProportion = Math.max((0.75 - (0.5 * percent)), 0.4);
    const radius = innerRadius + (outerRadius - innerRadius) * radiusProportion;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
  
    return (
      <text 
        x={x}
        y={y}
        fill="white"
        textAnchor={'middle'}
        dominantBaseline="central"
        className='inline-block bg-black'
      >
        {`${(percent * 100).toFixed(0)}%`}
        {/* {midAngle.toFixed(0)} */}
      </text>
    );
  };

  const getRating = (post : Post) => {
    let total = 0;
    post.reviews.forEach((r) => total += r.rating);
    return (total / post.reviews.length).toFixed(1);
  }

  const getAnalyticsOverview = () => {
    return (
      <>
        <div 
          className="flex flex-col flex-grow basis-[440px] 
          md:min-w-[440px] max-w-[640px]"
        >
          <div className="bg-white md:px-8 py-8 mb-8 rounded-xl md:shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Number of Profile Views
            </h3>
            <ResponsiveContainer width="100%" height={300} className="pr-4 md:pr-0">
              <LineChart data={viewsGraphData}>
                <CartesianGrid stroke="#ccc"/>
                <Line type="monotone" dataKey="value" stroke="#8884d8" animationDuration={animDuration}/>
                <Tooltip content={lineChartTooltip("views", 0)}/>
                <XAxis dataKey="label"/>
                <YAxis/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white md:px-8 py-8 mb-8 rounded-xl md:shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Average Time Spent on Profile
            </h3>
            <ResponsiveContainer width="100%" height={300} className="pr-4 md:pr-0"> 
              <LineChart data={timeGraphData}>
                <CartesianGrid stroke="#ccc"/>
                <Line type="monotone" dataKey="value" stroke="#8884d8" animationDuration={animDuration}/>
                <Tooltip content={lineChartTooltip("seconds", 1)}/>
                <XAxis dataKey="label"/>
                <YAxis/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div 
          className="flex flex-col flex-grow basis-[320px] 
          min-w-[320px] max-w-[560px]"
        >
          <div className="bg-white px-8 py-8 mb-8 rounded-xl md:shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Highest Rated Posts
            </h3>
            { props.bestPosts.length > 0 ?
              props.bestPosts.map((post, index) => {
                return <>
                  <div 
                    className="flex justify-between items-center mb-2"
                    key={`rated-post-${index}`}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-9 h-9 mr-5 flex flex-shrink-0
                        justify-center items-center bg-sky-800 rounded-3xl"
                      >
                        <p className="text-white font-bold text-2xl">
                          {index + 1}
                        </p>
                      </div>
                      <a
                        className="text-lg mr-2 line-clamp-1
                        hover:cursor-pointer hover:underline"
                      >
                        {post.courseName ? post.courseName : post.activityTitle }
                      </a>
                    </div>
                    <div className="flex items-center gap-x-1">
                      <Star size={20} strokeWidth={1} className="fill-yellow-300"/>
                      <p>{ getRating(post) }</p>
                    </div>
                  </div>
                </>
              })
            :
              <h3 className='text-lg'>Not enough ratings on your posts!</h3>
            }
          </div>
        </div>
      </>
    )
  }

  const getViewersSection = () => {
    if (rawViewsData.length < 5) {
      return <div className='h-96'>
        <h3 className='text-2xl'>
          Your profile does not have enough views!
        </h3>
      </div>;
    }
    return <>
      <div
        className="bg-white px-8 py-8 mb-8 md:rounded-xl md:shadow-md
        flex-grow md:basis-[480px] md:min-w-[480px] max-w-[540px]"
      >
        <h3 className="text-2xl font-bold mb-4 text-center">
          Profile Viewers by Major
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
          Profile Viewers by Graduation Year
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
          Profile Viewers by Affiliation Type
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

  return (
    <div className="flex flex-col flex-grow">
      <p className='w-full px-2 md:px-6 mb-2 text-center text-lg font-light'>
        Analytics data is simulated in this demo version of the app.
      </p>
      <div className="flex justify-center mb-4">
        <div 
          className="flex flex-row flex-grow-0 px-1 py-1 bg-sky-50 gap-x-1
          rounded-lg"
        >
          { analyticsSections.map((section) => {
            return (
              <button 
                className={`text-lg font-light px-2 py-1 rounded-md transition
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
      </div>
      { activeAnalytics == "Overview" &&
        <div className='flex justify-center mb-6 z-10'>
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
      }
      <div className="flex justify-center flex-wrap flex-grow gap-x-8">
        { activeAnalytics === "Overview" ? 
          getAnalyticsOverview()
        :
          getViewersSection()
        }
      </div>
    </div>
  );
}

export default ProfileAnalytics;