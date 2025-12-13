'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Navigation,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Loader2,
  CloudLightning,
  CloudFog,
  Maximize2,
  Minimize2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  visibility: number;
  description: string;
  icon: string;
  main: string;
  city: string;
}

interface Alert {
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  icon: React.ReactNode;
}

interface Location {
  lat: number;
  lng: number;
}

export const WeatherMap: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [destination, setDestination] = useState<string>('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showNavigation, setShowNavigation] = useState(false);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setLocation({ lat: 10.7769, lng: 106.7009 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocation({ lat: 10.7769, lng: 106.7009 });
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    if (!location) return;

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility&timezone=auto`
      );

      if (!response.ok) throw new Error('Weather API error');

      const data = await response.json();
      const current = data.current;

      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json`
      );
      const geoData = await geoResponse.json();
      const cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Unknown Location';

      const weatherInfo = getWeatherInfo(current.weather_code);

      setWeather({
        temp: Math.round(current.temperature_2m),
        feels_like: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        wind_speed: Math.round(current.wind_speed_10m),
        visibility: Math.round((current.visibility || 10000) / 1000),
        description: weatherInfo.description,
        icon: weatherInfo.icon,
        main: weatherInfo.main,
        city: cityName,
      });

      generateAlerts(current, weatherInfo);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setWeather({
        temp: 32,
        feels_like: 35,
        humidity: 75,
        wind_speed: 12,
        visibility: 10,
        description: 'Partly Cloudy',
        icon: 'cloud-sun',
        main: 'Clouds',
        city: 'Ho Chi Minh City',
      });
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (location) {
      fetchWeather();
      setMapLoaded(true);
    }
  }, [location, fetchWeather]);

  const getWeatherInfo = (code: number): { description: string; icon: string; main: string } => {
    const weatherCodes: { [key: number]: { description: string; icon: string; main: string } } = {
      0: { description: 'Clear sky', icon: 'sun', main: 'Clear' },
      1: { description: 'Mainly clear', icon: 'sun', main: 'Clear' },
      2: { description: 'Partly cloudy', icon: 'cloud-sun', main: 'Clouds' },
      3: { description: 'Overcast', icon: 'cloud', main: 'Clouds' },
      45: { description: 'Foggy', icon: 'fog', main: 'Fog' },
      48: { description: 'Rime fog', icon: 'fog', main: 'Fog' },
      51: { description: 'Light drizzle', icon: 'rain', main: 'Drizzle' },
      53: { description: 'Moderate drizzle', icon: 'rain', main: 'Drizzle' },
      55: { description: 'Dense drizzle', icon: 'rain', main: 'Drizzle' },
      61: { description: 'Slight rain', icon: 'rain', main: 'Rain' },
      63: { description: 'Moderate rain', icon: 'rain', main: 'Rain' },
      65: { description: 'Heavy rain', icon: 'rain', main: 'Rain' },
      71: { description: 'Slight snow', icon: 'snow', main: 'Snow' },
      73: { description: 'Moderate snow', icon: 'snow', main: 'Snow' },
      75: { description: 'Heavy snow', icon: 'snow', main: 'Snow' },
      80: { description: 'Rain showers', icon: 'rain', main: 'Rain' },
      81: { description: 'Moderate showers', icon: 'rain', main: 'Rain' },
      82: { description: 'Violent showers', icon: 'rain', main: 'Rain' },
      95: { description: 'Thunderstorm', icon: 'thunderstorm', main: 'Thunderstorm' },
      96: { description: 'Thunderstorm with hail', icon: 'thunderstorm', main: 'Thunderstorm' },
      99: { description: 'Heavy thunderstorm', icon: 'thunderstorm', main: 'Thunderstorm' },
    };
    return weatherCodes[code] || { description: 'Unknown', icon: 'cloud', main: 'Unknown' };
  };

  const generateAlerts = (current: any, weatherInfo: { main: string }) => {
    const newAlerts: Alert[] = [];

    if (current.temperature_2m > 35) {
      newAlerts.push({
        type: 'danger',
        title: 'Extreme Heat',
        message: 'Temperature exceeds 35°C. Stay hydrated!',
        icon: <Thermometer className="w-4 h-4" />,
      });
    } else if (current.temperature_2m > 32) {
      newAlerts.push({
        type: 'warning',
        title: 'High Temperature',
        message: 'Hot weather. Drink plenty of water.',
        icon: <Thermometer className="w-4 h-4" />,
      });
    }

    if (current.wind_speed_10m > 50) {
      newAlerts.push({
        type: 'danger',
        title: 'Strong Wind',
        message: 'Wind speeds exceed 50 km/h.',
        icon: <Wind className="w-4 h-4" />,
      });
    }

    if (['Rain', 'Thunderstorm'].includes(weatherInfo.main)) {
      newAlerts.push({
        type: 'warning',
        title: 'Rain Expected',
        message: 'Bring umbrella or raincoat.',
        icon: <CloudRain className="w-4 h-4" />,
      });
    }

    if (current.visibility && current.visibility < 1000) {
      newAlerts.push({
        type: 'warning',
        title: 'Low Visibility',
        message: 'Drive carefully.',
        icon: <Eye className="w-4 h-4" />,
      });
    }

    if (newAlerts.length === 0 && weatherInfo.main === 'Clear') {
      newAlerts.push({
        type: 'info',
        title: 'Perfect Weather',
        message: 'Great for outdoor activities!',
        icon: <Sun className="w-4 h-4" />,
      });
    }

    setAlerts(newAlerts);
  };

  const getWeatherIcon = (icon: string, size: string = 'w-10 h-10') => {
    const iconClass = size;
    switch (icon) {
      case 'sun':
        return <Sun className={`${iconClass} text-yellow-400 drop-shadow-lg`} />;
      case 'cloud-sun':
        return <Cloud className={`${iconClass} text-white drop-shadow-lg`} />;
      case 'cloud':
        return <Cloud className={`${iconClass} text-gray-300 drop-shadow-lg`} />;
      case 'rain':
        return <CloudRain className={`${iconClass} text-blue-400 drop-shadow-lg`} />;
      case 'snow':
        return <CloudSnow className={`${iconClass} text-blue-100 drop-shadow-lg`} />;
      case 'thunderstorm':
        return <CloudLightning className={`${iconClass} text-purple-400 drop-shadow-lg`} />;
      case 'fog':
        return <CloudFog className={`${iconClass} text-gray-400 drop-shadow-lg`} />;
      default:
        return <Cloud className={`${iconClass} text-gray-300 drop-shadow-lg`} />;
    }
  };

  const handleNavigate = () => {
    if (destination && location) {
      const url = `https://www.google.com/maps/dir/${location.lat},${location.lng}/${encodeURIComponent(destination)}`;
      window.open(url, '_blank');
      setIsNavigating(true);
      setTimeout(() => setIsNavigating(false), 2000);
    }
  };

  const refreshWeather = () => {
    setLoading(true);
    fetchWeather();
  };

  if (loading && !weather) {
    return (
      <div className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[600px]'}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-white/70 text-lg">Loading weather data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[600px]'}`}>
      {/* Full Screen Map */}
      <div className="absolute inset-0">
        {mapLoaded && location ? (
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.02}%2C${location.lat - 0.015}%2C${location.lng + 0.02}%2C${location.lat + 0.015}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
            className="w-full h-full border-0"
            title="Location Map"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <MapPin className="w-20 h-20 text-slate-600 animate-pulse" />
          </div>
        )}
      </div>

      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Top Bar - Weather & Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex items-start justify-between gap-4">
          {/* Weather Card */}
          {weather && (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4">
                {/* Weather Icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-xl" />
                  {getWeatherIcon(weather.icon, 'w-16 h-16')}
                </div>

                {/* Temperature */}
                <div>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-white tracking-tight">{weather.temp}</span>
                    <span className="text-2xl text-white/60 ml-1">°C</span>
                  </div>
                  <p className="text-white/80 text-sm font-medium">{weather.description}</p>
                </div>

                {/* Divider */}
                <div className="w-px h-16 bg-white/20 mx-2" />

                {/* Weather Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Droplets className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{weather.humidity}%</p>
                    <p className="text-white/50 text-xs">Humidity</p>
                  </div>
                  <div className="text-center">
                    <Wind className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{weather.wind_speed}</p>
                    <p className="text-white/50 text-xs">km/h</p>
                  </div>
                  <div className="text-center">
                    <Eye className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{weather.visibility}</p>
                    <p className="text-white/50 text-xs">km</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span className="text-white/80 text-sm font-medium">{weather.city}</span>
                <span className="text-white/40 text-xs ml-auto">
                  Feels like {weather.feels_like}°C
                </span>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={refreshWeather}
              className="p-3 bg-black/40 backdrop-blur-xl hover:bg-white/20 rounded-xl border border-white/10 transition-all group"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-white group-hover:text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 bg-black/40 backdrop-blur-xl hover:bg-white/20 rounded-xl border border-white/10 transition-all group"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-white group-hover:text-cyan-400" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white group-hover:text-cyan-400" />
              )}
            </button>
            <button
              onClick={() => setShowNavigation(!showNavigation)}
              className={`p-3 backdrop-blur-xl rounded-xl border transition-all group ${showNavigation ? 'bg-cyan-500/30 border-cyan-400/50' : 'bg-black/40 border-white/10 hover:bg-white/20'}`}
              title="Navigate"
            >
              <Navigation className={`w-5 h-5 ${showNavigation ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div className="absolute top-4 right-20 z-10">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${alerts.some(a => a.type === 'danger') ? 'text-red-400' : alerts.some(a => a.type === 'warning') ? 'text-amber-400' : 'text-cyan-400'}`} />
                <span className="text-white font-semibold text-sm">Alerts ({alerts.length})</span>
              </div>
              {showAlerts ? (
                <ChevronUp className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/60" />
              )}
            </button>

            {showAlerts && (
              <div className="px-3 pb-3 space-y-2 max-h-48 overflow-y-auto">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl flex items-start gap-3 ${
                      alert.type === 'danger'
                        ? 'bg-red-500/20 border border-red-500/30'
                        : alert.type === 'warning'
                        ? 'bg-amber-500/20 border border-amber-500/30'
                        : 'bg-cyan-500/20 border border-cyan-500/30'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 ${
                        alert.type === 'danger'
                          ? 'text-red-400'
                          : alert.type === 'warning'
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {alert.icon}
                    </div>
                    <div>
                      <h5 className="text-white font-semibold text-sm">{alert.title}</h5>
                      <p className="text-white/60 text-xs">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Panel */}
      {showNavigation && (
        <div className="absolute bottom-24 left-4 right-4 z-10">
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-semibold">Navigate to</span>
              <button
                onClick={() => setShowNavigation(false)}
                className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50"
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
              />
              <button
                onClick={handleNavigate}
                disabled={!destination}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
              >
                <Navigation className={`w-5 h-5 ${isNavigating ? 'animate-bounce' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <div className="flex items-center justify-between">
          {/* Coordinates */}
          {location && (
            <div className="bg-black/40 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-sm font-mono">
                  {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
                </span>
              </div>
            </div>
          )}

          {/* Time */}
          <div className="bg-black/40 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10">
            <span className="text-white/80 text-sm font-medium">
              {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} •{' '}
              {new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </div>

      {/* Fullscreen close button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 z-20 p-3 bg-red-500/80 hover:bg-red-500 rounded-xl transition-colors shadow-lg"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
};
