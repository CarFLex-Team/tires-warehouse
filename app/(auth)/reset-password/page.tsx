import { Suspense } from "react";
import ResetPassword from "../../../components/ClientRender/ResetPassword";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ResetPassword />
    </Suspense>
  );
}
