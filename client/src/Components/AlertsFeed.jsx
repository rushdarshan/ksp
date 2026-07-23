import { useState, useEffect } from 'react';
import { PiSiren } from 'react-icons/pi';
import styles from './AlertsFeed.module.css';

const AlertsFeed = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await fetch('/server/fir_api/alerts');
                if (response.ok) {
                    const data = await response.json();
                    setAlerts(data);
                }
            } catch (err) {
                console.error("Failed to fetch alerts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading alerts...</div>;
    if (alerts.length === 0) return <div>No new alerts</div>;

    return (
        <div className={styles.alertsContainer}>
            <h3 className={styles.alertsTitle}><PiSiren aria-hidden="true" /> Proactive Alerts</h3>
            <ul className={styles.alertsList}>
                {alerts.map((alert, index) => (
                    <li key={index} className={styles.alertItem}>
                        <strong>{alert.title}</strong>
                        <p className={styles.alertDescription}>{alert.description}</p>
                        <small>{new Date(alert.created_at).toLocaleString()}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AlertsFeed;
