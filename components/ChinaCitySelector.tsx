import React, { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import chinaCitiesData from '../data/china-cities.json';

interface CityData {
  code: string;
  name: string;
  children?: CityData[];
}

interface ChinaCitySelectorProps {
  onSelect: (location: {
    provinceName: string;
    cityName: string;
    districtName?: string;
    latitude: number;
    longitude: number;
    timezone: number;
  }) => void;
}

const ChinaCitySelector: React.FC<ChinaCitySelectorProps> = ({ onSelect }) => {
  const [provinces] = useState<CityData[]>(chinaCitiesData as CityData[]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  const [cities, setCities] = useState<CityData[]>([]);
  const [districts, setDistricts] = useState<CityData[]>([]);

  const [isGeocoding, setIsGeocoding] = useState(false);

  // 当选择省份时，更新城市列表
  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find(p => p.name === selectedProvince);
      if (province && province.children) {
        setCities(province.children);
        setSelectedCity('');
        setDistricts([]);
        setSelectedDistrict('');
      }
    } else {
      setCities([]);
      setDistricts([]);
    }
  }, [selectedProvince, provinces]);

  // 当选择城市时，更新区县列表
  useEffect(() => {
    if (selectedCity) {
      const city = cities.find(c => c.name === selectedCity);
      if (city && city.children) {
        setDistricts(city.children);
        setSelectedDistrict('');
      } else {
        setDistricts([]);
      }
    } else {
      setDistricts([]);
    }
  }, [selectedCity, cities]);

  // 地理编码：根据地名获取经纬度
  const geocodeCity = async (fullAddress: string) => {
    try {
      setIsGeocoding(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&accept-language=zh-CN`,
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
          return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
          };
        }
      }
      return null;
    } catch (error) {
      console.error('地理编码失败:', error);
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  // 确认选择
  const handleConfirm = async () => {
    if (!selectedProvince || !selectedCity) {
      alert('请至少选择省份和城市');
      return;
    }

    // 构建完整地址
    const fullAddress = `中国${selectedProvince}${selectedCity}${selectedDistrict || ''}`;

    // 获取经纬度
    const coords = await geocodeCity(fullAddress);

    if (coords) {
      // 根据经度估算时区
      const timezone = Math.round(coords.longitude / 15);

      onSelect({
        provinceName: selectedProvince,
        cityName: selectedCity,
        districtName: selectedDistrict,
        latitude: coords.latitude,
        longitude: coords.longitude,
        timezone: timezone,
      });
    } else {
      alert('无法获取该地点的经纬度，请尝试使用地图选择器');
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 省份选择 */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">省份/直辖市</label>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm"
          >
            <option value="">请选择省份</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.name}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        {/* 城市选择 */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">城市</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedProvince || cities.length === 0}
            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">请选择城市</option>
            {cities.map((city) => (
              <option key={city.code} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* 区县选择 */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">区/县（可选）</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedCity || districts.length === 0}
            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">请选择区县</option>
            {districts.map((district) => (
              <option key={district.code} value={district.name}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 确认按钮 */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selectedProvince || !selectedCity || isGeocoding}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGeocoding ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>获取坐标中...</span>
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5" />
            <span>确认选择并获取坐标</span>
          </>
        )}
      </button>

      <p className="text-xs text-green-600/70 text-center">
        💡 选择后将自动获取该地点的经纬度和时区信息
      </p>
    </div>
  );
};

export default ChinaCitySelector;
