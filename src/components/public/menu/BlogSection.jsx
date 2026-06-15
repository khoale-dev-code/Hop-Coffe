import { useEffect, useState } from "react";
import { getPosts } from "../../../services/postService";
import { Coffee, Play, Newspaper, Loader2 } from "lucide-react";

export default function BlogSection({ shop }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shop?.id) return;

    getPosts(shop.id).then(data => {
      setPosts(data.filter(p => p.isActive !== false));
      setLoading(false);
    });
  }, [shop?.id]);

  // UI khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="animate-spin text-[#7CAEB8]" />
      </div>
    );
  }

  return (
    // 1. Thay đổi max-w-2xl thành max-w-7xl để bung rộng không gian hiển thị hàng ngang
    <section id="blog" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#7CAEB8] mb-2">
          Tin Tức
        </p>
        <h2 className="text-3xl font-black tracking-tight text-[#2F221C] text-center">
          Bản tin của quán
        </h2>
      </div>

      {/* UI khi chưa có bài viết nào */}
      {posts.length === 0 ? (
        <div className="max-w-2xl mx-auto bg-white rounded-[16px] border border-[#EEE3D8] p-10 flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-[#F8F2EA] rounded-full flex items-center justify-center mb-4">
            <Newspaper size={32} className="text-[#6B4B3E]" />
          </div>
          <h3 className="text-lg font-black text-[#2F221C]">Chưa có bản tin nào</h3>
          <p className="text-sm text-[#73584D] mt-2">
            Quán sẽ sớm cập nhật những thông tin mới nhất đến bạn!
          </p>
        </div>
      ) : (
        /* 2. UI danh sách bài viết ngang bằng CSS Grid (1 cột trên mobile, 2 tablet, 3 PC) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {posts.map(post => (
            // Thêm flex flex-col để đẩy ảnh xuống dưới đáy nếu nội dung chữ dài ngắn khác nhau
            <div key={post.id} className="bg-white rounded-[12px] shadow-sm border border-[#EEE3D8] overflow-hidden hover:shadow-md transition flex flex-col">
              
              {/* Header Facebook style */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full border border-neutral-200 overflow-hidden shrink-0 grid place-items-center bg-[#F8F2EA]">
                  {shop?.logoUrl ? (
                    <img src={shop.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Coffee size={20} className="text-[#6B4B3E]" />
                  )}
                </div>
                <div>
                  <p className="font-black text-[15px] text-[#2F221C]">{shop?.name || "Tin tức mới"}</p>
                  <p className="text-xs font-medium text-[#73584D]">
                    {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Nội dung Text: Thêm flex-1 để nó chiếm khoảng trống còn lại, giúp đẩy khung Media xuống dưới cùng nếu card cao */}
              {post.content && (
                <div className="px-4 pb-4 text-[15px] text-[#2F221C] whitespace-pre-wrap leading-relaxed break-words flex-1">
                  {post.content}
                </div>
              )}

              {/* Media Grid Facebook Style */}
              {post.media && post.media.length > 0 && (
                <div className={`mt-auto grid gap-[2px] bg-neutral-100 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {post.media.map((m, index) => {
                    // Chỉ render tối đa 4 item
                    if (index > 3) return null;
                    const isLastVisible = index === 3 && post.media.length > 4;

                    // Tùy biến class hiển thị dựa trên tổng số lượng media
                    let itemClass = "relative bg-neutral-200 overflow-hidden ";
                    
                    if (post.media.length === 1) {
                      itemClass += "aspect-auto max-h-[400px]"; // Cập nhật max-h cho cột ngang nhìn cân đối hơn
                    } else if (post.media.length === 3 && index === 0) {
                      itemClass += "col-span-2 aspect-[16/9]"; // 3 ảnh: Ảnh 1 bự, nằm trên cùng
                    } else {
                      itemClass += "aspect-square"; // Các trường hợp còn lại chia lưới vuông
                    }

                    return (
                      <div key={index} className={itemClass}>
                        {m.type === "video" ? (
                          <>
                            <video 
                              src={m.url} 
                              className="w-full h-full object-cover" 
                              controls={post.media.length === 1} 
                              preload="metadata" 
                            />
                            {post.media.length > 1 && (
                              <div className="absolute inset-0 grid place-items-center bg-black/10 pointer-events-none">
                                <Play size={40} className="text-white drop-shadow-lg" fill="white" />
                              </div>
                            )}
                          </>
                        ) : (
                          <img 
                            src={m.url} 
                            alt="Post media" 
                            className="w-full h-full object-cover hover:scale-105 transition duration-500" 
                          />
                        )}

                        {/* Overlay hiển thị +N ảnh */}
                        {isLastVisible && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/70 transition">
                            <span className="text-white text-3xl font-black">+{post.media.length - 4}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}