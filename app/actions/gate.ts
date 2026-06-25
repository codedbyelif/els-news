"use server";

import { redirect } from "next/navigation";
import { grantGate, countCorrect, REQUIRED_CORRECT, getQuestions } from "@/lib/gate";

export interface GateState {
  error?: string;
}

export async function submitGate(
  _prev: GateState,
  formData: FormData,
): Promise<GateState> {
  // Her sorunun kendi input'u var: alan adları soru id'leri (q1, q2, ...).
  const questions = await getQuestions();
  const answers: Record<string, string> = {};
  for (const q of questions) {
    answers[q.id] = String(formData.get(q.id) ?? "");
  }

  const correct = countCorrect(answers, questions);

  if (correct < REQUIRED_CORRECT) {
    return {
      error: `Yetmedi — en az ${REQUIRED_CORRECT} doğru cevap gerekli. Şu an ${correct} doğru var.`,
    };
  }

  await grantGate();
  redirect("/");
}
