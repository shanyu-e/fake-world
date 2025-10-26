import { DataSourceSwitch } from "@/components/DataSourceSwitch";
import { useDataSourceConfig } from "@/hooks/useDataSourceConfig";
import {
	allProfilesAtom,
	allProfilesErrorAtom,
	allProfilesLoadingAtom,
	createProfile,
	loadAllProfiles,
} from "@/stateV2/profileV2";
import {
	loadWallet,
	updateWallet,
	walletAtom,
	walletErrorAtom,
	walletLoadingAtom,
} from "@/stateV2/walletV2";
import { useAtom } from "jotai";

export const DataSourceTest: React.FC = () => {
	const { config, setMode } = useDataSourceConfig();
	const [wallet] = useAtom(walletAtom);
	const [loading] = useAtom(walletLoadingAtom);
	const [error] = useAtom(walletErrorAtom);

	// 用户档案状态
	const [profiles] = useAtom(allProfilesAtom);
	const [profilesLoading] = useAtom(allProfilesLoadingAtom);
	const [profilesError] = useAtom(allProfilesErrorAtom);

	const handleModeChange = (mode: "local" | "remote" | "hybrid") => {
		setMode(mode);
		// 重新加载数据
		loadWallet();
		loadAllProfiles();
	};

	const handleUpdateWallet = () => {
		updateWallet({
			balance: (Math.random() * 1000).toFixed(2),
			miniFund: (Math.random() * 2000).toFixed(2),
			miniFundYield: (Math.random() * 5).toFixed(2),
		});
	};

	const handleCreateProfile = () => {
		createProfile({
			nickname: `测试用户${Date.now()}`,
			wechat: `test_${Date.now()}`,
			avatarInfo: "avatar_url_here",
			remark: "测试备注",
			momentsBackgroundLike: false,
			momentsPrivacy: "all",
			privacy: "all",
			thumbnailInfo: [],
		});
	};

	return (
		<div className="mx-auto max-w-4xl p-6">
			<h1 className="mb-6 font-bold text-2xl">数据源测试页面</h1>

			{/* 数据源切换 */}
			<div className="mb-6">
				<h2 className="text-lg font-semibold mb-3">数据源配置</h2>
				<div className="flex items-center space-x-4">
					<DataSourceSwitch currentMode={config.mode} onModeChange={handleModeChange} />
					<span className="text-sm text-gray-500">当前模式: {config.mode}</span>
				</div>
			</div>

			{/* 钱包数据展示 */}
			<div className="mb-6">
				<h2 className="text-lg font-semibold mb-3">钱包数据</h2>
				<div className="bg-gray-50 p-4 rounded-lg">
					{loading && <div className="text-blue-600">加载中...</div>}
					{error && <div className="text-red-600">错误: {error}</div>}
					{!loading && !error && wallet && (
						<div className="space-y-2">
							<div>余额: {wallet.balance}</div>
							<div>零钱通: {wallet.miniFund}</div>
							<div>收益率: {wallet.miniFundYield}%</div>
						</div>
					)}
				</div>
				<button
					type="button"
					onClick={handleUpdateWallet}
					className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					disabled={loading}
				>
					更新钱包数据
				</button>
			</div>

			{/* 用户档案数据展示 */}
			<div className="mb-6">
				<h2 className="text-lg font-semibold mb-3">用户档案数据</h2>
				<div className="bg-gray-50 p-4 rounded-lg">
					{profilesLoading && <div className="text-blue-600">加载中...</div>}
					{profilesError && <div className="text-red-600">错误: {profilesError}</div>}
					{!profilesLoading && !profilesError && profiles && Array.isArray(profiles) && (
						<div className="space-y-2">
							<div>用户总数: {profiles.length}</div>
							<div className="max-h-40 overflow-y-auto">
								{profiles.slice(0, 5).map((profile) => (
									<div key={profile.id} className="text-sm">
										{profile.nickname} ({profile.wechat})
									</div>
								))}
								{profiles.length > 5 && (
									<div className="text-gray-500">...还有 {profiles.length - 5} 个用户</div>
								)}
							</div>
						</div>
					)}
				</div>
				<button
					type="button"
					onClick={handleCreateProfile}
					className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
					disabled={profilesLoading}
				>
					创建测试用户
				</button>
			</div>

			{/* 配置信息 */}
			<div className="mb-6">
				<h2 className="text-lg font-semibold mb-3">当前配置</h2>
				<div className="bg-gray-50 p-4 rounded-lg">
					<pre className="text-sm">{JSON.stringify(config, null, 2)}</pre>
				</div>
			</div>

			{/* 使用说明 */}
			<div className="mb-6">
				<h2 className="text-lg font-semibold mb-3">使用说明</h2>
				<div className="space-y-2 text-sm text-gray-600">
					<div>
						<strong>本地存储模式:</strong> 数据存储在浏览器 localStorage 中
					</div>
					<div>
						<strong>远程数据库模式:</strong> 数据存储在 PostgreSQL 数据库中
					</div>
					<div>
						<strong>混合模式:</strong> 本地缓存 + 远程同步，支持离线使用
					</div>
				</div>
			</div>
		</div>
	);
};
