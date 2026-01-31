import { createContext, useContext, useState, useEffect } from 'react';

const ESP32Context = createContext(null);

export const ESP32Provider = ({ children }) => {
    const [esp32Devices, setEsp32Devices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [sensorData, setSensorData] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    // WebSocket connection
    const [ws, setWs] = useState(null);

    // Scan for ESP32 devices
    const scanForDevices = async () => {
        setIsScanning(true);
        try {
            // Simulate device discovery
            const discoveredDevices = await fetch(`${API_BASE}/api/devices`);
            const devices = await discoveredDevices.json();
            setEsp32Devices(devices);
        } catch (error) {
            console.error('Error scanning for devices:', error);
        } finally {
            setIsScanning(false);
        }
    };

    // Connect to ESP32 device
    const connectToDevice = (deviceId) => {
        setSelectedDevice(deviceId);
        setConnectionStatus('connecting');

        // Create WebSocket connection
        const wsUrl = `${window.location.origin}/ws/stream/${deviceId}`;
        const newWs = new WebSocket(wsUrl);

        newWs.onopen = () => {
            console.log('WebSocket connected');
            setConnectionStatus('connected');
        };

        newWs.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setSensorData(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        newWs.onclose = () => {
            console.log('WebSocket disconnected');
            setConnectionStatus('disconnected');
        };

        newWs.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnectionStatus('error');
        };

        setWs(newWs);
    };

    // Disconnect from ESP32 device
    const disconnectDevice = () => {
        if (ws) {
            ws.close();
            setWs(null);
        }
        setSelectedDevice(null);
        setConnectionStatus('disconnected');
        setSensorData(null);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [ws]);

    return (
        <ESP32Context.Provider
            value={{
                esp32Devices,
                selectedDevice,
                connectionStatus,
                sensorData,
                isScanning,
                scanForDevices,
                connectToDevice,
                disconnectDevice
            }}
        >
            {children}
        </ESP32Context.Provider>
    );
};

export const useESP32 = () => {
    const context = useContext(ESP32Context);
    if (!context) {
        throw new Error('useESP32 must be used within an ESP32Provider');
    }
    return context;
};