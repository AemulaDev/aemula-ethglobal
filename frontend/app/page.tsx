import { redirect } from "next/navigation";

// might build a landing later, but just pushing to /read page for now
export default function Page() {
  redirect("/read");
};