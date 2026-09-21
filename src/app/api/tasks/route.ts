import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireRole(["OWNER", "ADMIN", "EMPLOYEE"]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const tasks = await prisma.task.findMany({
      orderBy: [
        { priority: "asc" },
        { deadline: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("TASKS_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tasks",
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

    if (!body.title) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required",
        },
        { status: 400 },
      );
    }

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        assigneeId: body.assigneeId,
        priority: body.priority,
        deadline: body.deadline ? new Date(body.deadline) : null,
        attachment: body.attachment,
        status: body.status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("TASKS_POST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create task",
      },
      { status: 500 },
    );
  }
}