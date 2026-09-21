import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireAuth();

  if (auth.response) {
    return auth.response;
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId:
          typeof auth.user === "string"
            ? ""
            : auth.user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("NOTIFICATIONS_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications",
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

    const userId = body.userId?.trim();
    const title = body.title?.trim();
    const message = body.message?.trim();
    const type = body.type?.trim();

    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        {
          success: false,
          message:
            "userId, title, message and type are required",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Notification created successfully",
        notification,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("NOTIFICATIONS_POST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create notification",
      },
      { status: 500 },
    );
  }
}