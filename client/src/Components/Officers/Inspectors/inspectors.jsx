import "./inspect.scss";
import inspector from "../../Details/Inspector.png";
// import Top from './Top Section/Top'
// import Listing from './Listing Section/Listing'
// import Activity from './Activity Section/Activity'
import { Link } from "react-router-dom";
const Inspectors = ({ piArray ,title}) => {
  return (
    <>
      <h2 className="inspector-title">Subordinate {title}</h2>
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

          {piArray.map((pi, key) => (
            <div
              className={`table-list-content ${
                key === piArray.length - 1 ? "" : "bottom-border"
              }`}
              key={key}
            >
              <div className="brand-logo-wrapper">
                <div style={{ flexShrink: "0" }}>
                  <img src={inspector} alt="Brand" />
                </div>
                <p className="brand-name">{pi.ioname}</p>
              </div>

              {/* <div className="brand-visitor-revenue">
                <p style={{ color: "#000000" }}>{brand.visitors}K</p>
              </div> */}

              <div className="brand-visitor-revenue">
                <p style={{ color: "#000000" }}>{pi.rank}</p>
              </div>

              {/* <div className="brand-visitor-revenue">
                <p style={{ color: "#000000" }}>{brand.sales}</p>
              </div> */}

              <div className="brand-visitor-revenue">
                <Link to={`officerdetails/${pi.id}`} className="inspector-details">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Inspectors;
