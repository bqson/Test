
export default function ModernTemplate({ diary }: { diary: any }) {
    if (!diary) return null;

    const [firstImg, ...resImg] = diary?.img_url || [];

    return (
        <>
            <main className="max-w-5xl mx-auto px-4 py-6">
                {/* Title */}
                <h1 className="text-2xl font-bold mb-2">{diary.title}</h1>
                {/* <div className="flex items-center text-sm text-gray-500 mb-4">
                    <img src="https://i.pravatar.cc/40" className="w-6 h-6 rounded-full mr-2" />
                    <span>Phan Anh · 3 ngày trước · ❤️ 124</span>
                </div> */}
                {/* Cover Image */}
                <div className="rounded-xl overflow-hidden mb-6">
                    <img src={firstImg && firstImg} className="w-full h-80 object-cover" />
                </div>
                {/* Sections */}
                <section className="bg-white rounded-xl p-5 mb-4 shadow-sm">
                    <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">Description</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {diary.description}
                    </p>
                </section>
                <section className="bg-white rounded-xl p-5 mb-4 shadow-sm">
                    <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">Weather</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {diary.weather_des}
                    </p>
                </section>
                <section className="bg-white rounded-xl p-5 mb-6 shadow-sm">
                    <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">Feeling</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {diary.feeling_des}
                    </p>
                </section>
                {/* Gallery */}
                <section>
                    <h2 className="font-semibold text-lg mb-3">Image</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {resImg && resImg.map(function (img: any, index: any) {
                            return (
                                <img key={index} className="rounded-lg object-cover h-40 w-full" src={img} />
                            )
                        })}
                    </div>
                </section>
            </main>


        </>
    )
}