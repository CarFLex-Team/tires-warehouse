import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    if (session.user.role === "OWNER") {
      redirect("/owner/dashboard");
    }
    redirect("/dashboard");
  }

  redirect("/login");
}
