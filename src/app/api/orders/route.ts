import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireRole(["OWNER", "ADMIN", "EMPLOYEE"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        clientId: true,
        packageName: true,
        contractedVideoCount: true,
        pricing: true,
        gstTax: true,
        totalInvoiceAmount: true,
        amountReceived: true,
        outstandingBalance: true,
        startDate: true,
        dueDate: true,
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
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

    const order = await prisma.order.create({
      data: {
        clientId: body.clientId,
        packageName: body.packageName,
        contractedVideoCount: body.contractedVideoCount,
        pricing: body.pricing,
        gstTax: body.gstTax,
        totalInvoiceAmount: body.totalInvoiceAmount,
        amountReceived: body.amountReceived ?? 0,
        outstandingBalance:
          body.totalInvoiceAmount - (body.amountReceived ?? 0),
        startDate: new Date(body.startDate),
        dueDate: new Date(body.dueDate),
        status: body.status ?? "NEW",
      },
      select: {
        id: true,
        clientId: true,
        packageName: true,
        contractedVideoCount: true,
        pricing: true,
        gstTax: true,
        totalInvoiceAmount: true,
        amountReceived: true,
        outstandingBalance: true,
        startDate: true,
        dueDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        order,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
      },
      { status: 500 },
    );
  }
}