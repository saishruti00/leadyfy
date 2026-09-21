import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();

  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;

    const userId =
      typeof auth.user === "string"
        ? ""
        : auth.user.userId;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found",
        },
        { status: 404 },
      );
    }

    const updatedNotification =
      await prisma.notification.update({
        where: {
          id,
        },
        data: {
          isRead: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("NOTIFICATION_READ_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notification",
      },
      { status: 500 },
    );
  }
}