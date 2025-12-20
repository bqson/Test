
export default function TestTemplate() {
    return (
        <>
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <header className="flex flex-col gap-4 mb-10">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Chuyến đi Đà Lạt – Mùa Hoa Dã Quỳ
                        </h1>
                        <span className="flex items-center gap-2 text-xs font-medium text-blue-600">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            LIVE LOG
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <img src="https://i.pravatar.cc/40" className="w-8 h-8 rounded-full" />
                        <span>Phan Anh</span>
                        <span>•</span>
                        <span>Updated 3 days ago</span>
                        <span>•</span>
                        <span className="font-medium text-gray-800">124 interactions</span>
                    </div>
                </header>
                {/* Primary Metrics */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="relative border rounded-xl p-4 group hover:border-blue-500 transition">
                        <span className="absolute left-0 top-4 w-1 h-10 bg-blue-600 rounded-r" />
                        <p className="text-xs text-gray-500">LOCATION</p>
                        <p className="text-lg font-semibold text-gray-900">Đà Lạt</p>
                    </div>
                    <div className="border rounded-xl p-4 hover:border-blue-500 transition">
                        <p className="text-xs text-gray-500">PERIOD</p>
                        <p className="text-lg font-semibold text-gray-900">November</p>
                    </div>
                    <div className="border rounded-xl p-4 hover:border-blue-500 transition">
                        <p className="text-xs text-gray-500">AVG TEMP</p>
                        <p className="text-lg font-semibold text-gray-900">18°C</p>
                    </div>
                    <div className="border rounded-xl p-4 hover:border-blue-500 transition">
                        <p className="text-xs text-gray-500">STATE</p>
                        <p className="text-lg font-semibold text-blue-600">STABLE</p>
                    </div>
                </section>
                {/* Main Grid */}
                <section className="grid lg:grid-cols-3 gap-8">
                    {/* Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Hero */}
                        <div className="border rounded-xl overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470" className="w-full h-[360px] object-cover" />
                            <div className="absolute top-4 right-4 text-xs text-gray-700 bg-white/90 backdrop-blur px-3 py-1 rounded-full border">
                                COVER ASSET
                            </div>
                        </div>
                        {/* Article block */}
                        <article className="border rounded-xl p-6 relative group">
                            <div className="absolute left-0 top-6 w-1 h-12 bg-blue-600 rounded-r" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Địa điểm
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Đà Lạt vận hành như một hệ thống ổn định – mát mẻ,
                                cân bằng và rất ít nhiễu trong suốt chu kỳ hoạt động.
                            </p>
                        </article>
                        <article className="border rounded-xl p-6 relative">
                            <div className="absolute left-0 top-6 w-1 h-12 bg-blue-600 rounded-r" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Ẩm thực
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Các món ăn đóng vai trò như module hỗ trợ,
                                đảm bảo năng lượng luôn ở mức tối ưu.
                            </p>
                        </article>
                        <article className="border rounded-xl p-6 relative">
                            <div className="absolute left-0 top-6 w-1 h-12 bg-blue-600 rounded-r" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Cảm xúc
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Không cảnh báo, không ngắt quãng –
                                trạng thái tinh thần được reset về baseline.
                            </p>
                        </article>
                        {/* Media */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                Media Stream
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <img className="h-40 w-full object-cover rounded-lg border hover:scale-[1.02] transition" src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6" />
                                <img className="h-40 w-full object-cover rounded-lg border hover:scale-[1.02] transition" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" />
                                <img className="h-40 w-full object-cover rounded-lg border hover:scale-[1.02] transition" src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e" />
                            </div>
                        </div>
                    </div>
                    {/* Dashboard Panel */}
                    <aside className="space-y-6">
                        <div className="border rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                                Trip Summary
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>Duration: 3 days</li>
                                <li>Transport: Motorbike</li>
                                <li>Weather: Cool &amp; dry</li>
                            </ul>
                        </div>
                        <div className="border rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                                Activity Log
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-3">
                                <li className="flex justify-between">
                                    <span>Check-in</span>
                                    <span className="text-gray-400">08:30</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Breakfast</span>
                                    <span className="text-gray-400">09:15</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Photo session</span>
                                    <span className="text-gray-400">16:40</span>
                                </li>
                            </ul>
                        </div>
                        <div className="border rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                                System Health
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                <span className="text-gray-700 font-medium">All systems normal</span>
                            </div>
                        </div>
                    </aside>
                </section>
            </main>




        </>
    );
}