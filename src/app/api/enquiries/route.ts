import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { PROJECT_TYPES } from "@/lib/enquiries/config";
import type { CreateEnquiryPayload } from "@/lib/enquiries/types";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const VALID_PROJECT_TYPES = new Set<string>(PROJECT_TYPES.map((p) => p.id));
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateReferenceCode(): string {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const rand = randomBytes(2).toString("hex").toUpperCase();
  return `BHN-${yy}${mm}${dd}-${rand}`;
}

export async function POST(request: Request) {
  const { hasAdminSecret } = getSupabaseEnv();
  if (!hasAdminSecret) {
    return NextResponse.json(
      { error: "Enquiry backend is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as Partial<CreateEnquiryPayload>;

    const idempotencyKey = body.idempotencyKey?.trim() ?? "";
    const projectType = body.projectType?.trim() ?? "";
    const projectDescription = body.projectDescription?.trim() ?? "";
    const budgetRange = body.budgetRange?.trim() ?? "";
    const expectedTimeline = body.expectedTimeline?.trim() ?? "";
    const customerName = body.customerName?.trim() ?? "";
    const customerEmail = body.customerEmail?.trim().toLowerCase() ?? "";
    const customerCompany = body.customerCompany?.trim() || null;
    const customerPhone = body.customerPhone?.trim() || null;
    const sourceProductSlug = body.sourceProductSlug?.trim() || null;

    const selectedFeatures = Array.isArray(body.selectedFeatures)
      ? body.selectedFeatures.map((f) => String(f).trim()).filter(Boolean).slice(0, 25)
      : [];
    const techPreferences = Array.isArray(body.techPreferences)
      ? body.techPreferences.map((t) => String(t).trim()).filter(Boolean).slice(0, 20)
      : [];

    if (!idempotencyKey || idempotencyKey.length < 8) {
      return NextResponse.json(
        { error: "Missing submission key. Please refresh and try again." },
        { status: 400 }
      );
    }

    if (!VALID_PROJECT_TYPES.has(projectType)) {
      return NextResponse.json(
        { error: "Please select a valid project type." },
        { status: 400 }
      );
    }

    if (projectDescription.length < 15 || projectDescription.length > 4000) {
      return NextResponse.json(
        {
          error:
            "Please describe your project in at least 15 characters (max 4,000).",
        },
        { status: 400 }
      );
    }

    if (!budgetRange || !expectedTimeline) {
      return NextResponse.json(
        { error: "Please select both budget range and expected timeline." },
        { status: 400 }
      );
    }

    if (customerName.length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(customerEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdminClient();

    // 1. Idempotency check (prevents accidental double submission)
    const { data: existingByKey, error: keyErr } = await admin
      .from("enquiries")
      .select("reference_code")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (keyErr) {
      return NextResponse.json(
        {
          error:
            "Enquiry database table is not initialized yet. Please contact thebhanuofficial@gmail.com.",
        },
        { status: 503 }
      );
    }

    if (existingByKey?.reference_code) {
      return NextResponse.json({
        ok: true,
        referenceCode: existingByKey.reference_code,
        deduplicated: true,
      });
    }

    // 2. Insert new enquiry with generated unique reference
    const referenceCode = generateReferenceCode();
    const { data: created, error: insertErr } = await admin
      .from("enquiries")
      .insert({
        reference_code: referenceCode,
        idempotency_key: idempotencyKey,
        project_type: projectType,
        selected_features: selectedFeatures,
        tech_preferences: techPreferences,
        project_description: projectDescription,
        budget_range: budgetRange,
        expected_timeline: expectedTimeline,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_company: customerCompany,
        customer_phone: customerPhone,
        source_product_slug: sourceProductSlug,
        status: "New",
      })
      .select("reference_code")
      .single();

    if (insertErr || !created) {
      return NextResponse.json(
        { error: insertErr?.message ?? "Failed to save enquiry." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        referenceCode: created.reference_code,
        deduplicated: false,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid enquiry submission payload." },
      { status: 400 }
    );
  }
}
