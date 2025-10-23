import { useState } from "react";

interface DataSourceSwitchProps {
	currentMode: "local" | "remote" | "hybrid";
	onModeChange: (mode: "local" | "remote" | "hybrid") => void;
}

export const DataSourceSwitch: React.FC<DataSourceSwitchProps> = ({
	currentMode,
	onModeChange,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const modes = [
		{ value: "local", label: "本地存储", description: "使用 localStorage 存储数据" },
		{ value: "remote", label: "远程数据库", description: "使用 PostgreSQL 数据库" },
		{ value: "hybrid", label: "混合模式", description: "本地缓存 + 远程同步" },
	] as const;

	const currentModeInfo = modes.find((mode) => mode.value === currentMode);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
			>
				<span className="text-sm font-medium">{currentModeInfo?.label}</span>
				<svg
					className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
					<div className="p-2">
						{modes.map((mode) => (
							<button
								key={mode.value}
								type="button"
								onClick={() => {
									onModeChange(mode.value);
									setIsOpen(false);
								}}
								className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
									currentMode === mode.value ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
								}`}
							>
								<div className="font-medium text-sm">{mode.label}</div>
								<div className="text-xs text-gray-500 mt-1">{mode.description}</div>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
