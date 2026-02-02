import serial
import time
import sys

def monitor_serial(port, duration, baudrate=115200):
    try:
        print(f"Opening port {port} at {baudrate} baud...")
        ser = serial.Serial(port, baudrate, timeout=1)
        # Toggle DTR/RTS to reset ESP32
        ser.dtr = False
        ser.rts = False
        time.sleep(0.1)
        ser.dtr = True
        ser.rts = True
        
        print(f"Connected. Reading data for {duration} seconds...")
        start_time = time.time()
        while time.time() - start_time < duration:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='replace').strip()
                if line:
                    print(line)
            time.sleep(0.1)
        ser.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    port = "COM14"
    duration = 15
    if len(sys.argv) > 2:
        duration = int(sys.argv[2])
    monitor_serial(port, duration=duration)
