import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Box, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";


const SCRIPTS = [
  { id: 1, name: "AutoScroll Pro", desc: "Продвинутый скроллинг с имитацией человеческого поведения", price: "$29/мес" },
  { id: 2, name: "MassFollow Engine", desc: "Массовая подписка/отписка с умными фильтрами", price: "$19/мес" },
  { id: 3, name: "ContentBot AI", desc: "ИИ-генерация комментариев и подписей", price: "$39/мес" },
  { id: 4, name: "StoryViewer X", desc: "Массовый просмотр сторис с трекингом вовлечённости", price: "$15/мес" },
  { id: 5, name: "DM Blaster", desc: "Автоматические рассылки в личные сообщения", price: "$49/мес" },
  { id: 6, name: "HashTag Analyzer", desc: "Анализ эффективности хэштегов в реальном времени", price: "$12/мес" },
];

const HARDWARE = [
  { id: 101, name: "FZ-10 Device Box", desc: "Компактный бокс на 10 слотов с системой охлаждения", price: "$499" },
  { id: 102, name: "FZ-20 Pro Farm", desc: "Профессиональная стойка на 20 слотов с OTG хабом и управлением питанием", price: "$1,199" },
  { id: 103, name: "FZ-50 Enterprise", desc: "Корпоративная стойка на 50 слотов, жидкостное охлаждение, удалённое управление", price: "$3,499" },
  { id: 104, name: "OTG Hub X16", desc: "16-портовый USB OTG хаб с индивидуальными выключателями", price: "$149" },
];

type PurchaseItem = { name: string; price: string } | null;

export default function ShopPanel() {
  
  const [purchaseItem, setPurchaseItem] = useState<PurchaseItem>(null);

  const ItemCard = ({ item, type }: { item: { id: number; name: string; desc: string; price: string }; type: "script" | "hardware" }) => (
    <motion.div whileHover={{ scale: 1.005 }} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-secondary/20 hover:border-primary/40 transition-all duration-200 group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {type === "script" ? <Code2 className="w-5 h-5 text-primary/60 shrink-0" /> : <Box className="w-5 h-5 text-primary/60 shrink-0" />}
        <div className="min-w-0">
          <h3 className="font-mono text-sm text-foreground font-bold">{item.name}</h3>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-sm text-primary font-bold">{item.price}</span>
        <Button size="sm" onClick={() => setPurchaseItem({ name: item.name, price: item.price })} className="font-mono text-[10px] tracking-widest uppercase bg-primary/10 text-primary border border-primary/40 hover:bg-primary hover:text-background transition-all duration-300 hover:shadow-[0_0_16px_hsl(var(--primary)/0.3)]">
          {type === "hardware" ? "Заказать" : "Купить"}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-5" style={{ minHeight: "calc(100vh - 7rem)" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-border bg-secondary/40 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            <h2 className="font-mono text-sm text-primary tracking-widest uppercase">Скрипты</h2>
          </div>
          <div className="p-4 flex-1 overflow-auto space-y-3">
            {SCRIPTS.map((s) => <ItemCard key={s.id} item={s} type="script" />)}
          </div>
        </div>
        <div className="glass rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-border bg-secondary/40 flex items-center gap-2">
            <Box className="w-4 h-4 text-primary" />
            <h2 className="font-mono text-sm text-primary tracking-widest uppercase">Оборудование</h2>
          </div>
          <div className="p-4 flex-1 overflow-auto space-y-3">
            {HARDWARE.map((h) => <ItemCard key={h.id} item={h} type="hardware" />)}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {purchaseItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md" onClick={() => setPurchaseItem(null)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} onClick={(e) => e.stopPropagation()} className="relative w-[400px] max-w-[90vw] glass rounded-2xl border border-primary/30 shadow-[0_0_40px_hsl(var(--primary)/0.15)] overflow-hidden">
              <button onClick={() => setPurchaseItem(null)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="px-6 py-4 border-b border-border bg-secondary/40">
                <h3 className="font-mono text-sm text-primary tracking-widest uppercase">Оплата</h3>
                <p className="font-mono text-xs text-muted-foreground mt-1">{purchaseItem.name}</p>
              </div>
              <div className="p-6 flex flex-col items-center gap-5">
                <span className="font-mono text-3xl font-bold text-primary">{purchaseItem.price}</span>
                <div className="w-48 h-48 rounded-xl border-2 border-primary/30 bg-secondary/40 flex items-center justify-center relative overflow-hidden">
                  <QrCode className="w-24 h-24 text-primary/40" />
                  <motion.div className="absolute inset-0 border border-primary/20 rounded-xl pointer-events-none" animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Сканируйте QR для оплаты криптой</p>
                  <p className="font-mono text-[9px] text-muted-foreground/60">Принимаем BTC · ETH · USDT</p>
                </div>
                <div className="w-full grid grid-cols-3 gap-2">
                  {["BTC", "ETH", "USDT"].map((coin) => (
                    <button key={coin} className="font-mono text-[10px] py-2 rounded-lg border border-border/40 bg-secondary/30 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all duration-200 tracking-widest">{coin}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
