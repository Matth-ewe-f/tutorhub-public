import React, { FC, useEffect, useState } from 'react';
import axios from 'axios';

type AnalyticsData = {
  meanPrice: number;
  comparisonResult: string;
  myPostPrice: number;
  percentDiff: number;
  marketPosition: string;
};

type Props = {
  postId: string;
};

const PriceAnalytics: FC<Props> = ({ postId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [boxColor, setBoxColor] = useState<string>('');

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/coursePosts/comparePrice/${postId}`);
      setAnalyticsData(response.data);
      setBoxColor(getBoxColor(response.data.marketPosition));
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  const getBoxColor = (marketPosition: string): string => {
    if (marketPosition === 'Great Deal!') {
      return 'bg-green-300'; // Green for market price
    } else if (marketPosition === 'Fair') {
      return 'bg-yellow-300';
    } else {
      return 'bg-red-300'; // Red for below or above market price
    }
  };

  useEffect(() => {
    if (postId) {
      fetchAnalyticsData();
    }
  }, [postId]);

  return (
    <div className="content">
      <div className={`w-[300px] info-box max-w p-4 border-2 border-black mt-5 mb-1 ${boxColor}`} style={{ boxShadow: '5px 5px 0px rgba(0, 0, 0, 10)', textTransform: 'uppercase', fontWeight: 'bold' }}>
        {analyticsData && (
          <p>Price Analysis: {analyticsData.marketPosition}</p>
        )}
      </div>
    </div>
  );
};

export default PriceAnalytics;
