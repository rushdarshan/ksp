import React, { useEffect, useRef, useState } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import styles from "./popup.module.css";
export default function Popup() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  const trigger = useRef(null);

  const dropdown = useRef(null);

  useEffect(() => {
    const clickHandler = ({target}) => { if (dropdownOpen && dropdown.current && !dropdown.current.contains(target) && !trigger.current?.contains(target)) setDropdownOpen(false) };
    const keyHandler = ({keyCode}) => { if (dropdownOpen && keyCode === 27) setDropdownOpen(false) };
    document.addEventListener('click', clickHandler);
    document.addEventListener('keydown', keyHandler);
    return () => { document.removeEventListener('click', clickHandler); document.removeEventListener('keydown', keyHandler); };
  }, [dropdownOpen]);

  return (
    <div className={styles.notif_wrapper}
    ref={trigger}
    onClick={() => {
      setNotifying(false);
      setDropdownOpen(!dropdownOpen);
    }}>
      <button className={styles.notif_btn} aria-label="Notifications">
        <IoIosNotificationsOutline/>
        <span className={styles.unread_wrapper}>
        <span className={styles.unread_background}></span>
        </span>
      </button>
      <ul className={`${styles.notif_cont} ${ dropdownOpen === true ? styles.open : ''}`}
       ref={dropdown}
       onFocus={() => setDropdownOpen(true)}
       onBlur={() => setDropdownOpen(false)}>
          <li className={styles.notif_list_ele}>
            <div
              className={styles.notif_ele}
            >
              <p className="text-sm">
                <span className="text-black dark:text-white">
                Submit incident reports
                </span>{' '}
                 for cases #1234 and #5678 by end of day tomorrow, compile and log evidence, and ensure accurate paperwork submission.
              </p>

              <p className="text-xs">12 May, 2024</p>
            </div>
          </li>
          <li className={styles.notif_list_ele}>
            <div
              className={styles.notif_ele}
            >
              <p className="text-sm">
                <span className="text-black dark:text-white">
                Attend the neighborhood meeting
                </span>{' '}
                Thursday at 19:00, visit Greenfield Elementary Friday morning, and engage with residents during patrols, documenting interactions.
              </p>

              <p className="text-xs">24 Feb, 2024</p>
            </div>
          </li>
          <li className={styles.notif_list_ele}>
            <div
              className={styles.notif_ele}
            >
              <p className="text-sm">
                <span className="text-black dark:text-white">
                Patrol Sector 5 from 08:00 to 16:00,
                </span>{' '}
                 monitor activities, ensure safety, and report incidents with a summary.
              </p>

              <p className="text-xs">04 Jan, 2024</p>
            </div>
          </li>
          <li className={styles.notif_list_ele}>
            <div
              className={styles.notif_ele}
            >
              <p className="text-sm">
                <span className="text-black dark:text-white">
                  There are many variations
                </span>{' '}
                of passages of Lorem Ipsum available, but the majority have
                suffered
              </p>

              <p className="text-xs">01 May, 2024</p>
            </div>
          </li>
        </ul>
    </div>
  );
}
