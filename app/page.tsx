import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function RootPage() {
  const store = await cookies();
  const userId = store.get("demo_user_id")?.value;
  redirect(userId ? "/recipes" : "/login");
}
