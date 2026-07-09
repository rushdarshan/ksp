import React from "react";
import "./top.scss";
import { TbMessageCircle } from "react-icons/tb";
import DropdownMenu from "../../ui/Dropdown/Dropdown";
import { IoMdMenu } from "react-icons/io";
import { useLocation } from "react-router-dom";

const Top = ({ setSidebarOpen }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  return (
    <div className="topSection">
      <div className="headerSection">
        <div className="ham_menu_wrapper">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(prev => !prev);
            }}
            className="ham_menu_btn"
          >
            <IoMdMenu />
          </button>
        </div>
        {currentPath.includes("home") && (
          <div className="title">
            <h1>Welcome to KSP Dashboard</h1>
            <p>Crime Genome — Operational Overview</p>
          </div>
        )}
        <div className="adminDiv flex">
          <button className="chat_btn">
            <TbMessageCircle className="icon" />
          </button>
          <DropdownMenu />
        </div>
      </div>
    </div>
  );
};

export default Top;
