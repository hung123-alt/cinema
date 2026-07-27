import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './SpeedWidget.css';

export default function SpeedWidget() {
  const [loadTime, setLoadTime] = useState(null);
  const [routeTime, setRouteTime] = useState(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [routeStart, setRouteStart] = useState(null);
  const location = useLocation();

  // === Đo tốc độ load trang đầu tiên ===
  useEffect(() => {
    const handleLoad = () => {
      const time = performance.now() / 1000;
      setLoadTime(time.toFixed(2));
      setVisible(true);
      // Tự ẩn sau 5 giây
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // === Đo tốc độ chuyển route (chuyển trang) ===
  useEffect(() => {
    // Bỏ qua lần render đầu tiên
    if (routeStart === null) {
      setRouteStart(performance.now());
      return;
    }

    const elapsed = (performance.now() - routeStart) / 1000;
    setRouteTime(elapsed.toFixed(2));
    setRouteStart(performance.now());
    setVisible(true);

    // Hiện widget 5s khi chuyển trang
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!visible && !expanded) return null;

  const getColor = (time) => {
    if (!time) return '#00ff88';
    const t = parseFloat(time);
    if (t < 1.5) return '#00ff88'; // Xanh - nhanh
    if (t < 3.0) return '#ffaa00'; // Cam - trung bình
    return '#ff4444';               // Đỏ - chậm
  };

  const displayTime = routeTime || loadTime;
  const color = getColor(displayTime);

  return (
    <div
      className="speed-widget"
      style={{ borderColor: color }}
      onClick={() => setExpanded(!expanded)}
    >
      <span className="speed-icon">⚡</span>
      <div className="speed-content">
        <span className="speed-label">
          {routeTime ? 'Chuyển trang' : 'Tốc độ load'}
        </span>
        <span className="speed-value" style={{ color }}>
          {displayTime}s
        </span>
      </div>
      {expanded && (
        <div className="speed-details">
          <div className="detail-row">
            <span>Trang đầu:</span>
            <strong>{loadTime || '—'}s</strong>
          </div>
          <div className="detail-row">
            <span>Chuyển trang:</span>
            <strong>{routeTime || '—'}s</strong>
          </div>
          <div className="detail-row">
            <span>Route:</span>
            <strong>{location.pathname}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
