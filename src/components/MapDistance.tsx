import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import { MapProps } from "@/types";

const OPENROUTE_API_KEY = process.env.REACT_APP_OPENROUTE_API_KEY || '';

const MapComponent = ({ data, technicianLocation, straightDistance }: MapProps) => {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  
  const customerLatLng: [number, number] = [data.latitude, data.longitude];
  const technicianLatLng: [number, number] = [
    technicianLocation.latitude,
    technicianLocation.longitude,
  ];

  // คำนวณจุดกึ่งกลางระหว่าง 2 จุด เพื่อให้แผนที่แสดงทั้ง 2 จุด
  const centerLat = (data.latitude + technicianLocation.latitude) / 2;
  const centerLng = (data.longitude + technicianLocation.longitude) / 2;
  const centerLatLng: [number, number] = [centerLat, centerLng];

  // สร้าง custom icons สำหรับ markers
  const customerIcon = L.divIcon({
    html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
    iconSize: [20, 20],
    className: 'custom-marker'
  });

  const technicianIcon = L.divIcon({
    html: '<div style="background-color: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
    iconSize: [20, 20],
    className: 'custom-marker'
  });

  const fetchRoute = async() => {
    if (!OPENROUTE_API_KEY) {
      // ใช้ OSRM แทน (ฟรี 100% ไม่ต้อง API Key)
      return fetchOSRMRoute();
    }

    setIsLoadingRoute(true);
    setRouteError(null);

    try {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?` +
        `api_key=${OPENROUTE_API_KEY}&` +
        `start=${technicianLocation.longitude},${technicianLocation.latitude}&` +
        `end=${data.longitude},${data.latitude}`
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const routeData = await response.json();
      const coordinates = routeData.features[0].geometry.coordinates;
      
      // แปลง [lng, lat] เป็น [lat, lng] สำหรับ Leaflet
      const leafletCoordinates: [number, number][] = coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]]
      );

      setRouteCoordinates(leafletCoordinates);
      
      // ดึงข้อมูลระยะทางและเวลา
      const properties = routeData.features[0].properties;
      setRouteDistance(properties.segments[0].distance / 1000); // เป็น km
      setRouteDuration(properties.segments[0].duration / 60); // เป็นนาที

    } catch (error) {
      console.error('OpenRouteService Error:', error);
      setRouteError('ไม่สามารถโหลดเส้นทางได้');
      // Fallback เป็นเส้นตรง
      setRouteCoordinates([technicianLatLng, customerLatLng]);
    } finally {
      setIsLoadingRoute(false);
    }
  }

  // ฟังก์ชัน OSRM (ฟรี 100%)
  const fetchOSRMRoute = async () => {
    setIsLoadingRoute(true);
    setRouteError(null);

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/` +
        `${technicianLocation.longitude},${technicianLocation.latitude};` +
        `${data.longitude},${data.latitude}?` +
        `overview=full&geometries=geojson`
      );

      if (!response.ok) {
        throw new Error(`OSRM Error: ${response.status}`);
      }

      const routeData = await response.json();
      const coordinates = routeData.routes[0].geometry.coordinates;
      
      // แปลง [lng, lat] เป็น [lat, lng] สำหรับ Leaflet
      const leafletCoordinates: [number, number][] = coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]]
      );

      setRouteCoordinates(leafletCoordinates);
      
      // ดึงข้อมูลระยะทางและเวลา
      setRouteDistance(routeData.routes[0].distance / 1000); // เป็น km
      setRouteDuration(routeData.routes[0].duration / 60); // เป็นนาที

    } catch (error) {
      console.error('OSRM Error:', error);
      setRouteError('ไม่สามารถโหลดเส้นทางได้');
      // Fallback เป็นเส้นตรง
      setRouteCoordinates([technicianLatLng, customerLatLng]);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // เรียก API เมื่อ component mount
  useEffect(() => {
    fetchRoute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format เวลา
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '';
    if (minutes < 60) return `${Math.round(minutes)} นาที`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours} ชม. ${mins} นาที`;
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {/* Legend และข้อมูลเส้นทาง */}
      <div style={{ 
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '13px'
      }}>
        {/* Legend */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '8px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#22c55e',
              borderRadius: '50%'
            }}></div>
            <span>ช่าง</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#ef4444',
              borderRadius: '50%'
            }}></div>
            <span>ลูกค้า</span>
          </div>
        </div>

        {/* ข้อมูลเส้นทาง */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          flexWrap: 'wrap'
        }}>
          <div>
            <span style={{ color: '#6b7280' }}>ระยะทาง: </span>
            <span style={{ fontWeight: '600', color: '#2563eb' }}>
              {isLoadingRoute 
                ? 'กำลังคำนวณ...' 
                : routeDistance 
                  ? `${routeDistance.toFixed(1)} กม.`
                  : `${straightDistance.toFixed(1)} กม. (เส้นตรง)`
              }
            </span>
          </div>
          
          {routeDuration && (
            <div>
              <span style={{ color: '#6b7280' }}>เวลา: </span>
              <span style={{ fontWeight: '600', color: '#059669' }}>
                {formatDuration(routeDuration)}
              </span>
            </div>
          )}
        </div>

        {/* สถานะ */}
        {isLoadingRoute && (
          <div style={{ color: '#f59e0b', fontStyle: 'italic', marginTop: '4px' }}>
            🔄 กำลังโหลดเส้นทาง...
          </div>
        )}
        
        {routeError && (
          <div style={{ color: '#ef4444', fontStyle: 'italic', marginTop: '4px' }}>
            ⚠️ {routeError}
          </div>
        )}

        {!isLoadingRoute && !routeError && routeCoordinates.length > 2 && (
          <div style={{ color: '#059669', fontStyle: 'italic', marginTop: '4px' }}>
            ✅ เส้นทางตามถนน
          </div>
        )}
      </div>

      {/* แผนที่ */}
      <MapContainer
        center={centerLatLng}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Markers */}
        <Marker position={customerLatLng} icon={customerIcon} />
        <Marker position={technicianLatLng} icon={technicianIcon} />
        
        {/* เส้นทาง */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color={routeCoordinates.length > 2 ? "#2563eb" : "#94a3b8"}
            weight={routeCoordinates.length > 2 ? 5 : 4}
            opacity={0.8}
            dashArray={routeCoordinates.length > 2 ? undefined : "10, 10"}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;