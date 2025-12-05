import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/dark-mode-toggle";
import { useLoginState } from "@/hooks/use-login-state";
import { LayoutDashboard, LogOut, Sparkles, Sun, Moon, Users, Languages, UserCircle, Building2, Handshake } from "lucide-react";

interface NavItem {
	to: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	end?: boolean;
}

const navigationItems: NavItem[] = [
	{
		to: "/",
		label: "Kontrol Paneli",
		icon: LayoutDashboard,
		end: true,
	},
	{
		to: "/users",
		label: "Kullanıcılar",
		icon: Users,
		end: false,
	},
	{
		to: "/languages",
		label: "Diller",
		icon: Languages,
		end: false,
	},
	{
		to: "/team-members",
		label: "Takım Üyeleri",
		icon: UserCircle,
		end: false,
	},
	{
		to: "/eco-partners",
		label: "Eco Partnerler",
		icon: Building2,
		end: false,
	},
	{
		to: "/partners",
		label: "Partnerler",
		icon: Handshake,
		end: false,
	},
];

export default function Sidebar() {
	const { logout, isActionable, isLoading } = useLoginState();
	const navigate = useNavigate();
	const location = useLocation();

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch {
			// noop
		}
	};

	return (
		<aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-green-200/50 dark:border-green-800/50 bg-gradient-to-b from-white via-green-50/30 to-emerald-50/20 dark:from-gray-900 dark:via-green-950/30 dark:to-emerald-950/20 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-900/90 shadow-xl shadow-green-500/5">
			{/* Header */}
			<div className="flex h-20 items-center justify-between px-6 border-b border-green-200/50 dark:border-green-800/50 bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-green-900/10 dark:to-emerald-900/10">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
						<Sparkles className="h-5 w-5 text-white" />
					</div>
					<div className="flex flex-col">
						<span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-600 bg-clip-text text-transparent">
							Colt Panel
						</span>
						<span className="text-xs text-gray-500 dark:text-gray-400">Kontrol Paneli</span>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex flex-col gap-2 p-4 mt-2">
				{navigationItems.map((item) => {
					const Icon = item.icon;
					const isActive = item.end 
						? location.pathname === item.to 
						: location.pathname.startsWith(item.to);
					
					return (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.end}
							className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
								isActive
									? "bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white shadow-lg shadow-green-500/30 dark:shadow-green-900/50"
									: "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-950/30 hover:text-green-700 dark:hover:text-green-500"
							}`}
						>
							{/* Active indicator */}
							{isActive && (
								<div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
							)}
							<Icon className={`h-5 w-5 transition-transform duration-200 ${
								isActive 
									? "text-white" 
									: "text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-500"
							}`} />
							<span className="relative z-10">{item.label}</span>
							{/* Hover effect */}
							<div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-emerald-500/0 group-hover:from-green-500/5 group-hover:to-emerald-500/5 transition-all duration-200 rounded-xl" />
						</NavLink>
					);
				})}
			</nav>

			{/* Footer with dark mode toggle and logout */}
			<div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-200/50 dark:border-green-800/50 bg-gradient-to-t from-green-50/50 to-transparent dark:from-green-950/30 dark:to-transparent space-y-4">
				{/* Dark Mode Toggle */}
				<div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-700 dark:to-emerald-800 flex items-center justify-center">
							<Sun className="h-4 w-4 text-white dark:hidden" />
							<Moon className="h-4 w-4 text-white hidden dark:block" />
						</div>
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</span>
					</div>
					<DarkModeToggle size="sm" />
				</div>
				
				{/* Logout Button */}
				<Button
					variant="outline"
					onClick={handleLogout}
					disabled={!isActionable || isLoading}
					className="w-full justify-start gap-3 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200"
					aria-busy={isLoading}
				>
					<LogOut className="h-4 w-4" />
					{isLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
				</Button>
			</div>
		</aside>
	);
}