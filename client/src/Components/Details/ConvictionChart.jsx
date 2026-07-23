import ReactApexChart from "react-apexcharts";
import styles from "./index.module.css";
// import FirStageSelect from './Select';
var options = {
  chart: {
    height: 280,
    type: "radialBar",
  },

  //   series: [100],
  colors: ["#20E647"],
  plotOptions: {
    radialBar: {
      hollow: {
        margin: 0,
        size: "60%",
        background: "#293450",
      },
      track: {
        dropShadow: {
          enabled: true,
          top: 2,
          left: 0,
          blur: 4,
          opacity: 0.15,
        },
      },
      dataLabels: {
        name: {
          offsetY: -10,
          color: "#fff",
          fontSize: "13px",
          show: false,
        },
        value: {
          color: "#fff",
          fontSize: "30px",
          show: true,
        },
      },
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      type: "horizontal",
      gradientToColors: ["#87D4F9"],
      stops: [0, 100],
    },
  },
  stroke: {
    lineCap: "round",
  },
  labels: ["Progress"],
  responsive: [
    {
      breakpoint: 900,
      options: {
        plotOptions: {
          radialBar: {
            dataLabels: {
              value: {
                fontSize: "15px",
              },
            },
            hollow: {
              offsetY: -10,
              margin: 0,
              size: "50%",
              background: "#293450",
            },
          },
        },
      },
    },
    {
      breakpoint: 550,
      options: {
        chart: {
          width: 200,
          height: 100
        },
      },
    },
  ],
  //   responsive :  [
  //     {
  //       breakpoint: 2600,
  //       options: {
  //         chart: {
  //           width: 420,
  //         },
  //       },
  //     },
  //     {
  //       breakpoint: 640,
  //       options: {
  //         chart: {
  //           width: 200,
  //         },
  //       },
  //     },
  // ]
};
export default function ConvictionChart({ series, label }) {
  return (
    <div id="" className="">
      <div className="conviction_info">
        <h3 className={styles.perf_metric_label}>{label}</h3>
        {/* <FirStageSelect/> */}
      </div>
      <div className="">
        <ReactApexChart
          options={{
            ...options,
            series: series,
            labels: label,
          }}
          series={series}
          type="radialBar"
          // // width={380}
          // height={280}
        />
      </div>
    </div>
  );
}
