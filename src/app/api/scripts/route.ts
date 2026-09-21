import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireRole(["OWNER", "ADMIN", "EMPLOYEE"]);

  if (auth.response) {
    return auth.response;
  }

  try {
   const scripts = await prisma.script.findMany({
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

  orderBy: {
    createdAt: "desc",
  },
});
    return NextResponse.json({
      success: true,
      scripts,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch scripts",
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

    const client = await prisma.client.findUnique({
      where: {
        id: body.clientId,
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found",
        },
        { status: 404 },
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: body.orderId,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }

    if (order.clientId !== body.clientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order does not belong to this client",
        },
        { status: 400 },
      );
    }

    if (body.writerId) {
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

    if (body.creatorId) {
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

    const script = await prisma.script.create({
      data: {
        clientId: body.clientId,
        orderId: body.orderId,
        writerId: body.writerId ?? null,
        creatorId: body.creatorId ?? null,
        videoNumber: body.videoNumber,
        language: body.language,
        scriptText: body.scriptText,
        referenceLinks: body.referenceLinks ?? null,
        deadline: new Date(body.deadline),
        revisionCount: body.revisionCount ?? 0,
        comments: body.comments ?? null,
        status: body.status ?? "DRAFT",
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

    return NextResponse.json(
      {
        success: true,
        message: "Script created successfully",
        script,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create script",
      },
      { status: 500 },
    );
  }
}