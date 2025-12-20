import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { X, MapPin, Loader2, Search } from 'lucide-react';
import L from 'leaflet';

// 修复 Leaflet 默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationData {
  latitude: number;
  longitude: number;
  placeName?: string;
  timezone?: number;
}

interface LocationMapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: LocationData) => void;
  initialPosition?: { lat: number; lng: number };
}

// 地图点击事件处理组件
function LocationMarker({ position, onPositionChange }: {
  position: L.LatLng | null;
  onPositionChange: (latlng: L.LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div className="text-sm">
          <p className="font-bold mb-1">选中位置</p>
          <p>纬度: {position.lat.toFixed(4)}</p>
          <p>经度: {position.lng.toFixed(4)}</p>
        </div>
      </Popup>
    </Marker>
  );
}

const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialPosition,
}) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialPosition ? L.latLng(initialPosition.lat, initialPosition.lng) : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [addressName, setAddressName] = useState<string>('');

  // 反向地理编码：获取地址名称
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      setIsGeocodingAddress(true);
      // 使用 Nominatim API（OpenStreetMap 的免费地理编码服务）
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=zh-CN`,
        {
          headers: {
            'User-Agent': 'AstroMoon/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const name = data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.display_name || '未知位置';
        setAddressName(name);
        return name;
      }
    } catch (error) {
      console.error('反向地理编码失败:', error);
      setAddressName('未知位置');
    } finally {
      setIsGeocodingAddress(false);
    }
    return null;
  }, []);

  // 正向地理编码：根据地名搜索坐标
  const searchLocation = useCallback(async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      // 使用 Nominatim 搜索 API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&accept-language=zh-CN`,
        {
          headers: {
            'User-Agent': 'AstroMoon/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const newPosition = L.latLng(parseFloat(result.lat), parseFloat(result.lon));
          setPosition(newPosition);
          setAddressName(result.display_name);
        } else {
          alert('未找到该地点，请尝试其他关键词');
        }
      }
    } catch (error) {
      console.error('搜索位置失败:', error);
      alert('搜索失败，请稍后重试');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // 当位置变化时，获取地址名称
  useEffect(() => {
    if (position) {
      reverseGeocode(position.lat, position.lng);
    }
  }, [position, reverseGeocode]);

  // 确认选择
  const handleConfirm = () => {
    if (position) {
      onSelect({
        latitude: position.lat,
        longitude: position.lng,
        placeName: addressName || undefined,
        // 简单估算时区（基于经度，不完全准确）
        timezone: Math.round(position.lng / 15),
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-6 h-6" />
            <h2 className="text-xl font-bold">选择出生地点</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                placeholder="搜索城市或地点名称..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={isSearching}
              />
            </div>
            <button
              onClick={searchLocation}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>搜索中...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>搜索</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 提示：可以搜索城市名称，或直接在地图上点击选择位置
          </p>
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-[400px]">
          <MapContainer
            center={initialPosition || { lat: 39.9042, lng: 116.4074 }} // 默认北京
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={position}
              onPositionChange={(latlng) => setPosition(latlng)}
            />
          </MapContainer>
        </div>

        {/* Selected Location Info */}
        {position && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  已选择位置
                </h3>
                <div className="space-y-1 text-sm">
                  {isGeocodingAddress ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在获取地址...</span>
                    </div>
                  ) : (
                    <div className="text-gray-700">
                      <span className="font-medium">地点：</span>
                      {addressName || '未知位置'}
                    </div>
                  )}
                  <div className="text-gray-700">
                    <span className="font-medium">纬度：</span>
                    {position.lat.toFixed(4)}°
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">经度：</span>
                    {position.lng.toFixed(4)}°
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">估算时区：</span>
                    UTC{Math.round(position.lng / 15) >= 0 ? '+' : ''}{Math.round(position.lng / 15)}
                  </div>
                </div>
              </div>
              <button
                onClick={handleConfirm}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                <span>确认选择</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMapPicker;
