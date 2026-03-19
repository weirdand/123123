import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Crown, Zap, Shield, Lock, Smartphone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const PLANS = [
  { name: "Starter", price: "$9", period: "/мес", features: ["5 устройств", "Базовые скрипты", "Поддержка по Email"], current: false, icon: Shield },
  { name: "Pro", price: "$29", period: "/мес", features: ["20 устройств", "Все скрипты", "Приоритетная поддержка", "Аналитика"], current: true, icon: Zap },
  { name: "Ultimate", price: "$79", period: "/мес", features: ["Безлимит устройств", "Свои скрипты", "Личный менеджер", "API доступ", "White Label"], current: false, icon: Crown },
];

export default function SettingsPanel() {
  const [twoFA, setTwoFA] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-5" style={{ minHeight: "calc(100vh - 7rem)" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="flex flex-col gap-5">
          <div className="glass rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-secondary/40">
              <h2 className="font-mono text-sm text-primary tracking-widest uppercase">Аккаунт</h2>
            </div>
            <div className="p-5 flex flex-col items-center gap-5">
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-primary/40">
                  <AvatarFallback className="bg-secondary/80 text-primary font-mono text-xl">FZ</AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary border-2 border-background" />
              </div>
              <div className="w-full space-y-3">
                <InfoRow icon={User} label="Имя пользователя" value="fermazak_admin" />
                <InfoRow icon={Mail} label="Почта" value="admin@fermazak.io" />
                <InfoRow icon={Zap} label="Текущий план" value="Pro" highlight />
              </div>
            </div>
          </div>
          <div className="glass rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-secondary/40 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <h2 className="font-mono text-sm text-primary tracking-widest uppercase">Безопасность</h2>
            </div>
            <div className="p-5 space-y-5">
              <div className="space-y-3">
                <h3 className="font-mono text-xs text-muted-foreground tracking-widest uppercase">Смена пароля</h3>
                <PasswordField placeholder="Старый пароль" />
                <PasswordField placeholder="Новый пароль" />
                <PasswordField placeholder="Подтвердите пароль" />
                <Button size="sm" className="w-full font-mono text-[10px] tracking-widest uppercase bg-primary/10 text-primary border border-primary/40 hover:bg-primary hover:text-background transition-all duration-300 hover:shadow-[0_0_16px_hsl(var(--primary)/0.3)]">Обновить пароль</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-secondary/20">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="font-mono text-sm text-foreground block">Двухфакторная аутентификация</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{twoFA ? "Включена — дополнительная защита активна" : "Выключена — включите для дополнительной защиты"}</span>
                  </div>
                </div>
                <Switch checked={twoFA} onCheckedChange={setTwoFA} />
              </div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-border bg-secondary/40">
            <h2 className="font-mono text-sm text-primary tracking-widest uppercase">Подписка</h2>
          </div>
          <div className="p-5 flex-1 space-y-4">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              return (
                <motion.div key={plan.name} whileHover={{ scale: 1.01 }} className={`relative rounded-xl p-5 border transition-all duration-300 ${plan.current ? "border-primary/60 bg-primary/[0.06] shadow-[0_0_20px_hsl(var(--primary)/0.12)]" : "border-border/40 bg-secondary/20 hover:border-border"}`}>
                  {plan.current && <motion.div className="absolute inset-0 rounded-xl border border-primary/30 pointer-events-none" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${plan.current ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`font-mono text-sm font-bold ${plan.current ? "text-primary" : "text-muted-foreground"}`}>{plan.name}</span>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className={`font-mono text-xl font-bold ${plan.current ? "text-primary" : "text-muted-foreground"}`}>{plan.price}</span>
                      <span className="font-mono text-xs text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {plan.features.map((f) => (
                      <span key={f} className="font-mono text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-secondary/50 border border-border/30">{f}</span>
                    ))}
                  </div>
                  {plan.current && <span className="absolute top-3 right-3 font-mono text-[9px] text-primary tracking-widest uppercase animate-pulse">Текущий план</span>}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value, highlight }: { icon: typeof User; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/40 border border-border/40">
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase block">{label}</span>
        <span className={`font-mono text-sm ${highlight ? "text-primary font-bold" : "text-foreground"}`}>{value}</span>
      </div>
    </div>
  );
}

function PasswordField({ placeholder }: { placeholder: string }) {
  return <Input type="password" placeholder={placeholder} className="font-mono text-sm bg-secondary/30 border-border/40 focus:border-primary/60 focus:ring-primary/20" />;
}
