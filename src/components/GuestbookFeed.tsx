import React, { useState, useMemo } from 'react';
import { Search, Heart, Copy, Check, ArrowDownUp, MessageSquareDashed, Clock, Tag } from 'lucide-react';
import { GuestbookEntry, TagType } from '../types';

interface GuestbookFeedProps {
  entries: GuestbookEntry[];
  isLoading: boolean;
  onLike: (id: string) => void;
  likedIds: Set<string>;
  isGasConfigured?: boolean;
}

// Format relative date in Korean
function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '최근';

    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return '방금 전';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}일 전`;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  } catch {
    return '최근';
  }
}

// Generate pastel avatar background color based on name
function getAvatarColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    { bg: 'bg-teal-100', text: 'text-teal-800' },
    { bg: 'bg-sky-100', text: 'text-sky-800' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    { bg: 'bg-purple-100', text: 'text-purple-800' },
    { bg: 'bg-rose-100', text: 'text-rose-800' },
    { bg: 'bg-amber-100', text: 'text-amber-800' },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export const GuestbookFeed: React.FC<GuestbookFeedProps> = ({
  entries,
  isLoading,
  onLike,
  likedIds,
  isGasConfigured,
}) => {
  const [selectedTag, setSelectedTag] = useState<TagType>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    let list = [...entries];

    // Filter by tag
    if (selectedTag !== '전체') {
      list = list.filter((item) => item.tag === selectedTag);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return list;
  }, [entries, selectedTag, searchQuery, sortOrder]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { 전체: entries.length };
    entries.forEach((e) => {
      counts[e.tag] = (counts[e.tag] || 0) + 1;
    });
    return counts;
  }, [entries]);

  return (
    <div className="space-y-4">
      {/* Search, Filter & Sort Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="작성자 또는 응원글 검색..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
              >
                지우기
              </button>
            )}
          </div>

          {/* Sort toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowDownUp className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'newest' ? '최신순 정렬' : '과거순 정렬'}</span>
            </button>
          </div>
        </div>

        {/* Tag Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 text-xs no-scrollbar">
          {(['전체', '응원·격려', '축하', '감사', '자유'] as TagType[]).map((tag) => {
            const count = tagCounts[tag] || 0;
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <span>{tag}</span>
                <span className={`ml-1.5 text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded w-24" />
                  <div className="h-2.5 bg-slate-100 rounded w-36" />
                </div>
              </div>
              <div className="h-14 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredEntries.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <MessageSquareDashed className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery
              ? '검색 결과가 없습니다'
              : isGasConfigured
              ? '구글 스프레드시트에 성공적으로 연동되었습니다! 🎉'
              : '아직 등록된 응원글이 없습니다'}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? '다른 검색어를 입력하시거나 태그 필터를 변경해보세요.'
              : isGasConfigured
              ? '스프레드시트가 준비되었습니다. 왼쪽 양식에서 첫 번째 응원 한마디를 남겨보세요!'
              : '첫 번째 응원 메시지를 남겨서 방명록을 따뜻하게 밝혀주세요!'}
          </p>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && filteredEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => {
            const avatarStyle = getAvatarColor(entry.name);
            const initial = entry.name.trim().charAt(0) || '익';
            const isLiked = likedIds.has(entry.id);
            const likeCount = (entry.likes || 0) + (isLiked ? 1 : 0);

            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col justify-between group"
              >
                {/* Card Top: Author & Unboxed Metadata */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full ${avatarStyle.bg} ${avatarStyle.text} font-bold flex items-center justify-center text-sm shrink-0 border border-white shadow-2xs`}
                      >
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {entry.name}
                        </h4>
                        
                        {/* Unboxed metadata with typographic separator */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <span className="text-emerald-700 font-medium">{entry.tag}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatRelativeTime(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyMessage(entry.id, `${entry.name}: "${entry.message}"`)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 opacity-60 group-hover:opacity-100 transition-all"
                      title="메시지 복사"
                    >
                      {copiedId === entry.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Message body */}
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 text-slate-800 text-sm leading-relaxed whitespace-pre-line break-words">
                    {entry.message}
                  </div>
                </div>

                {/* Card Bottom: Interaction Controls */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span className="text-[11px] text-slate-400">
                    ID: {entry.id.length > 10 ? entry.id.substring(0, 10) + '...' : entry.id}
                  </span>

                  <button
                    onClick={() => onLike(entry.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      isLiked
                        ? 'text-rose-600 bg-rose-50 font-semibold'
                        : 'text-slate-500 hover:text-rose-500 hover:bg-rose-50/60'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                        isLiked ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                    <span>{likeCount}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
