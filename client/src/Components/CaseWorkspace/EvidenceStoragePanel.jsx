import { useState, useEffect, useRef } from 'react';
import {
  PiUploadSimple, PiFile, PiImage, PiFilePdf,
  PiCircleNotch, PiCheckCircle, PiWarningCircle, PiCloudArrowUp
} from 'react-icons/pi';
import apiFetch from '../../utils/apiFetch';
import './EvidenceStoragePanel.scss';

const EXT_ICONS = {
  jpg: PiImage, jpeg: PiImage, png: PiImage, webp: PiImage,
  pdf: PiFilePdf,
};

function fileIcon(name = '') {
  const ext = name.split('.').pop().toLowerCase();
  const Icon = EXT_ICONS[ext] || PiFile;
  return <Icon />;
}

function fmtSize(bytes) {
  if (bytes > 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export default function EvidenceStoragePanel({ firNo = 'KSP-2026-0142' }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const loadFiles = () => {
    setLoading(true);
    apiFetch(`/evidence_storage/list?firNo=${firNo}`)
      .then(r => r ? r.json() : null)
      .then(d => { if (d?.files) setFiles(d.files); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFiles(); }, [firNo]);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadResult(null);

    // In production: use FormData with the actual file; mock uses JSON body
    try {
      const res = await apiFetch('/evidence_storage/upload', {
        method: 'POST',
        body: JSON.stringify({
          firNo,
          fileName: file.name,
          fileSize: file.size,
          evidenceType: file.type.startsWith('image/') ? 'photograph' : 'document',
          description: `Uploaded via browser — ${file.name}`
        })
      });
      const data = res ? await res.json() : null;
      if (data?.success) {
        setUploadResult(data);
        setFiles(prev => [{
          objectKey: data.objectKey,
          fileName: file.name,
          fileSize: file.size,
          lastModified: data.uploadedAt,
          signedUrl: data.signedUrl
        }, ...prev]);
        showToast(`✅ ${file.name} uploaded to Catalyst Stratus`);
      }
    } catch {
      showToast('⚠️ Upload failed — check connection');
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="esp-shell">
      <div className="esp-header">
        <h3 className="esp-title">Evidence Locker</h3>
        <span className="esp-badge">Catalyst Stratus</span>
      </div>

      {/* Drop zone */}
      <div
        className={`esp-dropzone${dragOver ? ' esp-dropzone--active' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={onFileChange} />
        {uploading ? (
          <><PiCircleNotch className="spin esp-upload-icon" /><span>Uploading to Stratus…</span></>
        ) : (
          <><PiCloudArrowUp className="esp-upload-icon" /><span>Click or drag to upload evidence</span></>
        )}
        <small>Photos, PDFs, reports — stored in Catalyst Stratus ksp-evidence bucket</small>
      </div>

      {/* File list */}
      {loading ? (
        <div className="esp-loading"><PiCircleNotch className="spin" /> Loading evidence files…</div>
      ) : files.length === 0 ? (
        <div className="esp-empty">No evidence files yet. Upload files above.</div>
      ) : (
        <div className="esp-filelist">
          {files.map((f, i) => (
            <div key={f.objectKey || i} className="esp-file">
              <span className="esp-file-icon">{fileIcon(f.fileName)}</span>
              <div className="esp-file-body">
                <span className="esp-file-name">{f.fileName}</span>
                <span className="esp-file-meta">
                  {fmtSize(f.fileSize)} ·{' '}
                  {f.lastModified
                    ? new Date(f.lastModified).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : 'Just uploaded'}
                </span>
              </div>
              {f.signedUrl && f.signedUrl !== '#' ? (
                <a className="esp-download-btn" href={f.signedUrl} target="_blank" rel="noreferrer">
                  <PiUploadSimple style={{ transform: 'rotate(180deg)' }} /> View
                </a>
              ) : (
                <span className="esp-file-status"><PiCheckCircle /> Stored</span>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && <div className="esp-toast">{toast}</div>}
    </div>
  );
}
