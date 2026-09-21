import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireRole } from "@/lib/require-auth";

const updateClientSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(8).optional(),
  companyName: z.string().trim().min(2).optional(),
  isActive: z.boolean().optional(),
});

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

    const result = updateClientSchema.safeParse(body);

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

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
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

    const { name, email, password, companyName, isActive } = result.data;

    if (email && email !== client.user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            message: "User with this email already exists",
          },
          { status: 409 },
        );
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        ...(companyName !== undefined && {
          companyName,
        }),
        user: {
          update: {
            ...(name !== undefined && { name }),
            ...(email !== undefined && { email }),
            ...(isActive !== undefined && { isActive }),
            ...(password !== undefined && {
              password: await hashPassword(password),
            }),
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

    return NextResponse.json({
      success: true,
      message: "Client updated successfully",
      client: updatedClient,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update client",
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

    const client = await prisma.client.findUnique({
      where: { id },
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

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete client",
      },
      { status: 500 },
    );
  }
}