import { useDashboard } from "@/hooks/use-dashboard";
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
	AreaChart,
	Area,
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
			value: dashboard.totalPages,
			icon: FileText,
			color: "hsl(var(--chart-1))",
			path: "/pages",
		},
		{
			name: "Bildirim Aboneleri",
			value: dashboard.totalNotificationSubscribers,
			icon: Mail,
			color: "hsl(var(--chart-2))",
			path: "/notification-subscribers",
		},
		{
			name: "Bileşenler",
			value: dashboard.totalComponents,
			icon: Box,
			color: "hsl(var(--chart-3))",
			path: "/components",
		},
		{
			name: "İletişim Formları",
			value: dashboard.totalContactForms,
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
	const recentPages = dashboard.pages?.slice(0, 5) || [];
	const recentNotificationSubscribers = dashboard.notificationSubscribers?.slice(0, 5) || [];
	const recentComponents = dashboard.components?.slice(0, 5) || [];
	const recentContactForms = dashboard.contactForms?.slice(0, 5) || [];

	return (
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<LayoutDashboard className="h-6 w-6 text-primary" />
						</div>
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Kontrol Paneli
						</h1>
					</div>
					<p className="text-muted-foreground ml-[52px] text-sm">
						Sistem özeti ve istatistikler
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{statsData.map((stat) => {
					const Icon = stat.icon;
					return (
						<Card
							key={stat.name}
							className="border-2 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
							onClick={() => navigate(stat.path)}
						>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
										<Icon className="h-5 w-5 text-primary" />
									</div>
									<TrendingUp className="h-4 w-4 text-muted-foreground" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-1">
									<p className="text-3xl font-bold text-foreground">{stat.value}</p>
									<p className="text-sm text-muted-foreground font-medium">{stat.name}</p>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Charts Row */}
			<div className="grid gap-4 md:grid-cols-2">
				{/* Area Chart - Interactive */}
				<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm">
					<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-primary/10">
									<BarChart className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-lg font-bold">Area Chart - Interactive</CardTitle>
									<CardDescription className="text-xs">Son 3 ay için toplam veriler</CardDescription>
								</div>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<ChartContainer
							config={{
								value: {
									label: "Değer",
								},
							}}
							className="h-[300px] w-full"
						>
							<AreaChart data={barChartData} width={undefined} height={300}>
								<defs>
									<linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
										<stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
								<XAxis
									dataKey="name"
									stroke="hsl(var(--muted-foreground))"
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									stroke="hsl(var(--muted-foreground))"
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<ChartTooltip content={<ChartTooltipContent />} />
								<Area
									type="monotone"
									dataKey="value"
									stroke="hsl(var(--chart-1))"
									fillOpacity={1}
									fill="url(#colorValue)"
								/>
							</AreaChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* Horizontal Bar Chart */}
				<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm">
					<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-primary/10">
								<BarChart className="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg font-bold">Bar Chart - Horizontal</CardTitle>
								<CardDescription className="text-xs">Kategorilerin yatay karşılaştırması</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<ChartContainer
							config={{
								value: {
									label: "Değer",
								},
							}}
							className="h-[300px] w-full"
						>
							<BarChart
								data={barChartData}
								layout="vertical"
								width={undefined}
								height={300}
							>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
								<XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
								<YAxis
									dataKey="name"
									type="category"
									stroke="hsl(var(--muted-foreground))"
									fontSize={12}
									tickLine={false}
									axisLine={false}
									width={80}
								/>
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar dataKey="value" radius={[0, 8, 8, 0]}>
									{barChartData.map((entry, index) => (
										<Cell key={`bar-cell-${index}`} fill={entry.fill} />
									))}
								</Bar>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>
			</div>

			{/* Recent Items */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{/* Recent Pages */}
				<Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
					<CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4 text-primary" />
								<CardTitle className="text-base font-bold">Son Sayfalar</CardTitle>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate("/pages")}
								className="h-7 px-2 text-xs"
							>
								Tümü
								<ArrowRight className="h-3 w-3 ml-1" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="pt-4">
						{recentPages.length > 0 ? (
							<div className="space-y-3">
								{recentPages.map((page, index) => (
									<div
										key={page.id || `page-${index}`}
										className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
										onClick={() => navigate(`/pages/detail/${page.id}`)}
									>
										<div className="flex items-center justify-between">
											<div className="flex-1 min-w-0">
												<p className="text-sm font-semibold text-foreground truncate">
													{page.name}
												</p>
												<p className="text-xs text-muted-foreground mt-0.5">
													{formatDate(page.createdAt)}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground text-center py-4">
								Henüz sayfa eklenmemiş
							</p>
						)}
					</CardContent>
				</Card>

				{/* Recent Notification Subscribers */}
				<Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
					<CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Mail className="h-4 w-4 text-primary" />
								<CardTitle className="text-base font-bold">Son Aboneler</CardTitle>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate("/notification-subscribers")}
								className="h-7 px-2 text-xs"
							>
								Tümü
								<ArrowRight className="h-3 w-3 ml-1" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="pt-4">
						{recentNotificationSubscribers.length > 0 ? (
							<div className="space-y-3">
								{recentNotificationSubscribers.map((subscriber, index) => (
									<div
										key={subscriber.id || `subscriber-${index}`}
										className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
										onClick={() => navigate(`/notification-subscribers/detail/${subscriber.id}`)}
									>
										<div className="flex items-center justify-between">
											<div className="flex-1 min-w-0">
												<p className="text-sm font-semibold text-foreground truncate">
													{subscriber.email}
												</p>
												<p className="text-xs text-muted-foreground mt-0.5">
													{formatDate((subscriber as any).createdAt)}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground text-center py-4">
								Henüz abone eklenmemiş
							</p>
						)}
					</CardContent>
				</Card>

				{/* Recent Components */}
				<Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
					<CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Box className="h-4 w-4 text-primary" />
								<CardTitle className="text-base font-bold">Son Bileşenler</CardTitle>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate("/components")}
								className="h-7 px-2 text-xs"
							>
								Tümü
								<ArrowRight className="h-3 w-3 ml-1" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="pt-4">
						{recentComponents.length > 0 ? (
							<div className="space-y-3">
								{recentComponents.map((component, index) => {
									// Component name veya localizations'dan title çek
									const turkishLoc = component.localizations?.find(
										(loc) => loc.languageCode.toLowerCase() === "tr"
									);
									const defaultLoc = component.localizations?.[0];
									const displayName = component.name || turkishLoc?.title || defaultLoc?.title || `Bileşen #${component.id}`;
									return (
										<div
											key={component.id || `component-${index}`}
											className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
											onClick={() => navigate(`/components/detail/${component.id}`)}
										>
											<div className="flex items-center justify-between">
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold text-foreground truncate">
														{displayName}
													</p>
													<p className="text-xs text-muted-foreground mt-0.5">
														{formatDate((component as any).createdAt)}
													</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<p className="text-sm text-muted-foreground text-center py-4">
								Henüz bileşen eklenmemiş
							</p>
						)}
					</CardContent>
				</Card>

				{/* Recent Contact Forms */}
				<Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
					<CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<MessageSquare className="h-4 w-4 text-primary" />
								<CardTitle className="text-base font-bold">Son Formlar</CardTitle>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate("/contact-forms")}
								className="h-7 px-2 text-xs"
							>
								Tümü
								<ArrowRight className="h-3 w-3 ml-1" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="pt-4">
						{recentContactForms.length > 0 ? (
							<div className="space-y-3">
								{recentContactForms.map((form, index) => (
									<div
										key={form.id || `form-${index}`}
										className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
										onClick={() => navigate(`/contact-forms/detail/${form.id}`)}
									>
										<div className="flex items-center justify-between">
											<div className="flex-1 min-w-0">
												<p className="text-sm font-semibold text-foreground truncate">
													{form.firstname && form.lastname 
														? `${form.firstname} ${form.lastname}` 
														: form.companyMail || form.companyName || "İsimsiz Form"}
												</p>
												<p className="text-xs text-muted-foreground mt-0.5">
													{formatDate((form as any).createdAt)}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground text-center py-4">
								Henüz form gönderilmemiş
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
