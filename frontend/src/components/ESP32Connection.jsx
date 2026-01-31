import React from 'react';
import { useESP32 } from '../contexts/ESP32Context';

const ESP32Connection = () => {
    const {
        esp32Devices,
        selectedDevice,
        connectionStatus,
        sensorData,
        isScanning,
        scanForDevices,
        connectToDevice,
        disconnectDevice
    } = useESP32();

    return (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">ESP32 Connection</h3>

            {/* Connection Status */}
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <div
                        className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' :
                                connectionStatus === 'connecting' ? 'bg-yellow-400' :
                                    connectionStatus === 'error' ? 'bg-red-400' :
                                        'bg-gray-400'
                            }`}
                    />
                    <span className="text-sm font-medium">
                        {connectionStatus === 'connected' && 'Connected'}
                        {connectionStatus === 'connecting' && 'Connecting...'}
                        {connectionStatus === 'disconnected' && 'Disconnected'}
                        {connectionStatus === 'error' && 'Connection Error'}
                    </span>
                </div>
            </div>

            {/* Device Selection */}
            <div className="mb-4">
                <button
                    onClick={scanForDevices}
                    disabled={isScanning}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isScanning ? 'Scanning...' : 'Scan for Devices'}
                </button>
            </div>

            {/* Device List */}
            {esp32Devices.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Available Devices:</h4>
                    <div className="space-y-2">
                        {esp32Devices.map((device) => (
                            <button
                                key={device.id}
                                onClick={() => connectToDevice(device.id)}
                                className={`w-full px-4 py-2 rounded-lg text-left transition-all ${selectedDevice === device.id
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span>{device.name || device.id}</span>
                                    {selectedDevice === device.id && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Sensor Data Display */}
            {sensorData && (
                <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Sensor Readings:</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Temperature:</span>
                            <span className="font-medium text-cyan-400">
                                {sensorData.filtered?.temperature || sensorData.temperature || 'N/A'}°C
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Humidity:</span>
                            <span className="font-medium text-cyan-400">
                                {sensorData.filtered?.humidity || sensorData.humidity || 'N/A'}%
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-300">PM2.5:</span>
                            <span className="font-medium text-cyan-400">
                                {sensorData.filtered?.pm25 || sensorData.pm25 || 'N/A'} µg/m³
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Gas Level:</span>
                            <span className="font-medium text-cyan-400">
                                {sensorData.mq_value || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Disconnect Button */}
            {selectedDevice && (
                <button
                    onClick={disconnectDevice}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Disconnect Device
                </button>
            )}
        </div>
    );
};

export default ESP32Connection;