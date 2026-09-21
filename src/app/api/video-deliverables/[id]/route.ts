import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";
import { canTransitionVideoStatus } from "@/lib/video-pipeline";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const videoIncludes = {
  client: true,
  order: true,
  script: true,
  creator: true,
  shoot: true,
  assignedEditor: true,
} as const;

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  const auth = await requireRole(["OWNER", "ADMIN", "EMPLOYEE"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;

    const videoDeliverable =
      await prisma.videoDeliverable.findUnique({
        where: { id },
        include: videoIncludes,
      });

    if (!videoDeliverable) {
      return NextResponse.json(
        {
          success: false,
          message: "Video deliverable not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      videoDeliverable,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch video deliverable",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  const auth = await requireRole(["OWNER", "ADMIN"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existingVideoDeliverable =
      await prisma.videoDeliverable.findUnique({
        where: { id },
      });

    if (!existingVideoDeliverable) {
      return NextResponse.json(
        {
          success: false,
          message: "Video deliverable not found",
        },
        { status: 404 },
      );
    }

    if (
      body.status !== undefined &&
      body.status !== existingVideoDeliverable.status &&
      !canTransitionVideoStatus(
        existingVideoDeliverable.status,
        body.status,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid video status transition from ${existingVideoDeliverable.status} to ${body.status}`,
        },
        { status: 400 },
      );
    }

    const videoDeliverable =
      await prisma.videoDeliverable.update({
        where: { id },
        data: {
          ...(body.clientId !== undefined && {
            clientId: body.clientId,
          }),
          ...(body.orderId !== undefined && {
            orderId: body.orderId,
          }),
          ...(body.scriptId !== undefined && {
            scriptId: body.scriptId,
          }),
          ...(body.creatorId !== undefined && {
            creatorId: body.creatorId,
          }),
          ...(body.shootId !== undefined && {
            shootId: body.shootId,
          }),
          ...(body.assignedEditorId !== undefined && {
            assignedEditorId: body.assignedEditorId,
          }),
          ...(body.videoNumber !== undefined && {
            videoNumber: body.videoNumber,
          }),
          ...(body.title !== undefined && {
            title: body.title,
          }),
          ...(body.status !== undefined && {
            status: body.status,
          }),
          ...(body.deadline !== undefined && {
            deadline: body.deadline
              ? new Date(body.deadline)
              : null,
          }),
          ...(body.videoFileLink !== undefined && {
            videoFileLink: body.videoFileLink,
          }),
          ...(body.thumbnail !== undefined && {
            thumbnail: body.thumbnail,
          }),
          ...(body.clientFeedbackLog !== undefined && {
            clientFeedbackLog: body.clientFeedbackLog,
          }),
          ...(body.revisionCount !== undefined && {
            revisionCount: body.revisionCount,
          }),
          ...(body.finalDeliveryLink !== undefined && {
            finalDeliveryLink: body.finalDeliveryLink,
          }),
        },
        include: videoIncludes,
      });

    return NextResponse.json({
      success: true,
      message: "Video deliverable updated successfully",
      videoDeliverable,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update video deliverable",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext,
) {
  const auth = await requireRole(["OWNER", "ADMIN"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;

    const existingVideoDeliverable =
      await prisma.videoDeliverable.findUnique({
        where: { id },
      });

    if (!existingVideoDeliverable) {
      return NextResponse.json(
        {
          success: false,
          message: "Video deliverable not found",
        },
        { status: 404 },
      );
    }

    await prisma.videoDeliverable.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Video deliverable deleted successfully",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete video deliverable",
      },
      { status: 500 },
    );
  }
}