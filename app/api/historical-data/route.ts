import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const historicalData = await prisma.calculation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        devices: true,
      },
    })

    return NextResponse.json(historicalData)
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return NextResponse.json({ error: 'Error fetching historical data' }, { status: 500 })
  }
}