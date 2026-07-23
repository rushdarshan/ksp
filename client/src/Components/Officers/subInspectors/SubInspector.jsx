import "../Inspectors/inspect.scss";
import inspector from "../../Details/Inspector.png";
import { Link } from "react-router-dom";
// import Top from './Top Section/Top'
// import Listing from './Listing Section/Listing'
// import Activity from './Activity Section/Activity'
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
