import userSix from "../../Details/Inspector.png";
import styles from "../../Details/index.module.css";
import ChartOne, { useFetchData } from "../../Details/ChartOne";
// import { countElements,policeRanks } from "../../utils/utility";
import { useParams } from "react-router-dom";
import {
  getClearanceRate,
  getconvictionRate,
  policeRanks,
} from "../../../utils/utility";
import Loader from "../../../ui/Dropdown/Loader";
import ConvictionChart from "../../Details/ConvictionChart";
import { PiClockCountdown, PiClipboardText, PiCheckCircle, PiGavel } from "react-icons/pi";
import AnimatedNumber from "../../Details/AnimatedNumber";
const apiUrl = import.meta.env.VITE_API_URL || '/server';

export default function SubordinateDetails() {
  const { id } = useParams();
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
  } = useFetchData(`${apiUrl}/getconviction`, variables, config);
  // console.log(officerData)
  if (isLoading && isNameLoading && isConvictionLoading && isResTimeLoading) {
    return <Loader />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data) {
    return <Loader/>;
  }
  const convictionRate = getconvictionRate(convictionData);
  const officer = Array.isArray(officerData) ? officerData[0] : officerData?.data?.[0];
  const responseTime = Number(responseTimeData?.response_time ?? responseTimeData?.data?.response_time) || 0;
  const { clearanceRate, activeCaseCount, closedCaseCount } =
    getClearanceRate(data);
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
          {officer?.ioname || 'Officer profile'}
        </h3>
        <p
          style={{
            fontWeight: "500",
            textAlign: "center",
            color: "rgb(131, 144, 162)",
          }}
        >
          {officer && (policeRanks[officer.rank] || officer.rank)}
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
                <PiClockCountdown />
              </div>
              <div className={styles.side_content}>
                <h2><AnimatedNumber value={responseTime} duration={1000} /></h2>
                <span>Minutes</span>
              </div>
            </div>
        </div>
        <div className={styles.perf_metric_ele}>
          {/* <ConvictionChart series={[clearanceRate]} label={['Crime clearance']} /> */}
        <h3 className={styles.perf_metric_label}>Conviction Rate</h3>
          <div className={styles.card_inner_wrapper} >
              <div className={styles.icon_wrapper}>
                <PiGavel />
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
                <PiCheckCircle />
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
                <PiClockCountdown />
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
                <PiCheckCircle />
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
                <PiClipboardText />
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
