import axios from "axios";
import { FC, HTMLAttributes, useEffect, useRef, useState } from "react";
import { Check, Lightbulb } from "lucide-react";

type report = {
  content: string,
  reporteeFirstName: string,
  reporteeLastName: string,
  reporteeId: string,
  reporterFirstName: string,
  reporterLastName: string,
  reporterId: string,
  resolved: boolean
}

type props = {
  report: report,
  resolveFunc: () => void,
} & HTMLAttributes<HTMLDivElement>

const ReportCard : FC<props> = (props) => {
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;
  const report = props.report;
  const [loading, setLoading] = useState(true);
  const [isClamped, setIsClamped] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [reporterPic, setReporterPic] = useState("/defaultimg.jpeg");
  const [reporteePic, setReporteePic] = useState("/defaultimg.jpeg");
  const textRef = useRef<HTMLParagraphElement>(null);
  
  const reporteeFullName = () => {
    return `${report.reporteeFirstName} ${report.reporteeLastName}`;
  }

  const reporteeLink = () => {
    return `profile/${report.reporteeId}`;
  }

  const reporterFullName = () => {
    return `${report.reporterFirstName} ${report.reporterLastName}`;
  }

  const reporterLink = () => {
    return `profile/${report.reporterId}`;
  }

  const isTextClamped = (element : Element) => {
    if (element) {
      return element.scrollHeight > element.clientHeight;
    } else {
      return false;
    }
  }

  useEffect(() => { 
    setIsClamped(isTextClamped(textRef.current)) 
  }, [report])

  const loadReporterImg = async () => {
    const url = `${api}/profiles/${report.reporterId}`;
    const response = await axios.get(url);
    const profile = response.data.data;
    if (profile.profilePicKey) {
      // const picUrl = `${api}/profilePics/get/${profile.profilePicKey}`;
      // const picResponse = await axios.get(picUrl);
      const key = profile.profilePicKey;
      const url = `https://tutorhubprofilepics.s3.amazonaws.com/${key}`
      setReporterPic(url);
    } else {
      setReporterPic('/defaultimg.jpeg')
    }
  }
  
  const loadReporteeImg = async () => {
    const url = `${api}/profiles/${report.reporteeId}`;
    const response = await axios.get(url);
    const profile = response.data.data;
    if (profile.profilePicKey) {
      // const picUrl = `${api}/profilePics/get/${profile.profilePicKey}`;
      // const picResponse = await axios.get(picUrl);
      const key = profile.profilePicKey;
      const url = `https://tutorhubprofilepics.s3.amazonaws.com/${key}`
      setReporteePic(url);
    } else {
      setReporteePic('/defaultimg.jpeg')
    }
  }

  const loadImages = async () => {
    const promise = loadReporteeImg();
    await loadReporterImg();
    await promise;
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    loadImages();
  }, [report])

  const generateTitleElement = () => {
    return (
      <div 
        className="mr-2 md:text-xl flex flex-wrap items-center gap-y-2 gap-x-2"
      >
        <a 
          className="font-bold hover:underline inline-flex items-center
          text-nowrap"
          href={reporterLink()}
        >
          <img
            src={reporterPic}
            alt={`Avatar`}
            className="hidden md:inline-block mr-1 w-8 h-8 rounded-full object-cover"
          />
          { reporterFullName() }
        </a>
        {" reported "}
        <a 
          className="font-bold hover:underline inline-flex items-center"
          href={reporteeLink()}
        >
          <img
            src={reporteePic}
            alt={`Avatar`}
            className="hidden md:inline-block mr-1 w-8 h-8 rounded-full object-cover"
          />
          { reporteeFullName() }
        </a>
      </div>
    )
  }

  const generateResolveButton = () => {
    if (report.resolved) {
      return (
        <button 
          className="relative flex pl-2 pr-3 py-1 rounded-md border-2
          border-green-500 bg-green-500 text-white text-bold md:text-lg
          shadow-sm"
          disabled={true}
        >
          <Check className="relative md:top-0.5 mr-1"/>
          Resolved
        </button>
      )
    } else {
      return (
        <button 
          className="relative flex pl-2 pr-3 py-1 rounded-md border-2
          border-red-500 text-red-500 text-bold md:text-lg shadow-sm
          hover:bg-red-500 hover:text-white transition"
          onClick={ props.resolveFunc }
        >
          <Lightbulb className="relative md:top-0.5 mr-1"/>
          Mark Resolved
        </button>
      )
    }
  }

  return (
    <div className={`${props.className} px-4 py-3`}>
      { loading ?
        <div className="text-lg min-h-24">Loading...</div>
      : 
        <>
          <div className="flex flex-wrap justify-between gap-y-2">
          {generateTitleElement()}
          {generateResolveButton()}
          </div>
          <p 
            className={`mt-3 border-t pt-2 md:border-none md:pt-0
            ${showFull ? '' : 'line-clamp-2'}`} 
            ref={textRef}
          >
            {report.content}
          </p>
          { isClamped ?
            <div className='flex justify-center'>
              { showFull ? 
                <button 
                  className='text-sm text-gray-500 mt-1 hover:underline'
                  onClick={() => setShowFull(false)}
                >
                  Hide Full Report
                </button>
              :
                <button 
                  className='text-sm text-gray-500 mt-1 hover:underline'
                  onClick={() => setShowFull(true)}
                >
                  Show Full Report...
                </button>
              }
            </div>
          :
            ''
          }
        </>
      }
    </div>
  );
}

export default ReportCard;