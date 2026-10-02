import React, { useState } from 'react';
import { Send, Sparkles, Dices, Smile, Check } from 'lucide-react';
import { NewEntryPayload, TagType } from '../types';
import { CUTE_NICKNAMES } from '../constants/initialData';

interface GuestbookFormProps {
  onSubmit: (payload: NewEntryPayload) => Promise<void>;
  isSubmitting: boolean;
  isGasConfigured: boolean;
}

const AVAILABLE_TAGS: { label: TagType; emoji: string; color: string }[] = [
  { label: '응원·격려', emoji: '💪', color: 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100' },
  { label: '축하', emoji: '🎉', color: 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100' },
  { label: '감사', emoji: '💖', color: 'border-rose-300 text-rose-800 bg-rose-50 hover:bg-rose-100' },
  { label: '자유', emoji: '☕', color: 'border-sky-300 text-sky-800 bg-sky-50 hover:bg-sky-100' },
];

const QUICK_EMOJIS = ['🎉', '💪', '💖', '🍀', '✨', '☕', '🚀', '🌟'];

export const GuestbookForm: React.FC<GuestbookFormProps> = ({
  onSubmit,
  isSubmitting,
  isGasConfigured,
}) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTag, setSelectedTag] = useState<TagType>('응원·격려');

  const handleRandomNickname = () => {
    const randomIndex = Math.floor(Math.random() * CUTE_NICKNAMES.length);
    setName(CUTE_NICKNAMES[randomIndex]);
  };

  const handleAddEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    await onSubmit({
      name: name.trim() || '익명 친구',
      message: message.trim(),
      tag: selectedTag,
    });

    setMessage('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">응원 한마디 남기기</h2>
            <p className="text-xs text-slate-500">
              {isGasConfigured
                ? '구글 스프레드시트에 실시간으로 기록됩니다.'
                : '현재 체험 모드(로컬 저장)입니다. 상단 설정에서 시트를 연결하세요.'}
            </p>
          </div>
        </div>

        {isGasConfigured && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            구글 시트 저장 활성
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author Name with Random Button */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="author-name" className="text-xs font-semibold text-slate-700">
              작성자 이름 / 닉네임
            </label>
            <button
              type="button"
              onClick={handleRandomNickname}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2 py-0.5 rounded transition-colors"
            >
              <Dices className="w-3 h-3 text-slate-500" />
              <span>랜덤 닉네임</span>
            </button>
          </div>
          <input
            id="author-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요 (비워두면 '익명 친구')"
            maxLength={25}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Tag Selection */}
        <div>
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            분류 태그
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTag === tag.label;
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => setSelectedTag(tag.label)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? `${tag.color} ring-2 ring-emerald-500/30 font-semibold shadow-xs`
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span>{tag.emoji}</span>
                  <span>{tag.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 text-emerald-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="message-body" className="text-xs font-semibold text-slate-700">
              응원 메시지 <span className="text-rose-500">*</span>
            </label>
            <span className={`text-[11px] ${message.length > 450 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
              {message.length} / 500자
            </span>
          </div>

          <div className="relative">
            <textarea
              id="message-body"
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="따뜻한 응원이나 축하의 한마디를 남겨주세요! (예: 프로젝트 성공을 기원합니다! 🎉)"
              maxLength={500}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400 resize-none leading-relaxed"
            />
          </div>

          {/* Quick Emoji shortcuts */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs text-slate-500">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Smile className="w-3 h-3" /> 빠른 이모지:
            </span>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleAddEmoji(emoji)}
                className="px-2 py-0.5 rounded-md hover:bg-slate-100 text-sm transition-transform active:scale-95"
                title={`${emoji} 추가`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!message.trim() || isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>구글 시트에 저장하는 중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>응원 메시지 등록하기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
