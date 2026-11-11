#!/usr/bin/env python3
import os
import urllib.request
import urllib.parse

DOWNLOADS = [
    # 1. Arduino Classic & Entry Level
    ('arduino-uno-r3', 'https://store-usa.arduino.cc/cdn/shop/files/A000066_03.front_934x700.jpg', 'jpg'),
    ('arduino-nano', 'https://cdn.shopify.com/s/files/1/0506/1689/3647/files/A000005_03.front.jpg', 'jpg'),
    ('arduino-nano-every', 'https://cdn.shopify.com/s/files/1/0506/1689/3647/files/ABX00028_03.front.jpg', 'jpg'),
    ('arduino-mega-2560-rev3', 'https://cdn.shopify.com/s/files/1/0506/1689/3647/files/A000067_00.front.jpg', 'jpg'),
    ('arduino-leonardo-micro', 'https://cdn.shopify.com/s/files/1/0506/1689/3647/files/A000057_03.front.jpg', 'jpg'),

    # 1. Arduino 32-Bit & High-Performance
    ('arduino-uno-r4-wifi', 'https://cdn.shopify.com/s/files/1/0506/1689/3647/files/ABX00087_00.front.jpg', 'jpg'),
    ('arduino-uno-r4-minima', 'https://cdn.shopify.com/s/files/1/0506/1689/3647/files/ABX00080_00.default.jpg', 'jpg'),
    ('arduino-giga-r1-wifi', 'https://cdn.shopify.com/s/files/1/0506/1689/3647/files/ABX00063_00.default.jpg', 'jpg'),
    ('arduino-due', 'https://cdn.shopify.com/s/files/1/0506/1689/3647/files/A000062_00.front.jpg', 'jpg'),

    # 1. Arduino IoT & Compact Form Factors
    ('arduino-nano-33-iot', 'https://cdn.shopify.com/s/files/1/0506/1689/3647/files/ABX00027_03.front.jpg', 'jpg'),
    ('arduino-nano-33-ble-sense-rev2', 'https://cdn.shopify.com/s/files/1/0506/1689/3647/files/ABX00069_02.front.jpg', 'jpg'),
    ('arduino-nano-matter', 'https://cdn.shopify.com/s/files/1/0506/1689/3647/files/ABX00112_00.default.jpg', 'jpg'),
    ('arduino-portenta-h7-x8', 'https://cdn.shopify.com/s/files/1/0506/1689/3647/files/ABX00042_00.iso.jpg', 'jpg'),

    # 2. ESP32 & Wireless Boards
    ('esp32-devkit-v1', 'https://cdn-shop.adafruit.com/970x728/3405-08.jpg', 'jpg'),
    ('esp32-cam', 'https://cdn-shop.adafruit.com/970x728/6354-06.jpg', 'jpg'),
    ('esp32-s3-devkit', 'https://cdn-shop.adafruit.com/970x728/5364-00.jpg', 'jpg'),
    ('esp32-s2-devkit', 'https://cdn-shop.adafruit.com/970x728/4693-04.jpg', 'jpg'),
    ('esp32-c3-devkit', 'https://cdn-shop.adafruit.com/970x728/5337-04.jpg', 'jpg'),
    ('esp32-c6-devkit', 'https://cdn-shop.adafruit.com/970x728/5682-00.jpg', 'jpg'),
    ('seeed-xiao-esp32', 'https://cdn-shop.adafruit.com/970x728/5336-00.jpg', 'jpg'),
    ('nodemcu-v3-esp8266', 'https://cdn-shop.adafruit.com/970x728/2471-06.jpg', 'jpg'),
    ('wemos-d1-mini-esp8266', 'https://www.wemos.cc/en/latest/_images/d1_mini_v4.0.0_1_16x16.png', 'png'),

    # 3. STM32 Development Boards
    ('nucleo-f401re', 'https://docs.zephyrproject.org/latest/_images/nucleo_f401re.jpg', 'jpg'),
    ('nucleo-f446re', 'https://docs.zephyrproject.org/latest/_images/nucleo_f446re.jpg', 'jpg'),
    ('nucleo-f103rb', 'https://docs.zephyrproject.org/latest/_images/nucleo_f103rb.jpg', 'jpg'),
    ('nucleo-g474re', 'https://docs.zephyrproject.org/latest/_images/nucleo_g474re.jpg', 'jpg'),
    ('nucleo-h743zi-h723zg', 'https://docs.zephyrproject.org/latest/_images/nucleo_h743zi.jpg', 'jpg'),
    ('stm32f103c8t6-blue-pill', 'https://docs.zephyrproject.org/3.5.0/_images/stm32_min_dev.jpg', 'jpg'),
    ('stm32f401-f411-black-pill', 'https://docs.zephyrproject.org/latest/_images/blackpill-v2.jpg', 'jpg'),
    ('stm32f407g-disc1-discovery', 'https://docs.zephyrproject.org/latest/_images/stm32f4_disco.jpg', 'jpg'),
    ('b-l475e-iot01a-u585i-iot02a', 'https://docs.zephyrproject.org/latest/_images/disco_l475_iot1.jpg', 'jpg'),

    # 4. Raspberry Pi Boards
    ('raspberry-pi-5', 'https://assets.raspberrypi.com/static/c671804c05a51efc4e3c2a1bdcbafbcf/e58b5/raspberry-pi-5.png', 'png'),
    ('raspberry-pi-4-model-b', 'https://cdn-shop.adafruit.com/970x728/4295-00.jpg', 'jpg'),
    ('raspberry-pi-3-model-b-plus', 'https://cdn-shop.adafruit.com/970x728/3775-11.jpg', 'jpg'),
    ('raspberry-pi-zero-2-w', 'https://cdn-shop.adafruit.com/970x728/5291-00.jpg', 'jpg'),
    ('raspberry-pi-cm4-cm5', 'https://cdn-shop.adafruit.com/970x728/4794-05.jpg', 'jpg'),
    ('raspberry-pi-pico-pico-w', 'https://cdn-shop.adafruit.com/970x728/4883-06.jpg', 'jpg'),
    ('raspberry-pi-pico-2-pico-2-w', 'https://cdn-shop.adafruit.com/970x728/6030-03.jpg', 'jpg'),
]

os.makedirs('public/images/products', exist_ok=True)
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

success_count = 0
for board_id, url, ext in DOWNLOADS:
    dest_path = f'public/images/products/{board_id}.{ext}'
    print(f'Fetching {board_id} from {url} ...')
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            content = response.read()
            if len(content) > 1000:
                with open(dest_path, 'wb') as f:
                    f.write(content)
                print(f'  ✓ Saved {dest_path} ({len(content)} bytes)')
                success_count += 1
            else:
                print(f'  ✗ File too small: {len(content)} bytes')
    except Exception as e:
        print(f'  ✗ Error downloading {board_id}: {e}')

print(f'\nFinished downloading {success_count}/{len(DOWNLOADS)} packshots.')

