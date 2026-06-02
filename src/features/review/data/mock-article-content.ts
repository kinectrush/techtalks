/** Sample HTML bodies for mock fallback when DB has no content. */
export const MOCK_ARTICLE_HTML: Record<string, string> = {
  'iphone-16-pro-max-review': `
<p>Sau hai tuần dùng iPhone 16 Pro Max như máy chính, đây là đánh giá ngắn gọn về pin, camera và trải nghiệm hàng ngày.</p>
<h2>Thiết kế &amp; màn hình</h2>
<p>Titan mới nhẹ hơn một chút so với thế hệ trước. Màn hình 120Hz vẫn là chuẩn cao cấp, độ sáng ngoài trời ổn định.</p>
<h2>Camera</h2>
<p>Tele 5x cải thiện rõ trong điều kiện thiếu sáng. Video ProRes vẫn dành cho người cần hậu kỳ nghiêm túc.</p>
<blockquote>Điểm mạnh nhất: hệ sinh thái và thời lượng pin thực tế.</blockquote>
<ul>
<li>Pin trâu hơn 15 Pro Max</li>
<li>Nút Camera Control tiện khi quen</li>
<li>Giá nâng cấp vẫn cao</li>
</ul>
`.trim(),
  'macbook-air-m4-review': `
<p>MacBook Air M4 tiếp tục công thức “mỏng, im lặng, đủ mạnh” cho đa số người dùng văn phòng.</p>
<h2>Hiệu năng</h2>
<p>Render 4K trên Final Cut nhanh hơn M3 khoảng 12–18% trong bài test nội bộ.</p>
`.trim(),
};

export function getMockArticleContent(slug: string): string | undefined {
  return MOCK_ARTICLE_HTML[slug];
}
