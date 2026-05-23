import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateTune } from "@/lib/tuner";
import type { CarInfo, Upgrades, TuneContext } from "@/lib/tuner";

export async function GET() {
  const tunes = await prisma.tune.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(tunes);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    name: string;
    car: CarInfo;
    upgrades: Upgrades;
    context: TuneContext;
  };
  const { name, car, upgrades, context } = body;

  const results = calculateTune(car, upgrades, context);

  const tune = await prisma.tune.create({
    data: {
      name,
      carName:    car.name,
      piClass:    car.piClass,
      weight:     car.weight,
      frontDist:  car.frontDist,
      power:      car.power,
      drivetrain: car.drivetrain,
      trackType:  context.tuneType,
      style:      context.weather,
      parts:      JSON.stringify({ upgrades, context }),
      results:    JSON.stringify(results),
    },
  });

  return NextResponse.json({ tune, results }, { status: 201 });
}
