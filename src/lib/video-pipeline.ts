import type { VideoDeliverableStatus } from "@prisma/client";

const allowedTransitions: Record<
  VideoDeliverableStatus,
  VideoDeliverableStatus[]
> = {
  SCRIPT_APPROVED: ["SHOOT_PENDING"],
  SHOOT_PENDING: ["RAW_FOOTAGE_RECEIVED"],
  RAW_FOOTAGE_RECEIVED: ["VIDEO_EDITING"],
  VIDEO_EDITING: ["INTERNAL_QA"],
  INTERNAL_QA: ["CLIENT_REVIEW"],
  CLIENT_REVIEW: ["REVISION", "FINAL_APPROVED"],
  REVISION: ["VIDEO_EDITING", "FINAL_APPROVED"],
  FINAL_APPROVED: ["DELIVERED"],
  DELIVERED: [],
};

export function canTransitionVideoStatus(
  currentStatus: VideoDeliverableStatus,
  nextStatus: VideoDeliverableStatus,
) {
  return allowedTransitions[currentStatus].includes(nextStatus);
}