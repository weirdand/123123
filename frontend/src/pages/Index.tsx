import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus, LogIn, Globe } from "lucide-react";

const t = {
  en: {
    signIn: "Sign In",
    registration: "Registration",
    email: "Email",
    login: "Login",
    password: "Password",
    createAccount: "Create Account",
    noAccount: "No account? Register",
    hasAccount: "Already have an account? Sign in",
  },
  ru: {
    signIn: "Вход",
    registration: "Регистрация",
    email: "Почта",
    login: "Логин",
    password: "Пароль",
    createAccount: "Создать аккаунт",
    noAccount: "Нет аккаунта? Зарегистрируйтесь",
    hasAccount: "Уже есть аккаунт? Войдите",
  },
};

type Lang = keyof typeof t;

const Index = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", login: "", password: "" });
  const [lang, setLang] = useState<Lang>("ru");

  const l = t[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/soft");
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <span className="text-4xl font-black tracking-tight text-foreground">Ferma</span>
          <span className="text-4xl font-black tracking-tight text-gradient-neon">Zak</span>
        </div>

        {/* Auth Card */}
        <div className="relative rounded-2xl p-8 bg-card/40 backdrop-blur-xl border border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.15),inset_0_1px_0_hsl(210_40%_95%/0.06)]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.06] via-transparent to-accent/[0.04] pointer-events-none" />

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "ru" ? "en" : "ru")}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors z-10"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "ru" ? "EN" : "RU"}
          </button>

          <h2 className="relative text-lg font-semibold text-foreground text-center mb-6 tracking-[0.2em] uppercase">
            {isLogin ? l.signIn : l.registration}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  {l.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-secondary/50 border-border/50 focus:border-primary/50 font-mono text-sm placeholder:text-muted-foreground/50"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="login" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                {l.login}
              </Label>
              <Input
                id="login"
                type="text"
                placeholder="username"
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                className="bg-secondary/50 border-border/50 focus:border-primary/50 font-mono text-sm placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                {l.password}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="bg-secondary/50 border-border/50 focus:border-primary/50 font-mono text-sm pr-10 placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-mono text-sm tracking-widest uppercase neon-glow-green gap-2"
            >
              {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {isLogin ? l.signIn : l.createAccount}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? l.noAccount : l.hasAccount}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] font-mono text-muted-foreground/50 mt-4">
          FERMAZAK CONTROL v1
        </p>
      </div>
    </div>
  );
};

export default Index;
