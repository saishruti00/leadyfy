import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireRole(["OWNER", "ADMIN"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        expenseDate: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      expenses,
    });
  } catch (error) {
    console.error("EXPENSE_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch expenses",
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

    if (!body.category || body.amount === undefined || !body.expenseDate) {
      return NextResponse.json(
        {
          success: false,
          message: "category, amount and expenseDate are required",
        },
        { status: 400 },
      );
    }

    const expense = await prisma.expense.create({
      data: {
        category: body.category,
        description: body.description,
        amount: body.amount,
        expenseDate: new Date(body.expenseDate),
        paymentMethod: body.paymentMethod,
        receiptLink: body.receiptLink,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Expense created successfully",
        expense,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("EXPENSE_POST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create expense",
      },
      { status: 500 },
    );
  }
}