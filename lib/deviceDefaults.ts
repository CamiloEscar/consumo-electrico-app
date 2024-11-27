export interface DeviceDefault {
  type: string;
  label: string;
  averageWatts: number;
  category: 'entertainment' | 'kitchen' | 'office' | 'climate' | 'lighting' | 'cleaning';
  commonBrands: { brand: string; models: { name: string; watts: number }[] }[];
  commonSchedules?: { label: string; start: string; end: string }[];
}

export const deviceDefaults: { [key: string]: DeviceDefault } = {
  tv: {
    type: 'tv',
    label: 'Televisor',
    averageWatts: 150,
    category: 'entertainment',
    commonSchedules: [
      { label: 'Tarde', start: '14:00', end: '17:00' },
      { label: 'Noche', start: '19:00', end: '23:00' },
    ],
    commonBrands: [
      {
        brand: 'Samsung',
        models: [
          { name: 'QLED Q80T', watts: 150 },
          { name: 'Neo QLED', watts: 180 },
          { name: 'The Frame', watts: 120 },
        ]
      },
      {
        brand: 'LG',
        models: [
          { name: 'OLED C1', watts: 100 },
          { name: 'NanoCell', watts: 130 },
          { name: 'OLED G2', watts: 110 },
        ]
      },
      {
        brand: 'Sony',
        models: [
          { name: 'Bravia XR', watts: 140 },
          { name: 'OLED A80J', watts: 120 },
        ]
      }
    ]
  },
  refrigerator: {
    type: 'refrigerator',
    label: 'Refrigerador',
    averageWatts: 150,
    category: 'kitchen',
    commonBrands: [
      {
        brand: 'LG',
        models: [
          { name: 'InstaView', watts: 100 },
          { name: 'Door-in-Door', watts: 120 },
          { name: 'Side by Side', watts: 150 },
        ]
      },
      {
        brand: 'Samsung',
        models: [
          { name: 'Family Hub', watts: 130 },
          { name: 'French Door', watts: 140 },
        ]
      },
      {
        brand: 'Whirlpool',
        models: [
          { name: 'Smart French Door', watts: 125 },
          { name: 'Side by Side', watts: 135 },
        ]
      }
    ]
  },
  computer: {
    type: 'computer',
    label: 'Computadora',
    averageWatts: 200,
    category: 'office',
    commonSchedules: [
      { label: 'Trabajo', start: '09:00', end: '18:00' },
      { label: 'Gaming', start: '20:00', end: '23:00' },
    ],
    commonBrands: [
      {
        brand: 'Dell',
        models: [
          { name: 'XPS Desktop', watts: 460 },
          { name: 'Alienware Aurora', watts: 750 },
        ]
      },
      {
        brand: 'HP',
        models: [
          { name: 'Pavilion Gaming', watts: 500 },
          { name: 'OMEN', watts: 650 },
        ]
      }
    ]
  },
  washingMachine: {
    type: 'washingMachine',
    label: 'Lavadora',
    averageWatts: 500,
    category: 'cleaning',
    commonSchedules: [
      { label: 'Mañana', start: '09:00', end: '11:00' },
      { label: 'Tarde', start: '15:00', end: '17:00' },
    ],
    commonBrands: [
      {
        brand: 'Samsung',
        models: [
          { name: 'EcoBubble', watts: 450 },
          { name: 'QuickDrive', watts: 500 },
        ]
      },
      {
        brand: 'LG',
        models: [
          { name: 'TurboWash', watts: 480 },
          { name: 'AI DD', watts: 520 },
        ]
      }
    ]
  },
  airConditioner: {
    type: 'airConditioner',
    label: 'Aire Acondicionado',
    averageWatts: 1500,
    category: 'climate',
    commonSchedules: [
      { label: 'Tarde calurosa', start: '13:00', end: '17:00' },
      { label: 'Noche', start: '20:00', end: '23:00' },
    ],
    commonBrands: [
      {
        brand: 'Daikin',
        models: [
          { name: 'Inverter 12000BTU', watts: 1100 },
          { name: 'Inverter 18000BTU', watts: 1600 },
        ]
      },
      {
        brand: 'Carrier',
        models: [
          { name: 'Inverter 12000BTU', watts: 1200 },
          { name: 'Split 18000BTU', watts: 1800 },
        ]
      }
    ]
  },
  microwave: {
    type: 'microwave',
    label: 'Microondas',
    averageWatts: 1200,
    category: 'kitchen',
    commonSchedules: [
      { label: 'Desayuno', start: '07:00', end: '09:00' },
      { label: 'Almuerzo', start: '12:00', end: '14:00' },
      { label: 'Cena', start: '19:00', end: '21:00' },
    ],
    commonBrands: [
      {
        brand: 'Panasonic',
        models: [
          { name: 'Inverter', watts: 1200 },
          { name: 'Genius Sensor', watts: 1250 },
        ]
      },
      {
        brand: 'Samsung',
        models: [
          { name: 'Smart Oven', watts: 1400 },
          { name: 'Grill', watts: 1500 },
        ]
      }
    ]
  }
} 