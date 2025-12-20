import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, MapPin, Loader2, Search } from 'lucide-react';

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

const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialPosition,
}) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialPosition || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [addressName, setAddressName] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // 动态加载 Leaflet
  useEffect(() => {
    if (!isOpen) return;

    const loadLeaflet = async () => {
      try {
        console.log('🗺️ 开始加载 Leaflet...');
        // 动态导入 Leaflet
        const L = await import('leaflet');
        console.log('✅ Leaflet 导入成功');

        if (!mapContainerRef.current) {
          console.error('❌ 地图容器 ref 为空');
          return;
        }

        if (mapInstanceRef.current) {
          console.log('⚠️ 地图实例已存在，跳过初始化');
          return;
        }

        console.log('📍 地图容器尺寸:', {
          width: mapContainerRef.current.offsetWidth,
          height: mapContainerRef.current.offsetHeight
        });

        // 修复默认图标路径
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // 创建地图实例
        const center: [number, number] = initialPosition
          ? [initialPosition.lat, initialPosition.lng]
          : [35.0, 105.0]; // 默认中国中心位置

        const initialZoom = initialPosition ? 10 : 4; // 如果有初始位置，放大显示
        console.log('🌍 初始化地图 - 中心点:', center, '缩放级别:', initialZoom);
        const map = L.map(mapContainerRef.current).setView(center, initialZoom);
        console.log('✅ 地图实例创建成功');

        // 添加地图图层 - 使用 OpenStreetMap（全球可用）
        console.log('🗺️ 添加地图图层...');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          subdomains: ['a', 'b', 'c'],
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          crossOrigin: true,
        }).addTo(map);
        console.log('✅ 地图图层添加成功');

        // 延迟调用 invalidateSize 确保地图正确渲染
        setTimeout(() => {
          map.invalidateSize();
          console.log('🔄 地图尺寸已刷新');
        }, 100);

        // 如果有初始位置，添加标记
        if (initialPosition) {
          const marker = L.marker([initialPosition.lat, initialPosition.lng]).addTo(map);
          marker.bindPopup(`<b>当前位置</b><br>纬度: ${initialPosition.lat.toFixed(4)}<br>经度: ${initialPosition.lng.toFixed(4)}`);
          markerRef.current = marker;
        }

        // 点击地图事件
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          setPosition({ lat, lng });

          // 移除旧标记
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }

          // 添加新标记
          const marker = L.marker([lat, lng]).addTo(map);
          marker.bindPopup(`<b>选中位置</b><br>纬度: ${lat.toFixed(4)}<br>经度: ${lng.toFixed(4)}`).openPopup();
          markerRef.current = marker;
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
        console.log('🎉 地图加载完成！mapLoaded 已设置为 true');
      } catch (error) {
        console.error('❌ 加载地图失败:', error);
      }
    };

    loadLeaflet();

    // 清理函数
    return () => {
      console.log('🧹 清理地图实例...');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        setMapLoaded(false);
        console.log('✅ 地图实例已清理');
      } else {
        console.log('⚠️ 没有地图实例需要清理');
      }
    };
  }, [isOpen, initialPosition]);

  // 反向地理编码：获取地址名称
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      setIsGeocodingAddress(true);
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
        const name = data.address?.city || data.address?.town || data.address?.village ||
                     data.address?.county || data.display_name || '未知位置';
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
          const newPosition = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
          setPosition(newPosition);
          setAddressName(result.display_name);

          // 更新地图视图和标记
          if (mapInstanceRef.current) {
            const L = await import('leaflet');
            mapInstanceRef.current.setView([newPosition.lat, newPosition.lng], 10);

            // 移除旧标记
            if (markerRef.current) {
              mapInstanceRef.current.removeLayer(markerRef.current);
            }

            // 添加新标记
            const marker = L.marker([newPosition.lat, newPosition.lng]).addTo(mapInstanceRef.current);
            marker.bindPopup(`<b>${result.display_name}</b><br>纬度: ${newPosition.lat.toFixed(4)}<br>经度: ${newPosition.lng.toFixed(4)}`).openPopup();
            markerRef.current = marker;
          }
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
        <div className="relative p-4 bg-gray-100">
          <div className="h-[500px] w-full border-4 border-indigo-500 rounded-xl overflow-hidden shadow-2xl bg-white relative">
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 z-[1000]">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">加载地图中...</p>
                  <p className="text-xs text-gray-500 mt-1">正在连接地图服务器</p>
                </div>
              </div>
            )}
            <div
              ref={mapContainerRef}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
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
