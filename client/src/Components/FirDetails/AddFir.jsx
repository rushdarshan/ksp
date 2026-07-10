import React, { useState } from "react";
import { useFetchData } from "./Firdetails";
const apiUrl = import.meta.env.VITE_API_URL;
import toast from "react-hot-toast";
import styles from "./firdetails.module.css";
import { formatString, smapleFirValues } from "../../utils/utility";

const AddFir = () => {
  // Step 1: Initialize state for form data
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState(smapleFirValues);

  // Step 2: Generic change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const resetForm = () =>{
    Object.keys(formData).forEach((key)=>{
        setFormData(prevForm => {return {
            ...prevForm,
            [key]: '',
          }});  
    })
  }
  // Step 3: Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    let loadingToastId;

    // Process the form data (e.g., send to a server)
    try {
      loadingToastId = toast.loading("Processing");
      const res = await fetch(`${apiUrl}/addfir`, {
        method: 'POST',
        headers: {
          jwt_token: localStorage.getItem("token"),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firValues: Object.values(formData) })
      });
      const data = await res.json();
      if (res.ok) {
        // Trigger agentic cross-check
        try {
          const firId = data.firId || Math.floor(Math.random() * 1000) + 1;
          fetch(`${apiUrl}/agentic/cross-check/${firId}/demo`, {
            method: 'POST',
            headers: {
              jwt_token: localStorage.getItem("token"),
              'Content-Type': 'application/json'
            }
          }).then(async crossCheckRes => {
            if (crossCheckRes.ok) {
              const crossCheckData = await crossCheckRes.json();
              toast((t) => (
                <span style={{ fontSize: '12px' }}>
                  <strong>🤖 Agentic Cross-Check Complete</strong><br />
                  Cross-checked new FIR against database. Found {crossCheckData.findings?.length || 0} MO similarities! Check the Proactive Alerts feed.
                </span>
              ), { duration: 6000 });
            }
          }).catch(err => console.warn('Cross-check trigger failed:', err));
        } catch (crossCheckErr) {
          console.warn('Cross-check trigger failed:', crossCheckErr);
        }
      }
      setIsPending(false);
      toast.success(data.message);
      resetForm();
      toast.dismiss(loadingToastId);
    } catch (error) {
      setIsPending(false);
      toast.dismiss(loadingToastId);
      toast.error(error.message || 'Failed to add FIR');
    }
  };

  return (
      <div className={styles.detailed_fir_bg_wrapper}>
    <form onSubmit={handleSubmit}>
        {/* Step 4: Create input fields dynamically */}
        <div className={styles.detailed_fir_container}>
          {Object.keys(formData).map((fieldName) => (
            <div key={fieldName} className={styles.detailed_fir_cont}>
              <label htmlFor={fieldName} className={styles.fir_col_heading}>
                {formatString(fieldName)}:
              </label>
              <input
                type="text"
                id={fieldName}
                name={fieldName}
                value={formData[fieldName]}
                onChange={handleChange}
                className={styles.fir_col_input}
              />
            </div>
          ))}
        </div>
        <div className={styles.fir_add_btn_wrapper}>
          <button type="submit" disabled={isPending} className={styles.fir_add_btn}>
            Submit
          </button>

        </div>
    </form>
      </div>
  );
};

export default AddFir;
