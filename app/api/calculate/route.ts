import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { devices, totalConsumption } = data

    console.log('Received data:', data)

    // Validaciones
    if (!Array.isArray(devices) || devices.length === 0) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'No devices provided'
        }),
        { status: 400 }
      )
    }

    // Validar cada dispositivo
    for (const device of devices) {
      if (!device.type || !device.brand || !device.model || typeof device.watts !== 'number') {
        console.error('Invalid device:', device)
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Invalid device data'
          }),
          { status: 400 }
        )
      }
    }

    if (typeof totalConsumption !== 'number' || isNaN(totalConsumption)) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Invalid total consumption value'
        }),
        { status: 400 }
      )
    }

    // Crear el cálculo en la base de datos
    const calculation = await prisma.calculation.create({
      data: {
        totalConsumption,
        devices: {
          create: devices.map(device => ({
            type: device.type,
            brand: device.brand,
            model: device.model,
            watts: Number(device.watts),
            hoursPerDay: Number(device.hoursPerDay) || 1,
            daysPerWeek: Number(device.daysPerWeek) || 7,
            name: device.name || `${device.brand} ${device.model}`
          }))
        }
      },
      include: {
        devices: true
      }
    })

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: calculation
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in calculate API:', error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

export async function GET() {
  try {
    const calculations = await prisma.calculation.findMany({
      include: {
        devices: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: calculations
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching calculations:', error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Error fetching calculations',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}