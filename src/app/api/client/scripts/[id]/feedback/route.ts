import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const auth = await requireRole(["CLIENT"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    if (!auth.user || typeof auth.user === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { id: scriptId } = await context.params;

    const body = await request.json();

    const action = body.action;
    const comment =
      typeof body.comment === "string" && body.comment.trim()
        ? body.comment.trim()
        : null;

    if (!["APPROVED", "REVISION_REQUIRED"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Action must be APPROVED or REVISION_REQUIRED",
        },
        { status: 400 },
      );
    }

    if (action === "REVISION_REQUIRED" && !comment) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment is required when requesting a revision",
        },
        { status: 400 },
      );
    }

    const client = await prisma.client.findUnique({
      where: {
        userId: auth.user.userId,
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client profile not found",
        },
        { status: 404 },
      );
    }

    const script = await prisma.script.findFirst({
      where: {
        id: scriptId,
        clientId: client.id,
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

    if (script.status !== "SENT_TO_CLIENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Only scripts sent to the client can be reviewed",
        },
        { status: 400 },
      );
    }

    const nextStatus =
      action === "APPROVED"
        ? "APPROVED"
        : "REVISION_REQUIRED";

    const updatedScript = await prisma.$transaction(async (tx) => {
      const feedback = await tx.scriptFeedback.create({
        data: {
          scriptId: script.id,
          clientId: client.id,
          action,
          comment,
        },
      });

      const updated = await tx.script.update({
        where: {
          id: script.id,
        },
        data: {
          status: nextStatus,
          ...(action === "REVISION_REQUIRED" && {
            revisionCount: {
              increment: 1,
            },
          }),
          ...(comment && {
            comments: comment,
          }),
        },
      });

      return {
        script: updated,
        feedback,
      };
    });

    return NextResponse.json({
      success: true,
      message:
        action === "APPROVED"
          ? "Script approved successfully"
          : "Revision requested successfully",
      ...updatedScript,
    });
  } catch (error) {
    console.error("CLIENT_SCRIPT_FEEDBACK_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit script feedback",
      },
      { status: 500 },
    );
  }
}