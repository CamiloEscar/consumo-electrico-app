import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const devices = [
    { 
      type: 'tv',
      brand: 'Samsung',
      model: 'QLED Q80T',
      name: 'Televisor Samsung QLED Q80T', 
      watts: 150, 
      hoursPerDay: 4, 
      daysPerWeek: 7 
    },
    { 
      type: 'refrigerator',
      brand: 'LG',
      model: 'InstaView',
      name: 'Refrigerador LG InstaView', 
      watts: 100, 
      hoursPerDay: 24, 
      daysPerWeek: 7 
    },
    { 
      type: 'washingMachine',
      brand: 'Maytag',
      model: 'MHW5630HW',
      name: 'Lavadora Maytag MHW5630HW', 
      watts: 500, 
      hoursPerDay: 1, 
      daysPerWeek: 3 
    },
    { 
      type: 'computer',
      brand: 'Dell',
      model: 'XPS 8940',
      name: 'Computadora Dell XPS 8940', 
      watts: 460, 
      hoursPerDay: 8, 
      daysPerWeek: 5 
    },
    { 
      type: 'airConditioner',
      brand: 'Samsung',
      model: 'AR12',
      name: 'Aire acondicionado', 
      watts: 1500, 
      hoursPerDay: 6, 
      daysPerWeek: 7 
    },
    { 
      type: 'microwave',
      brand: 'Panasonic',
      model: 'NN-SN686S',
      name: 'Microondas Panasonic NN-SN686S', 
      watts: 1200, 
      hoursPerDay: 0.5, 
      daysPerWeek: 7 
    },
    { 
      type: 'coffee',
      brand: 'Nespresso',
      model: 'Vertuo',
      name: 'Cafetera Nespresso Vertuo', 
      watts: 1350, 
      hoursPerDay: 0.25, 
      daysPerWeek: 7 
    },
    { 
      type: 'gameConsole',
      brand: 'Sony',
      model: 'PlayStation 5',
      name: 'Consola PlayStation 5', 
      watts: 200, 
      hoursPerDay: 3, 
      daysPerWeek: 5 
    },
  ]

  // Limpiar la base de datos primero
  await prisma.device.deleteMany()
  await prisma.calculation.deleteMany()

  // Crear algunos cálculos de ejemplo
  for (let i = 0; i < 10; i++) {
    const randomDevices = devices.sort(() => 0.5 - Math.random()).slice(0, 3)
    const totalConsumption = randomDevices.reduce((acc, device) => {
      return acc + (device.watts * device.hoursPerDay * device.daysPerWeek) / 7000
    }, 0)

    await prisma.calculation.create({
      data: {
        totalConsumption,
        devices: {
          create: randomDevices.map(device => ({
            type: device.type,
            brand: device.brand,
            model: device.model,
            watts: device.watts,
            hoursPerDay: device.hoursPerDay,
            daysPerWeek: device.daysPerWeek,
            name: device.name,
          }))
        },
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })