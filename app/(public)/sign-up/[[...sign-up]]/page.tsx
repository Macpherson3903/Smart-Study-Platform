import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-6">
      <SignUp
        appearance={{
          elements: {
            card: "shadow-none border border-slate-200",
          },
        }}
      />
    </main>
  );
}
