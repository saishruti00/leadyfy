import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

export async function GET() {
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

    const client = await prisma.client.findUnique({
      where: {
        userId: auth.user.userId,
      },
      include: {
        orders: true,
        scripts: true,
        shoots: true,
        videoDeliverables: true,
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

    return NextResponse.json({
      success: true,
      client,
    });
  } catch (error) {
    console.error("CLIENT_PORTAL_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load client portal",
      },
      { status: 500 },
    );
  }
}