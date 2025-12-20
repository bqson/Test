

export default function ClassicTemplate({ diary }: { diary: any }) {

    if (!diary) return null;

    const [firstImg, ...resImg] = diary?.img_url || [];

    return (
        <>
            <main className="max-w-3xl mx-auto px-6 py-14">
                {/* Header */}
                <header className="mb-10 text-center">
                    <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">
                        Travel Journal
                    </p>
                    <h1 className="text-3xl md:text-4xl font-serif font-semibold leading-snug mb-4">
                        {diary.title}
                    </h1>
                    {/* <div className="flex justify-center items-center gap-3 text-sm text-gray-600">
                        <img src="https://i.pravatar.cc/40" className="w-8 h-8 rounded-full grayscale" />
                        <span>Phan Anh · 3 ngày trước · 124 lượt thích</span>
                    </div> */}
                </header>
                {/* Cover Image */}
                <figure className="mb-12">
                    {firstImg && <img src={firstImg} className="w-full h-72 object-cover rounded-md sepia-[0.2]" alt="Đà Lạt" />}
                </figure>
                {/* Article */}
                <article className="space-y-10 text-[15px] leading-relaxed">
                    <section>
                        <h2 className="font-serif text-xl mb-3 border-b border-gray-300 pb-1">
                            Description
                        </h2>
                        <p>
                            {diary.description}
                        </p>
                    </section>
                    <section>
                        <h2 className="font-serif text-xl mb-3 border-b border-gray-300 pb-1">
                            Wheater
                        </h2>
                        <p>
                            {diary.weather_des}
                        </p>
                    </section>
                    <section>
                        <h2 className="font-serif text-xl mb-3 border-b border-gray-300 pb-1">
                            Feeling
                        </h2>
                        <p>
                            {diary.feeling_des}
                        </p>
                    </section>
                </article>
                {/* Divider */}
                <div className="my-14 border-t border-dashed border-gray-400" />
                {/* Gallery */}
                <section>
                    <h2 className="font-serif text-2xl mb-6 text-center">
                        Images
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {resImg && resImg.map(function (img: any, index: number) {
                            return (
                                <img key={index} className="rounded-md grayscale hover:grayscale-0 transition" src={img} />
                            )
                        })}
                    </div>
                </section>
            </main>


        </>
    )
}