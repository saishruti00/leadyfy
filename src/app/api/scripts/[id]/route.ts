import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

const allowedTransitions: Record<string, string[]> = {
  DRAFT: ["ASSIGNED"],
  ASSIGNED: ["IN_REVIEW"],
  IN_REVIEW: ["SENT_TO_CLIENT"],
  SENT_TO_CLIENT: ["REVISION_REQUIRED", "APPROVED"],
  REVISION_REQUIRED: ["IN_REVIEW"],
  APPROVED: ["READY_FOR_SHOOT"],
  READY_FOR_SHOOT: [],
};

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

    const script = await prisma.script.findUnique({
      where: { id },
      select: {
        id: true,
        clientId: true,
        orderId: true,
        writerId: true,
        creatorId: true,
        videoNumber: true,
        language: true,
        scriptText: true,
        referenceLinks: true,
        deadline: true,
        revisionCount: true,
        comments: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        client: {
          select: {
            id: true,
            companyName: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        order: {
          select: {
            id: true,
            packageName: true,
            status: true,
          },
        },

        writer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        creator: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
    });

    if (!script) {
      return NextResponse.json(
        {
          success: false,
          message: "Script not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      script,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch script",
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

    const existingScript = await prisma.script.findUnique({
      where: { id },
    });

    if (!existingScript) {
      return NextResponse.json(
        {
          success: false,
          message: "Script not found",
        },
        { status: 404 },
      );
    }

    if (body.writerId !== undefined && body.writerId !== null) {
      const writer = await prisma.employee.findUnique({
        where: {
          id: body.writerId,
        },
      });

      if (!writer) {
        return NextResponse.json(
          {
            success: false,
            message: "Writer not found",
          },
          { status: 404 },
        );
      }
    }

    if (body.creatorId !== undefined && body.creatorId !== null) {
      const creator = await prisma.creator.findUnique({
        where: {
          id: body.creatorId,
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
    }

    const currentStatus = existingScript.status;
    const nextStatus = body.status ?? currentStatus;

    if (body.status !== undefined) {
      if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid script status transition: ${currentStatus} → ${nextStatus}`,
          },
          { status: 400 },
        );
      }
    }

    const script = await prisma.script.update({
      where: { id },
      data: {
        ...(body.writerId !== undefined && {
          writerId: body.writerId,
        }),

        ...(body.creatorId !== undefined && {
          creatorId: body.creatorId,
        }),

        ...(body.videoNumber !== undefined && {
          videoNumber: body.videoNumber,
        }),

        ...(body.language !== undefined && {
          language: body.language,
        }),

        ...(body.scriptText !== undefined && {
          scriptText: body.scriptText,
        }),

        ...(body.referenceLinks !== undefined && {
          referenceLinks: body.referenceLinks,
        }),

        ...(body.deadline !== undefined && {
          deadline: new Date(body.deadline),
        }),

        ...(nextStatus === "REVISION_REQUIRED" &&
          existingScript.status !== "REVISION_REQUIRED" && {
            revisionCount: {
              increment: 1,
            },
          }),

        ...(body.comments !== undefined && {
          comments: body.comments,
        }),

        ...(body.status !== undefined && {
          status: body.status,
        }),
      },

      select: {
        id: true,
        clientId: true,
        orderId: true,
        writerId: true,
        creatorId: true,
        videoNumber: true,
        language: true,
        scriptText: true,
        referenceLinks: true,
        deadline: true,
        revisionCount: true,
        comments: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        writer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        creator: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Script updated successfully",
      script,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update script",
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

    const existingScript = await prisma.script.findUnique({
      where: { id },
    });

    if (!existingScript) {
      return NextResponse.json(
        {
          success: false,
          message: "Script not found",
        },
        { status: 404 },
      );
    }

    await prisma.script.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Script deleted successfully",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete script",
      },
      { status: 500 },
    );
  }
}