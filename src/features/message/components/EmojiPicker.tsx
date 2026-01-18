"use client";

import EmojiPicker, { Theme, EmojiStyle, EmojiClickData } from "emoji-picker-react";
import { useTheme } from "next-themes";

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
}

export default function CustomEmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
    const { theme } = useTheme();

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onEmojiSelect(emojiData.emoji);
    };

    return (
        <div className="shadow-2xl rounded-2xl overflow-hidden border border-white/40">
            <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                emojiStyle={EmojiStyle.NATIVE}
                autoFocusSearch={false}
                width="100%"
                height={400}
                previewConfig={{
                    showPreview: false
                }}
                skinTonesDisabled
                searchPlaceHolder="Search emojis..."
            />
        </div>
    );
}
