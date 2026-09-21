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

    const order = await prisma.order.findUnique({
      where: { id },
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
        scripts: true,
        shoots: true,
        videoDeliverables: true,
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

    return NextResponse.json({
      success: true,
      order,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }

    const amountReceived =
      body.amountReceived ?? Number(existingOrder.amountReceived);

    const totalInvoiceAmount =
      body.totalInvoiceAmount ?? Number(existingOrder.totalInvoiceAmount);

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(body.packageName !== undefined && {
          packageName: body.packageName,
        }),
        ...(body.contractedVideoCount !== undefined && {
          contractedVideoCount: body.contractedVideoCount,
        }),
        ...(body.pricing !== undefined && {
          pricing: body.pricing,
        }),
        ...(body.gstTax !== undefined && {
          gstTax: body.gstTax,
        }),
        ...(body.totalInvoiceAmount !== undefined && {
          totalInvoiceAmount: body.totalInvoiceAmount,
        }),
        ...(body.amountReceived !== undefined && {
          amountReceived: body.amountReceived,
        }),
        outstandingBalance: totalInvoiceAmount - amountReceived,
        ...(body.startDate !== undefined && {
          startDate: new Date(body.startDate),
        }),
        ...(body.dueDate !== undefined && {
          dueDate: new Date(body.dueDate),
        }),
        ...(body.status !== undefined && {
          status: body.status,
        }),
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

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order",
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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete order",
      },
      { status: 500 },
    );
  }
}