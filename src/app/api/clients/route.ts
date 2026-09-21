import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireRole(["OWNER", "ADMIN", "EMPLOYEE"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        userId: true,
        companyName: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      clients,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch clients",
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

    const result = z
      .object({
        name: z.string().trim().min(2),
        email: z.string().trim().email(),
        password: z.string().min(8),
        companyName: z.string().trim().min(2),
      })
      .safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email, password, companyName } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
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

    const client = await prisma.client.create({
      data: {
        companyName,
        user: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: "CLIENT",
          },
        },
      },
      select: {
        id: true,
        userId: true,
        companyName: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Client created successfully",
        client,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create client",
      },
      { status: 500 },
    );
  }
}