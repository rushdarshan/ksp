import React from "react";
import userSix from "./Inspector.png";
import styles from "./index.module.css";
import ChartOne, { useFetchData } from "./ChartOne";
// import { countElements,policeRanks } from "../../utils/utility";
import { useParams } from "react-router-dom";
import {
  countElements,
  getClearanceRate,
  getconvictionRate,
  policeRanks,
} from "../../utils/utility";
import Loader from "../../ui/Dropdown/Loader";
import ConvictionChart from "./ConvictionChart";
import { MdOutlinePendingActions } from "react-icons/md";
import { BsClipboard2CheckFill } from "react-icons/bs";
import { FaListCheck, FaRegCircleCheck } from "react-icons/fa6";
import { FaClipboardList } from "react-icons/fa";
import AnimatedNumber from "./AnimatedNumber";
import { FaUserClock } from "react-icons/fa";
import { FaGavel } from "react-icons/fa";


const apiUrl = import.meta.env.VITE_API_URL;

export default function SubordinateDetails() {
  const id = undefined;
  const variables = {
    id: id,
  };
  const config = {
    headers: {
      jwt_token: localStorage.getItem("token"),
    },
  };
  const { data, isLoading, error } = useFetchData(
    `${apiUrl}/getdata_withid`,
    variables,
    config
  );
  const { data: officerData, isLoading: isNameLoading } = useFetchData(
    `${apiUrl}/getofficerinfo_withid`,
    variables,
    config
  ); // Replace with your API endpoint
  const { data: responseTimeData, isLoading: isResTimeLoading } = useFetchData(
    `${apiUrl}/getresponsetime`,
    variables,
    config
  ); // Replace with your API endpoint
  const {
    data: convictionData,
    isLoading: isConvictionLoading,
    error: convictionError,
  } = useFetchData(`${apiUrl}/getconviction`, variables, config);
  // console.log(officerData)
  if (isLoading & isNameLoading & isConvictionLoading & isResTimeLoading) {
    return <Loader />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data) {
    return <Loader/>;
  }
  const convictionRate = getconvictionRate(convictionData);
  const { clearanceRate, activeCaseCount, closedCaseCount } =
    getClearanceRate(data);
  const firStageValues = Object.values(countElements(data));
  const totalCases = firStageValues.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  const activeCases = firStageValues[0] + firStageValues[1];
  const closedCases = totalCases - activeCases;
  return (
    <div>
      <div className={styles.profile_wrapper}>
        <div className={styles.profile_img_wrapper}>
          <img src={userSix} className={styles.profile_img} alt="profile" />
          <label htmlFor="profile" className={styles.profile_label}></label>
        </div>
      </div>
      <div>
        <h3 className={styles.profile_name}>
          {officerData && officerData[0].ioname}
        </h3>
        <p
          style={{
            fontWeight: "500",
            textAlign: "center",
            color: "rgb(131, 144, 162)",
          }}
        >
          {officerData && policeRanks[officerData[0].rank]}
        </p>
      </div>
      <div className={styles.perf_metric_wrapper}>
        <div className={styles.perf_metric_ele}>
          <ConvictionChart
            series={[convictionRate]}
            label={["Conviction Rate"]}
          />
        </div>
        <div className={styles.perf_metric_ele}>
          <ConvictionChart
            series={[clearanceRate]}
            label={["Crime clearance"]}
          />
        </div>
        <div className={styles.perf_metric_ele}>
          {/* <ConvictionChart series={[clearanceRate]} label={['Crime clearance']} /> */}
        <h3 className={styles.perf_metric_label}>Response Time</h3>
          <div className={styles.card_inner_wrapper} >
              <div className={styles.icon_wrapper}>
                <FaUserClock />
              </div>
              <div className={styles.side_content}>
                {responseTimeData &&  <h2><AnimatedNumber value={responseTimeData.response_time} duration={1000} /></h2>}
                <span>Minutes</span>
              </div>
            </div>
        </div>
        <div className={styles.perf_metric_ele}>
          {/* <ConvictionChart series={[clearanceRate]} label={['Crime clearance']} /> */}
        <h3 className={styles.perf_metric_label}>Conviction Rate</h3>
          <div className={styles.card_inner_wrapper} >
              <div className={styles.icon_wrapper}>
                <FaGavel />
              </div>
              <div className={styles.side_content}>
                {responseTimeData &&  <h2><AnimatedNumber value={convictionRate} unit={'%'}duration={1000} /></h2>}
                {/* <span>Minutes</span> */}
              </div>
            </div>
        </div>
        <div className={styles.perf_metric_ele}>
          {/* <ConvictionChart series={[clearanceRate]} label={['Crime clearance']} /> */}
        <h3 className={styles.perf_metric_label}>Clearance Rate</h3>
          <div className={styles.card_inner_wrapper} >
              <div className={styles.icon_wrapper}>
                <FaRegCircleCheck />
              </div>
              <div className={styles.side_content}>
                {responseTimeData &&  <h2><AnimatedNumber value={clearanceRate} unit={'%'}duration={1000} /></h2>}
                {/* <span>Minutes</span> */}
              </div>
            </div>
        </div>
      </div>
      <div className={styles.chart_wrapper}>
        <div className={styles.char_one}>
          <ChartOne data={data} isLoading={isLoading} error={error} />
        </div>
        <div className={styles.card_wrapper}>
          <div className={styles.card}>
            <div className={styles.card_inner_wrapper}>
              <div className={styles.icon_wrapper}>
                <MdOutlinePendingActions />
              </div>
              <div className={styles.side_content}>
                <h2>{activeCaseCount ? <AnimatedNumber value={activeCaseCount} duration={1000} /> : "No"}</h2>
                <span>Active Cases</span>
              </div>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.card_inner_wrapper}>
              <div className={styles.icon_wrapper}>
                <BsClipboard2CheckFill />
              </div>
              <div className={styles.side_content}>
                <h2>{closedCaseCount ? <AnimatedNumber value={closedCaseCount} duration={1000} /> : "No"}</h2>
                <span>Solved Cases</span>
              </div>
            </div>
          </div>
          <div className={styles.card} style={{gridColumn: '1 / -1'}}>
            <div className={styles.card_inner_wrapper} >
              <div className={styles.icon_wrapper}>
                <FaClipboardList />
              </div>
              <div className={styles.side_content}>
                <h2>{<AnimatedNumber value={activeCaseCount + closedCaseCount} duration={1000} />}</h2>
                <span>Total Cases</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <ChartTwo /> */}
    </div>
  );
}
