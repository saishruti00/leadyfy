import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireRole(["OWNER", "ADMIN", "EMPLOYEE"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const videoDeliverables =
      await prisma.videoDeliverable.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      videoDeliverables,
    });
  } catch (error) {
    console.error("VIDEO_DELIVERABLE_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch video deliverables",
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
      !body.videoNumber ||
      !body.title
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "clientId, orderId, videoNumber and title are required",
        },
        { status: 400 },
      );
    }

    const videoDeliverable =
      await prisma.videoDeliverable.create({
        data: {
          clientId: body.clientId,
          orderId: body.orderId,
          scriptId: body.scriptId,
          creatorId: body.creatorId,
          shootId: body.shootId,
          assignedEditorId: body.assignedEditorId,
          videoNumber: body.videoNumber,
          title: body.title,
          status: body.status ?? "SCRIPT_APPROVED",
          deadline: body.deadline
            ? new Date(body.deadline)
            : undefined,
          videoFileLink: body.videoFileLink,
          thumbnail: body.thumbnail,
          clientFeedbackLog: body.clientFeedbackLog,
          revisionCount: body.revisionCount ?? 0,
          finalDeliveryLink: body.finalDeliveryLink,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Video deliverable created successfully",
        videoDeliverable,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("VIDEO_DELIVERABLE_POST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create video deliverable",
      },
      { status: 500 },
    );
  }
}