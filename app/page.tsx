import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log("Session on home page:", session);
  if (session) {
    if (session.user.role === "OWNER") {
      redirect("/owner/dashboard");
    }
    redirect("/dashboard");
  }

  redirect("/login");
}
