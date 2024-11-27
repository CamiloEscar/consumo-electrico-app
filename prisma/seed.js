const { PrismaClient } = require('@prisma/client')
const { deviceDefaults } = require('../lib/deviceDefaults')
const prisma = new PrismaClient()

async function main() {
  // Limpiar la base de datos
  await prisma.device.deleteMany()
  await prisma.calculation.deleteMany()
  await prisma.category.deleteMany()

  // Crear categorías
  const categories = [
    { value: 'kitchen', label: 'Cocina' },
    { value: 'entertainment', label: 'Entretenimiento' },
    { value: 'office', label: 'Oficina' },
    { value: 'climate', label: 'Climatización' },
    { value: 'lighting', label: 'Iluminación' },
    { value: 'cleaning', label: 'Limpieza' },
  ]

  for (const category of categories) {
    await prisma.category.create({
      data: category
    })
  }

  // Convertir dispositivos por defecto a registros en la base de datos
  for (const [type, device] of Object.entries(deviceDefaults)) {
    for (const brand of device.commonBrands) {
      for (const model of brand.models) {
        await prisma.device.create({
          data: {
            type,
            brand: brand.brand,
            model: model.name,
            watts: model.watts,
            name: `${brand.brand} ${model.name}`,
            label: device.label,
            category: device.category,
            hoursPerDay: 1,
            daysPerWeek: 7,
            specifications: {
              averageWatts: device.averageWatts,
              schedules: device.commonSchedules || []
            }
          }
        })
      }
    }
  }

  console.log('Database has been seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })