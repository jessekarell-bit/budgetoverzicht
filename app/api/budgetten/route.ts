import { NextResponse } from "next/server";
import { getBudgetten } from "@/lib/data";

export async function GET() {
  const budgetten = getBudgetten();
  return NextResponse.json(budgetten);
}
