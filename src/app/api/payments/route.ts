import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireRole(["OWNER", "ADMIN", "EMPLOYEE"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const payments = await prisma.payment.findMany({
      orderBy: {
        paymentDate: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("PAYMENTS_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payments",
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

    if (!body.clientId || !body.orderId || !body.amount) {
      return NextResponse.json(
        {
          success: false,
          message: "clientId, orderId and amount are required",
        },
        { status: 400 },
      );
    }

    const payment = await prisma.payment.create({
      data: {
        clientId: body.clientId,
        orderId: body.orderId,
        amount: body.amount,
        paymentDate: body.paymentDate
          ? new Date(body.paymentDate)
          : new Date(),
        paymentMethod: body.paymentMethod,
        reference: body.reference,
        notes: body.notes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment created successfully",
        payment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("PAYMENTS_POST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment",
      },
      { status: 500 },
    );
  }
}