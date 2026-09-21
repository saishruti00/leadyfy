import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireRole(["OWNER", "ADMIN", "EMPLOYEE"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const payouts = await prisma.creatorPayout.findMany({
      include: {
        creator: true,
      },
      orderBy: {
        payoutDate: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      payouts,
    });
  } catch (error) {
    console.error("CREATOR_PAYOUTS_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch creator payouts",
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

    if (!body.creatorId || body.amount === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "creatorId and amount are required",
        },
        { status: 400 },
      );
    }

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

    const payout = await prisma.creatorPayout.create({
      data: {
        creatorId: body.creatorId,
        amount: body.amount,
        payoutDate: body.payoutDate
          ? new Date(body.payoutDate)
          : new Date(),
        paymentMethod: body.paymentMethod,
        reference: body.reference,
        notes: body.notes,
      },
      include: {
        creator: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Creator payout created successfully",
        payout,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATOR_PAYOUTS_POST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create creator payout",
      },
      { status: 500 },
    );
  }
}