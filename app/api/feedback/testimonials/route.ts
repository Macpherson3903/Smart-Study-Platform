import { NextResponse } from "next/server";

import { listFeedbackTestimonials } from "@/server/services/feedbackService";

export async function GET() {
  try {
    const testimonials = await listFeedbackTestimonials();
    return NextResponse.json({
      success: true,
      message: "Testimonials fetched successfully.",
      testimonials,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
