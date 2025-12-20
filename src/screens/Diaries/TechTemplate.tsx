export default function TechTemplate({ diary }: { diary: any }) {
    if (!diary) return null;

    const [firstImg, ...resImg] = diary?.img_url || [];

    return (
        <>
            <main className="max-w-6xl mx-auto px-6 py-10">
                {/* Header */}
                <header className="mb-10">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            {diary.title}
                        </h1>
                        <span className="px-3 py-1 text-xs font-medium rounded-full border border-blue-500 text-blue-600">
                            TECH JOURNAL
                        </span>
                    </div>
                    {/* <div className="flex items-center gap-3 text-sm text-gray-500 mt-4">
                        <img src="https://i.pravatar.cc/40" className="w-8 h-8 rounded-full" />
                        <span>Phan Anh</span>
                        <span>•</span>
                        <span>3 ngày trước</span>
                        <span>•</span>
                        <span className="text-blue-600 font-medium">124 likes</span>
                    </div> */}
                </header>
                {/* Hero */}
                <section className="mb-12">
                    <div className="relative rounded-xl overflow-hidden border">
                        <img src={firstImg && firstImg} className="w-full h-[420px] object-cover" />
                        <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1 text-xs bg-white/90 backdrop-blur border rounded-full text-gray-700">
                                TRAVEL LOG
                            </span>
                        </div>
                    </div>
                </section>
                {/* Meta cards */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="border rounded-lg p-4">
                        <p className="text-xs text-gray-500">Địa điểm</p>
                        <p className="font-semibold text-gray-800">Đà Lạt</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-xs text-gray-500">Thời gian</p>
                        <p className="font-semibold text-gray-800">Tháng 11</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-xs text-gray-500">Thời tiết</p>
                        <p className="font-semibold text-gray-800">18°C</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-xs text-gray-500">Trạng thái</p>
                        <p className="font-semibold text-blue-600">Relaxed</p>
                    </div>
                </section>
                {/* Content */}
                <section className="grid md:grid-cols-2 gap-8 mb-14">
                    <div className="space-y-6">
                        <article className="border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-2 text-blue-600">
                                Weather
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                {diary.weather_des}
                            </p>
                        </article>
                        <article className="border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-2 text-blue-600">
                                Feeling
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                {diary.feeling_des}
                            </p>
                        </article>
                    </div>
                    <article className="border rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-2 text-blue-600">
                            Description
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {diary.description}
                        </p>
                    </article>
                </section>
                {/* Gallery */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                        Media Assets
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {resImg && resImg.map(function (img: any, index: any) {
                            return (
                                <img key={index} className="h-44 w-full object-cover rounded-lg border" src={img} />
                            )
                        })}
                    </div>
                </section>
            </main>
        </>
    )
}