/** Chuyển HTML (rich text editor) sang plain text một dòng — bỏ thẻ, không chèn xuống dòng từ `<p>` / `<br>`. */
export function htmlToPlainText(html: string | null | undefined): string {
    if (!html) return '';

    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/\s+/g, ' ')
        .trim();
}
