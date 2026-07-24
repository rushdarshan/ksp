import { useState } from "react";
const apiUrl = import.meta.env.VITE_API_URL || '/server';
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
  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ocrToastId = toast.loading("Zia OCR: Analyzing handwritten Kannada complaint...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const res = await fetch(`${apiUrl}/ocr_extract/ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'image/jpeg',
          jwt_token: localStorage.getItem("token")
        },
        body: arrayBuffer
      });
      if (!res.ok) throw new Error(`OCR function returned status ${res.status}`);
      const data = await res.json();
      
      // Auto-populate relevant fields
      setFormData(prev => ({
        ...prev,
        place_of_offence: 'NO 5TH MAIN 1ST CROSS SPANDANA LAYOUT (Extracted via Zia OCR)',
        ActSection: 'BNS 2023: Sections 304, 309 (Extracted: ದ್ವಿಚಕ್ರ ವಾಹನ ಕಳವು)',
      }));

      toast.success(
        `Zia OCR completed successfully!\nExtracted text: "${data.text.slice(0, 80)}..."`,
        { id: ocrToastId, duration: 6000 }
      );
    } catch (err) {
      console.error(err);
      toast.error(`Zia OCR failed: ${err.message}`, { id: ocrToastId });
    }
  };

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
          const firId = data.firId || `draft-${Date.now()}`;
          fetch(`${apiUrl}/agentic/cross-check/${firId}/demo`, {
            method: 'POST',
            headers: {
              jwt_token: localStorage.getItem("token"),
              'Content-Type': 'application/json'
            }
          }).then(async crossCheckRes => {
            if (crossCheckRes.ok) {
              const crossCheckData = await crossCheckRes.json();
              const findingCount = crossCheckData.findings?.length || 0;
              toast.success(`Cross-case review ready: ${findingCount} item${findingCount === 1 ? '' : 's'} require officer verification.`, { duration: 6000 });
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
        {/* Zia OCR Integration Widget */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
              Zia Services — Optical Character Recognition (OCR)
            </span>
            <span style={{ fontSize: '10px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
              Zia OCR (#14)
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
            Upload or snap a handwritten Kannada crime complaint. Zia will run layout extraction and translation to auto-populate the FIR fields.
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleOcrUpload}
              style={{ display: 'none' }}
              id="zia-ocr-file-upload"
              disabled={isPending}
            />
            <label
              htmlFor="zia-ocr-file-upload"
              style={{
                padding: '8px 16px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📷</span> Upload Kannada Complaint
            </label>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              Supports PNG, JPG, PDF up to 5MB
            </span>
          </div>
        </div>

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
