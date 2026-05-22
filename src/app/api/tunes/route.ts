import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateTune, CarStats } from "@/lib/tuner";

export async function GET() {
  const tunes = await prisma.tune.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tunes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, carName, ...carStats } = body as { name: string; carName: string } & CarStats;

  const results = calculateTune(carStats as CarStats);

  const tune = await prisma.tune.create({
    data: {
      name,
      carName,
      piClass:    carStats.piClass,
      weight:     carStats.weight,
      frontDist:  carStats.frontDist,
      power:      carStats.power,
      drivetrain: carStats.drivetrain,
      trackType:  carStats.trackType,
      style:      carStats.style,
      parts:      JSON.stringify(carStats.parts),
      results:    JSON.stringify(results),
    },
  });

  return NextResponse.json({ tune, results }, { status: 201 });
}
