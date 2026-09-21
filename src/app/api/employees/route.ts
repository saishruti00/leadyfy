import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const auth = await requireRole(["OWNER", "ADMIN"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error("EMPLOYEES_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch employees",
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

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "name, email and password are required",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists",
        },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const employee = await prisma.employee.create({
      data: {
        user: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: "EMPLOYEE",
            isActive: true,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Employee created successfully",
        employee,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("EMPLOYEES_POST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create employee",
      },
      { status: 500 },
    );
  }
}