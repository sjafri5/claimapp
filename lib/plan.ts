import type { User } from "@/lib/db/schema";

export const FREE_CARD_LIMIT = 1;

export function isPro(user: Pick<User, "plan">): boolean {
  return user.plan === "pro";
}

export function canAddCards(
  user: Pick<User, "plan">,
  count: number
): boolean {
  return isPro(user) || count <= FREE_CARD_LIMIT;
}
