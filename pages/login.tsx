import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    router.push("/admin/trade-new");
  }

  return (
    <div className="max-w-sm mx-auto card p-6">
      <h2 className="text-lg font-medium mb-4">Увійти (адмін)</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Пароль</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="btn" type="submit">Увійти</button>
      </form>
      <p className="text-neutral-400 text-xs mt-3">Немає акаунта? Зареєструйся нижче.</p>
      <RegisterForm />
    </div>
  );
}

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="space-y-3 mt-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signUp({ email, password });
        setMsg(error ? error.message : "Реєстрація ок. Увійди вище.");
      }}
    >
      <div>
        <label className="label">Email</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="label">Пароль</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {msg && <p className="text-neutral-400 text-sm">{msg}</p>}
      <button className="btn" type="submit">Зареєструватись</button>
    </form>
  );
}
