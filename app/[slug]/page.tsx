import { getPageBySlug } from "@/lib/queries";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPageBySlug(slug);
    if (!page) return {};
    return {
        title: `${page.title} | XELLÉ`,
    };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = await getPageBySlug(slug);

    if (!page) {
        // If the page is not published, getPageBySlug returns null (due to query filter).
        // This is why users see 404 for drafts.
        // To allow preview, we need a separate "preview" logic or route.
        notFound();
    }

    return (
        <main className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-4xl font-serif text-brand-dark mb-8 text-center">{page.title}</h1>
            <div
                className="prose prose-lg mx-auto"
                dangerouslySetInnerHTML={{ __html: page.content?.content ? "" : "<!-- Content Format Check Required -->" }}
            >
                {/* Note: TipTap JSON needs renderer. For simplicity, assuming HTML output or basic text for now.
                    Ideally, we should use a renderer like `tiptap-renderer` or store HTML.
                    The editor in `new/page.tsx` saves JSON. We need to convert or just store HTML.
                    Refactoring `new/page.tsx` to store HTML for simpler display here.
                 */}
                {/*
                    Temporary fix: We will update `new/page.tsx` to use `editor.getHTML()` instead of `getJSON()`.
                    Then we can use `dangerouslySetInnerHTML`.
                  */}
            </div>
            {/* Actual content render with HTML storage assumption */}
            <div className="prose prose-lg mx-auto" dangerouslySetInnerHTML={{ __html: page.content as string }} />
        </main>
    );
}
