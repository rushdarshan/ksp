import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { countElements, getRandomColor } from "../../../utils/utility";
import apiFetch from "../../../utils/apiFetch";
const options = {
  stroke: {
    width: 1, // Adjust the border width here
    colors: ["white"],
  },
  chart: {
    fontFamily: "IBM Plex Sans, -apple-system, BlinkMacSystemFont, sans-serif",
    type: "donut",
  },
  colors: getRandomColor(4),
  labels: [""],
  legend: {
    show: true,
    position: "bottom",
  },

  plotOptions: {
    pie: {
      expandOnClick: false,
      donut: {
        size: "65%",
        background: "transparent",
      },
    },
  },
  dataLabels: {
    enabled: true,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 420,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 200,
        },
      },
    },
  ],
};

// Custom hook for data fetching with fetch
export function useFetchData(url, variables,config) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestBody = JSON.stringify(variables ?? {});
  const requestHeaders = JSON.stringify(config?.headers ?? {});

  useEffect(() => {
    let targetUrl = url;
    if (!import.meta.env.VITE_API_URL && url) {
      const cleanPath = url.replace(/^undefined\/?/, '').replace(/^\/?/, '/');
      targetUrl = cleanPath.startsWith('/server/') ? cleanPath : `/server${cleanPath}`;
    }
    if (!targetUrl || targetUrl.startsWith('undefined')) {
      setIsLoading(false);
      setData(null);
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const relPath = targetUrl.replace(/^https?:\/\/[^/]+/, '').replace(/^\/server/, '') || '/';
        const response = await apiFetch(relPath, {
          method: 'POST',
          headers: JSON.parse(requestHeaders),
          body: requestBody,
        }).then(r => r ? r.json() : null);
        setData(response);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, requestBody, requestHeaders]);

  return { data, isLoading, error };
}

export default function ChartOne({data,isLoading,error}) {
  // const [firStageKeys,setFirStageKeys]=useState([])
  // const [firStageValues,setFirStageValues]=useState([]);
// Replace with your API endpoint

  if (isLoading) {
    return <p>Loading data...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data) {
    return <p>No data available.</p>;
  }
  const firStageKeys = Object.keys(countElements(data));
  const firStageValues = Object.values(countElements(data));
  const firStageCount = firStageValues.length;
  // console.log(countElements(data))
  // console.log(firStageKeys)
  return (
      <div id="chartThree" className="">
        <div className="donut_one_header">
          <h3>Fir Stages</h3>
          {/* <FirStageSelect/> */}
        </div>
        <div className="">
          <ReactApexChart
            options={{
              ...options,
              labels: firStageKeys,
              colors: getRandomColor(firStageCount),
            }}
            series={firStageValues}
            type="donut"
          />
        </div>
      </div>
  );
}
