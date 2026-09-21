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

    const creator = await prisma.creator.findUnique({
      where: { id },
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
        scripts: {
          select: {
            id: true,
            videoNumber: true,
            language: true,
            status: true,
            deadline: true,
          },
        },
        shoots: {
          select: {
            id: true,
            dateTime: true,
            location: true,
            status: true,
          },
        },
      },
    });

    if (!creator) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      creator,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch creator",
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

    const existingCreator = await prisma.creator.findUnique({
      where: { id },
    });

    if (!existingCreator) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator not found",
        },
        { status: 404 },
      );
    }

    const creator = await prisma.creator.update({
      where: { id },
      data: {
        ...(body.name !== undefined && {
          name: body.name,
        }),
        ...(body.specialty !== undefined && {
          specialty: body.specialty,
        }),
        ...(body.languages !== undefined && {
          languages: body.languages,
        }),
        ...(body.platform !== undefined && {
          platform: body.platform,
        }),
        ...(body.location !== undefined && {
          location: body.location,
        }),
        ...(body.rate !== undefined && {
          rate: body.rate,
        }),
        ...(body.status !== undefined && {
          status: body.status,
        }),
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

    return NextResponse.json({
      success: true,
      message: "Creator updated successfully",
      creator,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update creator",
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

    const existingCreator = await prisma.creator.findUnique({
      where: { id },
    });

    if (!existingCreator) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator not found",
        },
        { status: 404 },
      );
    }

    await prisma.creator.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Creator deleted successfully",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete creator",
      },
      { status: 500 },
    );
  }
}