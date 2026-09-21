import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireRole(["OWNER", "ADMIN", "EMPLOYEE"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const creators = await prisma.creator.findMany({
      select: {
        id: true,
        name: true,
        specialty: true,
        languages: true,
        platform: true,
        location: true,
        rate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        availability: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      creators,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch creators",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireRole(["OWNER", "ADMIN"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();

    const creator = await prisma.creator.create({
      data: {
        name: body.name,
        specialty: body.specialty,
        languages: body.languages,
        platform: body.platform,
        location: body.location,
        rate: body.rate,
        status: body.status ?? "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        languages: true,
        platform: true,
        location: true,
        rate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Creator created successfully",
        creator,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create creator",
      },
      { status: 500 },
    );
  }
}