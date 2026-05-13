import { useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import { assets } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { QrCode, ScanLine, Printer, Download, Search, Package, MapPin, User } from "lucide-react";
import { toast } from "sonner";

export default function QRTracking() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [scanInput, setScanInput] = useState("");
  const [scanned, setScanned] = useState<string | null>(null);
  const [tagSize, setTagSize] = useState<"sm" | "md" | "lg">("md");
  const [selectedAsset, setSelectedAsset] = useState(assets[0]?.id ?? "");
  const printRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const filtered = useMemo(
    () =>
      assets.filter(
        (a) =>
          !search ||
          [a.id, a.name, a.serialNumber, a.qrCode].some((v) =>
            v?.toLowerCase().includes(search.toLowerCase())
          )
      ),
    [search]
  );

  const scannedAsset = useMemo(
    () => assets.find((a) => a.id === scanned || a.qrCode === scanned || a.serialNumber === scanned),
    [scanned]
  );

  const sizePx = tagSize === "sm" ? 96 : tagSize === "md" ? 128 : 168;

  const doScan = () => {
    if (!scanInput.trim()) return;
    const found = assets.find(
      (a) =>
        a.id.toLowerCase() === scanInput.trim().toLowerCase() ||
        a.qrCode.toLowerCase() === scanInput.trim().toLowerCase() ||
        a.serialNumber.toLowerCase() === scanInput.trim().toLowerCase()
    );
    if (found) {
      setScanned(found.id);
      toast.success(`Asset matched: ${found.name}`);
    } else {
      setScanned(null);
      toast.error("No asset found for that code");
    }
  };

  const simulateScan = () => {
    const random = assets[Math.floor(Math.random() * assets.length)];
    setScanInput(random.qrCode);
    setScanned(random.id);
    toast.success(`Scanned: ${random.name}`);
  };

  const downloadQR = (id: string) => {
    const canvas = document.querySelector<HTMLCanvasElement>(`canvas[data-qr="${id}"]`);
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.png`;
    a.click();
  };

  const printTags = () => {
    const html = printRef.current?.innerHTML;
    if (!html) return;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(`
      <html><head><title>Asset Tags</title>
      <style>
        body{font-family:system-ui;background:#fff;color:#000;padding:16px}
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .tag{border:1.5px dashed #333;border-radius:10px;padding:12px;text-align:center;break-inside:avoid}
        .tag p{margin:4px 0;font-size:11px}
        .tag .name{font-weight:700;font-size:13px}
      </style></head><body><div class="grid">${html}</div></body></html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span className="icon-glow w-9 h-9 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </span>
            QR & Barcode Tracking
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate, scan and print asset tags for fast field tracking.
          </p>
        </div>
      </div>

      <Tabs defaultValue="scan" className="space-y-4">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="scan" className="gap-2"><ScanLine className="w-4 h-4" /> Scanner</TabsTrigger>
          <TabsTrigger value="generate" className="gap-2"><QrCode className="w-4 h-4" /> Generate Tags</TabsTrigger>
          <TabsTrigger value="print" className="gap-2"><Printer className="w-4 h-4" /> Print Sheet</TabsTrigger>
        </TabsList>

        {/* Scanner */}
        <TabsContent value="scan" className="grid lg:grid-cols-2 gap-4">
          <div className="vision-card p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Scan asset code</h3>
              <p className="text-xs text-muted-foreground">Type or paste an asset ID, QR or serial number.</p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. AST-001 or QR-AST-001"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doScan()}
                className="font-mono"
              />
              <Button onClick={doScan} className="gap-2"><ScanLine className="w-4 h-4" /> Scan</Button>
            </div>
            <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-8 text-center">
              <ScanLine className="w-10 h-10 text-primary mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground mb-3">Camera scanning coming soon</p>
              <Button variant="outline" size="sm" onClick={simulateScan}>Simulate camera scan</Button>
            </div>
          </div>

          <div className="vision-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Scan result</h3>
            {scannedAsset ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shrink-0">
                    <QRCodeSVG value={scannedAsset.qrCode} size={96} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-foreground truncate">{scannedAsset.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{scannedAsset.id}</p>
                    <Badge className="mt-2 capitalize">{scannedAsset.status}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Row icon={Package} label="Category" value={scannedAsset.category} />
                  <Row icon={MapPin} label="Department" value={scannedAsset.department || "—"} />
                  <Row icon={User} label="Assignee" value={scannedAsset.assignee || "Unassigned"} />
                  <Row icon={QrCode} label="Serial" value={scannedAsset.serialNumber} mono />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Scan a code to view asset details</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Generate */}
        <TabsContent value="generate" className="space-y-4">
          <div className="vision-card p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search assets by name, ID, serial..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Tag size</span>
              <Select value={tagSize} onValueChange={(v: any) => setTagSize(v)}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline">{filtered.length} assets</Badge>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((a) => (
              <div key={a.id} className="vision-card vision-card-hover p-4 flex flex-col items-center text-center">
                <div className="bg-white p-3 rounded-xl mb-3">
                  <QRCodeCanvas value={a.qrCode} size={sizePx} data-qr={a.id} includeMargin={false} />
                </div>
                <p className="text-sm font-bold text-foreground truncate w-full">{a.name}</p>
                <p className="text-[11px] text-muted-foreground font-mono">{a.id}</p>
                <Badge variant="outline" className="mt-1 text-[10px] capitalize">{a.category}</Badge>
                <Button variant="outline" size="sm" className="mt-3 w-full gap-2" onClick={() => downloadQR(a.id)}>
                  <Download className="w-3.5 h-3.5" /> PNG
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Print sheet */}
        <TabsContent value="print" className="space-y-4">
          <div className="vision-card p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Quick add:</span>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.id} — {a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={printTags} className="gap-2"><Printer className="w-4 h-4" /> Print sheet</Button>
          </div>

          <div className="vision-card p-6">
            <p className="text-sm text-muted-foreground mb-4">A4 print preview — 3 columns, dashed cut lines</p>
            <div ref={printRef} className="grid grid-cols-3 gap-3">
              {assets.map((a) => (
                <div key={a.id} className="tag border-2 border-dashed border-border rounded-lg p-3 flex flex-col items-center text-center bg-white text-black">
                  <QRCodeSVG value={a.qrCode} size={92} />
                  <p className="name font-bold text-[13px] mt-2">{a.name}</p>
                  <p className="text-[11px] font-mono">{a.id}</p>
                  <p className="text-[10px] text-gray-600">{a.serialNumber}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
      <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-sm text-foreground truncate ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
