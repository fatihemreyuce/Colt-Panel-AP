import { useDashboard } from "@/hooks/use-dashboard";
import { useComponents } from "@/hooks/use-components";
import { useNotificationSubscribers } from "@/hooks/use-notification-subscribers";
import { usePages } from "@/hooks/use-page";
import { useContactForms } from "@/hooks/use-contact-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	BarChart,
	Bar,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	PieChart,
	Pie,
	LabelList,
} from "recharts";
import {
	FileText,
	Mail,
	Box,
	MessageSquare,
	Loader2,
	ArrowRight,
	TrendingUp,
	LayoutDashboard,
	Activity,
	Sparkles,
	Zap,
	ChevronRight,
	Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatDate = (dateString: string | undefined): string => {
	if (!dateString) return "-";
	try {
		return new Date(dateString).toLocaleDateString("tr-TR", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return "-";
	}
};

export default function DashboardPage() {
	const { data: dashboard, isLoading, isError } = useDashboard();
	const { data: componentsPage } = useComponents("", 0, 5, "id,DESC");
	const { data: subscribersPage } = useNotificationSubscribers(0, 5, "id,DESC");
	const { data: pagesPage } = usePages("", "", 0, 5, "id,DESC");
	const { data: contactFormsPage } = useContactForms("", 0, 5, "id,DESC");
	const navigate = useNavigate();

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-12 w-12 animate-spin text-primary" />
					<p className="text-sm font-medium text-muted-foreground">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (isError || !dashboard) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<Card className="max-w-md w-full border-2">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Hata Oluştu</CardTitle>
						<CardDescription>
							Dashboard verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	// Chart data
	const statsData = [
		{
			name: "Sayfalar",
			value: pagesPage?.totalElements ?? dashboard.totalPages,
			icon: FileText,
			color: "hsl(var(--chart-1))",
			path: "/pages",
		},
		{
			name: "Bildirim Aboneleri",
			value: subscribersPage?.totalElements ?? dashboard.totalNotificationSubscribers,
			icon: Mail,
			color: "hsl(var(--chart-2))",
			path: "/notification-subscribers",
		},
		{
			name: "Bileşenler",
			value: componentsPage?.totalElements ?? dashboard.totalComponents,
			icon: Box,
			color: "hsl(var(--chart-3))",
			path: "/components",
		},
		{
			name: "İletişim Formları",
			value: contactFormsPage?.totalElements ?? dashboard.totalContactForms,
			icon: MessageSquare,
			color: "hsl(var(--chart-4))",
			path: "/contact-forms",
		},
	];

	const barChartData = statsData.map((stat) => ({
		name: stat.name,
		value: stat.value,
		fill: stat.color,
	}));

	// Recent items (last 5)
	const recentPages = pagesPage?.content?.slice(0, 5) || dashboard.pages?.slice(0, 5) || [];
	const recentNotificationSubscribers =
		subscribersPage?.content?.slice(0, 5) ||
		dashboard.notificationSubscribers?.slice(0, 5) ||
		[];
	const recentComponents =
		componentsPage?.content?.slice(0, 5) || dashboard.components?.slice(0, 5) || [];
	const recentContactForms =
		contactFormsPage?.content?.slice(0, 5) || dashboard.contactForms?.slice(0, 5) || [];

	return (
		<div className="flex-1 space-y-8 p-8 bg-gradient-to-br from-background via-background/95 to-muted/10 min-h-screen">
			{/* Header Section */}
			<div className="flex flex-col space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
							<div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 border border-primary/30 shadow-lg backdrop-blur-sm">
								<LayoutDashboard className="h-7 w-7 text-primary" />
							</div>
						</div>
						<div className="space-y-1">
							<h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80 bg-clip-text text-transparent">
								Kontrol Paneli
							</h1>
							<p className="text-muted-foreground text-base flex items-center gap-2">
								<Activity className="h-4 w-4" />
								Sistem özeti ve gerçek zamanlı istatistikler
							</p>
						</div>
					</div>
					<div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
						<Sparkles className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium text-muted-foreground">Canlı Veri</span>
					</div>
				</div>
			</div>

			{/* Stats Cards - Enhanced */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{statsData.map((stat, index) => {
					const Icon = stat.icon;
					const colors = [
						"from-blue-500/20 via-blue-500/10 to-transparent",
						"from-emerald-500/20 via-emerald-500/10 to-transparent",
						"from-purple-500/20 via-purple-500/10 to-transparent",
						"from-orange-500/20 via-orange-500/10 to-transparent",
					];
					const borderColors = [
						"border-blue-500/30",
						"border-emerald-500/30",
						"border-purple-500/30",
						"border-orange-500/30",
					];
					const iconColors = [
						"text-blue-500",
						"text-emerald-500",
						"text-purple-500",
						"text-orange-500",
					];
					
					return (
						<Card
							key={stat.name}
							className={`group relative overflow-hidden border-2 ${borderColors[index]} shadow-xl bg-gradient-to-br ${colors[index]} backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer`}
							onClick={() => navigate(stat.path)}
						>
							{/* Animated background gradient */}
							<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							
							<CardHeader className="pb-4 relative z-10">
								<div className="flex items-center justify-between">
									<div className={`p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border ${borderColors[index]} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
										<Icon className={`h-6 w-6 ${iconColors[index]}`} />
									</div>
									<div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
										<TrendingUp className="h-3.5 w-3.5 text-primary" />
										<span className="text-xs font-semibold text-primary">Aktif</span>
									</div>
								</div>
							</CardHeader>
							<CardContent className="relative z-10">
								<div className="space-y-2">
									<p className="text-4xl font-bold text-foreground tracking-tight">{stat.value}</p>
									<p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.name}</p>
									<div className="flex items-center gap-2 pt-2">
										<span className="text-xs text-muted-foreground">Detayları görüntüle</span>
										<ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform duration-300" />
									</div>
								</div>
							</CardContent>
							
							{/* Shine effect on hover */}
							<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
						</Card>
					);
				})}
			</div>

			{/* Charts Row - Enhanced */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Column Chart - Shadcn style */}
				<Card className="group relative overflow-hidden border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl hover:shadow-3xl transition-all duration-500">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
					
					<CardHeader className="relative z-10 bg-gradient-to-r from-primary/15 via-primary/8 to-transparent border-b-2 border-primary/20">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shadow-lg">
									<Activity className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-xl font-bold flex items-center gap-2">
										Veri Trend Analizi
										<Zap className="h-4 w-4 text-primary" />
									</CardTitle>
									<CardDescription className="text-sm flex items-center gap-1.5 mt-1">
										<Clock className="h-3.5 w-3.5" />
										Son 3 ay için toplam veriler
									</CardDescription>
								</div>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6 relative z-10">
						<ChartContainer
							config={{
								Sayfalar: { label: "Sayfalar", color: "hsl(var(--chart-1))" },
								"Bildirim Aboneleri": {
									label: "Bildirim Aboneleri",
									color: "hsl(var(--chart-2))",
								},
								Bileşenler: { label: "Bileşenler", color: "hsl(var(--chart-3))" },
								"İletişim Formları": {
									label: "İletişim Formları",
									color: "hsl(var(--chart-4))",
								},
							}}
							className="h-[320px] w-full"
						>
							<BarChart data={barChartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} vertical={false} />
								<XAxis
									dataKey="name"
									stroke="hsl(var(--muted-foreground))"
									fontSize={12}
									tickLine={false}
									axisLine={false}
									tick={{ fill: "hsl(var(--muted-foreground))" }}
								/>
								<YAxis
									stroke="hsl(var(--muted-foreground))"
									fontSize={12}
									tickLine={false}
									axisLine={false}
									allowDecimals={false}
									tickFormatter={(value) => Math.round(value as number).toString()}
									tick={{ fill: "hsl(var(--muted-foreground))" }}
								/>
								<ChartTooltip
									content={<ChartTooltipContent className="rounded-lg border bg-card shadow-lg" />}
								/>
								<Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
									{barChartData.map((entry, index) => (
										<Cell
											key={`trend-bar-${index}`}
											fill={entry.fill}
											className="transition-opacity duration-200 hover:opacity-80"
										/>
									))}
									<LabelList
										dataKey="value"
										position="top"
										offset={10}
										style={{
											fill: "hsl(var(--foreground))",
											fontSize: 12,
											fontWeight: 600,
										}}
									/>
								</Bar>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* Donut Chart - Category distribution */}
				<Card className="group relative overflow-hidden border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl hover:shadow-3xl transition-all duration-500">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
					
					<CardHeader className="relative z-10 bg-gradient-to-r from-primary/15 via-primary/8 to-transparent border-b-2 border-primary/20">
						<div className="flex items-center gap-3">
							<div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shadow-lg">
								<BarChart className="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle className="text-xl font-bold flex items-center gap-2">
									Kategori Dağılımı
									<TrendingUp className="h-4 w-4 text-primary" />
								</CardTitle>
								<CardDescription className="text-sm flex items-center gap-1.5 mt-1">
									<Activity className="h-3.5 w-3.5" />
									Kategorilerin toplam içindeki payı
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6 relative z-10">
						<ChartContainer
							config={{
								Sayfalar: { label: "Sayfalar", color: "hsl(var(--chart-1))" },
								"Bildirim Aboneleri": {
									label: "Bildirim Aboneleri",
									color: "hsl(var(--chart-2))",
								},
								Bileşenler: { label: "Bileşenler", color: "hsl(var(--chart-3))" },
								"İletişim Formları": {
									label: "İletişim Formları",
									color: "hsl(var(--chart-4))",
								},
							}}
							className="h-[320px] w-full items-center justify-center"
						>
							<PieChart>
								<Pie
									data={barChartData}
									dataKey="value"
									nameKey="name"
									innerRadius={70}
									outerRadius={110}
									paddingAngle={3}
									stroke="transparent"
								>
									{barChartData.map((entry, index) => (
										<Cell
											key={`pie-cell-${index}`}
											fill={entry.fill}
											className="transition-opacity duration-200 hover:opacity-80"
										/>
									))}
									<LabelList
										dataKey="value"
										position="outside"
										offset={8}
										style={{
											fill: "hsl(var(--foreground))",
											fontSize: 11,
											fontWeight: 500,
										}}
									/>
								</Pie>
								<ChartTooltip
									content={
										<ChartTooltipContent
											className="rounded-lg border bg-card shadow-lg"
											nameKey="name"
										/>
									}
								/>
							</PieChart>
						</ChartContainer>
					</CardContent>
				</Card>
			</div>

			{/* Recent Items - Enhanced */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{/* Recent Pages */}
				<Card className="group relative overflow-hidden border-2 border-primary/20 shadow-xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
					
					<CardHeader className="relative z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/30">
									<FileText className="h-4 w-4 text-blue-500" />
								</div>
								<CardTitle className="text-base font-bold">Son Sayfalar</CardTitle>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									navigate("/pages");
								}}
								className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary transition-all duration-200 group/btn"
							>
								Tümü
								<ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform duration-200" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="pt-4 relative z-10">
						{recentPages.length > 0 ? (
							<div className="space-y-2.5">
								{recentPages.map((page, index) => (
									<div
										key={page.id || `page-${index}`}
										className="group/item p-3 rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 to-transparent hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-[1.02]"
										onClick={() => navigate(`/pages/detail/${page.id}`)}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<p className="text-sm font-semibold text-foreground truncate group-hover/item:text-primary transition-colors duration-200">
													{page.name}
												</p>
												<p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
													<Clock className="h-3 w-3" />
													{formatDate(page.createdAt)}
												</p>
											</div>
											<ChevronRight className="h-4 w-4 text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-1 transition-all duration-200 flex-shrink-0" />
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="p-3 rounded-full bg-muted/50 mb-3">
									<FileText className="h-6 w-6 text-muted-foreground" />
								</div>
								<p className="text-sm text-muted-foreground font-medium">
									Henüz sayfa eklenmemiş
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Recent Notification Subscribers */}
				<Card className="group relative overflow-hidden border-2 border-primary/20 shadow-xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
					
					<CardHeader className="relative z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border border-emerald-500/30">
									<Mail className="h-4 w-4 text-emerald-500" />
								</div>
								<CardTitle className="text-base font-bold">Son Aboneler</CardTitle>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									navigate("/notification-subscribers");
								}}
								className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary transition-all duration-200 group/btn"
							>
								Tümü
								<ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform duration-200" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="pt-4 relative z-10">
						{recentNotificationSubscribers.length > 0 ? (
							<div className="space-y-2.5">
								{recentNotificationSubscribers.map((subscriber, index) => (
									<div
										key={subscriber.id || `subscriber-${index}`}
										className="group/item p-3 rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 to-transparent hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-[1.02]"
										onClick={() => navigate(`/notification-subscribers/detail/${subscriber.id}`)}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<p className="text-sm font-semibold text-foreground truncate group-hover/item:text-primary transition-colors duration-200">
													{subscriber.email}
												</p>
												<p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
													<Clock className="h-3 w-3" />
													{formatDate((subscriber as any).createdAt)}
												</p>
											</div>
											<ChevronRight className="h-4 w-4 text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-1 transition-all duration-200 flex-shrink-0" />
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="p-3 rounded-full bg-muted/50 mb-3">
									<Mail className="h-6 w-6 text-muted-foreground" />
								</div>
								<p className="text-sm text-muted-foreground font-medium">
									Henüz abone eklenmemiş
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Recent Components */}
				<Card className="group relative overflow-hidden border-2 border-primary/20 shadow-xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
					
					<CardHeader className="relative z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/30">
									<Box className="h-4 w-4 text-purple-500" />
								</div>
								<CardTitle className="text-base font-bold">Son Bileşenler</CardTitle>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									navigate("/components");
								}}
								className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary transition-all duration-200 group/btn"
							>
								Tümü
								<ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform duration-200" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="pt-4 relative z-10">
						{recentComponents.length > 0 ? (
							<div className="space-y-2.5">
								{recentComponents.map((component, index) => {
									// Component name veya localizations'dan title çek
									const turkishLoc = component.localizations?.find(
										(loc) => loc.languageCode?.toLowerCase() === "tr"
									);
									const defaultLoc = component.localizations?.[0];

									const displayName =
										component.name?.trim() ||
										turkishLoc?.title?.trim() ||
										defaultLoc?.title?.trim() ||
										(component.id
											? `Bileşen #${component.id}`
											: `Bileşen #${index + 1}`);

									return (
										<div
											key={component.id || `component-${index}`}
											className="group/item p-3 rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 to-transparent hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-[1.02]"
											onClick={() => component.id && navigate(`/components/detail/${component.id}`)}
										>
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold text-foreground truncate group-hover/item:text-primary transition-colors duration-200">
														{displayName}
													</p>
													<p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
														<Clock className="h-3 w-3" />
														{formatDate((component as any).createdAt)}
													</p>
												</div>
												<ChevronRight className="h-4 w-4 text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-1 transition-all duration-200 flex-shrink-0" />
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="p-3 rounded-full bg-muted/50 mb-3">
									<Box className="h-6 w-6 text-muted-foreground" />
								</div>
								<p className="text-sm text-muted-foreground font-medium">
									Henüz bileşen eklenmemiş
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Recent Contact Forms */}
				<Card className="group relative overflow-hidden border-2 border-primary/20 shadow-xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
					
					<CardHeader className="relative z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/10 border border-orange-500/30">
									<MessageSquare className="h-4 w-4 text-orange-500" />
								</div>
								<CardTitle className="text-base font-bold">Son Formlar</CardTitle>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									navigate("/contact-forms");
								}}
								className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary transition-all duration-200 group/btn"
							>
								Tümü
								<ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform duration-200" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="pt-4 relative z-10">
						{recentContactForms.length > 0 ? (
							<div className="space-y-2.5">
								{recentContactForms.map((form, index) => (
									<div
										key={form.id || `form-${index}`}
										className="group/item p-3 rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 to-transparent hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-[1.02]"
										onClick={() => navigate(`/contact-forms/detail/${form.id}`)}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<p className="text-sm font-semibold text-foreground truncate group-hover/item:text-primary transition-colors duration-200">
													{form.firstname && form.lastname 
														? `${form.firstname} ${form.lastname}` 
														: form.companyMail || form.companyName || "İsimsiz Form"}
												</p>
												<p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
													<Clock className="h-3 w-3" />
													{formatDate((form as any).createdAt)}
												</p>
											</div>
											<ChevronRight className="h-4 w-4 text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-1 transition-all duration-200 flex-shrink-0" />
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="p-3 rounded-full bg-muted/50 mb-3">
									<MessageSquare className="h-6 w-6 text-muted-foreground" />
								</div>
								<p className="text-sm text-muted-foreground font-medium">
									Henüz form gönderilmemiş
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
