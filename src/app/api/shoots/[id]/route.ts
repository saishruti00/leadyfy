import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["OWNER", "ADMIN", "EMPLOYEE"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;

    const shoot = await prisma.shoot.findUnique({
      where: {
        id,
      },
      include: {
        client: true,
        order: true,
        creator: true,
        videoDeliverables: true,
      },
    });

    if (!shoot) {
      return NextResponse.json(
        {
          success: false,
          message: "Shoot not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      shoot,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch shoot",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["OWNER", "ADMIN"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existingShoot = await prisma.shoot.findUnique({
      where: {
        id,
      },
    });

    if (!existingShoot) {
      return NextResponse.json(
        {
          success: false,
          message: "Shoot not found",
        },
        { status: 404 },
      );
    }

    const shoot = await prisma.shoot.update({
      where: {
        id,
      },
      data: {
        ...(body.clientId !== undefined && {
          clientId: body.clientId,
        }),
        ...(body.orderId !== undefined && {
          orderId: body.orderId,
        }),
        ...(body.creatorId !== undefined && {
          creatorId: body.creatorId,
        }),
        ...(body.dateTime !== undefined && {
          dateTime: new Date(body.dateTime),
        }),
        ...(body.location !== undefined && {
          location: body.location,
        }),
        ...(body.cameraman !== undefined && {
          cameraman: body.cameraman,
        }),
        ...(body.shootManager !== undefined && {
          shootManager: body.shootManager,
        }),
        ...(body.shootingAssistant !== undefined && {
          shootingAssistant: body.shootingAssistant,
        }),
        ...(body.approvedScripts !== undefined && {
          approvedScripts: body.approvedScripts,
        }),
        ...(body.specialNotes !== undefined && {
          specialNotes: body.specialNotes,
        }),
        ...(body.status !== undefined && {
          status: body.status,
        }),
        ...(body.footageUploadVerified !== undefined && {
          footageUploadVerified: body.footageUploadVerified,
        }),
        ...(body.rawFileIntegrityChecked !== undefined && {
          rawFileIntegrityChecked: body.rawFileIntegrityChecked,
        }),
        ...(body.reshootRequired !== undefined && {
          reshootRequired: body.reshootRequired,
        }),
      },
      include: {
        client: true,
        order: true,
        creator: true,
        videoDeliverables: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Shoot updated successfully",
      shoot,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update shoot",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["OWNER", "ADMIN"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;

    const existingShoot = await prisma.shoot.findUnique({
      where: {
        id,
      },
    });

    if (!existingShoot) {
      return NextResponse.json(
        {
          success: false,
          message: "Shoot not found",
        },
        { status: 404 },
      );
    }

    await prisma.shoot.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Shoot deleted successfully",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete shoot",
      },
      { status: 500 },
    );
  }
}