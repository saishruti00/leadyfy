import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireRole(["OWNER", "ADMIN", "EMPLOYEE"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const shoots = await prisma.shoot.findMany({
      include: {
        client: true,
        order: true,
        creator: true,
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      shoots,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch shoots",
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

    if (
      !body.clientId ||
      !body.orderId ||
      !body.creatorId ||
      !body.dateTime ||
      !body.location
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "clientId, orderId, creatorId, dateTime and location are required",
        },
        { status: 400 },
      );
    }

    const shoot = await prisma.shoot.create({
      data: {
        clientId: body.clientId,
        orderId: body.orderId,
        creatorId: body.creatorId,
        dateTime: new Date(body.dateTime),
        location: body.location,
        cameraman: body.cameraman,
        shootManager: body.shootManager,
        shootingAssistant: body.shootingAssistant,
        approvedScripts: body.approvedScripts,
        specialNotes: body.specialNotes,
        status: body.status ?? "SCHEDULED",
      },
      include: {
        client: true,
        order: true,
        creator: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Shoot created successfully",
        shoot,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create shoot",
      },
      { status: 500 },
    );
  }
}