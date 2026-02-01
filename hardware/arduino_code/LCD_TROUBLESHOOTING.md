# LCD Display Troubleshooting Guide

## Common Issues and Solutions

### 1. No Display / Blank Screen
**Possible Causes:**
- Incorrect I2C address
- Wiring issues
- Power problems
- Incorrect library

**Solutions:**
1. **Check I2C Address:**
   - Use the `test_lcd_fixed.ino` sketch to scan for the correct address
   - Common addresses: 0x27, 0x3F

2. **Verify Wiring:**
   - SDA to GPIO 21
   - SCL to GPIO 22
   - VCC to 5V
   - GND to GND

3. **Power Check:**
   - Ensure proper power supply (5V)
   - Check for loose connections

### 2. Display Shows Blocks or Random Characters
**Possible Causes:**
- Incorrect I2C address
- Library mismatch
- Timing issues

**Solutions:**
1. **Run Address Scanner:**
   ```cpp
   // Use the address scanning code from test_lcd_fixed.ino
   ```

2. **Check Library:**
   - Ensure using `LiquidCrystal_I2C.h`
   - Remove any conflicting LCD libraries

### 3. Only Partial Display Working
**Possible Causes:**
- LCD initialization issues
- Memory problems

**Solutions:**
1. **Reinitialize LCD:**
   ```cpp
   lcd.init();
   lcd.backlight();
   lcd.clear();
   ```

2. **Check Display Size:**
   - Ensure correct columns (16) and rows (2)

## Testing Procedures

### Basic Test
1. Upload `test_lcd_fixed.ino`
2. Open Serial Monitor (115200 baud)
3. Check for:
   - Address detection messages
   - "LCD TEST OK!" message
   - Temperature and humidity display

### Advanced Test
1. Verify scrolling text works
2. Check backlight functionality
3. Test different text patterns

## Debug Information

### Serial Output
```
Found Device at: 0x27
LCD initialized at 0x27
LCD TEST OK!
```

### Expected Display
```
LCD TEST OK!
```

### Error Messages
- "NO LCD FOUND! Check wiring."
- "LCD Init Failed!"

## Preventive Measures

1. **Always use the test sketch first**
2. **Verify wiring before uploading main code**
3. **Keep libraries updated**
4. **Use proper power supply**

## Quick Reference

| Issue | Solution |
|-------|----------|
| No display | Check address and wiring |
| Blocks | Run address scanner |
| Partial display | Reinitialize LCD |
| Random chars | Check library version |

## Contact Support
If issues persist after following this guide, check:
- Hardware connections
- Power supply
- Library compatibility