import React from "react";
import "../Inspectors/inspect.scss";
import inspector from "../../Details/Inspector.png";
import { Link } from "react-router-dom";
// import Top from './Top Section/Top'
// import Listing from './Listing Section/Listing'
// import Activity from './Activity Section/Activity'
const subInspectorData = [
  {
    logo: inspector,
    name: "ABC",
    visitors: 3.5,
    rank: "PSI",
    sales: 590,
    conversion: 4.8,
  },
  {
    logo: inspector,
    name: "PQR",
    visitors: 2.2,
    rank: "PSI",
    sales: 467,
    conversion: 4.3,
  },
  {
    logo: inspector,
    name: "MNO",
    visitors: 2.1,
    rank: "PSI",
    sales: 420,
    conversion: 3.7,
  },
  {
    logo: inspector,
    name: "XYZ",
    visitors: 1.5,
    rank: "PSI",
    sales: 389,
    conversion: 2.5,
  },
  {
    logo: inspector,
    name: "STR",
    visitors: 3.5,
    rank: "PSI",
    sales: 390,
    conversion: 4.2,
  },
];
const Inspectors = ({asiArray}) => {
  return (
    <>
      <h2 className="inspector-title">Subordinate Sub-Inspectors</h2>
      <div className="table-wrapper">
        <div className="table-heading-wrapper">
          <div className="table-heading">
            <div className="table-heading-col-wrapper">
              <h5 className="table-heading-header-cont">Name</h5>
            </div>
            {/* <div className="text-center table-heading-col-wrapper">
              <h5 className="table-heading-header-cont">Visitors</h5>
            </div> */}
            <div className="text-center table-heading-col-wrapper">
              <h5 className="table-heading-header-cont">Rank</h5>
            </div>
            {/* <div className="hidden text-center table-heading-col-wrapper">
              <h5 className="table-heading-header-cont">Sales</h5>
            </div> */}
            <div className="hidden text-center  table-heading-col-wrapper">
              <h5 className="table-heading-header-cont">Details</h5>
            </div>
          </div>

          {asiArray.map((asi, key) => (
            <div
              className={`table-list-content ${
                key === asiArray.length - 1 ? "" : "bottom-border"
              }`}
              key={key}
            >
              <div className="brand-logo-wrapper">
                <div style={{ flexShrink: "0" }}>
                  <img src={inspector} alt="Brand" />
                </div>
                <p className="brand-name">{asi.ioname}</p>
              </div>

              {/* <div className="brand-visitor-revenue">
                <p style={{ color: "#000000" }}>{brand.visitors}K</p>
              </div> */}

              <div className="brand-visitor-revenue">
                <p style={{ color: "#000000" }}>{asi.rank}</p>
              </div>

              {/* <div className="brand-visitor-revenue">
                <p style={{ color: "#000000" }}>{brand.sales}</p>
              </div> */}

              <div className="brand-visitor-revenue">
                {/* <button className="inspector-details">View Details</button> */}
                <Link to={`officerdetails/${asi.id}`} className="inspector-details">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Inspectors;
