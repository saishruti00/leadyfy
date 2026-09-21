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

    const availability = await prisma.creatorAvailability.findMany({
      where: {
        creatorId: id,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      availability,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch creator availability",
      },
      { status: 500 },
    );
  }
}
export async function POST(
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

    const creator = await prisma.creator.findUnique({
      where: { id },
      select: {
        id: true,
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

    const availability = await prisma.creatorAvailability.create({
      data: {
        creatorId: id,
        date: new Date(body.date),
        status: body.status ?? "AVAILABLE",
        notes: body.notes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Creator availability created successfully",
        availability,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create creator availability",
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

    if (!body.availabilityId) {
      return NextResponse.json(
        {
          success: false,
          message: "availabilityId is required",
        },
        { status: 400 },
      );
    }

    const existingAvailability =
      await prisma.creatorAvailability.findFirst({
        where: {
          id: body.availabilityId,
          creatorId: id,
        },
      });

    if (!existingAvailability) {
      return NextResponse.json(
        {
          success: false,
          message: "Availability not found",
        },
        { status: 404 },
      );
    }

    const availability =
      await prisma.creatorAvailability.update({
        where: {
          id: body.availabilityId,
        },
        data: {
          ...(body.date !== undefined && {
            date: new Date(body.date),
          }),
          ...(body.status !== undefined && {
            status: body.status,
          }),
          ...(body.notes !== undefined && {
            notes: body.notes,
          }),
        },
      });

    return NextResponse.json({
      success: true,
      message: "Creator availability updated successfully",
      availability,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update creator availability",
      },
      { status: 500 },
    );
  }
}
export async function DELETE(
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

    if (!body.availabilityId) {
      return NextResponse.json(
        {
          success: false,
          message: "availabilityId is required",
        },
        { status: 400 },
      );
    }

    const existingAvailability =
      await prisma.creatorAvailability.findFirst({
        where: {
          id: body.availabilityId,
          creatorId: id,
        },
      });

    if (!existingAvailability) {
      return NextResponse.json(
        {
          success: false,
          message: "Availability not found",
        },
        { status: 404 },
      );
    }

    await prisma.creatorAvailability.delete({
      where: {
        id: body.availabilityId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Creator availability deleted successfully",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete creator availability",
      },
      { status: 500 },
    );
  }
}