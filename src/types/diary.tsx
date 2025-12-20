
export interface Diary {
    id?: string;

    trip_id?: string | null;
    user_id: string | null;

    title: string | null;
    description: string | null;

    is_public: boolean | null;

    video_url: string | null;
    img_url: string | null;

    tags: string | null;
    template: string | null;

    feeling_des: string | null;
    weather_des: string | null;
}