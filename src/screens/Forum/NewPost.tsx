"use client";

import {
    ArrowLeft,
    Check,
    ChevronDown,
    Image as ImageIcon,
    Link as LinkIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function NewPost() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        category: "Destination",
        content: "",
        tags: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        console.log("Form data:", formData);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-muted pt-8 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Forum
                    </button>
                    <h1 className="text-2xl font-bold text-foreground">
                        Start a New Discussion
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Share experiences, ask questions, and connect with
                        fellow adventurers
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Input Card */}
                    <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="title"
                                className="block text-sm font-semibold text-foreground"
                            >
                                Discussion Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                placeholder="e.g., The hidden gems of Da Lat..."
                                className="w-full px-4 py-3 bg-secondary border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:bg-card transition-all placeholder:text-muted-foreground text-foreground"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="category"
                                className="block text-sm font-semibold text-foreground"
                            >
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    id="category"
                                    className="w-full px-4 py-3 bg-secondary border border-input rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:bg-card transition-all text-foreground"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            category: e.target.value,
                                        })
                                    }
                                >
                                    <option value="Destination">
                                        Destination
                                    </option>
                                    <option value="Tips">Travel Tips</option>
                                    <option value="Itinerary">Itinerary</option>
                                    <option value="Review">Review</option>
                                    <option value="Question">Question</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="content"
                                className="block text-sm font-semibold text-foreground"
                            >
                                Content
                            </label>
                            <textarea
                                id="content"
                                rows={8}
                                placeholder="Share your thoughts, ask questions, or provide detailed information..."
                                className="w-full px-4 py-3 bg-secondary border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:bg-card transition-all placeholder:text-muted-foreground text-foreground resize-none"
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        content: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="tags"
                                className="block text-sm font-semibold text-foreground"
                            >
                                Tags
                            </label>
                            <input
                                type="text"
                                id="tags"
                                placeholder="# Add tags separated by commas"
                                className="w-full px-4 py-3 bg-secondary border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:bg-card transition-all placeholder:text-muted-foreground text-foreground"
                                value={formData.tags}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        tags: e.target.value,
                                    })
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Add up to 5 tags to help others find your
                                discussion
                            </p>
                        </div>
                    </div>

                    {/* Media Section */}
                    <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-foreground">
                            Add Media (Optional)
                        </h3>
                        <button
                            type="button"
                            className="w-full flex items-center px-4 py-3 border border-border rounded-lg hover:bg-secondary transition-colors text-left group"
                        >
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3 group-hover:bg-card group-hover:shadow-sm transition-all">
                                <ImageIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                            </div>
                            <span className="text-foreground font-medium">
                                Upload images
                            </span>
                        </button>
                        <button
                            type="button"
                            className="w-full flex items-center px-4 py-3 border border-border rounded-lg hover:bg-secondary transition-colors text-left group"
                        >
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3 group-hover:bg-card group-hover:shadow-sm transition-all">
                                <LinkIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                            </div>
                            <span className="text-foreground font-medium">
                                Add link
                            </span>
                        </button>
                    </div>
                    <div className="bg-guidelines-bg dark:bg-guidelines-bg/20 border border-guidelines-border rounded-xl p-6 transition-colors">
                        <h3 className="text-guidelines-text font-semibold mb-4">
                            Community Guidelines
                        </h3>
                        <ul className="space-y-3">
                            {[
                                "Be respectful and constructive in your discussions",
                                "Search before posting to avoid duplicates",
                                "Use clear titles and appropriate categories",
                                "No spam, self-promotion, or offensive content",
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start text-sm text-guidelines-text/80"
                                >
                                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-guidelines-text" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-full sm:w-auto px-6 py-2.5 bg-card border border-input text-foreground font-medium rounded-lg hover:bg-secondary transition-colors"
                        >
                            Cancel
                        </button>
                        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
                            <button
                                type="button"
                                className="w-full sm:w-auto px-6 py-2.5 bg-card border border-input text-foreground font-medium rounded-lg hover:bg-secondary transition-colors"
                            >
                                Save as Draft
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-6 py-2.5 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? "Posting..." : "Post Discussion"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
